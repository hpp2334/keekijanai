import Joi from 'joi';
import _ from 'lodash';

export interface ConfigType {
  route?: {
    root?: string,
  },
}
type InternalConfigType = {
  route: {
    root: string;
  }
};

const configSchema = Joi.object({
  route: Joi.object({
    root: Joi.string()
      .default('/api/keekijanai')
      .description('api route prefix')
  }),
})

export class ConfigReader {
  private _config!: InternalConfigType;

  constructor() {
    this.read(configSchema.validate(undefined).value);
  }

  read(config: ConfigType) {
    this._config = this.validate(config);
  }

  get config() {
    return this._config;
  }

  private validate(config: ConfigType): InternalConfigType {
    const value = configSchema.validate(config);
    if (value.error) {
      throw value.error;
    }
    return value.value;
  }
}
