import "reflect-metadata";
import { ConfigType } from '@/core/config';
import { platformManager } from '@/core/platform';

export function setup(config: ConfigType.Config) {
  return platformManager.getAPI(config);
}

export * from './core';
