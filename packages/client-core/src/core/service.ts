import { Client, getClient } from "./client";

class ServiceBase {
  protected client: Client;
  protected _v = Date.now();

  constructor() {
    this.client = getClient();
  }

  updateV() {
    this._v++;
    return this._v;
  }
}

export {
  ServiceBase as Service,
}
