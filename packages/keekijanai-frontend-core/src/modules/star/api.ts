import { injectable } from "inversify";
import type * as Data from "./data";
import { ajax } from "@/core/request";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";

@injectable()
export class StarApi {
  public getCurrent(belong: string): Observable<AxiosResponse<Data.GetStarResponse>> {
    return ajax({
      url: "/star",
      params: {
        belong,
      },
    });
  }

  public update(belong: string, payload: Data.UpdateStarReqPayload): Observable<AxiosResponse<void>> {
    return ajax({
      url: "/star",
      method: "PUT",
      params: {
        belong,
      },
      data: payload,
    });
  }
}
