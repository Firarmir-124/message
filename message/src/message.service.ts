import {ConfigService} from '@config';
import path from 'node:path';
import fs from 'node:fs';
import {KafkaEventBus, MultiEventBus} from '@event-bus';
import {NOTIFIER_DISPATCH_EVENT} from '@config/common/bus.topics';
import type {NotificationAdapter, TemplateConfig} from './adapters/notification-adapter';
import {EmailAdapter} from './adapters/email.adapter';
import {TelegramAdapter} from './adapters/telegram.adapter';
import {BroadcastAdapter} from './adapters/broadcast-adapter';
import {PrivateMessageAdapter} from './adapters/private-message.adapter';
import {TelegramService} from './common/telegram.service';
import {SocketService} from "./common/socket.service";

interface NotifyEvent {
  userId: string;
  event: string;
  data: Record<string, any>;
}

interface NotificationRule {
  event: string;
  channels: string[];
  templates: Record<string, TemplateConfig>;
}

export class MessageService {
  private readonly config: ConfigService;
  private multiBus!: MultiEventBus;
  private rules: NotificationRule[] = [];
  private adapters: Record<string, NotificationAdapter> = {};
  private telegramService: TelegramService;
  private socketService: SocketService;

  constructor(config: ConfigService) {
    this.config = config;
    this.telegramService = new TelegramService(config);
    this.socketService = new SocketService()
  }

  async start() {
    await this.initializeEventBuses();
    this.registerEnvAdapters();
    await this.loadRules();
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
    const list = this.config.getString('MESSAGE_ADAPTERS', 'email,telegram,broadcast,private')
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);
    for (const name of list) {
      switch (name) {
        case 'email':
          this.registerAdapter(new EmailAdapter(this.multiBus));
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
        default:
          console.warn(`[MessageService] Unknown adapter ${name}`);
      }
    }
  }

  private registerAdapter(adapter: NotificationAdapter) {
    this.adapters[adapter.name] = adapter;
  }

  private loadRules() {
    try {
      const rulesPath = path.resolve(__dirname, '../config/notifications.json');
      const json = fs.readFileSync(rulesPath, 'utf8');
      this.rules = JSON.parse(json);
    } catch (err) {
      console.warn('[MessageService] No notification rules found');
      this.rules = [];
    }
  }

  private async subscribeToEvents() {
    await this.multiBus.subscribe(NOTIFIER_DISPATCH_EVENT, this.handleEvent);
  }

  private findRule(event: string): NotificationRule | undefined {
    return this.rules.find(r => r.event === event);
  }

  private render(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => String(data[key.trim()] ?? ''));
  }

  private async handleEvent(message: NotifyEvent) {
    const rule = this.findRule(message.event);
    if (!rule) {
      console.warn(`[MessageService] No rule for event ${message.event}`);
      return;
    }

    for (const channel of rule.channels) {
      const adapter = this.adapters[channel];
      if (!adapter) {
        console.warn(`[MessageService] No adapter for channel ${channel}`);
        continue;
      }
      const tpl = rule.templates[channel];
      if (!tpl) continue;
      const rendered: TemplateConfig = {
        body: this.render(tpl.body, message.data),
        subject: tpl.subject ? this.render(tpl.subject, message.data) : undefined,
      };
      await adapter.send(message.userId, rendered);
    }
  }

  async shutdown() {
    if (this.multiBus) {
      await this.multiBus.shutdown();
    }
  }
}
