export type CursorListParams<T, C = number> = T & {
  cursor?: C;
  limit: number;
};

export type CursorListRespPayload<T, C = number> = {
  data: T[];
  pagination: {
    cursor: C | null;
    limit: number;
    total: number;
    has_more: boolean;
  };
};
