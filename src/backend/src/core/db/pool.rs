
use sqlx::{Pool, Postgres};
use sqlx::postgres::PgPoolOptions;
use std::env;


pub async fn get_connection() -> anyhow::Result<Pool<Postgres>> {
    let database_url = env::var("DATABASE_URL").expect(r#""DATABASE_URL" should in env"#);

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url.as_str()).await?;

    Ok(pool)
}
