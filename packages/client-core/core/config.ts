export interface ConfigType {
  route: {
    root: string,
  },
}
type InternalConfigType = ConfigType;

const INIT_CONFIG: ConfigType = {
  route: {
    root: '/api/blog-common',
  },
}

let config = INIT_CONFIG;

export function setupConfig(nextConfig: ConfigType) {
  config = nextConfig;
}

export function getConfig() {
  return config;
}

export class ConfigReader {
  private _config?: InternalConfigType;

  read(config: ConfigType) {
    const error = this.validate(config);
    if (error !== null) {
      throw Error;
    }
    this._config = config;
  }

  get config() {
    if (!this._config) {
      throw Error("Have not read config yet.");
    }
    return this._config;
  }

  private validate(config: ConfigType): Error | null {
    return null;
  }
}
