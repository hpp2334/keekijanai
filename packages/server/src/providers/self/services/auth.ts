import { AuthService, Core, User, Config as ConfigType } from "../../../type";
import { Auth } from "../../../type";
import { notImplmentation } from "../../../utils/provider";
import { oauth2ServiceFactory, oauth2ServiceConstructors } from "../../../utils/oauth2";
import type { SelfClient } from "..";
import { promisify } from 'util';
import { sign, decode, verify } from 'jsonwebtoken';
import createDebugger from 'debug';
import { OAuth2UserProfile } from "../../../utils/oauth2/type";

import { URLSearchParams } from 'url';
import { Service } from "../../../core/service";
import _ from "lodash";

interface Config {
  jwtSecret: string,
  maxAge: number;
  oauth2: {
    platform(provider: string): ConfigType.OAuth2Item;
    callback: string;
  }
}

const jwt = {
  sign: promisify(sign),
  decode: decode,
  verify: promisify<string, string, any>(verify),
};


const debug = createDebugger('keekijanai:provider:self:auth');

export class AuthImpl extends Service<SelfClient> implements AuthService {
  private internalConfig!: Config;

  legacyAuth = notImplmentation('legacy auth in authService');

  constructor(...args: ConstructorParameters<Core.ServiceConstructor<SelfClient>>) {
    super(...args);

    this.setInternalConfig(this.provider?.config?.services?.auth);
  }

  auth: AuthService['auth'] = async (type: 'legacy' | 'oauth2', ...args: any[]) => {
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
        throw Error(`not supported`)
      }
    }
  }

  getCurrentUser: AuthService['getCurrentUser'] = async (jwtString) => {
    const jwtSecret = this.internalConfig.jwtSecret;

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
        const userService = await this.context.getService('user');
        const user = await userService.get(id);

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

  oauth2GetCode: AuthService['oauth2GetCode'] = async (provider) => {
    const { appID, appSecret } =  this.internalConfig.oauth2.platform(provider);
    const service = this.getOAuth2Service(provider);

    /* Redirect, don't need to process response */
    return await service.getCode({
      appID,
      scope: 'read:user user:email'
    });
  }

  oauth2GetAccessToken: AuthService['oauth2GetAccessToken'] = async (provider, code) => {
    const { appID, appSecret } = this.internalConfig.oauth2.platform(provider);
    const service = this.getOAuth2Service(provider);
    const { accessToken } = await service.getAccessToken({
      appID,
      appSecret,
      code,
    });
    debug('get accessToken "%s"', accessToken);

    const userProfile = await service.getUserProfile({ accessToken });
    const userID = `${provider}____${userProfile.id}`;
    debug('get user profile %j', userProfile);

    const maxAge = this.internalConfig.maxAge;

    const timeService = await this.context.getService('time');
    const currentTime = await timeService.getTime();
  
    const jwtString: string = await jwt.sign(
      {
        data: JSON.stringify({
          id: userID,
          accessToken,
          provider,
        }),
        exp: Math.floor((currentTime + maxAge) / 1000),
      },
      this.internalConfig.jwtSecret,
    ) as string;

    const userService = await this.context.getService('user');
    await userService.upsert({
      id: userID,
      avatarUrl: userProfile.avatarUrl,
      email: userProfile.email,
      lastLogin: currentTime,
    });

    return this.internalConfig.oauth2.callback + '?' + new URLSearchParams({
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

  private setInternalConfig(config: any) {
    if (!config) {
      throw Error(`config should be set for auth service`);
    }
    if (!config?.jwtSecret) {
      throw Error(`"jwtSecret" should be set for auth service.`);
    }
    const _oauth2 = config.oauth2;

    this.internalConfig = {
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
}
