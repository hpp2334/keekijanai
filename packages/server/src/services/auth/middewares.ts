import { ContextType } from "@/core/context";
import type { UserService } from "@/services/user";
import type { AuthService } from "@/services/auth";
import { MiddlewareType } from "@/core/middleware";

export const mountUser: MiddlewareType.Middleware = async (ctx, next) => {
  const services = {
    user: (await ctx.getService('user')) as any as UserService,
    auth: (await ctx.getService('auth')) as any as AuthService,
  };

  const authorization = ctx.req.headers?.['authorization'];

  if (!authorization) {
    ctx.state.user = {
      isLogin: false,
    };
  } else {
    ctx.state.user = await services.auth.getCurrentUser(authorization);
  }

  await next();
}