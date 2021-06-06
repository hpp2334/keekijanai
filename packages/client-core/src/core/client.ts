import { ConfigReader, ConfigType } from "./config";
import { Requester } from "./request";

class Client {
  requester: Requester;

  private configReader: ConfigReader;

  constructor() {
    this.configReader = new ConfigReader();
    this.requester = new Requester(this);
  }

  updateConfig(config: ConfigType) {
    this.configReader.read(config);
  }

  get config() {
    return this.configReader.config;
  }
}

let client: Client | undefined;

export const getClient = () => {
  return client ?? (client = new Client());
}

export type {
  Client,
};
