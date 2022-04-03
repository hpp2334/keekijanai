pub mod auth;
pub mod comment;
pub mod ping;
pub mod star;
pub mod stat;
pub mod time;
pub mod user;
use std::hash::Hasher;

use axum::{error_handling::HandleErrorLayer, Router};

pub(crate) fn get_router() -> Router {
    Router::new().nest(
        "/keekijanai/api",
        Router::new()
            .nest("/ping", ping::controller::get_router())
            .nest("/star", star::controller::get_router())
            .nest("/stat", stat::controller::get_router())
            .nest("/time", time::controller::get_router())
            .nest("/auth", auth::controller::get_router())
            .nest("/comment", comment::controller::get_router()),
    )
}
