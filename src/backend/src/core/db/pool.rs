

use sqlx::postgres::{PgPoolOptions, PgPool};
use std::env;


pub async fn get_pool() -> anyhow::Result<PgPool> {
    let database_url = env::var("DATABASE_URL").expect(r#""DATABASE_URL" should in env"#);

    let pool = PgPoolOptions::new()
        .max_connections(20)
        .connect(database_url.as_str()).await?;

    Ok(pool)
}
