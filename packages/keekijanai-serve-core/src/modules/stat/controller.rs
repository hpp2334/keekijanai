

use poem_openapi::{param, payload::Json, Object, OpenApi};


use crate::{core::ApiTags, core::Service};

use super::service::StatService;

#[derive(Debug, Object)]
pub struct VisitRespPayload {
    pv: i64,
    uv: i64,
}

#[derive(Debug)]
pub struct StatController;

#[OpenApi(prefix_path = "/keekijanai/stat", tag = "ApiTags::Stat")]
impl StatController {
    #[oai(path = "/", method = "put")]
    async fn visit(
        &self,
        _keekijanai_uuid: param::Cookie<String>,
        belong: param::Query<String>,
    ) -> poem::Result<Json<VisitRespPayload>> {
        let stat_service = StatService::serve();
        let belong = belong.as_str();
        let uuid = _keekijanai_uuid.as_str();
        let (pv, uv) = stat_service.visit(belong, uuid).await?;

        Ok(Json(VisitRespPayload { pv, uv }))
    }
}
