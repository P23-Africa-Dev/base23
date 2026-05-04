import SmartMatchService, { setCurrentUserId } from '@/services/smart-match-service';
import type { MatchResult, RecentNetworkUser, SmartMatchPreferences, SmartMatchUser } from '@/types/smart-match';
import { useCallback, useEffect, useState } from 'react';

interface UseSmartMatchReturn {
    // Data
    matches: SmartMatchUser[];
    preferences: SmartMatchPreferences | null;
    recentNetwork: RecentNetworkUser[];
    preferencesSet: boolean;

    // Loading states
    isLoadingMatches: boolean;
    isLoadingPreferences: boolean;
    isLoadingRecentNetwork: boolean;
    isMatching: boolean;
    isSavingPreferences: boolean;

    // Error states
    matchesError: string | null;
    preferencesError: string | null;
    recentNetworkError: string | null;

    // Actions
    fetchMatches: (limit?: number) => Promise<void>;
    fetchPreferences: () => Promise<void>;
    fetchRecentNetwork: (limit?: number) => Promise<void>;
    savePreference: (preference: Partial<SmartMatchPreferences>) => Promise<boolean>;
    saveAllPreferences: (preferences: SmartMatchPreferences) => Promise<boolean>;
    clearPreferences: () => Promise<boolean>;
    matchWithUser: (userId: number) => Promise<MatchResult | null>;
    refreshAll: () => Promise<void>;
}

/**
 * Custom hook for smart match functionality
 */
export function useSmartMatch(authUserId: number = 0): UseSmartMatchReturn {

    // Data state
    const [matches, setMatches] = useState<SmartMatchUser[]>([]);
    const [preferences, setPreferences] = useState<SmartMatchPreferences | null>(null);
    const [recentNetwork, setRecentNetwork] = useState<RecentNetworkUser[]>([]);
    const [preferencesSet, setPreferencesSet] = useState(false);

    // Loading states
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
    const [isLoadingRecentNetwork, setIsLoadingRecentNetwork] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);

    // Error states
    const [matchesError, setMatchesError] = useState<string | null>(null);
    const [preferencesError, setPreferencesError] = useState<string | null>(null);
    const [recentNetworkError, setRecentNetworkError] = useState<string | null>(null);

    /**
     * Fetch smart matches
     */
    const fetchMatches = useCallback(async (limit: number = 20) => {
        setIsLoadingMatches(true);
        setMatchesError(null);

        try {
            const response = await SmartMatchService.getMatches(limit);
            if (response.success && response.matches) {
                setMatches(response.matches);
                setPreferencesSet(response.has_preferences ?? false);
            } else {
                // API returned but with no data
                setMatches([]);
                setPreferencesSet(false);
            }
        } catch (error: any) {
            setMatchesError(error.response?.data?.error || 'Failed to fetch matches');
            setMatches([]);
            console.error('Error fetching matches:', error);
        } finally {
            setIsLoadingMatches(false);
        }
    }, []);

    /**
     * Fetch user preferences
     */
    const fetchPreferences = useCallback(async () => {
        setIsLoadingPreferences(true);
        setPreferencesError(null);

        try {
            const response = await SmartMatchService.getPreferences();
            if (response.success && response.preferences) {
                setPreferences(response.preferences);
                setPreferencesSet(
                    !!(
                        response.preferences.preferred_role ||
                        response.preferences.preferred_company_stage ||
                        response.preferences.preferred_geography
                    ),
                );
            } else {
                setPreferences(null);
                setPreferencesSet(false);
            }
        } catch (error: any) {
            setPreferencesError(error.response?.data?.error || 'Failed to fetch preferences');
            setPreferences(null);
            console.error('Error fetching preferences:', error);
        } finally {
            setIsLoadingPreferences(false);
        }
    }, []);

    /**
     * Fetch recent network
     */
    const fetchRecentNetwork = useCallback(async (limit: number = 10) => {
        setIsLoadingRecentNetwork(true);
        setRecentNetworkError(null);

        try {
            const response = await SmartMatchService.getRecentNetwork(limit);
            if (response.success && response.connections) {
                setRecentNetwork(response.connections);
            } else {
                setRecentNetwork([]);
            }
        } catch (error: any) {
            setRecentNetworkError(error.response?.data?.error || 'Failed to fetch recent network');
            setRecentNetwork([]);
            console.error('Error fetching recent network:', error);
        } finally {
            setIsLoadingRecentNetwork(false);
        }
    }, []);

    /**
     * Save a single preference
     */
    const savePreference = useCallback(async (preference: Partial<SmartMatchPreferences>): Promise<boolean> => {
        setIsSavingPreferences(true);
        setPreferencesError(null);

        try {
            const response = await SmartMatchService.savePreference(preference);
            if (response.success && response.preferences) {
                setPreferences(response.preferences);
                setPreferencesSet(true);
                return true;
            }
            return false;
        } catch (error: any) {
            setPreferencesError(error.response?.data?.error || 'Failed to save preference');
            console.error('Error saving preference:', error);
            return false;
        } finally {
            setIsSavingPreferences(false);
        }
    }, []);

    /**
     * Save all preferences at once
     */
    const saveAllPreferences = useCallback(
        async (newPreferences: SmartMatchPreferences): Promise<boolean> => {
            setIsSavingPreferences(true);
            setPreferencesError(null);

            try {
                const response = await SmartMatchService.saveAllPreferences(newPreferences);
                if (response.success && response.preferences) {
                    setPreferences(response.preferences);
                    setPreferencesSet(true);
                    // Refresh matches after saving preferences
                    await fetchMatches();
                    return true;
                }
                return false;
            } catch (error: any) {
                setPreferencesError(error.response?.data?.error || 'Failed to save preferences');
                console.error('Error saving all preferences:', error);
                return false;
            } finally {
                setIsSavingPreferences(false);
            }
        },
        [fetchMatches],
    );

    /**
     * Clear all preferences
     */
    const clearPreferences = useCallback(async (): Promise<boolean> => {
        setIsSavingPreferences(true);
        setPreferencesError(null);

        try {
            const response = await SmartMatchService.clearPreferences();
            if (response.success) {
                setPreferences(null);
                setPreferencesSet(false);
                // Refresh matches after clearing preferences
                await fetchMatches();
                return true;
            }
            return false;
        } catch (error: any) {
            setPreferencesError(error.response?.data?.error || 'Failed to clear preferences');
            console.error('Error clearing preferences:', error);
            return false;
        } finally {
            setIsSavingPreferences(false);
        }
    }, [fetchMatches]);

    /**
     * Match with a user
     */
    const matchWithUser = useCallback(
        async (userId: number): Promise<MatchResult | null> => {
            setIsMatching(true);

            try {
                const result = await SmartMatchService.matchUser(userId);
                if (result.success) {
                    // Refresh matches and recent network after successful match
                    await Promise.all([fetchMatches(), fetchRecentNetwork()]);
                    return result;
                }
                return null;
            } catch (error: any) {
                console.error('Error matching with user:', error);
                return null;
            } finally {
                setIsMatching(false);
            }
        },
        [fetchMatches, fetchRecentNetwork],
    );

    /**
     * Refresh all data
     */
    const refreshAll = useCallback(async () => {
        await Promise.all([fetchMatches(), fetchPreferences(), fetchRecentNetwork()]);
    }, [fetchMatches, fetchPreferences, fetchRecentNetwork]);

    // Initial load - only fetch when authUserId is available
    useEffect(() => {
        if (authUserId > 0) {
            setCurrentUserId(authUserId);
            refreshAll();
        }
    }, [authUserId]);

    return {
        // Data
        matches,
        preferences,
        recentNetwork,
        preferencesSet,

        // Loading states
        isLoadingMatches,
        isLoadingPreferences,
        isLoadingRecentNetwork,
        isMatching,
        isSavingPreferences,

        // Error states
        matchesError,
        preferencesError,
        recentNetworkError,

        // Actions
        fetchMatches,
        fetchPreferences,
        fetchRecentNetwork,
        savePreference,
        saveAllPreferences,
        clearPreferences,
        matchWithUser,
        refreshAll,
    };
}

export default useSmartMatch;
