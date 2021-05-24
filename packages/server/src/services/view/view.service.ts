import { InjectService, Service, ServiceType } from "@/core/service";
import { View } from 'keekijanai-type';
import { DeviceService } from "../device";

export interface ViewService extends ServiceType.ServiceBase {}

@Service({
  key: 'view'
})
export class ViewService {
  @InjectService('device')    deviceService!: DeviceService;

  async get(scope: string): Promise<View.Get> {
    const clientId = this.deviceService.id;

    const result = await this.provider.update({
      from: 'view',
      payload: {
        scope,
        clientId,
      }
    });
    if (result.error) {
      throw result.error;
    }

    const rsp = await this.provider.select({
      from: 'view',
      count: 'exact',
      where: {
        scope: [['=', scope]]
      }
    });
    return { view: rsp.count || 0 };
  }
}
