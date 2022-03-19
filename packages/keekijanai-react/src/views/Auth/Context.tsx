import { createNonNullContext } from "@/common/react";
import React, { useEffect, useMemo, useRef } from "react";
import { useAuthService } from "./logic";
import { AuthService } from "@keekijanai/frontend-core";

interface AuthContextValue {
  authService: AuthService;
}

const [internalAuthContext, useInternalAuthContext] = createNonNullContext<AuthContextValue>();

export { useInternalAuthContext };

export const AuthContext = ({ children }: { children: React.ReactNode }) => {
  const authService = useAuthService();

  const ctxValue: AuthContextValue = useMemo(
    () => ({
      authService,
    }),
    [authService]
  );

  return <internalAuthContext.Provider value={ctxValue}>{children}</internalAuthContext.Provider>;
};
