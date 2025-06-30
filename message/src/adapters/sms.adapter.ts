import { NotificationAdapter } from './notification-adapter';
import { SmsService } from '../common/sms.service';

export class SmsAdapter implements NotificationAdapter {
  readonly name = 'sms';

  constructor(private sms: SmsService) {}

  async send(address: string, message: string): Promise<void> {
    await this.sms.sendMessage({ to: address, text: message });
  }
}
