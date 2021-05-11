import { ConfigReader, getConfig } from "./config";
import { Requester } from "./request";

class Client {
  requester: Requester;

  private configReader: ConfigReader;

  constructor() {
    this.configReader = new ConfigReader();
    this.requester = new Requester(this);
  }

  initialize() {
    this.configReader.read(getConfig());
  }

  get config() {
    return this.configReader.config;
  }
}

const client = new Client();

export {
  client,
}

export type {
  Client,
};
