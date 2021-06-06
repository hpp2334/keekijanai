
import { of, BehaviorSubject } from 'rxjs';
import { switchMapTo, tap } from 'rxjs/operators';
import { Service } from "../core/service";
import { createLocalStorageEntry } from "../utils/local-storage-entry";
import { Auth } from "keekijanai-type";
import processNextTick from 'next-tick';

interface JwtInfo {
  jwt: string;
  expire: number;
}

const keekijanaiJwtEntry = createLocalStorageEntry('keekijanai-jwt');
const lastPageEntry = createLocalStorageEntry('keekijanai-last-page');

export class AuthService extends Service {
  private routes = {
    current: '/auth/current',
    login: '/auth/login',
  };
  private jwtInfo: JwtInfo | undefined;
  user$ = new BehaviorSubject<Auth.CurrentUser>({ isLogin: false });

  constructor() {
    super();

    this.jwtInfo = this.readLocalJwtInfo();

    this.client.requester.hook('beforeRequest', (headers) => {
      const jwt = this.jwt;
      if (jwt !== undefined) {
        headers.Authorization = this.jwt;
      }
    });

    processNextTick(() => {
      this.updateCurrent().subscribe({});
    });
  }

  get jwt() {
    if (!this.jwtInfo || Date.now() > this.jwtInfo.expire) {
      keekijanaiJwtEntry.removeItem();
      this.jwtInfo = undefined;
      return undefined;
    }
    return this.jwtInfo.jwt;
  }

  auth = (username: string, password: string) => {
    return this.client.requester.request({
      route: this.routes.login,
      query: {
        username,
        password,
      }
    }).pipe(
      tap(response => {
        const { jwt, maxAge } = response;
        this.updateLocalJwtInfo(jwt, maxAge);
      }),
      tap(() => this.updateCurrent().subscribe({}))
    )
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

  private updateLocalJwtInfo(jwt: string, maxAge: number) {
    this.jwtInfo = { jwt, expire: maxAge + Date.now() };
    keekijanaiJwtEntry.setItem(JSON.stringify(this.jwtInfo));
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

