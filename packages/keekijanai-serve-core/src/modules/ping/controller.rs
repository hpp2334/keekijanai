use axum::{routing, Router};

async fn ping() -> &'static str {
    "pong"
}

pub fn get_router() -> Router {
    Router::new().route("/", routing::get(ping))
}
