use sea_orm::{ColumnTrait, EntityTrait, QuerySelect};
use sea_orm::QueryFilter;

use crate::entities::keekijanai_star;
use crate::{core::db::get_connection, entities::star_type::StarType};
use crate::entities::prelude::{KeekijanaiStar};

struct StarService {}


struct GroupCountResultItem {
    star: StarType,
    count: u64,
}

impl StarService {
    pub fn upsert(id: Option<i32>) {}

    pub async fn get_total(scope: String) -> anyhow::Result<GroupCountResultItem> {

        let connection = get_connection().await?;

        let star_result = KeekijanaiStar::find()
            .filter(keekijanai_star::Column::Scope.eq(scope))
            .group_by(keekijanai_star::Column::StarLv)
            .column_as(keekijanai_star::Column::StarLv.count(), "count")
            .all(&connection)
            .await?;

        let total = star_result
            .into_iter()
            .map(|item| {
                match item.star_lv.unwrap_or(0).into() {
                    StarType::UnStar => 0,
                    StarType::Bad => -1,
                    StarType::JustOK => 0,
                    StarType::Good => 1,
                }
            })
            .sum::<i32>();
        return total;
    }

    pub fn get_current(scope: String) {

    }
}
