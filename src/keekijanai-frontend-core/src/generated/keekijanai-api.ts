/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CurrentRespPayload {
  user: UserVO;
}

export interface GetStarResponse {
  /** @format int16 */
  current?: number;

  /** @format int64 */
  total: number;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface CommentVO {
  /** @format int64 */
  id: number;
  belong: string;

  /** @format int64 */
  user_id: number;
  content: string;

  /** @format int64 */
  reference_id?: number;

  /** @format int64 */
  parent_id: number;

  /** @format int32 */
  child_count: number;

  /** @format int64 */
  created_time: number;

  /** @format int64 */
  updated_time: number;
}

export interface UpdateCommentParams {
  payload: CommentActiveModel;
}

export interface UpdateCommentRespPayload {
  payload: Comment;
}

export interface RegisterParams {
  username: string;
  password: string;
}

export interface CreateCommentParams {
  payload: CommentActiveModel;
}

export interface UpdateStarReqPayload {
  /** @format int16 */
  star_type: number;
}

export interface CursorPagination {
  /** @format int64 */
  cursor?: number;

  /** @format int32 */
  limit: number;

  /** @format int64 */
  total: number;
  has_more: boolean;
}

export interface GetCommentTreeRespPayload {
  comments: CommentVO[];
  users: UserVO[];
  pagination: CursorPagination;
}

export interface LoginRespPayload {
  user: UserVO;
  token: string;
}

export interface CommentActiveModel {
  /** @format int64 */
  id?: number;
  belong?: string;

  /** @format int64 */
  user_id?: number;
  content?: string;

  /** @format int64 */
  reference_id?: number;

  /** @format int64 */
  parent_id?: number;

  /** @format int32 */
  child_count?: number;

  /** @format int64 */
  created_time?: number;

  /** @format int64 */
  updated_time?: number;
}

export interface VisitRespPayload {
  /** @format int64 */
  pv: number;

  /** @format int64 */
  uv: number;
}

export interface GetTimeResponse {
  time: string;
}

export interface Comment {
  /** @format int64 */
  id: number;
  belong: string;

  /** @format int64 */
  user_id: number;
  content: string;

  /** @format int64 */
  reference_id?: number;

  /** @format int64 */
  parent_id: number;

  /** @format int32 */
  child_count: number;

  /** @format int64 */
  created_time: number;

  /** @format int64 */
  updated_time: number;
}

export interface UserVO {
  /** @format int64 */
  id: number;
  name: string;

  /** @format int16 */
  role: number;
  provider: string;
  avatar_url?: string;
  email?: string;
}

export interface ListCommentRespPayload {
  comments: CommentVO[];
  users: UserVO[];
  pagination: CursorPagination;
}

export interface CreateCommentRespPayload {
  payload: CommentVO;
  user: UserVO;
}
