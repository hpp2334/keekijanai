import {  ControllerHandler } from "../type/core/controller";
import { argsError, commonError } from "../rsp-error";
import { ServerlessContext } from "../_framework";
import createDebugger from 'debug';
import { Controller } from "../core/controller";
import { Context } from "../type";
import { parseGrouping } from "../utils/fns";
import * as _ from 'lodash';

const debug = createDebugger('keekijanai:controller:comment');

export class CommentController extends Controller {
  list: ControllerHandler = async (ctx) => {
    const { scope, parentId } = ctx.req.query || {};
    const grouping = parseGrouping(ctx.req.query);
    debug('list: scope="%s", parentId="%s", grouping="%o"', scope, parentId, grouping);

    const commentService = await ctx.getService('comment');
    const res = await commentService.list(scope, parentId, grouping);
    ctx.res.body = res;
  }

  create: ControllerHandler = async (ctx) => {
    const { scope } = ctx.req.query || {};
    const { comment } = ctx.req.body || {};

    if (!_.isObjectLike(comment)) {
      throw argsError.comment.comment.toBeObjectInReqBody();
    }

    debug('create: scope="%s"', scope);

    const commentService = await ctx.getService('comment');
    const res = await commentService.create(scope, comment);
    ctx.res.body = res;
  }

  delete: ControllerHandler = async (ctx) => {
    const { scope, commentId } = ctx.req.query || {};

    debug('create: scope="%s", id="%d"', scope, commentId);

    const commentService = await ctx.getService('comment');
    const res = await commentService.delete(scope, commentId);
    ctx.res.body = res;
  }

  TEST__clear: ControllerHandler = async (ctx) => {
    const commentService = await ctx.getService('comment');
    const res = await (commentService as any).TEST__clear();
    ctx.res.status = 200;
  }
}
