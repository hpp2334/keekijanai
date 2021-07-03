import React, { useState } from "react";
import { AuthService } from 'keekijanai-client-core';
import { useNotNilContextValueFactory } from "../../util/context";
import { useMemo } from "react";
import { useKeekijanaiContext } from "../../core/context";
import { useEffect } from "react";

interface AuthContextValue {
  authService: AuthService;
}

interface AuthContextProps {
  children?: React.ReactNode;
}

const authContext = React.createContext<AuthContextValue | null>(null);

export const useAuthContext = useNotNilContextValueFactory(authContext);

export const AuthContext = (props: AuthContextProps) => {
  const {
    children
  } = props;

  const { client } = useKeekijanaiContext();

  const [ctxValue] = useState(() => ({
    authService: new AuthService(client),
  }));
  const { authService } = ctxValue;

  useEffect(() => {
    authService.initialize();
    return () => {
      authService.uninitialize();
    }
  }, [authService]);

  return (
    <authContext.Provider value={ctxValue}>
      {children}
    </authContext.Provider>
  );
}
