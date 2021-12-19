use crate::core::KeekijanaiError;
use hyper::{rt::Executor, StatusCode};
use sea_query::{Alias, Expr, PostgresQueryBuilder, SelectStatement};
use serde::Deserialize;

use crate::{
    core::{db::get_pool, Service},
    modules::comment::model::{CommentModel, CommentModelColumns}, helpers,
};

use super::model::{Comment, CommentActiveModel};

#[derive(Deserialize, Clone)]
pub struct ListCommentParams {
    pub user_id: Option<i64>,
    pub parent_id: Option<i64>,
    pub pagination: crate::core::request::CursorPagination<i64>,
}

pub struct CommentService;

impl Service for CommentService {
    fn serve() -> Self {
        Self {}
    }

    fn init() {}
}

impl CommentService {
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

    pub async fn list(
        &self,
        params: ListCommentParams,
    ) -> anyhow::Result<(Vec<Comment>, i32)> {
        let conn = get_pool().await?;

        fn build_sql<'a, P>(params: &ListCommentParams, pre_build: P) -> String
        where
            P: Fn(&mut SelectStatement) -> &mut SelectStatement,
        {
            let mut sql_builder = sea_query::Query::select();
            let sql = sql_builder.from(CommentModelColumns::Table);
            let mut sql = pre_build(sql);
            if params.user_id.is_some() {
                sql = sql.and_where(
                    Expr::col(CommentModelColumns::UserId).eq(params.user_id.clone().unwrap()),
                );
            }
            if params.parent_id.is_some() {
                sql = sql.and_where(
                    Expr::col(CommentModelColumns::ParentId).eq(params.parent_id.clone().unwrap()),
                );
            }
            if params.pagination.cursor.is_some() {
                sql = sql.and_where(
                    Expr::col(CommentModelColumns::Id).lt(params
                        .pagination
                        .cursor
                        .clone()
                        .unwrap()),
                );
            }

            sql = sql
                .limit(params.pagination.limit.clone() as u64)
                .order_by(CommentModelColumns::Id, sea_query::Order::Desc);

            sql.to_string(PostgresQueryBuilder)
        }

        let query_sql = build_sql(&params, |sql| sql.expr(Expr::value("*")));
        let count_sql = build_sql(&params, |sql| {
            sql.expr_as(Expr::val("*").count(), Alias::new("cnt"))
        });

        let res_comments = sqlx::query_as::<_, CommentModel>(query_sql.as_str())
            .fetch_all(&conn)
            .await?;
        let res_comments = res_comments.into_iter().map(|comment| comment.into()).collect::<Vec<Comment>>();

        let res_count: (i32,) = sqlx::query_as(count_sql.as_str()).fetch_one(&conn).await?;

        return Ok((res_comments, res_count.0));
    }

    pub async fn create(&mut self, payload: CommentActiveModel) -> anyhow::Result<Comment> {
        let pool = get_pool().await?;
        let (columns, values) = payload.get_set_columns();
        let create_sql = sea_query::Query::insert()
            .into_table(CommentModelColumns::Table)
            .columns(columns)
            .values_panic(values)
            .to_string(PostgresQueryBuilder);
        let create_sql = create_sql + " RETURNING *";

        let mut transaction = pool.begin().await?;

        let create_result = sqlx::query_as::<_, CommentModel>(create_sql.as_str())
            .fetch_one(&mut transaction)
            .await?;
        if payload.parent_id.is_set() {
            let _update_parent_result = sqlx::query!(
                r#"
UPDATE keekijanai_comment
SET child_count = (child_count + 1)
WHERE id = $1;
                "#,
                payload.parent_id.clone().unwrap(),
            )
            .execute(&mut transaction)
            .await?;
        }
        transaction.commit().await?;

        let result: Comment = create_result.into();

        Ok(result)
    }

    pub async fn update(
        &mut self,
        id: i64,
        mut payload: CommentActiveModel,
    ) -> anyhow::Result<Comment> {
        payload.id = id.into();
        payload.reference_id.unset();
        payload.parent_id.unset();

        let conn = get_pool().await?;
        let entries = payload.get_set_entries();
        let sql = sea_query::Query::update()
            .table(CommentModelColumns::Table)
            .values(entries)
            .to_string(PostgresQueryBuilder);
        let sql = sql + " RETURNING *";
        let mut result = sqlx::query_as::<_, CommentModel>(sql.as_str())
            .fetch_all(&conn)
            .await?;

        if result.is_empty() {
            return Err(KeekijanaiError::Client {
                status: StatusCode::NOT_FOUND,
                message: format!("Not found for comment {}", id),
            }
            .into());
        }
        let comment: Comment = result.pop().unwrap().into();

        Ok(comment)
    }

    pub async fn remove(&mut self, id: i64) -> anyhow::Result<()> {
        let pool = get_pool().await?;

        let mut transaction = pool.begin().await?;

        sqlx::query!(
            r#"
UPDATE keekijanai_comment
SET child_count = (child_count - 1)
WHERE id = ANY (
    SELECT parent_id FROM keekijanai_comment
      WHERE id = $1
)
            "#,
            id
        )
        .execute(&mut transaction)
        .await?;

        let res: u64 = sqlx::query!(
            r#"
DELETE FROM keekijanai_comment 
WHERE
  id = $1
            "#,
            id
        )
        .execute(&mut transaction)
        .await?
        .rows_affected();

        if res == 0 {
            return Err(KeekijanaiError::Client {
                status: StatusCode::NOT_FOUND,
                message: format!("Not found comment {}", id),
            }
            .into());
        }

        Ok(())
    }
}
