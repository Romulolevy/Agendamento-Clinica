import { Entity } from "./base/Entity";

/**
 * Classe Appointment - herda de Entity
 * Representa um agendamento de consulta
 */
export class Appointment extends Entity {
  private _patientId: string;
  private _doctorId: string;
  private _dateTime: Date;
  private _duration: number; // em minutos
  private _status: AppointmentStatus;
  private _type: AppointmentType;
  private _notes?: string;
  private _patientName?: string;
  private _doctorName?: string;

  constructor(data: AppointmentData, id?: string) {
    super(id);
    this._patientId = data.patientId;
    this._doctorId = data.doctorId;
    this._dateTime = new Date(data.dateTime);
    this._duration = data.duration || 30;
    this._status = data.status || "scheduled";
    this._type = data.type || "consultation";
    this._notes = data.notes;
    this._patientName = data.patientName;
    this._doctorName = data.doctorName;

    // Restaurar datas se vindo do JSON
    if (data.createdAt) {
      this._createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt) {
      this._updatedAt = new Date(data.updatedAt);
    }
  }

  // Getters
  get patientId(): string {
    return this._patientId;
  }

  get doctorId(): string {
    return this._doctorId;
  }

  get dateTime(): Date {
    return this._dateTime;
  }

  get duration(): number {
    return this._duration;
  }

  get status(): AppointmentStatus {
    return this._status;
  }

  get type(): AppointmentType {
    return this._type;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get patientName(): string | undefined {
    return this._patientName;
  }

  get doctorName(): string | undefined {
    return this._doctorName;
  }

  // Calcula horário de término
  get endTime(): Date {
    return new Date(this._dateTime.getTime() + this._duration * 60000);
  }

  // Setters
  set dateTime(value: Date) {
    if (value < new Date()) {
      throw new Error("Não é possível agendar para data passada");
    }
    this._dateTime = value;
    this.touch();
  }

  set duration(value: number) {
    if (value < 15 || value > 240) {
      throw new Error("Duração deve ser entre 15 e 240 minutos");
    }
    this._duration = value;
    this.touch();
  }

  set status(value: AppointmentStatus) {
    this._status = value;
    this.touch();
  }

  set type(value: AppointmentType) {
    this._type = value;
    this.touch();
  }

  set notes(value: string | undefined) {
    this._notes = value;
    this.touch();
  }

  // Métodos de negócio
  confirm(): void {
    if (this._status !== "scheduled") {
      throw new Error("Apenas agendamentos pendentes podem ser confirmados");
    }
    this._status = "confirmed";
    this.touch();
  }

  cancel(): void {
    if (this._status === "completed" || this._status === "cancelled") {
      throw new Error("Não é possível cancelar este agendamento");
    }
    this._status = "cancelled";
    this.touch();
  }

  complete(): void {
    if (this._status !== "confirmed" && this._status !== "scheduled") {
      throw new Error("Apenas agendamentos confirmados podem ser concluídos");
    }
    this._status = "completed";
    this.touch();
  }

  reschedule(newDateTime: Date): void {
    if (this._status === "completed" || this._status === "cancelled") {
      throw new Error("Não é possível reagendar este agendamento");
    }
    this.dateTime = newDateTime;
    this._status = "scheduled";
  }

  // Verifica se há conflito com outro agendamento
  conflictsWith(other: Appointment): boolean {
    if (this._doctorId !== other._doctorId) return false;
    if (this._status === "cancelled" || other._status === "cancelled") return false;

    const thisStart = this._dateTime.getTime();
    const thisEnd = this.endTime.getTime();
    const otherStart = other._dateTime.getTime();
    const otherEnd = other.endTime.getTime();

    return thisStart < otherEnd && otherStart < thisEnd;
  }

  // Verifica se o agendamento é hoje
  isToday(): boolean {
    const today = new Date();
    return (
      this._dateTime.getDate() === today.getDate() &&
      this._dateTime.getMonth() === today.getMonth() &&
      this._dateTime.getFullYear() === today.getFullYear()
    );
  }

  // Verifica se está próximo (dentro de X horas)
  isUpcoming(hoursAhead: number = 24): boolean {
    const now = new Date();
    const deadline = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    return this._dateTime > now && this._dateTime <= deadline;
  }

  // Atualizar dados
  update(data: Partial<AppointmentUpdateData>): void {
    if (data.dateTime) this._dateTime = new Date(data.dateTime);
    if (data.duration) this.duration = data.duration;
    if (data.type) this.type = data.type;
    if (data.notes !== undefined) this.notes = data.notes;
    if (data.status) this.status = data.status;
    this.touch();
  }

  // Override toJSON - POLIMORFISMO
  toJSON(): AppointmentJSON {
    return {
      id: this._id,
      patientId: this._patientId,
      doctorId: this._doctorId,
      dateTime: this._dateTime.toISOString(),
      duration: this._duration,
      status: this._status,
      type: this._type,
      notes: this._notes,
      patientName: this._patientName,
      doctorName: this._doctorName,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  // Factory method
  static fromJSON(json: AppointmentJSON): Appointment {
    return new Appointment(
      {
        patientId: json.patientId,
        doctorId: json.doctorId,
        dateTime: json.dateTime,
        duration: json.duration,
        status: json.status,
        type: json.type,
        notes: json.notes,
        patientName: json.patientName,
        doctorName: json.doctorName,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
      },
      json.id
    );
  }
}

// Tipos e interfaces
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed";

export type AppointmentType =
  | "consultation"
  | "return"
  | "exam"
  | "procedure"
  | "emergency";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: "Consulta",
  return: "Retorno",
  exam: "Exame",
  procedure: "Procedimento",
  emergency: "Emergência",
};

export interface AppointmentData {
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration?: number;
  status?: AppointmentStatus;
  type?: AppointmentType;
  notes?: string;
  patientName?: string;
  doctorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentUpdateData {
  dateTime: string;
  duration: number;
  type: AppointmentType;
  notes?: string;
  status: AppointmentStatus;
}

export interface AppointmentJSON {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  patientName?: string;
  doctorName?: string;
  createdAt: string;
  updatedAt: string;
}
