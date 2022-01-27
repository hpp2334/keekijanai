#[derive(Debug, sqlx::FromRow)]
pub struct VisitModel {
    pub id: i64,
    pub belong: String,
    pub uuid: String,
    pub created_time: i64,
}

pub type Visit = VisitModel;
