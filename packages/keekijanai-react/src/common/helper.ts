import { useCallback, useMemo, useReducer, useState } from "react";

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
