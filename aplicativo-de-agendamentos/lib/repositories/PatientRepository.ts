import { BaseRepository } from "./BaseRepository";
import { Patient, PatientJSON } from "../models/Patient";

/**
 * PatientRepository - Repositório para pacientes
 * Herda de BaseRepository e adiciona métodos específicos
 */
export class PatientRepository extends BaseRepository<Patient, PatientJSON> {
  private static instance: PatientRepository;

  private constructor() {
    super("clinic_patients");
  }

  // Singleton pattern
  static getInstance(): PatientRepository {
    if (!PatientRepository.instance) {
      PatientRepository.instance = new PatientRepository();
    }
    return PatientRepository.instance;
  }

  protected fromJSON(json: PatientJSON): Patient {
    return Patient.fromJSON(json);
  }

  protected toJSON(item: Patient): PatientJSON {
    return item.toJSON();
  }

  // Métodos específicos de busca
  findByName(name: string): Patient[] {
    const patients = this.findAll();
    const searchTerm = name.toLowerCase();
    return patients.filter((p) =>
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  findByCPF(cpf: string): Patient | null {
    const patients = this.findAll();
    const cleanCPF = cpf.replace(/\D/g, "");
    return patients.find((p) => p.cpf.replace(/\D/g, "") === cleanCPF) || null;
  }

  findByEmail(email: string): Patient | null {
    const patients = this.findAll();
    return patients.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // Busca com filtros múltiplos
  search(filters: PatientSearchFilters): Patient[] {
    let results = this.findAll();

    if (filters.name) {
      const searchTerm = filters.name.toLowerCase();
      results = results.filter((p) =>
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.email) {
      results = results.filter((p) =>
        p.email.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }

    if (filters.phone) {
      const searchPhone = filters.phone.replace(/\D/g, "");
      results = results.filter((p) =>
        p.phone.replace(/\D/g, "").includes(searchPhone)
      );
    }

    if (filters.healthInsurance) {
      results = results.filter((p) =>
        p.healthInsurance?.toLowerCase().includes(filters.healthInsurance!.toLowerCase())
      );
    }

    return results;
  }

  // Estatísticas
  getStatistics(): PatientStatistics {
    const patients = this.findAll();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const ageGroups = {
      children: 0, // 0-12
      teenagers: 0, // 13-17
      adults: 0, // 18-59
      seniors: 0, // 60+
    };

    patients.forEach((p) => {
      const age = p.getAge();
      if (age <= 12) ageGroups.children++;
      else if (age <= 17) ageGroups.teenagers++;
      else if (age <= 59) ageGroups.adults++;
      else ageGroups.seniors++;
    });

    const recentPatients = patients.filter(
      (p) => p.createdAt >= thirtyDaysAgo
    ).length;

    return {
      total: patients.length,
      recentPatients,
      ageGroups,
    };
  }
}

// Interfaces de busca
export interface PatientSearchFilters {
  name?: string;
  email?: string;
  phone?: string;
  healthInsurance?: string;
}

export interface PatientStatistics {
  total: number;
  recentPatients: number;
  ageGroups: {
    children: number;
    teenagers: number;
    adults: number;
    seniors: number;
  };
}
