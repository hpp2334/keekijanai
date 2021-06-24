import _ from 'lodash';
import { Comment, Grouping, User, Article } from "keekijanai-type";
import { Init, InjectService, Service, ServiceType } from 'keekijanai-server-core';

import * as articleError from './error';

const debug = require('debug')('keekijanai:service:article-core');

interface GetOpts<SE extends boolean> {
  fields?: Array<string>;
  shouldExists?: SE;
}

export interface ArticleCoreService extends ServiceType.ServiceBase {}

@Service({
  key: 'article-core'
})
export class ArticleCoreService {
  private provider = this.providerManager.getProvider('article-core', {
    table: {
      from: 'keekijanai_article_core',
      keys: ['id'],
    },
  });

  async get <SE extends boolean = false>(id: number, opts?: GetOpts<SE>): Promise<SE extends false ? Article.CoreGet | undefined : Article.CoreGet> {
    const result = await this.provider.select({
      columns: ['id', 'type', ...(opts?.fields ?? ['title', 'abstract', 'content'])],
      where: {
        id: [['=', id]]
      },
    });

    if (result.error || !Array.isArray(result.body)) {
      throw Error(`Get article core fail.` + result.error?.message);
    }
    if (opts?.shouldExists && _.isNil(result.body[0])) {
      throw articleError.core.notExists;
    }
    
    const articleCore: any = result.body[0];
    return articleCore;
  }

  async create(payload: Article.CoreCreate): Promise<Article.CoreGet> {
    const result = await this.provider.insert({
      payload,
    });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Create article core fail. ` + result.error?.message);
    }
    
    const res = result.body[0];
    return res;
  }

  async update(payload: Article.CoreUpdate): Promise<Article.CoreGet> {
    const result = await this.provider.update({
      where: {
        id: [['=', payload.id]],
      },
      payload,
    });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Update article core fail. ` + result.error?.message);
    }

    return result.body[0];
  }

  async delete(id: number) {
    const result = await this.provider.delete({
      where: {
        id: [['=', id]]
      }
    });
    if (result.error || result.body?.length !== 1) {
      throw Error(`Delete article core fail. ` + result.error?.message);
    }

    return { id };
  }

  async TEST__clear() {
    const result = await this.provider.delete({ });
    if (result.error) {
      throw result.error;
    }
  }
}
