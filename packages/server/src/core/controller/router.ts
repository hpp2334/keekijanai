
import { configReader, ConfigType } from "@/core/config";
import { ContextType } from "@/core/context";
import { MiddlewareType } from "@/core/middleware";
import { DecoratedController } from "./type";
import { serviceManager } from "../service";


const debug = require('debug')('keekijanai:core:controller');

export class Router {
  toMiddleware(): MiddlewareType.Middleware {
    return async (ctx, next) => {
      const middleware = this.getMatchedRoute(ctx);
      if (middleware) {
        await middleware(ctx, next);
      } else {
        await next();
      }
    }
  }

  private getMatchedRoute(ctx: ContextType.Context): MiddlewareType.Middleware | undefined {
    const _path = ctx.req.query?.__route__;
    const method = ctx.req.method;
    debug('query path "%s"', _path);
    if (typeof _path === 'string') {
      const path = this.normalizePath(decodeURIComponent(_path));
  
      const Controller = this.getController(path);
      const proto = Controller.prototype as DecoratedController;
      const routes = proto.$$routes;
      const prefix = proto.$$prefix;

      const route = routes.find(r => r.method.toLowerCase() === method.toLowerCase() && r.path + prefix === path);
      if (route) {
        const controller = new Controller();

        if (proto.$$injectServices) {
          serviceManager.processInjectServices(controller, proto.$$injectServices, ctx)
        }
        const handler = route.route.bind(controller);
        debug('[Router] "%s" match controller "%s" routeHandler "%s"', path, Controller.name, handler.name);
        return handler;
      }
    }
  }

  private normalizePath(path: string) {
    const startsWithDiagonal = path[0] === '/';
    const endsWithDiagonal = path[path.length - 1] === '/';
    return startsWithDiagonal && endsWithDiagonal
      ? path.slice(0, -1)
      : startsWithDiagonal
        ? path
        : '/' + path.slice(0, -1);
  }

  private getController(path: string) {
    const controllers = configReader.config.controllers;

    for (const [prefix, Controller] of controllers) {
      if (path.startsWith(prefix)) {
        return Controller;
      }
    }
    throw Error(`not configure controller for path "${path}"`);
  }
}

export const router = new Router();
