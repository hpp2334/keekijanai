import { container } from "@/core/container";
import { ajax } from "@/core/request";
import type * as Data from "./data";

export class StatApi {
  public update(belong: string) {
    return ajax<Data.VisitRespPayload>({
      url: "/stat",
      method: "PUT",
      params: {
        belong,
      },
    });
  }
}

container.register({
  class: StatApi,
  constructorArgClasses: [],
  mode: "singleton",
});
