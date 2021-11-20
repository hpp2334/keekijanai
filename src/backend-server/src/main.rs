extern crate derive_more;
use std::net::SocketAddr;

use hyper::{Body, Response, Server, StatusCode};
use routerify::{Router, RouterService};



mod controllers;
mod core;

async fn error_handler(err: routerify::RouteError) -> Response<Body> {
    log::error!("{:?}", err);

    Response::builder()
        .status(StatusCode::INTERNAL_SERVER_ERROR)
        .body(Body::from(err.to_string()))
        .unwrap()
}

#[tokio::main]
pub async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let router = Router::builder()
        .scope("/keekijanai/ping", controllers::ping::route())
        .scope("/keekijanai/auth", controllers::auth::route())
        .err_handler(error_handler)
        .build()
        .unwrap();

    // Create a Service from the router above to handle incoming requests.
    let service = RouterService::new(router).unwrap();

    // The address on which the server will be listening.
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));

    // Create a server by passing the created service to `.serve` method.
    let server = Server::bind(&addr).serve(service);

    println!("App is running on: {}", addr);

    server.await?;

    return Ok(());
}