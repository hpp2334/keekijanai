use serde::Deserialize;

#[derive(Deserialize, Clone)]
pub struct CursorPagination<T> {
    pub cursor: Option<T>,
    pub limit: i32,
}
