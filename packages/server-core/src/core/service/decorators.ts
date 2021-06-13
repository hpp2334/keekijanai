import { providerManager } from "@/core/provider";
import { ClassType } from "@/type/util";
import { serviceManager } from "./manager";
import { ServiceDecoratorParams } from "./type";

const serviceBase = {
  $$type: 'service',
  providerManager,
}

export function ServiceDecorator(params: ServiceDecoratorParams) {
  const { key, middlewares } = params;

  return function <T extends ClassType>(ctor: T) {
    Object.setPrototypeOf(ctor.prototype, serviceBase);
    ctor.prototype.$$key = key;
    ctor.prototype.$$middlewares = middlewares;
    return ctor;
  }
}

export function InjectServiceDecorator(key: string) {
  return function (target: any, propKey: string): any {
    const services = target.$$injectServices = target.$$injectServices ?? [];
    services.push([propKey, key]);
  }
}

export function InitDecorator(type?: 'config') {
  return function (target: any, propKey: string): any {
    const item = {
      type,
      handler: target[propKey],
    };
    const inits = target.$$inits = target.$$inits ?? [];
    inits.push(item);
  }
}
