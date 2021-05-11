import { useCallback } from "react";
import { useState } from "react";
import { star } from 'keekijanai-client-core';
import { Star } from 'keekijanai-type';
import { useMemoExports } from "../../util";

export function useStar(scope: string) {
  const [current, setCurrent] = useState<null | -1 | 0 | 1>();
  const [total, setTotal] = useState<number>();

  const update = useCallback((val: any) => {
    setCurrent(val.current);
    setTotal(val.total);
  }, [])

  const get = useCallback(() => {
    star
      .get(scope)
      .subscribe({
        next: update
      })
  }, [scope]);

  const post = useCallback((val: Star.StarType) => {
    const next = typeof current === 'number' && val === current ? null : val;
    star
      .post(scope, next)
      .subscribe({
        next: update
      })
  }, [scope]);

  const handlePostLike = useCallback(() => { post(1) }, [post]);
  const handlePostMama = useCallback(() => { post(0) }, [post]);
  const handlePostUnlike = useCallback(() => { post(-1) }, [post]);

  const exports = useMemoExports({
    current,
    total,
    get,
    post,
    handlePostLike,
    handlePostMama,
    handlePostUnlike,
  });
  return exports;
}