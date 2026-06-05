"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { User, SharedData } from "@/types";

interface AuthContextValue {
  user: User | null;
  subscription: SharedData["subscription"] | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const guestUser: User = {
  id: 0,
  name: "Guest User",
  email: "guest@example.com",
  email_verified_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextValue>({
  user: guestUser,
  subscription: null,
  loading: false,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>(guestUser);
  const [subscription] = useState<SharedData["subscription"] | null>(null);

  return (
    <AuthContext.Provider
      value={{ user, subscription, loading: false, refresh: async () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
