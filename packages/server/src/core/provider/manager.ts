import { SelectParams, Response, UpdateParams, Where, DeleteParams } from "./type";
import _ from 'lodash';

type TransformKeyHandler = (s: string) => string;
const toUnderline: TransformKeyHandler = (s) => s.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
const toCamel: TransformKeyHandler = (s) => s.replace(/_([a-z])/g, (_, q) => q.toUpperCase())


export class ProviderManager {
  private defaultProvider!: any;

  async select <T = any>(params: SelectParams, providerKey?: string) {
    const provider = this.getProvider(providerKey);
    const { transformCamel } = provider.options;

    const normalizedParams = !transformCamel ? params : this.transformSelectParams(params, toUnderline);
    const rsp: Response<T> = await this.defaultProvider.select(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, toCamel);
    return rsp;
  }

  async update <T = any>(params: UpdateParams, providerKey?: string) {
    const provider = this.getProvider(providerKey);
    const { transformCamel } = provider.options;

    const normalizedParams = !transformCamel ? params : this.transformUpdateParams(params, toUnderline);
    const rsp: Response<T> = await this.defaultProvider.select(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, toCamel);
    return rsp;
  }

  async delete(params: DeleteParams, providerKey?: string) {
    const provider = this.getProvider(providerKey);
    const { transformCamel } = provider.options;

    const normalizedParams = !transformCamel ? params : this.transformDeleteParams(params, toUnderline);
    const rsp: Response<any> = await this.defaultProvider.select(normalizedParams);
    rsp.body = this.transformResponseBody(rsp.body, toCamel);
    return rsp;
  }

  private getProvider(key?: string) {
    return this.defaultProvider;
  }

  private transformSelectParams(select: SelectParams, handler: TransformKeyHandler) {
    return {
      ...select,
      where: !select.where ? undefined : _.mapValues(select.where, li => li.map(v => [handler(v[0]), v[1]])),
      order: select.order?.map(li => li.map(v => [handler(v[0]), v[1]])),
      columns: select.columns?.map(item => handler(item)),
    };
  }
  private transformUpdateParams(params: UpdateParams, handler: TransformKeyHandler) {
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
  private transformWhere(where: Where | undefined, handler: TransformKeyHandler) {
    return !where ? undefined : _.mapValues(where, li => li.map(v => [handler(v[0]), v[1]]))
  }
  private transformPayload(payload: any, handler: TransformKeyHandler) {
    return !_.isObjectLike(payload) ? payload : _.mapKeys(payload, (value, key) => handler(key));
  }
}

export const providerManager = new ProviderManager();
