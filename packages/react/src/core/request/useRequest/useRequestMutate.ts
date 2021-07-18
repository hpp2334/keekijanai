import { useObservable, useSubscription } from "observable-hooks";
import { useCallback, useState } from "react";
import { lastValueFrom, Observable } from "rxjs";
import _ from 'lodash';
import { mergeMap, tap } from "rxjs/operators";
import { PaginationCore, PaginationHook, PaginationParams, usePagination } from "../pagination";
import { useKeekijanaiContext } from "../../context";
import { getResponseError, UseRequestCommonOpts } from "./shared";

export type UseRequestMutateOpts<T> = UseRequestCommonOpts<T>;

type UseRequestMutateReturn<RUN_ARGS extends any[]> = {
  run: (...args: RUN_ARGS) => void;
  loading: boolean;
}

export function useRequestMutate<T, ARGS extends any[]> (
  getObservable: (...args: ARGS) => Observable<T>,
  opts?: UseRequestMutateOpts<T>,
): UseRequestMutateReturn<ARGS> {
  const ctx = useKeekijanaiContext();
  if (opts?.notification) {
    opts.notification.instance = opts.notification.instance || ctx.notification;
  }

  const [loading, setLoading] = useState(false);

  const run = useCallback((...args: ARGS) => {
    setLoading(true);
    const obMutateReq = getObservable(...args)
      .pipe(
        tap({
          next: _.partial(setLoading, false),
          error: _.partial(setLoading, false),
        }),
      );

    obMutateReq.subscribe({
      next: (rsp) => {
        opts?.onSuccess?.(rsp);

        if (opts?.notification) {
          const { instance, template } = opts.notification;
          instance?.message('success', template.success(rsp));
        }
      },
      error: (err) => {
        opts?.onFail?.(err);

        if (opts?.notification) {
          const { instance, template } = opts.notification;
          console.log('in useRequest', template.error(getResponseError(err)), instance);
          instance?.message('error', template.error(getResponseError(err)));
        }
      },
    });
    return lastValueFrom(obMutateReq);
  }, [getObservable, opts?.onSuccess, opts?.onFail]);

  return {
    loading,
    run,
  }
}