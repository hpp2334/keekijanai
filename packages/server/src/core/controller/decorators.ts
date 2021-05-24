
const controllerBase = {
  $$type: 'controller',
};

export function ControllerDecorator(prefix: string) {
  return function (ctor: any) {
    ctor.prototype.$$prefix = prefix;
    ctor.prototype.$$routes = [];
    ctor.prototype = Object.create(controllerBase);
  }
}

export function RouteDecorator(path: string, method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET', opts: { onlyDEBUG?: boolean } = {}) {
  return function (target: any, propKey: string) {
    if (target.$$type !== 'controller') {
      throw Error('should decorate API in controller.');
    }
    if (opts.onlyDEBUG && !process.env.DEBUG?.startsWith('keekijanai')) {
      return;
    }
    target.$$routes.push({
      path,
      method,
      handler: target[propKey]
    });
  }
}
