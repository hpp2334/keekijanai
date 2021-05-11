import { Provider, ProviderFactory } from "../../core/provider";
import { Auth, Core } from "../../type";
import { AuthImpl } from "./services/auth";
import { NotifyImpl } from "./services/notify";
import { TimeImpl } from "./services/time";

class SelfFactory extends ProviderFactory<SelfClient> {
  private client: SelfClient;

  constructor() {
    super();
    this.client = new SelfClient();
  }

  factory: ProviderFactory<SelfClient>['factory'] = async (ctx, config) => {
    this.client.context = ctx;
    this.client.config = config;
    return this.client;
  }
}

class SelfClient extends Provider {
  protected services = {
    auth: AuthImpl,
    time: TimeImpl,
    notify: NotifyImpl,
  }
}

export { SelfFactory };
export type { SelfClient };
