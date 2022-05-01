import { useCallback, useEffect, useMemo } from "react";
import { useInternalI18nInstance } from "./context";
import { useRefresh } from "./util";

export function useTranslation(namespace: string) {
  const instance = useInternalI18nInstance();
  const [, refresh] = useRefresh();
  console.debug("[useTranslation]", { namespace, instance });

  const t = useCallback(
    (key: string) => {
      const content = instance.getContent(namespace, key);
      return content;
    },
    [instance, namespace]
  );

  useEffect(() => {
    instance.addResourceUpdatedListener(refresh);
  }, [instance, refresh]);

  const exported = useMemo(() => ({ t }), [t]);
  return exported;
}
