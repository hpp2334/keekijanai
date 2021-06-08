import { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import path from 'path';
import { setup } from 'keekijanai-server';
import { getVercelSupabasePreset, utils, VercelSupabasePresetOptions } from 'keekijanai-server/dist/presets/vercel-supabase';

const IS_DEV = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export const presetConfig: VercelSupabasePresetOptions = {
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
        [utils.getUserIDfromOAuth2('github', 'hpp2334')]: ['admin'],
      }
    },
    notify: {
      notifiers: [
        // {
        //   type: 'telegram',
        //   token: '1774132276:AAF2RQl8I2ugm5j1EordVs1DExUfZYQucjE',
        //   chatID: '710497038',
        // }
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
  presetConfig.supabase = json.supabase;
  presetConfig.services.auth.oauth2.platforms.github = json.github;
}

const config = getVercelSupabasePreset(presetConfig);

export default setup(config);
