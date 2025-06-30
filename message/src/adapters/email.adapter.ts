import { MultiEventBus } from '@event-bus';
import { NOTIFY_SEND_EMAIL } from '@config/common/bus.topics';
import { NotificationAdapter, TemplateConfig } from './notification-adapter';

export class EmailAdapter implements NotificationAdapter {
  readonly name = 'email';
  constructor(private bus: MultiEventBus) {}

  async send(userId: string, template: TemplateConfig): Promise<void> {
    await this.bus.publish(NOTIFY_SEND_EMAIL, {
      to: userId,
      subject: template.subject || '',
      html: template.body,
    });
  }
}
