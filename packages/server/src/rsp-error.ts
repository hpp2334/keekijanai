import { ResponseError } from "./utils/error/rsp";

export const argsError = {
  scope: {
    notString: () => new ResponseError('"scope" should be a string', 400),
  },
  provider: {
    notString: () => new ResponseError('"provider" should be a string', 400),
  },
  oauth2: {
    code: {
      notString: () => new ResponseError('"code" in oauth2 should be a string', 400),
    }
  },
  comment: {
    comment: {
      toBeObjectInReqBody: () => new ResponseError('"comment" should be an object in request body', 400),
    }
  },
  user: {
    id: {
      notString: () => new ResponseError('"id" should be a string', 400)
    }
  }
}

export const commonError = {
  auth: {
    userNeedLogin: () => new ResponseError('user need login', 401),
  },
  comment: {
    notExists: () => new ResponseError('comment not exists', 404),
    forbidden: () => new ResponseError('you cannot delete the comment', 403),
  }
}
