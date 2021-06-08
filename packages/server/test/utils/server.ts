import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { presetConfig } from '../../../gatsby-demo/api/blog-common';
import { setup } from '../../dist';
import { getVercelSupabasePreset } from '../../dist/presets/vercel-supabase';

let server: any;

export function runServer() {
  const app = express();
  app.use(express.static(__dirname + '/static'));
  app.use(cookieParser());
  app.use(express.json());
  app.all('/api/keekijanai', setup(getVercelSupabasePreset(presetConfig)));
  server = app.listen(3000, function () {
    console.log('listen at http://localhost:3000');
  });
}

export function closeServer() {
  if (server) {
    server.close();
  }
}

export const serverUrl = 'http://localhost:3000';
export const apiUrl = serverUrl + '/api/keekijanai';
