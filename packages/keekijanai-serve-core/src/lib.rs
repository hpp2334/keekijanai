extern crate dotenv;
extern crate proc_macro;

#[macro_use]
extern crate lazy_static;

#[macro_use]
extern crate num_derive;

#[macro_use]
mod core;
mod helpers;

pub mod modules;

use std::sync::atomic::{AtomicBool, Ordering};

use axum::response::IntoResponse;
use once_cell::sync::Lazy;
use tower::ServiceExt;

static INIT_MUTEX: Lazy<AtomicBool> = Lazy::new(Default::default);

pub async fn init() {
    let result = INIT_MUTEX.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst);
    if result != Ok(true) {
        return;
    }

    crate::core::setting::Setting::init();
    crate::core::db::init_pool().await.unwrap();
}

/// `init` method should be called before
pub async fn process_entire_request(
    req: axum::http::Request<axum::body::Body>,
) -> impl IntoResponse {
    let router = modules::get_router();
    let resp = router.oneshot(req).await.unwrap();

    resp
}

/// `init` method should be called before
pub async fn run_server(addr: &str) {
    let app = modules::get_router();
    axum::Server::bind(&addr.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
