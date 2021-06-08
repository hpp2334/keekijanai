import { ResponseError } from "@/core/error";

export const userInsufficientPriority = new ResponseError('user has insufficient priority');
export const userNotExists = new ResponseError('user not exists');