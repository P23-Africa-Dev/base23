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
import { TEMP_AUTH_BYPASS } from "@/lib/temp-auth-bypass";

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const isBypassActive = (): boolean => {
  const isAllowed =
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
    process.env.NODE_ENV === "development";

  if (!isAllowed) return false;

  if (typeof window !== "undefined") {
    const override = getCookie("base23_bypass_auth_override");
    if (override === "enforced") return false;
  }
  return true;
};

const MOCK_USER: User = {
  id: 23,
  name: "Test PM User",
  email: "pm@base23.com",
  company_name: "PM Review Corp",
  company_description: "A sandbox space for product verification.",
  industry: "Technology",
  phone: "+1234567890",
  linkedin: "https://linkedin.com/in/pm-base23",
  country: "Nigeria",
  position: "Product Manager",
  years_of_operation: "3-5 years",
  number_of_employees: "11-50",
  selected_outcome: "Hire agents",
  goals: "Evaluate UI layouts and referral pipelines",
  categories: "Sales & Marketing",
  great_at: ["Product Demos", "UI UX Feedback"],
  can_help_with: ["Market Entry"],
  email_verified_at: "2026-08-27T03:00:00.000Z",
  is_admin: false,
  account_type: "company",
  created_at: "2026-08-27T03:00:00.000Z",
  updated_at: "2026-08-27T03:00:00.000Z",
};

const MOCK_SUBSCRIPTION: SharedData["subscription"] = {
  is_active: true,
  on_trial: true,
  status: "active",
  trial_days_remaining: 14,
  trial_ends_at: null,
  current_period_end: null,
};

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
  // TEMPORARY: skip auth loading gate while UI-review bypass is on
  const [loading, setLoading] = useState<boolean>(!TEMP_AUTH_BYPASS);

  const fetchUser = async () => {
    if (isBypassActive()) {
      setUser(MOCK_USER);
      setSubscription(MOCK_SUBSCRIPTION);
      if (typeof window !== "undefined") {
        document.cookie = "base23_authenticated=true; path=/; max-age=2592000; SameSite=Lax; Secure";
      }
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/user");
      const userData = response.data.data || response.data;
      setUser(userData);
      setSubscription(userData.subscription || null);
      
      // Set Edge authentication helper cookie
      if (typeof window !== "undefined") {
        document.cookie = "base23_authenticated=true; path=/; max-age=2592000; SameSite=Lax; Secure";
      }
    } catch (err) {
      setUser(null);
      setSubscription(null);
      
      // Clear Edge authentication helper cookie
      if (typeof window !== "undefined") {
        document.cookie = "base23_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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

