import {  ControllerHandler } from "../type/core/controller";
import { argsError } from "../rsp-error";
import { ServerlessContext } from "../_framework";
import createDebugger from 'debug';
import { Controller } from "../core/controller";
import { Context } from "../type";

const debug = createDebugger('keekijanai:controller:auth');

export class AuthController extends Controller {
  auth: ControllerHandler = async (ctx) => {
    const { provider, usename, password } = ctx.req.query || {};
    debug('oauth2GetCode: provider="%s"', provider);

    const authService = await ctx.getService('auth');
    if (provider) {
      const callbackUrl = await authService.auth('oauth2', provider);
      await ctx.res.redirect(callbackUrl);
    } else {
      await authService.auth('legacy', usename, password);
    }
  }

  oauth2GetAccessToken: ControllerHandler = async (ctx) => {
    const { provider, code } = ctx.req.query || {};
    debug('oauth2GetAccessToken: provider="%s", code="%s"', provider, code);
    if (typeof provider !== 'string') {
      throw argsError.provider.notString();
    }
    if (typeof code !== 'string') {
      throw argsError.oauth2.code.notString();
    }

    const authService = await ctx.getService('auth');
    const callbackUrl = await authService.oauth2GetAccessToken(provider, code);
    await ctx.res.redirect(callbackUrl);
  }

  getCurrent: ControllerHandler = async (ctx) => {
    const jwtString = ctx.req.headers?.['authorization'];

    const authService = await ctx.getService('auth');
    ctx.res.body = await authService.getCurrentUser(jwtString);
  }
}
