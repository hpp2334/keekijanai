
use std::collections::HashMap;

use num_traits::FromPrimitive;

use sea_query::PostgresQueryBuilder;



use crate::{core::{db::get_pool, Service}, modules::{star::model::StarModelColumns, auth::{UserInfo}, user::error::OpType}};

use super::model::{StarType, StarActiveModel};
use crate::modules::user::error as user_error;

#[derive(sqlx::FromRow)]
struct GroupedDetailSQLResultItem {
    belong: String,
    star_type: i16,
    cnt: Option<i64>,
}

struct GetStarStatInfo {
    star_type: i16,
    cnt: Option<i64>,
}

pub struct StarGroupedDetail {
    belong: String,
    star_type: StarType,
    total: i64,
}


pub struct StarService;

impl Service for StarService {
    fn serve() -> Self {
        StarService {  }
    }

    fn init() {

    }
}

impl StarService {
    pub async fn update_star(&mut self, user_info: &UserInfo, payload: StarActiveModel) -> anyhow::Result<()> {
        let _chk_priv = self.check_priv_update(user_info).await?;
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
            tracing::info!("{:?}", result);
        } else {
            let entries = payload.get_set_entries();
            let sql = sea_query::Query::update()
                .table(StarModelColumns::Table)
                .values(entries)
                .to_string(PostgresQueryBuilder);
            let result = sqlx::query(sql.as_str()).execute(&conn).await?;
            tracing::info!("{:?}", result);
        }

        return Ok(())
    }
 
    pub async fn get_current(&self, user_info: &UserInfo, belong: String) -> anyhow::Result<i64> {
        let _chk_priv = self.check_priv_read(user_info).await?;
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
            user_info.id,
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

    pub async fn get_grouped_detail(&self, belongs: Vec<String>) -> anyhow::Result<Vec<StarGroupedDetail>> {
        let belong_str = belongs.join(",");
        let pool = get_pool().await?;
        let query_result: Vec<GroupedDetailSQLResultItem> = sqlx::query_as!(GroupedDetailSQLResultItem,
            r#"
SELECT
  COUNT(id) as cnt,
  star_type,
  belong
FROM keekijanai_star
WHERE belong IN ($1)
GROUP BY belong, star_type
            "#,
            belong_str
        )
        .fetch_all(&pool)
        .await?;

        let mut result = vec![];
        let mut map: HashMap<String, HashMap<StarType, i64>> = HashMap::new();

        query_result.into_iter().for_each(|GroupedDetailSQLResultItem { cnt: _, star_type, belong }| {
            let star_type: StarType = FromPrimitive::from_i16(star_type).unwrap();

            let entry_belong_map = map.entry(belong).or_default();
            let entry_star_cnt = entry_belong_map.entry(star_type).or_default();

            *entry_star_cnt += 1;
        });

        map.into_iter().for_each(|(belong, star_cnt_map)| {
            star_cnt_map.into_iter().for_each(|(star_type, total)| {
                result.push(StarGroupedDetail {
                    belong: belong.clone(),
                    star_type,
                    total,
                });
            })
        });

        Ok(result)
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
            };
            prev + cnt * (curr as i64)
        });
        return score;
    }
}

impl StarService {
    pub async fn check_priv_read(&self, user_info: &UserInfo) -> anyhow::Result<()> {
        let ok = self.has_priv_read(user_info).await?;
        if !ok {
            return Err(user_error::InsufficientPrivilege(
                user_info.id,
                "star",
                OpType::READ,
                String::default(),
            ))?;
        }
        Ok(())
    }
    pub async fn check_priv_update(&self, user_info: &UserInfo) -> anyhow::Result<()> {
        let ok = self.has_priv_update(user_info).await?;
        if !ok {
            return Err(user_error::InsufficientPrivilege(
                user_info.id,
                "star",
                OpType::UPDATE,
                String::default(),
            ))?;
        }
        Ok(())
    }
    pub async fn has_priv_read(&self, user_info: &UserInfo) -> anyhow::Result<bool> {
        if user_info.is_anonymous() {
            return Ok(false)
        }
        Ok(true)
    }
    pub async fn has_priv_update(&self, user_info: &UserInfo) -> anyhow::Result<bool> {
        if user_info.is_anonymous() {
            return Ok(false)
        }
        Ok(true)
    }
}
