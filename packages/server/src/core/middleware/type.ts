import { ContextType } from "../context";

export type Middleware = (ctx: ContextType.Context, next: MiddlewareNextHandler) => Promise<any>;

export interface MiddlewareNextHandler {
  (): Promise<any>;
  middleware?: Middleware;
}
