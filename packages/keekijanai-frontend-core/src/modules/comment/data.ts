import { CursorDirection, CursorPagination, CursorPaginationListItem, UserVO } from "@/vos";

export interface ReferenceCommentVO {
  id: number;
  belong: string;
  user: UserVO;
  content: string;
}

export interface CommentVO {
  id: number;
  belong: string;
  user: UserVO;
  content: string;
  reference_comment: ReferenceCommentVO | null;
  parent_id: number | null;
  child_count: number;
  can_remove: boolean;

  created_time: number;
  updated_time: number;
}

export interface CommentCreateVO {
  belong: string;
  content: string;
  reference_id: number | null;
  parent_id: number | null;
}

export interface CommentUpdateVO {
  content: string;
}

export interface CreateCommentParams {
  payload: CommentCreateVO;
}

export interface CreateCommentRespPayload {
  payload: CursorPaginationListItem<CommentVO, number>;
}

export interface UpdateCommentParams {
  payload: CommentUpdateVO;
}

export interface UpdateCommentRespPayload {
  payload: CursorPaginationListItem<CommentVO, number>;
}

export interface ListCommentQuery {
  belong: string;
  parent_id: number | null;
  cursor_id: number | null;
  cursor_direction: CursorDirection;
  limit: number;
}

export interface GetCommentTreeQuery {
  belong: string;
  roots_limit: number;
  leaves_limit: number;
  cursor_id: number | null;
}

export interface GetCommentTreeRespPayload {
  payload: CursorPagination<CommentVO, number>;
}

export interface ListCommentRespPayload {
  payload: CursorPagination<CommentVO, number>;
}
