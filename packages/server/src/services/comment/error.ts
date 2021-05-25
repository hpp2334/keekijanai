import { ResponseError } from '@/core/error';

export const notExists = new ResponseError('comment not exists', 404);
export const forbidden = new ResponseError('you cannot delete the comment', 403);

export const args = {
  comment: {
    notObject: new ResponseError('comment should be an object'),
  }
}