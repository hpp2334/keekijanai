import type * as ApiTypes from "@/generated/keekijanai-api";
import type { O } from "ts-toolbelt";

export const enum StarType {
  UnStar = 0,
  Bad,
  JustOK,
  Good,
}
export interface Star {
  current: StarType | undefined;
  total: number;
}

export type UpdateStarReqPayload = O.Overwrite<
  ApiTypes.UpdateStarReqPayload,
  {
    star_type: StarType;
  }
>;

export type { GetStarResponse } from "@/generated/keekijanai-api";
