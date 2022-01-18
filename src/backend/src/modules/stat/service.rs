





use sqlx::Executor;

use crate::{
    core::{db::get_pool, Service},
    modules::{
        time::service::TimeService,
    },
};



pub struct StatService;

impl Service for StatService {
    fn serve() -> Self {
        StatService {}
    }

    fn init() {}
}

impl StatService {
    pub async fn visit(&self, belong: &str, uuid: &str) -> anyhow::Result<(i64, i64)> {
        let pool = get_pool();
        let time_service = TimeService::serve();
        let now = time_service.now().await?.as_millis() as i64;

        let _sql_res = sqlx::query!(
            r#"
INSERT INTO keekijanai_visit(belong, uuid, created_time)
     VALUES ($1, $2, $3)
            "#,
            belong,
            uuid,
            now
        )
        .execute(&pool)
        .await?;

        let pv_rec = sqlx::query!(
            r#"
SELECT COUNT(*) as cnt
  FROM keekijanai_visit
 WHERE belong = $1
            "#,
            belong
        )
        .fetch_one(&pool)
        .await?;

        let uv_rec = sqlx::query!(
            r#"
SELECT COUNT(DISTINCT uuid) as cnt
  FROM keekijanai_visit
 WHERE belong = $1
            "#,
            belong
        )
        .fetch_one(&pool)
        .await?;

        Ok((pv_rec.cnt.unwrap(), uv_rec.cnt.unwrap()))
    }
}
