import type * as ApiTypes from "@/generated/keekijanai-api";
import { ajax } from "@/core/request";
import { container } from "@/core/container";

export class TimeApi {
  public now() {
    return ajax<ApiTypes.GetTimeResponse>({
      url: "/time",
    });
  }
}

container.register({
  class: TimeApi,
  constructorArgClasses: [],
  mode: "singleton",
});
