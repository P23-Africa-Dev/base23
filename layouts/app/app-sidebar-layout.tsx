// 'use client';

// import { AppContent } from '@/components/app-content';
// import { AppShell } from '@/components/app-shell';
// import { AppSidebar } from '@/components/app-sidebar';
// import { TooltipProvider } from '@/components/ui/tooltip';

// export default function Layout({ children }: { children: React.ReactNode }) {
//     return (
//         <AppShell defaultSidebarOpen={true}>
//             <div className="flex relative z-0">
//                 <AppSidebar />
//                 <TooltipProvider delayDuration={100}>
//                     <AppContent>{children}</AppContent>
//                 </TooltipProvider>
//             </div>
//         </AppShell>
//     );
// }

'use client';

import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { StepModal } from '@/components/modals/dashboard-steps-modal';
import { OnboardingProvider, useOnboarding } from '@/components/OnboardingContext';
import { TooltipProvider } from '@/components/ui/tooltip';

function GlobalModals() {
    const { open, closeModal } = useOnboarding();
    return <StepModal open={open} onClose={closeModal} />;
}

export default function AppLayoutTemplate({ children }: { children: React.ReactNode }) {
    return (
        <OnboardingProvider>
            <AppShell defaultSidebarOpen>
                <div className="flex">
                    <AppSidebar />
                    <TooltipProvider delayDuration={100}>
                        <AppContent>{children}</AppContent>
                    </TooltipProvider>
                </div>

                {/*  GLOBAL OVERLAY ROOT */}
                <div id="overlay-root" />

                {/*  GLOBAL ONBOARDING MODAL */}
                <GlobalModals />
            </AppShell>
        </OnboardingProvider>
    );
}
