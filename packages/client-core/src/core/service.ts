import { Client, getClient } from "./client";

class ServiceBase {
  protected client: Client;

  constructor() {
    this.client = getClient();
  }
}

export {
  ServiceBase as Service,
}
