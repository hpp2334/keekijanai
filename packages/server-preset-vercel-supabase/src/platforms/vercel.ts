import type { VercelRequest, VercelResponse } from "@vercel/node";

import {
  ResponseError,
  PlatformType,
  MiddlewareType,
} from 'keekijanai-server-core';

const debug = require('debug')('keekijanai:platform:vercel');

export class Vercel implements PlatformType.Platform {
  toAPIFactory: PlatformType.Platform['toAPIFactory'] = (handle) => {
    const handler = async (req: VercelRequest, res: VercelResponse) => {
      debug('receive request', req.url);
      const ctx = this.createContext(req, res);
      await handle(ctx);
    }
    return handler;
  }

  handleResponse: MiddlewareType.Middleware = async (ctx, next) => {
    debug('in middleware [handleResponse]');
    try {
      await next();
  
      if (ctx.res._res.headersSent) {
        return;
      }
  
      ctx.res._res.status(typeof ctx.res.status === 'number' ? ctx.res.status : (ctx.res.body ? 200 : 404));
      ctx.res._res.send(ctx.res.body);
    } catch (err) {
      if (err instanceof ResponseError) {
        ctx.res._res.status(err.code);
        ctx.res._res.send({
          error: err.message
        });
      } else {
        ctx.res._res.status(500);
        ctx.res._res.send({
          error: 'Server Error',
        });
        console.error(err);
      }
    }
  }

  private createContext(req: VercelRequest, res: VercelResponse) {
    return {
      req: {
        _req: req,
        method: req.method ?? 'GET',
        headers: req.headers,
        query: req.query,
        cookies: req.cookies,
        body: req.body,
      },
      res: {
        _res: res,
        body: null,
        setHeader: (header: string, value: any) => res.setHeader(header, value),
        redirect: (url: string) => res.redirect(url),
      },
    }
  };
}



