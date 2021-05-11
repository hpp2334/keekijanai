
import { Client } from "../core/client";
import { Observable, Subject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Service, serviceFactory } from "../core/service";
import { createLocalStorageEntry } from "../util";
import { Auth } from "keekijanai-type";

interface JwtInfo {
  jwt: string;
  expire: number;
}

const keekijanaiJwtEntry = createLocalStorageEntry('keekijanai-jwt');

class AuthServiceImpl extends Service {
  private routes = {
    current: '/auth/current',
    login: '/auth/login',
  };
  private jwtInfo: JwtInfo | undefined;
  user$: Subject<Auth.CurrentUser> = new Subject();

  constructor(client: Client) {
    super(client);

    this.jwtInfo = this.readLocalJwtInfo();
    this.updateCurrent().subscribe();
  }

  get jwt() {
    if (!this.jwtInfo || Date.now() > this.jwtInfo.expire) {
      keekijanaiJwtEntry.removeItem();
      this.jwtInfo = undefined;
      return null;
    }
    return this.jwtInfo.jwt;
  }

  auth = (username: string, password: string) => {
    throw Error('"auth" function not implement!');
  }

  oauth = (provider: string) => {
    return this.client.requester.request({
      route: this.routes.login,
      query: {
        provider,
      }
    });
  }

  logout = () => {
    this.jwtInfo = undefined;
    keekijanaiJwtEntry.removeItem();
  }

  updateCurrent = () => {
    return this.client.requester.request({
      route: this.routes.current,
    }).pipe(
      map(value => value.response as any),
      tap(current => {
        this.user$.next(current);
      }),
    );
  }

  onCallback = (redirect: string, timeoutMs: number) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const jwt = url.searchParams.get('jwt');
      const maxAge = parseInt(url.searchParams.get('maxAge') ?? '0');
      if (!jwt) {
        return;
      }
  
      this.jwtInfo = { jwt, expire: maxAge + Date.now() };
      keekijanaiJwtEntry.setItem(JSON.stringify(this.jwtInfo));
      setTimeout(() => {
        window.location = redirect as any;
      }, timeoutMs);
    }
  }

  private readLocalJwtInfo() {
    const str = keekijanaiJwtEntry.getItem();
    if (str) {
      const info = JSON.parse(str);
      if (typeof info.jwt === 'undefined' || typeof info.expire === 'undefined' ) {
        keekijanaiJwtEntry.removeItem();
        return undefined;
      }
      return info;
    }
    return undefined;
  }
}

export const auth = serviceFactory(AuthServiceImpl);
