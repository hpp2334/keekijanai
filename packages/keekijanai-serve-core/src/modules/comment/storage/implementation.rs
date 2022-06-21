use sea_query::{Alias, Expr, PostgresQueryBuilder};
use sqlx::{FromRow, Row};

use crate::{
    core::{
        build_cursor_list, db::get_pool, di::DIComponent, CursorPagination, ServeResult, Service,
    },
    helpers::{self, VecHelper},
    modules::{
        comment::model::{Comment, CommentCreate, CommentCursorId, CommentId, CommentUpdate},
        time::service::TimeService,
    },
};

use super::{CommentActiveModel, CommentModel, CommentModelColumns};

pub struct ListByParentRangeParams {
    pub id: Option<CommentId>,
    pub less: bool,
    pub limit: i32,
}

#[derive(Debug)]
pub struct CommentStorage {
    time_service: TimeService,
}

impl DIComponent for CommentStorage {
    fn build(container: &crate::core::di::DIContainer) -> Self {
        let time_service = container.resolve::<TimeService>();

        Self { time_service }
    }
}

impl CommentStorage {
    pub async fn get(&self, id: CommentId) -> ServeResult<Option<Comment>> {
        let comment = self.batch_get(vec![id]).await?.single()?;
        Ok(comment)
    }

    pub async fn batch_get(&self, ids: Vec<CommentId>) -> ServeResult<Vec<Comment>> {
        let ids: Vec<i64> = ids.into_iter().map(Into::into).collect();
        let pool = get_pool();
        let comments: Vec<CommentModel> = sqlx::query_as!(
            CommentModel,
            r#"
SELECT * from keekijanai_comment
    WHERE id IN (SELECT * FROM UNNEST($1::bigint[]))
            "#,
            ids.as_slice(),
        )
        .fetch_all(&pool)
        .await?;

        let comments = comments.into_iter().map(Into::into).collect();

        Ok(comments)
    }

    pub async fn list_all_by_parents(
        &self,
        belong: &str,
        parent_ids: &[CommentId],
    ) -> ServeResult<Vec<Comment>> {
        let parent_ids = parent_ids
            .to_vec()
            .into_iter()
            .map(|id| id.value())
            .collect::<Vec<i64>>();

        let sql = {
            let mut sql_builder = sea_query::Query::select();
            sql_builder.from(CommentModelColumns::Table);
            sql_builder.expr(Expr::cust("*"));
            sql_builder.and_where(Expr::col(CommentModelColumns::Belong).eq(belong));
            sql_builder.and_where(Expr::col(CommentModelColumns::ParentId).is_in(parent_ids));

            sql_builder.order_by(CommentModelColumns::CreatedTime, sea_query::Order::Desc);

            sql_builder.to_string(PostgresQueryBuilder)
        };

        let pool = get_pool();
        let comments: Vec<CommentModel> = sqlx::query_as(&sql).fetch_all(&pool).await?;
        let comments = comments
            .into_iter()
            .map(Into::into)
            .collect::<Vec<Comment>>();

        Ok(comments)
    }

    /// refactor cursor pagination query
    pub async fn list_by_parent(
        &self,
        belong: &str,
        parent_id: Option<CommentId>,
        ListByParentRangeParams { id, less, limit }: ListByParentRangeParams,
    ) -> ServeResult<CursorPagination<Comment, CommentCursorId>> {
        let parent_id: Option<i64> = parent_id.map(Into::into);
        let id: Option<i64> = id.map(Into::into);

        let sql = {
            let mut sql_builder = sea_query::Query::select();
            sql_builder.from(CommentModelColumns::Table);

            sql_builder.expr(Expr::cust("*"));
            sql_builder.expr_as(Expr::cust("COUNT(*)"), Alias::new("_cnt"));
            if (parent_id.is_some()) {
                sql_builder.and_where(Expr::col(CommentModelColumns::ParentId).eq(parent_id));
            } else {
                sql_builder.and_where(Expr::col(CommentModelColumns::ParentId).is_null());
            }

            sql_builder.and_where(Expr::col(CommentModelColumns::Belong).eq(belong));
            if let Some(id) = id {
                let col_id = Expr::col(CommentModelColumns::Id);
                sql_builder.and_where(if less { col_id.lt(id) } else { col_id.gt(id) });
            }

            sql_builder.group_by_col(CommentModelColumns::Id);

            sql_builder.limit(limit as u64 + 1);
            sql_builder.order_by(CommentModelColumns::CreatedTime, sea_query::Order::Desc);

            sql_builder.to_string(PostgresQueryBuilder)
        };

        let pool = get_pool();
        let mut res_rows = sqlx::query(&sql).fetch_all(&pool).await?;
        let has_more = res_rows.len() > limit as usize;
        if has_more {
            res_rows.pop();
        }

        let total = if res_rows.len() == 0 {
            0
        } else {
            // "_cnt" column
            res_rows[0].try_get::<i64, _>(0)?
        };
        let comments = res_rows
            .into_iter()
            .map(|row| FromRow::from_row(&row))
            .collect::<Result<Vec<CommentModel>, _>>()?;
        let comments: Vec<Comment> = comments.into_iter().map(Into::into).collect();
        let end_cursor = comments
            .last()
            .map(|comment| CommentCursorId::from_comment(comment));
        let cursor_comments =
            build_cursor_list(comments, |comment| CommentCursorId::from_comment(comment));

        Ok(CursorPagination {
            list: cursor_comments,
            has_more,
            left_total: total,
            end_cursor,
        })
    }

    pub async fn create(&self, comment: CommentCreate) -> ServeResult<Comment> {
        let mut comment: CommentActiveModel = comment.into();

        let now = self.time_service.now_timestamp().await?.as_millis() as i64;
        comment.created_time.set(now);
        comment.updated_time.set(now);

        let pool = get_pool();
        let (columns, values) = comment.get_set_columns();
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
        if comment.parent_id.is_set() {
            let _update_parent_result = sqlx::query!(
                r#"
UPDATE keekijanai_comment
SET child_count = (child_count + 1)
WHERE id = $1;
                "#,
                comment.parent_id.clone().unwrap(),
            )
            .execute(&mut transaction)
            .await?;
        }
        transaction.commit().await?;

        let result: Comment = create_result.into();

        Ok(result)
    }

    pub async fn update(&self, id: CommentId, comment: CommentUpdate) -> ServeResult<Comment> {
        let mut comment: CommentActiveModel = comment.into();

        let now = self.time_service.now_timestamp().await?.as_millis() as i64;
        comment.updated_time.set(now);

        let conn = get_pool();
        let entries = comment.get_set_entries();
        let sql = sea_query::Query::update()
            .table(CommentModelColumns::Table)
            .values(entries)
            .to_string(PostgresQueryBuilder);
        let sql = sql + " RETURNING *";
        let mut result = sqlx::query_as::<_, CommentModel>(sql.as_str())
            .fetch_all(&conn)
            .await?;

        if result.is_empty() {
            return Err(crate::core::error::comm_error::ResourceNotFound(
                "comment",
                id.to_string(),
            ))?;
        }
        let comment: Comment = result.pop().unwrap().into();

        Ok(comment)
    }

    pub async fn remove(&self, comment: Comment) -> ServeResult<()> {
        let id = comment.id.value();

        let pool = get_pool();

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
            return Err(crate::core::error::comm_error::ResourceNotFound(
                "comment",
                id.to_string(),
            ))?;
        }
        transaction.commit().await?;

        Ok(())
    }
}
