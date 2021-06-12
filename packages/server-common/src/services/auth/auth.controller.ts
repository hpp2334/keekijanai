import joi from 'joi';
import {
  ContextType,
  Controller, ControllerType, Route,
  InjectService,
} from 'keekijanai-server-core';
import { AuthService } from '@/services/auth';
import * as authValidation from './validation';
import * as authError from './error';

const debug = require('debug')('keekijanai:controller:auth');

export interface AuthController extends ControllerType.ControllerBase {}

@Controller('/auth')
export class AuthController {
  @InjectService('auth')    authService!: AuthService;
  
  @Route('/legacyRegister', 'POST', {
    validation: {
      body: joi.object({
        userID: authValidation.userID,
        password: authValidation.password,
      })
    }
  })
  async legacyRegister(ctx: ContextType.Context) {
    const { userID, password } = ctx.req.body ?? {};
    const result = await this.authService.legacyRegister(userID, password);
    ctx.res.status = 200;
  }

  @Route('/legacyAuth', 'POST', {
    validation: {
      body: joi.object({
        userID: authValidation.userID,
        password: authValidation.password,
      })
    }
  })
  async legacyAuth(ctx: ContextType.Context) {
    const { userID, password } = ctx.req.body ?? {};
    const result = await this.authService.legacyAuth(userID, password);
    ctx.res.body = result;
  }

  @Route('/getCode', 'GET', {
    validation: {
      query: joi.object({
        provider: joi.string().required(),
      }).unknown(true)
    }
  })
  async oauth2GetCode(ctx: ContextType.Context) {
    const { provider } = ctx.req.query || {};
    const callbackUrl = await this.authService.oauth2GetCode(provider);
    ctx.res.redirect(callbackUrl);
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
