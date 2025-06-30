import { ConfigService } from '@config';
import { NotificationAdapter, TemplateConfig } from './notification-adapter';

export class BroadcastAdapter implements NotificationAdapter {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {}

  async send(email: string, template: TemplateConfig): Promise<void> {}
}
