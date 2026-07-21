import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "customer" | "vendor" | "admin" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  walletBalance?: number;
  businessName?: string;
  kycStatus?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const MOCK_USERS: Record<string, User> = {
  "customer@demo.com": { id: "u1", name: "Chidi Okafor", email: "customer@demo.com", role: "customer", walletBalance: 15000, kycStatus: "verified" },
  "vendor@demo.com": { id: "u2", name: "Adaeze Fashion", email: "vendor@demo.com", role: "vendor", businessName: "Adaeze Fashion Hub", walletBalance: 84500, kycStatus: "verified" },
  "admin@demo.com": { id: "u3", name: "Platform Admin", email: "admin@demo.com", role: "admin", walletBalance: 0 },
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email: string) => {
    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (!mockUser) throw new Error("Invalid credentials");
    setUser(mockUser);
    localStorage.setItem("auth_user", JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("auth_user");
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem("auth_user", JSON.stringify(updated));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
