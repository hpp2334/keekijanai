use std::fmt::Display;

use super::storage::{CommentActiveModel, CommentModel};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct CommentId(i64);

impl CommentId {
    pub fn new(v: i64) -> Self {
        CommentId(v)
    }
    pub fn value(&self) -> i64 {
        self.clone().into()
    }
}
impl Display for CommentId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}
impl From<CommentId> for i64 {
    fn from(id: CommentId) -> Self {
        id.0
    }
}
impl From<i64> for CommentId {
    fn from(id: i64) -> Self {
        CommentId::new(id)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CommentCursorId(CommentId);

impl CommentCursorId {
    pub fn from_comment(comment: &Comment) -> CommentCursorId {
        CommentCursorId(comment.id)
    }
    pub fn from_comment_id(comment_id: CommentId) -> CommentCursorId {
        CommentCursorId(comment_id)
    }
    pub fn from_primitive(id: i64) -> CommentCursorId {
        Self::from_comment_id(CommentId(id))
    }
    pub fn to_comment_id(self) -> CommentId {
        self.0
    }
    pub fn primitive_value(&self) -> i64 {
        self.0.value()
    }
}

#[derive(Debug, Clone)]
pub struct Comment {
    pub id: CommentId,
    pub belong: String,
    pub user_id: i64,
    pub content: String,
    pub reference_id: Option<CommentId>,
    pub parent_id: Option<CommentId>,
    pub child_count: i32,

    pub created_time: i64,
    pub updated_time: i64,
}

impl From<CommentModel> for Comment {
    fn from(comment: CommentModel) -> Self {
        Self {
            id: comment.id.into(),
            belong: comment.belong,
            user_id: comment.user_id,
            content: comment.content,
            reference_id: comment.reference_id.map(Into::into),
            parent_id: comment.parent_id.map(Into::into),
            child_count: comment.child_count,
            created_time: comment.created_time,
            updated_time: comment.updated_time,
        }
    }
}

impl From<Comment> for CommentModel {
    fn from(comment: Comment) -> Self {
        Self {
            id: comment.id.into(),
            belong: comment.belong,
            user_id: comment.user_id,
            content: comment.content,
            reference_id: comment.reference_id.map(Into::into),
            parent_id: comment.parent_id.map(Into::into),
            child_count: comment.child_count,
            created_time: comment.created_time,
            updated_time: comment.updated_time,
        }
    }
}

#[derive(Debug, Clone)]
pub struct CommentCreate {
    pub belong: String,
    pub content: String,
    pub user_id: i64,
    pub reference_id: Option<CommentId>,
    pub parent_id: Option<CommentId>,
}

impl From<CommentCreate> for CommentActiveModel {
    fn from(comment: CommentCreate) -> Self {
        Self {
            belong: comment.belong.into(),
            user_id: comment.user_id.into(),
            content: comment.content.into(),
            reference_id: comment.reference_id.into(),
            parent_id: comment.parent_id.into(),
            ..Default::default()
        }
    }
}

#[derive(Debug, Clone)]
pub struct CommentUpdate {
    pub content: String,
}

impl From<CommentUpdate> for CommentActiveModel {
    fn from(comment: CommentUpdate) -> Self {
        Self {
            content: comment.content.into(),
            ..Default::default()
        }
    }
}
