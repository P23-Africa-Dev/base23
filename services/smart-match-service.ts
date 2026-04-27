import type {
    AcceptSmartMatchRequest,
    AcceptSmartMatchResponse,
    CompatibilityResponse,
    MatchResult,
    PreferencesResponse,
    RecentNetworkResponse,
    SendSmartMatchRequest,
    SendSmartMatchResponse,
    SmartMatchesResponse,
    SmartMatchPreferences,
} from '@/types/smart-match';
import axios from 'axios';

// Python FastAPI Smart Match API
const SMART_MATCH_API_BASE = 'http://127.0.0.1:3100/api/smart-match';

// Store user ID - will be set by hook or component
let currentUserId: number = 0;

/**
 * Set the current user ID for API calls
 */
export const setCurrentUserId = (userId: number) => {
    currentUserId = userId;
};

/**
 * Get the current user ID
 */
const getUserId = (): number => {
    if (currentUserId > 0) {
        return currentUserId;
    }

    // Fallback: Try to get from DOM
    if (typeof window !== 'undefined') {
        // Try Inertia data attribute on root element
        const rootEl = document.getElementById('app');
        if (rootEl) {
            const dataPage = rootEl.getAttribute('data-page');
            if (dataPage) {
                try {
                    const pageData = JSON.parse(dataPage);
                    if (pageData?.props?.auth?.user?.id) {
                        currentUserId = pageData.props.auth.user.id;
                        return currentUserId;
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }

        // Try meta tag
        const metaUserId = document.querySelector('meta[name="user-id"]')?.getAttribute('content');
        if (metaUserId) {
            currentUserId = parseInt(metaUserId, 10);
            return currentUserId;
        }
    }

    return 0;
};

/**
 * Smart Match API Service
 * Handles all smart match related API calls to Python FastAPI backend
 */
export const SmartMatchService = {
    /**
     * Get smart matches for the current user
     */
    async getMatches(limit: number = 20): Promise<SmartMatchesResponse> {
        try {
            const response = await axios.get<SmartMatchesResponse>(`${SMART_MATCH_API_BASE}/matches`, {
                params: { limit },
                headers: { 'X-User-Id': getUserId() },
            });
            // Debug log to see raw API response
            console.log('SmartMatchService.getMatches - Raw API response:', response.data);
            if (response.data?.matches?.[0]) {
                console.log('First match user_needs:', response.data.matches[0].user_needs);
            }
            // Ensure matches is always an array
            return {
                ...response.data,
                matches: response.data?.matches || [],
            };
        } catch (error) {
            console.error('Error fetching smart matches:', error);
            // Return empty response on error
            return {
                success: false,
                matches: [],
                total_count: 0,
                has_preferences: false,
                message: 'Failed to fetch matches',
            };
        }
    },

    /**
     * Get current user's smart match preferences
     */
    async getPreferences(): Promise<PreferencesResponse> {
        try {
            const response = await axios.get<PreferencesResponse>(`${SMART_MATCH_API_BASE}/preferences`, {
                headers: { 'X-User-Id': getUserId() },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching preferences:', error);
            return {
                success: false,
                preferences: null,
                message: 'Failed to fetch preferences',
            };
        }
    },

    /**
     * Save a single preference (partial update)
     */
    async savePreference(preference: Partial<SmartMatchPreferences>): Promise<PreferencesResponse> {
        try {
            const response = await axios.post<PreferencesResponse>(`${SMART_MATCH_API_BASE}/preferences`, preference, {
                headers: { 'X-User-Id': getUserId() },
            });
            return response.data;
        } catch (error) {
            console.error('Error saving preference:', error);
            return {
                success: false,
                preferences: null,
                message: 'Failed to save preference',
            };
        }
    },

    /**
     * Save all preferences at once (from 3-step setup flow)
     */
    async saveAllPreferences(preferences: SmartMatchPreferences): Promise<PreferencesResponse> {
        try {
            const response = await axios.post<PreferencesResponse>(`${SMART_MATCH_API_BASE}/preferences/all`, preferences, {
                headers: { 'X-User-Id': getUserId() },
            });
            return response.data;
        } catch (error) {
            console.error('Error saving all preferences:', error);
            return {
                success: false,
                preferences: null,
                message: 'Failed to save preferences',
            };
        }
    },

    /**
     * Clear/reset all preferences
     */
    async clearPreferences(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await axios.delete<{ success: boolean; message: string }>(`${SMART_MATCH_API_BASE}/preferences`, {
                headers: { 'X-User-Id': getUserId() },
            });
            return response.data;
        } catch (error) {
            console.error('Error clearing preferences:', error);
            return {
                success: false,
                message: 'Failed to clear preferences',
            };
        }
    },

    /**
     * Match with a user (sends connection request and creates/finds conversation)
     */
    async matchUser(matchedUserId: number): Promise<MatchResult> {
        try {
            const response = await axios.post<MatchResult>(
                `${SMART_MATCH_API_BASE}/match`,
                {
                    matched_user_id: matchedUserId,
                },
                {
                    headers: { 'X-User-Id': getUserId() },
                },
            );
            return response.data;
        } catch (error) {
            console.error('Error matching user:', error);
            return {
                success: false,
                connection_id: null,
                conversation_id: null,
                connection_status: 'error',
                message: 'Failed to match with user',
            };
        }
    },

    /**
     * Get compatibility with a specific user
     */
    async getCompatibility(targetUserId: number): Promise<CompatibilityResponse> {
        try {
            const response = await axios.get<CompatibilityResponse>(`${SMART_MATCH_API_BASE}/compatibility/${targetUserId}`, {
                headers: { 'X-User-Id': getUserId() },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching compatibility:', error);
            return {
                success: false,
                compatibility: 0,
                breakdown: {
                    industry_match: 0,
                    business_level_match: 0,
                    tags_match: 0,
                    needs_match: 0,
                    role_match: 0,
                    company_stage_match: 0,
                    geography_match: 0,
                },
                reasons: [],
            };
        }
    },

    /**
     * Get recent network (recently connected users)
     */
    async getRecentNetwork(limit: number = 10): Promise<RecentNetworkResponse> {
        try {
            const response = await axios.get<RecentNetworkResponse>(`${SMART_MATCH_API_BASE}/recent-network`, {
                params: { limit },
                headers: { 'X-User-Id': getUserId() },
            });
            // Ensure connections is always an array
            return {
                ...response.data,
                connections: response.data?.connections || [],
            };
        } catch (error) {
            console.error('Error fetching recent network:', error);
            return {
                success: false,
                connections: [],
                total_count: 0,
            };
        }
    },

    /**
     * Send a smart match card to another user (creates notification for recipient)
     */
    async sendSmartMatch(request: SendSmartMatchRequest): Promise<SendSmartMatchResponse> {
        try {
            const response = await axios.post<SendSmartMatchResponse>(`${SMART_MATCH_API_BASE}/send-match`, request, {
                headers: { 'X-User-Id': getUserId() },
            });
            return response.data;
        } catch (error) {
            console.error('Error sending smart match:', error);
            return {
                success: false,
                message: 'Failed to send smart match notification',
            };
        }
    },

    /**
     * Accept a smart match from a notification and start a conversation
     */
    async acceptSmartMatch(request: AcceptSmartMatchRequest): Promise<AcceptSmartMatchResponse> {
        try {
            const response = await axios.post<AcceptSmartMatchResponse>(`${SMART_MATCH_API_BASE}/accept-match`, request, {
                headers: { 'X-User-Id': getUserId() },
            });
            return response.data;
        } catch (error) {
            console.error('Error accepting smart match:', error);
            return {
                success: false,
                message: 'Failed to accept smart match',
            };
        }
    },
};

export default SmartMatchService;
