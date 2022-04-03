use axum::{
    extract::{Path, Query},
    response::IntoResponse,
    routing, Extension, Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{
    core::{response::CursorPagination, ServeError, Service},
    modules::{
        auth::UserInfo,
        user::model::{User, UserVO},
    },
};

use super::{
    model::{Comment, CommentActiveModel, CommentVO},
    service::{CommentService, ListCommentParams},
};

#[derive(Debug, Deserialize)]
struct ListCommentQuery {
    user_id: Option<i64>,
    parent_id: Option<i64>,
    cursor: Option<i64>,
    limit: i32,
}

#[derive(Deserialize, Clone)]
struct CreateCommentParams {
    pub payload: CommentActiveModel,
}

#[derive(Serialize)]
struct CreateCommentRespPayload {
    pub payload: CommentVO,
    pub user: UserVO,
}

#[derive(Deserialize, Clone)]
struct UpdateCommentParams {
    pub payload: CommentActiveModel,
}

#[derive(Serialize, Debug)]
struct UpdateCommentRespPayload {
    pub payload: Comment,
}

#[derive(Debug, Deserialize)]
struct GetCommentTreeQuery {
    belong: String,
    roots_limit: i32,
    leaves_limit: i32,
    cursor: Option<i64>,
}

#[derive(Debug, Serialize)]
struct GetCommentTreeRespPayload {
    pub comments: Vec<CommentVO>,
    pub users: Vec<UserVO>,
    pub pagination: CursorPagination<i64>,
}

#[derive(Debug, Serialize)]
struct ListCommentRespPayload {
    pub comments: Vec<CommentVO>,
    pub users: Vec<UserVO>,
    pub pagination: CursorPagination<i64>,
}

async fn list_comment(
    Query(ListCommentQuery {
        user_id,
        parent_id,
        cursor,
        limit,
    }): Query<ListCommentQuery>,
) -> Result<impl IntoResponse, ServeError> {
    let (comments, users, total, has_more) = CommentService::serve()
        .list(ListCommentParams {
            user_id,
            parent_id,
            pagination: crate::core::request::CursorPagination { cursor, limit },
        })
        .await?;

    let comments = comments
        .into_iter()
        .map(|c| c.into())
        .collect::<Vec<CommentVO>>();
    let users = users.into_iter().map(|c| c.into()).collect::<Vec<UserVO>>();

    let res = ListCommentRespPayload {
        comments,
        users,
        pagination: crate::core::response::CursorPagination {
            total,
            cursor,
            limit,
            has_more,
        },
    };

    Ok(Json(res))
}

async fn get_comment_tree(
    Query(GetCommentTreeQuery {
        belong,
        roots_limit,
        leaves_limit,
        cursor,
    }): Query<GetCommentTreeQuery>,
) -> Result<impl IntoResponse, ServeError> {
    let comment_service = CommentService::serve();
    let (coments, users, total, has_more) = comment_service
        .list_as_tree(&belong, roots_limit, leaves_limit, cursor)
        .await?;
    let res = (
        coments
            .into_iter()
            .map(|c| c.into())
            .collect::<Vec<CommentVO>>(),
        users.into_iter().map(|c| c.into()).collect::<Vec<UserVO>>(),
    );

    let resp = GetCommentTreeRespPayload {
        comments: res.0,
        users: res.1,
        pagination: CursorPagination {
            cursor,
            limit: roots_limit,
            total,
            has_more,
        },
    };

    Ok(Json(resp))
}

async fn create_comment(
    Extension(user_info): Extension<&UserInfo>,
    Json(params): Json<CreateCommentParams>,
) -> Result<impl IntoResponse, ServeError> {
    let created = CommentService::serve()
        .create(user_info, params.payload)
        .await?;

    let resp_payload = CreateCommentRespPayload {
        payload: created.into(),
        user: User::clone(user_info).into(),
    };

    Ok(Json(resp_payload))
}

async fn update_comment(
    Extension(user_info): Extension<&UserInfo>,
    Path(id): Path<i64>,
    Json(params): Json<UpdateCommentParams>,
) -> Result<impl IntoResponse, ServeError> {
    let updated = CommentService::serve()
        .update(user_info, id, params.payload)
        .await?;

    let resp_payload = UpdateCommentRespPayload {
        payload: updated.into(),
    };

    Ok(Json(resp_payload))
}

async fn delete_comment(
    Extension(user_info): Extension<&UserInfo>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, ServeError> {
    let _res = CommentService::serve().remove(user_info, id).await?;

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
