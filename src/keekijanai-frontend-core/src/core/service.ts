import { container } from "tsyringe";

export interface OnInit<ARGS extends any[] = []> {
  initialize: (...args: ARGS) => void;
}

const hasInitSet = new WeakSet<any>();

const SYM_ONINIT = Symbol("OnInit");

const hasImplOnInit = <S>(x: S): x is S & OnInit<any> => {
  return x && typeof x === "object" && "initialize" in x;
};

export const callInit = <ARGS extends any[], S extends { initialize: (...args: ARGS) => void }>(
  service: S,
  ...args: ARGS
) => {
  if (!hasInitSet.has(service)) {
    hasInitSet.add(service);
    service.initialize(...args);
  }
};

export const createService = <S extends new (...args: any[]) => any>(
  Service: S,
  ...args: S extends OnInit<infer ARGS> ? ARGS : []
): S extends new (...args: any[]) => infer R ? R : any => {
  const service = container.resolve(Service);
  if (hasImplOnInit(service)) {
    callInit(service, ...args);
  }
  return service;
};