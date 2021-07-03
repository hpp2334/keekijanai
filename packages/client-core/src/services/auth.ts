
import { of, BehaviorSubject } from 'rxjs';
import { mergeMap, mergeMapTo, switchMapTo, tap } from 'rxjs/operators';
import { Service } from "../core/service";
import { createLocalStorageEntry } from "../utils/local-storage-entry";
import { Auth } from "keekijanai-type";
import processNextTick from 'next-tick';
import { Client } from '../core/client';

interface JwtInfo {
  jwt: string;
  expire: number;
}

const keekijanaiJwtEntry = createLocalStorageEntry('keekijanai-jwt');
const lastPageEntry = createLocalStorageEntry('keekijanai-last-page');


export class AuthService extends Service {
  private routes = {
    current: '/auth/current',
    legacyAuth: '/auth/legacyAuth',
    legacyRegister: '/auth/legacyRegister',
    getCode: '/auth/getCode',
  };
  private _jwtInfo: JwtInfo | null = null;
  user$ = new BehaviorSubject<Auth.CurrentUser | null>(null);

  get jwtInfo() {
    return this._jwtInfo;
  }
  set jwtInfo(next: JwtInfo | null) {
    // console.log('next jwtInfo', next, new Error());
    this._jwtInfo = next;
  }

  constructor(client: Client) {
    super(client);
    this.jwtInfo = this.readLocalJwtInfo();
  }

  initialize() {
    this.client.requester.hooks.beforeRequest.tap(this.handleBeforeRequest);

    /** @todo use hook to execute after client ready */
    processNextTick(() => {
      this.updateCurrent().subscribe({});
    });
  }

  uninitialize() {
    this.client.requester.hooks.beforeRequest.untap(this.handleBeforeRequest);
  }

  get jwt() {
    if (!this.jwtInfo || Date.now() > this.jwtInfo.expire) {
      keekijanaiJwtEntry.removeItem();
      this.jwtInfo = null;
      return undefined;
    }
    return this.jwtInfo.jwt;
  }

  legacyRegister = (userID: string, password: string) => {
    return this.client.requester.request({
      route: this.routes.legacyRegister,
      method: 'POST',
      body: {
        userID,
        password,
      }
    })
  }

  legacyAuth = (userID: string, password: string) => {
    return this.client.requester.request({
      route: this.routes.legacyAuth,
      method: 'POST',
      body: {
        userID,
        password,
      }
    }).pipe(
      tap(result => {
        const { jwt, maxAge } = result;
        this.updateLocalJwtInfo(jwt, maxAge);
      }),
      mergeMap(() => this.updateCurrent()),
    )
  }

  oauth2 = (provider: string) => {
    if (typeof window !== 'undefined') {
      lastPageEntry.setItem(window.location.pathname);
      const url = this.client.requester.getURI({
        route: this.routes.getCode,
        query: {
          provider,
        }
      });
      window.location = url as any;
    }
  }

  logout = () => {
    this.jwtInfo = null;
    keekijanaiJwtEntry.removeItem();
    this.user$.next({ isLogin: false });
  }

  updateCurrent = () => {
    if (this.jwt === undefined) {
      this.user$.next({ isLogin: false });
      return of(null);
    }
    
    return this.client.requester.request({
      route: this.routes.current,
    }).pipe(
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
      
      this.updateLocalJwtInfo(jwt, maxAge);
      this.updateCurrent().subscribe({});

      const lastPage = lastPageEntry.getItem();
      callback(lastPage ?? undefined);
    }
  }

  private updateLocalJwtInfo = (jwt: string, maxAge: number) => {
    this.jwtInfo = { jwt, expire: maxAge + Date.now() };
    keekijanaiJwtEntry.setItem(JSON.stringify(this.jwtInfo));
  }

  private readLocalJwtInfo = () => {
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

  private handleBeforeRequest = (headers: any) => {
    const jwt = this.jwt;
    if (jwt !== undefined) {
      headers.Authorization = this.jwt;
    }
  }
}

