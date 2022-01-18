use std::collections::{HashMap};

use sea_query::{Alias, Expr, PostgresQueryBuilder};
use serde::Deserialize;

use crate::{
    core::{db::get_pool, Service},
    modules::{
        auth::UserInfo,
        comment::model::{CommentModel, CommentModelColumns},
        time::service::TimeService,
        user::{
            error::OpType,
            model::{User, UserRole},
            service::UserService,
        },
    },
};

use super::{
    data::CommentData,
    model::{Comment, CommentActiveModel},
};
use crate::modules::user::error as user_error;

#[derive(Deserialize, Clone)]
pub struct ListCommentParams {
    pub user_id: Option<i64>,
    pub parent_id: Option<i64>,
    pub pagination: crate::core::request::CursorPagination<i64>,
}

const NO_PARENT_ID: i64 = -1;

pub struct CommentService;

impl Service for CommentService {
    fn serve() -> Self {
        Self {}
    }

    fn init() {}
}

impl CommentService {
    pub async fn list_as_tree(
        &self,
        roots_limit: i32,
        leaves_limit: i32,
        cursor: Option<i64>,
    ) -> anyhow::Result<(Vec<Comment>, Vec<User>, i64, bool)> {
        let pool = get_pool();

        let (total,): (i64,) = sqlx::query_as(
            r#"
SELECT COUNT(*)
FROM keekijanai_comment
            "#,
        )
        .fetch_one(&pool)
        .await?;
        let roots = if cursor.is_some() {
            sqlx::query_as!(
                CommentModel,
                r#"
SELECT *
FROM keekijanai_comment
WHERE id < $1
  AND parent_id = $2
ORDER BY id DESC
LIMIT $3
                "#,
                cursor.unwrap(),
                NO_PARENT_ID,
                (roots_limit + 1) as i64,
            )
            .fetch_all(&pool)
            .await?
        } else {
            sqlx::query_as!(
                CommentModel,
                r#"
SELECT *
FROM keekijanai_comment
WHERE parent_id = $1
ORDER BY id DESC
LIMIT $2
                "#,
                NO_PARENT_ID,
                (roots_limit + 1) as i64,
            )
            .fetch_all(&pool)
            .await?
        };
        let mut roots = roots
            .into_iter()
            .map(|c| c.into())
            .collect::<Vec<Comment>>();

        let has_more = roots.len() > roots_limit as usize;
        if has_more {
            roots.pop();
        }

        let root_ids = roots.iter().map(|v| v.id).collect::<Vec<i64>>();

        let leaves = sqlx::query_as!(
            CommentModel,
            r#"
SELECT *
FROM keekijanai_comment
WHERE parent_id IN (SELECT * FROM UNNEST($1::bigint[]))
ORDER BY id DESC
            "#,
            root_ids.as_slice()
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|c| c.into())
        .collect::<Vec<Comment>>();

        let mut leaves_count: HashMap<i64, i32> = HashMap::new();
        let mut leaves = leaves
            .into_iter()
            .filter(|comment| {
                let entry = leaves_count.entry(comment.parent_id).or_insert(0);
                if *entry < leaves_limit {
                    *entry += 1;
                    return true;
                }
                return false;
            })
            .collect();

        roots.append(&mut leaves);

        let user_ids = roots.iter().map(|r| r.user_id).collect::<Vec<i64>>();
        let users = UserService::serve().batch_get(user_ids).await?;

        Ok((roots, users, total, has_more))
    }

    pub async fn list(
        &self,
        params: ListCommentParams,
    ) -> anyhow::Result<(Vec<Comment>, Vec<User>, i64, bool)> {
        let conn = get_pool();

        fn build_sql<'a>(params: &ListCommentParams, is_count: bool) -> String {
            let mut sql_builder = sea_query::Query::select();
            let sql = sql_builder.from(CommentModelColumns::Table);
            let mut sql = if is_count {
                sql.expr_as(
                    Expr::col(CommentModelColumns::Id).count(),
                    Alias::new("cnt"),
                )
            } else {
                sql.expr(Expr::cust("*"))
            };
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

            if !is_count {
                sql = sql
                    .limit(params.pagination.limit.clone() as u64 + 1)
                    .order_by(CommentModelColumns::Id, sea_query::Order::Desc);
            }

            sql.to_string(PostgresQueryBuilder)
        }

        let query_sql = build_sql(&params, false);
        let count_sql = build_sql(&params, true);

        let res_comments = sqlx::query_as::<_, CommentModel>(query_sql.as_str())
            .fetch_all(&conn)
            .await?;
        let mut res_comments = res_comments
            .into_iter()
            .map(|comment| comment.into())
            .collect::<Vec<Comment>>();

        let res_count: (i64,) = sqlx::query_as(count_sql.as_str()).fetch_one(&conn).await?;

        let has_more;
        if res_comments.len() > params.pagination.limit as usize {
            has_more = true;
            res_comments.pop();
        } else {
            has_more = false;
        }

        let user_ids = res_comments.iter().map(|r| r.user_id).collect::<Vec<i64>>();
        let users = UserService::serve().batch_get(user_ids).await?;

        return Ok((res_comments, users, res_count.0, has_more));
    }

    pub async fn create(
        &mut self,
        user_info: &UserInfo,
        mut payload: CommentActiveModel,
    ) -> anyhow::Result<Comment> {
        let _chk_priv = self.check_priv_create(user_info).await?;

        let time_service = TimeService::serve();
        let now = time_service.now().await?.as_millis() as i64;
        payload.user_id = user_info.id.into();
        payload.created_time = now.into();
        payload.updated_time = now.into();

        let pool = get_pool();
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
        user_info: &UserInfo,
        id: i64,
        mut payload: CommentActiveModel,
    ) -> anyhow::Result<Comment> {
        let _chk_priv = self.check_priv_update(user_info, id).await?;

        payload.id = id.into();
        payload.reference_id.unset();
        payload.parent_id.unset();

        let conn = get_pool();
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
            return Err(crate::core::error::comm_error::ResourceNotFound(
                "comment",
                id.to_string(),
            ))?;
        }
        let comment: Comment = result.pop().unwrap().into();

        Ok(comment)
    }

    pub async fn remove(&mut self, user_info: &UserInfo, id: i64) -> anyhow::Result<()> {
        let _chk_priv = self.check_priv_remove(user_info, id).await?;

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

impl CommentService {
    pub async fn check_priv_create(&self, user_info: &UserInfo) -> anyhow::Result<()> {
        let ok = self.has_priv_create(user_info).await?;
        if !ok {
            return Err(user_error::InsufficientPrivilege(
                user_info.id,
                "comment",
                OpType::CREATE,
                "".to_owned(),
            ))?;
        }
        Ok(())
    }
    pub async fn check_priv_remove(&self, user_info: &UserInfo, id: i64) -> anyhow::Result<()> {
        let ok = self.has_priv_remove(user_info, id).await?;
        if !ok {
            return Err(user_error::InsufficientPrivilege(
                user_info.id,
                "comment",
                OpType::DELETE,
                id.to_string(),
            ))?;
        }
        Ok(())
    }
    pub async fn check_priv_update(&self, user_info: &UserInfo, id: i64) -> anyhow::Result<()> {
        let ok = self.has_priv_update(user_info, id).await?;
        if !ok {
            return Err(user_error::InsufficientPrivilege(
                user_info.id,
                "comment",
                OpType::UPDATE,
                id.to_string(),
            ))?;
        }
        Ok(())
    }

    pub async fn has_priv_create(&self, user_info: &UserInfo) -> anyhow::Result<bool> {
        if user_info.is_anonymous() {
            return Ok(false);
        }
        Ok(true)
    }

    pub async fn has_priv_remove(&self, user_info: &UserInfo, id: i64) -> anyhow::Result<bool> {
        self.has_priv_update(user_info, id).await
    }

    pub async fn has_priv_update(&self, user_info: &UserInfo, id: i64) -> anyhow::Result<bool> {
        if user_info.role == UserRole::Admin {
            return Ok(true);
        }
        let comment_data = CommentData::new();
        let comment = comment_data.get(id).await?;
        if comment.is_none() {
            return Err(crate::core::error::comm_error::ResourceNotFound(
                "comment",
                id.to_string(),
            ))?;
        }
        let comment = comment.unwrap();
        if comment.user_id != user_info.id {
            return Ok(false);
        }
        Ok(true)
    }
}
