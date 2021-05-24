import { ContextType } from '@/core/context';
import { ServiceType } from '.';
import { configReader } from '../config';
import { DecoratedService, ServiceBase } from './type';

type ServiceInstanceMap = Map<string, ServiceType.ServiceBase & DecoratedService>;

export class ServiceManager {
  private _cacheMap = new WeakMap<ContextType.Context, ServiceInstanceMap>();

  getMiddlewares() {
    return [];
  }

  instantiate(key: string, ctx: ContextType.Context): ServiceBase {
    let map = this._cacheMap.get(ctx);
    let cachedService: ServiceType.ServiceBase & DecoratedService | undefined = undefined;
    if (!map) {
      map = new Map();
    } else {
      cachedService = map.get(key);
    }

    if (cachedService) {
      return cachedService;
    } else {
      const [Service, config] = configReader.getService(key);
      cachedService = new Service() as any as (ServiceType.ServiceBase & DecoratedService);
     
      // process injected services
      if (cachedService.$$injectServices) {
        this.processInjectServices(cachedService, cachedService.$$injectServices, ctx);
      }
      // process init handlers
      if (cachedService.$$inits) {
        this.processInit(cachedService, cachedService.$$inits, ctx, { config });
      }

      return cachedService;
    }
  }

  processInjectServices(target: any, services: Exclude<DecoratedService['$$injectServices'], undefined>, ctx: ContextType.Context) {
    for (const [propertyKey, serviceKey] of services) {
      target[propertyKey] = this.instantiate(serviceKey, ctx);
    }
  }
  processInit(target: any, services: Exclude<DecoratedService['$$inits'], undefined>, ctx: ContextType.Context, extra?: { config: any }) {
    for (const { type, handler } of services) {
      switch (type) {
        case 'config':
          handler.call(target, extra?.config);
          break;
        default:
          handler.call(target);
          break;
      }
    }
  }
}

export const serviceManager = new ServiceManager();