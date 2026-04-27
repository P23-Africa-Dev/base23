import { getAPICallDelay, waitForCSRF } from '@/utils/csrf';
import axios from 'axios';
import { useEffect, useRef } from 'react';

interface UseMessageStatsProps {
    onStatsUpdate: (stats: any) => void;
    refreshInterval?: number;
    enabled?: boolean;
}

/**
 * Custom hook for managing message statistics with real-time updates
 */
export const useMessageStats = ({
    onStatsUpdate,
    refreshInterval = 30000, // 30 seconds default
    enabled = true,
}: UseMessageStatsProps) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const initialTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLoadingRef = useRef(false);
    const isMountedRef = useRef(true);

    const fetchMessageStats = async () => {
        if (isLoadingRef.current || !isMountedRef.current) return;

        isLoadingRef.current = true;
        try {
            // Wait for CSRF to be ready before making the request
            await waitForCSRF();

            if (!isMountedRef.current) return;

            const response = await axios.get('/api/message-stats');
            if (isMountedRef.current) {
                onStatsUpdate(response.data);
            }
        } catch (error: any) {
            // Don't log 419 errors as they're handled by the interceptor
            if (error?.response?.status !== 419) {
                console.error('Error fetching message stats:', error);
            }
        } finally {
            isLoadingRef.current = false;
        }
    };

    useEffect(() => {
        isMountedRef.current = true;

        if (!enabled) return;

        // Add delay before initial fetch to allow CSRF token to settle after login
        const delay = getAPICallDelay();
        initialTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                fetchMessageStats();
            }
        }, delay);

        // Set up interval for periodic updates (starts after initial delay)
        const intervalDelay = delay + 100;
        setTimeout(() => {
            if (isMountedRef.current) {
                intervalRef.current = setInterval(fetchMessageStats, refreshInterval);
            }
        }, intervalDelay);

        // Listen for visibility change to refresh when tab becomes active
        const handleVisibilityChange = () => {
            if (!document.hidden && enabled) {
                fetchMessageStats();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Listen for focus events to refresh when window regains focus
        const handleFocus = () => {
            if (enabled) {
                fetchMessageStats();
            }
        };

        window.addEventListener('focus', handleFocus);

        // Cleanup
        return () => {
            isMountedRef.current = false;
            if (initialTimerRef.current) {
                clearTimeout(initialTimerRef.current);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [enabled, refreshInterval]);

    // Manual refresh function
    const refreshStats = () => {
        fetchMessageStats();
    };

    return { refreshStats };
};
