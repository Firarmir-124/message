import TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@config';

export interface TelegramMessagePayload {
  chatId: string;
  text: string;
}

export class TelegramService {
  private bot: TelegramBot;
  constructor(private config: ConfigService) {
    this.bot = new TelegramBot(config.getString('TELEGRAM_BOT_TOKEN'), { polling: false });
  }

  async sendMessage(payload: TelegramMessagePayload): Promise<void> {
    await this.bot.sendMessage(payload.chatId, payload.text);
  }
}
