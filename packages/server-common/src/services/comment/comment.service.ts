import _ from 'lodash';
import { Comment, Grouping, User } from "keekijanai-type";
import { Init, InjectService, Service, ServiceType } from 'keekijanai-server-core';

import type { NotifyService } from '@/services/notify';
import type { UserService } from "@/services/user";
import type { AuthService } from '@/services/auth';
import * as commentError from './error';
import Mint from "mint-filter";
import { O } from 'ts-toolbelt';

const debug = require('debug')('keekijanai:service:comment');

type CommentDBCreate = Comment.Create & Pick<Comment.Get, 'cTime'> & {
  userId: string;
}

type CommentDB = CommentDBCreate & {
  id: number;
  childCounts: number;
}

export interface Config {
  sensitive?: string[] | null;
}

type InternalConfig = O.Required<Config>

let _cachedMint: any = null;

export interface CommentService extends ServiceType.ServiceBase {}

const TABLE_NAME = 'keekijanai_comment';
const TABLE_KEYS = ['id'];

@Service({
  key: 'comment'
})
export class CommentService {
  @InjectService('notify')  notifyService!: NotifyService;
  @InjectService('user')    userService!: UserService;
  @InjectService('auth')    authService!: AuthService;
  private config!: InternalConfig;

  @Init('config')
  setInternalConfig(config: any) {
    this.config = {
      sensitive: null,
    };
    if (config && Array.isArray(config.sensitive)) {
      this.config.sensitive = config.sensitive;
    }
  }

  async get(id: number): Promise<Comment.Get> {
    const result = await this.provider.select({
      from: TABLE_NAME,
      where: {
        id: [['=', id]]
      },
      keys: TABLE_KEYS,
    });

    if (result.error || !Array.isArray(result.body)) {
      throw Error(`Get comments fail.` + result.error?.message);
    }
    if (_.isNil(result.body[0])) {
      throw commentError.notExists;
    }
    
    const comment: Comment.Get = result.body[0];
    return comment;
  }

  async create(scope: string, rawComment: Comment.Create) {
    const user = this.authService.current(true);

    const comment: CommentDBCreate = {
      ...rawComment,
      scope,
      userId: user.id,
      cTime: Date.now(),
    };
    if (this.config?.sensitive?.length) {
      const { sensitive } = this.config;
      const mint: Mint = _cachedMint = _cachedMint ?? new Mint(sensitive);
      const invalid = !mint.validator(comment.content) || !mint.validator(comment.plainText);
      if (invalid) {
        throw commentError.sensitive;
      }
    }
    const result = await this.provider.insert({
      from: TABLE_NAME,
      payload: comment,
      keys: TABLE_KEYS,
    });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Create comment fail. ` + result.error?.message);
    }

    if (comment.parentId) {
      await this.updateChildCounts(comment.parentId, 1);
    }

    if (this.notifyService.shouldNotify()) {
      const message = `"${user.name}" comment in scope "${scope}":\n${comment.plainText}`;
      await this.notifyService.notify(message);
    }
    
    const res = result.body[0];
    return res;
  }

  async list(scope: string, parentId: number | undefined, grouping: Grouping) {
    const result = await this.provider.select({
      from: TABLE_NAME,
      count: 'exact',
      where: {
        'scope': [['=', scope]],
        'parentId': [['=', parentId ?? null]]
      },
      order: [
        ['cTime', 'desc']
      ],
      skip: grouping.skip,
      take: grouping.take,
      keys: TABLE_KEYS,
    });
    if (result.error) {
      throw Error(`List comments fail. ` + JSON.stringify(result.error));
    }
    if (_.isNil(result.count)) {
      throw Error(`count is null`);
    }

    return { comments: result.body ?? [], total: result.count };
  }

  async delete(commentId: number) {
    const user = this.authService.current(true);

    const comment = await this.get(commentId);
    debug('delete comment %s, role=%s', comment.id, user.role);
    if (!(user.id === comment.userId || this.userService.matchRole(user, ['admin']))) {
      throw commentError.forbidden;
    }

    const result = await this.provider.delete({
      from: 'keekijanai_comment',
      where: {
        id: [['=', commentId.toString()]]
      }
    });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Delete comment ${commentId} fail. ` + result.error);
    }

    if (comment.parentId) {
      await this.updateChildCounts(comment.parentId, -1);
    }

    return { id: comment.id };
  }

  private async updateChildCounts(id: number, delta: number = 1) {
    if (id) {
      const result = await this.provider.select({
        from: TABLE_NAME,
        where: {
          'id': [['=', id]],
        },
        keys: TABLE_KEYS,
      });
      if (result.error || result.body?.length !== 1) {
        throw Error('query commment fail');
      }

      const { childCounts } = result.body[0];

      const rsp = await this.provider.update({
        from: TABLE_NAME,
        where: {
          id: [['=', id.toString()]],
        },
        payload: {
          childCounts: childCounts + delta,
        },
        keys: TABLE_KEYS,
      });
    }
  }

  async TEST__clear() {
    const result = await this.provider.delete({
      from: 'keekijanai_comment',
    });
    if (result.error) {
      throw result.error;
    }
  }
}
