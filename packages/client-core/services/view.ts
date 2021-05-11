import { map } from 'rxjs/operators';
import { throwError } from "rxjs";
import { Service, serviceFactory } from "../core/service";

export class ViewServiceImpl extends Service {
  routes = {
    get: '/view',
  };

  get = (scope: string) => {
    const result = this.client.requester.request({
      route: this.routes.get,
      method: 'POST',
      query: {
        scope,
      },
    }).pipe(
      map(value => typeof (value.response as any).count === 'number'
        ? (value.response as any).count
        : throwError(() => new Error('"count" is undefined in response.'))
      )
    );
    return result; 
  }
}

export const view = serviceFactory(ViewServiceImpl);
