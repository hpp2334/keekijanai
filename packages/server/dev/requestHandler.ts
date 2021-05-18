import { getVercelSupabasePreset, setup, Vercel } from '../src';
import config from './config';

export const requestHandler = setup({
  preset: getVercelSupabasePreset(config),
  // DEV only
  platform: Vercel,
  maxAgeInSec: 2,
})
