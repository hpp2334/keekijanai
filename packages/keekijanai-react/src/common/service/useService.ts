import { createService, destoryService, OnInit } from "@keekijanai/frontend-core";
import { useEffect, useMemo, useRef } from "react";

export const useService = <S extends new (..._args: any[]) => any>(
  Service: S,
  ...args: InstanceType<S> extends OnInit<infer ARGS> ? ARGS : []
): S extends new (..._args: any[]) => infer R ? R : any => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const service = useMemo(() => createService(Service, ...args), args);

  useEffect(() => {
    return () => {
      destoryService(service);
    };
  }, [service]);

  return service;
};
