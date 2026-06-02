import { BaseRepository } from "./BaseRepository";
import { Notification, NotificationJSON, NotificationType } from "../models/Notification";

/**
 * NotificationRepository - Repositório para notificações
 * Herda de BaseRepository e adiciona métodos específicos
 */
export class NotificationRepository extends BaseRepository<
  Notification,
  NotificationJSON
> {
  private static instance: NotificationRepository;

  private constructor() {
    super("clinic_notifications");
  }

  // Singleton pattern
  static getInstance(): NotificationRepository {
    if (!NotificationRepository.instance) {
      NotificationRepository.instance = new NotificationRepository();
    }
    return NotificationRepository.instance;
  }

  protected fromJSON(json: NotificationJSON): Notification {
    return Notification.fromJSON(json);
  }

  protected toJSON(item: Notification): NotificationJSON {
    return item.toJSON();
  }

  // Métodos específicos de busca
  findByUser(userId: string): Notification[] {
    const notifications = this.findAll();
    return notifications
      .filter((n) => n.userId === userId || !n.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findUnread(userId?: string): Notification[] {
    const notifications = userId ? this.findByUser(userId) : this.findAll();
    return notifications.filter((n) => !n.read);
  }

  findByType(type: NotificationType): Notification[] {
    const notifications = this.findAll();
    return notifications.filter((n) => n.type === type);
  }

  findRecent(limit: number = 10, userId?: string): Notification[] {
    const notifications = userId ? this.findByUser(userId) : this.findAll();
    return notifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  findByRelatedEntity(
    entityId: string,
    entityType: "appointment" | "patient" | "doctor"
  ): Notification[] {
    const notifications = this.findAll();
    return notifications.filter(
      (n) =>
        n.relatedEntityId === entityId && n.relatedEntityType === entityType
    );
  }

  // Marcar como lida
  markAsRead(id: string): boolean {
    const notification = this.findById(id);
    if (!notification) return false;

    notification.markAsRead();
    this.update(id, notification);
    return true;
  }

  // Marcar todas como lidas
  markAllAsRead(userId?: string): number {
    const unread = this.findUnread(userId);
    let count = 0;

    unread.forEach((n) => {
      n.markAsRead();
      this.update(n.id, n);
      count++;
    });

    return count;
  }

  // Limpar notificações antigas
  clearOld(daysOld: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const notifications = this.findAll();
    const toDelete = notifications.filter(
      (n) => n.createdAt < cutoffDate && n.read
    );

    toDelete.forEach((n) => this.delete(n.id));

    return toDelete.length;
  }

  // Contagem de não lidas
  countUnread(userId?: string): number {
    return this.findUnread(userId).length;
  }

  // Estatísticas
  getStatistics(userId?: string): NotificationStatistics {
    const notifications = userId ? this.findByUser(userId) : this.findAll();
    const unread = notifications.filter((n) => !n.read);

    const byType: Record<NotificationType, number> = {
      appointment: 0,
      reminder: 0,
      cancellation: 0,
      system: 0,
      info: 0,
    };

    notifications.forEach((n) => {
      byType[n.type]++;
    });

    return {
      total: notifications.length,
      unread: unread.length,
      read: notifications.length - unread.length,
      byType,
    };
  }
}

export interface NotificationStatistics {
  total: number;
  unread: number;
  read: number;
  byType: Record<NotificationType, number>;
}
