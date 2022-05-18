import { injectable } from "inversify";
import type * as Data from "./data";
import { ajax } from "@/core/request";
import { Observable } from "rxjs";
import { container } from "@/core/container";

@injectable()
export class StarApi {
  public getCurrent(belong: string) {
    return ajax<Data.GetStarResponse>({
      url: "/star",
      params: {
        belong,
      },
    });
  }

  public update(belong: string, payload: Data.UpdateStarReqPayload) {
    return ajax<void>({
      url: "/star",
      method: "PUT",
      params: {
        belong,
      },
      data: payload,
    });
  }
}

container.bind(StarApi).toSelf();
