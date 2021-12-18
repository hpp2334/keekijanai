use serde::Serialize;

#[derive(Serialize)]
pub struct CursorPagination<T> {
    pub cursor: Option<T>,
    pub limit: i32,
    pub total: i32,
}

#[derive(Serialize)]
pub struct CursorListData<T, C> {
    pub data: Vec<T>,
    pub pagination: CursorPagination<C>
}
