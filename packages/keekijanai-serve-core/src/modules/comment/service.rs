use std::collections::HashMap;

use crate::modules::notification::enforcers::NotificationPayload;
use crate::modules::notification::NotificationService;
use crate::modules::user::model::User;
use crate::{
    core::{
        build_cursor_list,
        comm_error::ResourceNotFound,
        cursor_list_map_payloads,
        di::{DIComponent, DIContainer},
        CursorDirection, CursorPagination, ServeResult,
    },
    modules::auth::UserInfo,
};

use super::{
    authorization::CommentAuthorization,
    error::CommentNotFound,
    model::{Comment, CommentCreate, CommentCursorId, CommentId, CommentUpdate},
    storage::{CommentStorage, ListByParentRangeParams},
};

pub struct ListCommentCursorPagination {
    pub cursor_id: Option<CommentCursorId>,
    pub cursor_direction: CursorDirection,
    pub limit: i32,
}

pub struct CommentService {
    storage: CommentStorage,
    notification_service: NotificationService,
}

impl DIComponent for CommentService {
    fn build(container: &DIContainer) -> Self {
        let storage = container.resolve::<CommentStorage>();
        let notification_service = container.resolve::<NotificationService>();

        Self {
            storage,
            notification_service,
        }
    }
}

impl CommentService {
    pub async fn list_as_tree(
        &self,
        belong: &str,
        roots_limit: i32,
        leaves_limit: i32,
        cursor_id: Option<CommentCursorId>,
    ) -> ServeResult<CursorPagination<Comment, CommentCursorId>> {
        let CursorPagination {
            list: roots,
            has_more,
            left_total: total,
            end_cursor,
        } = self
            .storage
            .list_by_parent(
                belong,
                None,
                ListByParentRangeParams {
                    id: cursor_id.map(CommentCursorId::to_comment_id),
                    less: true,
                    limit: roots_limit,
                },
            )
            .await?;
        let roots = cursor_list_map_payloads(roots);
        let mut roots: Vec<Comment> = roots.into_iter().map(Into::into).collect();

        let root_ids = roots.iter().map(|v| v.id).collect::<Vec<CommentId>>();
        let leaves = self.storage.list_all_by_parents(belong, &root_ids).await?;
        let leaves: Vec<Comment> = leaves.into_iter().map(Into::into).collect();

        let mut leaves_count: HashMap<CommentId, i32> = HashMap::new();
        let mut leaves = leaves
            .into_iter()
            .filter(|comment| {
                let entry = leaves_count.entry(comment.parent_id.unwrap()).or_insert(0);
                if *entry < leaves_limit {
                    *entry += 1;
                    return true;
                }
                return false;
            })
            .collect();

        let mut comments = Vec::new();
        comments.append(&mut roots);
        comments.append(&mut leaves);

        Ok(CursorPagination {
            list: build_cursor_list(comments, |comment| CommentCursorId::from_comment(comment)),
            has_more,
            left_total: total,
            end_cursor,
        })
    }

    pub async fn list(
        &self,
        belong: &str,
        parent_id: Option<CommentId>,
        pagination: ListCommentCursorPagination,
    ) -> ServeResult<CursorPagination<Comment, CommentCursorId>> {
        let comments = self
            .storage
            .list_by_parent(
                belong,
                parent_id,
                ListByParentRangeParams {
                    id: pagination.cursor_id.map(CommentCursorId::to_comment_id),
                    less: pagination.cursor_direction == CursorDirection::Forward,
                    limit: pagination.limit,
                },
            )
            .await?;

        Ok(comments)
    }

    pub async fn create(
        &self,
        user_info: &UserInfo,
        comment: CommentCreate,
    ) -> ServeResult<Comment> {
        let authorization = DIContainer::get().resolve::<CommentAuthorization>();
        authorization.check_create(user_info).await?;

        let comment = self.storage.create(comment).await?;

        self.notification_service
            .notify(user_info, "create comment", &comment.content);

        Ok(comment)
    }

    pub async fn update(
        &self,
        user_info: &UserInfo,
        id: CommentId,
        comment_update: CommentUpdate,
    ) -> ServeResult<Comment> {
        let comment = self.get(id).await?;
        let authorization = DIContainer::get().resolve::<CommentAuthorization>();
        authorization.check_update(user_info, &comment).await?;

        let comment = self.storage.update(id, comment_update).await?;

        Ok(comment)
    }

    pub async fn remove(&self, user_info: &UserInfo, id: CommentId) -> ServeResult<()> {
        let comment = self.get(id).await?;
        let authorization = DIContainer::get().resolve::<CommentAuthorization>();
        authorization.check_remove(user_info, &comment).await?;

        self.storage.remove(comment).await?;

        Ok(())
    }

    pub async fn get(&self, id: CommentId) -> ServeResult<Comment> {
        let comment = self.storage.get(id).await?.ok_or(CommentNotFound(id))?;
        Ok(comment)
    }
    pub async fn batch_get(&self, ids: Vec<CommentId>) -> ServeResult<Vec<Comment>> {
        let comments = self.storage.batch_get(ids).await?;
        Ok(comments)
    }
}
