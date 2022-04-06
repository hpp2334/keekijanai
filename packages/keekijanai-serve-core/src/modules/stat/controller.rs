use axum::{extract::Query, response::IntoResponse, routing, Extension, Json, Router};
use serde::{Deserialize, Serialize};

use crate::core::{ServeError, Service};

use super::{middleware::attch_uuid_middleware, middleware::AttchedUuid, service::StatService};

#[derive(Debug, Deserialize)]
struct VisitQuery {
    belong: String,
}

#[derive(Debug, Serialize)]
pub struct VisitRespPayload {
    pv: i64,
    uv: i64,
}

async fn visit(
    Extension(AttchedUuid(uuid)): Extension<AttchedUuid>,
    Query(VisitQuery { belong }): Query<VisitQuery>,
) -> Result<impl IntoResponse, ServeError> {
    let stat_service = StatService::serve();
    let belong = belong.as_str();
    let (pv, uv) = stat_service.visit(belong, &uuid).await?;

    Ok(Json(VisitRespPayload { pv, uv }))
}

pub fn get_router() -> Router {
    Router::new()
        .route("/", routing::put(visit))
        .route_layer(axum::middleware::from_fn(attch_uuid_middleware))
}
