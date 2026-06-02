import { Notification, NotificationData, NotificationType } from "../models/Notification";
import { NotificationRepository } from "../repositories/NotificationRepository";

/**
 * NotificationService - Serviço de notificações
 */
export class NotificationService {
  private static instance: NotificationService;
  private repository: NotificationRepository;

  private constructor() {
    this.repository = NotificationRepository.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // CRUD
  async getAll(userId?: string): Promise<Notification[]> {
    return userId
      ? this.repository.findByUser(userId)
      : this.repository.findAll();
  }

  async getById(id: string): Promise<Notification | null> {
    return this.repository.findById(id);
  }

  async getRecent(limit: number = 10, userId?: string): Promise<Notification[]> {
    return this.repository.findRecent(limit, userId);
  }

  async getUnread(userId?: string): Promise<Notification[]> {
    return this.repository.findUnread(userId);
  }

  async getByType(type: NotificationType): Promise<Notification[]> {
    return this.repository.findByType(type);
  }

  async create(data: NotificationData): Promise<Notification> {
    const notification = new Notification(data);
    return this.repository.create(notification);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  // Ações
  async markAsRead(id: string): Promise<boolean> {
    return this.repository.markAsRead(id);
  }

  async markAllAsRead(userId?: string): Promise<number> {
    return this.repository.markAllAsRead(userId);
  }

  async clearOld(daysOld: number = 30): Promise<number> {
    return this.repository.clearOld(daysOld);
  }

  async countUnread(userId?: string): Promise<number> {
    return this.repository.countUnread(userId);
  }

  // Factory methods para criar notificações
  async createSystemNotification(
    title: string,
    message: string
  ): Promise<Notification> {
    const notification = Notification.createSystemAlert(title, message);
    return this.repository.create(notification);
  }

  async getStatistics(userId?: string) {
    return this.repository.getStatistics(userId);
  }
}
