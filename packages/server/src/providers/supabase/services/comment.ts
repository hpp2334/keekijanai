import type { Supabase } from '..';
import { Comment, CommentService, User } from "../../../type";
import { convert } from "../../../utils/db";
import { Service } from '../../../core/service';
import * as _ from 'lodash';
import { commonError } from '../../../rsp-error';


type CommentDBCreate = Comment.Create & Pick<Comment.Get, 'cTime'> & {
  userId: string;
}

type CommentDB = CommentDBCreate & {
  id: number;
  childCounts: number;
}

export class CommentServiceImpl extends Service<Supabase> implements CommentService {
  get: CommentService['get'] = async (id) => {
    const result = await this.provider.client
      .from('comment')
      .select('*', { count: 'exact' })
      .eq('id', id);

    if (result.error || !Array.isArray(result.body)) {
      throw Error(`Get comments fail.` + result.error?.message);
    }
    if (_.isNil(result.body[0])) {
      throw commonError.comment.notExists();
    }
    
    const comment: Comment.Get = convert(result.body[0], 'from-db');

    return comment;
  }

  create: CommentService['create'] = async (scope, rawComment) => {
    const { user } = this.context;
    if (!user.isLogin) {
      throw commonError.auth.userNeedLogin();
    }

    const notifyService = await this.context.getService('notify');

    const comment: CommentDBCreate = {
      ...rawComment,
      scope,
      userId: user.id,
      cTime: Date.now(),
    };
    const result = await this.provider.client
      .from('comment')
      .insert(convert(comment, 'to-db'));
    if (result.error || result.body?.length !== 1) {
      throw Error(`Create comment fail. ` + result.error?.message);
    }

    if (comment.parentId) {
      await this.updateChildCounts(comment.parentId, 1);
    }

    if (notifyService.shouldNotify()) {
      const message = `"${user.name}" comment in scope "${scope}": ${comment.content}`;
      await notifyService.notify(message);
    }
    
    const res = convert(result.body[0], 'from-db');
    return res;
  }

  list: CommentService['list'] = async (scope, parentId, grouping) => {
    let request = this.provider.client
      .from('comment')
      .select('*', { count: 'exact' })
      .eq('scope', scope);
    if (parentId !== undefined) {
      request = request.eq('parent_id', parentId);
    } else {
      request = request.is('parent_id', null);
    }
    request = request
      .order('c_time', { ascending: false })
      .range(grouping.skip * grouping.take, (grouping.skip + 1) * grouping.take - 1);
    const result = await request;

    if (result.error || !Array.isArray(result.body)) {
      throw Error(`List comments fail.` + result.error?.message);
    }
    if (_.isNil(result.count)) {
      throw Error(`count is null`);
    }
    
    const commentsInDB: CommentDB[] = result.body.map(ele => convert(ele, 'from-db'));
    const comments: Comment.Get[] = commentsInDB;

    return { comments, total: result.count };
  }

  delete: CommentService['delete'] = async (commentId) => {
    const { user } = this.context;
    if (!user.isLogin) {
      throw commonError.auth.userNeedLogin();
    }

    const result = await this.provider.client
      .from('comment')
      .delete()
      .match({ id: commentId.toString(), user_id: user.id });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Delete comment ${commentId} fail. ` + result.error);
    }

    const comment = result.body[0];
    if (comment.parent_id) {
      await this.updateChildCounts(comment.parent_id, -1);
    }

    return { id: result.body[0].id };
  }

  private async updateChildCounts(id: number, delta: number = 1) {
    if (id) {
      const result = await this.provider.client
        .from('comment')
        .select('*')
        .eq('id', id)
        .single();

      if (!result.error) {
        const { child_counts } = result.body;

        const rsp = await this.provider.client
          .from('comment')
          .update({
            child_counts: child_counts + delta,
          })
          .match({
            id: id.toString(),
          });
      }
    }
  }

  async TEST__clear() {
    const result = await this.provider.client
      .from('comment')
      .delete();
    if (result.error) {
      throw result.error;
    }
  }
}
