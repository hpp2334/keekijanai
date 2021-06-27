import { ConfigReader, ConfigType } from "./config";
import { Requester } from "./request";

export class Client {
  requester: Requester;

  private configReader: ConfigReader;

  constructor(config: ConfigType) {
    this.configReader = new ConfigReader(config);
    this.requester = new Requester(this);
  }

  updateConfig(config: ConfigType) {
    this.configReader.read(config);
  }

  get config() {
    return this.configReader.config;
  }
}
