use backend_router::{Request, Response, Body, Router, Method};

async fn ping(req: Request) -> anyhow::Result<Response<Body>> {
    return Ok(Response::new("pong".into()));
}

pub fn get_router() -> Router<Body, anyhow::Error> {
    Router::builder()
        .add("/", Method::GET, ping)
        .build()
}
