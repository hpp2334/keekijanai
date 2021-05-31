import { setup } from '..';
import { getVercelSupabasePreset } from '../dist/presets/vercel-supabase';
import config from './config';

export const requestHandler = setup({
  preset: getVercelSupabasePreset(config),
})
