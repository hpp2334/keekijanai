use crate::{
    core::{db::get_pool, ServeResult},
    helpers,
    modules::comment::model::CommentModel,
};

use super::model::Comment;

pub struct CommentData;

impl CommentData {
    pub fn new() -> Self {
        Self
    }

    pub async fn get(&self, id: i64) -> ServeResult<Option<Comment>> {
        let pool = get_pool();
        let comments = sqlx::query_as!(
            CommentModel,
            r#"
SELECT * from keekijanai_comment
  WHERE id = $1;
            "#,
            id,
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|comment| comment.into())
        .collect::<Vec<Comment>>();

        if comments.len() == 0 {
            return Ok(None);
        }

        let comment = helpers::db::single(comments)?;
        Ok(Some(comment))
    }
}
