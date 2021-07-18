import { useReducer, useState } from "react";

export interface RefreshHook {
  tag: number;
  update: () => void;
}

function incrReducer(c: number) {
  return c + 1;
}

export function useRefresh() {
  const [tag, update] = useReducer(incrReducer, 0);

  const exports: RefreshHook = {
    tag,
    update,
  }
  return exports;
}
