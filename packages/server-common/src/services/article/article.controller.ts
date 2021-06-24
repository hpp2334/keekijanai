import { parseGrouping } from '@/utils/fns';
import {
  ContextType,
  Controller, ControllerType, Route,
  InjectService,
} from 'keekijanai-server-core';
import { ArticleService } from './article.service';
import * as articleValidation from './validation';

export interface ArticleController extends ControllerType.ControllerBase {}

@Controller('/article')
export class ArticleController {
  @InjectService('article')    articleService!: ArticleService;
  
  @Route('/list', 'POST', {
    validation: articleValidation.list,
  })
  async list(ctx: ContextType.Context) {
    const { where, pagination, fields } = ctx.req.body ?? {};

    const result = await this.articleService.list({ where, fields, pagination });
    ctx.res.body = result;
  }

  @Route('/get', 'GET', {
    validation: articleValidation.get,
  })
  async get(ctx: ContextType.Context) {
    const reqQuery = ctx.req.query!;
    const id = Number(reqQuery.id);
    const fields = reqQuery.fields?.split(',');
    
    const result = await this.articleService.get(id, { fields });
    ctx.res.body = result;
  }

  @Route('/create', 'POST', {
    validation: articleValidation.create,
  })
  async create(ctx: ContextType.Context) {
    const payload = ctx.req.body!;
    
    const result = await this.articleService.create(payload);
    ctx.res.body = result;
  }

  @Route('/update-article-core', 'PUT', {
    validation: articleValidation.updateArticleCore,
  })
  async updateArticleCore(ctx: ContextType.Context) {
    const reqQuery = ctx.req.query!;
    const payload = ctx.req.body!;
    const id = Number(reqQuery.id);

    const result = await this.articleService.updateArticleCore(id, payload);
    ctx.res.body = result;
  }

  @Route('/delete', 'DELETE', {
    validation: articleValidation.remove,
  })
  async delete(ctx: ContextType.Context) {
    const reqQuery = ctx.req.query!;
    const id = Number(reqQuery.id);

    const result = await this.articleService.delete(id);
    ctx.res.body = result;
  }

  @Route('/dev__clear', 'DELETE', { onlyDEBUG: true })
  async DEV__clear(ctx: ContextType.Context) {
    const list = ctx.req.body;
    ctx.res.body = await this.articleService.DEV__clear();
  }

}