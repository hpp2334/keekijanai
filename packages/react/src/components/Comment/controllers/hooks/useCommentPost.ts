import { Comment as TypeComment } from 'keekijanai-type';
import { useCallback } from 'react';
import _ from 'lodash';
import { useCommentContext } from '../context';
import { useRequestMutate } from '../../../../core/request';

export function useCommentPost() {
  const {
    scope,
    commentService,
    stores,
    refresh,
    t,
  } = useCommentContext();

  const { state, dispatch } = stores.post;

  const {
    run,
    loading,
  } = useRequestMutate(
    (
      comment: Pick<TypeComment.Create, 'content' | 'plainText'>,
      parentId: number | undefined,
      referenceId: number | undefined,
    ) => {
      return commentService.create({
        ...comment,
        parentId,
        referenceId,
      });
    },
    {
      notification: {
        template: {
          success: (rsp) => {
            return t("CREATE_COMMENT_SUCCESS");
          },
          error: (err) => {
            return t("CREATE_COMMENT_ERROR");
          },
        }
      },
      onSuccess: () => {
        refresh.update();
      },
    },
  );

  const post = useCallback(
    async (comment: Pick<TypeComment.Create, 'content' | 'plainText'>) => {
      return run(comment, state.parentId, state.referenceId);
    },
    [state.parentId, state.referenceId]
  );

  return {
    state,
    dispatch,
    post,
    loading,
  };
}