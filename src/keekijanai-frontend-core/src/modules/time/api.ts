import { singleton } from "tsyringe";
import type * as ApiTypes from "@/generated/keekijanai-api";
import { ajax } from "@/core/request";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";

@singleton()
export class TimeApi {
  now(): Observable<AxiosResponse<ApiTypes.GetTimeResponse>> {
    return ajax({
      url: "/keekijanai/time",
    });
  }
}
