use poem::web;
use poem_openapi::{
    param,
    payload::{Json, PlainText},
    Object, OpenApi,
};
use serde::Serialize;

use crate::{
    core::{response::CursorPagination, ApiTags, Service},
    modules::{
        auth::UserInfo,
        user::model::{User, UserVO},
    },
};

use super::{
    model::{Comment, CommentActiveModel, CommentVO},
    service::{CommentService, ListCommentParams},
};

#[derive(Object, Clone)]
struct CreateCommentParams {
    pub payload: CommentActiveModel,
}

#[derive(Object)]
struct CreateCommentRespPayload {
    pub payload: CommentVO,
    pub user: UserVO,
}

#[derive(Object, Clone)]
struct UpdateCommentParams {
    pub payload: CommentActiveModel,
}

#[derive(Object, Debug)]
struct UpdateCommentRespPayload {
    pub payload: Comment,
}

#[derive(Debug, Object)]
struct GetCommentTreeRespPayload {
    pub comments: Vec<CommentVO>,
    pub users: Vec<UserVO>,
    pub pagination: CursorPagination<i64>,
}

#[derive(Debug, Object)]
struct ListCommentRespPayload {
    pub comments: Vec<CommentVO>,
    pub users: Vec<UserVO>,
    pub pagination: CursorPagination<i64>,
}

pub struct CommentController;

#[OpenApi(prefix_path = "/keekijanai/comment", tag = "ApiTags::Comment")]
impl CommentController {
    #[oai(path = "/", method = "get")]
    async fn list_comment(
        &self,
        user_id: param::Query<Option<i64>>,
        parent_id: param::Query<Option<i64>>,
        cursor: param::Query<Option<i64>>,
        limit: param::Query<i32>,
    ) -> poem::Result<Json<ListCommentRespPayload>> {
        let (comments, users, total, has_more) = CommentService::serve()
            .list(ListCommentParams {
                user_id: *user_id,
                parent_id: *parent_id,
                pagination: crate::core::request::CursorPagination {
                    cursor: *cursor,
                    limit: *limit,
                },
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
                total: total,
                cursor: *cursor,
                limit: *limit,
                has_more,
            },
        };

        Ok(Json(res))
    }

    #[oai(path = "/tree", method = "get")]
    async fn get_comment_tree(
        &self,
        belong: param::Query<String>,
        roots_limit: param::Query<i32>,
        leaves_limit: param::Query<i32>,
        cursor: param::Query<Option<i64>>,
    ) -> poem::Result<Json<GetCommentTreeRespPayload>> {
        let comment_service = CommentService::serve();
        let (coments, users, total, has_more) = comment_service
            .list_as_tree(&*belong, *roots_limit, *leaves_limit, *cursor)
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
                cursor: *cursor,
                limit: *roots_limit,
                total: total,
                has_more,
            },
        };

        Ok(Json(resp))
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
            user: User::clone(user_info).into(),
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
