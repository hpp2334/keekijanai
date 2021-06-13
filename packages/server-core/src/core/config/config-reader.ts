import _ from 'lodash';
import { MiddlewareType } from "@/core/middleware";
import { Config, ConfigBase, ConfigInternal } from "./type";

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
    if ('preset' in config) {
      const presets = Array.isArray(config.preset) ? config.preset : [config.preset];
      presets.forEach(preset => {
        this._parse(preset);
      });
    }
    let internalConfig = this.internalConfig;
    if (!internalConfig) {
      if ('preset' in config) {
        throw Error('preset in config impossbily. It may be a bug');
      }
      this.internalConfig = _.merge(
        _.omit(config, ['providers', 'services', 'controllers']),
        {
          providers: this.fromProviders(config.providers, {}),
          services: this.fromServiceList(config.services, new Map()),
          controllers: this.fromControllerList(config.controllers, new Map()),
        }
      );
    } else {
      if (config.providers) {
        internalConfig.providers = this.fromProviders(config.providers, {});
      }
      if (config.platform) {
        internalConfig.platform = config.platform;
      }
      if (config.services) {
        internalConfig.services = this.fromServiceList(config.services, internalConfig.services);
      }
      if (config.controllers) {
        internalConfig.controllers = this.fromControllerList(config.controllers, internalConfig.controllers);
      }
    }
  }

  getMiddlewares() {
    return this.middlewares;
  }

  private fromProviders(providers: ConfigBase['providers'], to: ConfigInternal['providers']): ConfigInternal['providers'] {
    return _.assign(to, _.mapValues(providers, v => Array.isArray(v) ? v : [v, undefined]))
  }
  private fromServiceList(services: ConfigBase['services'], to: ConfigInternal['services']) {
    services.forEach(service => {
      const [Service, config] = Array.isArray(service) ? service : [service, undefined];
      const key = Service.prototype.$$key;
      to.set(key, [Service, config]);

      const middlewares = Service.prototype.$$middlewares;
      if (Array.isArray(middlewares)) {
        this.middlewares.push(...middlewares);
      }
    });
    return to;
  }
  private fromControllerList(controllers: ConfigBase['controllers'], to: ConfigInternal['controllers']) {
    controllers.forEach(Controller => {
      const key = Controller.prototype.$$prefix;
      to.set(key, Controller);
    });
    return to;
  }
}

export const configReader = new ConfigReader();
