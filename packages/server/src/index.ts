import { ConfigReader } from "./config";
import { setupRoutes } from "./routes";
import { Config, ContextState } from "./type";
import { App, Middleware, Router } from './_framework';

import Debugger from 'debug';
import { Manager } from "./core/manager";
import { ensureClientIDInCookie, maxAge, mountGetService, mountManager, mountUser } from "./middlewares";

const devDebug = Debugger('keekijanai:setup');

export function setup(config: Config.Config) {
  devDebug('before setup');
  const configReader = new ConfigReader(config);
  const manager = new Manager(configReader);

  const platform = configReader.getPlatform();

  const app = new App(platform);

  const router = new Router();
  setupRoutes(router, manager);

  app.use(...platform.getMiddlewares());
  app.use(
    ...[
      ensureClientIDInCookie,
      config.maxAgeInSec !== undefined && maxAge(config.maxAgeInSec),
      mountManager(manager),
      mountGetService,
      mountUser,
    ].filter((x): x is Middleware<ContextState> => { return !!x })
  );
  app.use(router.toMiddleware());

  devDebug('before exports platform handler');
  return app.toAPI.bind(app);
}

export { Vercel } from './platforms/vercel';
export { getVercelSupabasePreset } from './config/presets/vercel-supabase';
