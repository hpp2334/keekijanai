import { ConfigType } from "keekijanai-server-core";
import { Vercel } from './platforms/vercel';
import { Supabase } from "./providers/supabase";

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

export interface VercelSupabasePresetOptions {
  supabase: {
    url: string;
    appKey: string;
  },
  services: {
    auth?: AuthServiceConfig,
    notify?: NotifyServiceConfig,
    user?: UserServiceConfig,
    comment?: CommentServiceConfig,
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

