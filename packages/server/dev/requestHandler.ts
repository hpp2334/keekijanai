require('module-alias/register')
import { setup } from '@/index';
import { getVercelSupabasePreset } from '@/presets/vercel-supabase';
import config from './config';

export const requestHandler = setup({
  preset: getVercelSupabasePreset(config),
})
