import { Comment } from 'keekijanai-type';
import _ from 'lodash';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TreeMap, TreeNode } from 'jelly-util-tree-map';
import { Service } from '../../core/service';
import { CommentService } from './basic';

export class CommentCachableService extends Service {
  private options = {
    preCache: {
      pre: 1,
      next: 3,
    },
    grouping: {
      take: 5,
    }
  };
  cacher = new TreeMap<any>();
  private _itemNodeMap = new Map<number | undefined, TreeNode<Comment.Get>>();
  private _scope: string;
  private commentService: CommentService;

  constructor(scope: string) {
    super();
    this._scope = scope;
    this.commentService = new CommentService(this._scope);

    this._itemNodeMap.set(undefined, this.cacher.root as any);
  }

  create = (comment: Comment.Create): Observable<Comment.Get> => {
    const { parentId } = comment;
    const take = this.options.grouping.take;
  
    const result = this.commentService
      .create(comment)
      .pipe(
        tap(() => {
          const parentNode = this._itemNodeMap.get(parentId)?.access([take], true) as TreeNode<Comment.Get> | undefined;
          this._clearCache(parentNode);
        }),
      )
    return result;
  }

  delete = (commentId: number): Observable<Comment.Delete> => {
    const result = this.commentService
      .delete(commentId)
      .pipe(
        tap(() => {
          const node = this._itemNodeMap.get(commentId) as TreeNode<Comment.Get> | undefined;
          this._itemNodeMap.delete(commentId);
          if (node && node.parentKey && node.parent) {
            node.parent.children?.delete(node.parentKey);
          }
          if (node) {
            this._clearCache(node.parent);
          }
        })
      )
    return result;
  }

  get = (id: number) => {
    const node = this._itemNodeMap.get(id) as TreeNode<Comment.Get> | undefined;
    if (node && node.hasValue()) {
      const value = node.getValue()!;
      return of(value);
    }

    const result = this.commentService
      .get(id)
      .pipe(
        tap(item => {
          if (node) {
            node.setValue(item);
          }
        })
      );
    return result;
  }

  list = (parentId: number | undefined, skip: number): Observable<Comment.List> => {
    const result = this._list(parentId, skip, 2);
    return result;
  }

  private _clearCache = (node: TreeNode<any> | null | undefined) => {
    node?.children?.forEach(node => node.deleteValue());
    while (node) {
      node.deleteValue();
      node = node.parent;
    }
  }

  private _list = (id: number | undefined, skip: number, cacheLeft: number): Observable<Comment.List> => {
    const take = this.options.grouping.take;
    const baseNode = this._itemNodeMap.get(id);
    const node = baseNode?.access([take, skip], true) as TreeNode<Comment.List> | undefined;
  
    // Cache
    if (node?.hasValue()) {
      const comments = !node.children ? [] : ([...node.children.values()] as any as TreeNode<Comment.Get>[])
        .map(v => v.getValue()!)
        .sort((a, b) => b.id - a.id);
      const value = node.getValue()!;
      return of({
        ...value,
        comments,
      });
    }

    let result = this.commentService
      .list(id, { take, skip })
      .pipe(
        tap(list => {
          if (node) {
            node.setValue({
              ...list,
              comments: [],
            });
  
            for (const item of list.comments) {
              const commentNode = node.access([item.id], true) as any as TreeNode<Comment.Get>;
              commentNode.setValue(item);
              this._itemNodeMap.set(item.id, commentNode);
            }
          }
        })
      )

    if (cacheLeft >= 1) {
      result = result.pipe(
        // pre cache pre 1 page and next 3 page comments
        tap((list: Comment.List) => {
          [
            ..._.range(-this.options.preCache.pre, -1),
            ..._.range(1, this.options.preCache.next),
          ].forEach(p => {
            const nextSkip = skip + p;
            if (nextSkip < 0 || nextSkip * take >= list.total) {
              return;
            }
            this._list(id, nextSkip, cacheLeft - 1).subscribe(_.noop);
          });
        }),
        // pre cache child comments
        tap((list: Comment.List) => {
          list.comments
            .filter(v => v.childCounts > 0)
            .forEach(c => {
              this._list(c.id, 0, cacheLeft - 1).subscribe(_.noop)
            })
        })
      )
    }
    return result;
  }
}