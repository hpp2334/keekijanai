import _ from 'lodash';
import { Comment, Grouping, User, Article } from "keekijanai-type";
import { Init, InjectService, Service, ServiceType } from 'keekijanai-server-core';
import Aigle from 'aigle';

import * as articleError from './error';
import { ArticleCoreService } from './article-core.service';
import { UserService } from '@/services/user';
import { AuthService } from '@/services/auth';
import { TimeService } from '@/services/time';

const debug = require('debug')('keekijanai:service:article-core');

type DBType = Omit<Article.Get, 'article' | 'creator' | 'lastUpdateUser'>;

const INSTANCE_DB_TYPE: DBType = {
  id: null as any,
  scope: null as any,
  articleId: null as any,
  creatorId: null as any,
  lastUpdateUserId: null as any,
  predecessorId: null as any,
  cTime: null as any,
  mTime: null as any,
};

interface GetOpts {
  fields?: Array<string>;
}

interface ListParams {
  where?: Partial<DBType>;
  fields?: Array<string>;
  pagination: Grouping;
  order?: [string, 'asc' | 'desc'];
}

export interface ArticleService extends ServiceType.ServiceBase {}

@Service({
  key: 'article'
})
export class ArticleService {
  @InjectService('article-core')    articleCoreService!: ArticleCoreService;
  @InjectService('user')            userService!: UserService;
  @InjectService('auth')            authService!: AuthService;
  @InjectService('time')            timeService!: TimeService;

  /** @todo save in db */
  private USER_ROLES: Record<string, Record<string, number>> = {};

  private provider = this.providerManager.getProvider('article-core', {
    table: {
      from: 'keekijanai_article',
      keys: ['id'],
    },
  });

  async list (params: ListParams): Promise<Article.List> {
    debug('before list (params = %o)', params);
    debug('where map to %o', params.where && _.mapValues(params.where, v => [['=', v]]));
    const result = await this.provider.select<DBType>({
      where: params.where && _.mapValues(params.where, v => [['=', v]]) as any,
      count: true,
      skip: params.pagination.skip,
      take: params.pagination.take,
      order: [params.order ?? ['m_time', 'desc']],
    });
    if (result.error || !Array.isArray(result.body)) {
      throw Error(`List article fail.` + result.error?.message);
    }
    if (result.count === null) {
      throw Error(`count is null` + result.error?.message);
    }
    debug('after list: %O', result.body);

    const list = await Aigle.mapLimit<DBType, Article.Get>(result.body, 15, async (raw) => {
      return {
        ...raw,
        article: await this.articleCoreService.get(raw.articleId, {
          fields: params.fields,
          shouldExists: true,
        }),
        creator: (await this.userService.get(raw.creatorId, { shouldExists: false })) ?? null,
        lastUpdateUser: (await this.userService.get(raw.creatorId, { shouldExists: false })) ?? null,
      }
    });

    return {
      data: list,
      fields: params.fields,
      total: result.count,
      pagination: params.pagination,
    }
  }

  async get (id: number, opts?: GetOpts): Promise<Article.Get> {
    const listRes = await this.list({
      where: { id },
      pagination: { skip: 0, take: 1 },
      fields: opts?.fields,
    });
    if (listRes.total === 0) {
      throw articleError.notExists;
    }
    if (listRes.total !== 1) {
      throw Error(`Get article core fail. The number of total items are ${listRes.total}.`);
    }
    const [article] = listRes.data;
    return article;
  }

  async create(payload: Article.Create): Promise<Article.Get> {
    const user = this.authService.current(true);
    const time = await this.timeService.getTime();

    debug(`before create %o (user: %s)`, payload.article, user.id);
    const canCreate = await this.userService.matchScopeRole('article/' + payload.scope, this.USER_ROLES[payload.scope] ?? {}, user, ['admin'], 'admin');
    if (!canCreate) {
      throw articleError.insufficientPriviledge;
    }

    const articleCore = await this.articleCoreService.create(payload.article);
    debug('after create core (articleId: %d)', articleCore.id);

    const result = await this.provider.insert({
      payload: {
        ..._.pick(payload, Object.keys(INSTANCE_DB_TYPE)),
        articleId: articleCore.id,
        creatorId: user.id,
        lastUpdateUserId: user.id,
        cTime: time,
        mTime: time,
      },
    });
    debug('after create %o', result.body);

    if (result.error || result.body?.length !== 1 || typeof result.body?.[0]?.id !== 'number') {
      throw Error(`Create article core fail. ` + result.error?.message);
    }
    
    const [inserted] = result.body;
    return await this.get(inserted.id);
  }

  async updateArticleCore(id: number, toUpdate: Article.UpdateArticleCore): Promise<Article.Get> {
    const user = this.authService.current(true);
    const time = await this.timeService.getTime();

    const article = await this.get(id);

    const canUpdate = await this.userService.matchScopeRole('article/' + article.scope, this.USER_ROLES[article.scope] ?? {}, user, ['admin'], 'admin');
    if (!canUpdate) {
      throw articleError.insufficientPriviledge;
    }

    await this.articleCoreService.update({
      ...toUpdate,
      id: article.articleId,
    });
    const result = await this.provider.update({
      where: {
        id: [['=', id]],
      },
      payload: {
        id,
        creatorId: user.id,
        lastUpdateUserId: user.id,
        mTime: time,
      },
    });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Update article core fail. ` + result.error?.message);
    }

    return await this.get(id);
  }

  async delete(id: number) {
    const result = await this.provider.delete({
      where: {
        id: [['=', id]]
      }
    });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Delete article fail. ` + result.error?.message);
    }
    const [payload] = result.body;
    await this.articleCoreService.delete(payload.articleId);

    return { id };
  }

  async updateRoleMap(scope: string, map: Record<string, number>) {
    this.USER_ROLES[scope] = map;
  }

  async DEV__clear() {
    const result = await this.provider.delete({ });
    if (result.error) {
      throw result.error;
    }
  }
}
