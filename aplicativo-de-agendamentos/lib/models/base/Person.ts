import { Entity } from "./Entity";

/**
 * Classe abstrata Person - herda de Entity
 * Implementa HERANÇA - classe base para Patient e Doctor
 */
export abstract class Person extends Entity {
  protected _name: string;
  protected _email: string;
  protected _phone: string;
  protected _cpf: string;

  constructor(data: PersonData, id?: string) {
    super(id);
    this._name = data.name;
    this._email = data.email;
    this._phone = data.phone;
    this._cpf = data.cpf;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get fullName(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get phone(): string {
    return this._phone;
  }

  get cpf(): string {
    return this._cpf;
  }

  // Setters com validação - encapsulamento
  set name(value: string) {
    if (!value || value.trim().length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }
    this._name = value.trim();
    this.touch();
  }

  set email(value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error("Email inválido");
    }
    this._email = value.toLowerCase().trim();
    this.touch();
  }

  set phone(value: string) {
    this._phone = this.formatPhone(value);
    this.touch();
  }

  // Métodos de validação - encapsulamento da lógica
  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected formatPhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  protected isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, "");
    return cleanCPF.length === 11;
  }

  // Método base para JSON - será estendido pelas subclasses
  toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      phone: this._phone,
      cpf: this._cpf,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}

// Interface para dados de criação
export interface PersonData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}
