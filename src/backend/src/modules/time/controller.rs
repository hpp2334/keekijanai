use crate::core::{ApiTags, Service};
use poem_openapi::{payload::Json, Object, OpenApi};

use super::service::TimeService;

pub struct TimeController;

#[derive(Object)]
struct GetTimeResponse {
    time: String,
}

#[OpenApi(prefix_path = "/keekijanai/time", tag = "ApiTags::Time")]
impl TimeController {
    #[oai(path = "/", method = "get")]
    async fn time(&self) -> poem::Result<Json<GetTimeResponse>> {
        let time_service = TimeService::serve();
        let timestamp = time_service.now().await?;
        let time = timestamp.as_millis();
        return Ok(Json(GetTimeResponse {
            time: time.to_string(),
        }));
    }
}
