import {
  ContextType,
  Controller, ControllerType, Route,
  InjectService,
} from 'keekijanai-server-core';

import * as starError from "./error";
import { StarService } from "./star.service";

const debug = require('debug')('keekijanai:controller:star');

export interface StarController extends ControllerType.ControllerBase {}

@Controller('/star')
export class StarController {
  @InjectService('star')  starService!: StarService;

  @Route("/get")
  async get(ctx: ContextType.Context) {
    const { scope } = ctx.req.query || {};

    if (typeof scope !== 'string') {
      throw starError.args.scope.notString;
    }

    const result = await this.starService.get(scope);
    ctx.res.body = result;
  }

  @Route("/post", 'POST')
  async post(ctx: ContextType.Context) {
    const { scope } = ctx.req.query || {};
    const { current } = ctx.req.body;

    if (typeof scope !== 'string') {
      throw starError.args.scope.notString;
    }
    if (!(current === 1 || current === -1 || current === 0 || current === null)) {
      throw Error(`"current" should be -1, 0, 1 or null`);
    }

    const result = await this.starService.post(scope, current);
    ctx.res.body = result;
  }

  @Route("/clear", 'POST')
  async clear(ctx: ContextType.Context) {
    const { scope } = ctx.req.query || {};

    if (typeof scope !== 'string') {
      throw starError.args.scope.notString;
    }

    const result = await this.starService.clear(scope);
    ctx.res.status = 204;
  }
}
