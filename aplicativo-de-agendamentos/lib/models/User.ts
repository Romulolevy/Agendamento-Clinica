import { Entity } from "./base/Entity";

/**
 * Classe User - herda de Entity
 * Representa um usuário do sistema (autenticação)
 */
export class User extends Entity {
  private _name: string;
  private _email: string;
  private _password: string;
  private _role: UserRole;
  private _active: boolean;
  private _lastLogin?: Date;

  constructor(data: UserData, id?: string) {
    super(id);
    this._name = data.name;
    this._email = data.email.toLowerCase();
    this._password = data.password;
    this._role = data.role || "receptionist";
    this._active = data.active ?? true;
    this._lastLogin = data.lastLogin ? new Date(data.lastLogin) : undefined;

    // Restaurar datas se vindo do JSON
    if (data.createdAt) {
      this._createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt) {
      this._updatedAt = new Date(data.updatedAt);
    }
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get role(): UserRole {
    return this._role;
  }

  get active(): boolean {
    return this._active;
  }

  get lastLogin(): Date | undefined {
    return this._lastLogin;
  }

  // Setters
  set name(value: string) {
    if (!value || value.trim().length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }
    this._name = value.trim();
    this.touch();
  }

  set email(value: string) {
    this._email = value.toLowerCase();
    this.touch();
  }

  set role(value: UserRole) {
    this._role = value;
    this.touch();
  }

  set active(value: boolean) {
    this._active = value;
    this.touch();
  }

  // Métodos de autenticação
  validatePassword(password: string): boolean {
    return this._password === password;
  }

  changePassword(currentPassword: string, newPassword: string): boolean {
    if (!this.validatePassword(currentPassword)) {
      throw new Error("Senha atual incorreta");
    }

    if (newPassword.length < 6) {
      throw new Error("Nova senha deve ter pelo menos 6 caracteres");
    }

    this._password = newPassword;
    this.touch();
    return true;
  }

  recordLogin(): void {
    this._lastLogin = new Date();
    this.touch();
  }

  // Verifica permissões baseadas na role
  hasPermission(permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[this._role];
    return permissions.includes(permission);
  }

  canAccessRoute(route: string): boolean {
    // Admin pode acessar tudo
    if (this._role === "admin") return true;

    // Rotas restritas por role
    const restrictedRoutes: Record<UserRole, string[]> = {
      admin: [],
      doctor: ["/pacientes/novo", "/medicos/novo", "/medicos/[id]"],
      receptionist: ["/medicos/novo", "/medicos/[id]"],
    };

    return !restrictedRoutes[this._role].some((r) =>
      route.startsWith(r.replace("[id]", ""))
    );
  }

  // Override toJSON
  toJSON(): UserJSON {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      password: this._password,
      role: this._role,
      active: this._active,
      lastLogin: this._lastLogin?.toISOString(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  // Versão segura sem senha
  toSafeJSON(): SafeUserJSON {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      role: this._role,
      active: this._active,
      lastLogin: this._lastLogin?.toISOString(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  // Factory method
  static fromJSON(json: UserJSON): User {
    return new User(
      {
        name: json.name,
        email: json.email,
        password: json.password,
        role: json.role,
        active: json.active,
        lastLogin: json.lastLogin,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
      },
      json.id
    );
  }
}

// Tipos e interfaces
export type UserRole = "admin" | "doctor" | "receptionist";

export type Permission =
  | "view_patients"
  | "create_patients"
  | "edit_patients"
  | "delete_patients"
  | "view_doctors"
  | "create_doctors"
  | "edit_doctors"
  | "delete_doctors"
  | "view_appointments"
  | "create_appointments"
  | "edit_appointments"
  | "delete_appointments"
  | "view_reports"
  | "manage_users";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  doctor: "Médico",
  receptionist: "Recepcionista",
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view_patients",
    "create_patients",
    "edit_patients",
    "delete_patients",
    "view_doctors",
    "create_doctors",
    "edit_doctors",
    "delete_doctors",
    "view_appointments",
    "create_appointments",
    "edit_appointments",
    "delete_appointments",
    "view_reports",
    "manage_users",
  ],
  doctor: [
    "view_patients",
    "edit_patients",
    "view_doctors",
    "view_appointments",
    "edit_appointments",
    "view_reports",
  ],
  receptionist: [
    "view_patients",
    "create_patients",
    "edit_patients",
    "view_doctors",
    "view_appointments",
    "create_appointments",
    "edit_appointments",
  ],
};

export interface UserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  active?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserJSON {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafeUserJSON {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
