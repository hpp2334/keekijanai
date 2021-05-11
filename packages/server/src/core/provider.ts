import { Context, Core } from "../type";
import { Manager } from "./manager";

abstract class ProviderBase implements Core.Provider {
  protected abstract services: Record<string, Core.ServiceConstructor<any>>;
  private _ctx?: Context;

  constructor(public config?: any) {}

  get context() {
    if (!this._ctx) {
      throw Error('should set context before get.');
    }
    return this._ctx;
  }
  set context(ctx: Context) {
    this._ctx = ctx;
  }

  get manager() {
    return this.context.manager;
  }

  getServiceConstructor(name: string): Core.ServiceConstructor {
    const ctr = this.services[name];
    if (!ctr) {
      throw Error(`Cannot get service constructor for "${name}"`);
    }
    return ctr;
  }
}

abstract class ProviderFactoryBase<T extends ProviderBase> implements Core.ProviderFactory {
  abstract factory(ctx: Context, confg?: any): Promise<T>;
}

export {
  ProviderBase as Provider,
  ProviderFactoryBase as ProviderFactory,
}
