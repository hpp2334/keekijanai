
import createDebugger from 'debug';

import { Controller, ControllerType, Route } from '@/core/controller';
import { InjectService } from "@/core/service";
import type { UserService } from "./user.service";
import { userError } from '.';

const debug = require('debug')('keekijanai:controller:user');

export interface UserController extends ControllerType.ControllerBase {}

@Controller('/user')
export class UserController {
  @InjectService('user')    userService!: UserService;

  @Route('/get')
  get: ControllerType.RouteHandler = async (ctx) => {
    const { id } = ctx.req.query || {};
    debug('in "get", userid = "%s"', id);

    if (typeof id !== 'string') {
      throw userError.args.user.id.notString;
    }

    const result = await this.userService.get(id);
    ctx.res.body = result;
  }
}
