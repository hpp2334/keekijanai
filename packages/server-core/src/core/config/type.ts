import { PlatformType } from "@/core/platform";
import { ControllerType } from "../controller";
import { ProviderType } from "../provider";
import { ServiceType } from "../service";

export type Preset = Config;

export type ServicesList = Array<ServiceType.ServiceConstructor | [ServiceType.ServiceConstructor, any]>;

export interface ConfigBase {
  maxAgeInSec?: number;
  controllers: ControllerType.ControllerConstructor[];
  services: ServicesList;
  /** key -> provider */
  providers: Record<string, ProviderType.ProviderConstructor | [ProviderType.ProviderConstructor, any]>;
  platform: PlatformType.PlatformConstructor;
}

export type Config = (Partial<ConfigBase> & {
  preset: Preset | Array<Preset>;
}) | ConfigBase;

export type ConfigInternal = Omit<ConfigBase, 'provider' | 'platform' | 'services' | 'controllers'> & {
  providers: Record<string, [ProviderType.ProviderConstructor, any]>;
  platform: PlatformType.PlatformConstructor;
  services: Map<string, [ServiceType.ServiceConstructor, any]>;
  controllers: Map<string, ControllerType.ControllerConstructor>;
};
