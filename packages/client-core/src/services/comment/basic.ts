import { Comment, Grouping } from 'keekijanai-type';
import { Observable } from "rxjs";
import { Service } from "../../core/service";
import _ from 'lodash';
import { tap } from 'rxjs/operators';

export class CommentService extends Service {
  private routes = {
    get: '/comment/get',
    create: '/comment/create',
    list: '/comment/list',
    delete: '/comment/delete',
  };
  private _scope: string;

  constructor(scope: string) {
    super();
    this._scope = scope;
  }

  get = (id: number): Observable<Comment.Get> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      method: 'GET',
      query: {
        id,
      }
    });
    return result;
  }
  
  create = (comment: Omit<Comment.Create, 'scope'>): Observable<Comment.Get> => {
    const result = this.client.requester.request({
      route: this.routes.create,
      method: 'POST',
      query: {
        scope: this._scope,
        parentId: comment.parentId,
      },
      body: {
        comment: {
          ...comment,
          scope: this._scope,
        },
      }
    });
    return result;
  }

  list = (parentId: number | undefined, grouping: Grouping): Observable<Comment.List> => {
    const gpStr = this.getGroupingString(grouping);
    let result = this.client.requester.request({
      route: this.routes.list,
      query: {
        scope: this._scope,
        parentId,
        grouping: gpStr,
      }
    });
    return result;
  }

  delete = (commentId: number): Observable<Comment.Delete> => {
    const result = this.client.requester.request({
      route: this.routes.delete,
      method: 'DELETE',
      query: {
        commentId,
      }
    });
    return result;
  }

  private getGroupingString(grouping: Grouping) {
    return `${grouping.skip},${grouping.take}`;
  }
}
