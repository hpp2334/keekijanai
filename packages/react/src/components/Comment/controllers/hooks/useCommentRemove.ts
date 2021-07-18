import { Comment as TypeComment } from 'keekijanai-type';
import { useCallback } from 'react';
import _ from 'lodash';
import { useCommentContext } from '../context';
import { useRequestMutate } from "../../../../core/request";

export function useCommentRemove() {
  const {
    scope,
    commentService,
    refresh,
    t,
  } = useCommentContext();

  const {
    run,
    loading,
  } = useRequestMutate(
    (
      id: number,
    ) => {
      return commentService.delete(id);
    },
    {
      notification: {
        template: {
          success: (rsp) => {
            return t("DELETE_COMMENT_SUCESS");
          },
          error: (err) => {
            return t("DELETE_COMMENT_ERROR");
          },
        }
      },
      onSuccess: () => {
        refresh.update();
      },
    },
  );

  return {
    run,
    loading,
  };
}