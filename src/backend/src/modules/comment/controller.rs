use std::any;

use backend_router::{Request, Response, Body, Router, Method, WithResponseHelper};
use serde::{Deserialize, Serialize};

use crate::core::Service;

use super::{service::CommentService, model::{CommentActiveModel, CommentModel, Comment}};

type ListCommentParams = super::service::ListCommentParams;

#[derive(Deserialize)]
struct CreateCommentParams {
    pub payload: CommentActiveModel,
}

#[derive(Debug, Serialize)]
struct CreateCommentRespPayload {
    pub payload: Comment,
}

#[derive(Deserialize)]
struct UpdateCommentParams {
    pub payload: CommentActiveModel,
}

#[derive(Debug, Serialize)]
struct UpdateCommentRespPayload {
    pub payload: Comment,
}

async fn list_comment(req: Request) -> anyhow::Result<Response<Body>> {
    let params = req.parse_query::<ListCommentParams>()?;

    let (comments, total) = CommentService::serve().list(params.clone()).await?;

    let res = crate::core::response::CursorListData {
        data: comments,
        pagination: crate::core::response::CursorPagination {
            total,
            cursor: params.pagination.cursor.clone(),
            limit: params.pagination.limit.clone(),
        }
    };

    Response::build_json(res)
}

async fn create_comment(req: Request) -> anyhow::Result<Response<Body>> {
    let params = req.parse_body::<CreateCommentParams>()?;
    
    let created = CommentService::serve().create(params.payload).await?;

    let resp_payload = CreateCommentRespPayload {
        payload: created.into(),
    };

    Response::build_json(resp_payload)
}

async fn update_comment(req: Request) -> anyhow::Result<Response<Body>> {
    let params = req.parse_body::<UpdateCommentParams>()?;
    let id = req.get_param("id").unwrap().parse::<i64>()?;
    
    let updated = CommentService::serve().update(id, params.payload).await?;

    let resp_payload = UpdateCommentRespPayload {
        payload: updated.into(),
    };

    Response::build_json(resp_payload)
}

async fn delete_comment(req: Request) -> anyhow::Result<Response<Body>> {
    let id = req.get_param("id").unwrap().parse::<i64>()?;

    let _res = CommentService::serve().remove(id).await?;

    Response::build_empty()
}

pub fn get_router() -> Router<Body, anyhow::Error> {
    Router::builder()
        .add("/", Method::GET, list_comment)
        .add("/", Method::POST, create_comment)
        .add("/:id", Method::PUT, update_comment)
        .add("/:id", Method::DELETE, delete_comment)
        .build()
}
