
import {
  Init, Service, ServiceType,
} from 'keekijanai-server-core';

import _ from "lodash";
import { getProxy } from "@/utils/fns";
import Aigle from 'aigle';
import { O } from 'ts-toolbelt';

interface TelegramNotify {
  type: 'telegram',
  token: string;
  chatID: string;
}

export interface Config {
  /**
   * @example
   * notifiers: [
   *   {
   *     type: 'telegram',
   *     token:  '123456' ,
   *     chatID: '123456',
   *   }
   * ]
   */
  notifiers?: Array<TelegramNotify>;
}

type InternalConfig = O.Required<Config>;

const debug = require('debug')('keekijanai:service:notify');

export interface NotifyService extends ServiceType.ServiceBase {}

@Service({
  key: 'notify',
})
export class NotifyService {
  private config!: InternalConfig;
  private _cache: Map<any, any> = new Map();

  @Init('config')
  setInternalConfig(config: Config) {
    if (config.notifiers && !Array.isArray(config?.notifiers)) {
      throw Error(`"notifiers" should be an array if set for notify service.`);
    }

    this.config = {
      notifiers: config?.notifiers ?? [],
    }
  }

  async notify(msg: string) {
    debug('notify message: %s', msg);

    const { notifiers } = this.config;

    await Aigle.forEachSeries(notifiers, async ntf => {
      switch (ntf.type) {
        case 'telegram':
          await this.telegramNotify(ntf.token, ntf.chatID, msg);
          break;
        default:
          throw Error(`not supported notifier type "${ntf.type}"`);
      }
    });
  }

  shouldNotify() {
    return this.config.notifiers.length > 0;
  }

  private async telegramNotify(token: string, chatID: string, msg: string) {
    const cacheKey = '__tg__' + token;
    let bot = this._cache.get(cacheKey);
    if (!bot) {
      const { default: TelegramBot } = await import('node-telegram-bot-api');
      const proxy = getProxy();
      bot = new TelegramBot(token, {
        request: proxy ? {
          proxy,
        } as any : undefined,
      });
      this._cache.set(cacheKey, bot);
    }

    await bot.sendMessage(chatID, msg);
  }
}
