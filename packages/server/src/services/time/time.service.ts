import { Service, ServiceType } from "@/core/service";

export interface TimeService extends ServiceType.ServiceBase {}

@Service({
  key: 'time'
})
export class TimeService {
  async getTime() {
    return Date.now();
  }
}
