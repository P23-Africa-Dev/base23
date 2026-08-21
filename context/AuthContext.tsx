"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, SharedData } from "@/types";
import axios from "@/lib/axios-config";

interface AuthContextValue {
  user: User | null;
  subscription: SharedData["subscription"] | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  subscription: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SharedData["subscription"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/user");
      const userData = response.data.data || response.data;
      setUser(userData);
      setSubscription(userData.subscription || null);
      
      // Set Edge authentication helper cookie
      if (typeof window !== "undefined") {
        document.cookie = "noel_authenticated=true; path=/; max-age=2592000; SameSite=Lax; Secure";
      }
    } catch (err) {
      setUser(null);
      setSubscription(null);
      
      // Clear Edge authentication helper cookie
      if (typeof window !== "undefined") {
        document.cookie = "noel_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F0E9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-pinkLight border-[#0B1727]/10" />
          <p className="text-sm font-medium text-[#0B1727]/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, subscription, loading, refresh: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

