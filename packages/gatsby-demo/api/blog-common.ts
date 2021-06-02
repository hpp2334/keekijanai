import { VercelRequest, VercelResponse } from '@vercel/node';
import { setup } from 'keekijanai-server';
import { getVercelSupabasePreset, utils, VercelSupabasePresetOptions } from 'keekijanai-server/dist/presets/vercel-supabase';

const presetConfig: VercelSupabasePresetOptions = {
  supabase: {
    url: 'https://irsaiuoawxhaytjrwjfq.supabase.co',
    appKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE5Mjc4NjU2LCJleHAiOjE5MzQ4NTQ2NTZ9.UgiklrSQJOd5j2GbT_V1_ZKna0oaa2hqvcXomFh6J4w',
  },
  services: {
    auth: {
      jwtSecret: 'dasf156as156d@#%@#%261561',
      maxAge: 12 * 60 * 60 * 1000,
      oauth2: {
        platforms: {
          'github': {
            appID: '46626721dbe60689d1ca',
            appSecret: 'c9b8665ea23343eb7d529118e797cfcd96db9df9'
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

const config = getVercelSupabasePreset(presetConfig);

export default setup(config);
