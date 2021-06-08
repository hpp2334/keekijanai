import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react'
import { MonoTypeOperatorFunction, Observable, Observer, Subject } from 'rxjs';
import { useMountedState, useUnmount } from 'react-use';
import { takeUntil, take } from 'rxjs/operators';

export { withContexts, createNotNilContextState } from './context';

export const noop: (...args: any[]) => any = () => {};

export const handleStopPropagation = (ev: any) => { ev.stopPropagation(); }

export function toSearch(obj: any) {
  for (const key in obj) {
    obj[key] = encodeURIComponent(obj[key]);
  }
  return new URLSearchParams(obj);
}

export function useIsMount() {
  let isMount = true;

  useEffect(() => {
    isMount = true;
    return () => {
      isMount = false
    };
  }, []);

  return isMount;
}

export function useForceUpdate() {
  const [, setX] = useState(0);

  const forceUpdate = useCallback(() => {
    setX(x => x ^ 1);
  }, []);

  return forceUpdate;
}

export function useSwitch(defaultValue = false) {
  const [open, setOpen] = useState(defaultValue);
  const on = useCallback(() => { setOpen(true) }, []);
  const off = useCallback(() => { setOpen(false) }, []);
  const switchOpen = useCallback(() => { setOpen(x => !x) }, []);

  return useMemoExports({
    open,
    on,
    off,
    switchOpen,
  })
}

export function useMemoExports<T extends {}>(obj: T) {
  const memozied = useMemo(() => obj, [Object.values(obj)]);

  return memozied;
}


type ReqState = 'loading' | 'done' | 'error';
export function useRequestState(init?: ReqState) {
  const [loading, setLoading] = useState<ReqState>(init ?? 'loading');
  const [lastError, setLastError] = useState();

  const toDone = useCallback(() => {
    setLoading('done');
  }, []);

  const toloading = useCallback(() => {
    setLoading('loading')
  }, []);

  const toError = useCallback((err: any) => {
    setLoading('error');
    setLastError(err?.message || err);
  }, []);

  const exports = useMemoExports({ loading, lastError, toDone, toloading, toError });
  return exports;
}

export function useUnmountCancel() {
  const [subject] = useState(new Subject());
  const mounted = useMountedState();
  useUnmount(() => {
    subject.next(true);
    subject.complete();
  });

  const handler = useCallback(
    <T>(): MonoTypeOperatorFunction<T> => {
      if (!mounted()) {
        return take(0);
      } else {
        return takeUntil(subject)
      }
    },
    []
  );

  return handler;
}