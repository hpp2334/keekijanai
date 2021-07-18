import { useReducer } from "react";

export interface ContextStore<S, A> {
  state: S;
  dispatch: React.Dispatch<A>;
}

export function useContextStore<S, A> (storeObject: {
  reducer: (state: S, action: A) => S,
  initState: S,
}) {
  const { reducer, initState } = storeObject;
  const [state, dispatch] = useReducer(reducer, initState);
  const returned: ContextStore<S, A> = { state, dispatch };
  return returned;
}
