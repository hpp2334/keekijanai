import {
  comment as commentService,
} from 'keekijanai-client-core';
import { Comment as TypeComment } from 'keekijanai-type';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { of } from 'rxjs';
import { map, mergeAll, switchMapTo, tap } from 'rxjs/operators';
import { useMemoExports } from '../../util';
import { batchUsers } from '../User/controller';

export function useCommentList(scope: string, parentId: number | undefined, take: number = 5) {
  const [list, setResult] = useState<TypeComment.List>();
  const [page, changePage] = useState(1);
  const [pageSize, setPageSize] = useState(take);
  const [loadingState, setLoadingState] = useState<'init-loading' | 'loading' | 'error' | 'done'>('init-loading');
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastActCnt, setLastActCnt] = useState(0);

  const query = useCallback(() => {
    setLoadingState('loading');
    const rsp = commentService
      .list(scope, parentId, { skip: page - 1, take })
      .pipe(
        map(list => {
          const ids = list.comments.map(c => c.userId);
          
          return batchUsers(ids).pipe(
            switchMapTo(of(list))
          )
        }),
        mergeAll(),
      )
      .subscribe({
        error: err => {
          setLoadingState('error');
          setLastError(err);
        },
        next: res => {
          setLoadingState('done');
          setResult(res);
        },
      });
    return rsp;
  }, [scope, page, take]);

  const remove = useCallback((id: number) => {
    const rsp = commentService
      .delete(id)
      .pipe(
        tap(() => {
          changePage(1);
          setLastActCnt(x => x + 1);
        })
      )
    return rsp;
  }, []);

  const create = useCallback((scope: string, comment: TypeComment.Create) => {
    const rsp = commentService
      .create(scope, comment)
      .pipe(
        tap(() => {
          changePage(1);
          setLastActCnt(x => x + 1);
        }),
      )
    return rsp;
  }, []);
  
  useEffect(() => {
    query();
  }, [query, page, lastActCnt, take]);

  const exports = useMemoExports({
    list,
    page,
    pageSize,
    loadingState,
    lastError,
    changePage,
    remove,
    create,
  });

  return exports;
}

export function useComment(id: number | undefined) {
  const [comment, setComment] = useState<TypeComment.Get>();

  const query = useCallback(() => {
    if (typeof id === 'undefined') {
      return;
    }
    const rsp = commentService
      .get(id)
      .pipe(
        map(c => {
          const id = c.userId;
          
          return batchUsers([id]).pipe(
            switchMapTo(of(c))
          )
        }),
        mergeAll(),
      )
      .subscribe({
        next: c => {
          setComment(c);
        },
      });
    return rsp;
  }, [id]);
  
  useEffect(() => {
    query();
  }, [query]);

  const exports = useMemoExports({
    query,
    comment,
  });

  return exports;
}

export type CommentListHookObject = ReturnType<typeof useCommentList>;
