import { createNonNullContext } from "@/common/react";
import React, { useEffect, useMemo, useRef } from "react";
import { useAuthService } from "./logic";
import { AuthService } from "@keekijanai/frontend-core";
import { useAutoUpdateResource } from "@/common/i18n";

interface AuthContextValue {
  authService: AuthService;
}

const [internalAuthContext, useInternalAuthContext] = createNonNullContext<AuthContextValue>();

export { useInternalAuthContext };

export const AuthContext = ({ children }: { children: React.ReactNode }) => {
  useAutoUpdateResource("Auth", (lang) => import(`./locales/${lang}.json`));

  const authService = useAuthService();

  console.debug("[AuthContext]", { authService });

  const ctxValue: AuthContextValue = useMemo(
    () => ({
      authService,
    }),
    [authService]
  );

  return <internalAuthContext.Provider value={ctxValue}>{children}</internalAuthContext.Provider>;
};
