import { Comment, Grouping } from 'keekijanai-type';
import { Observable } from "rxjs";
import { map, tap } from 'rxjs/operators';
import { Service, serviceFactory } from "../core/service";
import _ from 'lodash';

class CommentServiceImpl extends Service {
  routes = {
    get: '/comment/get',
    create: '/comment/create',
    list: '/comment/list',
    delete: '/comment/delete',
  };
  options = {
    preCache: {
      pre: 1,
      next: 3,
    }
  };

  get = (id: number): Observable<Comment.Get> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      method: 'GET',
      query: {
        id
      },
      cache: {
        scope: 'comment',
        keys: ['get', id]
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
      },
      cache: {
        mode: 'clear',
        scope: 'comment',
      }
    });
    return result;
  }

  private _list = (scope: string, parentId: number | undefined, grouping: Grouping, cacheLeft: number): Observable<Comment.List> => {
    const gpStr = this.getGroupingString(grouping);
    let result = this.client.requester.request({
      route: this.routes.list,
      query: {
        scope,
        parentId,
        grouping: gpStr,
      },
      cache: {
        scope: 'comment',
        keys: ['list', scope, parentId ?? null, gpStr]
      }
    });

    if (cacheLeft >= 1) {
      result = result.pipe(
        // pre cache pre 1 page and next 3 page comments
        tap((list: Comment.List) => {
          [
            ..._.range(-this.options.preCache.pre, -1),
            ..._.range(1, this.options.preCache.next),
          ].forEach(p => {
            const nextSkip = grouping.skip + p;
            if (nextSkip < 0 || nextSkip * grouping.take >= list.total) {
              return;
            }
            this._list(scope, parentId, { ...grouping, skip: nextSkip }, cacheLeft - 1).subscribe(_.noop);
          });
        }),
        // pre cache child comments
        tap((list: Comment.List) => {
          list.comments
            .filter(v => v.childCounts > 0)
            .forEach(c => {
              this._list(scope, c.id, { ...grouping, skip: 0 }, cacheLeft - 1).subscribe(_.noop)
            })
        })
      )
    }
    return result;
  }

  list = (scope: string, parentId: number | undefined, grouping: Grouping): Observable<Comment.List> => {
    const result = this._list(scope, parentId, grouping, 2);
    return result;
  }

  delete = (commentId: number): Observable<Comment.Delete> => {
    const result = this.client.requester.request({
      route: this.routes.delete,
      method: 'DELETE',
      query: {
        commentId,
      },
      cache: {
        mode: 'clear',
        scope: 'comment',
      }
    });
    return result;
  }

  private getGroupingString(grouping: Grouping) {
    return `${grouping.skip},${grouping.take}`;
  }
}

export const comment = serviceFactory(CommentServiceImpl);
