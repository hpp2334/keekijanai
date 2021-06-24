import { Article } from 'keekijanai-type';
import { Observable } from 'rxjs';
import { Service } from "../core/service";

export type ArticleListWhereParams = Partial<Pick<Article.Get, 'scope' | 'creatorId'>>;

export class ArticleService extends Service {
  private routes = {
    get: '/article/get',
    list: '/article/list',
    create: '/article/create',
    updateArticleCore: '/article/update-article-core',
    delete: '/article/delete',
  };

  list = (params: {
    where: ArticleListWhereParams;
    pagination: {
      page: number;
      pageSize: number;
    };
    fields?: string[];
  }): Observable<Article.List> => {
    const result = this.client.requester.request({
      method: 'POST',
      route: this.routes.list,
      body: {
        ...params,
        pagination: {
          skip: (params.pagination.page - 1),
          take: params.pagination.pageSize,
        },
      },
    });
    return result;
  }

  get = (id: number, opts?: {
    fields?: string[];
  }): Observable<Article.Get> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      query: {
        id,
        fields: opts?.fields,
      }
    });
    return result;
  }

  create = (payload: Article.Create) => {
    const result = this.client.requester.request({
      method: 'POST',
      route: this.routes.create,
      body: payload,
    });
    return result;
  }

  updateArticleCore = (id: number, payload: Article.CoreCreate) => {
    const result = this.client.requester.request({
      method: 'PUT',
      route: this.routes.updateArticleCore,
      query: {
        id,
      },
      body: payload,
    });
    return result;
  }

  delete = (id: number) => {
    const result = this.client.requester.request({
      method: 'DELETE',
      route: this.routes.delete,
      query: {
        id
      },
    });
    return result;
  }
}