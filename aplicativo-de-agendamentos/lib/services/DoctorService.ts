import { Doctor, DoctorData, Specialty, TimeSlot } from "../models/Doctor";
import { DoctorRepository } from "../repositories/DoctorRepository";

/**
 * DoctorService - Serviço de lógica de negócio para médicos
 */
export class DoctorService {
  private static instance: DoctorService;
  private repository: DoctorRepository;

  private constructor() {
    this.repository = DoctorRepository.getInstance();
  }

  static getInstance(): DoctorService {
    if (!DoctorService.instance) {
      DoctorService.instance = new DoctorService();
    }
    return DoctorService.instance;
  }

  // CRUD com validações
  async getAll(): Promise<Doctor[]> {
    return this.repository.findAll();
  }

  async getActive(): Promise<Doctor[]> {
    return this.repository.findActive();
  }

  async getById(id: string): Promise<Doctor | null> {
    return this.repository.findById(id);
  }

  async getBySpecialty(specialty: Specialty): Promise<Doctor[]> {
    return this.repository.findBySpecialty(specialty);
  }

  async create(data: DoctorData): Promise<Doctor> {
    // Validação: CRM único
    const existingCRM = this.repository.findByCRM(data.crm);
    if (existingCRM) {
      throw new Error("Já existe um médico cadastrado com este CRM");
    }

    const doctor = new Doctor(data);
    return this.repository.create(doctor);
  }

  async update(id: string, data: Partial<DoctorData>): Promise<Doctor> {
    const doctor = this.repository.findById(id);
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    // Validação: CRM único (exceto o próprio)
    if (data.crm) {
      const existingCRM = this.repository.findByCRM(data.crm);
      if (existingCRM && existingCRM.id !== id) {
        throw new Error("Este CRM já está em uso por outro médico");
      }
    }

    doctor.update(data);
    return this.repository.update(id, doctor)!;
  }

  async delete(id: string): Promise<boolean> {
    const doctor = this.repository.findById(id);
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    return this.repository.delete(id);
  }

  async toggleActive(id: string): Promise<Doctor> {
    const doctor = this.repository.findById(id);
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    doctor.active = !doctor.active;
    return this.repository.update(id, doctor)!;
  }

  // Gerenciamento de horários
  async updateTimeSlots(id: string, slots: TimeSlot[]): Promise<Doctor> {
    const doctor = this.repository.findById(id);
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    doctor.updateTimeSlots(slots);
    return this.repository.update(id, doctor)!;
  }

  async getAvailableTimes(
    id: string,
    date: Date,
    intervalMinutes: number = 30
  ): Promise<string[]> {
    const doctor = this.repository.findById(id);
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    const dayOfWeek = date.getDay();
    return doctor.getAvailableTimes(dayOfWeek, intervalMinutes);
  }

  // Busca
  async search(query: string): Promise<Doctor[]> {
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
