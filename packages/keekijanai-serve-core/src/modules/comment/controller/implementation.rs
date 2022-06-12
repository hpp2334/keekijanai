use axum::{
    extract::{Path, Query},
    response::IntoResponse,
    routing, Extension, Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{
    core::{di::DIContainer, CursorDirection, CursorPagination, ServeError, Service},
    helpers::VecHelper,
    modules::{
        auth::UserInfo,
        comment::model::{CommentCursorId, CommentId},
    },
};

use super::{
    super::service::{CommentService, ListCommentCursorPagination},
    CommentCreateVOMapperBuilder, CommentUpdateVO, CommentUpdateVOMapperBuilder,
    CommentVOMapperBuilder,
};
use super::{models::CommentVO, CommentCreateVO};

#[derive(Debug, Deserialize)]
struct ListCommentQuery {
    belong: String,
    parent_id: Option<i64>,
    cursor_id: Option<i64>,
    cursor_direction: Option<CursorDirection>,
    limit: i32,
}

#[derive(Deserialize, Clone)]
struct CreateCommentParams {
    pub payload: CommentCreateVO,
}

#[derive(Serialize)]
struct CreateCommentRespPayload {
    pub payload: CommentVO,
}

#[derive(Deserialize, Clone)]
struct UpdateCommentParams {
    pub payload: CommentUpdateVO,
}

#[derive(Serialize, Debug)]
struct UpdateCommentRespPayload {
    pub payload: CommentVO,
}

#[derive(Debug, Deserialize)]
struct GetCommentTreeQuery {
    belong: String,
    roots_limit: i32,
    leaves_limit: i32,
    cursor_id: Option<i64>,
}

#[derive(Debug, Serialize)]
struct GetCommentTreeRespPayload {
    payload: CursorPagination<CommentVO, i64>,
}

#[derive(Debug, Serialize)]
struct ListCommentRespPayload {
    payload: CursorPagination<CommentVO, i64>,
}

async fn list_comment(
    Query(ListCommentQuery {
        belong,
        parent_id,
        cursor_id,
        cursor_direction,
        limit,
    }): Query<ListCommentQuery>,
) -> Result<impl IntoResponse, ServeError> {
    let parent_id = parent_id.map(Into::into);
    let cursor_id = cursor_id.map(CommentCursorId::from_primitive);

    let comment_service = DIContainer::get().resolve::<CommentService>();
    let cursor_comments = comment_service
        .list(
            &belong,
            parent_id,
            ListCommentCursorPagination {
                cursor_id,
                cursor_direction: cursor_direction.unwrap_or(CursorDirection::Forward),
                limit,
            },
        )
        .await?;

    let mapper = CommentVOMapperBuilder::default()
        .build()
        .map_err(anyhow::Error::from)?;

    let cursor_comments = mapper.map_from_cursor_comments(cursor_comments).await?;

    let res = ListCommentRespPayload {
        payload: cursor_comments,
    };

    Ok(Json(res))
}

async fn get_comment_tree(
    Query(GetCommentTreeQuery {
        belong,
        roots_limit,
        leaves_limit,
        cursor_id,
    }): Query<GetCommentTreeQuery>,
) -> Result<impl IntoResponse, ServeError> {
    let cursor_id = cursor_id.map(CommentCursorId::from_primitive);
    let comment_service = DIContainer::get().resolve::<CommentService>();

    let cursor_comments = comment_service
        .list_as_tree(&belong, roots_limit, leaves_limit, cursor_id)
        .await?;

    let mapper = CommentVOMapperBuilder::default()
        .build()
        .map_err(anyhow::Error::from)?;
    let cursor_comments = mapper.map_from_cursor_comments(cursor_comments).await?;

    let resp = GetCommentTreeRespPayload {
        payload: cursor_comments,
    };

    Ok(Json(resp))
}

async fn create_comment(
    Extension(user_info): Extension<UserInfo>,
    Json(params): Json<CreateCommentParams>,
) -> Result<impl IntoResponse, ServeError> {
    let comment_service = DIContainer::get().resolve::<CommentService>();

    let mapper_create = CommentCreateVOMapperBuilder::default()
        .build()
        .map_err(anyhow::Error::from)?;
    let comment_create = mapper_create.map(params.payload);

    let created = comment_service.create(&user_info, comment_create).await?;

    let mapper = CommentVOMapperBuilder::default()
        .build()
        .map_err(anyhow::Error::from)?;
    let payload = mapper
        .map_from_comments(vec![created])
        .await?
        .strict_single()?;

    let resp_payload = CreateCommentRespPayload { payload };

    Ok(Json(resp_payload))
}

async fn update_comment(
    Extension(user_info): Extension<UserInfo>,
    Path(id): Path<i64>,
    Json(params): Json<UpdateCommentParams>,
) -> Result<impl IntoResponse, ServeError> {
    let mapper_update = CommentUpdateVOMapperBuilder::default()
        .build()
        .map_err(anyhow::Error::from)?;
    let comment_update = mapper_update.map(params.payload);
    let id = CommentId::new(id);

    let comment_service = DIContainer::get().resolve::<CommentService>();

    let updated = comment_service
        .update(&user_info, id, comment_update)
        .await?;

    let mapper = CommentVOMapperBuilder::default()
        .build()
        .map_err(anyhow::Error::from)?;
    let payload = mapper
        .map_from_comments(vec![updated])
        .await?
        .strict_single()?;

    let resp_payload = UpdateCommentRespPayload { payload };

    Ok(Json(resp_payload))
}

async fn delete_comment(
    Extension(user_info): Extension<UserInfo>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, ServeError> {
    let id = CommentId::new(id);
    let comment_service = DIContainer::get().resolve::<CommentService>();

    comment_service.remove(&user_info, id).await?;

    Ok(())
}

pub fn get_router() -> Router {
    Router::new()
        .route("/", routing::get(list_comment))
        .route("/tree", routing::get(get_comment_tree))
        .route("/", routing::post(create_comment))
        .route("/:id", routing::put(update_comment))
        .route("/:id", routing::delete(delete_comment))
}
