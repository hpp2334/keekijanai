import _ from "lodash";
import { useMemo } from "react";
import { Observable, of, OperatorFunction } from "rxjs";
import { mergeMap, startWith, catchError, delay } from "rxjs/operators";

export type FetchResponse<T> = {
  stage: 'pending' | 'requesting';
  error: null;
  data: null;
} | {
  stage: 'error';
  error: string;
  data: null;
} | {
  stage: 'done';
  error: null;
  data: T;
}

export const INIT_PENDING_FETCH_RESPONSE: FetchResponse<any> = {
  stage: 'pending' as const,
  error: null,
  data: null
};

export const INIT_REQUESTING_FETCH_RESPONSE: FetchResponse<any> = {
  stage: 'requesting' as const,
  error: null,
  data: null
};

export const rethrowRspError = <T extends FetchResponse<any>>(): OperatorFunction<T, T> => (input$) => {
  const output$ = input$.pipe(
    mergeMap(v => {
      if (v.error) {
        throw v.error;
      }
      return of(v);
    })
  );
  return output$;
}

export const useFetchResponse = <T>(data: T): FetchResponse<T> => {
  const memozied = useMemo(() => ({
    data,
    error: null,
    stage: 'done' as const,
  }), [data]);
  return memozied;
}

export const transition = {
  pending: <T>(rsp: FetchResponse<T>): FetchResponse<T> => {
    return INIT_PENDING_FETCH_RESPONSE;
  }
}


// RxJS

export const mapToRsp = <T>(): OperatorFunction<T, FetchResponse<T>> => (input$) => {
  const output$ = input$.pipe(
    mergeMap(value => of({ stage: 'done' as const, error: null, data: value })),
    startWith(INIT_REQUESTING_FETCH_RESPONSE),
    catchError(err => of({ stage: 'error' as const, error: err?.response?.error ?? err?.message ?? err, data: null })),
  )
  return output$;
}

export const getRspError = (err: any) => {
  const clientError = err?.response?.error;

  if (!_.isNil(clientError)) {
    return clientError;
  } else if (err?.message === 'aborted' && err?.name === 'AjaxError') {
    return null;
  } else {
    return 'Unknown error';
  }
}
