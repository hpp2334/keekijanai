import { useRefresh } from "@/libs/keekijanai-i18n-react/src/util";
import React, { useLayoutEffect, useRef } from "react";

interface CreateLazyComponentParams<C extends React.ComponentType<any>> {
  import: () => Promise<C>;
  fallback: () => React.ReactElement;
}

export function createLazyComponent<C extends React.ComponentType<any>>(params: CreateLazyComponentParams<C>) {
  function LazyComponent(props: any) {
    const resolvedRef = useRef<C | null>(null);
    const [_token, updateToken] = useRefresh();

    useLayoutEffect(() => {
      params.import().then((ResolvedComponent) => {
        resolvedRef.current = ResolvedComponent;
        updateToken();
      });
    }, [updateToken]);

    if (!resolvedRef.current) {
      return params.fallback();
    }
    const ResolvedComponent = resolvedRef.current;
    return <ResolvedComponent {...props} />;
  }
  return LazyComponent as C;
}
