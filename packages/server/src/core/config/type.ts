import { PlatformType } from "@/core/platform";
import { ControllerType } from "../controller";
import { ProviderType } from "../provider";
import { ServiceType } from "../service";

export type Preset = Config;

export type ServicesList = Array<ServiceType.ServiceConstructor | [ServiceType.ServiceConstructor, any]>;

export interface Config {
  maxAgeInSec?: number;
  preset?: Preset | Array<Preset>;
  controllers: ControllerType.ControllerConstructor[];
  services: ServicesList;
  provider: ProviderType.ProviderConstructor | [ProviderType.ProviderConstructor, any];
  platform: PlatformType.PlatformConstructor;
}

export type ConfigInternal = Omit<Config, 'preset' | 'provider' | 'services' | 'controllers'> & {
  provider: [ProviderType.ProviderConstructor, any];
  services: Map<string, [ServiceType.ServiceConstructor, any]>;
  controllers: Map<string, ControllerType.ControllerConstructor>;
};
