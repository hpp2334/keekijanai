export interface NotificationType {
  message(type: 'info' | 'warn' | 'success' | 'error', message: string): void;
}
