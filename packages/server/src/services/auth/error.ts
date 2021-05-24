import { ResponseError } from '@/core/error';

export const userNeedLogin = new ResponseError('user need login', 401);

export const args = {
  provider: {
    notString: new ResponseError('"provider" not string'),
  },
  oauth2: {
    code: {
      notString: new ResponseError('"code" not string'),
    }
  }
}