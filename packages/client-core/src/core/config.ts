export interface ConfigType {
  route: {
    root: string,
  },
}
type InternalConfigType = ConfigType;

export const INIT_CONFIG: ConfigType = {
  route: {
    root: '/api/keekijanai',
  },
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
