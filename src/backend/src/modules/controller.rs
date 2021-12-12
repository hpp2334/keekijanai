use backend_router::{Body, Router};

use super::{ping, auth};

pub fn get_router() -> Router<Body, anyhow::Error> {
    Router::builder()
        .scope("/keekijanai/ping", ping::controller::get_router())
        .scope("/keekijanai/auth", auth::controller::get_router())
        .build()
}
