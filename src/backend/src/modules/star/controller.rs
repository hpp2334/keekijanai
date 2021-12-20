use poem::web;
use poem_openapi::{param, payload::Json, payload::PlainText, Object, OpenApi};

use crate::{
    core::ApiTags,
    core::Service,
    modules::{auth::UserInfoContext, user::model::UserRole},
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

pub struct StarController;

#[OpenApi(prefix_path = "/keekijanai/star", tag = "ApiTags::Star")]
impl StarController {
    #[oai(path = "/", method = "get")]
    async fn get_star(
        &self,
        user_info: web::Data<&UserInfoContext>,
        belong: param::Query<String>,
    ) -> poem::Result<Json<GetStarResponse>> {
        let user_id = (*user_info).0;

        let current = StarService::serve()
            .get_current(user_id, belong.clone())
            .await?;
        let total = StarService::serve().get_total(belong.as_str()).await?;

        Ok(Json(GetStarResponse { current, total }))
    }

    #[oai(path = "/", method = "post")]
    async fn update_star(
        &self,
        user_info: web::Data<&UserInfoContext>,
        req_body: Json<UpdateStarRequestPayload>,
    ) -> poem::Result<PlainText<&'static str>> {
        let UpdateStarRequestPayload { star } = &*req_body;
        let user_info = *user_info;

        if user_info.1.role == UserRole::Anonymous {
            return Err(crate::modules::user::error::InsufficientPrivilege(
                user_info.0,
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
