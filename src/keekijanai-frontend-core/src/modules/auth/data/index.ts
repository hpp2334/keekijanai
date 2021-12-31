import { LoginRespPayload as _LoginRespPayload } from "@/generated/keekijanai-api";
import { O } from "ts-toolbelt";

export const enum UserRole {
  Anonymous,
  Public,
  Admin,
}

export type {
  RegisterParams,
  LoginParams,
  CurrentRespPayload,
  UserVO,
  LoginRespPayload,
} from "@/generated/keekijanai-api";

export * as OAuth2 from "./oauth2";
