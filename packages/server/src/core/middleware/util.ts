import { Middleware } from "./type"

/** "after" middleware will use this context */
export function hookMiddleware(before: Middleware, after: Middleware): Middleware {
  return async function hookedMiddleware(this: any, ctx, next) {
    await before(ctx, () => after.call(this, ctx, next))
  }
}
