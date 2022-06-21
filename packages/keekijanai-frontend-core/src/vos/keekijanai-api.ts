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

import { UserVO } from "./user";

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

export interface RegisterParams {
  username: string;
  password: string;
}
export interface UpdateStarReqPayload {
  /** @format int16 */
  star_type: number;
}

export interface LoginRespPayload {
  user: UserVO;
  token: string;
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
