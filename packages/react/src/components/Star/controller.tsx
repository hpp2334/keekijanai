import { useCallback, useEffect } from "react";
import { useState } from "react";
import { star } from 'keekijanai-client-core';
import { Star } from 'keekijanai-type';
import { useMemoExports, useRequestState } from "../../util";

export function useStar(scope: string) {
  const [current, setCurrent] = useState<null | -1 | 0 | 1>();
  const [total, setTotal] = useState<number>();
  const reqState = useRequestState();
  const { loading } = reqState;

  const update = useCallback((val: any) => {
    setCurrent(val.current);
    setTotal(val.total);
    reqState.toDone();
  }, [])

  const get = useCallback(() => {
    reqState.toloading();
    star
      .get(scope)
      .subscribe({
        next: update
      })
  }, [scope]);

  const post = useCallback((val: Star.StarType) => {
    reqState.toloading();
    const next = typeof current === 'number' && val === current ? null : val;
    star
      .post(scope, next)
      .subscribe({
        next: update
      })
  }, [scope, current]);

  const handlePostLike = useCallback(() => { post(1) }, [post]);
  const handlePostMama = useCallback(() => { post(0) }, [post]);
  const handlePostUnlike = useCallback(() => { post(-1) }, [post]);

  useEffect(() => {
    get();
  }, [get])

  const exports = useMemoExports({
    current,
    total,
    loading,
    get,
    post,
    handlePostLike,
    handlePostMama,
    handlePostUnlike,
  });
  return exports;
}