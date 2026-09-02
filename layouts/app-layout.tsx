'use client';

import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { useUserActivityTracker } from '@/hooks/useUserActivityTracker';
import { SubscriptionRenewalModal } from '@/components/modals/subscription-renewal-modal';
import { useAuth } from '@/context/AuthContext';
import { TEMP_AUTH_BYPASS } from '@/lib/temp-auth-bypass';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
    const { user, subscription } = useAuth();
    const pathname = usePathname();

    useUserActivityTracker({
        // Avoid unauthenticated 401 spam while UI-review bypass is on
        enabled: !TEMP_AUTH_BYPASS && !!user,
        updateInterval: 60000,
    });

    const shouldShowRenewalModal =
        !!user
        && !subscription?.is_active
        && ['expired', 'canceled', 'past_due'].includes(subscription?.status ?? '')
        && !pathname.startsWith('/subscription-required');

    return (
        <AppLayoutTemplate>
            <SubscriptionRenewalModal
                open={shouldShowRenewalModal}
                onClose={() => {
                    // Keep modal non-dismissible for expired subscriptions.
                }}
                onRenewed={() => {
                    window.location.reload();
                }}
            />
            {children}
        </AppLayoutTemplate>
    );
}

export default AppLayout;