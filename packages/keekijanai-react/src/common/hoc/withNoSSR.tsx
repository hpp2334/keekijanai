import React from "react";

export function withNoSSR<P>(Component: React.ComponentType<P>) {
  function WrappedNoSSR(props: P) {
    if (typeof window === "undefined") {
      return null;
    }
    return <Component {...props} />;
  }
  return WrappedNoSSR;
}
