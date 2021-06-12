import {
  Controller, ControllerType, Route,
  InjectService,
  ContextType
} from 'keekijanai-server-core';

import type { UserService } from "./";
import * as userError from './error';
import Joi from 'joi';

const debug = require('debug')('keekijanai:controller:user');

export interface UserController extends ControllerType.ControllerBase {}

@Controller('/user')
export class UserController {
  @InjectService('user')    userService!: UserService;

  @Route('/get', 'GET', {
    validation: {
      query: Joi.object({
        id: Joi.string().required(),
      }).unknown(true)
    }
  })
  async get(ctx: ContextType.Context) {
    const { id } = ctx.req.query || {};
    debug('in "get", userid = "%s"', id);

    const result = await this.userService.get(id);
    ctx.res.body = result;
  }

  @Route('/test__clear', 'DELETE', { onlyDEBUG: true })
  async TEST__clear(ctx: ContextType.Context) {
    await this.userService.TEST__delete();
  }
}
