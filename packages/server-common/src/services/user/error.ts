import { ResponseError } from "keekijanai-server-core";

export const userInsufficientPriority = new ResponseError('user has insufficient priority');
export const userNotExists = new ResponseError('user not exists');