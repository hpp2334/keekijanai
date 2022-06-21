use std::marker::PhantomData;

use derive_builder::Builder;
use serde::Serialize;

use crate::{
    core::{build_cursor_list, CursorPagination, CursorPaginationListItem, ServeResult},
    helpers::VecHelper,
    modules::{
        comment::{
            domain::{CommentDomain, CommentDomainBuilder},
            model::{Comment, CommentCursorId},
        },
        user::model::{User, UserVO},
    },
};

#[derive(Debug, Clone, Serialize)]
pub struct ReferenceCommentVO {
    pub id: i64,
    pub belong: String,
    pub user: UserVO,
    pub content: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CommentVO {
    pub id: i64,
    pub belong: String,
    pub user: UserVO,
    pub content: String,
    pub reference_comment: Option<ReferenceCommentVO>,
    pub parent_id: Option<i64>,
    pub child_count: i32,
    pub can_remove: bool,

    pub created_time: i64,
    pub updated_time: i64,
}

#[derive(Debug, Builder)]
pub struct ReferenceCommentVOMapper {}
impl ReferenceCommentVOMapper {
    pub fn map(&self, comment_domain: &CommentDomain) -> anyhow::Result<ReferenceCommentVO> {
        let user_vo: UserVO = comment_domain.owner.clone().into();
        let comment = comment_domain.comment.clone();
        Ok(ReferenceCommentVO {
            id: comment.id.into(),
            belong: comment.belong,
            user: user_vo,
            content: comment.content,
        })
    }
}

#[derive(Debug, Builder)]
pub struct CommentVOMapper {}

impl CommentVOMapper {
    pub async fn map_from_cursor_comments(
        &self,
        cursor_comments: CursorPagination<Comment, CommentCursorId>,
    ) -> ServeResult<CursorPagination<CommentVO, i64>> {
        let vos = self
            .map_from_comments(cursor_comments.get_payloads())
            .await?;
        let cursor_comments = CursorPagination {
            list: build_cursor_list(vos, |vo| vo.id),
            end_cursor: cursor_comments
                .end_cursor
                .map(|cursor| cursor.primitive_value()),
            has_more: cursor_comments.has_more,
            left_total: cursor_comments.left_total,
        };
        Ok(cursor_comments)
    }

    pub async fn map_from_cursor_comment(
        &self,
        comment: Comment,
        cursor: CommentCursorId,
    ) -> ServeResult<CursorPaginationListItem<CommentVO, i64>> {
        let comment_vec = [comment].to_vec();
        let vo = self.map_from_comments(comment_vec).await?.strict_single()?;

        Ok(CursorPaginationListItem {
            payload: vo,
            cursor: cursor.primitive_value(),
        })
    }

    pub async fn map_from_comments(&self, comments: Vec<Comment>) -> ServeResult<Vec<CommentVO>> {
        let comment_domains = CommentDomainBuilder::new().batch_build(comments).await?;
        self.map_from_domains(comment_domains)
    }

    pub fn map_from_domains(
        &self,
        comment_domains: Vec<CommentDomain>,
    ) -> ServeResult<Vec<CommentVO>> {
        let vos = comment_domains
            .into_iter()
            .map(|comment_domain| {
                let user_vo: UserVO = comment_domain.owner.clone().into();

                let can_remove = comment_domain.like_own(&comment_domain.owner);
                let reference = comment_domain.get_reference_comment_ref().map(|reference| {
                    let mapper = ReferenceCommentVOMapperBuilder::default().build()?;
                    let vo_res = mapper.map(reference);
                    vo_res
                });
                let reference = reference.transpose()?;
                let comment = comment_domain.comment.clone();

                Ok(CommentVO {
                    id: comment.id.into(),
                    belong: comment.belong,
                    content: comment.content,
                    parent_id: comment.parent_id.map(Into::into),
                    child_count: comment.child_count,
                    created_time: comment.created_time,
                    updated_time: comment.updated_time,
                    user: user_vo,
                    reference_comment: reference,
                    can_remove,
                })
            })
            .collect::<ServeResult<Vec<_>>>()?;
        Ok(vos)
    }
}
