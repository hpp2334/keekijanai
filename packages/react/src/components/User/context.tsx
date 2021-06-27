import React from "react";
import { UserService } from 'keekijanai-client-core';
import { useNotNilContextValueFactory } from "../../util/context";
import { useMemo } from "react";
import { useKeekijanaiContext } from "../../core/context";

interface UserContextValue {
  userService: UserService;
}

interface UserContextProps {
  children?: React.ReactNode;
}

const userContext = React.createContext<UserContextValue | null>(null);

export const useUserContext = useNotNilContextValueFactory(userContext);

export const UserContext = (props: UserContextProps) => {
  const {
    children
  } = props;

  const { client } = useKeekijanaiContext();

  const ctxValue = useMemo(() => ({
    userService: new UserService(client),
  }), [client]);

  return (
    <userContext.Provider value={ctxValue}>
      {children}
    </userContext.Provider>
  );
}
