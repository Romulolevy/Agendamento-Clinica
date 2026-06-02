/**
 * Interface base do Repository - define contrato para acesso a dados
 * Implementa o padrão Repository da POO
 */
export interface IRepository<T, TJSON> {
  findAll(): T[];
  findById(id: string): T | null;
  create(item: T): T;
  update(id: string, item: T): T | null;
  delete(id: string): boolean;
  count(): number;
}

/**
 * Classe abstrata BaseRepository
 * Implementa operações CRUD genéricas com localStorage
 */
export abstract class BaseRepository<T, TJSON> implements IRepository<T, TJSON> {
  protected storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  // Método abstrato para converter JSON para instância da classe
  protected abstract fromJSON(json: TJSON): T;

  // Método abstrato para converter instância para JSON
  protected abstract toJSON(item: T): TJSON;

  // Obtém todos os dados do localStorage
  protected getData(): TJSON[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Salva dados no localStorage
  protected setData(data: TJSON[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // CRUD Operations
  findAll(): T[] {
    const data = this.getData();
    return data.map((item) => this.fromJSON(item));
  }

  findById(id: string): T | null {
    const data = this.getData();
    const item = data.find((item) => (item as { id: string }).id === id);
    return item ? this.fromJSON(item) : null;
  }

  create(item: T): T {
    const data = this.getData();
    const json = this.toJSON(item);
    data.push(json);
    this.setData(data);
    return item;
  }

  update(id: string, item: T): T | null {
    const data = this.getData();
    const index = data.findIndex((d) => (d as { id: string }).id === id);
    
    if (index === -1) return null;
    
    data[index] = this.toJSON(item);
    this.setData(data);
    return item;
  }

  delete(id: string): boolean {
    const data = this.getData();
    const index = data.findIndex((d) => (d as { id: string }).id === id);
    
    if (index === -1) return false;
    
    data.splice(index, 1);
    this.setData(data);
    return true;
  }

  count(): number {
    return this.getData().length;
  }

  // Limpa todos os dados
  clear(): void {
    this.setData([]);
  }

  // Verifica se existe por ID
  exists(id: string): boolean {
    return this.findById(id) !== null;
  }
}
