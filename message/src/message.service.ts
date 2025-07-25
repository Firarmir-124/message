import {ConfigService} from '@config';
import {KafkaEventBus, MultiEventBus} from '@event-bus';
import {NOTIFIER_DISPATCH_EVENT} from '@config/common/bus.topics';
import type {NotificationAdapter} from './adapters/notification-adapter';
import {EmailAdapter} from './adapters/email.adapter';
import {TelegramAdapter} from './adapters/telegram.adapter';
import {PrivateMessageAdapter} from './adapters/private-message.adapter';
import {WhatsAppAdapter} from './adapters/whatsapp.adapter';
import {SmsAdapter} from './adapters/sms.adapter';
import {TelegramService} from './common/telegram.service';
import {WhatsAppService} from './common/whatsapp.service';
import {SmsService} from './common/sms.service';
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
  private smsService: SmsService;

  constructor(config: ConfigService) {
    this.config = config;
    this.telegramService = new TelegramService(config);
    this.whatsappService = new WhatsAppService(config);
    this.socketService = new SocketService();
    this.smsService = new SmsService(config);
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
    const list = this.config.getString('MESSAGE_ADAPTERS', 'email,telegram,private,whatsapp,sms')
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
        case 'private':
          this.registerAdapter(new PrivateMessageAdapter(this.socketService));
          break;
        case 'whatsapp':
          this.registerAdapter(new WhatsAppAdapter(this.whatsappService));
          break;
        case 'sms':
          this.registerAdapter(new SmsAdapter(this.smsService));
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
    for (const adapter of Object.values(this.adapters)) {
      await adapter.send(message.address, message.message);
    }
  }

  async shutdown() {
    if (this.multiBus) {
      await this.multiBus.shutdown();
    }
  }
}
