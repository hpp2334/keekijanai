import type { Request, Response } from "express";

import {
  ResponseError,
  PlatformType,
  MiddlewareType,
} from 'keekijanai-server-core';

const debug = require('debug')('keekijanai:platform:express');

export class Express implements PlatformType.Platform {
  toAPIFactory: PlatformType.Platform['toAPIFactory'] = (handle) => {
    const handler = async (req: Request, res: Response) => {
      debug('receive request', req.url);
      const ctx = this.createContext(req, res);
      await handle(ctx);
    }
    return handler;
  }

  handleResponse: MiddlewareType.Middleware = async (ctx, next) => {
    debug('in middleware [handleResponse]');

    const req = ctx.req._req as Request;
    const res = ctx.res._res as Response;
    try {
      await next();
  
      if (ctx.res._res.headersSent) {
        return;
      }

      res.status(typeof ctx.res.status === 'number' ? ctx.res.status : (ctx.res.body ? 200 : 404));
      res.send(ctx.res.body);
    } catch (err) {
      if (err instanceof ResponseError) {
        res.status(err.code);
        res.send({
          error: err.message
        });
      } else {
        res.status(500);
        res.send({
          error: 'Server Error',
        });
        console.error(err);
      }
    }
  }

  private createContext(req: Request, res: Response) {
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



