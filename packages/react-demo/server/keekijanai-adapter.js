const { readFileSync } = require('fs');
const path = require('path');
const { AuthUtils } = require('keekijanai-server-common');

const { app, setup } = require('keekijanai-server-core');
const {
  ArticleController, ArticleService, ArticleCoreService,
  AuthController, AuthService,
  CommentController, CommentService,
  NotifyService,
  StarController, StarService,
  TimeService,
  UserController, UserService,
  ViewController, ViewService,
  DeviceService,
} = require('keekijanai-server-common');
const { Express, Knex } = require('keekijanai-server-preset-common');

const options = {
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
    notify: {

    },
    user: {
      roles: {
        [AuthUtils.getUserIDfromOAuth2('github', 'hpp2334')]: ['admin'],
      }
    },
    comment: {

    },
  },
  providers: {
    knex: {
      knexOptions: {
        client: 'sqlite3',
        connection: {
          filename: "./sqlite.db",
        },
        useNullAsDefault: true,
      },
    },
  }
}

const jsonText = readFileSync(path.resolve(__dirname, '../secret.json'), 'utf-8');
const json = JSON.parse(jsonText);
options.services.auth.oauth2.platforms.github.appID = json.GITHUB_APP_ID;
options.services.auth.oauth2.platforms.github.appSecret = json.GITHUB_APP_SECRET;

const config = {
  controllers: [
    ArticleController,
    AuthController,
    CommentController,
    StarController,
    UserController,
    ViewController,
  ],
  services: [
    DeviceService,
    ArticleCoreService,
    ArticleService,
    [AuthService, options.services.auth],
    [CommentService, options.services.comment],
    [NotifyService, options.services.notify],
    StarService,
    TimeService,
    [UserService, options.services.user],
    ViewService,
  ],
  platform: Express,
  providers: {
    default: [Knex, options.providers.knex]
  },
}

const handler = setup(config);

module.exports = {
  config,
  handler,
}
