use num_traits::ToPrimitive;
use poem::web;
use poem_openapi::{param, payload::Json, payload::PlainText, Object, OpenApi};

use crate::{core::ApiTags, core::Service, modules::auth::UserInfo};

use super::{
    model::{StarActiveModel, StarType},
    service::StarService,
};
use crate::modules::user::error as user_error;

#[derive(Debug, Object)]
struct UpdateStarReqPayload {
    star_type: i16,
}

#[derive(Object)]
struct GetStarResponse {
    current: Option<i16>,
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
        let user_info = *user_info;

        tracing::debug!("before get_current");
        let current = if user_info.is_anonymous() {
            None
        } else {
            StarService::serve()
                .get_current(&user_info, belong.clone())
                .await
                .map(|s| Some(s))?
        };
        let current = current.map(|s| ToPrimitive::to_i16(&s).unwrap());
        tracing::debug!("get_current (curret = {:?})", current);
        tracing::debug!("before get_total");
        let total = StarService::serve().get_total(belong.as_str()).await?;
        tracing::debug!("get_total (total = {})", total);

        Ok(Json(GetStarResponse { current, total }))
    }

    #[oai(path = "/", method = "put")]
    async fn update_star(
        &self,
        user_info: web::Data<&UserInfo>,
        belong: param::Query<String>,
        req_body: Json<UpdateStarReqPayload>,
    ) -> poem::Result<PlainText<&'static str>> {
        let user_info = *user_info;

        StarService::serve()
            .update_star_by_belong_and_star_type(user_info, belong.as_str(), &req_body.star_type)
            .await?;

        Ok(PlainText(""))
    }
}
