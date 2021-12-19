use poem_openapi::{payload::PlainText, OpenApi};
use crate::core::ApiTags;

pub struct PingController;

#[OpenApi(prefix_path = "/keekijanai/ping", tag = "ApiTags::Ping")]
impl PingController {
    #[oai(path = "/", method = "get")]
    async fn ping(&self) -> poem::Result<PlainText<&'static str>> {
        return Ok(PlainText("pong"));
    }
}
