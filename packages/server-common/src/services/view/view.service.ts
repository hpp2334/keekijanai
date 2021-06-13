import {
  InjectService, Service, ServiceType,
} from 'keekijanai-server-core';
import { View } from 'keekijanai-type';
import type { DeviceService } from "@/services/device";
import type { AuthService } from "@/services/auth";
import type { UserService } from "@/services/user";
import * as viewError from "./error";

export interface ViewService extends ServiceType.ServiceBase {}

@Service({
  key: 'view'
})
export class ViewService {
  @InjectService('device')    deviceService!: DeviceService;
  @InjectService('auth')      authService!: AuthService;
  @InjectService('user')      userService!: UserService;


  private provider = this.providerManager.getProvider('view', {
    table: {
      from: 'keekijanai_view',
      keys: ['client_id', 'scope'],
    },
  })

  async get(scope: string): Promise<View.Get> {
    const clientId = this.deviceService.id;
    

    const result = await this.provider.update({
      payload: {
        scope,
        clientId,
      },
      upsert: true,
    });
    if (result.error) {
      throw result.error;
    }

    const rsp = await this.provider.select({
      count: 'exact',
      where: {
        scope: [['=', scope]]
      }
    });
    return { view: rsp.count || 0 };
  }

  async clear(scope: string) {
    const { user } = this.authService;
    if (!user.isLogin || !this.userService.matchRole(user, ['admin'])) {
      throw viewError.forbidden;
    }
    await this.provider.delete({
      where: {
        scope: [['=', scope]]
      }
    });
  }
}
