use poem_openapi::{Object, types::{ParseFromJSON, ToJSON, Type}};
use serde::Serialize;

#[derive(Object)]
pub struct CursorPagination<C>
where
    C: Sync + Send + Type + ParseFromJSON + ToJSON,
{
    pub cursor: Option<C>,
    pub limit: i32,
    pub total: i32,
    pub has_more: bool,
}

#[derive(Object)]
pub struct CursorListData<T, C>
where
    T: Sync + Send + Type + ParseFromJSON + ToJSON,
    C: Sync + Send + Type + ParseFromJSON + ToJSON,
{
    pub data: Vec<T>,
    pub pagination: CursorPagination<C>,
}
