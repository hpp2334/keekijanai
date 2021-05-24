import { ContextType } from "../context";
import { Middleware, MiddlewareNextHandler } from "./type";

export class MiddlewareManager {
  private middlewares: Array<Middleware>;
  
  constructor() {
    this.middlewares = [];
  }

  add(...middleware: Middleware[]) {
    this.middlewares.push(...middleware);
  }

  async run(ctx: ContextType.Context) {
    await MiddlewareManager.run(ctx, this.middlewares);
  }

  static async run(ctx: ContextType.Context, middlewares: Middleware[]) {
    const dispatch = async (i: number): Promise<any> => {
      if (i === middlewares.length) {
        return undefined;
      }

      const next: MiddlewareNextHandler = dispatch.bind(null, i + 1);
      await middlewares[i](ctx, next);
    }
    return await dispatch(0);
  }
}

export const middlewareManager = new MiddlewareManager();
