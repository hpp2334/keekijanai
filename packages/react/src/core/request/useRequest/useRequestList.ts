import { getResponseError, UseRequestCommonOpts } from './shared';
import { PaginationCore, PaginationHook, PaginationParams, usePagination } from "../pagination";
import { useObservable, useSubscription } from 'observable-hooks';
import { useState, useCallback, useMemo, useRef } from 'react';
import { Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { objectShallowEqual } from '../../../util';

interface IList {
  data: any[];
  total: number;
}

export type UseRequestListReturn<
  T,
  USE_PAGINATION extends PaginationParams | false,
> = {
  data: T[];
  total: number;
  loading: boolean;
  error: string | null;
  pagination: USE_PAGINATION extends false ? undefined : PaginationHook;
  run: () => void;
};

export function useRequestList<
  OT extends IList,
  USE_PAGINATION extends PaginationParams | false,
  INPUTS extends {},
  T = OT extends { data: (infer R)[] } ? R : unknown,
>(
  getObservable: (
    info: {
      pagination: USE_PAGINATION extends false ? undefined : PaginationParams
      mutationTag: number;
    },
    inputs: INPUTS,
  ) => Observable<OT>,
  inputs: INPUTS,
  opts: UseRequestCommonOpts<OT> & {
    pagination: USE_PAGINATION;
  },
) {
  const [data, setData] = useState<T[]>(null as any);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationTag, setMutationTag] = useState<number>(0);
  const paginationHook = opts.pagination
    ? usePagination(opts.pagination, total)
    : undefined;
  const refInputs = useRef(inputs);

  if (!objectShallowEqual(inputs, refInputs.current)) {
    refInputs.current = inputs;
  }

  const run = useCallback(() => {
    setMutationTag(prev => prev + 1);
  }, [setMutationTag]);

  const observableRequestInfo = useMemo(() => ({
    pagination: paginationHook?.getCore(),
    mutationTag,
  }), [paginationHook?.getCore]);

  const observableInputs = [
    observableRequestInfo,
    refInputs.current,
  ] as const;

  const data$ = useObservable<OT, typeof observableInputs>(
    inputs$ => inputs$.pipe(
      tap(() => setLoading(true)),
      mergeMap((params) => getObservable(params[0] as any, params[1])),
    ),
    observableInputs as any,
  )

  useSubscription(data$, {
    next: rsp => {
      switch (paginationHook?.mode) {
        case 'loadMore':
          if (paginationHook.page === 1) {
            setData(rsp.data);  
          } else {
            setData(prev => [...prev, ...rsp.data]);
          }
          break;
        default:
          setData(rsp.data);
          break;
      }
      setTotal(rsp.total);
      setLoading(false);

      opts?.onSuccess?.(rsp);
    },
    /** @todo standardlize the error format and to support i18n */
    error: err => {
      setError(getResponseError(err));
      setLoading(false);
      console.error(err);

      opts?.onFail?.(err);
    },
  });

  const exports: UseRequestListReturn<T, USE_PAGINATION> = {
    data,
    total,
    loading,
    error,
    pagination: paginationHook as any,
    run,
  }
  return exports;
}