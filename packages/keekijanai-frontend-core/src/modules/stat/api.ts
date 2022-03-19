import { container } from "@/core/container";
import { ajax } from "@/core/request";
import { injectable } from "inversify";
import type * as Data from "./data";

@injectable()
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

container.bind(StatApi).toSelf().inSingletonScope();
