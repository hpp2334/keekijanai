import { CursorListParams, CursorListRespPayload } from "@/core/request";
export type {
  CreateCommentParams,
  CreateCommentRespPayload,
  CommentVO,
  CommentActiveModel,
  GetCommentTreeRespPayload,
  ListCommentRespPayload,
} from "@/generated/keekijanai-api";

import type { CommentVO, UserVO } from "@/generated/keekijanai-api";

export type StyledCommentVO = CommentVO & { user: UserVO | null };

export type ListCommentQuery = CursorListParams<{
  user_id?: number;
  parent_id?: number;
  belong: string;
}>;

export type GetTreeCommentQuery = {
  belong: string;
  roots_limit: number;
  leaves_limit: number;
  cursor: number | null;
};

export type TreeComment = Omit<StyledCommentVO, "parent_id"> & {
  parent: TreeComment | null;
  children: CommentTree;
};
export type CommentTree = CursorListRespPayload<TreeComment>;

export interface CommentToCreate {
  belong: string;
  content: string;
  reference_id?: number;
  parent_id: number;
}

export const NONE_ROOT_PARENT_ID = -1;
