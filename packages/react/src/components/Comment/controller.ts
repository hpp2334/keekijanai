import { Comment as TypeComment } from 'keekijanai-type';
import { useCallback, useContext, useState } from 'react';
import { mergeMap, startWith, tap } from 'rxjs/operators';
import { useMemoExports } from '../../util';
import { userContext, useUser } from '../User/controller';
import _ from 'lodash';
import { useObservable, useSubscription } from 'observable-hooks';
import { throwError } from 'rxjs';
import { FetchResponse, INIT_PENDING_FETCH_RESPONSE, mapToRsp } from '../../util/request';
import { useCommentContextValue } from './context';

export { CommentProvider } from './context';

export function useCommentList(
  id: number | undefined,
) {
  const { scope, commentCachableService, mutationCounts, updateMutationCounts } = useCommentContextValue();
  const { userService } = useContext(userContext);

  const [total, setTotal] = useState<number>();
  const [page, changePage] = useState(1);
  const [haveData, setHaveData] = useState(false);

  const [commentsRsp, setCommentsRsp] = useState<FetchResponse<TypeComment.List>>(INIT_PENDING_FETCH_RESPONSE);
  const commentsRsp$ = useObservable<FetchResponse<TypeComment.List>, [number, number]>(
    inputs$ => inputs$.pipe(
      mergeMap(([nextPage]) => {
        return commentCachableService
        .list(id, nextPage - 1)
        .pipe(
          mapToRsp(),
          userService.blockTapBatch(({ data }) => !data ? [] : data.comments.map(c => c.userId)),
          tap(({ data }) => data && setTotal(data.total)),
          tap(({ stage }) => stage === 'done' && setHaveData(true)),
        )
      })
    ),
    [page, id === undefined ? mutationCounts : 0]
  );

  const create = useCallback((comment: Pick<TypeComment.Create, 'content' | 'plainText'>, referenceId: number | undefined) => {
    return commentCachableService
      .create({
        ...comment,
        scope,
        parentId: id,
        referenceId,
      })
      .pipe(
        tap(updateMutationCounts),
      );
  }, [id]);

  useSubscription(commentsRsp$, {
    error: setCommentsRsp,
    next: next => {
      setCommentsRsp(prev => {
        if (next.stage !== 'done' && prev.stage === 'done') {
          return {
            ...next,
            data: prev.data,
          } as any;
        } else {
          return next;
        }
      });
    }
  });

  const exports = useMemoExports({
    commentsRsp,
    total,
    page,
    pageSize: 5,
    haveData,
    changePage,
    create,
  });

  return exports;
}


export function useComment(
  id: number
) {
  const { scope, commentCachableService, mutationCounts, updateMutationCounts } = useCommentContextValue();
  const [commentRsp, setCommentRsp] = useState<FetchResponse<TypeComment.Get>>(INIT_PENDING_FETCH_RESPONSE);
  const { userRsp } = useUser(commentRsp.data?.userId);
  
  const commentRsp$ = useObservable<FetchResponse<TypeComment.Get>, [number]>(
    input$ => input$.pipe(
      mergeMap(([id]) => commentCachableService
        .get(id)
        .pipe(
          mapToRsp(),
        )
      )
    ),
    [id]
  )

  const remove = useCallback(() => {
    return commentCachableService
      .delete(id)
      .pipe(
        tap(updateMutationCounts)
      )
  }, [id]);

  useSubscription(commentRsp$, setCommentRsp);

  const exports = useMemoExports({
    remove,
    userRsp,
    commentRsp
  });

  return exports;
}

export type CommentListHookObject = ReturnType<typeof useCommentList>;
export type CommentHookObject = ReturnType<typeof useComment>;


