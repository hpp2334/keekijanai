import { Comment as TypeComment } from 'keekijanai-type';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Observable, of } from 'rxjs';
import { map, mergeAll, switchMapTo, tap } from 'rxjs/operators';
import { useMemoExports, useRequestState, useUnmountCancel } from '../../util';
import { batchUsers, useUser } from '../User/controller';
import _ from 'lodash';
import { CommentCachable } from 'keekijanai-client-core';
import { useMountedState } from 'react-use';

interface CommentContext {
  service: CommentCachable;
}

export const commentContext = React.createContext<CommentContext | undefined>(undefined);

export function useCommentCachable() {
  const ctx = useContext(commentContext);

  if (!ctx?.service) {
    throw Error('not wrap comment context');
  }
  return ctx.service;
}

export function useCommentList(
  parent?: TypeComment.Get,
  manual: boolean = false,
  onCommentCreate?: () => void,
) {
  const unmountCancel = useUnmountCancel();
  const service = useCommentCachable();

  const [comments, setComments] = useState<TypeComment.List['comments']>();
  const [total, setTotal] = useState<number>();

  const [page, setPage] = useState(1);

  const [loading, setLoadingState] = useState<'init-loading' | 'loading' | 'error' | 'done'>('init-loading');
  const [lastError, setLastError] = useState<string | null>(null);

  const _query = useCallback((nextPage: number) => {
    setLoadingState(prev => prev === 'init-loading' ? prev : 'loading');
    const rsp = service
      .list(parent?.id, nextPage - 1)
      .pipe(
        map((list: TypeComment.List) => {
          const ids = list.comments.map(c => c.userId);

          return batchUsers(ids).pipe(
            switchMapTo(of(list))
          )
        }),
        mergeAll(),
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
    const rsp = service
      .create({
        ...comment,
        scope,
        parentId: parent?.id,
        referenceId: referenceId ?? parent?.id,
      })
      .pipe(
        unmountCancel(),
        tap(() => onCommentCreate?.()),
      )
    return rsp;
  }, [onCommentCreate]);

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

  const service = useCommentCachable();

  const [comment, setComment] = useState<TypeComment.Get>();

  const query = useCallback(() => {
    reqState.toloading();
    const rsp = service
      .get(id)
      .pipe(
        map(c => {
          const id = c.userId;
          
          return batchUsers([id]).pipe(
            switchMapTo(of(c))
          )
        }),
        mergeAll(),
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
  comment: TypeComment.Get,
  parent: TypeComment.Get | undefined,
  onCommentDelete?: () => void,
  onCommentReply?: () => void,
) {
  const unmountCancel = useUnmountCancel();
  const service = useCommentCachable();
  const { user } = useUser(comment.userId);
  const [actionState, setActionState] = useState<'removing' | 'replying' | undefined>(undefined);

  const remove = useCallback(() => {
    setActionState('removing');
    return service
      .delete(comment.id)
      .pipe(
        unmountCancel(),
        tap(() => { onCommentDelete?.() }),
        tap(() => { setActionState(undefined) })
      )
  }, [onCommentDelete]);

  const reply = useCallback((created: TypeComment.Create, asParent: boolean = true) => {
    setActionState('replying');
    return service
      .create({
        ...created,
        referenceId: comment.id,
        parentId: asParent ? comment.id : parent?.id,
      }).pipe(
        unmountCancel(),
        tap({
          error: () => setActionState(undefined),
          next: () => setActionState(undefined),
        }),
        tap(() => onCommentReply?.()),
      )
  }, [onCommentReply]);

  const exports = useMemo(() => ({
    remove,
    reply,
    actionState,
    user,
    parent,
    comment
  }), [remove, reply, actionState, user, parent]);

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
