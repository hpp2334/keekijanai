import {
  comment as commentService,
} from 'keekijanai-client-core';
import { Comment as TypeComment } from 'keekijanai-type';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { tap } from 'rxjs/operators';
import { useMemoExports } from '../../util';

export function useComment(scope: string, parentId: number | undefined, take: number = 5) {
  const [list, setResult] = useState<TypeComment.List>();
  const [page, changePage] = useState(1);
  const [loadingState, setLoadingState] = useState<'loading' | 'creating' | 'removing' | 'error' | 'done'>('loading');
  const [lastError, setLastError] = useState<string | null>(null);

  const query = useCallback(() => {
    setLoadingState('loading');
    const rsp = commentService
      .list(scope, parentId, { skip: page - 1, take })
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
  }, [page, take]);

  const remove = useCallback((id: number) => {
    setLoadingState('removing');
    const rsp = commentService
      .delete(id)
      .subscribe({
        next: () => { changePage(1); }
      });
    return rsp;
  }, []);

  const create = useCallback((scope: string, comment: TypeComment.Create) => {
    setLoadingState('creating');
    const rsp = commentService
      .create(scope, comment)
      .subscribe({
        next: () => { changePage(1); }
      });
    return rsp;
  }, []);
  
  useEffect(() => {
    query();
  }, [page, take]);

  const exports = useMemoExports({
    list,
    page,
    loadingState,
    lastError,
    changePage,
    remove,
    create,
  });

  return exports;
}

export type CommentHookObject = ReturnType<typeof useComment>;
