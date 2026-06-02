import { BaseRepository } from "./BaseRepository";
import { Doctor, DoctorJSON, Specialty } from "../models/Doctor";

/**
 * DoctorRepository - Repositório para médicos
 * Herda de BaseRepository e adiciona métodos específicos
 */
export class DoctorRepository extends BaseRepository<Doctor, DoctorJSON> {
  private static instance: DoctorRepository;

  private constructor() {
    super("clinic_doctors");
  }

  // Singleton pattern
  static getInstance(): DoctorRepository {
    if (!DoctorRepository.instance) {
      DoctorRepository.instance = new DoctorRepository();
    }
    return DoctorRepository.instance;
  }

  protected fromJSON(json: DoctorJSON): Doctor {
    return Doctor.fromJSON(json);
  }

  protected toJSON(item: Doctor): DoctorJSON {
    return item.toJSON();
  }

  // Métodos específicos de busca
  findByName(name: string): Doctor[] {
    const doctors = this.findAll();
    const searchTerm = name.toLowerCase();
    return doctors.filter((d) =>
      d.name.toLowerCase().includes(searchTerm)
    );
  }

  findByCRM(crm: string): Doctor | null {
    const doctors = this.findAll();
    return doctors.find((d) => d.crm === crm) || null;
  }

  findBySpecialty(specialty: Specialty): Doctor[] {
    const doctors = this.findAll();
    return doctors.filter((d) => d.specialty === specialty);
  }

  findActive(): Doctor[] {
    const doctors = this.findAll();
    return doctors.filter((d) => d.active);
  }

  findAvailableOnDay(dayOfWeek: number): Doctor[] {
    const doctors = this.findActive();
    return doctors.filter((d) =>
      d.availableSlots.some((slot) => slot.dayOfWeek === dayOfWeek)
    );
  }

  // Busca com filtros múltiplos
  search(filters: DoctorSearchFilters): Doctor[] {
    let results = this.findAll();

    if (filters.name) {
      const searchTerm = filters.name.toLowerCase();
      results = results.filter((d) =>
        d.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.specialty) {
      results = results.filter((d) => d.specialty === filters.specialty);
    }

    if (filters.crm) {
      results = results.filter((d) =>
        d.crm.toLowerCase().includes(filters.crm!.toLowerCase())
      );
    }

    if (filters.activeOnly) {
      results = results.filter((d) => d.active);
    }

    return results;
  }

  // Estatísticas
  getStatistics(): DoctorStatistics {
    const doctors = this.findAll();
    const activeDoctors = doctors.filter((d) => d.active);

    const specialtyCounts: Record<string, number> = {};
    doctors.forEach((d) => {
      specialtyCounts[d.specialty] = (specialtyCounts[d.specialty] || 0) + 1;
    });

    return {
      total: doctors.length,
      active: activeDoctors.length,
      inactive: doctors.length - activeDoctors.length,
      bySpecialty: specialtyCounts,
    };
  }
}

// Interfaces de busca
export interface DoctorSearchFilters {
  name?: string;
  specialty?: Specialty;
  crm?: string;
  activeOnly?: boolean;
}

export interface DoctorStatistics {
  total: number;
  active: number;
  inactive: number;
  bySpecialty: Record<string, number>;
}
