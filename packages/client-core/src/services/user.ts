import { User } from "keekijanai-type";
import { merge, Observable, pipe, of } from "rxjs";
import { mergeMap, switchMapTo, last, tap } from "rxjs/operators";
import { Service } from "../core/service";

export class UserService extends Service {
  private routes = {
    get: '/user/get',
  };

  get = (id: string): Observable<User.User> => {
    const result = this.client.requester.request({
      route: this.routes.get,
      query: {
        id,
      },
      cache: {
        paths: ['user', 'get', id],
      }
    });
    return result;
  }

  blockTapBatch = <T>(getIDs: (kept: T) => string[]) =>
    (source: Observable<T>) => source.pipe(
      mergeMap(data => {
        const ids = [...new Set(getIDs(data))];
        if (ids.length === 0) {
          return of(data);
        }

        return merge(
          ...ids.map(id => this.get(id))
        ).pipe(
          switchMapTo(of(data)),
          last(),
        )
      }),
    )
}

