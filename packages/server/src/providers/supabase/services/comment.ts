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
      const result = await this.provider.client
        .from('comment')
        .select('*')
        .eq('id', comment.parentId)
        .single();

      if (!result.error) {
        const { child_counts } = result.body[0];
        
        await this.provider.client
          .from('client')
          .upsert({
            child_counts: child_counts + 1,
          });
      }
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
      request = request.eq('parent_id', parentId ?? null);
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

  delete: CommentService['delete'] = async (scope, commentId) => {
    const { user } = this.context;
    if (!user.isLogin) {
      throw commonError.auth.userNeedLogin();
    }

    const result = await this.provider.client
      .from('comment')
      .delete()
      .match({ id: commentId.toString(), scope, user_id: user.id });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Delete comment ${commentId} fail.`);
    }

    return { id: result.body[0].id };
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
