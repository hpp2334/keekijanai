import { useCallback, useEffect } from "react";
import { useState } from "react";
import { StarService } from 'keekijanai-client-core';
import { Star } from 'keekijanai-type';
import { createNotNilContextState, useMemoExports, useRequestState } from "../../util";

interface ContextValue {
  starService: StarService;
}

const [useStarContextValue, StarProvider] = createNotNilContextState<ContextValue, { scope: string }>(
  props => ({
    starService: new StarService(props.scope),
  })
);

export {
  useStarContextValue,
  StarProvider
}

export function useStar() {
  const [current, setCurrent] = useState<null | -1 | 0 | 1>();
  const [total, setTotal] = useState<number>();
  const reqState = useRequestState();
  const { starService } = useStarContextValue();
  const { loading } = reqState;

  const update = useCallback((val: any) => {
    setCurrent(val.current);
    setTotal(val.total);
    reqState.toDone();
  }, [])

  const get = useCallback(() => {
    reqState.toloading();
    starService
      .get()
      .subscribe({
        next: update
      })
  }, []);

  const post = useCallback((val: Star.StarType) => {
    reqState.toloading();
    const next = typeof current === 'number' && val === current ? null : val;
    starService
      .post(next)
      .subscribe({
        next: update
      })
  }, [current]);

  useEffect(() => {
    get();
  }, [get])

  const exports = useMemoExports({
    current,
    total,
    loading,
    get,
    post,
  });
  return exports;
}