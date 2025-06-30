import nodemailer from 'nodemailer';
import { ConfigService } from '@config';
import { NotificationAdapter, TemplateConfig } from './notification-adapter';

export class EmailAdapter implements NotificationAdapter {
  readonly name = 'email';
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.getString('SMTP_HOST'),
      port: Number(config.getString('SMTP_PORT', '587')),
      secure: false,
      auth: {
        user: config.getString('SMTP_USER'),
        pass: config.getString('SMTP_PASS'),
      },
    });
  }

  async send(userId: string, template: TemplateConfig): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.getString('SMTP_FROM', ''),
      to: userId,
      subject: template.subject || '',
      html: template.body,
    });
  }
}
