import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { useUserActivityTracker } from '@/hooks/useUserActivityTracker';
import { SubscriptionRenewalModal } from '@/components/modals/subscription-renewal-modal';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default ({ children }: AppLayoutProps) => {
    const { user, subscription } = useAuth();
    const pathname = usePathname();

    useUserActivityTracker({
        enabled: true,
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
};