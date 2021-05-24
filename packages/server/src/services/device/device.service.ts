import { Service, ServiceType } from "@/core/service";
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
