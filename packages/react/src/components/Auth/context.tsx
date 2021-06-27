import React from "react";
import { AuthService } from 'keekijanai-client-core';
import { useNotNilContextValueFactory } from "../../util/context";
import { useMemo } from "react";
import { useKeekijanaiContext } from "../../core/context";

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

  const ctxValue = useMemo(() => ({
    authService: new AuthService(client),
  }), [client]);

  return (
    <authContext.Provider value={ctxValue}>
      {children}
    </authContext.Provider>
  );
}
