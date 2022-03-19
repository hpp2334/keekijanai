import { axiosInstance } from "@/core/request";
import { container } from "@/core/container";
import { ElementRef } from "@/utils/element-ref";
import { LocalStoreEntry, LocalStoreEntryKey } from "@/utils/local-store";
import { switchTap } from "@/utils/rxjs-helper";
import { isNil } from "@/utils/common";
import { BehaviorSubject, catchError, Observable, of, switchMap, throwError } from "rxjs";
import { injectable, postConstruct } from "inversify";
import { AuthApi } from "./api";
import * as Data from "./data";
import { Service } from "@/core/service";
import { GlobalService } from "../global";

const TOKEN_KEY = LocalStoreEntryKey("auth-token");

@injectable()
export class AuthService implements Service {
  private token$ = new BehaviorSubject<string | null>(null);
  private tokenStoreEntry = new LocalStoreEntry<string>(TOKEN_KEY, {
    ttl: 86400 * 1000,
  });
  public current$ = new BehaviorSubject<Data.UserVO | null>(null);

  public get token() {
    return this.token$.getValue();
  }

  public constructor(private globalService: GlobalService, private api: AuthApi) {}

  public destroy: (() => void) | undefined = undefined;

  public isLogin() {
    return this.current$.value !== null;
  }

  public createOAuth2LoginRef(provider: Data.OAuth2.Provider): ElementRef<HTMLButtonElement> {
    const elementRef = new ElementRef<HTMLButtonElement>((current) => {
      current.onclick = () => {
        this.api.getUrlOfOAuth2Login(provider).subscribe((href) => {
          console.debug("[auth][createOAuth2LoginRef]", "href", href);
          current.disabled = true;
          window.location.href = href;
        });
      };
    });
    return elementRef;
  }

  public handleOAuth2Token(token: string): Observable<unknown> {
    console.debug("[auth][handleOAuth2Token]");
    return this.updateToken(token).pipe(
      switchMap(() => this.updateCurrent()),
      switchTap(() => {
        return this.updateToken(token);
      })
    );
  }

  public handleOAuth2TokenOnUrl(): Observable<unknown> {
    const searchStr = window.location.search;
    const search = new URLSearchParams(searchStr);
    const token = search.get("token");
    console.debug("[auth][handleOAuth2TokenOnUrl]", { token });
    if (token === null) {
      return throwError(() => new Error("token not on url query"));
    }
    return this.handleOAuth2Token(token);
  }

  public updateCurrent(): Observable<unknown> {
    console.debug("[auth][updateCurrent]");
    return this.api.current().pipe(
      switchTap((resp) => {
        const { user } = resp.data;
        this.current$.next(user);
      }),
      catchError(() => {
        return this.clearToken();
      })
    );
  }

  public logout(): Observable<unknown> {
    return of(null).pipe(
      switchTap(() => {
        this.current$.next(null);
      }),
      switchTap(() => this.clearToken())
    );
  }

  @postConstruct()
  private postConstruct() {
    const token = this.tokenStoreEntry.get();
    console.debug("[auth][constructor]", { token });
    this.token$.next(token);
    this.updateCurrent().subscribe();

    this.registerRequestInterceptorToken();
  }

  private registerRequestInterceptorToken() {
    axiosInstance.interceptors.request.use((reqConfig) => {
      const token = this.token;
      console.debug("[auth][axios.interceptors]", { url: reqConfig.url, token });
      if (!isNil(token)) {
        reqConfig.headers = {
          ...(reqConfig.headers ?? {}),
          Authorization: token,
        };
      }

      return reqConfig;
    });
  }

  private updateToken(token: string): Observable<unknown> {
    console.debug("[auth][updateToken]", { token });
    this.token$.next(token);
    this.tokenStoreEntry.set(token);
    return of(null);
  }

  private clearToken(): Observable<unknown> {
    this.token$.next(null);
    this.tokenStoreEntry.delete();
    return of(null);
  }
}

container.bind(AuthService).toSelf().inSingletonScope();
