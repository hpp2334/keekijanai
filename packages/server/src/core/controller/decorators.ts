
const controllerBase = {
  $$type: 'controller',
};

export function ControllerDecorator(prefix: string) {
  return function (ctor: any) {
    Object.setPrototypeOf(ctor.prototype, controllerBase);
    ctor.prototype.$$prefix = prefix;
    ctor.prototype.$$routes = ctor.prototype.$$routes ?? [];
  }
}

export function RouteDecorator(path: string, method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET', opts: { onlyDEBUG?: boolean } = {}) {
  return function (target: any, propKey: string) {
    if (opts.onlyDEBUG && !process.env.DEBUG?.startsWith('keekijanai')) {
      return;
    }
    const routes = target.$$routes = target.$$routes ?? [];
    routes.push({
      path,
      method,
      route: target[propKey]
    });
  }
}
