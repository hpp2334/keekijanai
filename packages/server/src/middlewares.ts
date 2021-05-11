
import { ContextState } from "./type";
import { Middleware } from "./_framework/type";
import * as uuid from 'uuid';

export const ensureClientIDInCookie: Middleware<ContextState> = async (ctx, next) => {
  const clientIDCookieName = 'keekijanai-client-id';
  let clientID = ctx.req.cookies?.[clientIDCookieName] as string | undefined;
  if (!clientID) {
    clientID = uuid.v4();
    ctx.res.setHeader('Set-Cookie', `${clientIDCookieName}=${clientID}; Max-Age=2147483647; HttpOnly`);
  }
  ctx.clientID = clientID;

  await next();
};

export { mountGetService, mountManager, mountUser } from './core/context';
