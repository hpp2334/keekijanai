import { LoginRespPayload as _LoginRespPayload } from "@/vos/keekijanai-api";
import { O } from "ts-toolbelt";

export const enum UserRole {
  Anonymous,
  Public,
  Admin,
}

export type { RegisterParams, LoginParams, CurrentRespPayload, LoginRespPayload } from "@/vos/keekijanai-api";
export type { UserVO } from "@/vos/user";

export * as OAuth2 from "./oauth2";
