import { ContextType } from '@/core/context';
import { Controller, ControllerType, Route } from '@/core/controller';
import { InjectService } from "@/core/service";

import { authError, AuthService } from "@/services/auth";

const debug = require('debug')('keekijanai:controller:auth');

export interface AuthController extends ControllerType.ControllerBase {}

@Controller('/auth')
export class AuthController {
  @InjectService('auth')    authService!: AuthService;

  @Route('/login')
  async auth(ctx: ContextType.Context) {
    const { provider, usename, password } = ctx.req.query || {};
    debug('oauth2GetCode: provider="%s"', provider);

    if (provider) {
      const callbackUrl = await this.authService.auth('oauth2', provider);
      await ctx.res.redirect(callbackUrl);
    } else {
      await this.authService.auth('legacy', usename, password);
    }
  }

  @Route('/accessToken')
  async oauth2GetAccessToken(ctx: ContextType.Context) {
    const { provider, code } = ctx.req.query || {};
    debug('oauth2GetAccessToken: provider="%s", code="%s"', provider, code);
    if (typeof provider !== 'string') {
      throw authError.args.provider.notString;
    }
    if (typeof code !== 'string') {
      throw authError.args.oauth2.code.notString;
    }

    const callbackUrl = await this.authService.oauth2GetAccessToken(provider, code);
    await ctx.res.redirect(callbackUrl);
  }

  @Route('/current')
  async getCurrent(ctx: ContextType.Context) {
    const jwtString = ctx.req.headers?.['authorization'];

    ctx.res.body = await this.authService.getCurrentUser(jwtString);
  }

  @Route('/test__prepare', 'POST', { onlyDEBUG: true })
  async TEST__prepare(ctx: ContextType.Context) {
    const list = ctx.req.body;
    ctx.res.body = await this.authService.TEST__prepare(list);
  }
}
