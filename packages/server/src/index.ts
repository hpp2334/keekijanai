import "reflect-metadata";
import { configReader, ConfigType } from "@/core/config";
import { platformManager } from "@/core/platform";

const debug = require('debug')('keekijanai:setup');

export function setup(config: ConfigType.Config) {
  debug('before setup');

  configReader.parse(config);
  const api = platformManager.getAPI();
  return api;
}
