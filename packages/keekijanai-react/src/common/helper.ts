import React, { useCallback, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";

export const EMPTY_LIST = Object.seal([]) as any;

export const once = (fn: () => any) => {
  const NO_CACHE = Symbol();
  let cache: any = NO_CACHE;
  return () => {
    if (cache !== NO_CACHE) {
      return cache;
    }
    cache = fn();
  };
};

const _incr = (x: number) => x + 1;
export const useRefreshToken = () => {
  const [token, refresh] = useReducer(_incr, 0);

  return [token, refresh] as const;
};

export const useSwitch = (defaultValue?: boolean) => {
  const [value, setValue] = useState(defaultValue ?? false);

  const open = useCallback(() => {
    setValue(true);
  }, [setValue]);

  const close = useCallback(() => {
    setValue(false);
  }, [setValue]);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const exported = useMemo(
    () => ({
      isOpen: value,
      open,
      close,
      toggle,
    }),
    [open, close, toggle, value]
  );

  return exported;
};

// https://stackoverflow.com/questions/54633690/how-can-i-use-multiple-refs-for-an-array-of-elements-with-hooks
export const useRefList = <T>(len: number) => {
  const itemsRef = useRef<T[]>([]);
  const [_token, refreshToken] = useRefreshToken();

  useMemo(() => {
    itemsRef.current = itemsRef.current.slice(0, len);
  }, [len]);

  const setRef = useCallback((index: number, ref: T) => {
    const prev = itemsRef.current[index];
    itemsRef.current[index] = ref;
    if (!prev) {
      refreshToken();
    }
  }, []);

  const getRef = useCallback((index: number) => {
    return itemsRef.current[index];
  }, []);

  const exported = useMemo(
    () => ({
      getRef,
      setRef,
    }),
    [getRef, setRef]
  );

  return exported;
};

export const useSingletonTimeout = () => {
  const timerIdRef = useRef<number | undefined>(undefined);

  const cancel = useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
    }
  }, []);

  const schedule = useCallback(
    (fn: () => void, timeoutMs: number) => {
      cancel();
      timerIdRef.current = setTimeout(() => {
        timerIdRef.current = undefined;
        fn();
      }, timeoutMs) as unknown as number;
    },
    [cancel]
  );

  const exported = useMemo(
    () => ({
      cancel,
      schedule,
    }),
    [cancel, schedule]
  );

  return exported;
};

export const range = (start: number, end: number) =>
  Array.from({ length: end - start })
    .fill(0)
    .map((v, index) => start + index);

export const nextTick = (fn: () => void) => {
  if (typeof Promise !== "undefined") {
    Promise.resolve(null).then(fn);
  } else {
    fn();
  }
};

export const nextFrame = (fn: () => void) => {
  if (typeof setTimeout !== "undefined") {
    setTimeout(() => {
      fn();
    }, 16);
  } else {
    fn();
  }
};
