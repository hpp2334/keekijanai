import { ajax } from "@/core/request";
import { singleton } from "tsyringe";
import type * as Data from "./data";

@singleton()
export class StatApi {
  public update(belong: string) {
    return ajax<Data.VisitRespPayload, unknown>({
      url: "/stat",
      method: "PUT",
      params: {
        belong,
      },
    });
  }
}
