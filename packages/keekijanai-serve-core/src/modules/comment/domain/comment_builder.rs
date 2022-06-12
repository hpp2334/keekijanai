use std::collections::HashMap;

use crate::{
    core::di::DIContainer,
    helpers::VecHelper,
    modules::{
        comment::{error::CommentNotFound, model::Comment, service::CommentService},
        user::service::UserService,
        user::{error::UserNotFound, model::User},
    },
};

use super::CommentDomain;

#[derive(Debug)]
pub struct CommentDomainBuilder {
    comment_service: CommentService,
    user_service: UserService,
}

impl CommentDomainBuilder {
    pub fn new() -> Self {
        let comment_service = DIContainer::get().resolve::<CommentService>();
        let user_service = DIContainer::get().resolve::<UserService>();
        Self {
            comment_service,
            user_service,
        }
    }

    pub async fn build(&self, comment: Comment) -> anyhow::Result<CommentDomain> {
        let comment = self
            .batch_build_impl(vec![comment])
            .await?
            .strict_single()?;
        Ok(comment)
    }

    pub async fn batch_build(&self, comments: Vec<Comment>) -> anyhow::Result<Vec<CommentDomain>> {
        self.batch_build_impl(comments).await
    }

    async fn batch_build_impl(&self, comments: Vec<Comment>) -> anyhow::Result<Vec<CommentDomain>> {
        let owner_map = self.build_user_map_by_comments(&comments).await?;

        let reference_ids = comments
            .iter()
            .map(|comment| comment.reference_id)
            .filter(|id| id.is_some())
            .map(|id| id.unwrap())
            .collect();
        let references = self.comment_service.batch_get(reference_ids).await?;
        let reference_domain_map = self
            .batch_build_reference_impl(references)
            .await?
            .into_iter()
            .map(|domain| (domain.comment.id, domain))
            .collect::<HashMap<_, _>>();

        let comment_domains = comments
            .into_iter()
            .map(|comment| {
                let owner = owner_map
                    .get(&comment.user_id)
                    .map(Clone::clone)
                    .ok_or(UserNotFound(comment.user_id))?;
                let reference = if let Some(reference_id) = comment.reference_id {
                    let reference = reference_domain_map
                        .get(&reference_id)
                        .map(|comment_domain| Box::new(comment_domain.clone()))
                        .ok_or(CommentNotFound(reference_id))?;
                    Some(reference)
                } else {
                    None
                };

                Ok(CommentDomain {
                    comment,
                    owner,
                    reference,
                    reference_loaded: true,
                })
            })
            .collect::<anyhow::Result<Vec<CommentDomain>>>()?;

        Ok(comment_domains)
    }

    async fn batch_build_reference_impl(
        &self,
        comments: Vec<Comment>,
    ) -> anyhow::Result<Vec<CommentDomain>> {
        let owner_map = self.build_user_map_by_comments(&comments).await?;
        let comment_domains = comments
            .into_iter()
            .map(|comment| {
                let owner = owner_map
                    .get(&comment.user_id)
                    .map(Clone::clone)
                    .ok_or(UserNotFound(comment.user_id))?;

                Ok(CommentDomain {
                    comment,
                    owner,
                    reference: None,
                    reference_loaded: false,
                })
            })
            .collect::<anyhow::Result<Vec<CommentDomain>>>()?;

        Ok(comment_domains)
    }

    async fn build_user_map_by_comments(
        &self,
        comments: &Vec<Comment>,
    ) -> anyhow::Result<HashMap<i64, User>> {
        let user_ids = comments.iter().map(|comment| comment.user_id).collect();
        let user_map = self
            .user_service
            .batch_get(user_ids)
            .await?
            .into_iter()
            .map(|user| (user.id, user))
            .collect::<HashMap<_, _>>();
        Ok(user_map)
    }
}
