import { NotificationAdapter } from './notification-adapter';
import { SocketService } from '../common/socket.service';

export class PrivateMessageAdapter implements NotificationAdapter {
  readonly name = 'private';

  constructor(private socket: SocketService) {}

  async send(address: string, message: string): Promise<void> {
    this.socket.sendPrivateMessage({ user: address, data: message });
  }
}
