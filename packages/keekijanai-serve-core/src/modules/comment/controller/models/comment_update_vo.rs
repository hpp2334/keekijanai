use std::sync::Arc;

use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::modules::{
    comment::model::{CommentCreate, CommentId, CommentUpdate},
    user::model::User,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommentUpdateVO {
    pub content: String,
}

#[derive(Debug, Builder)]
pub struct CommentUpdateVOMapper {}

impl CommentUpdateVOMapper {
    pub fn map(&self, vo: CommentUpdateVO) -> CommentUpdate {
        CommentUpdate {
            content: vo.content,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommentCreateVO {
    pub belong: String,
    pub content: String,
    pub reference_id: Option<i64>,
    pub parent_id: Option<i64>,
}

#[derive(Debug, Builder)]
pub struct CommentCreateVOMapper {
    user: Arc<User>,
}

impl CommentCreateVOMapper {
    pub fn map(&self, vo: CommentCreateVO) -> CommentCreate {
        CommentCreate {
            belong: vo.belong,
            content: vo.content,
            user_id: self.user.id,
            reference_id: vo.reference_id.map(Into::into),
            parent_id: vo.parent_id.map(Into::into),
        }
    }
}
