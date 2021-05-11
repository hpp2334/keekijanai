import { Middleware, MiddlewareNextHandler, ServerlessContext } from "./type";

export class MiddlewareManager {
  private middlewares: Array<Middleware>;
  
  constructor() {
    this.middlewares = [];
  }

  add(...middleware: Middleware[]) {
    this.middlewares.push(...middleware);
  }

  async run(ctx: ServerlessContext) {
    await MiddlewareManager.run(ctx, this.middlewares);
  }

  static async run(ctx: ServerlessContext, middlewares: Middleware[]) {
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

