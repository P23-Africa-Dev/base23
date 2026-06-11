'use client';

import { createContext, useContext } from 'react';
import type { MessagingState } from '@/hooks/useMessaging';

const MessagingContext = createContext<MessagingState | null>(null);

export function useMessagingCtx(): MessagingState {
    const ctx = useContext(MessagingContext);
    if (!ctx) throw new Error('useMessagingCtx must be used inside MessagingProvider');
    return ctx;
}

export { MessagingContext };
