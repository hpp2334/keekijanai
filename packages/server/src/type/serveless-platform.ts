import { Middleware, ServerlessContext } from "../_framework";

export interface ServerlessPlatform {
  createContext(...args: any[]): ServerlessContext;
  toAPIFactory(handle: (ctx: ServerlessContext) => Promise<void>): (...args: any[]) => any;
  getMiddlewares(): Middleware[];
}

export interface PlatformConstructor {
  new (): ServerlessPlatform;
}