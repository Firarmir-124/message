import { ConfigService } from '@config';
import { Twilio } from 'twilio';

export interface SmsPayload {
  to: string;
  text: string;
}

export class TwilioService {
  private client: Twilio;
  constructor(private config: ConfigService) {
    const accountSid = config.getString('TWILIO_ACCOUNT_SID');
    const authToken = config.getString('TWILIO_AUTH_TOKEN');
    this.client = new Twilio(accountSid, authToken);
  }

  async sendMessage(payload: SmsPayload): Promise<void> {
    const from = this.config.getString('TWILIO_FROM');
    await this.client.messages.create({
      from,
      to: payload.to,
      body: payload.text,
    });
  }
}
