extern crate derive_more;
use std::net::SocketAddr;

use backend::{RouterService, get_router};
use hyper::Server;

#[tokio::main]
pub async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let router = get_router();
 
    let service = RouterService::new(router).unwrap();
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    let server = Server::bind(&addr).serve(service);

    println!("App is running on: {}", addr);

    server.await?;

    return Ok(());
}