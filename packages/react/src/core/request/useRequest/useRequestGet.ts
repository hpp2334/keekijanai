import { getResponseError, UseRequestCommonOpts } from './shared';
import { PaginationCore, PaginationHook, PaginationParams, usePagination } from "../pagination";
import { useObservable, useSubscription } from 'observable-hooks';
import { useState, useCallback } from 'react';
import { Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';


export type UseRequestGetOpts<T> = UseRequestCommonOpts<T>;

export type UseRequestGetReturn<T> = {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useRequestGet<T, DEPS extends any[]> (
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