import { useCallback, useReducer } from "react";
import { useState } from "react";
import { Star } from 'keekijanai-type';
import { mergeMap, mergeMapTo, tap } from 'rxjs/operators';
import { incrReducer, useMemoExports } from "../../util";
import { useObservable, useSubscription } from "observable-hooks";
import { FetchResponse, INIT_PENDING_FETCH_RESPONSE, mapToRsp } from "../../util/request";
import { Star as StarType } from "keekijanai-type";
import { useStarContext } from "./context";
import { useRequestGet } from "../../core/request";
import { useAuthV2 } from "../Auth/controller";

export { useStarContext, StarContext } from './context';

export function useStar() {
  const authHook = useAuthV2();
  const { starService } = useStarContext();
  const [posting, setPosting] = useState(false);

  const {
    data,
    loading,
    error,
    mutate,
  } = useRequestGet(
    () => {
      return starService.get();
    },
    {
      authUser: authHook.user,
    }
  );

  const post = useCallback((val: Star.StarType) => {
    if (loading) {
      throw Error('should call after get star done');
    }
    const { current } = data;
    const next = typeof current === 'number' && val === current ? null : val;
    setPosting(true);
    return starService
      .post(next)
      .pipe(
        tap({
          next: () => setPosting(false),
          error: () => setPosting(false),
        }),
        tap(result => {
          mutate(result);
        }),
      )
  }, [data, loading, error, mutate]);


  const exports = useMemoExports({
    data,
    loading,
    error,
    post,
    posting,
  });
  return exports;
}
