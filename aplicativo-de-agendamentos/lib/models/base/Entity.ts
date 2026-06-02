/**
 * Classe abstrata base para todas as entidades do sistema
 * Implementa o princípio de ENCAPSULAMENTO da POO
 */
export abstract class Entity {
  protected _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id?: string) {
    this._id = id || this.generateId();
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters - encapsulamento dos dados
  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Método protegido para atualizar timestamp
  protected touch(): void {
    this._updatedAt = new Date();
  }

  // Gera ID único
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Método abstrato que deve ser implementado pelas subclasses
  abstract toJSON(): Record<string, unknown>;

  // Método para comparar entidades
  equals(other: Entity): boolean {
    return this._id === other._id;
  }
}
