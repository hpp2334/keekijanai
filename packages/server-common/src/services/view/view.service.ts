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

  async get(scope: string): Promise<View.Get> {
    const clientId = this.deviceService.id;

    const result = await this.provider.update({
      from: 'keekijanai_view',
      payload: {
        scope,
        clientId,
      },
      upsert: true,
      keys: ['client_id', 'scope'],
    });
    if (result.error) {
      throw result.error;
    }

    const rsp = await this.provider.select({
      from: 'keekijanai_view',
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
      from: 'keekijanai_view',
      where: {
        scope: [['=', scope]]
      }
    });
  }
}
