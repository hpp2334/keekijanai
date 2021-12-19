
use poem_openapi::{OpenApi, payload::Json, param, payload::PlainText, Object};

use crate::{core::Service, core::ApiTags};

use super::{service::{StarService}, model::StarActiveModel};

#[derive(Debug, Object)]
struct UpdateStarRequestPayload {
    star: StarActiveModel
}

#[derive(Object)]
struct GetStarResponse {
    current: i64,
    total: i64,
}

pub struct StarController;

#[OpenApi(prefix_path = "/keekijanai/star", tag = "ApiTags::Star")]
impl StarController {
    #[oai(path = "/", method = "get")]
    async fn get_star(&self, belong: param::Query<String>) -> poem::Result<Json<GetStarResponse>> {
        let user_id = 0;
    
        let current = StarService::serve()
            .get_current(user_id, belong.clone())
            .await?;
        let total = StarService::serve().get_total(belong.as_str()).await?;

        Ok(Json(GetStarResponse { current, total }))
    }
    
    #[oai(path = "/", method = "post")]
    async fn update_star(&self, req_body: Json<UpdateStarRequestPayload>) -> poem::Result<PlainText<&'static str>> {
        let UpdateStarRequestPayload { star } = &*req_body;
    
        let user_id = 0;
    
        StarService::serve()
            .update_star(user_id, star.clone())
            .await?;

        Ok(PlainText(""))
    }
}
