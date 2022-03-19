import { ServiceFactory, Service, createService } from "@keekijanai/frontend-core";
import { useLayoutEffect, useMemo } from "react";

export function createServiceHook<S extends new (...args: any[]) => Service>(
  Service: S
): () => S extends new (...args: any[]) => infer R ? R : never;
export function createServiceHook<
  R extends Service,
  A extends any[],
  SF extends ServiceFactory<A, R>,
  S extends new (...args: any[]) => SF
>(ServiceFactory: S): (...args: Parameters<InstanceType<S>["factory"]>) => ReturnType<InstanceType<S>["factory"]>;
export function createServiceHook(Service: any): any {
  return function useCustomService(...args: any[]) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const service = useMemo(() => createService(Service, ...args), [...args]);

    useLayoutEffect(() => {
      return () => {
        if (service.destory) {
          service.destory();
        }
      };
    }, [service]);

    return service;
  };
}
