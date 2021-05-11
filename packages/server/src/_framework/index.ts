import { performance } from 'perf_hooks';
import { NowRequest, NowResponse } from "@vercel/node";
import { MiddlewareManager } from "./middleware-manager";

import { Router } from './router';
import { ServerlessContext, App, Middleware } from "./type";
import { ServerlessPlatform } from '../type/serveless-platform';

class AppImpl<ContextState = any> implements App<ContextState> {
  mwManager: MiddlewareManager;
  toAPI: App<ContextState>['toAPI'];
  createContext: (...args: any[]) => ServerlessContext;

  constructor(serverlessPlatform: ServerlessPlatform) {
    this.mwManager = new MiddlewareManager();

    const run =  this.mwManager.run.bind(this.mwManager);

    this.toAPI = serverlessPlatform.toAPIFactory(run);
    this.createContext = serverlessPlatform.createContext;
  }

  use(...middleware: Middleware<ContextState>[]): void {
    this.mwManager.add(...middleware);
  }
}


export {
  Router,
  AppImpl as App,
};
export * from './type';
