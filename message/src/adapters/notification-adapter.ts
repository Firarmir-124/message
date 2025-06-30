export interface NotificationAdapter {
  /**
   * Unique channel name used in notification rules
   */
  readonly name: string;

  send(address: string, message: string): Promise<void>;
}
