extern crate backend;
extern crate derive_more;

use backend::{modules::get_keekijanai_route};

use poem::{listener::TcpListener};

#[tokio::main]
pub async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();
    backend::init();

    let app = get_keekijanai_route().await;

    poem::Server::new(TcpListener::bind("127.0.0.1:3000"))
        .run(app)
        .await?;

    return Ok(());
}
