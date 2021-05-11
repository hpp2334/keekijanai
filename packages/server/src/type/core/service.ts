import { Config, ContextState } from "..";
import { Manager } from "../../core/manager";
import { ServerlessContext } from "../../_framework";
import { Provider } from "./provider";

export type GetServiceBase<S extends string | number, T extends Service<any> = Service<any>> = (serviceName: S) => Promise<T>;

export interface Service<ActualProvider extends Provider = Provider> {
  context: ServerlessContext<ContextState>;
  provider: ActualProvider,
  manager: Manager;
};

export type UnknownService = Service & {
  [K: string]: any;
}

export interface ServiceConstructor<ActualProvider extends Provider = Provider> {
  new (
    context: ServerlessContext<ContextState>,
    provider: ActualProvider,
  ): Service<ActualProvider>;
}
