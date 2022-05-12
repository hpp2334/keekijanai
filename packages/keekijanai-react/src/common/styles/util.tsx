import clsx from "clsx";
import React from "react";

export interface CommonStyleProps {
  className?: string;
  style?: React.CSSProperties;
}

export function injectCSS<T extends React.ComponentType<CommonStyleProps>>(Component: T, cls: string | string[]): T;
export function injectCSS<P extends CommonStyleProps>(
  Component: (props: P) => JSX.Element,
  cls: string | string[]
): (props: P) => JSX.Element;
export function injectCSS<T extends keyof JSX.IntrinsicElements>(
  Component: T,
  cls: string | string[]
): React.ComponentType<JSX.IntrinsicElements[T]>;
export function injectCSS<P extends CommonStyleProps, T extends React.ComponentType<P> | string>(
  Component: T,
  cls: string | string[]
): T {
  const InnerComponent = Component as React.ComponentType<P>;
  const WrappedComponent = React.forwardRef<any, P>(function WrappedComponent({ className, ...leftProps }: P, ref) {
    delete (leftProps as any).ownerState;

    const classNames = typeof className === "object" ? className : [className];
    return <InnerComponent ref={ref} {...(leftProps as P)} className={clsx(cls, ...classNames)} />;
  });

  return WrappedComponent as any as T;
}
