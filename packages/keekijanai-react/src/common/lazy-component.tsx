import { useRefresh } from "@/libs/keekijanai-i18n-react/src/util";
import React, { useLayoutEffect, useRef } from "react";

export type LazyCommentImport<C extends React.ComponentType<any>> = () => Promise<C>;
export interface CreateLazyComponentParams<C extends React.ComponentType<any>> {
  import: LazyCommentImport<C>;
  fallback: C;
}

export function createLazyComponent<C extends React.ComponentType<any>>(params: CreateLazyComponentParams<C>) {
  function LazyComponent(props: any) {
    const Fallback = params.fallback;
    const resolvedRef = useRef<C | null>(null);
    const [_token, updateToken] = useRefresh();

    useLayoutEffect(() => {
      params.import().then((ResolvedComponent) => {
        resolvedRef.current = ResolvedComponent;
        updateToken();
      });
    }, [updateToken]);

    if (!resolvedRef.current) {
      return <Fallback {...props} />;
    }
    const ResolvedComponent = resolvedRef.current;
    return <ResolvedComponent {...props} />;
  }
  return LazyComponent as C;
}
