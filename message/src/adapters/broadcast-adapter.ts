import { NotificationAdapter, TemplateConfig } from './notification-adapter';
import { SocketService } from '../common/socket.service';

export class BroadcastAdapter implements NotificationAdapter {
  readonly name = 'broadcast';

  constructor(private socket: SocketService) {}

  async send(_: string, template: TemplateConfig): Promise<void> {
    this.socket.sendBroadcastMessage({ data: template.body });
  }
}
