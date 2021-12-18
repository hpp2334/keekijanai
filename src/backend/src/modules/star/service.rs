use std::sync::Arc;

use hyper::rt::Executor;
use num_traits::FromPrimitive;
use once_cell::{sync::Lazy, sync::OnceCell};
use sea_query::PostgresQueryBuilder;
use tokio::sync::mpsc::{Sender, Receiver};

use crate::{core::{db::get_pool, Service}, modules::{user::model::UserActiveModel, star::model::StarModelColumns}};

use super::model::{StarType, StarActiveModel};

struct GetStarStatInfo {
    star_type: i16,
    cnt: Option<i64>,
}

pub struct StarService {

}

impl Service for StarService {
    fn serve() -> Self {
        StarService {  }
    }

    fn init() {

    }
}

impl StarService {
    pub async fn update_star(&mut self, user_id: i64, payload: StarActiveModel) -> anyhow::Result<()> {
        let conn = get_pool().await?;

        if payload.id.is_unset() {
            let (columns, values) = payload.get_set_columns();
            let sql = sea_query::Query::insert()
                .into_table(StarModelColumns::Table)
                .columns(columns)
                .values_panic(values)
                .to_string(PostgresQueryBuilder);
            let result = sqlx::query(sql.as_str())
                .execute(&conn)
                .await?;
            log::info!("{:?}", result);
        } else {
            let entries = payload.get_set_entries();
            let sql = sea_query::Query::update()
                .table(StarModelColumns::Table)
                .values(entries)
                .to_string(PostgresQueryBuilder);
            let result = sqlx::query(sql.as_str()).execute(&conn).await?;
            log::info!("{:?}", result);
        }

        return Ok(())
    }

    pub async fn get_current(&self, user_id: i64, belong: &str) -> anyhow::Result<i64> {
        let conn = get_pool().await?;
        let result_current: Vec<GetStarStatInfo> = sqlx::query_as!(GetStarStatInfo,
            "
SELECT
  star_type,
  COUNT(*) as cnt
FROM keekijanai_star
WHERE belong = $1
  AND user_id = $2
GROUP BY star_type
            ",
            belong,
            user_id,
        )
        .fetch_all(&conn)
        .await?;

        let current = self.get_score_from_star_stat_info(&result_current);
        Ok(current)
    }

    pub async fn get_total(&self, belong: &str) -> anyhow::Result<i64> {
        let conn = get_pool().await?;
        let result_current: Vec<GetStarStatInfo> = sqlx::query_as!(GetStarStatInfo,
            "
SELECT
  star_type,
  COUNT(*) as cnt
FROM keekijanai_star
WHERE belong = $1
GROUP BY star_type
            ",
            belong,
        )
        .fetch_all(&conn)
        .await?;

        let total = self.get_score_from_star_stat_info(&result_current);
        Ok(total)
    }

    fn get_score_from_star_stat_info(&self, stat_info: &Vec<GetStarStatInfo>) -> i64 {
        let score = stat_info.iter().fold(0i64, |prev, GetStarStatInfo { star_type, cnt }| {
            let star_type = FromPrimitive::from_i16(*star_type).unwrap_or(StarType::UnStar);
            let cnt = cnt.unwrap_or(0);
            let curr = match star_type {
                StarType::UnStar => 0,
                StarType::Bad => -1,
                StarType::JustOK => 0,
                StarType::Good => 1,
                _ => 0,
            };
            prev + cnt * (curr as i64)
        });
        return score;
    }
}
