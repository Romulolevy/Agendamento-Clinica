import { Patient, PatientData } from "../models/Patient";
import { PatientRepository } from "../repositories/PatientRepository";

/**
 * PatientService - Serviço de lógica de negócio para pacientes
 * Implementa validações e regras de negócio
 */
export class PatientService {
  private static instance: PatientService;
  private repository: PatientRepository;

  private constructor() {
    this.repository = PatientRepository.getInstance();
  }

  static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  // CRUD com validações
  async getAll(): Promise<Patient[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Patient | null> {
    return this.repository.findById(id);
  }

  async create(data: PatientData): Promise<Patient> {
    // Validação: CPF único
    const existingCPF = this.repository.findByCPF(data.cpf);
    if (existingCPF) {
      throw new Error("Já existe um paciente cadastrado com este CPF");
    }

    // Validação: Email único
    const existingEmail = this.repository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error("Já existe um paciente cadastrado com este email");
    }

    const patient = new Patient(data);
    return this.repository.create(patient);
  }

  async update(id: string, data: Partial<PatientData>): Promise<Patient> {
    const patient = this.repository.findById(id);
    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    // Validação: Email único (exceto o próprio)
    if (data.email) {
      const existingEmail = this.repository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error("Este email já está em uso por outro paciente");
      }
    }

    patient.update(data);
    return this.repository.update(id, patient)!;
  }

  async delete(id: string): Promise<boolean> {
    const patient = this.repository.findById(id);
    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    return this.repository.delete(id);
  }

  // Busca
  async search(query: string): Promise<Patient[]> {
    if (!query || query.length < 2) {
      return this.repository.findAll();
    }

    return this.repository.search({
      name: query,
    });
  }

  async getStatistics() {
    return this.repository.getStatistics();
  }
}
