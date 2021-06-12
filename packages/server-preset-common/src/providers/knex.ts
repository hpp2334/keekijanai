import {
  Provider, ProviderType
} from 'keekijanai-server-core';
import _ from 'lodash';
import path from 'path';
import jetpack from 'fs-jetpack';
import knex, { Knex } from 'knex';

interface Config {
  knexOptions: Knex.Config;
  initSQL?: string;
}

@Provider({
  key: 'knex',
  transformCamel: true,
})
class KnexProvider implements ProviderType.ProviderBase {
  private client: Knex;
  private initSQL: string | undefined;

  private _initPromise: Promise<any>;
  private _resolveInit = _.noop;

  constructor(config: Config) {
    const { knexOptions, initSQL } = config;
    this.client = knex(knexOptions);
    this.initSQL = initSQL;

    this._initPromise = new Promise(res => {this._resolveInit = res})

    this.init();
  }

  async init() {
    if (this.initSQL) {
      const sql = await jetpack.readAsync(
        path.resolve(process.cwd(), this.initSQL),
        'utf8',
      )
      if (sql) {
        const sqls = sql
          .split(';')
          .map(v => v.trim())
          .filter(x => !!x)
          .map(v => v + ';');
        try {
          const rsp = await Promise.all(sqls.map(sql => this.client.schema.raw(sql)));
        } catch (err) {
          console.error('[debug knex init]', err);
        }
      }
    }
    this._resolveInit();
  }

  async select<T = any>(params: ProviderType.SelectParams): Promise<ProviderType.Response<T>> {
    await this._initPromise;

    const query = (count: any) => {
      let request = this.client
        .from(params.from);
      if (count !== undefined) {
        request = request.count(count);
      } else {
        request = request.select(...(params.columns ?? ['*']));
      }
      if (params.where) {
        request = this.handleWhere(request, params.where);
      }

      if (count === undefined) {
        if (!_.isNil(params.skip) && !_.isNil(params.take)) {
          request = request
            .limit(params.take)
            .offset(params.skip * params.take)
        }
        if (params.order) {
          params.order.forEach(([column, ord]) => {
            request = request.orderBy(column, ord);
          });
        }
      }
      return request;
    }

    try {
      const count = this.transformCount(params.count);
      const itemInRsp = await query(undefined)
      const countInRsp = count === undefined ? null : await query(count).then(v => {
        return v?.[0]?.['count(*)'] ?? null
      });

      const rsp = {
        body: itemInRsp,
        count: countInRsp,
      };
      return this.handleResponse(rsp);
    } catch (err) {
      return this.handleError(err);
    }
  }
  async insert<T = any>(params: ProviderType.InsertParams): Promise<ProviderType.Response<T>> {
    await this._initPromise;
    try {
      let request = this.client(params.from)
        .insert(params.payload)

      const result = await request;
      const insertedRsp = await this.handleSQLite3MutationResult(params.from, result);
      // console.log('insert', result, insertedRsp);
      return insertedRsp;
    } catch (err) {
      return this.handleError(err);
    }
  }
  async update<T = any>(params: ProviderType.UpdateParams): Promise<ProviderType.Response<T>> {
    await this._initPromise;
    try {
      let request: Knex.QueryBuilder<any, any>;
      if (params.upsert) {
        request = this.client(params.from)
          .insert(params.payload)
          .onConflict(params.keys) /** @todo CANNOT use 'id'  */
          .merge(params.payload)
      } else {
        request = this.client(params.from)
          .update(params.payload)
      }
      if (params.where) {
        request = this.handleWhere(request, params.where);
      }

      const result = await request;
      return await this.handleSQLite3MutationResult(params.from, result);
    } catch (err) {
      return this.handleError(err);
    }
  }
  async delete(params: ProviderType.DeleteParams): Promise<ProviderType.Response> {
    await this._initPromise;
    try {
      const selectRsp = await this.select({
        from: params.from,
        where: params.where,
      });

      let request = this.client 
        .from(params.from)
        .delete()
      if (params.where) {
        request = this.handleWhere(request, params.where);
      }
      const deletedRsp = await request;

      return selectRsp;
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

  /** for sqlite3 */
  private async handleSQLite3MutationResult(from: string, result: any[]) {
    const [ rowid ] = result;
    const rsp = await this.select({
      from,
      where: {
        rowid: [['=', rowid]],
      }
    });
    return rsp;
  }

  private transformCount(count: string | boolean | undefined) {
    switch (count) {
      case true:
        return '*';
      case false:
        return undefined;
      case 'planned':
      case 'exact':
      case 'estimated':
        return '*';
      default:
        return '*';
    }
  }
  private handleWhere(request: any, where: ProviderType.Where) {
    let haveWhere = false;
    _.forOwn(where, function (list, key) {
      list.forEach(item => {
        const [op, value] = item;
        if (typeof value === 'undefined') {
          return;
        }
        switch (op) {
          case '=':
            request = request[haveWhere ? 'andWhere' : 'where'](key, value === null ? "is" : "=", value);
            haveWhere = true;
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
  Config as KnexProviderConfig,
  KnexProvider as Knex,
}
