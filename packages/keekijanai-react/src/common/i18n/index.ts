import { i18n } from "@keekijanai/frontend-core";
import { useLayoutEffect, useRef } from "react";
export { I18nContext, useTranslation, type I18ContextProps } from "@/libs/keekijanai-i18n-react";

export function useAutoUpdateResource(
  namespace: string,
  fetchResource: (lang: string, namespace: string) => Promise<any>
) {
  const fetchResourceRef = useRef(fetchResource);
  fetchResourceRef.current = fetchResource;

  console.debug("[useAutoUpdateResource]", { namespace });

  useLayoutEffect(() => {
    return i18n.setResourceFetchHandler(namespace, (lang) => fetchResourceRef.current(lang, namespace));
  }, [namespace]);
}

export { i18n };
