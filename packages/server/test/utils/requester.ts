import { appRequest } from "./request-core";

export type ValidUser = 'admin1' | 'user2';

class Requester {
  jwtMap: any = {};
  sessionIndentMap: Map<string | symbol, any> = new Map();

  async init() {
    const list = [
      { id: 'admin1', role: 0b11 },
      { id: 'user2', role: 0b1 },
    ];
    const rsp = await appRequest('/auth/test__prepare', {
      method: 'POST',
      body: list
    }).then(r => r.json());
    for (const { id, jwt } of rsp) {
      this.jwtMap[id] = jwt;
      this.sessionIndentMap.set(id, {});
    }
  }

  /** when user is ValidUser, then login; when user is symbol, then only unique client id */
  request(user: ValidUser | symbol | undefined, path: string, params?: Parameters<typeof appRequest>['1']) {
    const sessionIdentiter = this.sessionIndentMap.get(user) ?? {};
    this.sessionIndentMap.set(user, sessionIdentiter)
    return appRequest(path, {
      ...(params ?? {}),
      headers: typeof user === 'string' ? {
        Authorization: this.jwtMap[user],
      } : {},
      sessionIdentity: sessionIdentiter,
    });
  }
}

export const requester = new Requester();
