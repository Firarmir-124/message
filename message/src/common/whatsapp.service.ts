import { ConfigService } from '@config';
import axios from 'axios';

export interface WhatsAppMessagePayload {
  to: string;
  text: string;
}

export class WhatsAppService {
  constructor(private config: ConfigService) {}

  async sendMessage(payload: WhatsAppMessagePayload): Promise<void> {
    const token = this.config.getString('WHATSAPP_TOKEN');
    const phoneId = this.config.getString('WHATSAPP_PHONE_ID');
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: payload.to,
        type: 'text',
        text: { body: payload.text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
