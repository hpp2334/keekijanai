

use poem_openapi::Object;
use sea_query::{Iden, Value};
use serde::{Deserialize, Serialize};

// id INTEGER PRIMARY KEY AUTOINCREMENT,
// scope varchar(150) NOT NULL,
// user_id varchar(50) NOT NULL,
// content text NOT NULL,
// plain_text text NOT NULL,
// c_time bigint NOT NULL,
// reference_id bigint,
// parent_id bigint,
// child_counts int DEFAULT 0

use crate::core::db::ActiveColumn;

#[derive(Iden)]
pub enum KeekijanaiComment {
    Table,
    Id,
    Belong,
    UserId,
    Content,
    PlainText,
    ReferenceId,
    ParentId,
    ChildCount,
    CreatedTime,
    UpdatedTime,
}

pub type CommentModelColumns = KeekijanaiComment;

#[derive(sqlx::FromRow, Debug, Clone, Serialize)]
pub struct CommentModel {
    pub id: i64,
    pub belong: String,
    pub user_id: i64,
    pub content: String,
    pub reference_id: Option<i64>,
    pub parent_id: i64,
    pub child_count: i32,

    pub created_time: i64,
    pub updated_time: i64,
}

#[derive(Default, Debug, Clone, Object)]
pub struct CommentActiveModel {
    pub id: ActiveColumn<i64>,
    pub belong: ActiveColumn<String>,
    pub user_id: ActiveColumn<i64>,
    pub content: ActiveColumn<String>,
    pub reference_id: ActiveColumn<i64>,
    pub parent_id: ActiveColumn<i64>,
    pub child_count: ActiveColumn<i32>,

    pub created_time: ActiveColumn<i64>,
    pub updated_time: ActiveColumn<i64>,
}

#[derive(Debug, Object)]
pub struct Comment {
    pub id: i64,
    pub belong: String,
    pub user_id: i64,
    pub content: String,
    pub reference_id: Option<i64>,
    pub parent_id: i64,
    pub child_count: i32,

    pub created_time: i64,
    pub updated_time: i64,
}

impl From<CommentModel> for Comment {
    fn from(comment: CommentModel) -> Self {
        Self {
            id: comment.id,
            belong: comment.belong,
            user_id: comment.user_id,
            content: comment.content,
            reference_id: comment.reference_id,
            parent_id: comment.parent_id,
            child_count: comment.child_count,
            created_time: comment.created_time,
            updated_time: comment.updated_time,
        }
    }
}

impl From<Comment> for CommentModel {
    fn from(comment: Comment) -> Self {
        Self {
            id: comment.id,
            belong: comment.belong,
            user_id: comment.user_id,
            content: comment.content,
            reference_id: comment.reference_id,
            parent_id: comment.parent_id,
            child_count: comment.child_count,
            created_time: comment.created_time,
            updated_time: comment.updated_time,
        }
    }
}

impl From<Comment> for CommentActiveModel {
    fn from(comment: Comment) -> Self {
        Self {
            id: comment.id.into(),
            belong: comment.belong.into(),
            user_id: comment.user_id.into(),
            content: comment.content.into(),
            reference_id: comment.reference_id.into(),
            parent_id: comment.parent_id.into(),
            child_count: comment.child_count.into(),
            created_time: comment.created_time.into(),
            updated_time: comment.updated_time.into(),
        }
    }
}

impl CommentActiveModel {
    pub fn get_set_columns(&self) -> (Vec<KeekijanaiComment>, Vec<Value>) {
        let mut columns = vec![];
        let mut values: Vec<Value> = vec![];

        if self.id.is_set() {
            columns.push(CommentModelColumns::Id);
            values.push(self.id.clone().unwrap().into());
        }
        if self.belong.is_set() {
            columns.push(CommentModelColumns::Belong);
            values.push(self.belong.clone().unwrap().into());
        }
        if self.user_id.is_set() {
            columns.push(CommentModelColumns::UserId);
            values.push(self.user_id.clone().unwrap().into());
        }
        if self.content.is_set() {
            columns.push(CommentModelColumns::Content);
            values.push(self.content.clone().unwrap().into());
        }
        if self.reference_id.is_set() {
            columns.push(CommentModelColumns::ReferenceId);
            values.push(self.reference_id.clone().unwrap().into());
        }
        if self.parent_id.is_set() {
            columns.push(CommentModelColumns::ParentId);
            values.push(self.parent_id.clone().unwrap().into());
        }
        if self.child_count.is_set() {
            columns.push(CommentModelColumns::ChildCount);
            values.push(self.child_count.clone().unwrap().into());
        }
        if self.created_time.is_set() {
            columns.push(CommentModelColumns::CreatedTime);
            values.push(self.created_time.clone().unwrap().into());
        }
        if self.updated_time.is_set() {
            columns.push(CommentModelColumns::UpdatedTime);
            values.push(self.updated_time.clone().unwrap().into());
        }

        return (columns, values);
    }

    pub fn get_set_entries(&self) -> Vec<(CommentModelColumns, Value)> {
        let (mut columns, mut values) = self.get_set_columns();
        let mut v = vec![];
        let n = columns.len();
        for _i in 0..n {
            v.push((columns.pop().unwrap(), values.pop().unwrap()));
        }
        return v;
    }
}
