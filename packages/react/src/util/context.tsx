import React, { useContext, useMemo, useState } from "react";

export type ProviderProps <CTX_PROPS = never> = {
  ctxProps: CTX_PROPS;
  children?: React.ReactNode;
}
type ProviderWithoutProps = (props: Omit<ProviderProps, 'ctxProps'>) => JSX.Element;
type ProviderWithProps<CTX_PROPS> = (props: ProviderProps<CTX_PROPS>) => JSX.Element;

export function useNotNilContextValueFactory <T>(context: React.Context<T | null>) {
  return () => {
    const value = useContext(context);
    if (value === null) {
      throw Error("context value is null");
    }
    return value;
  }
}

export function createNotNilContextState<T>(initHandler: () => T): [() => T, ProviderWithoutProps];
export function createNotNilContextState<T, CTX_PROPS>(initHandler: (props: CTX_PROPS) => T): [() => T, ProviderWithProps<CTX_PROPS>];

export function createNotNilContextState<T, CTX_PROPS>(
  initHandler: (ctxProps: CTX_PROPS) => T
): [() => T, (props: ProviderProps<CTX_PROPS>) => JSX.Element] {
  const context = React.createContext<T | null>(null);

  const useNotNilContextValue = useNotNilContextValueFactory(context);

  function Provider(props: ProviderProps<CTX_PROPS>) {
    const { children } = props;
    const [ctxValue] = useState(initHandler(props.ctxProps));

    return (
      <context.Provider value={ctxValue}>
        {children}
      </context.Provider>
    )
  }

  return [useNotNilContextValue, Provider];
}

export function withContexts <T>(...ctxs: Array<ProviderWithProps<T>>) {
  return function enhance (Container: (props: T) => JSX.Element) {
    return function ContextsInner(props: T) {
      const node = <Container {...props} />
      const Result = useMemo(
        () => ctxs.reduceRight((pre, Cur) => (
          <Cur ctxProps={props}>
            {pre}
          </Cur>
        ), node),
        [props, ...ctxs, Container]
      );
      return Result;
    }
  }
}
