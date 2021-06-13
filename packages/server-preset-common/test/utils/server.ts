import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';

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
import { Express, Knex, KnexProviderConfig } from '../../';


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
            filename: ":memory:",
          },
          useNullAsDefault: true,
        },
        initSQL: './sqls/v0.1.sql',
      } as KnexProviderConfig,
    }
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
    platform: Express,
    providers: {
      default: [Knex, options.providers.knex]
    },
  }
  return config;
})(); 


let server: any;

export function runServer() {
  const app = express();
  app.use(express.static(__dirname + '/static'));
  app.use(cookieParser());
  app.use(express.json());
  app.all('/api/keekijanai', setup(config));
  server = app.listen(3000, function () {
    console.log('listen at http://localhost:3000');
  });
}

export async function closeServer() {
  if (server) {
    await app.providerManager.closeAll();
    server.close();
  }
}

export const serverUrl = 'http://localhost:3000';
export const apiUrl = serverUrl + '/api/keekijanai';
