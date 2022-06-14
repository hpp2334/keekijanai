use axum::{extract::Query, response::IntoResponse, routing, Extension, Json, Router};
use num_traits::ToPrimitive;
use serde::{Deserialize, Serialize};

use crate::{
    core::{di::DIContainer, ServeError, Service},
    modules::auth::UserInfo,
};

use super::service::StarService;

#[derive(Debug, Deserialize)]
struct UpdateStarReqPayload {
    star_type: i16,
}

#[derive(Deserialize)]
struct GetStarQuery {
    belong: String,
}

#[derive(Serialize)]
struct GetStarResponse {
    current: Option<i16>,
    total: i64,
}

#[derive(Deserialize)]
struct UpdateStarQuery {
    belong: String,
}

async fn get_star(
    Extension(user_info): Extension<UserInfo>,
    Query(GetStarQuery { belong }): Query<GetStarQuery>,
) -> Result<impl IntoResponse, ServeError> {
    tracing::debug!("before get_current");

    let star_service = DIContainer::get().resolve::<StarService>();

    let current = if user_info.is_anonymous() {
        None
    } else {
        star_service
            .get_current(&user_info, belong.clone())
            .await
            .map(|s| Some(s))?
    };
    let current = current.map(|s| ToPrimitive::to_i16(&s).unwrap());
    tracing::debug!("get_current (current = {:?})", current);
    tracing::debug!("before get_total");
    let total = star_service.get_total(belong.as_str()).await?;
    tracing::debug!("get_total (total = {})", total);

    Ok(Json(GetStarResponse { current, total }))
}

async fn update_star(
    Extension(user_info): Extension<UserInfo>,
    Query(UpdateStarQuery { belong }): Query<UpdateStarQuery>,
    Json(req_body): Json<UpdateStarReqPayload>,
) -> Result<impl IntoResponse, ServeError> {
    let star_service = DIContainer::get().resolve::<StarService>();
    star_service
        .update_star_by_belong_and_star_type(&user_info, belong.as_str(), &req_body.star_type)
        .await?;

    Ok(())
}

pub fn get_router() -> Router {
    Router::new()
        .route("/", routing::get(get_star))
        .route("/", routing::put(update_star))
}
