import React, { useContext } from "react";

export interface CommonStylesProps {
  className?: string;
  style?: React.CSSProperties;
}

export const createNonNullContext = <T,>() => {
  const context = React.createContext<T | null>(null);

  const useContextValue = () => {
    const ctxValue = useContext(context);
    if (ctxValue === null) {
      throw new Error("context value should not be null. Did you forgot to pass it to context?");
    }
    return ctxValue;
  };
  return [context, useContextValue] as const;
};
