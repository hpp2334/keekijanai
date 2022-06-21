export enum CursorDirection {
  Forward = 1,
  Backward = 2,
}

export interface CursorPaginationListItem<T, C> {
  payload: T;
  cursor: C;
}

export interface CursorPagination<T, C> {
  list: Array<CursorPaginationListItem<T, C>>;
  end_cursor: C | null;
  has_more: boolean;
  left_total: number;
}
