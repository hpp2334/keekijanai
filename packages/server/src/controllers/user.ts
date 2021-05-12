import { Controller } from "../core/controller";
import { ControllerHandler } from "../type/core";
import { argsError } from "../rsp-error";
import createDebugger from 'debug';

const debug = createDebugger('keekijanai:controller:user');

export class UserController extends Controller {

  get: ControllerHandler = async (ctx) => {
    const { id } = ctx.req.query || {};
    debug('in "get", userid = "%s"', id);

    if (typeof id !== 'string') {
      throw argsError.user.id.notString();
    }

    const userService = await ctx.getService('user');
    const result = await userService.get(id);
    ctx.res.body = result;
  }
}
