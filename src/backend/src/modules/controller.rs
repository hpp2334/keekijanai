use backend_router::{Body, Router};

use super::{
    auth::{self, middleware::AuthGuardMiddleware},
    comment, ping, star,
};

fn get_auth_middleware() -> AuthGuardMiddleware {
    AuthGuardMiddleware {
        ignore_paths: vec!["/keekijanai/auth"],
    }
}

pub fn get_router() -> Router<Body, anyhow::Error> {
    Router::builder()
        .pre_middleware(get_auth_middleware())
        .scope("/keekijanai/ping", ping::controller::get_router())
        .scope("/keekijanai/auth", auth::controller::get_router())
        .scope("/keekijanai/star", star::controller::get_router())
        .scope("/keekijanai/comment", comment::controller::get_router())
        .build()
}
