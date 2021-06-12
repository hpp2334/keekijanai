import joi from 'joi';
import { ResponseError } from '../error';
import { MiddlewareUtils, MiddlewareType } from '../middleware';
import { Route, Validation } from './type';

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

export function RouteDecorator(
  path: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET',
  opts: {
    onlyDEBUG?: boolean;
    validation?: Validation;
  } = {}
) {
  return function (target: any, propKey: string) {
    if (opts.onlyDEBUG && !process.env.DEBUG?.startsWith('keekijanai')) {
      return;
    }

    const routes: Array<Route> = target.$$routes = target.$$routes ?? [];
    const routeHandler = target[propKey];
    routes.push({
      path,
      method,
      route: opts.validation
        ? MiddlewareUtils.hookMiddleware(validationMiddlewareFactory(opts.validation), routeHandler)
        : routeHandler,
    });
  }
}

function validationMiddlewareFactory(validation: Validation): MiddlewareType.Middleware {
  const validationMiddleware: MiddlewareType.Middleware = async (ctx, next) => {
    try {
      if (validation) {
        await validation.query?.validateAsync(ctx.req.query);
        await validation.body?.validateAsync(ctx.req.body);
      }
    } catch (err) {
      throw new ResponseError(err.message);
    }
    await next();
  }
  return validationMiddleware;
}