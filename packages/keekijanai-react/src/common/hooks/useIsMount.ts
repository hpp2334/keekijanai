import React, { useCallback, useLayoutEffect, useRef } from "react";

export const useIsMount = () => {
  const isMountRef = useRef(true);

  const isMount = useCallback(() => isMountRef.current, []);

  useLayoutEffect(() => {
    return () => {
      isMountRef.current = false;
    };
  }, []);

  return isMount;
};
