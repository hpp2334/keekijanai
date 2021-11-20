


use hyper::{Body, Request, Response};
use routerify::{Router};




async fn ping(_req: Request<Body>) -> Result<Response<Body>, anyhow::Error> {
    return Ok(Response::new(Body::from("pong")));
}

pub fn route() -> Router<Body, anyhow::Error> {
    Router::builder().get("", ping).build().unwrap()
}
