import { Comment as TypeComment } from 'keekijanai-type';
import { useCallback } from 'react';
import _ from 'lodash';
import { useCommentContext } from '../context';
import { useRequestList } from '../../../../core/request';

export function useCommentList(id: number | undefined) {
  const {
    scope,
    refresh,
    commentService,
    mainPageSize,
    subPageSize,
  } = useCommentContext();
  
  const {
    data: comments,
    loading,
    total,
    error,
    pagination,
  } = useRequestList(
    (info, inputs) => {
      const { id } = inputs;
      const { page, pageSize } = info.pagination;
      return commentService.list(id, { skip: page - 1, take: pageSize });
    },
    {
      id,
      refreshTag: refresh.tag,
    } as const,
    {
      pagination: {
        page: 1,
        pageSize: id === undefined ? mainPageSize : subPageSize,
        mode: 'loadMore',
      },
    }
  );

  const loadMore = pagination.loadMore;
  const hasMore = total - (comments?.length ?? 0) > 0;

  return {
    comments,
    loading,
    error,
    total,
    loadMore,
    hasMore,
  };
}