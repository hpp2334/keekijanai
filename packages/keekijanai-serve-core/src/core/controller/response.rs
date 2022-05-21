use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CursorPagination<C>
where
    C: Sync + Send,
{
    pub cursor: Option<C>,
    pub limit: i32,
    pub total: i64,
    pub has_more: bool,
}
