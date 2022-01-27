import { useCallback, useRef, useState } from "react";
import { State, StateType } from "../state";

export const useRemote = <ARGS extends any[], R>(remoteFn: (...args: ARGS) => Promise<R>) => {
  const [state, setState] = useState<State<R>>({
    type: StateType.Pending,
    data: null,
    err: null,
  });
  const remoteFnRef = useRef(remoteFn);
  remoteFnRef.current = remoteFn;

  const handler = useCallback((...args: ARGS) => {
    setState({
      type: StateType.Loading,
      data: null,
      err: null,
    });
    const ret = remoteFnRef.current(...args);

    ret
      .then((data) => {
        setState({
          type: StateType.Loaded,
          data,
          err: null,
        });
      })
      .catch((err) => {
        setState({
          type: StateType.Failed,
          data: null,
          err: err,
        });
      });
    return ret;
  }, []);

  return [state, handler] as const;
};
