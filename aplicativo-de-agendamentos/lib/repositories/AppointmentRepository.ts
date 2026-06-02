import { BaseRepository } from "./BaseRepository";
import {
  Appointment,
  AppointmentJSON,
  AppointmentStatus,
} from "../models/Appointment";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

/**
 * AppointmentRepository - Repositório para agendamentos
 * Herda de BaseRepository e adiciona métodos específicos
 */
export class AppointmentRepository extends BaseRepository<
  Appointment,
  AppointmentJSON
> {
  private static instance: AppointmentRepository;

  private constructor() {
    super("clinic_appointments");
  }

  // Singleton pattern
  static getInstance(): AppointmentRepository {
    if (!AppointmentRepository.instance) {
      AppointmentRepository.instance = new AppointmentRepository();
    }
    return AppointmentRepository.instance;
  }

  protected fromJSON(json: AppointmentJSON): Appointment {
    return Appointment.fromJSON(json);
  }

  protected toJSON(item: Appointment): AppointmentJSON {
    return item.toJSON();
  }

  // Métodos específicos de busca
  findByPatient(patientId: string): Appointment[] {
    const appointments = this.findAll();
    return appointments.filter((a) => a.patientId === patientId);
  }

  findByDoctor(doctorId: string): Appointment[] {
    const appointments = this.findAll();
    return appointments.filter((a) => a.doctorId === doctorId);
  }

  findByStatus(status: AppointmentStatus): Appointment[] {
    const appointments = this.findAll();
    return appointments.filter((a) => a.status === status);
  }

  findByDate(date: Date): Appointment[] {
    const appointments = this.findAll();
    const start = startOfDay(date);
    const end = endOfDay(date);

    return appointments.filter((a) =>
      isWithinInterval(a.dateTime, { start, end })
    );
  }

  findByDateRange(startDate: Date, endDate: Date): Appointment[] {
    const appointments = this.findAll();
    return appointments.filter((a) =>
      isWithinInterval(a.dateTime, { start: startDate, end: endDate })
    );
  }

  findToday(): Appointment[] {
    return this.findByDate(new Date());
  }

  findThisWeek(): Appointment[] {
    const now = new Date();
    return this.findByDateRange(startOfWeek(now), endOfWeek(now));
  }

  findThisMonth(): Appointment[] {
    const now = new Date();
    return this.findByDateRange(startOfMonth(now), endOfMonth(now));
  }

  findUpcoming(limit?: number): Appointment[] {
    const now = new Date();
    const appointments = this.findAll()
      .filter(
        (a) =>
          a.dateTime >= now &&
          a.status !== "cancelled" &&
          a.status !== "completed"
      )
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    return limit ? appointments.slice(0, limit) : appointments;
  }

  // Verifica conflito de horário
  hasConflict(
    doctorId: string,
    dateTime: Date,
    duration: number,
    excludeId?: string
  ): boolean {
    const appointments = this.findByDoctor(doctorId).filter(
      (a) => a.status !== "cancelled" && a.id !== excludeId
    );

    const newStart = dateTime.getTime();
    const newEnd = newStart + duration * 60000;

    return appointments.some((a) => {
      const existingStart = a.dateTime.getTime();
      const existingEnd = a.endTime.getTime();
      return newStart < existingEnd && existingStart < newEnd;
    });
  }

  // Busca com filtros múltiplos
  search(filters: AppointmentSearchFilters): Appointment[] {
    let results = this.findAll();

    if (filters.patientId) {
      results = results.filter((a) => a.patientId === filters.patientId);
    }

    if (filters.doctorId) {
      results = results.filter((a) => a.doctorId === filters.doctorId);
    }

    if (filters.status) {
      results = results.filter((a) => a.status === filters.status);
    }

    if (filters.startDate) {
      results = results.filter((a) => a.dateTime >= filters.startDate!);
    }

    if (filters.endDate) {
      results = results.filter((a) => a.dateTime <= filters.endDate!);
    }

    if (filters.patientName) {
      const searchTerm = filters.patientName.toLowerCase();
      results = results.filter((a) =>
        a.patientName?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.doctorName) {
      const searchTerm = filters.doctorName.toLowerCase();
      results = results.filter((a) =>
        a.doctorName?.toLowerCase().includes(searchTerm)
      );
    }

    return results.sort(
      (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
    );
  }

  // Estatísticas
  getStatistics(): AppointmentStatistics {
    const appointments = this.findAll();
    const today = this.findToday();
    const thisMonth = this.findThisMonth();

    const statusCounts: Record<AppointmentStatus, number> = {
      scheduled: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };

    appointments.forEach((a) => {
      statusCounts[a.status]++;
    });

    // Calcular por dia da semana
    const byDayOfWeek: number[] = [0, 0, 0, 0, 0, 0, 0];
    thisMonth.forEach((a) => {
      byDayOfWeek[a.dateTime.getDay()]++;
    });

    return {
      total: appointments.length,
      today: today.length,
      thisMonth: thisMonth.length,
      upcoming: this.findUpcoming().length,
      byStatus: statusCounts,
      byDayOfWeek,
    };
  }
}

// Interfaces de busca
export interface AppointmentSearchFilters {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
  patientName?: string;
  doctorName?: string;
}

export interface AppointmentStatistics {
  total: number;
  today: number;
  thisMonth: number;
  upcoming: number;
  byStatus: Record<AppointmentStatus, number>;
  byDayOfWeek: number[];
}
