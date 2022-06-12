extern crate dotenv;
extern crate proc_macro;

extern crate lazy_static;

#[macro_use]
extern crate num_derive;

#[macro_use]
mod core;
mod helpers;

pub mod modules;

use std::sync::atomic::{AtomicBool, Ordering};

use once_cell::sync::Lazy;

pub use self::core::controller::manual_call::{EntireRequest, EntireResponse};
pub use axum::{
    body::HttpBody,
    response::{IntoResponse, Response},
};

static INIT_MUTEX: Lazy<AtomicBool> = Lazy::new(Default::default);

pub async fn init() {
    let result = INIT_MUTEX.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst);
    if result != Ok(false) {
        return;
    }

    crate::core::setting::init_setting().unwrap();
    crate::core::db::init_pool().await.unwrap();
}

/// `init` method should be called before
pub async fn run_server(addr: &str) {
    let app = modules::get_router();
    tracing::info!("before start server");
    axum::Server::bind(&addr.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

/// `init` method should be called before
pub async fn process_entire_request(req: EntireRequest) -> EntireResponse {
    let router = crate::modules::get_router();
    crate::core::controller::manual_call::manual_call_with_entire_request(router, req).await
}
