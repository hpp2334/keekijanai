import { Service, ServiceType } from "keekijanai-server-core";
import { ensureClientIDInCookie } from "./middlewares";

export interface DeviceService extends ServiceType.ServiceBase {}

@Service({
  key: 'device',
  middlewares: [ensureClientIDInCookie]
})
export class DeviceService {
  get id(): string {
    return this.ctx.state.clientID;
  }
}
