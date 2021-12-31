import { singleton } from "tsyringe";
import type * as Data from "./data";
import { ajax } from "@/core/request";
import { Observable, of, switchMap } from "rxjs";
import { AxiosResponse } from "axios";
import { ElementRef } from "@/utils/element-ref";

@singleton()
export class AuthApi {
  public legacyLogin(params: Data.LoginParams): Observable<AxiosResponse<Data.LoginRespPayload>> {
    return ajax({
      method: "POST",
      url: "/keekijanai/auth/login",
      data: params,
    });
  }

  public legacyRegister(params: Data.RegisterParams): Observable<AxiosResponse<void>> {
    return ajax({
      method: "POST",
      url: "/keekijanai/auth/register",
      data: params,
    });
  }

  public current(): Observable<AxiosResponse<Data.CurrentRespPayload>> {
    return ajax({
      url: "/keekijanai/auth/current",
    });
  }

  public getUrlOfOAuth2Login(provider: Data.OAuth2.Provider): Observable<string> {
    return ajax({
      url: `/keekijanai/auth/oauth2/${provider}`,
    }).pipe(
      switchMap((resp) => {
        return of(resp.data as string);
      })
    );
  }
}
