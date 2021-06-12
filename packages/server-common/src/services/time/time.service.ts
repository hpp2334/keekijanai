import { Service, ServiceType } from "keekijanai-server-core";

export interface TimeService extends ServiceType.ServiceBase {}

@Service({
  key: 'time'
})
export class TimeService {
  async getTime() {
    return Date.now();
  }
}
