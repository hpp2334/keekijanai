import React from "react";

export function withCSSBaseline<C extends React.ComponentType<any>>(Component: C): C;
export function withCSSBaseline(Component: any): any {
  return function ScopedCSSBaselineComponent(props: any) {
    return (
      <div className="keekijanai-reset">
        <Component {...props} />
      </div>
    );
  };
}
