import {
  comment as commentService,
} from 'keekijanai-client-core';
import { Comment as TypeComment } from 'keekijanai-type';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Observable, of } from 'rxjs';
import { map, mergeAll, switchMapTo, tap } from 'rxjs/operators';
import { useMemoExports, useRequestState } from '../../util';
import { batchUsers, useUser } from '../User/controller';
import _ from 'lodash';

export function useCommentList(
  scope: string,
  take: number = 5,
  parent?: TypeComment.Get,
  manual: boolean = false,
  onCommentDelete?: () => void,
  onCommentCreate?: () => void,
) {
  take = take ?? 5;

  const [comments, setComments] = useState<TypeComment.List['comments']>();
  const [total, setTotal] = useState<number>();

  const [page, setPage] = useState(1);

  const [pageSize] = useState(take);
  const [loading, setLoadingState] = useState<'init-loading' | 'loading' | 'error' | 'done'>('init-loading');
  const [lastError, setLastError] = useState<string | null>(null);

  const _query = useCallback((nextPage: number) => {
    setLoadingState(prev => prev === 'init-loading' ? prev : 'loading');
    const rsp = commentService
      .list(scope, parent?.id, { skip: nextPage - 1, take })
      .pipe(
        map((list: TypeComment.List) => {
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
          setComments(res.comments);
          setTotal(res.total);
        },
      });
    return rsp;
  }, []);

  const query = useCallback(() => {
    _query(page);
  }, [page]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
    _query(nextPage);
  }, [_query]);


  const emitCommentDelete = useCallback(() => {
    onCommentDelete?.();
    query();
  }, [onCommentDelete, query]);

  const emitCommentCreate = useCallback(() => {
    onCommentCreate?.();
    query();
  }, [onCommentCreate, query]);

  const create = useCallback((scope: string, comment: TypeComment.Create, referenceId?: number) => {
    const rsp = commentService
      .create(scope, {
        ...comment,
        scope,
        parentId: parent?.id,
        referenceId: referenceId ?? parent?.id,
      })
      .pipe(
        tap(emitCommentCreate),
      )
    return rsp;
  }, [emitCommentCreate]);

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
    pageSize,
    loading,
    lastError,
    query,
    changePage,
    create,
    emitCommentDelete,
    emitCommentCreate,
  });

  return exports;
}

export function useCommentLoad(id: number) {
  const reqState = useRequestState();
  const { loading, lastError } = reqState;

  const [comment, setComment] = useState<TypeComment.Get>();

  const query = useCallback(() => {
    reqState.toloading();
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
    query();
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
  const { scope } = comment;
  const { user } = useUser(comment.userId);
  const [actionState, setActionState] = useState<'removing' | 'replying' | undefined>(undefined);

  const remove = useCallback(() => {
    setActionState('removing');
    return commentService
      .delete(scope, comment.id, comment.parentId)
      .pipe(
        tap(() => { onCommentDelete?.() }),
        tap(() => { setActionState(undefined) })
      )
  }, [onCommentDelete]);

  const reply = useCallback((created: TypeComment.Create, asParent = true) => {
    setActionState('replying');
    return commentService
      .create(scope, {
        ...created,
        referenceId: comment.id,
        parentId: asParent ? comment.id : undefined,
      }).pipe(
        tap(() => {
          onCommentReply?.();
        }),
        tap(() => { setActionState(undefined) })
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
  return _.merge(
    {
      onCommentCreate: commentListHookObject.emitCommentCreate,
      onCommentDelete: commentListHookObject.emitCommentDelete,
    },
    _.pick(commentListHookObject, ['page', 'pageSize', 'total', 'loading', 'comments', 'changePage'])
  );
}

export type CommentListHookObject = ReturnType<typeof useCommentList>;
export type CommentLoadHookObject = ReturnType<typeof useCommentLoad>;
export type CommentHookObject = ReturnType<typeof useComment>;
