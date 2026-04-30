"use client";

import "@/lib/axios-config";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
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
  user: null,
  subscription: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<
    SharedData["subscription"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const allowAnonymousFallback =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS === "true";

  const fetchAuth = async () => {
    try {
      const res = await axios.get("/api/me");
      setUser(res.data.user ?? null);
      setSubscription(res.data.subscription ?? null);
    } catch {
      if (allowAnonymousFallback) {
        setUser(guestUser);
        setSubscription(null);
      } else {
        setUser(null);
        setSubscription(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, subscription, loading, refresh: fetchAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
