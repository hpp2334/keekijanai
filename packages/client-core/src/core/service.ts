import { Client } from "./client";

class ServiceBase {
  constructor(protected client: Client) {}
}

export {
  ServiceBase as Service,
}
