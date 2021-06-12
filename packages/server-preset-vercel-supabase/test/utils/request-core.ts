import fetch from "node-fetch";
import { apiUrl } from "./server";
import { CookieJar, Cookie, CookieAccessInfo } from 'cookiejar';
import { URLSearchParams } from 'url';

const jar = new CookieJar();

const weakMap = new WeakMap();

export async function appRequest(path: string, params: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any;
  headers?: {
    Authorization?: string;

    [k: string]: string | undefined;
  },
  query?: Record<string, any>;
  sessionIdentity?: object;
}) {
  type Extra = {
    jar: CookieJar;
  }

  let extra: Extra | undefined = undefined;
  if (params.sessionIdentity) {
    extra = weakMap.get(params.sessionIdentity) ?? {
      jar: new CookieJar(),
    };
    weakMap.set(params.sessionIdentity, extra);
  }

  const headerObject = {
    ...(params.headers ?? {}),
    ...({
      cookie: extra?.jar.getCookies(CookieAccessInfo.All).toValueString() || undefined,
    }),
    ...(params.body ? { 'Content-Type': 'application/json' } : {})
  };
  const rsp = await fetch(apiUrl + '?' + new URLSearchParams(Object.assign(params.query ?? {}, { __route__: path })), {
    method: params.method,
    body: params.body ? JSON.stringify(params.body) : undefined,
    headers: Object.entries(headerObject).filter(k => k[1] !== undefined) as string[][],
  });
  
  if (rsp.ok && extra) {
    const setCookie = rsp.headers.get('set-cookie');
    if (setCookie) {
      const cookie =  new Cookie(setCookie);
      extra.jar.setCookie(cookie);
    }
  }
  return rsp;
}