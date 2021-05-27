import { ajax, AjaxResponse } from 'rxjs/ajax';
import { Client } from "./client";
import { auth } from "../services/auth";
import { CacheManager, Cache } from '../utils/cache';
import _ from 'lodash';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface RequestParam {
  route: string;
  query?: {};
  method?: string;
  body?: any;
  cache?: {
    mode?: 'use';
    scope: string;
    keys: Array<any>;
  } | {
    mode: 'clear';
    scope: string | string[];
  };
}

export class Requester {
  constructor(private client: Client, private cacheManager: CacheManager) {}

  getURI(params: RequestParam) {
    const unfilteredQueryObject = {
      ...params.query || {},
      __route__: params.route,
    };
    const queryObject = _.pickBy(unfilteredQueryObject, x => x !== undefined);

    return this.client.config.route.root
      + '?'
      + new URLSearchParams(queryObject);
  }
  
  request(params: RequestParam) {
    const { method = 'GET', body, cache } = params;
    if (cache) {
      cache.mode = cache.mode ?? 'use';
    }

    let cacheKey: string | undefined;
    let cacher: Cache | undefined;
    if (cache?.mode === 'use') {
      const { scope, keys } = cache;
      cacher = this.getCache(scope);
      cacheKey = this.getCacheKey(keys);
      if (cacher.has(cacheKey)) {
        const cached = cacher.get(cacheKey);
        return of(cached);
      }
    }

    const jwt = auth.jwt;
    const headers = Object.assign(
      {},
      jwt === null ? {} : { Authorization: jwt },
    );

    let rsp$ = ajax({
      method,
      headers,
      url: this.getURI(params),
      body
    });
    
    rsp$ = rsp$.pipe(
      map(value => value.response),
      tap((value: any) => {
        if (cacheKey && cacher) {
          cacher.set(cacheKey, value);
        } else if (cache?.mode === 'clear') {
          const remove = this.cacheManager.delete.bind(this.cacheManager);
          if (Array.isArray(cache.scope)) {
            cache.scope.forEach(remove);
          } else {
            remove(cache.scope);
          }
        }
      }),
    );
    return rsp$;
  }

  private getCache(scope: string) {
    return this.cacheManager.get(scope, 500);
  }
  private getCacheKey(keys: any[]) {
    return JSON.stringify(keys);
  }
}