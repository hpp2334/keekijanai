import { OnInit } from "@keekijanai/frontend-core";
import React, { useContext } from "react";
import { useService } from "./useService";

export const createServiceProvider = <S extends new (..._args: any[]) => any>(Service: S) => {
  const context = React.createContext<(S extends new (..._args: any[]) => infer R ? R : any) | null>(null);

  const useProvider = () => {
    const service = useContext(context);
    if (service === null) {
      throw new Error("service is null. Did you forget to wrap provider?");
    }
    return service;
  };

  const Provider: React.FC<{ args: InstanceType<S> extends OnInit<infer ARGS> ? ARGS : [] }> = ({ args, children }) => {
    const service = useService(Service, ...args);

    return <context.Provider value={service}>{children}</context.Provider>;
  };

  return { useProvider, Provider };
};
