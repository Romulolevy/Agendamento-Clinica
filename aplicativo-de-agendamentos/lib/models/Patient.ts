import { Person, PersonData } from "./base/Person";

/**
 * Classe Patient - herda de Person
 * Representa um paciente da clínica
 */
export class Patient extends Person {
  private _birthDate: Date;
  private _address: Address;
  private _healthInsurance?: string;
  private _notes?: string;

  constructor(data: PatientData, id?: string) {
    super(data, id);
    this._birthDate = new Date(data.birthDate);
    this._address = data.address;
    this._healthInsurance = data.healthInsurance;
    this._notes = data.notes;

    // Restaurar datas se vindo do JSON
    if (data.createdAt) {
      this._createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt) {
      this._updatedAt = new Date(data.updatedAt);
    }
  }

  // Getters específicos de Patient
  get birthDate(): Date {
    return this._birthDate;
  }

  get address(): Address {
    return { ...this._address };
  }

  get healthInsurance(): string | undefined {
    return this._healthInsurance;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  // Setters
  set birthDate(value: Date) {
    if (value > new Date()) {
      throw new Error("Data de nascimento não pode ser no futuro");
    }
    this._birthDate = value;
    this.touch();
  }

  set address(value: Address) {
    this._address = value;
    this.touch();
  }

  set healthInsurance(value: string | undefined) {
    this._healthInsurance = value;
    this.touch();
  }

  set notes(value: string | undefined) {
    this._notes = value;
    this.touch();
  }

  // Método para calcular idade - comportamento específico
  getAge(): number {
    const today = new Date();
    const birth = this._birthDate;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  // Atualizar dados do paciente
  update(data: Partial<PatientUpdateData>): void {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.phone) this.phone = data.phone;
    if (data.birthDate) this.birthDate = new Date(data.birthDate);
    if (data.address) this.address = data.address;
    if (data.healthInsurance !== undefined) this.healthInsurance = data.healthInsurance;
    if (data.notes !== undefined) this.notes = data.notes;
  }

  // Override do método toJSON - POLIMORFISMO
  toJSON(): PatientJSON {
    return {
      ...super.toJSON(),
      birthDate: this._birthDate.toISOString(),
      address: this._address,
      healthInsurance: this._healthInsurance,
      notes: this._notes,
      age: this.getAge(),
    } as PatientJSON;
  }

  // Factory method para criar a partir de JSON
  static fromJSON(json: PatientJSON): Patient {
    return new Patient(
      {
        name: json.name as string,
        email: json.email as string,
        phone: json.phone as string,
        cpf: json.cpf as string,
        birthDate: json.birthDate,
        address: json.address,
        healthInsurance: json.healthInsurance,
        notes: json.notes,
        createdAt: json.createdAt as string,
        updatedAt: json.updatedAt as string,
      },
      json.id as string
    );
  }
}

// Interfaces
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PatientData extends PersonData {
  birthDate: string;
  address: Address;
  healthInsurance?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientUpdateData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: Address;
  healthInsurance?: string;
  notes?: string;
}

export interface PatientJSON extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: Address;
  healthInsurance?: string;
  notes?: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}
