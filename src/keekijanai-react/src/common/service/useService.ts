import { createService, OnInit } from "@keekijanai/frontend-core";
import { useRef } from "react";

export const useService = <S extends new (..._args: any[]) => any>(
  Service: S,
  ...args: InstanceType<S> extends OnInit<infer ARGS> ? ARGS : []
): S extends new (..._args: any[]) => infer R ? R : any => {
  const service = useRef(createService(Service, ...args));

  return service.current;
};
