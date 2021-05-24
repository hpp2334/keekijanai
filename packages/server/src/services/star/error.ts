import { ResponseError } from '@/core/error';

export const args = {
  scope: {
    notString: new ResponseError('"scope" not string'),
  }
}