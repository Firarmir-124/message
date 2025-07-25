import { NotificationAdapter } from './notification-adapter';
import { TelegramService } from '../common/telegram.service';

export class TelegramAdapter implements NotificationAdapter {
  readonly name = 'telegram';
  constructor(private telegram: TelegramService) {}

  async send(address: string, message: string): Promise<void> {
    await this.telegram.sendMessage({
      chatId: address,
      text: message,
    });
  }
}
