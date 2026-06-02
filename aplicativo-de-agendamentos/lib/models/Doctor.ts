import { Person, PersonData } from "./base/Person";

/**
 * Classe Doctor - herda de Person
 * Representa um médico da clínica
 */
export class Doctor extends Person {
  private _crm: string;
  private _specialty: Specialty;
  private _availableSlots: TimeSlot[];
  private _active: boolean;
  private _consultationFee: number;

  constructor(data: DoctorData, id?: string) {
    super(data, id);
    this._crm = data.crm;
    this._specialty = data.specialty;
    this._availableSlots = data.availableSlots || [];
    this._active = data.active ?? true;
    this._consultationFee = data.consultationFee ?? 150;

    // Restaurar datas se vindo do JSON
    if (data.createdAt) {
      this._createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt) {
      this._updatedAt = new Date(data.updatedAt);
    }
  }

  // Getters
  get crm(): string {
    return this._crm;
  }

  get specialty(): Specialty {
    return this._specialty;
  }

  get availableSlots(): TimeSlot[] {
    return [...this._availableSlots];
  }

  get active(): boolean {
    return this._active;
  }

  get consultationFee(): number {
    return this._consultationFee;
  }

  // Setters
  set crm(value: string) {
    if (!this.isValidCRM(value)) {
      throw new Error("CRM inválido");
    }
    this._crm = value;
    this.touch();
  }

  set specialty(value: Specialty) {
    this._specialty = value;
    this.touch();
  }

  set active(value: boolean) {
    this._active = value;
    this.touch();
  }

  // Validação de CRM
  private isValidCRM(crm: string): boolean {
    return crm.length >= 4;
  }

  // Gerenciamento de horários disponíveis
  addTimeSlot(slot: TimeSlot): void {
    // Verifica conflito de horário
    const hasConflict = this._availableSlots.some(
      (s) =>
        s.dayOfWeek === slot.dayOfWeek &&
        this.timeSlotsOverlap(s, slot)
    );

    if (hasConflict) {
      throw new Error("Conflito de horário detectado");
    }

    this._availableSlots.push(slot);
    this.touch();
  }

  removeTimeSlot(slotIndex: number): void {
    if (slotIndex >= 0 && slotIndex < this._availableSlots.length) {
      this._availableSlots.splice(slotIndex, 1);
      this.touch();
    }
  }

  updateTimeSlots(slots: TimeSlot[]): void {
    this._availableSlots = slots;
    this.touch();
  }

  // Verifica se dois slots de tempo se sobrepõem
  private timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    const start1 = this.timeToMinutes(slot1.startTime);
    const end1 = this.timeToMinutes(slot1.endTime);
    const start2 = this.timeToMinutes(slot2.startTime);
    const end2 = this.timeToMinutes(slot2.endTime);

    return start1 < end2 && start2 < end1;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Verifica se o médico está disponível em determinado horário
  isAvailable(dayOfWeek: number, time: string): boolean {
    const requestedTime = this.timeToMinutes(time);

    return this._availableSlots.some((slot) => {
      if (slot.dayOfWeek !== dayOfWeek) return false;

      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);

      return requestedTime >= slotStart && requestedTime < slotEnd;
    });
  }

  // Retorna horários disponíveis para um dia específico
  getAvailableTimes(dayOfWeek: number, intervalMinutes: number = 30): string[] {
    const times: string[] = [];

    const daySlots = this._availableSlots.filter(
      (slot) => slot.dayOfWeek === dayOfWeek
    );

    daySlots.forEach((slot) => {
      let current = this.timeToMinutes(slot.startTime);
      const end = this.timeToMinutes(slot.endTime);

      while (current < end) {
        const hours = Math.floor(current / 60);
        const minutes = current % 60;
        times.push(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`
        );
        current += intervalMinutes;
      }
    });

    return times.sort();
  }

  // Atualizar dados do médico
  update(data: Partial<DoctorUpdateData>): void {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.phone) this.phone = data.phone;
    if (data.crm) this.crm = data.crm;
    if (data.specialty) this.specialty = data.specialty;
    if (data.availableSlots) this.updateTimeSlots(data.availableSlots);
    if (data.active !== undefined) this.active = data.active;
  }

  // Override do método toJSON - POLIMORFISMO
  toJSON(): DoctorJSON {
    return {
      ...super.toJSON(),
      crm: this._crm,
      specialty: this._specialty,
      availableSlots: this._availableSlots,
      active: this._active,
      consultationFee: this._consultationFee,
    } as DoctorJSON;
  }

  // Factory method
  static fromJSON(json: DoctorJSON): Doctor {
    return new Doctor(
      {
        name: json.name as string,
        email: json.email as string,
        phone: json.phone as string,
        cpf: json.cpf as string,
        crm: json.crm,
        specialty: json.specialty,
        availableSlots: json.availableSlots,
        active: json.active,
        consultationFee: json.consultationFee,
        createdAt: json.createdAt as string,
        updatedAt: json.updatedAt as string,
      },
      json.id as string
    );
  }
}

// Interfaces e tipos
export type Specialty =
  | "Clínico Geral"
  | "Cardiologia"
  | "Dermatologia"
  | "Ginecologia"
  | "Neurologia"
  | "Oftalmologia"
  | "Ortopedia"
  | "Pediatria"
  | "Psiquiatria"
  | "Urologia";

export const SPECIALTIES: Specialty[] = [
  "Clínico Geral",
  "Cardiologia",
  "Dermatologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
  "Urologia",
];

export interface TimeSlot {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, etc.
  startTime: string; // "08:00"
  endTime: string; // "12:00"
}

export const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export interface DoctorData extends PersonData {
  crm: string;
  specialty: Specialty;
  availableSlots?: TimeSlot[];
  active?: boolean;
  consultationFee?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorUpdateData {
  name: string;
  email: string;
  phone: string;
  crm: string;
  specialty: Specialty;
  availableSlots: TimeSlot[];
  active: boolean;
}

export interface DoctorJSON extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  crm: string;
  specialty: Specialty;
  availableSlots: TimeSlot[];
  active: boolean;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}
