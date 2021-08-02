import { readFileSync } from 'fs';
import path from 'path';
import { AuthUtils } from 'keekijanai-server-common';
import { Vercel, getVercelSupabasePreset, VercelSupabasePresetOptions } from 'keekijanai-server-preset-vercel-supabase';

import { app, setup, ConfigType } from 'keekijanai-server-core';

const IS_DEV = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

const presetConfig: VercelSupabasePresetOptions = {
  supabase: {
    url: 'SHOULD_BE_OVERWRITTEN',
    appKey: 'SHOULD_BE_OVERWRITTEN',
  },
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
    },
    user: {
      roles: {
        [AuthUtils.getUserIDfromOAuth2('github', 'hpp2334')]: ['admin'],
      }
    },
    notify: {
      notifiers: [
      ]
    },
    comment: {
      sensitive: ["傻逼", "去死"],
    }
  }
}

// should not push real value of "SHOULD_BE_OVERWRITTEN" to github, so use another file saving secret info
if (IS_DEV) {
  const jsonText = readFileSync(path.resolve(__dirname, '../secret.json'), 'utf-8');
  const json = JSON.parse(jsonText);
  presetConfig.supabase.url = json.SUPABASE_URL;
  presetConfig.supabase.appKey = json.SUPABASE_APPKEY;
  presetConfig.services.auth.oauth2.platforms.github.appID = json.GITHUB_APP_ID;
  presetConfig.services.auth.oauth2.platforms.github.appSecret = json.GITHUB_APP_SECRET;
}

const config = getVercelSupabasePreset(presetConfig);

export default setup(config);
