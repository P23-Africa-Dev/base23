import type { Notification, NotificationType, UnreadCountResponse } from '@/services/notification-service';
import { NotificationService } from '@/services/notification-service';
import { useCallback, useEffect, useState } from 'react';

interface UseNotificationsOptions {
    autoFetch?: boolean;
    pollingInterval?: number; // in milliseconds, 0 to disable polling
    type?: NotificationType;
}

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    unreadByType: UnreadCountResponse['by_type'];
    loading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: (type?: NotificationType) => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    clearAll: (type?: NotificationType) => Promise<void>;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for managing notifications
 * Handles fetching, real-time updates, and CRUD operations
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
    const { autoFetch = true, pollingInterval = 30000, type } = options;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [unreadByType, setUnreadByType] = useState<UnreadCountResponse['by_type']>({
        general: 0,
        deal_card: 0,
        connection: 0,
        security: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await NotificationService.getNotifications(type);
            if (response.success) {
                setNotifications(response.notifications);
            } else {
                setError('Failed to fetch notifications');
            }
        } catch (err) {
            setError('Failed to fetch notifications');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [type]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await NotificationService.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.count);
                setUnreadByType(response.by_type);
            }
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, []);

    // Mark a notification as read
    const markAsRead = useCallback(
        async (id: number) => {
            try {
                const response = await NotificationService.markAsRead(id);
                if (response.success) {
                    // Update local state
                    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
                    // Refresh unread count
                    await fetchUnreadCount();
                }
            } catch (err) {
                console.error('Error marking notification as read:', err);
            }
        },
        [fetchUnreadCount],
    );

    // Mark all notifications as read
    const markAllAsRead = useCallback(
        async (filterType?: NotificationType) => {
            try {
                const response = await NotificationService.markAllAsRead(filterType);
                if (response.success) {
                    // Update local state
                    setNotifications((prev) =>
                        prev.map((n) => {
                            if (filterType && n.type !== filterType) return n;
                            return { ...n, read: true };
                        }),
                    );
                    // Refresh unread count
                    await fetchUnreadCount();
                }
            } catch (err) {
                console.error('Error marking all as read:', err);
            }
        },
        [fetchUnreadCount],
    );

    // Delete a notification
    const deleteNotification = useCallback(
        async (id: number) => {
            try {
                const response = await NotificationService.deleteNotification(id);
                if (response.success) {
                    // Remove from local state
                    setNotifications((prev) => prev.filter((n) => n.id !== id));
                    // Refresh unread count
                    await fetchUnreadCount();
                }
            } catch (err) {
                console.error('Error deleting notification:', err);
            }
        },
        [fetchUnreadCount],
    );

    // Clear all notifications
    const clearAll = useCallback(
        async (filterType?: NotificationType) => {
            try {
                const response = await NotificationService.clearAll(filterType);
                if (response.success) {
                    // Update local state
                    if (filterType) {
                        setNotifications((prev) => prev.filter((n) => n.type !== filterType));
                    } else {
                        setNotifications([]);
                    }
                    // Refresh unread count
                    await fetchUnreadCount();
                }
            } catch (err) {
                console.error('Error clearing notifications:', err);
            }
        },
        [fetchUnreadCount],
    );

    // Refetch both notifications and unread count
    const refetch = useCallback(async () => {
        await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    }, [fetchNotifications, fetchUnreadCount]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            refetch();
        }
    }, [autoFetch, refetch]);

    // Set up polling
    useEffect(() => {
        if (pollingInterval > 0) {
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, pollingInterval);

            return () => clearInterval(interval);
        }
    }, [pollingInterval, fetchUnreadCount]);

    // Listen for real-time notification events (via Echo/Reverb)
    useEffect(() => {
        // Check if Echo is available (Laravel Echo for WebSockets)
        if (typeof window !== 'undefined' && (window as any).Echo) {
            const echo = (window as any).Echo;

            // Get user ID from page props or DOM
            let userId: number | null = null;
            const rootEl = document.getElementById('app');
            if (rootEl) {
                const dataPage = rootEl.getAttribute('data-page');
                if (dataPage) {
                    try {
                        const pageData = JSON.parse(dataPage);
                        userId = pageData?.props?.auth?.user?.id;
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }

            if (userId) {
                // Subscribe to user's private notification channel
                const channel = echo.private(`user.${userId}.notifications`);

                channel.listen('.notification.new', (data: { notification: Notification; unread_count: number }) => {
                    // Add new notification to the top of the list
                    setNotifications((prev) => [data.notification, ...prev]);
                    setUnreadCount(data.unread_count);

                    // Update type-specific counts
                    setUnreadByType((prev) => ({
                        ...prev,
                        [data.notification.type]: prev[data.notification.type as keyof typeof prev] + 1,
                    }));
                });

                // Cleanup on unmount
                return () => {
                    echo.leave(`user.${userId}.notifications`);
                };
            }
        }
    }, []);

    return {
        notifications,
        unreadCount,
        unreadByType,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refetch,
    };
}

export default useNotifications;
