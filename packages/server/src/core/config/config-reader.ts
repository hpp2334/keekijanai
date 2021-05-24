import _ from 'lodash';
import { MiddlewareType } from "@/core/middleware";
import { Config, ConfigInternal } from "./type";

class ConfigReader {
  private internalConfig?: ConfigInternal;
  private middlewares: MiddlewareType.Middleware[] = [];

  get config() {
    if (!this.internalConfig) {
      throw Error('shoud parse config first');
    }
    return this.internalConfig;
  }

  parse(config: Config) {
    this.internalConfig = undefined;
    this.middlewares.splice(0, this.middlewares.length);

    this._parse(config);
  }

  private _parse(config: Config) {
    const err = this.validateConfig(config);
    if (err) {
      throw err;
    }

    if (config.preset) {
      const presets = Array.isArray(config.preset) ? config.preset : [config.preset];
      presets.forEach(preset => {
        this._parse(preset);
      });
    }
    let internalConfig = this.internalConfig;
    if (!internalConfig) {
      this.internalConfig = _.merge(
        _.omit(config, ['preset', 'provider', 'services', 'controllers']),
        {
          provider: this.fromProvider(config.provider),
          services: this.fromServiceList(config.services, new Map()),
          controllers: this.fromControllerList(config.controllers, new Map()),
        }
      );
    } else {
      internalConfig.provider = this.fromProvider(config.provider);
      internalConfig.platform = config.platform;
      internalConfig.services = this.fromServiceList(config.services, internalConfig.services);
      internalConfig.controllers = this.fromControllerList(config.controllers, internalConfig.controllers);
    }
  }

  getMiddlewares() {
    return this.middlewares;
  }


  getService(key: string) {
    const item = this.config.services.get(key);
    if (!item) {
      throw Error(`not configure service for key "${key}"`);
    }
    return item;
  }

  

  private validateConfig(config: Config) {
    if (!config) {
      return Error('config object should be passed.');
    }
    if (!config.platform) {
      return Error('"platform" in config should be configured.');
    }
    return null;
  }

  private fromProvider(provider: Config['provider']): ConfigInternal['provider']{
    return Array.isArray(provider) ? provider : [provider, undefined];
  }
  private fromServiceList(services: Config['services'], to: ConfigInternal['services']) {
    services.forEach(service => {
      const [Service, config] = Array.isArray(service) ? service : [service, undefined];
      const key = Service.prototype.$$key;
      to.set(key, [Service, config]);
    });
    return to;
  }
  private fromControllerList(controllers: Config['controllers'], to: ConfigInternal['controllers']) {
    controllers.forEach(Controller => {
      const key = Controller.prototype.$$prefix;
      to.set(key, Controller);
    });
    return to;
  }
}

export const configReader = new ConfigReader();
