import { NotificationAdapter, TemplateConfig } from './notification-adapter';
import { WhatsAppService } from '../common/whatsapp.service';

export class WhatsAppAdapter implements NotificationAdapter {
  readonly name = 'whatsapp';
  constructor(private whatsapp: WhatsAppService) {}

  async send(userId: string, template: TemplateConfig): Promise<void> {
    await this.whatsapp.sendMessage({ to: userId, text: template.body });
  }
}
