import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "@auth_token";

function mapApiUser(apiUser: any): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    avatar: apiUser.avatar,
    walletBalance: apiUser.walletBalance ?? apiUser.wallet_balance,
    businessName: apiUser.businessName ?? apiUser.business_name,
    kycStatus: apiUser.kycStatus ?? apiUser.kyc_status,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure auth token getter from stored token
  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return await AsyncStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    });
  }, []);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEY);
        if (token) {
          const me = await auth.me();
          setUser(mapApiUser((me as any).data ?? me));
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login({ email, password });
    const data = (res as any).data ?? res;
    if (data.token) {
      await AsyncStorage.setItem(STORAGE_KEY, data.token);
    }
    const userData = data.user ?? (await auth.me()).data;
    setUser(mapApiUser(userData));
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const res = await auth.register({ name, email, password, passwordConfirmation: password });
    const data = (res as any).data ?? res;
    if (data.token) {
      await AsyncStorage.setItem(STORAGE_KEY, data.token);
    }
    const userData = data.user ?? (await auth.me()).data;
    setUser(mapApiUser(userData));
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch {}
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
