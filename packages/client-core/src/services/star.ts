import { Star } from 'keekijanai-type';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Service, serviceFactory } from "../core/service";

class StarServiceImpl extends Service {
  routes = {
    get: '/star/get',
    post: '/star/post',
  };

  get = (scope: string): Observable<Star.Get> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      query: {
        scope,
      },
    });
    return result;
  }

  post = (scope: string, star: Star.StarType): Observable<Star.Get> => {
    const result = this.client.requester.request({
      route: this.routes.post,
      method: 'POST',
      query: {
        scope,
      },
      body: {
        current: star,
      }
    });
    return result;
  }
}

export const star = serviceFactory(StarServiceImpl);
