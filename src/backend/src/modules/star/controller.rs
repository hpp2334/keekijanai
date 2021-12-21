use poem::web;
use poem_openapi::{param, payload::Json, payload::PlainText, Object, OpenApi};

use crate::{
    core::ApiTags,
    core::Service,
    modules::{auth::UserInfo, user::model::UserRole},
};

use super::{model::StarActiveModel, service::StarService};

#[derive(Debug, Object)]
struct UpdateStarRequestPayload {
    star: StarActiveModel,
}

#[derive(Object)]
struct GetStarResponse {
    current: i64,
    total: i64,
}

#[derive(Debug)]
pub struct StarController;

#[OpenApi(prefix_path = "/keekijanai/star", tag = "ApiTags::Star")]
impl StarController {
    #[oai(path = "/", method = "get")]
    async fn get_star(
        &self,
        user_info: web::Data<&UserInfo>,
        belong: param::Query<String>,
    ) -> poem::Result<Json<GetStarResponse>> {
        let user_info = (*user_info);

        tracing::debug!("before get_current");
        let current = StarService::serve()
            .get_current(&user_info, belong.clone())
            .await?;
        tracing::debug!("get_current (curret = {})", current);
        tracing::debug!("before get_total");
        let total = StarService::serve().get_total(belong.as_str()).await?;
        tracing::debug!("get_total (total = {})", total);

        Ok(Json(GetStarResponse { current, total }))
    }

    #[oai(path = "/", method = "post")]
    async fn update_star(
        &self,
        user_info: web::Data<&UserInfo>,
        req_body: Json<UpdateStarRequestPayload>,
    ) -> poem::Result<PlainText<&'static str>> {
        let UpdateStarRequestPayload { star } = &*req_body;
        let user_info = *user_info;

        if user_info.is_anonymous() {
            return Err(crate::modules::user::error::InsufficientPrivilege(
                user_info.id,
                "star".to_string(),
                star.id.clone().unwrap().to_string(),
            )
            .into());
        }

        StarService::serve()
            .update_star(user_info, star.clone())
            .await?;

        Ok(PlainText(""))
    }
}
