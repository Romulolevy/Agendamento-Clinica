import { User, UserData, SafeUserJSON } from "../models/User";
import { UserRepository } from "../repositories/UserRepository";

/**
 * AuthService - Serviço de autenticação
 */
export class AuthService {
  private static instance: AuthService;
  private repository: UserRepository;
  private readonly SESSION_KEY = "clinic_session";

  private constructor() {
    this.repository = UserRepository.getInstance();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Autenticação
  async login(email: string, password: string): Promise<SafeUserJSON> {
    const user = this.repository.authenticate(email, password);

    if (!user) {
      throw new Error("Email ou senha inválidos");
    }

    // Salvar sessão
    this.saveSession(user.toSafeJSON());

    return user.toSafeJSON();
  }

  async logout(): Promise<void> {
    this.clearSession();
  }

  async register(data: UserData): Promise<SafeUserJSON> {
    // Validar email único
    if (this.repository.emailExists(data.email)) {
      throw new Error("Este email já está em uso");
    }

    // Validar senha
    if (data.password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    const user = new User(data);
    const created = this.repository.create(user);

    return created.toSafeJSON();
  }

  // Sessão
  getCurrentUser(): SafeUserJSON | null {
    return this.getSession();
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  private saveSession(user: SafeUserJSON): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  }

  private getSession(): SafeUserJSON | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(this.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }

  private clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Gerenciamento de usuários (admin)
  async getAllUsers(): Promise<SafeUserJSON[]> {
    const users = this.repository.findAll();
    return users.map((u) => u.toSafeJSON());
  }

  async getUserById(id: string): Promise<SafeUserJSON | null> {
    const user = this.repository.findById(id);
    return user ? user.toSafeJSON() : null;
  }

  async updateUser(id: string, data: Partial<UserData>): Promise<SafeUserJSON> {
    const user = this.repository.findById(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (data.name) user.name = data.name;
    if (data.email) {
      if (this.repository.emailExists(data.email, id)) {
        throw new Error("Este email já está em uso");
      }
      user.email = data.email;
    }
    if (data.role) user.role = data.role;
    if (data.active !== undefined) user.active = data.active;

    const updated = this.repository.update(id, user)!;
    return updated.toSafeJSON();
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = this.repository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const success = user.changePassword(currentPassword, newPassword);
    if (success) {
      this.repository.update(userId, user);
    }

    return success;
  }
}
