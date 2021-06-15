import { SelectParams, Response, UpdateParams, Where, DeleteParams, ProviderBase, InsertParams, DecoratedProvider, Order } from "./type";
import _ from 'lodash';
import { configReader } from "../config";
import assert from "assert";
import { Memo } from "@/utils/decorators/memo";

type TransformKeyHandler = (s: string) => string;
interface WrapperProviderOptions {
  table?: {
    from: string;
    keys: string[];
  }
}

class WrapperProvider {
  private _opts: WrapperProviderOptions
  constructor(
    private provider: ProviderBase & DecoratedProvider,
    _opts: WrapperProviderOptions
  ) {
    const { transformCamel } = provider.options;
    const opts = _.cloneDeep(_opts);
    if (transformCamel) {
      opts.table?.keys.forEach(_.snakeCase);
    }
    this._opts = opts;
  }

  get opts() {
    const _opts = this._opts;
    return {
      get table() {
        assert(_opts.table, 'should configure table opts');
        return _opts.table;
      }
    }
  }

  async insert <T = any>(params: Omit<InsertParams, 'from' | 'keys'>) {
    const provider = this.provider;
    const { transformCamel } = provider.options;
    const { table: tableOpts } = this.opts;
    
    const resolvedParams: InsertParams = {
      ...params,
      ...tableOpts,
    };
    const normalizedParams = !transformCamel ? resolvedParams : this.transformInsertParams(resolvedParams, _.snakeCase);
    const rsp = await provider.insert<T>(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, _.camelCase);
    return rsp;
  }

  async select <T = any>(params: Omit<SelectParams, 'from' | 'keys'>) {
    const provider = this.provider;
    const { transformCamel } = provider.options;
    const { table: tableOpts } = this.opts;
    const resolvedParams: SelectParams = {
      ...params,
      ...tableOpts,
    };

    const normalizedParams = !transformCamel ? resolvedParams : this.transformSelectParams(resolvedParams, _.snakeCase);
    const rsp = await provider.select<T>(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, _.camelCase);
    return rsp;
  }

  async update <T = any>(params: Omit<UpdateParams, 'from' | 'keys'>) {
    const provider = this.provider;
    const { transformCamel } = provider.options;
    const { table: tableOpts } = this.opts;
    const resolvedParams: UpdateParams = {
      ...params,
      ...tableOpts,
    };

    const normalizedParams = !transformCamel ? resolvedParams : this.transformUpdateParams(resolvedParams, _.snakeCase);
    const rsp = await provider.update<T>(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, _.camelCase);
    return rsp;
  }

  async delete(params: Omit<DeleteParams, 'from' | 'keys'>) {
    const provider = this.provider;
    const { transformCamel } = provider.options;
    const { table: tableOpts } = this.opts;
    const resolvedParams: DeleteParams = {
      ...params,
      ...tableOpts,
    };

    const normalizedParams = !transformCamel ? resolvedParams : this.transformDeleteParams(resolvedParams, _.snakeCase);
    const rsp = await provider.delete(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, _.camelCase);
    return rsp;
  }

  private transformSelectParams(params: SelectParams, handler: TransformKeyHandler): SelectParams {
    return {
      ...params,
      where: this.transformWhere(params.where, handler),
      order: params.order?.map(v => [handler(v[0]), v[1]] as Order[0]),
      columns: params.columns?.map(item => handler(item)),
    };
  }
  private transformInsertParams(params: InsertParams, handler: TransformKeyHandler): InsertParams {
    return {
      ...params,
      payload: this.transformPayload(params.payload, handler),
    };
  }
  private transformUpdateParams(params: UpdateParams, handler: TransformKeyHandler): UpdateParams {
    return {
      ...params,
      where: this.transformWhere(params.where, handler),
      payload: this.transformPayload(params.payload, handler),
    }
  }
  private transformDeleteParams(params: DeleteParams, handler: TransformKeyHandler) {
    return {
      ...params,
      where: this.transformWhere(params.where, handler),
    };
  }
  private transformResponseBody(body: any, handler: TransformKeyHandler) {
    return !Array.isArray(body) ? body : body?.map((item) => {
      return this.transformPayload(item, handler);
    });
  }
  private transformWhere(where: Where | undefined, handler: TransformKeyHandler): Where | undefined {
    if (!where) {
      return undefined;
    }
    const list = Object.entries(where);
    const mappedList = list.map(([key, pair]) => [
      handler(key),
      pair
    ] as [string, Where[string]]);
    const res = Object.fromEntries(mappedList);
    return res;
  }
  private transformPayload(payload: any, handler: TransformKeyHandler) {
    return !_.isObjectLike(payload) ? payload : _.mapKeys(payload, (value, key) => handler(key));
  }
}

export class ProviderManager {
  private _internalProviderMap: Map<any, any> = new Map();

  async closeAll() {
    const providers = [...this._internalProviderMap.values()];
    await Promise.allSettled(providers.map(async provider => {
      await provider?.onClose();
    }))
  }

  getProvider(key: string, opts: WrapperProviderOptions): WrapperProvider {
    const internalProvider = this.getInternalProviderInstance(key);
    const wrapperProvider = new WrapperProvider(internalProvider, opts);
    return wrapperProvider;
  }

  private getInternalProviderInstance(key: string) {
    const item = configReader.config.providers[key] ?? configReader.config.providers['default'];
    assert(item, `Not configuire provider for "${key}". No default provider found.`)

    const [Provider, config] = item;
    let provider = this._internalProviderMap.get(Provider);
    if (!provider) {
      this._internalProviderMap.set(Provider, provider = new Provider(config) as any);
    }
    return provider;
  }
}

export const providerManager = new ProviderManager();
