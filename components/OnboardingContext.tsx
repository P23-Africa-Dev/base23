'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type OnboardingContextType = {
  open: boolean;
  completed: boolean;
  openModal: () => void;
  closeModal: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STORAGE_KEY = 'noel:onboarding:completed';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompleted(true);
      }
    } catch {
      // silently fail (private mode / blocked storage)
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist completion
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (completed) {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch {
      // ignore storage failures
    }
  }, [completed, hydrated]);

  return (
    <OnboardingContext.Provider
      value={{
        open,
        completed,
        openModal: () => {
          //  Hard guard: never reopen once completed
          if (!completed && hydrated) {
            setOpen(true);
          }
        },
        closeModal: () => setOpen(false),
        completeOnboarding: () => {
          setCompleted(true);
          setOpen(false);
        },
        resetOnboarding: () => {
          // Server says user needs onboarding — clear localStorage flag and reopen
          setCompleted(false);
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
          setOpen(true);
        },
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used inside OnboardingProvider');
  }
  return ctx;
}
