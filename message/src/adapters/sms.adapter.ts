import { NotificationAdapter } from './notification-adapter';
import { TwilioService } from '../common/twilio.service';

export class SmsAdapter implements NotificationAdapter {
  readonly name = 'sms';

  constructor(private twilio: TwilioService) {}

  async send(address: string, message: string): Promise<void> {
    await this.twilio.sendMessage({ to: address, text: message });
  }
}
