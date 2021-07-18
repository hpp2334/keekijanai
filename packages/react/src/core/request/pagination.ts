import { useCallback, useState } from "react";
import { PaginationProps } from 'antd';

export type PaginationParams = {
  page: number,
  pageSize: number;
  mode?: 'pageTurn' | 'loadMore';
}

export type PaginationCore = {
  skip: number;
  take: number;
}

export type PaginationHook = ReturnType<typeof usePagination>;

export function usePagination(params: PaginationParams | undefined, total: number) {
  const [page, setPage] = useState(params?.page ?? 1);
  const [pageSize, setPageSize] = useState(params?.pageSize ?? 10);
  const [mode, setMode] = useState(params?.mode ?? 'pageTurn');

  const change = setPage;

  const getCore = useCallback(() => ({
    page,
    pageSize,
  }), [page, pageSize]);

  const antdOnChange = useCallback((page: number, pageSize?: number) =>{
    setPage(page);
    if (typeof pageSize === 'number') {
      setPageSize(pageSize);
    }
  }, [setPage, setPageSize])

  const toAntd = useCallback((size?: 'default' | 'small'): PaginationProps => ({
    size,
    current: page,
    pageSize: pageSize,
    total,
    onChange: antdOnChange,
  }), [page, total, antdOnChange]);

  const loadMore = useCallback(() => {
    setPage(page => page + 1);
  }, []);

  return {
    page,
    pageSize,
    mode,
    change,
    getCore,
    toAntd,
    loadMore,
  }
}