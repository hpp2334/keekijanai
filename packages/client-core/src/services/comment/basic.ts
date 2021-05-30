import { Comment, Grouping } from 'keekijanai-type';
import { Observable } from "rxjs";
import { map, tap } from 'rxjs/operators';
import { Service, serviceFactory } from "../../core/service";
import _ from 'lodash';

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
      }
    });
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
    });
    return result;
  }

  list = (scope: string, parentId: number | undefined, grouping: Grouping): Observable<Comment.List> => {
    const gpStr = this.getGroupingString(grouping);
    let result = this.client.requester.request({
      route: this.routes.list,
      query: {
        scope,
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

export const comment = serviceFactory(CommentServiceImpl);
