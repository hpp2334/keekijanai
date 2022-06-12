use crate::{
    core::{di::DIComponent, ServeResult},
    modules::auth::{
        error::{InsufficientPrivilege, OpType},
        UserInfo,
    },
};

use super::{
    domain::CommentDomainBuilder,
    model::{Comment, CommentUpdate},
};

pub struct CommentAuthorization {}

impl DIComponent for CommentAuthorization {
    fn build(container: &crate::core::di::DIContainer) -> Self {
        CommentAuthorization {}
    }
}

impl CommentAuthorization {
    pub async fn check_create(&self, user_info: &UserInfo) -> ServeResult<()> {
        if user_info.is_anonymous() {
            return Err(InsufficientPrivilege(
                user_info.id,
                "comment",
                OpType::CREATE,
                "".to_owned(),
            ))?;
        }
        Ok(())
    }
    pub async fn check_remove(&self, user_info: &UserInfo, comment: &Comment) -> ServeResult<()> {
        let comment_domain = CommentDomainBuilder::new().build(comment.clone()).await?;
        if comment_domain.like_own(user_info) {
            return Err(InsufficientPrivilege(
                user_info.id,
                "comment",
                OpType::DELETE,
                comment_domain.comment.id.to_string(),
            ))?;
        }
        Ok(())
    }
    pub async fn check_update(&self, user_info: &UserInfo, comment: &Comment) -> ServeResult<()> {
        let comment_domain = CommentDomainBuilder::new().build(comment.clone()).await?;
        if comment_domain.like_own(user_info) {
            return Err(InsufficientPrivilege(
                user_info.id,
                "comment",
                OpType::UPDATE,
                comment_domain.comment.id.to_string(),
            ))?;
        }
        Ok(())
    }
}
