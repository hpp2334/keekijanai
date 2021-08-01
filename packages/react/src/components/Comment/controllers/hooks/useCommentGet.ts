import { useRequestGet } from "../../../../core/request";
import { useCommentContext } from "..";

export function useCommentGet(id: number) {
  const {
    scope,
    refresh,
    commentService,
    mainPageSize,
    subPageSize,
  } = useCommentContext();

  const {
    data: comment,
    error,
    loading,
  } = useRequestGet(
    (info, inputs) => {
      return commentService.get(id);
    },
    {},
  );

  return {
    comment,
    error,
    loading,
  }
}
