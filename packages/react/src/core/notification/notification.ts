import { notification as antdNotification } from 'antd';
import { NotificationType } from "./type";

export const notification: NotificationType = {
  message(type, message) {
    switch (type) {
      case 'info':
        antdNotification.info({ message });
        break;
      case 'success':
        antdNotification.success({ message });
        break;
      case 'error':
        antdNotification.error({ message });
        break;
      case 'warn':
        antdNotification.warn({ message });
        break;
      default:
        throw Error(`[notification] not supported type`);
    }
  }
}
