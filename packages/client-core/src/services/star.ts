import { Star } from 'keekijanai-type';
import { Observable } from 'rxjs';
import { Client } from '../core/client';
import { Service } from "../core/service";

export class StarService extends Service {
  private routes = {
    get: '/star/get',
    post: '/star/post',
  };
  private scope: string;

  constructor(client: Client, scope: string) {
    super(client);

    this.scope = scope;
  }

  get = (): Observable<Star.Get> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      query: {
        scope: this.scope,
      },
    });
    return result;
  }

  post = (star: Star.StarType): Observable<Star.Get> => {
    const result = this.client.requester.request({
      route: this.routes.post,
      method: 'POST',
      query: {
        scope: this.scope,
      },
      body: {
        current: star,
      }
    });
    return result;
  }
}

