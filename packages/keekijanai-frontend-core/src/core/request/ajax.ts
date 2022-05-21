import { Observable, Subject } from "rxjs";
import { keekijanaiConfig } from "../config";

interface AjaxGlobalContext {
  baseURL: string;
  useQueryRoute: boolean;
  interceptors: Set<(request: Request) => void>;
}

export interface AjaxRequestConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: any;
  data?: any;
}

export interface AjaxResponse<C> {
  status: number;
  data: C;
}

const ajaxGlobalContext: AjaxGlobalContext = {
  baseURL: "/api/keekijanai",
  interceptors: new Set(),
  get useQueryRoute() {
    return keekijanaiConfig.queryRoute;
  },
};

const allDependencyDefined = typeof fetch !== "undefined" && typeof Request !== "undefined";

const buildSearch = (obj: Record<string, any>): string => {
  const searches = [];
  for (const key in obj) {
    const entries = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
    for (const item of entries) {
      if (item) {
        searches.push(`${key}=${item}`);
      }
    }
  }
  return searches.join("&");
};

const buildFetchRequest = (config: AjaxRequestConfig): Request => {
  const urlPath = ajaxGlobalContext.baseURL + (ajaxGlobalContext.useQueryRoute ? "" : config.url);
  const urlSearch = buildSearch({
    ...(config.params ?? {}),
    query_route: ajaxGlobalContext.useQueryRoute ? config.url : undefined,
  });
  const resolvedUrl = urlPath + "?" + urlSearch;

  const body = config.method !== "GET" ? config.data : undefined;
  const isBodyJson = body && typeof body === "object";

  const req = new Request(resolvedUrl, {
    method: config.method,
    credentials: "include",
    body: isBodyJson ? JSON.stringify(body) : body,
  });
  if (isBodyJson) {
    req.headers.set("content-type", "application/json");
  }
  return req;
};

export const registerInterceptor = (interceptor: (req: Request) => void) => {
  ajaxGlobalContext.interceptors.add(interceptor);
  return () => {
    ajaxGlobalContext.interceptors.delete(interceptor);
  };
};

export const ajax = <T>(config: AjaxRequestConfig): Observable<AjaxResponse<T>> => {
  const subject = new Subject<AjaxResponse<T>>();
  // In SSR environment
  if (!allDependencyDefined) {
    return subject.asObservable();
  }

  const req = buildFetchRequest(config);

  ajaxGlobalContext.interceptors.forEach((interceptor) => {
    interceptor(req);
  });

  async function callImpl() {
    const nativeResp = await fetch(req);
    const status = nativeResp.status;
    const data = await (() => {
      if (nativeResp.headers.get("content-type")?.includes("application/json")) {
        return nativeResp.json();
      } else {
        return nativeResp.text();
      }
    })();
    const resp = {
      status,
      data,
    };

    if (nativeResp.ok) {
      subject.next(resp);
      subject.complete();
    } else {
      subject.error(resp);
      subject.complete();
    }
  }
  callImpl();

  return subject.asObservable();
};
