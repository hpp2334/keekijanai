import { SelectParams, Response, UpdateParams, Where, DeleteParams, ProviderBase, InsertParams, DecoratedProvider, Order } from "./type";
import _ from 'lodash';
import { configReader } from "../config";

type TransformKeyHandler = (s: string) => string;
const toUnderline: TransformKeyHandler = (s) => s.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
const toCamel: TransformKeyHandler = (s) => s.replace(/_([a-z])/g, (_, q) => q.toUpperCase())


export class ProviderManager {
  private defaultProvider?: ProviderBase & DecoratedProvider;

  async insert <T = any>(params: InsertParams, providerKey?: string) {
    const provider = this.getProvider(providerKey);
    const { transformCamel } = provider.options;

    const normalizedParams = !transformCamel ? params : this.transformInsertParams(params, toUnderline);
    const rsp = await provider.insert<T>(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, toCamel);
    return rsp;
  }

  async select <T = any>(params: SelectParams, providerKey?: string) {
    const provider = this.getProvider(providerKey);
    const { transformCamel } = provider.options;

    const normalizedParams = !transformCamel ? params : this.transformSelectParams(params, toUnderline);
    const rsp = await provider.select<T>(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, toCamel);
    return rsp;
  }

  async update <T = any>(params: UpdateParams, providerKey?: string) {
    const provider = this.getProvider(providerKey);
    const { transformCamel } = provider.options;

    const normalizedParams = !transformCamel ? params : this.transformUpdateParams(params, toUnderline);
    const rsp = await provider.update<T>(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, toCamel);
    return rsp;
  }

  async delete(params: DeleteParams, providerKey?: string) {
    const provider = this.getProvider(providerKey);
    const { transformCamel } = provider.options;

    const normalizedParams = !transformCamel ? params : this.transformDeleteParams(params, toUnderline);
    const rsp = await provider.delete(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, toCamel);
    return rsp;
  }

  private getProvider(key?: string): ProviderBase & DecoratedProvider {
    if (this.defaultProvider) {
      return this.defaultProvider;
    }
    const [Provider, config] = configReader.config.provider;
    return this.defaultProvider = new Provider(config) as any;
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
    return !where ? undefined : _.mapValues(where, li => li.map(v => [v[0], handler(v[1])] as Where[''][0]))
  }
  private transformPayload(payload: any, handler: TransformKeyHandler) {
    return !_.isObjectLike(payload) ? payload : _.mapKeys(payload, (value, key) => handler(key));
  }
}

export const providerManager = new ProviderManager();
