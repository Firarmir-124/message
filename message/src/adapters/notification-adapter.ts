export interface TemplateConfig {
  subject?: string;
  body: string;
}

export interface NotificationAdapter {
  /**
   * Unique channel name used in notification rules
   */
  readonly name: string;

  send(userId: string, template: TemplateConfig): Promise<void>;
}
