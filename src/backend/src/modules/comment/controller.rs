use poem::web;
use poem_openapi::{
    param,
    payload::{Json, PlainText},
    Object, OpenApi,
};
use serde::Serialize;

use crate::{
    core::{ApiTags, Service},
    modules::auth::UserInfo,
};

use super::{
    model::{Comment, CommentActiveModel},
    service::{CommentService, ListCommentParams},
};

#[derive(Object, Clone)]
struct CreateCommentParams {
    pub payload: CommentActiveModel,
}

#[derive(Object)]
struct CreateCommentRespPayload {
    pub payload: Comment,
}

#[derive(Object, Clone)]
struct UpdateCommentParams {
    pub payload: CommentActiveModel,
}

#[derive(Object, Debug)]
struct UpdateCommentRespPayload {
    pub payload: Comment,
}

pub struct CommentController;

type ListCommentResult = crate::core::response::CursorListData<Comment, i64>;

#[OpenApi(prefix_path = "/keekijanai/comment", tag = "ApiTags::Comment")]
impl CommentController {
    #[oai(path = "/", method = "get")]
    async fn list_comment(
        &self,
        user_id: param::Query<Option<i64>>,
        parent_id: param::Query<Option<i64>>,
        cursor: param::Query<Option<i64>>,
        limit: param::Query<i32>,
    ) -> poem::Result<Json<ListCommentResult>> {
        let (comments, total) = CommentService::serve()
            .list(ListCommentParams {
                user_id: *user_id,
                parent_id: *parent_id,
                pagination: crate::core::request::CursorPagination {
                    cursor: *cursor,
                    limit: *limit,
                },
            })
            .await?;

        let res = crate::core::response::CursorListData {
            data: comments,
            pagination: crate::core::response::CursorPagination {
                total,
                cursor: *cursor,
                limit: *limit,
            },
        };

        Ok(Json(res))
    }

    #[oai(path = "/", method = "post")]
    async fn create_comment(
        &self,
        user_info: web::Data<&UserInfo>,
        params: Json<CreateCommentParams>,
    ) -> poem::Result<Json<CreateCommentRespPayload>> {
        let params = (*params).clone();
        let user_info = *user_info;

        let created = CommentService::serve()
            .create(user_info, params.payload)
            .await?;

        let resp_payload = CreateCommentRespPayload {
            payload: created.into(),
        };

        Ok(Json(resp_payload))
    }

    #[oai(path = "/:id", method = "put")]
    async fn update_comment(
        &self,
        user_info: web::Data<&UserInfo>,
        id: param::Path<i64>,
        params: Json<UpdateCommentParams>,
    ) -> poem::Result<Json<UpdateCommentRespPayload>> {
        let params = (*params).clone();
        let id = (*id).clone();
        let user_info = *user_info;

        let updated = CommentService::serve()
            .update(user_info, id, params.payload)
            .await?;

        let resp_payload = UpdateCommentRespPayload {
            payload: updated.into(),
        };

        Ok(Json(resp_payload))
    }

    #[oai(path = "/:id", method = "delete")]
    async fn delete_comment(
        &self,
        user_info: web::Data<&UserInfo>,
        id: param::Path<i64>,
    ) -> poem::Result<PlainText<&'static str>> {
        let id = (*id).clone();
        let user_info = *user_info;

        let _res = CommentService::serve().remove(user_info, id).await?;

        Ok(PlainText(""))
    }
}
