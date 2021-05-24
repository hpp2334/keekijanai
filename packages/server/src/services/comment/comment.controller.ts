import * as _ from 'lodash';
import { parseGrouping } from "@/utils/fns";

import { Controller, ControllerType, Route } from '@/core/controller';
import { InjectService } from "@/core/service";
import { commentError, CommentService } from "@/services/comment";

const debug = require('debug')('keekijanai:controller:comment');

export interface CommentController extends ControllerType.ControllerBase {}

@Controller('/comment')
export class CommentController {
  @InjectService('comment')  commentService!: CommentService;

  @Route('/get')
  get: ControllerType.RouteHandler = async (ctx) => {
    const { id } = ctx.req.query || {};
    debug('get: id="%s"', id);

    const res = await this.commentService.get(id);
    ctx.res.body = res;
  }

  @Route('/list')
  list: ControllerType.RouteHandler = async (ctx) => {
    const { scope, parentId: rawParentId } = ctx.req.query || {};
    const grouping = parseGrouping(ctx.req.query);
    const parentId = /\d+/.test(rawParentId) ? parseInt(rawParentId) : undefined;
    debug('list: scope="%s", parentId="%s", grouping="%o"', scope, parentId, grouping);

    const res = await this.commentService.list(scope, parentId, grouping);
    ctx.res.body = res;
  }

  @Route('/create', 'POST')
  create: ControllerType.RouteHandler = async (ctx) => {
    const { scope } = ctx.req.query || {};
    const { comment } = ctx.req.body || {};

    if (!_.isObjectLike(comment)) {
      throw commentError.args.comment.notObject;
    }

    debug('create: scope="%s"', scope);

    const res = await this.commentService.create(scope, comment);
    ctx.res.body = res;
  }

  @Route('/delete', 'DELETE')
  delete: ControllerType.RouteHandler = async (ctx) => {
    const { commentId } = ctx.req.query || {};

    debug('delete: id="%d"', commentId);

    const res = await this.commentService.delete(commentId);
    ctx.res.body = res;
  }

  @Route('/delete', 'DELETE', { onlyDEBUG: true })
  TEST__clear: ControllerType.RouteHandler = async (ctx) => {
    const res = await this.commentService.TEST__clear();
    ctx.res.status = 200;
  }
}
