use std::pin::Pin;

use hyper::Response;
use regex::Regex;
use std::future::Future;
use tracing::info;

use crate::{
    error::KeekijanaiError,
    method::Method,
    middleware::{ErrorMiddleware, PostMiddleware, PreMiddleware},
    request::Request,
    route::Route,
    util,
};

pub struct Router<R, E> {
    routes: Vec<Route<R, E>>,
    pre_middlewares: Vec<Box<dyn PreMiddleware + Send + Sync>>,
    post_middlewares: Vec<Box<dyn PostMiddleware<R> + Send + Sync>>,
    error_middlewares: Vec<Box<dyn ErrorMiddleware + Send + Sync>>,
}

#[derive(Default)]
pub struct RouterBuilder<R, E> {
    routes: Vec<Route<R, E>>,
    pre_middlewares: Vec<Box<dyn PreMiddleware + Send + Sync>>,
    post_middlewares: Vec<Box<dyn PostMiddleware<R> + Send + Sync>>,
    error_middlewares: Vec<Box<dyn ErrorMiddleware + Send + Sync>>,
}

impl<R, E> RouterBuilder<R, E>
where
    E: Into<anyhow::Error> + Send + 'static,
{
    pub fn pre_middleware(
        mut self,
        middleware: impl PreMiddleware + Send + Sync + 'static,
    ) -> RouterBuilder<R, E> {
        self.pre_middlewares.push(Box::new(middleware));
        self
    }

    pub fn post_middleware(
        mut self,
        middleware: impl PostMiddleware<R> + Send + Sync + 'static,
    ) -> RouterBuilder<R, E> {
        self.post_middlewares.push(Box::new(middleware));
        self
    }

    pub fn error_middleware(
        mut self,
        middleware: impl ErrorMiddleware + Send + Sync + 'static,
    ) -> RouterBuilder<R, E> {
        self.error_middlewares.push(Box::new(middleware));
        self
    }

    pub fn scope(mut self, scope: &str, mut child_router: Router<R, E>) -> RouterBuilder<R, E> {
        while child_router.routes.len() > 0 {
            let route = child_router.routes.pop().unwrap();

            let pattern = util::join_path(scope, route.pattern.as_str());
            let (pattern_re, params_name) = self.build_pattern_re_and_params_name(pattern.as_ref());
            let route = Route {
                pattern,
                pattern_re,
                method: route.method,
                handler: route.handler,
                params_name,
            };
            self.routes.push(route);
        }
        return self;
    }

    pub fn add<P, H, HRet>(mut self, pattern: P, method: Method, handler: H) -> RouterBuilder<R, E>
    where
        P: Into<String>,
        H: Fn(Request) -> HRet + Send + Sync + 'static,
        HRet: Future<Output = Result<Response<R>, E>> + Send + 'static,
    {
        let pattern: String = pattern.into();
        let (pattern_re, params_name) = self.build_pattern_re_and_params_name(pattern.as_ref());
        let route = Route {
            pattern,
            pattern_re,
            method,
            handler: Box::new(move |req| Box::new(handler(req))),
            params_name,
        };
        self.routes.push(route);

        return self;
    }

    pub fn build(self) -> Router<R, E> {
        Router {
            routes: self.routes,
            pre_middlewares: self.pre_middlewares,
            post_middlewares: self.post_middlewares,
            error_middlewares: self.error_middlewares,
        }
    }

    fn build_pattern_re_and_params_name(&self, pattern: &str) -> (Regex, Vec<String>) {
        let param_pattern_re = Regex::new(r#":([^/]+)"#).expect("build param pattern regexp fail");

        let param_names: Vec<String> = param_pattern_re
            .captures_iter(pattern)
            .map(|e| e.get(1).unwrap().as_str().to_owned())
            .collect();
        let pattern_re_str = "^".to_string()
            + param_pattern_re
                .replace_all(pattern, r#"(?P<$1>[^/]+)"#)
                .as_ref()
            + "$";
        let pattern_re =
            Regex::new(pattern_re_str.as_ref()).expect("build route pattern regexp fail");
        (pattern_re, param_names)
    }
}

impl<R, E> Router<R, E>
where
    E: Into<anyhow::Error> + Send + 'static,
{
    pub fn builder() -> RouterBuilder<R, E> {
        return RouterBuilder {
            routes: vec![],
            pre_middlewares: vec![],
            post_middlewares: vec![],
            error_middlewares: vec![],
        };
    }

    pub async fn process(&self, req: Request) -> anyhow::Result<Response<R>>
    {
        let res = self.process_core(req.clone()).await;
        if let Err(error) = &res {
            for middleware in &self.error_middlewares {
                middleware.process(&req, error).await;
            }
        }
        res
    }

    async fn process_core(&self, mut req: Request) -> anyhow::Result<Response<R>>
    {
        let url = req.info.uri.clone();
        let path = url.path();

        info!("request {}", req.info.uri);

        for middleware in &self.pre_middlewares {
            middleware.process(&mut req).await?;
        }

        let mut resp: Option<Response<R>> = None;

        for Route {
            pattern: _,
            pattern_re,
            method,
            handler,
            params_name,
        } in &self.routes
        {
            let caps = pattern_re.captures(path);
            if &req.info.method == method && caps.is_some() {
                let caps = caps.unwrap();
                let mut req = req.clone();
                req.params_name = params_name.clone();
                for param_name in &req.params_name {
                    let param = caps.name(param_name).unwrap();
                    req.params
                        .insert(param_name.to_owned(), param.as_str().to_owned());
                }

                let _resp = Pin::from(handler(req.clone()))
                    .await
                    .map_err(|e| e.into())?;
                resp = Some(_resp);
                break;
            }
        }

        // none route match
        if resp.is_none() {
            let err = KeekijanaiError::Client {
                status: hyper::StatusCode::NOT_FOUND,
                message: format!("Not found API {}", url.path()),
            };
            return Err(err.into())
        }

        let mut resp = resp.unwrap();
        for middleware in &self.post_middlewares {
            middleware.process(&mut req, &mut resp).await?;
        }
        Ok(resp)
    }
}
