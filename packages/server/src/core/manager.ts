import { ConfigReader } from "../config";
import { ViewServiceImpl } from "../providers/supabase/services/view";
import { Config, Context, Core } from "../type";
import { Service, serviceFactory } from "./service";

import createDebugger from 'debug';
const debug = createDebugger('keekijanai:core:manager');


export class Manager {
  private _mapService = new WeakMap<object, Map<string, Core.Service>>();
  constructor(public configReader: ConfigReader) {}

  async getService (ctx: Context, name: string): Promise<Core.UnknownService> {
    let map = this._mapService.get(ctx);
    if (!map) {
      this._mapService.set(ctx, map = new Map<string, Core.Service>());
    }
  
    let cached = map.get(name);
    if (cached) {
      return cached;
    }
  
    const [factory, config] = this.configReader.getProviderFactory(name);
    debug('get providerFactory: %s %s', name, factory.constructor.name);
    const provider = await factory.factory(ctx, config);
    const serviceConstructor = provider.getServiceConstructor(name);
    const service = serviceFactory(serviceConstructor, ctx, provider);
    map.set(name, service);
    return service;
  }
}
