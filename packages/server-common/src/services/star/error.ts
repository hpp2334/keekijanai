import { ResponseError } from 'keekijanai-server-core';

export const args = {
  scope: {
    notString: new ResponseError('"scope" not string'),
  }
}
