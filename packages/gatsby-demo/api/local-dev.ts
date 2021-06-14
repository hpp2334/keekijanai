import { readFileSync } from 'fs';
import path from 'path';
import { AuthUtils } from 'keekijanai-server-common';
import { Vercel } from 'keekijanai-server-preset-vercel-supabase';

import { app, setup, ConfigType } from 'keekijanai-server-core';
import {
  AuthController, AuthService, AuthServiceConfig,
  CommentController, CommentService, CommentServiceConfig,
  NotifyService, NotifyServiceConfig,
  StarController, StarService,
  TimeService,
  UserController, UserService, UserServiceConfig,
  ViewController, ViewService,
  DeviceService,
} from 'keekijanai-server-common';
import { Express, Knex, KnexProviderConfig } from 'keekijanai-server-preset-common';

const IS_DEV = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

const config = (() => {
  const options = {
    services: {
      auth: {
        jwtSecret: 'dasf156as156d@#%@#%261561',
        maxAge: 12 * 60 * 60 * 1000,
        legacy: {
          secret: 'klj3l21!@#%!@#2d23d2323',
        },
        oauth2: {
          platforms: {
            'github': {
              appID: 'SHOULD_BE_OVERWRITTEN',
              appSecret: 'SHOULD_BE_OVERWRITTEN'
            }
          },
          callback: '/callback',
        },
      } as AuthServiceConfig,
      notify: {

      } as NotifyServiceConfig,
      user: {

      } as UserServiceConfig,
      comment: {

      } as CommentServiceConfig,
    },
    providers: {
      knex: {
        knexOptions: {
          client: 'sqlite3',
          connection: {
            filename: "./sqlite.db",
          },
          useNullAsDefault: true,
        },
      } as KnexProviderConfig,
    }
  }

  // should not push real value of "SHOULD_BE_OVERWRITTEN" to github, so use another file saving secret info
  if (IS_DEV) {
    const jsonText = readFileSync(path.resolve(__dirname, '../secret.json'), 'utf-8');
    const json = JSON.parse(jsonText);
    options.services.auth.oauth2.platforms.github.appID = json.GITHUB_APP_ID;
    options.services.auth.oauth2.platforms.github.appSecret = json.GITHUB_APP_SECRET;
  }

  const config: ConfigType.Config = {
    controllers: [
      AuthController,
      CommentController,
      StarController,
      UserController,
      ViewController,
    ],
    services: [
      DeviceService,
      [AuthService, options.services.auth],
      [CommentService, options.services.comment],
      [NotifyService, options.services.notify],
      StarService,
      TimeService,
      [UserService, options.services.user],
      ViewService,
    ],
    platform: Vercel,
    providers: {
      default: [Knex, options.providers.knex]
    },
  }
  return config;
})(); 

export default setup(config);
