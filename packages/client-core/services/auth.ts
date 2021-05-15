
import { Client } from "../core/client";
import { Observable, Subject, of, BehaviorSubject } from 'rxjs';
import { map, switchMapTo, tap } from 'rxjs/operators';
import { Service, serviceFactory } from "../core/service";
import { createLocalStorageEntry } from "../util";
import { Auth } from "keekijanai-type";
import processNextTick from 'next-tick';

interface JwtInfo {
  jwt: string;
  expire: number;
}

const keekijanaiJwtEntry = createLocalStorageEntry('keekijanai-jwt');
const lastPageEntry = createLocalStorageEntry('keekijanai-last-page');

class AuthServiceImpl extends Service {
  private routes = {
    current: '/auth/current',
    login: '/auth/login',
  };
  private jwtInfo: JwtInfo | undefined;
  user$ = new BehaviorSubject<Auth.CurrentUser>({ isLogin: false });

  constructor(client: Client) {
    super(client);

    this.jwtInfo = this.readLocalJwtInfo();

    processNextTick(() => {
      this.updateCurrent().subscribe({});
    });
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
    if (typeof window !== 'undefined') {
      lastPageEntry.setItem(window.location.pathname);
      const url = this.client.requester.getURI({
        route: this.routes.login,
        query: {
          provider,
        }
      });
      window.location = url as any;
    }
  }

  logout = () => {
    this.jwtInfo = undefined;
    keekijanaiJwtEntry.removeItem();
    this.user$.next({ isLogin: false });
  }

  updateCurrent = () => {
    if (!this.jwt) {
      this.user$.next({ isLogin: false });
      return of(null);
    }

    return this.client.requester.request({
      route: this.routes.current,
    }).pipe(
      map(value => value.response as any),
      tap(user => { this.user$.next(user) }),
      switchMapTo(of(null)),
    );
  }

  onCallback = (callback: (redirect?: string) => void) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const jwt = url.searchParams.get('jwt');
      const maxAge = parseInt(url.searchParams.get('maxAge') ?? '0');
      if (!jwt) {
        return;
      }
  
      this.jwtInfo = { jwt, expire: maxAge + Date.now() };
      keekijanaiJwtEntry.setItem(JSON.stringify(this.jwtInfo));

      this.updateCurrent().subscribe({});

      const lastPage = lastPageEntry.getItem();
      callback(lastPage ?? undefined);
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
