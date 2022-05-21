use crate::core::{ServeError, Service};
use axum::{response::IntoResponse, routing, Json, Router};
use serde::Serialize;

use super::service::TimeService;

pub struct TimeController;

#[derive(Serialize)]
struct GetTimeResponse {
    time: String,
}

async fn time() -> Result<impl IntoResponse, ServeError> {
    let time_service = TimeService::serve();
    let timestamp = time_service.now().await?;
    let time = timestamp.as_millis();
    return Ok(Json(GetTimeResponse {
        time: time.to_string(),
    }));
}

pub fn get_router() -> Router {
    Router::new().route("/", routing::get(time))
}
