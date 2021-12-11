use std::{pin::Pin};

use hyper::{Response};
use regex::Regex;
use std::future::Future;
use tracing::info;

use crate::{error::KeekijanaiError, method::Method, request::Request, route::Route};

type PreMiddlewareHandler<E> =
    Box<dyn Fn(Request) -> PreMiddlewareHandlerMut<E> + Send + Sync + 'static>;
type PreMiddlewareHandlerMut<E> = Box<dyn Future<Output = Result<Request, E>> + Send + 'static>;

type PostMiddlewareHandler<R, E> =
    Box<dyn Fn(Request, Response<R>) -> PostMiddlewareHandlerMut<R, E> + Send + Sync + 'static>;
type PostMiddlewareHandlerMut<R, E> =
    Box<dyn Future<Output = Result<(Request, Response<R>), E>> + Send + 'static>;

pub struct Router<R, E> {
    routes: Vec<Route<R, E>>,
    pre_middlewares: Vec<PreMiddlewareHandler<E>>,
    post_middlewares: Vec<PostMiddlewareHandler<R, E>>,
}

pub struct RouterBuilder<R, E> {
    routes: Vec<Route<R, E>>,
    pre_middlewares: Vec<PreMiddlewareHandler<E>>,
    post_middlewares: Vec<PostMiddlewareHandler<R, E>>,
}

impl<R, E> RouterBuilder<R, E>
where
    E: Into<anyhow::Error> + Send + 'static,
{
    pub fn pre_middleware<H, HMut>(mut self, handler: H) -> RouterBuilder<R, E>
    where
        H: Fn(Request) -> HMut + Send + Sync + 'static,
        HMut: Future<Output = Result<Request, E>> + Send + 'static,
    {
        self.pre_middlewares
            .push(Box::new(move |req| Box::new(handler(req))));
        self
    }

    pub fn post_middleware<H, HMut>(mut self, handler: H) -> RouterBuilder<R, E>
    where
        H: Fn(Request, Response<R>) -> HMut + Send + Sync + 'static,
        HMut: Future<Output = Result<(Request, Response<R>), E>> + Send + 'static,
    {
        self.post_middlewares
            .push(Box::new(move |req, res| Box::new(handler(req, res))));
        self
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
        }
    }

    fn build_pattern_re_and_params_name(&self, pattern: &str) -> (Regex, Vec<String>) {
        let param_pattern_re = Regex::new(r#":([^/]+)"#).expect("build param pattern regexp fail");

        let param_names: Vec<String> = param_pattern_re
            .captures_iter(pattern)
            .map(|e| {
                e.get(1).unwrap().as_str().to_owned()
            })
            .collect();
        let pattern_re_str = "^".to_string() + param_pattern_re.replace_all(pattern, r#"(?P<$1>[^/]+)"#).as_ref() + "$";
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
        };
    }

    pub async fn process<T>(
        &self,
        hyper_req: hyper::Request<T>,
        extern_req_id: Option<String>,
    ) -> anyhow::Result<Response<R>>
    where
        T: hyper::body::HttpBody + Send + Sync,
    {
        let mut req = Request::factory(hyper_req, extern_req_id, None).await?;
        let url = req.info.uri.clone();
        let path = url.path();

        info!("request {}", req.info.uri);

        for middleware in &self.pre_middlewares {
            req = Pin::from(middleware(req)).await.map_err(|e| e.into())?;
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
                let mut req = req.clone();
                req.params_name = params_name.clone();

                let _resp = Pin::from(handler(req.clone()))
                    .await
                    .map_err(|e| e.into())?;
                resp = Some(_resp);
                break;
            }
        }

        if resp.is_some() {
            let mut processing_resp = resp.unwrap();
            for middleware in &self.post_middlewares {
                let res = Pin::from(middleware(req.clone(), processing_resp))
                    .await
                    .map_err(|e| e.into())?;
                req = res.0;
                processing_resp = res.1;
            }
            resp = Some(processing_resp);
        }

        if resp.is_some() {
            Ok(resp.unwrap())
        } else {
            let err = KeekijanaiError::Client {
                status: hyper::StatusCode::NOT_FOUND,
                message: "NOT FOUND".to_owned(),
            };
            Err(err.into())
        }
    }
}
