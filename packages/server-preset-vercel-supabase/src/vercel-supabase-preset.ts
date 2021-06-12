import { ConfigType } from "keekijanai-server-core";
import { Vercel } from './platforms/vercel';
import { Supabase } from "./providers/supabase";

import {
  AuthController, AuthService,
  CommentController, CommentService,
  NotifyService,
  StarController, StarService,
  TimeService,
  UserController, UserService,
  ViewController, ViewService,
  DeviceService,
} from 'keekijanai-server-common';

export interface VercelSupabasePresetOptions {
  supabase: {
    url: string;
    appKey: string;
  },
  services: {
    auth?: {
      /** an unguessable string */
      jwtSecret: string,
      /** jwt maxAge */
      maxAge?: number;
      legacy?: {
        secret: string;
        saltRounds?: number;
      };
      oauth2?: {
        /** callback page path in client */
        callback: string,
        platforms?: Record<string, {
          appID: string;
          appSecret: string;
        }>;
      }
    },
    notify?: {
      /**
       * @example
       * notifiers: [
       *   {
       *     type: 'telegram',
       *     token:  '123456' ,
       *     chatID: '123456',
       *   }
       * ]
       */
      notifiers: Array<any>;
    },
    user?: {
      /**
       * @example
       * roles: {
       *   [getUserIDfromOAuth2('provider', 'example_user')]: ['admin']
       * }
       */
      roles?: Record<string, string[] | string | number>;
    },
    comment?: {
      /** comment sentitve words */
      sensitive?: string[];
    }
  }
}

export function getVercelSupabasePreset(options: VercelSupabasePresetOptions): ConfigType.Preset {
  return {
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
    provider: [Supabase, options.supabase]
  }
}

