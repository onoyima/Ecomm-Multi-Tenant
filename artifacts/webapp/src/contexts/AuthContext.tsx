import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { auth, setAuthTokenGetter } from "@workspace/api-client-react";

export type UserRole = "customer" | "vendor" | "admin";

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
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "auth_token";

function mapApiUser(apiUser: any): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    avatar: apiUser.avatar,
    walletBalance: apiUser.walletBalance ?? apiUser.wallet_balance,
    businessName: apiUser.businessName ?? apiUser.business_name ?? apiUser.vendor?.shop_name,
    kycStatus: apiUser.kycStatus ?? apiUser.kyc_status,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthTokenGetter(async () => localStorage.getItem(STORAGE_KEY));
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEY);
        if (token) {
          const me = await auth.me();
          setUser(mapApiUser((me as any).data ?? me));
        }
      } catch (err) {
        console.error("Session restore failed:", err);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string = "password") => {
    // We default password to "password" to support the "Quick Login" buttons in demo
    const res = await auth.login({ email, password });
    const data = (res as any).data ?? res;
    if (data.token) {
      localStorage.setItem(STORAGE_KEY, data.token);
    }
    const userData = data.user ?? (await auth.me()).data;
    setUser(mapApiUser(userData));
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const res = await auth.register({ name, email, password, password_confirmation: password });
    const data = (res as any).data ?? res;
    if (data.token) {
      localStorage.setItem(STORAGE_KEY, data.token);
    }
    const userData = data.user ?? (await auth.me()).data;
    setUser(mapApiUser(userData));
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch {}
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = useCallback((role: UserRole) => {
    if (!user) return;
    const u = { ...user, role };
    setUser(u);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
