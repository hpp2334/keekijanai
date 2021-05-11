import { NowRequest, NowResponse } from "@vercel/node";
import { ServerlessPlatform } from "../type/serveless-platform";
import type { Router } from './router';

export interface App<ContextState = any> {
  use(middleware: Middleware<ContextState>): void;

  toAPI: (...args: any[]) => void;
}

export type ServerlessContext<State = any> = {
  req: {
    headers?: Record<string, any>;
    query?: Record<string, any>;
    cookies?: Record<string, any>;
    body: any;
  };
  res: {
    body: any;
    status?: number;
    setHeader: (header: string, value: string) => void;
    redirect: (url: string) => void;
  };
} & State;

export type Middleware<T = any> = (ctx: ServerlessContext<T>, next: MiddlewareNextHandler) => Promise<any>;

export interface MiddlewareNextHandler {
  (): Promise<any>;
  middleware?: Middleware;
}

export type {
  Router,
};
