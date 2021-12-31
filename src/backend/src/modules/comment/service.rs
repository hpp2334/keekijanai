

use std::collections::{HashSet, HashMap};

use sea_query::{Alias, Expr, PostgresQueryBuilder, SelectStatement};
use serde::Deserialize;

use crate::{
    core::{db::get_pool, Service},
    modules::{
        auth::UserInfo,
        comment::model::{CommentModel, CommentModelColumns},
        user::{error::OpType, model::UserRole},
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

pub struct CommentService;

impl Service for CommentService {
    fn serve() -> Self {
        Self {}
    }

    fn init() {}
}

impl CommentService {
    pub async fn list_as_tree(&self, roots_limit: i32, leaves_limit: i32) -> anyhow::Result<Vec<Comment>> {
        let pool = get_pool().await?;

        let mut roots = sqlx::query_as!(Comment,
            r#"
SELECT *
FROM keekijanai_comment
ORDER BY id DESC
LIMIT $1
            "#,
            roots_limit as i64,
        ).fetch_all(&pool).await?;
        let root_ids = roots.iter().map(|v| { v.id }).collect::<Vec<i64>>();

        let leaves = sqlx::query_as!(Comment,
            r#"
SELECT *
FROM keekijanai_comment
WHERE parent_id IN (SELECT * FROM UNNEST($1::bigint[]))
ORDER BY id DESC
            "#,
            root_ids.as_slice()
        ).fetch_all(&pool).await?;

        let mut leaves_count: HashMap<i64, i32> = HashMap::new();
        let mut leaves = leaves.into_iter().filter(|comment| {
            let entry = leaves_count.entry(comment.parent_id).or_insert(0);
            if *entry < leaves_limit {
                *entry += 1;
                return true;
            }
            return false;
        }).collect();

        roots.append(&mut leaves);
        
        Ok(roots)
    }

    pub async fn list(&self, params: ListCommentParams) -> anyhow::Result<(Vec<Comment>, i32, bool)> {
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
                .limit(params.pagination.limit.clone() as u64 + 1)
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
        let mut res_comments = res_comments
            .into_iter()
            .map(|comment| comment.into())
            .collect::<Vec<Comment>>();

        let res_count: (i32,) = sqlx::query_as(count_sql.as_str()).fetch_one(&conn).await?;

        let has_more;
        if res_comments.len() == params.pagination.limit as usize {
            has_more = true;
            res_comments.pop();
        } else {
            has_more = false;
        }

        return Ok((res_comments, res_count.0, has_more));
    }

    pub async fn create(
        &mut self,
        user_info: &UserInfo,
        payload: CommentActiveModel,
    ) -> anyhow::Result<Comment> {
        let _chk_priv = self.check_priv_create(user_info).await?;

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
        user_info: &UserInfo,
        id: i64,
        mut payload: CommentActiveModel,
    ) -> anyhow::Result<Comment> {
        let _chk_priv = self.check_priv_update(user_info, id).await?;

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
            return Err(crate::core::error::comm_error::ResourceNotFound(
                "comment",
                id.to_string(),
            ))?;
        }

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
        if comment.user_id != user_info.id {
            return Ok(false);
        }
        Ok(true)
    }
}
