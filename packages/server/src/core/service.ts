import { ViewServiceImpl } from "../providers/supabase/services/view";
import { Context, ContextState, Core } from "../type";
import { ServerlessContext } from "../_framework";


class ServiceBase<Provider extends Core.Provider = Core.Provider> implements Core.Service<Provider> {
  constructor(
    public context: Context,
    public provider: Provider,
  ) {}

  get manager() {
    return this.context.manager;
  }
}

function serviceFactory<Provider extends Core.Provider = Core.Provider>(
  serviceConstructor: Core.ServiceConstructor<Provider>,
  ...args: ConstructorParameters<Core.ServiceConstructor<Provider>>
): ServiceBase<Provider> {
  return new serviceConstructor(...args);
}

export {
  ServiceBase as Service,
  serviceFactory
}