import { ProviderFactory as ProviderFactoryClass } from "../core/provider";
import { platformFactory } from "../platforms";
import { SupabaseFactory } from "../providers/supabase";
import { ClientFactoryDetail, Config, ConfigInternal, OAuth2Item } from "../type/config";
import { ProviderFactory } from "../type/core/provider";
import { memoFunc } from "../utils/fns";

export class ConfigReader {
  private internalConfig: ConfigInternal;

  constructor(config: Config) {
    this.internalConfig = {
      platform: config.platform,
    };
    this.parse(config);

    this.getProviderFactory = memoFunc(this.getProviderFactory);
  }

  getProviderFactory(serviceName: string): [ProviderFactory, any] {
    const config = this.internalConfig;

    if (!config.clientFactory) {
      throw Error('You should configure at least one "clientFactory"');
    }

    for (let i = config.clientFactory.length - 1; i >= 0; i--) {
      const current = config.clientFactory[i];

      if (isProviderFactory(current)) {
        return [current, undefined];
      }

      if (!current.services || current.services === serviceName || current.services.includes(serviceName)) {
        return [current.factory, current.config];
      }
    }
    throw Error(`Cannot find clientFactory for service "${serviceName}".`);
  }

  getOAuth2Info(provider: string): OAuth2Item {
    const target = this.internalConfig.oauth2?.[provider];
    if (!target) {
      throw Error(`Cannot find oauth2 item for provider "${provider}"`);
    }
    return target;
  }

  getPlatform() {
    const platformConstructor = this.internalConfig.platform;
    return platformFactory(platformConstructor);
  }

  private parse(config: Config) {
    const err = this.validateConfig(config);
    if (err) {
      throw err;
    }

    if (config.preset) {
      const presets = Array.isArray(config.preset) ? config.preset : [config.preset];
      presets.forEach(preset => {
        this.parse(preset);
      });
    }
    const internalConfig = this.internalConfig;

    if (config.clientFactory) {
      internalConfig.clientFactory = (internalConfig.clientFactory ?? []).concat(config.clientFactory);
    }

    this.internalConfig.platform = config.platform;
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
}

function isProviderFactory(x: any): x is ProviderFactory {
  return x instanceof ProviderFactoryClass;
}
