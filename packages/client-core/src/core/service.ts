import { Client, client } from "./client";

class ServiceBase {
  constructor(protected client: Client) {}
}

interface ServiceConstructor<T extends ServiceBase> {
  new (client: Client): T;
}

function serviceFactory <T extends ServiceBase>(Ctor: ServiceConstructor<T>) {
  return new Ctor(client);
}

export {
  ServiceBase as Service,
  serviceFactory,
}
