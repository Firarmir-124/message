import {ConfigService} from '@config';
import {KafkaEventBus, MultiEventBus} from '@event-bus';
import {NOTIFIER_DISPATCH_EVENT} from '@config/common/bus.topics';
import type {NotificationAdapter, TemplateConfig} from './adapters/notification-adapter';
import {EmailAdapter} from './adapters/email.adapter';
import {TelegramAdapter} from './adapters/telegram.adapter';
import {BroadcastAdapter} from './adapters/broadcast-adapter';
import {PrivateMessageAdapter} from './adapters/private-message.adapter';
import {WhatsAppAdapter} from './adapters/whatsapp.adapter';
import {TelegramService} from './common/telegram.service';
import {WhatsAppService} from './common/whatsapp.service';
import {SocketService} from './common/socket.service';

interface NotifyEvent {
  address: string;
  message: string;
}

export class MessageService {
  private readonly config: ConfigService;
  private multiBus!: MultiEventBus;
  private adapters: Record<string, NotificationAdapter> = {};
  private telegramService: TelegramService;
  private whatsappService: WhatsAppService;
  private socketService: SocketService;

  constructor(config: ConfigService) {
    this.config = config;
    this.telegramService = new TelegramService(config);
    this.whatsappService = new WhatsAppService(config);
    this.socketService = new SocketService();
  }

  async start() {
    await this.initializeEventBuses();
    this.registerEnvAdapters();
    await this.subscribeToEvents();
    await this.multiBus.run();
    console.log('Message Service started');
  }

  private async initializeEventBuses() {
    this.multiBus = new MultiEventBus({
      system: new KafkaEventBus(this.config.getString('KAFKA_SYSTEM_BROKERS').split(',')),
    });
    await this.multiBus.init();
  }

  private registerEnvAdapters() {
    const list = this.config.getString('MESSAGE_ADAPTERS', 'email,telegram,broadcast,private,whatsapp')
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);
    for (const name of list) {
      switch (name) {
        case 'email':
          this.registerAdapter(new EmailAdapter(this.config));
          break;
        case 'telegram':
          this.registerAdapter(new TelegramAdapter(this.telegramService));
          break;
        case 'broadcast':
          this.registerAdapter(new BroadcastAdapter(this.socketService));
          break;
        case 'private':
          this.registerAdapter(new PrivateMessageAdapter(this.socketService));
          break;
        case 'whatsapp':
          this.registerAdapter(new WhatsAppAdapter(this.whatsappService));
          break;
        default:
          console.warn(`[MessageService] Unknown adapter ${name}`);
      }
    }
  }

  private registerAdapter(adapter: NotificationAdapter) {
    this.adapters[adapter.name] = adapter;
  }

  private async subscribeToEvents() {
    await this.multiBus.subscribe(NOTIFIER_DISPATCH_EVENT, this.handleEvent);
  }

  private async handleEvent(message: NotifyEvent) {
    const payload: TemplateConfig = { body: message.message };
    for (const adapter of Object.values(this.adapters)) {
      await adapter.send(message.address, payload);
    }
  }

  async shutdown() {
    if (this.multiBus) {
      await this.multiBus.shutdown();
    }
  }
}
