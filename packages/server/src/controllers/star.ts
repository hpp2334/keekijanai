import { Controller } from "../core/controller";
import { ControllerHandler } from "../type/core";
import { argsError } from "../rsp-error";
import createDebugger from 'debug';

const debug = createDebugger('keekijanai:controller:star');

export class StarController extends Controller {

  get: ControllerHandler = async (ctx) => {
    const { scope } = ctx.req.query || {};
    debug('in "get", scope = "%s", userid = "%s"', scope, ctx.user.isLogin && ctx.user.id);

    if (typeof scope !== 'string') {
      throw argsError.scope.notString();
    }

    const starService = await ctx.getService('star');
    const result = await starService.get(scope);
    ctx.res.body = result;
  }

  post: ControllerHandler = async (ctx) => {
    const { scope } = ctx.req.query || {};
    const { current } = ctx.req.body;
    debug('in "get", scope = "%s", userid = "%s", current = %n', scope, ctx.user.isLogin && ctx.user.id, current);

    if (typeof scope !== 'string') {
      throw argsError.scope.notString();
    }
    if (!(current === 1 || current === -1 || current === 0 || current === null)) {
      throw Error(`"current" should be -1, 0, 1 or null`);
    }

    const starService = await ctx.getService('star');
    const result = await starService.post(scope, current);
    ctx.res.body = result;
  }

  clear: ControllerHandler = async (ctx) => {
    const { scope } = ctx.req.query || {};
    debug('in "clear", scope = "%s", clientID = "%s"', scope, ctx.user.isLogin && ctx.user.id);

    if (typeof scope !== 'string') {
      throw argsError.scope.notString();
    }

    const starService = await ctx.getService('star');
    const result = await starService.clear(scope);
    ctx.res.status = 204;
  }
}
