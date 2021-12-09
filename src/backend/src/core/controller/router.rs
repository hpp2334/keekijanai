use std::{future::Future, convert::Infallible};

use super::Method;

struct Request<Params, Query, Payload> {
    url: &'static str,
    method: Method,
    params: Params,
    query: Query,
    payload: Payload,
}

struct Router {}

impl Router {
    pub fn new() -> Self {
        return Router {};
    }

    pub fn build(&mut self) -> Self {
        return *self;
    }

    pub fn scope(&mut self, prefix: &str, router: Router) -> &mut Self {
        return self;
    }

    pub fn add<Params, Query, Payload, Ret, H, HFut>(
        &mut self,
        path: &str,
        method: Method,
        handler: H,
    ) -> &mut Self
    where
        H: Fn(Request<Params, Query, Payload>) -> HFut,
        HFut: Future<Output = anyhow::Result<Ret>>,
    {
        return &mut self;
    }
}

pub fn serve_router(router: &Router, request: hyper::Request<hyper::Body>) {

}

async fn test() -> anyhow::Result<()> {
    struct AddPayload {
        x: i32,
        y: i32,
    }

    async fn add_post(req: Request<(), (), AddPayload>) -> anyhow::Result<i32> {
        let x = req.payload.x;
        let y = req.payload.y;

        return Ok(x + y);
    }

    struct AddQuery {
        x: i32,
        y: i32,
    }

    async fn add_get(req: Request<(), AddQuery, ()>) -> anyhow::Result<i32> {
        let x = req.query.x;
        let y = req.query.y;
        return Ok(x + y);
    }

    let math_router = Router::new()
        .add("/add", Method::Post, add_get)
        .add("/add", Method::Get, add_post)
        .build();

    let mut router = Router::new().scope("/keekijanai/math", math_router).build();

    // serve in a service

    let root_service_fn = |req: hyper::Request<hyper::Body>| {
        async {
            serve_router(&router, req);
            let resp: hyper::Response<hyper::Body> = hyper::Response::default();
            return Ok::<_, Infallible>(resp);
        }
    };

    let addr = ([127, 0, 0, 1], 3000).into();
    let make_svc = hyper::service::make_service_fn(|_conn| {
        // This is the `Service` that will handle the connection.
        // `service_fn` is a helper to convert a function that
        // returns a Response into a `Service`.
        async {
            Ok::<_, Infallible>(hyper::service::service_fn(root_service_fn))
        }
    });
    let server = hyper::Server::bind(&addr).serve(make_svc);
    server.await?;

    return Ok(())
}
