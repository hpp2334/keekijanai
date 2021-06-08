import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Provider, ProviderType } from '@/core/provider';
import _ from 'lodash';

@Provider({
  key: 'supabase',
  transformCamel: true,
})
class SupabaseProvider implements ProviderType.ProviderBase {
  private client: SupabaseClient;

  constructor(config: { url: string; appKey: string; }) {
    const { url, appKey } = config;
    this.client = createClient(url, appKey);
  }

  async select<T = any>(params: ProviderType.SelectParams): Promise<ProviderType.Response<T>> {
    try {
      let request = this.client
        .from(params.from)
        .select(params.columns?.join(','), { count: this.transformCount(params.count) });
      if (params.where) {
        request = this.handleWhere(request, params.where);
      }
      if (!_.isNil(params.skip) && !_.isNil(params.take)) {
        request = request.range(params.skip * params.take, (params.skip + 1) * params.take - 1)
      }
      if (params.order) {
        params.order.forEach(([column, ord]) => {
          request = request.order(column, { ascending: ord === 'asc' })
        });
      }

      const rsp = await request;
      if (rsp.error) {
        throw rsp;
      }
      return this.handleResponse(rsp);
    } catch (err) {
      return this.handleError(err);
    }
  }
  async insert<T = any>(params: ProviderType.InsertParams): Promise<ProviderType.Response<T>> {
    try {
      let request = this.client 
        .from(params.from)
        .insert(params.payload);

      const rsp = await request;
      return this.handleResponse(rsp);
    } catch (err) {
      return this.handleError(err);
    }
  }
  async update<T = any>(params: ProviderType.UpdateParams): Promise<ProviderType.Response<T>> {
    try {
      let request = this.client 
        .from(params.from)
        [params.upsert ? 'upsert' : 'update'](params.payload)
      if (params.where) {
        request = this.handleWhere(request, params.where);
      }

      const rsp = await request;
      return this.handleResponse(rsp);
    } catch (err) {
      return this.handleError(err);
    }
  }
  async delete(params: ProviderType.DeleteParams): Promise<ProviderType.Response> {
    try {
      let request = this.client 
        .from(params.from)
        .delete();
      if (params.where) {
        request = this.handleWhere(request, params.where);
      }

      const rsp = await request;
      return this.handleResponse(rsp);
    } catch (err) {
      return this.handleError(err);
    }
  }
  
  private handleResponse<T>(rsp: any) {
    const nextRsp: ProviderType.Response<T> = {
      body: rsp.body,
      count: rsp.count ?? null,
      error: rsp.error,
      extra: {
        data: rsp.data,
        status: rsp.status,
        statusText: rsp.statusText,
      }
    }
    return nextRsp;
  }
  private handleError<T>(err: any) {
    const nextRsp: ProviderType.Response<T> = {
      body: null,
      count: null,
      error: err,
    }
    return nextRsp;
  }

  private transformCount(count: string | boolean | undefined) {
    switch (count) {
      case true:
        return 'exact' as const;
      case false:
        return undefined;
      case 'planned':
      case 'exact':
      case 'estimated':
        return count;
      default:
        return 'exact';
    }
  }
  private handleWhere(request: any, where: ProviderType.Where) {
    _.forOwn(where, function (list, key) {
      list.forEach(item => {
        const [op, value] = item;
        if (typeof value === 'undefined') {
          return;
        }
        switch (op) {
          case '=':
            if (value === null) {
              request = request.is(key, null);
            } else {
              request = request.eq(key, value);
            }
            
            break;
          default:
            console.warn(`unrecognize op "${op}" for "${key}" -> "${value}"`);
            break;
        }
      })
    });
    return request;
  }
}

export {
  SupabaseProvider as Supabase,
}
