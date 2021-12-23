use crate::core::ApiTags;
use poem_openapi::{payload::Json, Object, OpenApi};

pub struct TimeController;

#[derive(Object)]
struct GetTimeResponse {
    time: String,
}

#[OpenApi(prefix_path = "/keekijanai/time", tag = "ApiTags::Time")]
impl TimeController {
    #[oai(path = "/", method = "get")]
    async fn time(&self) -> poem::Result<Json<GetTimeResponse>> {
        let time = std::time::SystemTime::now();
        let timestamp = time
            .duration_since(std::time::SystemTime::UNIX_EPOCH)
            .map_err(|e| anyhow::anyhow!("{}", e.to_string()))?;
        let timestamp = timestamp.as_millis();
        return Ok(Json(GetTimeResponse {
            time: timestamp.to_string(),
        }));
    }
}
