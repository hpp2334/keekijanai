import { setup } from '..';
import { getVercelSupabasePreset } from '../src/config/presets/vercel-supabase';
import config from './config';
import { Vercel } from '../src/platforms/vercel';

export const requestHandler = setup({
  preset: getVercelSupabasePreset(config),
  // DEV only
  platform: Vercel,
})
