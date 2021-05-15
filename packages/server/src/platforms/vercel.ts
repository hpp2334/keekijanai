import type { NowRequest, NowResponse } from "@vercel/node";
import { ServerlessPlatform } from "../type/serveless-platform";
import { MiddlewareManager } from "../_framework/middleware-manager";
import { Middleware, ServerlessContext } from "../_framework/type";
import createDebugger from 'debug';
import { ResponseError } from "../utils/error/rsp";

const devDebug = createDebugger('keekijanai:vercel');

interface VercelContextState {
  _req: NowRequest;
  _res: NowResponse;
}

export type VercelServerlessFunction = (req: NowRequest, res: NowResponse) => any;

export class Vercel implements ServerlessPlatform {
  toAPIFactory: ServerlessPlatform['toAPIFactory'] = (handle) => {
    const handler: VercelServerlessFunction = async (req, res) => {
      devDebug('receive request', req.url);
      const ctx = this.createContext(req, res);
      await handle(ctx);
    }
    return handler;
  }

  createContext(req: NowRequest, res: NowResponse): ServerlessContext {
    return {
      req: {
        headers: req.headers,
        query: req.query,
        cookies: req.cookies,
        body: req.body,
      },
      res: {
        body: null,
        setHeader: (header: string, value: any) => res.setHeader(header, value),
        redirect: (url: string) => res.redirect(url),
      },
      _req: req,
      _res: res,
    }
  };

  getMiddlewares(): Middleware[] {
    return [handleResponse];
  }
}

const handleResponse: Middleware<VercelContextState> = async (ctx, next) => {
  devDebug('in middleware [handleResponse]');
  try {
    await next();

    if (ctx._res.headersSent) {
      return;
    }

    ctx._res.status(typeof ctx.res.status === 'number' ? ctx.res.status : (ctx.res.body ? 200 : 404));
    ctx._res.send(ctx.res.body);
  } catch (err) {
    if (err instanceof ResponseError) {
      ctx._res.status(err.code);
      ctx._res.send({
        error: err.message
      });
    } else {
      ctx._res.status(500);
      ctx._res.send({
        error: err instanceof Error ? err.message : err,
      });
      console.error(err);
    }
  }
}


