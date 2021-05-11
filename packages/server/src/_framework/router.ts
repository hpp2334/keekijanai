import { MiddlewareManager } from "./middleware-manager";
import { Middleware, ServerlessContext } from "./type";
import Debugger from 'debug';

const debug = Debugger('keekijanai:framework:router');

export class Router {
  private routes: Map<string, Middleware[]> = new Map();

  add(path: string, ...middlewares: Middleware[]) {
    path = this.normalizePath(path);
    let targetRoutes = this.routes.get(path);
    if (targetRoutes) {
      targetRoutes.push(...middlewares);
    } else {
      targetRoutes = [...middlewares];
      this.routes.set(path, targetRoutes);
    }
  }

  toMiddleware(): Middleware {
    return async (ctx, next) => {
      const middlwares = this.getMatchedRoute(ctx);
      if (middlwares) {
        await MiddlewareManager.run(ctx, next.middleware ? middlwares.concat(next.middleware) : middlwares);
      }
      await next();
    }
  }

  private getMatchedRoute(ctx: ServerlessContext): Middleware[] | null {
    const _path = ctx.req.query?.__route__;
    debug('query path "%s"', _path);
    if (typeof _path === 'string') {
      const path = this.normalizePath(decodeURIComponent(_path));
      const routes = this.routes.get(path) || null;
      debug('normalized query path "%s" match %d routes', path, routes?.length ?? 0);
      return routes;
    }
    return null;
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
}


