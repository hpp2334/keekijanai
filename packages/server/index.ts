import { ConfigReader } from "./src/config";
import { setupRoutes } from "./src/routes";
import { Config } from "./src/type";
import { App, Router } from './src/_framework';

import Debugger from 'debug';
import { Manager } from "./src/core/manager";
import { ensureClientIDInCookie, mountGetService, mountManager, mountUser } from "./src/middlewares";

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
    ensureClientIDInCookie,
    mountManager(manager),
    mountGetService,
    mountUser,
  );
  app.use(router.toMiddleware());

  devDebug('before exports platform handler');
  return app.toAPI.bind(app);
}
