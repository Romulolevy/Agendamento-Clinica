import { Entity } from "./base/Entity";

/**
 * Classe Notification - herda de Entity
 * Representa uma notificação do sistema
 */
export class Notification extends Entity {
  private _title: string;
  private _message: string;
  private _type: NotificationType;
  private _priority: NotificationPriority;
  private _read: boolean;
  private _userId?: string;
  private _relatedEntityId?: string;
  private _relatedEntityType?: "appointment" | "patient" | "doctor";

  constructor(data: NotificationData, id?: string) {
    super(id);
    this._title = data.title;
    this._message = data.message;
    this._type = data.type;
    this._priority = data.priority || "normal";
    this._read = data.read ?? false;
    this._userId = data.userId;
    this._relatedEntityId = data.relatedEntityId;
    this._relatedEntityType = data.relatedEntityType;

    // Restaurar datas se vindo do JSON
    if (data.createdAt) {
      this._createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt) {
      this._updatedAt = new Date(data.updatedAt);
    }
  }

  // Getters
  get title(): string {
    return this._title;
  }

  get message(): string {
    return this._message;
  }

  get type(): NotificationType {
    return this._type;
  }

  get priority(): NotificationPriority {
    return this._priority;
  }

  get read(): boolean {
    return this._read;
  }

  get userId(): string | undefined {
    return this._userId;
  }

  get relatedEntityId(): string | undefined {
    return this._relatedEntityId;
  }

  get relatedEntityType(): "appointment" | "patient" | "doctor" | undefined {
    return this._relatedEntityType;
  }

  // Métodos de negócio
  markAsRead(): void {
    this._read = true;
    this.touch();
  }

  markAsUnread(): void {
    this._read = false;
    this.touch();
  }

  // Verifica se a notificação é recente (últimas 24h)
  isRecent(): boolean {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this._createdAt > oneDayAgo;
  }

  // Override toJSON
  toJSON(): NotificationJSON {
    return {
      id: this._id,
      title: this._title,
      message: this._message,
      type: this._type,
      priority: this._priority,
      read: this._read,
      userId: this._userId,
      relatedEntityId: this._relatedEntityId,
      relatedEntityType: this._relatedEntityType,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  // Factory method
  static fromJSON(json: NotificationJSON): Notification {
    return new Notification(
      {
        title: json.title,
        message: json.message,
        type: json.type,
        priority: json.priority,
        read: json.read,
        userId: json.userId,
        relatedEntityId: json.relatedEntityId,
        relatedEntityType: json.relatedEntityType,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
      },
      json.id
    );
  }

  // Factory methods para criar notificações comuns
  static createAppointmentReminder(
    appointmentId: string,
    patientName: string,
    doctorName: string,
    dateTime: Date,
    userId?: string
  ): Notification {
    const formattedDate = dateTime.toLocaleDateString("pt-BR");
    const formattedTime = dateTime.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return new Notification({
      title: "Lembrete de Consulta",
      message: `Consulta de ${patientName} com Dr(a). ${doctorName} agendada para ${formattedDate} às ${formattedTime}.`,
      type: "reminder",
      priority: "high",
      userId,
      relatedEntityId: appointmentId,
      relatedEntityType: "appointment",
    });
  }

  static createAppointmentCancellation(
    appointmentId: string,
    patientName: string,
    doctorName: string,
    userId?: string
  ): Notification {
    return new Notification({
      title: "Consulta Cancelada",
      message: `A consulta de ${patientName} com Dr(a). ${doctorName} foi cancelada.`,
      type: "cancellation",
      priority: "high",
      userId,
      relatedEntityId: appointmentId,
      relatedEntityType: "appointment",
    });
  }

  static createNewAppointment(
    appointmentId: string,
    patientName: string,
    doctorName: string,
    dateTime: Date,
    userId?: string
  ): Notification {
    const formattedDate = dateTime.toLocaleDateString("pt-BR");
    const formattedTime = dateTime.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return new Notification({
      title: "Nova Consulta Agendada",
      message: `Nova consulta: ${patientName} com Dr(a). ${doctorName} em ${formattedDate} às ${formattedTime}.`,
      type: "appointment",
      priority: "normal",
      userId,
      relatedEntityId: appointmentId,
      relatedEntityType: "appointment",
    });
  }

  static createSystemAlert(
    title: string,
    message: string,
    priority: NotificationPriority = "normal"
  ): Notification {
    return new Notification({
      title,
      message,
      type: "system",
      priority,
    });
  }
}

// Tipos e interfaces
export type NotificationType =
  | "appointment"
  | "reminder"
  | "cancellation"
  | "system"
  | "info";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  appointment: "Agendamento",
  reminder: "Lembrete",
  cancellation: "Cancelamento",
  system: "Sistema",
  info: "Informação",
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

export interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  read?: boolean;
  userId?: string;
  relatedEntityId?: string;
  relatedEntityType?: "appointment" | "patient" | "doctor";
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationJSON {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  userId?: string;
  relatedEntityId?: string;
  relatedEntityType?: "appointment" | "patient" | "doctor";
  createdAt: string;
  updatedAt: string;
}
