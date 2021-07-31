import { Comment, Grouping } from 'keekijanai-type';
import { Observable } from "rxjs";
import { Service } from "../../core/service";
import _ from 'lodash';
import { tap } from 'rxjs/operators';
import { Client } from '../../core/client';
import { CommentService } from './basic';

export class CommentSmartService extends Service {
  private routes = {
    get: '/comment/get',
    create: '/comment/create',
    list: '/comment/list',
    delete: '/comment/delete',
  };
  private _scope: string;
  private _basicService: CommentService;
  private _commentListMap = new Map<number | undefined, Comment.Get[]>();
  private _commentItemMap = new Map<number | undefined, Comment.Get>();

  constructor(client: Client, scope: string) {
    super(client);
    this._scope = scope;
    this._basicService = new CommentService(client, scope);
  }

  get = (id: number): Observable<Comment.Get> => {
    const result = this._basicService.get(id);
    return result;
  }
  
  create = (comment: Omit<Comment.Create, 'scope'>): Observable<Comment.Get> => {
    const result = this._basicService
      .create(comment)
      .pipe(
        tap((res) => {
          const parentId = comment.parentId;
          

          // update list
          let list = this._commentListMap.get(parentId);

          if (list) {
            list.unshift(res)
          } else {
            this._commentListMap.set(parentId, [res]);
          }
        })
      );

    return result;
  }

  list = (parentId: number | undefined, grouping: Grouping): Observable<Comment.List> => {
    let result = this._basicService.list(parentId, grouping);
    return result;
  }

  delete = (commentId: number): Observable<Comment.Delete> => {
    const result = this._basicService.delete(commentId);
    return result;
  }

  clearCache = (id: number | undefined) => {
    this._commentListMap.delete(id);
  }

  clearCacheAll = () => {
    for (const [key] of this._commentListMap) {
      this._commentListMap.delete(key);
    }
  }
}
