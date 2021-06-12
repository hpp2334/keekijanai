import TelegramBot from 'node-telegram-bot-api';

import {
  Init, Service, ServiceType,
} from 'keekijanai-server-core';

import _ from "lodash";
import { getProxy } from "@/utils/fns";
import { Memo } from "@/utils/decorators/memo";
import Aigle from 'aigle';

interface TelegramNotify {
  type: 'telegram',
  token: string;
  chatID: string;
}

interface Config {
  notifiers: Array<TelegramNotify>;
}

const debug = require('debug')('keekijanai:service:notify');

export interface NotifyService extends ServiceType.ServiceBase {}

@Service({
  key: 'notify',
})
export class NotifyService {
  private config!: Config;

  @Init('config')
  setInternalConfig(config: any) {
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

  @Memo()
  private getTelegramSendMessageHandler(token: string, chatID: string) {
    const proxy = getProxy();
    const bot = new TelegramBot(token, {
      request: proxy ? {
        proxy,
      } as any : undefined,
    });
    return async (msg: string) => {
      bot.sendMessage(chatID, msg);
    };
  }

  private async telegramNotify(token: string, chatID: string, msg: string) {
    const sendMsg = this.getTelegramSendMessageHandler(token, chatID)
    await sendMsg(msg);
  }
}
