import { Comment as TypeComment } from 'keekijanai-type';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tap } from 'rxjs/operators';
import { createNotNilContextState, useMemoExports, useRequestState, useUnmountCancel } from '../../util';
import { userContext, useUser } from '../User/controller';
import _ from 'lodash';
import { CommentCachableService } from 'keekijanai-client-core';

interface ContextValue {
  commentCachableService: CommentCachableService;
}

const [useCommentContextValue, CommentProvider] = createNotNilContextState<ContextValue, { scope: string }>(
  (props) => ({
    commentCachableService: new CommentCachableService(props.scope),
  })
);

export {
  useCommentContextValue,
  CommentProvider
}

export function useCommentList(
  parent?: TypeComment.Get,
  manual: boolean = false,
) {
  const unmountCancel = useUnmountCancel();
  const { commentCachableService } = useCommentContextValue();
  const { userService } = useContext(userContext);

  const [comments, setComments] = useState<TypeComment.List['comments']>();
  const [total, setTotal] = useState<number>();

  const [page, setPage] = useState(1);

  const [loading, setLoadingState] = useState<'init-loading' | 'loading' | 'error' | 'done'>('init-loading');
  const [lastError, setLastError] = useState<string | null>(null);

  const _query = useCallback((nextPage: number) => {
    setLoadingState(prev => prev === 'init-loading' ? prev : 'loading');
    const rsp = commentCachableService
      .list(parent?.id, nextPage - 1)
      .pipe(
        userService.blockTapBatch(data => data.comments.map(c => c.userId)),
        unmountCancel(),
      )
      .subscribe({
        error: err => {
          setLoadingState('error');
          setLastError(err);
        },
        next: res => {
          setLoadingState('done');
          setComments(res.comments);
          setTotal(res.total);
        },
      });
    return rsp;
  }, []);

  const query = useCallback(() => {
    return _query(page);
  }, [page]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
    _query(nextPage);
  }, [_query]);

  const create = useCallback((scope: string, comment: TypeComment.Create, referenceId?: number) => {
    const rsp = commentCachableService
      .create({
        ...comment,
        scope,
        parentId: parent?.id,
        referenceId: referenceId ?? parent?.id,
      })
      .pipe(
        unmountCancel(),
      )
    return rsp;
  }, []);

  useEffect(() => {
    if (!manual) {
      query();
    }
  }, []);

  const exports = useMemoExports({
    parent,
    comments,
    total,
    page,
    pageSize: 5,
    loading,
    lastError,
    query,
    changePage,
    create,
  });

  return exports;
}

export function useCommentLoad(id: number) {
  const unmountCancel = useUnmountCancel();
  const reqState = useRequestState();
  const { loading, lastError } = reqState;

  const { commentCachableService } = useCommentContextValue();
  const { userService } = useContext(userContext);

  const [comment, setComment] = useState<TypeComment.Get>();

  const query = useCallback(() => {
    reqState.toloading();
    const rsp = commentCachableService
      .get(id)
      .pipe(
        userService.blockTapBatch(data => [data.userId]),
        unmountCancel(),
      )
      .subscribe({
        next: c => {
          setComment(c);
          reqState.toDone();
        },
        error: err => {
          if (err?.status < 500) {
            reqState.toError(err?.response?.error);
          } else {
            reqState.toError(err?.message || err);
          }
        }
      });
    return rsp;
  }, [id]);
  
  useEffect(() => {
    const subscription = query();
    return () => {
      subscription.unsubscribe();
    }
  }, [query]);

  const exports = useMemoExports({
    query,
    comment,
    loading,
    lastError,
  });

  return exports;
}

export function useComment(
  nativeComment: TypeComment.Get,
  parent: TypeComment.Get | undefined,
) {
  const [comment, setComment] = useState(nativeComment);
  const unmountCancel = useUnmountCancel();
  const { commentCachableService } = useCommentContextValue();
  const { user } = useUser(comment.userId);
  const [actionState, setActionState] = useState<'removing' | 'replying' | undefined>(undefined);

  const reQuery = useCallback(() => {
    commentCachableService
      .get(comment.id)
      .pipe(
        unmountCancel(),
      )
      .subscribe(setComment)
  }, []);

  const remove = useCallback(() => {
    setActionState('removing');
    return commentCachableService
      .delete(comment.id)
      .pipe(
        unmountCancel(),
        tap(() => { setActionState(undefined) })
      )
  }, []);

  const reply = useCallback((created: TypeComment.Create, asParent: boolean = true) => {
    setActionState('replying');
    return commentCachableService
      .create({
        ...created,
        referenceId: comment.id,
        parentId: asParent ? comment.id : parent?.id,
      }).pipe(
        tap(reQuery),
        unmountCancel(),
        tap({
          error: () => setActionState(undefined),
          next: () => setActionState(undefined),
        }),
      )
  }, [reQuery]);

  const exports = useMemo(() => ({
    remove,
    reply,
    reQuery,
    actionState,
    user,
    parent,
    comment
  }), [remove, reply, reQuery, comment, actionState, user, parent]);

  return exports;
}

export function getCommentListHookObjectCore(commentListHookObject: CommentListHookObject) {
  return _.pick(commentListHookObject, ['page', 'pageSize', 'total', 'loading', 'comments', 'changePage']);
  // return _.merge(
  //   {},
  //   _.pick(commentListHookObject, ['page', 'pageSize', 'total', 'loading', 'comments', 'changePage'])
  // );
}

export type CommentListHookObject = ReturnType<typeof useCommentList>;
export type CommentLoadHookObject = ReturnType<typeof useCommentLoad>;
export type CommentHookObject = ReturnType<typeof useComment>;
