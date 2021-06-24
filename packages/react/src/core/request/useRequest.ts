import { useObservable, useSubscription } from "observable-hooks";
import { useCallback, useState } from "react";
import { Observable } from "rxjs";
import _ from 'lodash';
import { mergeMap, tap } from "rxjs/operators";
import { PaginationCore, PaginationHook, PaginationParams, usePagination } from "./pagination";

type UseRequestCommonOpts<T> = {
  /** replace with real notification */
  notification?: any;
  onSuccess?: (rsp: T) => void;
  onFail?: (err: string) => void;
}

type UseRequestListOpts<OT, PAGINATION> = UseRequestCommonOpts<OT> & {
  loadMore?: boolean;
  pagination?: PAGINATION;
}

type UseRequestGetOpts<T> = UseRequestCommonOpts<T>;

type UseRequestMutateOpts<T> = UseRequestCommonOpts<T>;

type UseRequestListReturn<T> = {
  data: T[];
  total: number;
  loading: boolean;
  error: string | null;
  pagination: PaginationHook;
  run: () => void;
};

export type UseRequestGetReturn<T> = {
  data: T;
  loading: boolean;
  error: string | null;
}

type UseRequestMutateReturn<RUN_ARGS extends any[]> = {
  run: (...args: RUN_ARGS) => void;
  loading: boolean;
}

export function useRequest <T, DEPS extends any[]>(
  mode: 'get',
  getObservable: (deps: DEPS) => Observable<T>,
  deps: DEPS,
  opts?: UseRequestGetOpts<T>,
): UseRequestGetReturn<T>;

export function useRequest <T, ARGS extends any[]> (
  mode: 'mutate',
  getObservable: (...args: ARGS) => Observable<T>,
  opts?: UseRequestMutateOpts<T>,
): UseRequestMutateReturn<ARGS>;

export function useRequest<
  DEPS extends any[],
  OT extends { data: any[], total: number },
  PAGINATION extends PaginationParams | undefined,
  T = OT extends { data: (infer R)[] } ? R : unknown,
>(
  mode: 'list',
  getObservable: (params: {
    pagination: PAGINATION extends PaginationParams ? PaginationCore : undefined;
  }) => Observable<OT>,
  deps: DEPS,
  opts?: UseRequestListOpts<OT, PAGINATION>,
): UseRequestListReturn<T>;

export function useRequest(...args: any[]): any {
  const leftArgs = args.slice(1);
  if (args[0] === 'list') {
    return useRequestList(...leftArgs as [any, any, any]);
  } else if (args[0] === 'mutate') {
    return useRequestMutate(...leftArgs as [any, any]);
  } else if (args[0] === 'get') {
    return useRequestGet(...leftArgs as [any, any]);
  }
  throw Error('not support mode');
}

export function createRequestGetReturned <T>(data: T): UseRequestGetReturn<T> {
  return {
    data,
    error: null,
    loading: false,
  }
}

function useRequestGet<T, DEPS extends any[]> (
  getObservable: (deps: DEPS) => Observable<T>,
  deps: DEPS,
  opts?: UseRequestGetOpts<T>,
): UseRequestGetReturn<T> {

  const [data, setData] = useState<T>(null as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const data$ = useObservable<T, DEPS>(
    inputs$ => inputs$.pipe(
      tap(() => setLoading(true)),
      mergeMap((deps) => getObservable(deps)),
    ),
    deps,
  )

  useSubscription(data$, {
    next: rsp => {
      setData(rsp);
      setLoading(false);

      opts?.onSuccess?.(rsp);
    },
    /** @todo standardlize the error format and to support i18n */
    error: err => {
      setError(err);
      setLoading(false);

      opts?.onFail?.(err);
    },
  });

  return {
    data,
    loading,
    error,
  }
}

function useRequestMutate<T, ARGS extends any[]> (
  getObservable: (...args: ARGS) => Observable<T>,
  opts?: UseRequestMutateOpts<T>,
): UseRequestMutateReturn<ARGS> {
  const [loading, setLoading] = useState(false);

  const run = useCallback((...args: ARGS) => {
    setLoading(true);
    getObservable(...args)
      .pipe(
        tap({
          next: _.partial(setLoading, false),
          error: _.partial(setLoading, false),
        }),
      )
      .subscribe({
        next: (rsp) => {
          opts?.onSuccess?.(rsp);
        },
        error: (err) => {
          opts?.onFail?.(err);
        },
      })
  }, [getObservable, opts?.onSuccess, opts?.onFail]);

  return {
    loading,
    run,
  }
}

function useRequestList<
  T,
  DEPS extends any[],
  OT extends { data: T[], total: number },
>(
  getObservable: (params: {
    pagination: PaginationParams | undefined;
  }) => Observable<OT>,
  deps: DEPS,
  opts?: UseRequestListOpts<OT, any>,
) {
  const [paginationParams] = useState(opts?.pagination);

  const [data, setData] = useState<T[]>(null as any);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationTag, setMutationTag] = useState<number>(0);
  const paginationHook = paginationParams && usePagination(paginationParams, total);

  const run = useCallback(() => {
    setMutationTag(prev => prev + 1);
  }, [setMutationTag]);

  const calcDeps = [paginationHook?.getCore, mutationTag, ...deps];

  const data$ = useObservable<OT, typeof calcDeps>(
    inputs$ => inputs$.pipe(
      tap(() => setLoading(true)),
      mergeMap(([ getPagination ]) => getObservable({
        pagination: getPagination?.(),
      })),
    ),
    calcDeps,
  )

  useSubscription(data$, {
    next: rsp => {
      setTotal(rsp.total);
      setData(rsp.data);
      setLoading(false);

      opts?.onSuccess?.(rsp);
    },
    /** @todo standardlize the error format and to support i18n */
    error: err => {
      setError(err?.response?.message ?? err?.message ?? err);

      opts?.onFail?.(err);
    },
  });

  return {
    data,
    total,
    loading,
    error,
    pagination: paginationHook,
    run,
  }
}
