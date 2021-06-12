import { contextManager, ContextManager } from "@/core/context";
import { router } from "@/core/controller";
import { middlewareManager, MiddlewareManager } from "@/core/middleware";
import { serviceManager } from "@/core/service";
import { configReader, ConfigType } from "../config";
import { Platform, PlatformConstructor } from "./type";

export class PlatformManager {
  private _platform?: Platform;

  private get platform() {
    return this._platform ?? (this._platform = new configReader.config.platform());
  }

  getAPI(config: ConfigType.Config) {
    configReader.parse(config);

    const platform = this.platform;
    middlewareManager.add(
      platform.handleResponse,
      ...configReader.getMiddlewares(),
      router.toMiddleware()
    );
    const api = platform.toAPIFactory(async rawContext => {
      const context = contextManager.fromRawContext(rawContext);
      await middlewareManager.run(context);
    });
    return api;
  }
}

export const platformManager = new PlatformManager();
