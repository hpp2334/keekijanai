import React from "react";

type HOC<P extends React.ComponentType<any>> = (Component: P) => P;

export function composeHOC<P extends React.ComponentType<any>>(...hocs: HOC<P>[]): HOC<P>;
export function composeHOC(...hocs: HOC<any>[]): HOC<any> {
  return function composedHOC(Component) {
    const EnhancedComponent = hocs.reduceRight((EnhancingComponent, hoc) => hoc(EnhancingComponent), Component);
    return EnhancedComponent;
  };
}
