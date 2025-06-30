import TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@config';
import { NotificationAdapter, TemplateConfig } from './notification-adapter';

export class TelegramAdapter implements NotificationAdapter {
  readonly name = 'telegram';
  private bot: TelegramBot;

  constructor(config: ConfigService) {
    this.bot = new TelegramBot(config.getString('TELEGRAM_BOT_TOKEN'), {
      polling: false,
    });
  }

  async send(userId: string, template: TemplateConfig): Promise<void> {
    await this.bot.sendMessage(userId, template.body);
  }
}
