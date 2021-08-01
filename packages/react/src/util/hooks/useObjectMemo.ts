import { useRef } from "react";
import { objectShallowEqual } from "..";

export function useObjectMemo(inputs: any) {
  const refInputs = useRef(inputs);

  if (!objectShallowEqual(inputs, refInputs.current)) {
    refInputs.current = inputs;
  }

  return refInputs.current;
}
