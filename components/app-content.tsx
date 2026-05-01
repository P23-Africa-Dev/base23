// resources/js/components/ui/sidebar/AppContent.tsx
import React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export const AppContent: React.FC<AppContentProps> = ({ children, className = '', ...props }) => {
    // const { open } = useSidebar(); // Commented out as it's not currently used

    // when sidebar collapsed we might want different padding
    return (
        <main {...props} className={`relative flex flex-col flex-1 min-w-0 overflow-x-hidden transition-all ${className}`}>
        {/* <main {...props} className={`relative overflow-hidden z-[1]  flex h-full w-full flex-1 flex-col gap-4  transition-all ${className}`}> */}
            {children}
        </main>
    );
};
