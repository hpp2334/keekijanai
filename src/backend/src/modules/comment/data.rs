use crate::{helpers, modules::comment::model::CommentModel, core::db::get_pool};

use super::model::Comment;

pub struct CommentData;

impl CommentData {
    pub fn new() -> Self {
        Self
    }

    pub async fn get(&self, id: i64) -> anyhow::Result<Comment> {
        let pool = get_pool().await?;
        let comments = sqlx::query_as!(CommentModel,
            r#"
SELECT * from keekijanai_comment
  WHERE id = $1;
            "#,
            id,
        ).fetch_all(&pool)
        .await?
        .into_iter()
        .map(|comment| { comment.into() })
        .collect::<Vec<Comment>>();

        let comment = helpers::db::single(comments)?;
        Ok(comment)
    }
}
