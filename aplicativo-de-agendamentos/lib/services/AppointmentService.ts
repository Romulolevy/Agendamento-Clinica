import {
  Appointment,
  AppointmentData,
  AppointmentStatus,
} from "../models/Appointment";
import { Notification } from "../models/Notification";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { PatientRepository } from "../repositories/PatientRepository";
import { DoctorRepository } from "../repositories/DoctorRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";

/**
 * AppointmentService - Serviço de lógica de negócio para agendamentos
 */
export class AppointmentService {
  private static instance: AppointmentService;
  private repository: AppointmentRepository;
  private patientRepository: PatientRepository;
  private doctorRepository: DoctorRepository;
  private notificationRepository: NotificationRepository;

  private constructor() {
    this.repository = AppointmentRepository.getInstance();
    this.patientRepository = PatientRepository.getInstance();
    this.doctorRepository = DoctorRepository.getInstance();
    this.notificationRepository = NotificationRepository.getInstance();
  }

  static getInstance(): AppointmentService {
    if (!AppointmentService.instance) {
      AppointmentService.instance = new AppointmentService();
    }
    return AppointmentService.instance;
  }

  // CRUD com validações
  async getAll(): Promise<Appointment[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Appointment | null> {
    return this.repository.findById(id);
  }

  async getByPatient(patientId: string): Promise<Appointment[]> {
    return this.repository.findByPatient(patientId);
  }

  async getByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.repository.findByDoctor(doctorId);
  }

  async getByDate(date: Date): Promise<Appointment[]> {
    return this.repository.findByDate(date);
  }

  async getToday(): Promise<Appointment[]> {
    return this.repository.findToday();
  }

  async getUpcoming(limit?: number): Promise<Appointment[]> {
    return this.repository.findUpcoming(limit);
  }

  async create(data: AppointmentData): Promise<Appointment> {
    // Validar paciente
    const patient = this.patientRepository.findById(data.patientId);
    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    // Validar médico
    const doctor = this.doctorRepository.findById(data.doctorId);
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    if (!doctor.active) {
      throw new Error("Médico não está ativo");
    }

    // Verificar conflito de horário
    const hasConflict = this.repository.hasConflict(
      data.doctorId,
      new Date(data.dateTime),
      data.duration || 30
    );

    if (hasConflict) {
      throw new Error("Já existe um agendamento neste horário");
    }

    // Criar agendamento com nomes
    const appointmentData: AppointmentData = {
      ...data,
      patientName: patient.name,
      doctorName: doctor.name,
    };

    const appointment = new Appointment(appointmentData);
    const created = this.repository.create(appointment);

    // Criar notificação
    const notification = Notification.createNewAppointment(
      created.id,
      patient.name,
      doctor.name,
      created.dateTime
    );
    this.notificationRepository.create(notification);

    return created;
  }

  async update(
    id: string,
    data: Partial<AppointmentData>
  ): Promise<Appointment> {
    const appointment = this.repository.findById(id);
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    // Se está mudando horário, verificar conflito
    if (data.dateTime) {
      const hasConflict = this.repository.hasConflict(
        appointment.doctorId,
        new Date(data.dateTime),
        data.duration || appointment.duration,
        id
      );

      if (hasConflict) {
        throw new Error("Já existe um agendamento neste horário");
      }
    }

    appointment.update(data);
    return this.repository.update(id, appointment)!;
  }

  async delete(id: string): Promise<boolean> {
    const appointment = this.repository.findById(id);
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    return this.repository.delete(id);
  }

  // Ações de status
  async confirm(id: string): Promise<Appointment> {
    const appointment = this.repository.findById(id);
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    appointment.confirm();
    return this.repository.update(id, appointment)!;
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = this.repository.findById(id);
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    appointment.cancel();
    const updated = this.repository.update(id, appointment)!;

    // Criar notificação de cancelamento
    const notification = Notification.createAppointmentCancellation(
      id,
      appointment.patientName || "Paciente",
      appointment.doctorName || "Médico"
    );
    this.notificationRepository.create(notification);

    return updated;
  }

  async complete(id: string): Promise<Appointment> {
    const appointment = this.repository.findById(id);
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    appointment.complete();
    return this.repository.update(id, appointment)!;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const appointment = this.repository.findById(id);
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    appointment.status = status;
    return this.repository.update(id, appointment)!;
  }

  // Busca
  async search(filters: {
    query?: string;
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Appointment[]> {
    return this.repository.search({
      patientName: filters.query,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }

  async getStatistics() {
    return this.repository.getStatistics();
  }

  // Gerar lembretes para consultas próximas
  async generateReminders(hoursAhead: number = 24): Promise<number> {
    const appointments = this.repository.findUpcoming();
    const now = new Date();
    const deadline = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    let count = 0;
    appointments.forEach((a) => {
      if (a.dateTime <= deadline && a.status !== "cancelled") {
        // Verifica se já existe lembrete
        const existing = this.notificationRepository.findByRelatedEntity(
          a.id,
          "appointment"
        );
        const hasReminder = existing.some((n) => n.type === "reminder");

        if (!hasReminder) {
          const notification = Notification.createAppointmentReminder(
            a.id,
            a.patientName || "Paciente",
            a.doctorName || "Médico",
            a.dateTime
          );
          this.notificationRepository.create(notification);
          count++;
        }
      }
    });

    return count;
  }
}
