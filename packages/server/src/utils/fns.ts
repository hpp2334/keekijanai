import ProxyAgent from 'proxy-agent';

export function shallowEqual(a: any[], b: any[]) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a !== b) {
      return false;
    }
  }
  return true;
}

export function memoFunc<T extends ((arg: any) => any)>(fn: T) {
  const cache = new Map<any, any>();
  const memozied: any = function (this: any, arg: any) {
    let cached = cache.get(arg);
    if (cached) {
      return cached;
    }
    cached = fn.call(this, arg);
    cache.set(arg, cached);
    return cached;
  }
  return memozied as T;
}

export function createClassFactory<Constructor extends (new (...args: any[]) => any)>() {
  return <T extends Constructor>(
    classConstructor: T,
    ...params: ConstructorParameters<Constructor>
  ): InstanceType<T> => {
    return new classConstructor(...params);
  }
}

export function parseGrouping(query: any) {
  if (typeof query !== 'object' || query === null) {
    throw Error('"query" is not an object.');
  }
  if (typeof query.grouping !== 'string') {
    throw Error('"grouping" attr not a string in query object.');
  }
  const [_skip, _take] = query.grouping.split(',');
  const skip = parseInt(_skip);
  const take = parseInt(_take);
  if (Number.isNaN(skip)) {
    throw Error('"skip" arg in "grouping" cannot parse into number');
  }
  if (Number.isNaN(take)) {
    throw Error('"take" arg in "grouping" cannot parse into number');
  }
  return {
    skip,
    take,
  }
}

export function getProxy() {
  const proxy = process.env.http_proxy
    || process.env.npm_config_proxy;
  return proxy;
}

export function getProxyAgent() {
  const proxy = getProxy();
  return proxy && new ProxyAgent(process.env.http_proxy) as any;
}