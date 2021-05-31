import { ConfigReader, ConfigType } from "./config";
import { Requester } from "./request";

class Client {
  requester: Requester;

  private configReader: ConfigReader;

  constructor() {
    this.configReader = new ConfigReader();
    this.requester = new Requester(this);
  }

  initialize() {
  }

  updateConfig(config: ConfigType) {
    this.configReader.read(config);
  }

  get config() {
    return this.configReader.config;
  }
}

const client = new Client();
client.initialize();

export {
  client,
}

export type {
  Client,
};
