import { useReducer } from "react";

function incrReducer(state: number, action: void) {
  return state + 1;
}

export function useRefresh() {
  return useReducer(incrReducer, 0);
}
