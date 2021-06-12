import { ClassType } from '@/type/util';
import { providerManager } from '@/core/provider';
import { ContextType } from '../context';
import { MiddlewareType } from '../middleware';

export interface Init {
  type?: 'config';
  handler: Function;
}

class ServiceBase {
  ctx!: ContextType.Context;

  get provider() {
    return providerManager;
  }
}

export interface DecoratedService {
  $$key: string;
  $$type: string,
  $$inits?: Array<{
    type?: string;
    handler: Function;
  }>
  $$injectServices?: [string, string][];
  $$middlewares?: MiddlewareType.Middleware[];
}

export type {
  ServiceBase
}

export interface ServiceDecoratorParams {
  key: string;
  middlewares?: MiddlewareType.Middleware[];
}

export type ServiceConstructor = ClassType<ServiceBase>;
