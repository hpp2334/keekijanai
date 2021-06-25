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
});

const INIT_CONFIG: ConfigType = {
  route: {
    root: '/api/keekijanai',
  }
};

export class ConfigReader {
  private _config!: InternalConfigType;

  constructor() {
    this.read(INIT_CONFIG);
  }

  read(config: ConfigType) {
    const result = this.validate(config);
    console.log(result);
    this._config = result;
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
