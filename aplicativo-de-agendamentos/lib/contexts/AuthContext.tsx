"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AuthService } from "../services/AuthService";
import { SafeUserJSON, UserRole } from "../models/User";
import { initializeDemoData } from "../demo-data";

interface AuthContextType {
  user: SafeUserJSON | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUserJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = AuthService.getInstance();

  // Inicializar dados de demonstração e verificar sessão
  useEffect(() => {
    initializeDemoData();
    
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, [authService]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const loggedUser = await authService.login(email, password);
        setUser(loggedUser);
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, [authService]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;

      const permissionMap: Record<UserRole, string[]> = {
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

      return permissionMap[user.role]?.includes(permission) ?? false;
    },
    [user]
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      return user.role === role;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
