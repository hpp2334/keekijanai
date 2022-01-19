import { useReducer } from "react";

const _incr = (x: number) => x + 1;
export const useRefreshToken = () => {
  const [token, refresh] = useReducer(_incr, 0);

  return [token, refresh] as const;
};

export const EMPTY_LIST = Object.seal([]) as any;
