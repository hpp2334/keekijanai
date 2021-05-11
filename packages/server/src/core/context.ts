import { Context, ContextState, Core, GetServiceWithHint } from "../type";
import { Middleware } from "../_framework/type";
import { Manager } from "./manager";
import { serviceFactory } from "./service";

const getService: GetServiceWithHint = function (this: Context, name: string) {
  const servicePromise = this.manager.getService(this, name);
  return servicePromise as any;
}

export const mountManager = (manager: Manager): Middleware<ContextState> => async (ctx, next) => {
  ctx.manager = manager;
  await next();
}

export const mountGetService: Middleware<ContextState> = async (ctx, next) => {
  ctx.getService = getService;
  await next();
}

export const mountUser: Middleware<ContextState> = async (ctx, next) => {
  const services = {
    user: await ctx.getService('user'),
    auth: await ctx.getService('auth'),
  };

  const authorization = ctx.req.headers?.['authorization'];

  if (!authorization) {
    ctx.user = {
      isLogin: false,
    };
  } else {
    if (process.env.NODE_ENV === 'test' && authorization.startsWith('test:')) {
      const id = 'test__' + authorization.slice(5);
      ctx.user = {
        isLogin: true,
        id: id,
        name: id,
      }

      await services.user.upsert({ id, lastLogin: Date.now() });
    } else {
      ctx.user = await services.auth.getCurrentUser(authorization);
    }
  }

  await next();
}