import { ResponseError } from '@/core/error';

export const forbidden = new ResponseError('you cannot clear view counts', 403);

export const args = {
  scope: {
    notString: new ResponseError('"scope" not string'),
  }
}