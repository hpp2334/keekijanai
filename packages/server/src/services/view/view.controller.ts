import { ContextType } from "@/core/context";
import { Controller, Route, ControllerType } from "@/core/controller";
import { InjectService } from "@/core/service";
import { viewError } from ".";
import { ViewService } from "./view.service";

const debug = require('debug')('keekijanai:controller:view');

export interface ViewController extends ControllerType.ControllerBase {}

@Controller('/view')
export class ViewController {
  @InjectService('view')    viewService!: ViewService;

  @Route('/get')
  async get(ctx: ContextType.Context) {
    const { scope } = ctx.req.query || {};

    if (typeof scope !== 'string') {
      throw viewError.args.scope.notString;
    }

    const result = await this.viewService.get(scope);
    ctx.res.body = result;
  }

  @Route('/clear', 'POST')
  async clear(ctx: ContextType.Context) {
    const { scope } = ctx.req.query || {};

    if (typeof scope !== 'string') {
      throw viewError.args.scope.notString;
    }

    const result = await this.viewService.clear(scope);
    ctx.res.body = result;
  }
}
