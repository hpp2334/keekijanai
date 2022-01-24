pub mod auth;
pub mod comment;
pub mod ping;
pub mod star;
pub mod stat;
pub mod time;
pub mod user;
use std::hash::Hasher;

use poem::{Endpoint, EndpointExt, Request, RequestBuilder, Route};
use poem_openapi::{OpenApi, OpenApiService};
use tokio::io::AsyncWriteExt;

use self::{
    auth::{controller::AuthController, middleware::UserInfoMiddleware},
    comment::controller::CommentController,
    ping::controller::PingController,
    star::controller::StarController,
    stat::controller::StatController,
    time::controller::TimeController,
};

fn get_keekijanai_openapi() -> impl poem_openapi::OpenApi {
    let api = PingController
        .combine(TimeController)
        .combine(StarController)
        .combine(CommentController)
        .combine(AuthController)
        .combine(StatController);
    api
}

fn get_keekijanai_openapi_service() -> poem_openapi::OpenApiService<impl OpenApi> {
    let service = OpenApiService::new(get_keekijanai_openapi(), "Keekijanai api", "0.3");
    service
}

pub async fn write_keekijanai_openapi_spec(out_path: &str) -> tokio::io::Result<()> {
    let service = get_keekijanai_openapi_service();
    let sepc = service.spec();
    let mut f = tokio::fs::File::create(out_path).await?;
    let _res = f.write_all(sepc.as_bytes()).await?;
    Ok(())
}

pub fn get_keekijanai_endpoint() -> impl poem::Endpoint {
    let service = get_keekijanai_openapi_service();

    let app = Route::new()
        .at(
            "/api/keekijanai/auth/oauth2/:provider/callback",
            crate::modules::auth::controller::outh2_login,
        )
        .nest("/api", service)
        .with(UserInfoMiddleware)
        .with(crate::modules::stat::UuidMiddleware)
        .with(crate::modules::auth::ConvertErrorMiddleware)
        .with(crate::modules::user::ConvertErrorMiddleware)
        .with(crate::core::RespErrorMiddleware)
        .with(poem::middleware::CookieJarManager::new())
        .with(poem::middleware::Tracing);

    app
}
