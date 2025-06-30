import { NotificationAdapter } from './notification-adapter';
import { WhatsAppService } from '../common/whatsapp.service';

export class WhatsAppAdapter implements NotificationAdapter {
  readonly name = 'whatsapp';
  constructor(private whatsapp: WhatsAppService) {}

  async send(address: string, message: string): Promise<void> {
    await this.whatsapp.sendMessage({ to: address, text: message });
  }
}
