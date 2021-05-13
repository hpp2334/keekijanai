import { Comment, Grouping } from 'keekijanai-type';
import { Observable } from "rxjs/internal/Observable";
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { Client } from "../core/client";
import { Service, serviceFactory } from "../core/service";

class CommentServiceImpl extends Service {
  routes = {
    get: '/comment/get',
    create: '/comment/create',
    list: '/comment/list',
    delete: '/comment/delete',
  };

  get = (id: number): Observable<Comment.Get> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      method: 'GET',
      query: {
        id
      },
    }).pipe(
      map(value => value.response as any)
    );
    return result;
  }
  
  create = (scope: string, comment: Comment.Create): Observable<Comment.Get> => {
    const result = this.client.requester.request({
      route: this.routes.create,
      method: 'POST',
      query: {
        scope,
      },
      body: {
        comment,
      }
    }).pipe(
      map(value => value.response as any)
    );
    return result;
  }

  list = (scope: string, parentId: number | undefined, grouping: Grouping): Observable<Comment.List> => {
    const result = this.client.requester.request({
      route: this.routes.list,
      query: {
        scope,
        parentId,
        grouping: `${grouping.skip},${grouping.take}`,
      }
    }).pipe(
      map(value => value.response as any)
    );
    return result;
  }

  delete = (commentId: number): Observable<Comment.Delete> => {
    const result = this.client.requester.request({
      route: this.routes.delete,
      method: 'DELETE',
      query: {
        commentId,
      }
    }).pipe(
      map(value => value.response as any)
    );
    return result;
  }
}

export const comment = serviceFactory(CommentServiceImpl);
