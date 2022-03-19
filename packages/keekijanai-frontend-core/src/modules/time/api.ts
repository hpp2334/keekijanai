import { injectable } from "inversify";
import type * as ApiTypes from "@/generated/keekijanai-api";
import { ajax } from "@/core/request";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";
import { container } from "@/core/container";

@injectable()
export class TimeApi {
  public now(): Observable<AxiosResponse<ApiTypes.GetTimeResponse>> {
    return ajax({
      url: "/time",
    });
  }
}

container.bind(TimeApi).toSelf().inSingletonScope();
