import { BaseRepository } from "./BaseRepository";
import { User, UserJSON, UserRole } from "../models/User";

/**
 * UserRepository - Repositório para usuários
 * Herda de BaseRepository e adiciona métodos específicos
 */
export class UserRepository extends BaseRepository<User, UserJSON> {
  private static instance: UserRepository;

  private constructor() {
    super("clinic_users");
  }

  // Singleton pattern
  static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  protected fromJSON(json: UserJSON): User {
    return User.fromJSON(json);
  }

  protected toJSON(item: User): UserJSON {
    return item.toJSON();
  }

  // Métodos específicos de busca
  findByEmail(email: string): User | null {
    const users = this.findAll();
    return (
      users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
    );
  }

  findByRole(role: UserRole): User[] {
    const users = this.findAll();
    return users.filter((u) => u.role === role);
  }

  findActive(): User[] {
    const users = this.findAll();
    return users.filter((u) => u.active);
  }

  // Autenticação
  authenticate(email: string, password: string): User | null {
    const user = this.findByEmail(email);
    
    if (!user || !user.active) {
      return null;
    }

    if (!user.validatePassword(password)) {
      return null;
    }

    // Registra o login
    user.recordLogin();
    this.update(user.id, user);

    return user;
  }

  // Verifica se email já existe
  emailExists(email: string, excludeId?: string): boolean {
    const user = this.findByEmail(email);
    if (!user) return false;
    return user.id !== excludeId;
  }

  // Estatísticas
  getStatistics(): UserStatistics {
    const users = this.findAll();
    const activeUsers = users.filter((u) => u.active);

    const byRole: Record<UserRole, number> = {
      admin: 0,
      doctor: 0,
      receptionist: 0,
    };

    users.forEach((u) => {
      byRole[u.role]++;
    });

    return {
      total: users.length,
      active: activeUsers.length,
      inactive: users.length - activeUsers.length,
      byRole,
    };
  }
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
}
