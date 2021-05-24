import { providerManager } from "@/core/provider";
import { ClassType } from "@/type/util";
import { serviceManager } from "./manager";
import { ServiceDecoratorParams } from "./type";

const serviceBase = {
  $$type: 'service',
  provider: providerManager
}

export function ServiceDecorator(params: ServiceDecoratorParams) {
  const { key } = params;

  return function <T extends ClassType>(ctor: T) {
    ctor.prototype = Object.create(serviceBase);
    ctor.prototype.$$key = key;
    return ctor;
  }
}

export function InjectServiceDecorator(key: string) {
  return function (target: any, propKey: string): any {
    if (target.$$type !== 'service' && target.$$type !== 'controller') {
      throw Error('should decorate API in service or controller.');
    }

    const services = target.$$injectServices = target.$$injectServices ?? [];
    services.push([propKey, key]);
  }
}

export function InitDecorator(type?: 'config') {
  return function (target: any, propKey: string): any {
    if (target.$$type !== 'service') {
      throw Error('should decorate API in service.');
    }

    const item = {
      type,
      handler: target[propKey],
    };
    const inits = target.$$inits = target.$$inits ?? [];
    inits.push(item);
  }
}
