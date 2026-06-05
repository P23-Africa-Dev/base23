'use client';

import { useEffect } from 'react';
import { useOnboarding } from '@/components/OnboardingContext';

type Props = {
  needsOnboarding?: boolean;
  onCompleted?: () => void;
};

export default function OnboardingActivator({
  needsOnboarding,
  onCompleted,
}: Props) {
  const { openModal, completed, resetOnboarding } = useOnboarding();

  // Trigger onboarding if the server says we need it
  useEffect(() => {
    if (needsOnboarding) {
      // If localStorage says completed but server says we need onboarding,
      // reset the localStorage state — server is the source of truth
      if (completed) {
        resetOnboarding();
      } else {
        openModal();
      }
    }
  }, [needsOnboarding, completed, openModal, resetOnboarding]);

  // Notify dashboard when onboarding finishes
  useEffect(() => {
    if (completed && onCompleted) {
      onCompleted();
    }
  }, [completed, onCompleted]);

  return null;
}
