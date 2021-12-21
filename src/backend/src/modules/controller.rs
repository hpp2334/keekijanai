use poem::{EndpointExt, Route};
use poem_openapi::{OpenApi, OpenApiService};

use super::{
    auth::{controller::AuthController, middleware::UserInfoMiddleware},
    comment::controller::CommentController,
    ping::controller::PingController,
    star::controller::StarController,
};

pub fn get_keekijanai_route() -> impl poem::Endpoint {
    let service = OpenApiService::new(
        PingController
            .combine(StarController)
            .combine(CommentController)
            .combine(AuthController),
        "Keekijanai api",
        "0.3",
    );

    let ui = service.swagger_ui();
    let app = Route::new()
        .nest("/keekijanai/doc", ui)
        .nest("/", service)
        .with(UserInfoMiddleware)
        .with(crate::modules::user::ConvertErrorMiddleware)
        .with(crate::core::RespErrorMiddleware)
        .with(poem::middleware::Tracing);

    app
}
