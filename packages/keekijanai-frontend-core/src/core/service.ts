import { container } from "./container";

export interface ServiceFactory<A extends any[], R> {
  factory: (...args: A) => R;
}

export interface Service {
  destroy?: () => void;
}

const isServiceFactory = (classTarget: any): classTarget is new (...args: any[]) => ServiceFactory<any[], any> => {
  return Reflect.getMetadata("service:isFactory", classTarget);
};

export function createService<S extends new (...args: any[]) => any>(
  Service: S
): S extends new (...args: any[]) => infer R ? R : never;
export function createService<
  R extends Service,
  A extends any[],
  SF extends ServiceFactory<A, R>,
  S extends new (...args: any[]) => SF
>(ServiceFactory: S, ...args: A): ReturnType<InstanceType<S>["factory"]>;
export function createService(Service: any, ...args: any[]): any {
  if (isServiceFactory(Service)) {
    const serviceFactory = new Service();
    const service = serviceFactory.factory(...args);
    return service;
  } else {
    return container.resolve(Service);
  }
}

// Decorators

export const serviceFactory = () => {
  const decorator: ClassDecorator = function (target) {
    Reflect.defineMetadata("service:isFactory", true, target);
  };
  return decorator;
};
