extern crate derive_more;
extern crate keekijanai_serve_core;

use keekijanai_serve_core::{init, run_server};

#[tokio::main]
pub async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();

    init().await;
    run_server("127.0.0.1:3001").await;

    return Ok(());
}
