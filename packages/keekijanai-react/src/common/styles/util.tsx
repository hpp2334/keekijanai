import clsx from "clsx";
import React from "react";

export interface CommonStylesProps {
  className?: string;
  style?: React.CSSProperties;
}

export function injectCSS<P extends CommonStylesProps, T extends React.ComponentType<P>>(Component: T, cls: string): T;
export function injectCSS<T extends keyof JSX.IntrinsicElements>(
  Component: T,
  cls: string
): React.ComponentType<JSX.IntrinsicElements[T]>;
export function injectCSS<P extends CommonStylesProps, T extends React.ComponentType<P> | string>(
  Component: T,
  cls: string
): T {
  const InnerComponent = Component as React.ComponentType<P>;
  const WrappedComponent = React.forwardRef<any, P>(function WrappedComponent(props: P, ref) {
    return <InnerComponent ref={ref} {...props} className={clsx(cls, props.className)} />;
  });

  return WrappedComponent as any as T;
}
