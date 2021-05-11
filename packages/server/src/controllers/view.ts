import { Controller } from "../core/controller";
import { ControllerHandler } from "../type/core";
import { argsError } from "../rsp-error";
import createDebugger from 'debug';

const debug = createDebugger('keekijanai:controller:auth');

export class ViewController extends Controller {

  get: ControllerHandler = async (ctx) => {
    const { scope } = ctx.req.query || {};
    debug('in "get", scope = "%s", clientID = "%s"', scope, ctx.clientID);

    if (typeof scope !== 'string') {
      throw argsError.scope.notString();
    }

    const viewService = await ctx.getService('view');
    const result = await viewService.get(scope);
    ctx.res.body = result;
  }
}
