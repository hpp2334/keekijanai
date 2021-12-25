


use sea_query::{PostgresQueryBuilder, Query};


use super::model::{User, UserActiveModel, UserModel, UserModelColumns};
use crate::{
    core::{db::get_pool, Service},
    modules::user::model::UserRole,
};

pub struct UserService;

impl Service for UserService {
    fn serve() -> Self {
        UserService {}
    }

    fn init() {}
}

impl UserService {
    pub async fn get(&self, user_id: i64) -> anyhow::Result<Option<User>> {
        let conn = get_pool().await?;
        let mut user = sqlx::query_as!(
            UserModel,
            "
SELECT *
FROM keekijanai_user
WHERE id = $1
            ",
            user_id
        )
        .fetch_all(&conn)
        .await?
        .into_iter()
        .map(|user| user.into())
        .collect::<Vec<User>>();

        if user.len() == 0 {
            return Ok(None);
        }
        let mut user = user.pop().unwrap();
        user.password = None;
        return Ok(Some(user));
    }

    pub async fn get_by_provider(
        &self,
        provider: &str,
        in_provider_id: &str,
    ) -> anyhow::Result<Option<User>> {
        let conn = get_pool().await?;
        let mut user = sqlx::query_as!(
            UserModel,
            "
SELECT *
FROM keekijanai_user
WHERE provider = $1 AND in_provider_id = $2
            ",
            provider,
            in_provider_id
        )
        .fetch_all(&conn)
        .await?
        .into_iter()
        .map(|user| user.into())
        .collect::<Vec<User>>();

        if user.len() == 0 {
            return Ok(None);
        }
        let mut user = user.pop().unwrap();
        user.password = None;
        return Ok(Some(user));
    }

    pub async fn upsert(
        &self,
        user_id: Option<i64>,
        mut payload: UserActiveModel,
    ) -> anyhow::Result<()> {
        tracing::debug!("[upsert] to update {:?}", user_id);

        let conn = get_pool().await?;
        if user_id.is_none() {
            payload.role = (UserRole::Public as i32).into();

            let (columns, values) = payload.get_set_columns();
            let sql = Query::insert()
                .into_table(UserModelColumns::Table)
                .columns(columns)
                .values_panic(values)
                .to_string(PostgresQueryBuilder);
            let sql = sql + " RETURNING *";
            let result = sqlx::query_as::<_, UserModel>(sql.as_str())
                .fetch_one(&conn)
                .await?;
            tracing::info!("{:?}", result);
        } else {
            payload.id = user_id.clone().unwrap().into();
            let entries = payload.get_set_entries();
            let sql = Query::update()
                .table(UserModelColumns::Table)
                .values(entries)
                .to_string(PostgresQueryBuilder);
            let result = sqlx::query(sql.as_str()).execute(&conn).await?;
            tracing::info!("{:?}", result);
        }
        return Ok(());
    }
}

