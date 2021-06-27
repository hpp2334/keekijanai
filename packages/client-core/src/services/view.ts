import { Observable } from "rxjs";
import { Service } from "../core/service";
import { View } from 'keekijanai-type';
import { Client } from "../core/client";

export class ViewService extends Service {
  private routes = {
    get: '/view/get',
  };
  private scope: string;

  constructor(client: Client, scope: string) {
    super(client);

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
