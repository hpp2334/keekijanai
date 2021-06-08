import { ConfigType } from "@/core/config";

import { AuthService } from "@/services/auth";
import { CommentController, CommentService } from "@/services/comment";
import { NotifyService } from "@/services/notify";
import { StarController, StarService } from "@/services/star";

import { Vercel } from '@/platforms/vercel';

import { Supabase } from "@/providers/supabase";
import { TimeService } from "@/services/time";
import { UserService } from "@/services/user";
import { AuthController } from "@/services/auth/auth.controller";
import { UserController } from "@/services/user/user.controller";
import { ViewController, ViewService } from "@/services/view";
import { DeviceService } from "@/services/device";


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

export const utils = {
  getUserIDfromOAuth2: AuthService.getUserIDfromOAuth2,
};
