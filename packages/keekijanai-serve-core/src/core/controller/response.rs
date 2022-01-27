use poem_openapi::{
    types::{ParseFromJSON, ToJSON, Type},
    Object,
};
use serde::Serialize;

#[derive(Debug, Object)]
pub struct CursorPagination<C>
where
    C: Sync + Send + Type + ParseFromJSON + ToJSON,
{
    pub cursor: Option<C>,
    pub limit: i32,
    pub total: i64,
    pub has_more: bool,
}
