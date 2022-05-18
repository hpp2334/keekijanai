import { injectable } from "inversify";
import type * as ApiTypes from "@/generated/keekijanai-api";
import { ajax } from "@/core/request";
import { container } from "@/core/container";

@injectable()
export class TimeApi {
  public now() {
    return ajax<ApiTypes.GetTimeResponse>({
      url: "/time",
    });
  }
}

container.bind(TimeApi).toSelf().inSingletonScope();
