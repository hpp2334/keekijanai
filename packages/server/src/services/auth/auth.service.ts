import { Auth, User } from "keekijanai-type";

import { URLSearchParams } from 'url';
import _, { noop } from "lodash";
import Joi from 'joi';
import bcrypt from 'bcrypt';

import { oauth2ServiceFactory, oauth2ServiceConstructors } from "@/utils/oauth2";
import { NotImplement } from "@/utils/decorators";
import * as jwt from '@/utils/jwt';
import { Service, InjectService, Init, ServiceType } from '@/core/service';

import type { UserService } from '@/services/user';
import type { TimeService } from '@/services/time';

import { mountUser } from "./middewares";
import { OAuth2Item } from "./type";
import { ResponseError } from "@/core/error";

interface Config {
  jwtSecret: string,
  maxAge: number;
  legacy: {
    secret: string;
    saltRounds: number;
  };
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

  get user(): Auth.CurrentUser {
    return this.ctx.state.user;
  }

  async getCurrentUser(jwtString?: string) {
    const jwtSecret = this.config.jwtSecret;

    try {
      if (typeof jwtString !== 'string') {
        throw Error("jwt string is not a string");
      }

      await jwt.verify(jwtString, jwtSecret);
      const payload = jwt.decode(jwtString);

      if (payload === null || typeof payload === 'string' || !payload.data) {
        throw Error('decoded info is undefined');
      }

      const { id, provider, accessToken, expirationTime } = JSON.parse(payload.data);
      const user = await this.userService.get(id);
      return {
        ...user,
        isLogin: true,
      };

    } catch (err) {
      debug('getCurrentUser error. %o', err);
    }

    return {
      isLogin: false,
    };
  }

  async legacyRegister(userID: string, password: string) {
    debug('legacy register with userID = %s, password = %s', userID, password);
    const legacyConfig = this.config.legacy;
    const encrypted = await bcrypt.hash(
      password + legacyConfig.secret,
      legacyConfig.saltRounds,
    );
    try {
      await this.userService.insert({
        id: userID,
        name: userID,
        password: encrypted,
        role: this.userService.calcRole(['normal'])
      });
    } catch (err) {
      console.error(err);
      throw new ResponseError('user already exists. try another user id.', 400);
    }
    return;
  }

  async legacyAuth(userID: string, password: string) {
    const legacyConfig = this.config.legacy;
    let user: User.User;
    try {
      user = await this.userService.get(userID, {
        includePassword: true,
      });
    } catch (err) {
      console.error(err);
      throw new ResponseError('user not found', 400);
    }

    const matched = await bcrypt.compare(
      password + legacyConfig.secret,
      user.password!,
    );
    if (!matched) {
      throw new ResponseError('password not match!', 400);
    }

    const result = await this.getJwt({ id: userID });
    return result;
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
      name: userProfile.name,
      avatarUrl: userProfile.avatarUrl,
      email: userProfile.email,
      lastLogin: currentTime,
    });

    return this.config.oauth2.callback + '?' + new URLSearchParams({
      jwt: jwtString,
      maxAge: maxAge.toString(),
    })
  }

  /** @description for test only */
  async TEST__prepare(list: Array<{id: string, role?: number, jwt?: string}>) {
    const currentTime = await this.timeService.getTime();
  
    for (const item of list) {
      const { id, role } = item;
      const jwtString: string = await jwt.sign(
        {
          data: JSON.stringify({
            id,
          }),
          exp: Math.floor((currentTime + 86400000) / 1000),
        },
        this.config.jwtSecret,
      ) as string;
  
      await this.userService.upsert({
        id,
        avatarUrl: '',
        lastLogin: currentTime,
        role: role ?? 1,
      });

      item.jwt = jwtString;
    }
    return list;
  }

  private getOAuth2Service(provider: string) {
    const serviceConstructor = oauth2ServiceConstructors[provider];
    if (!serviceConstructor) {
      throw Error(`Cannot find oauth2 service constructor for provider "${provider}"`);
    }

    const service = oauth2ServiceFactory(serviceConstructor);
    return service;
  }

  private async getJwt(payload: any) {
    const maxAge = this.config.maxAge;
    const currentTime = await this.timeService.getTime();
    const jwtString: string = await jwt.sign(
      {
        data: JSON.stringify(payload),
        exp: Math.floor((currentTime + maxAge) / 1000),
      },
      this.config.jwtSecret,
    ) as string;

    return {
      jwt: jwtString,
      maxAge,
    };
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
      get legacy() {
        if (!config.legacy) {
          throw Error(`"legacy" should be set when use legacy methods`);
        }
        const legacy = config.legacy;
        return {
          secret: legacy.secret,
          saltRounds: legacy.saltRounds ?? 10,
        };
      },
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
    return `$$${provider}____${id}`;
  }
}
