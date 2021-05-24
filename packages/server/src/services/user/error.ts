import { ResponseError } from "@/core/error";

export const userInsufficientPriority = new ResponseError('user has insufficient priority');

export const args = {
  user: {
    id: {
      notString: new ResponseError('user id not string'),
    }
  }
}