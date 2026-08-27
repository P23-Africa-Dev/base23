"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days = 30) => {
  if (typeof window === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; path=/${expires}; SameSite=Lax; Secure`;
};

const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export default function DevAuthToggle() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBypassed, setIsBypassed] = useState(true);

  // Only run on client and check if bypass is globally enabled in env or running in dev/preview envs
  const isEnvBypassEnabled =
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
    process.env.NODE_ENV === "development";

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const override = getCookie("base23_bypass_auth_override");
      // If override is explicitly set to enforced, it is not bypassed. Otherwise, it defaults to bypassed.
      setIsBypassed(override !== "enforced");
    }
  }, []);

  if (!isEnvBypassEnabled || !mounted) {
    return null;
  }

  const handleToggle = () => {
    const nextState = !isBypassed;
    setIsBypassed(nextState);

    if (nextState) {
      // Switch back to Bypassed mode
      setCookie("base23_bypass_auth_override", "bypassed");
      setCookie("base23_authenticated", "true");
    } else {
      // Enforce real auth checks
      setCookie("base23_bypass_auth_override", "enforced");
      deleteCookie("base23_authenticated");
    }

    // Force page reload so middleware and contexts re-evaluate cookie states immediately
    window.location.reload();
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center transition-all duration-300 ease-in-out font-sans ${
        isExpanded ? "w-80" : "w-12 hover:scale-105"
      }`}
    >
      {/* ─── Expand Button (Left side of expanded panel or floating button itself) ─── */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-colors cursor-pointer ${
            isBypassed
              ? "bg-[#0B1727]/90 border-[#27E6A7]/30 text-[#27E6A7]"
              : "bg-[#0B1727]/90 border-amber-500/30 text-amber-500"
          }`}
          title="Dev Auth Settings"
        >
          {isBypassed ? <ShieldCheck className="h-6 w-6 animate-pulse" /> : <ShieldAlert className="h-6 w-6" />}
        </button>
      ) : (
        <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B1727]/95 p-4 text-[#F3F0E9] shadow-2xl backdrop-blur-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              {isBypassed ? (
                <ShieldCheck className="h-5 w-5 text-[#27E6A7]" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              )}
              <span className="text-sm font-bold tracking-wide text-white">DEV AUTH SETTINGS</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="rounded-lg p-1 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-white/50 hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase">Authentication Mode</p>
                <p className="mt-0.5 text-sm font-medium">
                  {isBypassed ? (
                    <span className="text-[#27E6A7]">Bypassed (UI Test)</span>
                  ) : (
                    <span className="text-amber-500">Enforced (Normal)</span>
                  )}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isBypassed ? "bg-[#27E6A7]" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B1727] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isBypassed ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isBypassed && (
              <div className="mt-3.5 rounded-lg bg-white/5 p-2 text-[10px] text-white/70">
                <p className="font-semibold text-white/90">Mock User Active:</p>
                <p className="mt-0.5 font-mono">Name: Test PM User</p>
                <p className="font-mono">Email: pm@base23.com</p>
              </div>
            )}
          </div>

          {/* Footer Warning */}
          <div className="border-t border-white/5 pt-2.5 text-center text-[9px] font-medium text-white/40 tracking-wider">
            ENV MASTER SWITCH ACTIVE
          </div>
        </div>
      )}
    </div>
  );
}
