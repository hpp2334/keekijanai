import { ProviderFactory } from "./core/provider";
import { PlatformConstructor, ServerlessPlatform } from "./serveless-platform";


export type ClientFactoryDetail = {
  factory: ProviderFactory;
  services?: string | Array<string>;
  config?: Record<string, any>;
}

export type ClientFactory = ProviderFactory | Array<ClientFactoryDetail | ProviderFactory>;

export type OAuth2Item = {
  appID: string;
  appSecret: string;
}

export type OAuth2 = Record<string, OAuth2Item>;

export type Preset = Config;

export interface Config {
  maxAgeInSec?: number;
  preset?: Preset | Array<Preset>;
  clientFactory?: ClientFactory;
  platform: PlatformConstructor;
}

export interface ConfigInternal {
  oauth2?: Record<string, OAuth2Item>;
  clientFactory?: Array<ClientFactoryDetail | ProviderFactory>,
  platform: PlatformConstructor,
}