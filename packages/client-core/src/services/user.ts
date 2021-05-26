import { User } from "keekijanai-type";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Service, serviceFactory } from "../core/service";


class UserServiceImpl extends Service {
  private routes = {
    get: '/user/get',
  };

  get = (id: string): Observable<User.User> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      query: {
        id,
      },
    });
    return result;
  }
}

export const user = serviceFactory(UserServiceImpl);
