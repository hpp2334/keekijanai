import { Core, NotifyService } from "../../../type";
import { notImplmentation } from "../../../utils/provider";
import type { SelfClient } from "..";
import createDebugger from 'debug';
import TelegramBot from 'node-telegram-bot-api';

import { Service } from "../../../core/service";
import _ from "lodash";
import { forEachParallel } from "../../../utils/asyncs";
import { getProxy } from "../../../utils/fns";

interface TelegramNotify {
  type: 'telegram',
  token: string;
  chatID: string;
}

interface Config {
  notifiers: Array<TelegramNotify>;
}

const debug = createDebugger('keekijanai:provider:self:notify');

export class NotifyImpl extends Service<SelfClient> implements NotifyService {
  private internalConfig!: Config;

  constructor(...args: ConstructorParameters<Core.ServiceConstructor<SelfClient>>) {
    super(...args);

    this.setInternalConfig(this.provider?.config?.services?.notify);
  }

  async notify(msg: string) {
    debug('notify message: %s', msg);

    const { notifiers } = this.internalConfig;

    await forEachParallel(notifiers, async ntf => {
      switch (ntf.type) {
        case 'telegram':
          await this.telegramNotify(ntf, msg);
          break;
        default:
          throw Error(`not supported notifier type "${ntf.type}"`);
      }
    });
  }

  shouldNotify() {
    return this.internalConfig.notifiers.length > 0;
  }

  private async telegramNotify(ntfConfig: TelegramNotify, msg: string) {
    const proxy = getProxy();
    const bot = new TelegramBot(ntfConfig.token, {
      request: proxy ? {
        proxy,
      } as any : undefined,
    });
    await bot.sendMessage(ntfConfig.chatID, msg);
  }

  private setInternalConfig(config: any) {
    if (config.notifiers && !Array.isArray(config?.notifiers)) {
      throw Error(`"notifiers" should be an array if set for notify service.`);
    }

    this.internalConfig = {
      notifiers: config?.notifiers ?? [],
    }
  }
}
