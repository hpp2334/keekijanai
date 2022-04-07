pub mod auth;
pub mod comment;
pub mod ping;
pub mod star;
pub mod stat;
pub mod time;
pub mod user;



use axum::Router;



pub(crate) fn get_router() -> Router {
    Router::new()
        .nest(
            "/api/keekijanai",
            Router::new()
                .nest("/ping", ping::controller::get_router())
                .nest("/star", star::controller::get_router())
                .nest("/stat", stat::controller::get_router())
                .nest("/time", time::controller::get_router())
                .nest("/auth", auth::controller::get_router())
                .nest("/comment", comment::controller::get_router())
                .route_layer(axum::middleware::from_fn(
                    auth::middleware::user_info_middleware,
                )),
        )
        .layer(tower_cookies::CookieManagerLayer::new())
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .route_layer(axum::middleware::from_fn(
            crate::core::error::middleware::convert_resp_error_middleware,
        ))
}
