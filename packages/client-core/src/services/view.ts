import { map } from 'rxjs/operators';
import { Observable, throwError } from "rxjs";
import { Service, serviceFactory } from "../core/service";
import { View } from 'keekijanai-type';

export class ViewServiceImpl extends Service {
  routes = {
    get: '/view/get',
  };

  get = (scope: string): Observable<View.Get> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      method: 'GET',
      query: {
        scope,
      },
    });
    return result; 
  }
}

export const view = serviceFactory(ViewServiceImpl);
