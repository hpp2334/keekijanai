import { getResponseError, UseRequestCommonOpts } from './shared';
import { PaginationCore, PaginationHook, PaginationParams, usePagination } from "../pagination";
import { useObservable, useSubscription } from 'observable-hooks';
import { useState, useCallback, useMemo } from 'react';
import { Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { useObjectMemo } from '../../../util/hooks/useObjectMemo';


export type UseRequestGetOpts<T> = UseRequestCommonOpts<T>;

export type UseRequestGetReturn<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  mutate: (next: T) => void;
}

export function useRequestGet<T, INPUTS extends {}> (
  getObservable: (info: {}, inputs: INPUTS) => Observable<T>,
  inputs: INPUTS,
  opts?: UseRequestGetOpts<T>,
): UseRequestGetReturn<T> {
  const [data, setData] = useState<T>(null as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const memoziedInputs = useObjectMemo(inputs);

  const observableRequestInfo = useMemo(() => ({
  }), []);

  const observableInputs = [
    observableRequestInfo,
    memoziedInputs,
  ] as const;

  const mutate = useCallback((next: T) => {
    setData(next);
  }, []);

  const data$ = useObservable<T, typeof observableInputs>(
    inputs$ => inputs$.pipe(
      tap(() => setLoading(true)),
      mergeMap((deps) => getObservable(deps[0], deps[1])),
    ),
    observableInputs as any,
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
    mutate,
  }
}