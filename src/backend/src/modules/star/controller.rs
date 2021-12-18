use backend_router::{Body, Method, Request, Response, Router, WithResponseHelper};
use serde::{Deserialize, Serialize};

use crate::{core::Service, modules::user::service::UserService};

use super::{service::{StarService}, model::StarActiveModel};

#[derive(Deserialize)]
struct GetStarQuery {
    belong: String,
}

#[derive(Debug, Deserialize)]
struct UpdateStarRequestPayload {
    star: StarActiveModel
}

#[derive(Serialize)]
struct GetStarResponse {
    current: i64,
    total: i64,
}

async fn get_star(req: Request) -> anyhow::Result<Response<Body>> {
    let GetStarQuery { belong } = req.parse_query::<GetStarQuery>()?;

    let user_id = UserService::serve()
        .get_user_id_from_req(&req)
        .await
        .unwrap();

    let current = StarService::serve()
        .get_current(user_id, belong.as_str())
        .await?;
    let total = StarService::serve().get_total(belong.as_str()).await?;

    Response::build_json(GetStarResponse { current, total })
}

async fn update_star(req: Request) -> anyhow::Result<Response<Body>> {
    let UpdateStarRequestPayload { star } = req.parse_body::<UpdateStarRequestPayload>()?;

    let user_id = UserService::serve()
        .get_user_id_from_req(&req)
        .await
        .unwrap();

    StarService::serve()
        .update_star(user_id, star)
        .await?;
    Ok(Response::new("".into()))
}

pub fn get_router() -> Router<Body, anyhow::Error> {
    Router::builder()
        .add("/star", Method::GET, get_star)
        .add("/star", Method::POST, update_star)
        .build()
}
