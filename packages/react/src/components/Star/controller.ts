import { useCallback, useReducer } from "react";
import { useState } from "react";
import { Star } from 'keekijanai-type';
import { mergeMap, mergeMapTo, tap } from 'rxjs/operators';
import { incrReducer, useMemoExports } from "../../util";
import { useStarContextValue, StarProvider } from './context';
import { useObservable, useSubscription } from "observable-hooks";
import { FetchResponse, INIT_PENDING_FETCH_RESPONSE, mapToRsp } from "../../util/request";
import { StarType } from "keekijanai-type/dist/services/star";

export { useStarContextValue, StarProvider } from './context';

export function useStar() {
  const { starService } = useStarContextValue();
  const [starRsp, setStarRsp] = useState<FetchResponse<Star.Get>>(INIT_PENDING_FETCH_RESPONSE);

  const starRsp$ = useObservable(
    input$ => input$.pipe(
      mergeMap(() => starService
        .get()
        .pipe(
          mapToRsp(),
        )
      )
    ),
    []
  );

  const post = useCallback((val: Star.StarType) => {
    if (starRsp.stage !== 'done') {
      throw Error('should call after starRsp done');
    }
    const { current } = starRsp.data;
    const next = typeof current === 'number' && val === current ? null : val;
    return starService
      .post(next)
      .pipe(
        tap(result => {
          setStarRsp({ stage: 'done', data: result, error: null, })
        })
      )
  }, [starRsp]);

  useSubscription(starRsp$, setStarRsp)

  const exports = useMemoExports({
    starRsp,
    post,
  });
  return exports;
}