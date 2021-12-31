import { singleton } from "tsyringe";
import type * as Data from "./data";
import { ajax } from "@/core/request";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";

@singleton()
export class StarApi {
  public getCurrent(belong: string): Observable<AxiosResponse<Data.GetStarResponse>> {
    return ajax({
      url: "/keekijanai/star",
      params: {
        belong,
      },
    });
  }

  public update(belong: string, payload: Data.UpdateStarReqPayload): Observable<AxiosResponse<void>> {
    return ajax({
      url: "/keekijanai/star",
      method: "PUT",
      params: {
        belong,
      },
      data: payload,
    });
  }
}
