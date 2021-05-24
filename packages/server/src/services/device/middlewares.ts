import { ContextType } from "@/core/context";
import { MiddlewareType } from "@/core/middleware";
import { v4 as uuid } from 'uuid';

export const ensureClientIDInCookie: MiddlewareType.Middleware = async (ctx, next) => {
  const clientIDCookieName = 'keekijanai-client-id';
  let clientID = ctx.req.cookies?.[clientIDCookieName] as string | undefined;
  if (!clientID) {
    clientID = uuid();
    ctx.res.setHeader('Set-Cookie', `${clientIDCookieName}=${clientID}; Max-Age=2147483647; HttpOnly`);
  }
  ctx.state.clientID = clientID;

  await next();
};