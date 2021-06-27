import React, { useContext, useMemo, useState } from "react";

export type ProviderProps <CTX_PROPS = never> = {
  ctxProps: CTX_PROPS;
  children?: React.ReactNode;
}

export function useNotNilContextValueFactory <T>(context: React.Context<T | null>) {
  return () => {
    const value = useContext(context);
    if (value === null) {
      throw Error("context value is null");
    }
    return value;
  }
}
