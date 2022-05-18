import { injectable } from "inversify";
import type * as Data from "./data";
import { ajax } from "@/core/request";
import { Observable, of, switchMap } from "rxjs";
import { ElementRef } from "@/utils/element-ref";
import { container } from "@/core/container";

@injectable()
export class AuthApi {
  public legacyLogin(params: Data.LoginParams) {
    return ajax<Data.LoginRespPayload>({
      method: "POST",
      url: "/auth/login",
      data: params,
    });
  }

  public legacyRegister(params: Data.RegisterParams) {
    return ajax<void>({
      method: "POST",
      url: "/auth/register",
      data: params,
    });
  }

  public current() {
    return ajax<Data.CurrentRespPayload>({
      url: "/auth/current",
    });
  }

  public getUrlOfOAuth2Login(provider: Data.OAuth2.Provider): Observable<string> {
    return ajax({
      url: `/auth/oauth2/${provider}`,
    }).pipe(
      switchMap((resp) => {
        return of(resp.data as string);
      })
    );
  }
}

container.bind(AuthApi).toSelf();
