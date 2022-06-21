import { useRefreshToken } from "@/common/helper";
import { useSubscription } from "observable-hooks";
import { useRef } from "react";
import { BehaviorSubject } from "rxjs";

export function useUncachedObservableEagerState<T>(observable: BehaviorSubject<T>) {
  const [, refresh] = useRefreshToken();
  const stateRef = useRef(observable.value);

  useSubscription(observable, {
    next: function (value) {
      stateRef.current = value;
      refresh();
    },
  });

  return stateRef.current;
}
