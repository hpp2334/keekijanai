import { useCallback, useState } from "react";
import { PaginationProps } from 'antd';

export type PaginationParams = {
  page?: number,
  pageSize?: number;
}

export type PaginationCore = {
  skip: number;
  take: number;
}

export type PaginationHook = ReturnType<typeof usePagination>;

export function usePagination(params: PaginationParams | undefined, total: number) {
  const [page, setPage] = useState(params?.page ?? 1);
  const [pageSize, setPageSize] = useState(params?.pageSize ?? 10);

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

  return {
    page,
    pageSize,
    change,
    getCore,
    toAntd,
  }
}