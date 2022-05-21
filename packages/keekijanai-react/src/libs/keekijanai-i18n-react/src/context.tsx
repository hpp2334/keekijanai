import { I18n } from "@keekijanai/frontend-core/libs/i18n";
import React, { useContext, useMemo } from "react";

interface _I18nContextValue {
  instance: I18n | null;
}

export interface I18ContextProps {
  instance: I18n;
  children?: React.ReactNode;
}

const _defaultContextValue: _I18nContextValue = {
  instance: null,
};

const _context = React.createContext<_I18nContextValue>(_defaultContextValue);

export function useInternalI18nInstance() {
  const { instance } = useContext(_context);
  console.debug("[useInternalI18nInstance]", { instance });
  if (!instance) {
    throw new Error(
      "i18 instance is null. Did you forget to wrap current component in <I18nContext>...</I18nContext>?"
    );
  }
  return instance;
}

export function I18nContext(props: I18ContextProps) {
  console.debug("[I18nContext]", { props });
  const ctxValue: _I18nContextValue = useMemo(
    () => ({
      instance: props.instance,
    }),
    [props.instance]
  );

  return <_context.Provider value={ctxValue}>{props.children}</_context.Provider>;
}
