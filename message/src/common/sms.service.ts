import { ConfigService } from '@config';
import twilio from 'twilio';

export interface SmsMessagePayload {
  to: string;
  text: string;
}

export class SmsService {
  private client: twilio.Twilio;
  private from: string;

  constructor(private config: ConfigService) {
    const accountSid = config.getString('TWILIO_ACCOUNT_SID');
    const authToken = config.getString('TWILIO_AUTH_TOKEN');
    this.from = config.getString('TWILIO_FROM_NUMBER');
    this.client = twilio(accountSid, authToken);
  }

  async sendMessage(payload: SmsMessagePayload): Promise<void> {
    await this.client.messages.create({
      body: payload.text,
      from: this.from,
      to: payload.to,
    });
  }
}
