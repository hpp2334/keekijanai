use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CursorDirection {
    Forward = 1,
    Backward = 2,
}

#[derive(Debug, Serialize, Deserialize)]
struct _SerdeCursorPaginationListItem<T: Clone, C: Clone> {
    pub payload: T,
    pub cursor: C,
}

#[derive(Debug, Clone)]
pub struct CursorPaginationListItem<T: Clone, C: Clone> {
    pub payload: T,
    pub cursor: C,
}

impl<T: Clone, C: Clone> From<CursorPaginationListItem<T, C>>
    for _SerdeCursorPaginationListItem<T, C>
{
    fn from(v: CursorPaginationListItem<T, C>) -> Self {
        Self {
            payload: v.payload,
            cursor: v.cursor,
        }
    }
}

impl<T: Clone, C: Clone> From<_SerdeCursorPaginationListItem<T, C>>
    for CursorPaginationListItem<T, C>
{
    fn from(v: _SerdeCursorPaginationListItem<T, C>) -> Self {
        Self {
            payload: v.payload,
            cursor: v.cursor,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct _SerdeCursorPagination<T: Clone, C: Clone> {
    pub list: Vec<_SerdeCursorPaginationListItem<T, C>>,
    pub end_cursor: Option<C>,
    pub has_more: bool,
    pub total: i64,
}

#[derive(Debug, Clone)]
pub struct CursorPagination<T: Clone, C: Clone> {
    pub list: Vec<CursorPaginationListItem<T, C>>,
    pub end_cursor: Option<C>,
    pub has_more: bool,
    pub left_total: i64,
}

impl<T: Clone, C: Clone> CursorPagination<T, C> {
    pub fn map_list<U: Clone>(
        self,
        list: Vec<CursorPaginationListItem<U, C>>,
    ) -> CursorPagination<U, C> {
        CursorPagination {
            list,
            end_cursor: self.end_cursor,
            has_more: self.has_more,
            left_total: self.left_total,
        }
    }

    pub fn get_payloads(&self) -> Vec<T> {
        cursor_list_map_payloads(self.list.clone())
    }
}

impl<T: Clone, C: Clone> From<CursorPagination<T, C>> for _SerdeCursorPagination<T, C> {
    fn from(v: CursorPagination<T, C>) -> Self {
        Self {
            list: v.list.into_iter().map(Into::into).collect(),
            end_cursor: v.end_cursor,
            has_more: v.has_more,
            total: v.left_total,
        }
    }
}

impl<T: Clone, C: Clone> From<_SerdeCursorPagination<T, C>> for CursorPagination<T, C> {
    fn from(v: _SerdeCursorPagination<T, C>) -> Self {
        Self {
            list: v.list.into_iter().map(Into::into).collect(),
            end_cursor: v.end_cursor,
            has_more: v.has_more,
            left_total: v.total,
        }
    }
}

impl<T, C> Serialize for CursorPagination<T, C>
where
    T: Serialize + Clone,
    C: Serialize + Clone,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let v: _SerdeCursorPagination<_, _> = self.clone().into();
        v.serialize(serializer)
    }
}

impl<'a, T, C> Deserialize<'a> for CursorPagination<T, C>
where
    T: Deserialize<'a> + Clone,
    C: Deserialize<'a> + Clone,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'a>,
    {
        let v = _SerdeCursorPagination::deserialize(deserializer);
        v.map(Into::into)
    }
}

pub fn build_cursor_list<T: Clone, C: Clone>(
    list: Vec<T>,
    get_cursor: impl Fn(&T) -> C,
) -> Vec<CursorPaginationListItem<T, C>> {
    let list = list
        .into_iter()
        .map(|item| {
            let cursor = get_cursor(&item);

            CursorPaginationListItem {
                payload: item,
                cursor,
            }
        })
        .collect::<Vec<_>>();
    list
}

pub fn cursor_list_map_payloads<T: Clone, C: Clone>(
    list: Vec<CursorPaginationListItem<T, C>>,
) -> Vec<T> {
    list.iter().map(|item| item.payload.clone()).collect()
}
