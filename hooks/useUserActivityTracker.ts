import { getAPICallDelay, waitForCSRF } from '@/utils/csrf';
import axios from 'axios';
import { useEffect, useRef } from 'react';

interface UseUserActivityTrackerProps {
    enabled?: boolean;
    updateInterval?: number; // in milliseconds
}

/**
 * Custom hook to automatically track user activity
 * This will ping the server periodically to update user's online presence
 */
export const useUserActivityTracker = ({
    enabled = true,
    updateInterval = 60000, // 1 minute default
}: UseUserActivityTrackerProps = {}) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const initialTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const isActiveRef = useRef<boolean>(true);
    const isMountedRef = useRef<boolean>(true);

    const updateActivity = async () => {
        if (!enabled || !isActiveRef.current || !isMountedRef.current) return;

        try {
            // Wait for CSRF to be ready before making the request
            await waitForCSRF();

            if (!isMountedRef.current) return;

            await axios.post('/api/user-activity');
            console.log('User activity updated successfully');
        } catch (error: any) {
            // Don't log 419 errors as they're handled by the interceptor
            if (error?.response?.status !== 419) {
                console.error('Failed to update user activity:', error);
            }
        }
    };

    const handleUserActivity = () => {
        lastActivityRef.current = Date.now();
        isActiveRef.current = true;
    };

    const handleVisibilityChange = () => {
        isActiveRef.current = !document.hidden;
        if (isActiveRef.current) {
            // User returned, update activity immediately
            updateActivity();
        }
    };

    const checkInactivity = () => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        // Consider user inactive after 5 minutes of no interaction
        if (timeSinceLastActivity > 5 * 60 * 1000) {
            isActiveRef.current = false;
        }
    };

    useEffect(() => {
        isMountedRef.current = true;

        if (!enabled) return;

        // Set up activity tracking
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        activityEvents.forEach((event) => {
            document.addEventListener(event, handleUserActivity, { passive: true });
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Add delay before initial activity update to allow CSRF token to settle after login
        const delay = getAPICallDelay();
        initialTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                updateActivity();
            }
        }, delay);

        // Set up periodic activity updates (starts after initial delay)
        setTimeout(() => {
            if (isMountedRef.current) {
                intervalRef.current = setInterval(() => {
                    checkInactivity();
                    updateActivity();
                }, updateInterval);
            }
        }, delay + 100);

        // Cleanup
        return () => {
            isMountedRef.current = false;

            activityEvents.forEach((event) => {
                document.removeEventListener(event, handleUserActivity);
            });

            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (initialTimerRef.current) {
                clearTimeout(initialTimerRef.current);
            }

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, updateInterval]);

    const manualUpdate = () => {
        updateActivity();
    };

    return { manualUpdate };
};
