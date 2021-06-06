import { Observable } from "rxjs";
import { Service } from "../core/service";
import { View } from 'keekijanai-type';

export class ViewService extends Service {
  private routes = {
    get: '/view/get',
  };
  private scope: string;

  constructor(scope: string) {
    super();

    this.scope = scope;
  }

  get = (): Observable<View.Get> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      method: 'GET',
      query: {
        scope: this.scope,
      },
    });
    return result; 
  }
}
