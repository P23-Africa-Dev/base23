import axios from 'axios';

// Notification API base URL (Laravel backend)
const NOTIFICATION_API_BASE = '/api/notifications';

// Notification types matching backend
export type NotificationType = 'general' | 'deal_card' | 'connection' | 'security' | 'smart_match';

// Deal card direction - sent by user or received by user
export type DealCardDirection = 'sent' | 'received';

// Deal card status
export type DealCardStatus = 'pending' | 'viewed' | 'accepted' | 'rejected';

export interface NotificationSender {
    id: number;
    name: string;
    avatar: string | null;
    job_title?: string;
    company?: string;
    profile_picture?: string | null;
}

export interface NotificationRecipient {
    id: number;
    name: string;
    profile_picture?: string | null;
    position?: string;
    company_name?: string;
}

export interface DealCardData {
    id: number;
    title: string;
    deal_type: string;
    industry: string;
    description: string;
    timeline: string;
    geography: string;
    deal_value?: string;
    status: DealCardStatus;
    created_at: string;
    sender?: NotificationSender;
    recipient?: NotificationRecipient;
}

export interface SmartMatchData {
    sender_id: number;
    compatibility: number;
    match_reasons: string[];
    why_this_match: string | null;
    status: string;
    sender_name: string;
    sender_position: string | null;
    sender_company: string | null;
    sender_industry: string | null;
    sender_profile_picture: string | null;
    // Recipient's stated needs (what they asked for help with)
    recipient_needs: string | null;
    recipient_preferred_industry: string | null;
    recipient_selected_tags: string[] | null;
}

export interface Notification {
    id: number;
    title: string;
    subtitle: string;
    message: string;
    time: string;
    type: NotificationType;
    read: boolean;
    profilePicture?: string;
    // Deal card specific fields
    dealCardId?: number;
    dealCardDirection?: DealCardDirection;
    dealCardStatus?: DealCardStatus;
    dealCardData?: DealCardData;
    // Smart match specific fields
    smartMatchData?: SmartMatchData;
}

export interface NotificationGroup {
    type: NotificationType;
    label: string;
    count: number;
    notifications: Notification[];
}

export interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface NotificationsResponse {
    success: boolean;
    notifications: Notification[];
    pagination: PaginationInfo;
}

export interface GroupedNotificationsResponse {
    success: boolean;
    grouped: NotificationGroup[];
    general: Notification[];
}

export interface UnreadCountResponse {
    success: boolean;
    count: number;
    by_type: {
        general: number;
        deal_card: number;
        connection: number;
        security: number;
        smart_match: number;
    };
}

export interface NotificationStatsResponse {
    success: boolean;
    stats: {
        total: number;
        unread: number;
        by_type: {
            general: number;
            deal_card: number;
            connection: number;
            security: number;
            smart_match: number;
        };
    };
}

export interface ActionResponse {
    success: boolean;
    message: string;
    count?: number;
}

/**
 * Notification API Service
 * Handles all notification related API calls to Laravel backend
 */
export const NotificationService = {
    /**
     * Get all notifications with optional type filter
     */
    async getNotifications(type?: NotificationType, perPage: number = 50): Promise<NotificationsResponse> {
        try {
            const params: Record<string, string | number> = { per_page: perPage };
            if (type) {
                params.type = type;
            }

            const response = await axios.get<NotificationsResponse>(NOTIFICATION_API_BASE, { params });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            return {
                success: false,
                notifications: [],
                pagination: { current_page: 1, last_page: 1, per_page: perPage, total: 0 },
            };
        }
    },

    /**
     * Get notifications grouped by type
     */
    async getGroupedNotifications(): Promise<GroupedNotificationsResponse> {
        try {
            const response = await axios.get<GroupedNotificationsResponse>(`${NOTIFICATION_API_BASE}/grouped`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch grouped notifications:', error);
            return {
                success: false,
                grouped: [],
                general: [],
            };
        }
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<UnreadCountResponse> {
        try {
            const response = await axios.get<UnreadCountResponse>(`${NOTIFICATION_API_BASE}/unread-count`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
            return {
                success: false,
                count: 0,
                by_type: { general: 0, deal_card: 0, connection: 0, security: 0, smart_match: 0 },
            };
        }
    },

    /**
     * Get notification statistics
     */
    async getStats(): Promise<NotificationStatsResponse> {
        try {
            const response = await axios.get<NotificationStatsResponse>(`${NOTIFICATION_API_BASE}/stats`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notification stats:', error);
            return {
                success: false,
                stats: {
                    total: 0,
                    unread: 0,
                    by_type: { general: 0, deal_card: 0, connection: 0, security: 0, smart_match: 0 },
                },
            };
        }
    },

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId: number): Promise<ActionResponse> {
        try {
            const response = await axios.post<ActionResponse>(`${NOTIFICATION_API_BASE}/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            return { success: false, message: 'Failed to mark notification as read' };
        }
    },

    /**
     * Mark multiple notifications as read
     */
    async markMultipleAsRead(ids: number[]): Promise<ActionResponse> {
        try {
            const response = await axios.post<ActionResponse>(`${NOTIFICATION_API_BASE}/mark-read`, { ids });
            return response.data;
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
            return { success: false, message: 'Failed to mark notifications as read' };
        }
    },

    /**
     * Mark all notifications as read (optionally filter by type)
     */
    async markAllAsRead(type?: NotificationType): Promise<ActionResponse> {
        try {
            const params = type ? { type } : {};
            const response = await axios.post<ActionResponse>(`${NOTIFICATION_API_BASE}/mark-all-read`, null, { params });
            return response.data;
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            return { success: false, message: 'Failed to mark all notifications as read' };
        }
    },

    /**
     * Delete a single notification
     */
    async deleteNotification(notificationId: number): Promise<ActionResponse> {
        try {
            const response = await axios.delete<ActionResponse>(`${NOTIFICATION_API_BASE}/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to delete notification:', error);
            return { success: false, message: 'Failed to delete notification' };
        }
    },

    /**
     * Delete multiple notifications
     */
    async deleteMultiple(ids: number[]): Promise<ActionResponse> {
        try {
            const response = await axios.delete<ActionResponse>(`${NOTIFICATION_API_BASE}/delete-multiple`, {
                data: { ids },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to delete notifications:', error);
            return { success: false, message: 'Failed to delete notifications' };
        }
    },

    /**
     * Clear all notifications (optionally filter by type)
     */
    async clearAll(type?: NotificationType): Promise<ActionResponse> {
        try {
            const params = type ? { type } : {};
            const response = await axios.delete<ActionResponse>(`${NOTIFICATION_API_BASE}/clear-all`, { params });
            return response.data;
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            return { success: false, message: 'Failed to clear notifications' };
        }
    },
};

export default NotificationService;
