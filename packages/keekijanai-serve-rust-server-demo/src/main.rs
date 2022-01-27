extern crate derive_more;
extern crate keekijanai_serve_core;

use keekijanai_serve_core::modules::{get_keekijanai_endpoint, write_keekijanai_openapi_spec};

use poem::listener::TcpListener;

#[tokio::main]
pub async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();
    keekijanai_serve_core::init().await;

    write_keekijanai_openapi_spec(
        "packages/keekijanai-frontend-core/src/generated/keekijanai-api.json",
    )
    .await
    .unwrap();

    let app = get_keekijanai_endpoint();

    poem::Server::new(TcpListener::bind("127.0.0.1:3001"))
        .run(app)
        .await?;

    return Ok(());
}
