use once_cell::sync::OnceCell;
use sqlx::postgres::{PgPool, PgPoolOptions};


use crate::core::setting::{SETTING};

static POOL: OnceCell<PgPool> = OnceCell::new();

pub async fn init_pool() -> anyhow::Result<()> {
    let setting = SETTING.get().unwrap();

    let database_url = setting.database.url.as_str();

    let pool = PgPoolOptions::new()
        .max_connections(20)
        .connect(database_url)
        .await?;

    POOL.set(pool)
        .map_err(|_e| anyhow::anyhow!("set pool error"))?;

    Ok(())
}

pub fn get_pool() -> PgPool {
    let p = POOL.get();
    let p = p.unwrap().clone();
    p
}
