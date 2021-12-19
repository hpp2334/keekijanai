#[macro_use]
extern crate backend;
extern crate derive_more;
use std::net::SocketAddr;

use backend::{modules::controller::get_keekijanai_route};
use hyper::Server;
use poem::{listener::TcpListener, Route};
use tokio::io::AsyncWriteExt;

#[tokio::main]
pub async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let app = get_keekijanai_route();

    poem::Server::new(TcpListener::bind("127.0.0.1:3000"))
        .run(app)
        .await?;

    return Ok(());
}
