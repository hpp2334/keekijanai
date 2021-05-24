import { Auth } from "keekijanai-type";

import { URLSearchParams } from 'url';
import _, { noop } from "lodash";

import { oauth2ServiceFactory, oauth2ServiceConstructors } from "@/utils/oauth2";
import { NotImplement } from "@/utils/decorators";
import * as jwt from '@/utils/jwt';
import { Service, InjectService, Init, ServiceType } from '@/core/service';

import type { UserService } from '@/services/user';
import type { TimeService } from '@/services/time';

import { mountUser } from "./middewares";
import { OAuth2Item } from "./type";

interface Config {
  jwtSecret: string,
  maxAge: number;
  oauth2: {
    platform(provider: string): OAuth2Item;
    callback: string;
  }
}

const debug = require('debug')('keekijanai:service:auth');

export interface AuthService extends ServiceType.ServiceBase {}

@Service({
  key: 'auth',
  middlewares: [mountUser]
})
export class AuthService {
  private config!: Config;

  @InjectService('user')  userService!: UserService;
  @InjectService('time')  timeService!: TimeService;

  @NotImplement()
  legacyAuth = noop;

  get user(): Auth.CurrentUser {
    return this.ctx.state.user;
  }

  async auth (type: 'legacy' | 'oauth2', ...args: any[]) {
    debug('type = "%s", args = %o', type, args);
    switch (type) {
      case 'legacy': {
        const [username, password] = args as [string, string];
        this.legacyAuth();
        return null as any;
      }
      case 'oauth2': {
        const [provider] = args as [string];
        return await this.oauth2GetCode(provider);
      }
      default: {
        throw Error(`not supported`);
      }
    }
  }

  async getCurrentUser(jwtString?: string) {
    const jwtSecret = this.config.jwtSecret;

    if (typeof jwtString !== 'string') {
      return {
        isLogin: false,
      }
    }

    try {
      await jwt.verify(jwtString, jwtSecret);
      const payload = (jwt as any).decode(jwtString);

      if (!payload || !payload.data) {
        throw Error('decoded info is undefined');
      }

      const { id, provider, accessToken, expirationTime } = JSON.parse(payload.data);

      if (provider) {
        const user = await this.userService.get(id);

        return {
          ...user,
          isLogin: true,
        };
      } else {
        /** Legacy mode, not implement yet */
        throw Error('"provider" should be given');
      }

    } catch (err) {
      debug('getCurrentUser error. %o', err);
    }

    return {
      isLogin: false,
    };
  }

  async oauth2GetCode(provider: string) {
    const { appID, appSecret } =  this.config.oauth2.platform(provider);
    const service = this.getOAuth2Service(provider);

    /* Redirect, don't need to process response */
    return await service.getCode({
      appID,
      scope: 'read:user user:email'
    });
  }

  async oauth2GetAccessToken(provider: string, code: string) {
    const { appID, appSecret } = this.config.oauth2.platform(provider);
    const service = this.getOAuth2Service(provider);
    const { accessToken } = await service.getAccessToken({
      appID,
      appSecret,
      code,
    });
    debug('get accessToken "%s"', accessToken);

    const userProfile = await service.getUserProfile({ accessToken });
    const userID = AuthService.getUserIDfromOAuth2(provider, userProfile.id);
    debug('get user profile %j', userProfile);

    const maxAge = this.config.maxAge;

    const currentTime = await this.timeService.getTime();
  
    const jwtString: string = await jwt.sign(
      {
        data: JSON.stringify({
          id: userID,
          accessToken,
          provider,
        }),
        exp: Math.floor((currentTime + maxAge) / 1000),
      },
      this.config.jwtSecret,
    ) as string;

    await this.userService.upsert({
      id: userID,
      avatarUrl: userProfile.avatarUrl,
      email: userProfile.email,
      lastLogin: currentTime,
    });

    return this.config.oauth2.callback + '?' + new URLSearchParams({
      jwt: jwtString,
      maxAge: maxAge.toString(),
    })
  }

  private getOAuth2Service(provider: string) {
    const serviceConstructor = oauth2ServiceConstructors[provider];
    if (!serviceConstructor) {
      throw Error(`Cannot find oauth2 service constructor for provider "${provider}"`);
    }

    const service = oauth2ServiceFactory(serviceConstructor);
    return service;
  }

  @Init('config')
  setInternalConfig(config: any) {
    if (!config) {
      throw Error(`config should be set for auth service`);
    }
    if (!config?.jwtSecret) {
      throw Error(`"jwtSecret" should be set for auth service.`);
    }
    const _oauth2 = config.oauth2;

    this.config = {
      jwtSecret: config.jwtSecret,
      maxAge: config?.maxAge || 12 * 60 * 60 * 1000,
      get oauth2() {
        if (!_oauth2) {
          throw Error(`"oauth2" should be set when use oauth2 methods`);
        }
        if (!_oauth2.callback) {
          throw Error(`"oauth2.callback" should be set when use oauth2 methods`);
        }
        return {
          platform: (provider: string) => {
            const target = _oauth2.platforms[provider];
            if (!_.isObjectLike(target) || !_.isString(target.appID) || !_.isString(target.appSecret)) {
              throw Error(`appID and appSecret should be both set in "${provider}" platform.`);
            }
            return target;
          },
          callback: _oauth2.callback,
        }
      }
    };
  }

  static getUserIDfromOAuth2(provider: string, id: string) {
    return `${provider}____${id}`;
  }
}
