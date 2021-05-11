import { Vercel } from "../../platforms/vercel";
import { SelfFactory } from "../../providers/self";
import { SupabaseFactory } from "../../providers/supabase";
import { Config } from "../../type";

interface VercelSupabasePresetOptions {
  supabase: {
    url: string;
    appKey: string;
  },
  config: {
    services: {
      auth: {
        jwtSecret: string,
        maxAge?: number;
        oauth2?: {
          callback: string,
          platforms?: Config.OAuth2;
        }
      },
      notify?: {
        notifiers: Array<any>;
      },
    }
  }
}

export function getVercelSupabasePreset(options: VercelSupabasePresetOptions): Config.Preset {
  return {
    clientFactory: [
      {
        factory: new SelfFactory(),
        config: options.config,
      },
      {
        factory: new SupabaseFactory(options.supabase.url, options.supabase.appKey),
        services: ['star', 'view', 'comment', 'user'],
        config: options.config,
      }
    ],
    platform: Vercel,
  }
}
