
import createDebugger from 'debug';

import { Controller, ControllerType, Route } from '@/core/controller';
import { InjectService } from "@/core/service";
import type { UserService } from "./user.service";
import { userError } from '.';
import { ContextType } from '@/core/context';
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
