'use client';

export const dynamic = 'force-dynamic';

import images from '@/constants/image';

import { DirectoryLeads } from '@/components/cards/directory/directory-leads';
import DirectoryList from '@/components/cards/directory/directory-lists';
import DirectoryMobilePendingList from '@/components/cards/directory/directory-mobile-pending-list';
import DirectoryMobileList from '@/components/cards/directory/directory-mobile-view-list';
import DirectoryPendingList from '@/components/cards/directory/directory-pending-list';
import DirectoryLeadsSidebar from '@/components/cards/directory/directory-user-profile';
import { FilterSidebar } from '@/components/sidebars/dashbord-filter';
import UserProfileSidebar from '@/components/sidebars/user-show-sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { dummyCards } from '@/dummyDatas/users';

type User = {
    id: number;
    name: string;
    email: string;
    profile_picture?: string | null;
    company_name?: string;
    company_description?: string;
    industry?: string;
    position?: string;
    country?: string;
    goals?: string;
    great_at?: string;
    categories?: string;
    years_of_operation?: string;
    number_of_employees?: string;
    selected_outcome?: string;
    phone?: string;
    linkedin?: string;
    created_at: string;
    updated_at: string;
    similarity_score: number;
    rating?: number;
    connection_status?: string; // connected, pending, none
    direction?: 'incoming' | 'outgoing'; // incoming, outgoing (for pending connections)
    match_reasons?: string[]; // AI search match reasons
};

type UserProfile = {
    name: string;
    location: string;
    title: string;
    industry: string;
    rating: number;
    imageSrc: string;
    experience: string;
    interest: string;
    reviews: string;
    baseLocation: string;
    operatesIn: string;
    bio: string;
    companyStage: string;
    keyStrength: string;
    topGoal: string;
    brnMemberSince: string;
    responseRate: string;
    successfulDealsRate: string;
};

interface Props extends PageProps {
    users: User[];
    connectedUsers: User[];
    pendingConnections: User[];
    savedUsers: User[];
    savedUserIds: number[];
    connectionCount: number;
    pendingCount: number;
    savedCount: number;
    connected: Array<{ id: number; name: string }>;
    pending: Array<{ id: number; name: string; direction?: 'incoming' | 'outgoing' }>;
    saved: Array<{ id: number; name: string }>;
    search?: string; // Search query from URL params
}

type SearchResult = {
    users: User[];
    total_found: number;
    query_processed: string;
    search_time_ms: number;
    total_processing_time_ms: number;
    fallback_used?: boolean;
};

function DirectoryContent({
    auth,
    users = [],
    connectedUsers = [],
    pendingConnections = [],
    savedUsers = [],
    savedUserIds = [],
    connectionCount = 0,
    pendingCount = 0,
    savedCount = 0,
    connected = [],
    pending = [],
    saved = [],
    search = '',
}: Props) {
    // Format date helper function
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Not available';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    // Format array data helper function
    const formatArrayData = (data: string | string[] | null | undefined): string => {
        if (!data) return 'Not specified';

        // Helper function to format individual items
        const formatItem = (item: string): string => {
            return item
                .replace(/_/g, ' ') // Replace underscores with spaces
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        };

        // If it's already a string, return it
        if (typeof data === 'string') {
            try {
                // Try to parse if it's a JSON string
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed.map((item) => formatItem(item)).join(', ');
                }
                // For regular strings, format and capitalize
                return formatItem(data);
            } catch {
                // If parsing fails, format the string as is
                return formatItem(data);
            }
        }

        // If it's an array, join with commas and format each item
        if (Array.isArray(data)) {
            return data.map((item) => formatItem(item)).join(', ');
        }

        return 'Not specified';
    };

    // Format string data helper function - ensures proper case and spacing
    const formatStringData = (data: string | null | undefined, fallback: string = 'Not specified'): string => {
        if (!data || data.trim() === '') return fallback;

        // Clean up the string - trim whitespace, handle multiple spaces, and replace underscores
        const cleaned = data.trim().replace(/\s+/g, ' ').replace(/_/g, ' ');

        // If it's a title/position, ensure proper case
        if (cleaned && cleaned.length > 0) {
            return cleaned;
        }

        return fallback;
    };

    // Format experience data
    const formatExperience = (years: string | null | undefined): string => {
        if (!years || years.trim() === '') return 'Not specified';

        const cleaned = years.trim();

        // If it's just numbers, add "years" suffix
        if (/^\d+$/.test(cleaned)) {
            return `${cleaned} year${cleaned === '1' ? '' : 's'}`;
        }

        // If it already has years/year in it, return as is
        if (cleaned.toLowerCase().includes('year')) {
            return cleaned;
        }

        // Otherwise, append "years" if it looks like a number
        if (/^\d+/.test(cleaned)) {
            return `${cleaned} years`;
        }

        return cleaned;
    };

    // Transform first user to match UserProfile format for initial selection
    const transformUserToProfile = (user: User): UserProfile => ({
        name: formatStringData(user.name, 'Unknown User'),
        location: formatStringData(user.country, 'Location not specified'),
        title: formatStringData(user.position, 'Position not specified'),
        industry: formatStringData(user.industry, 'Industry not specified'),
        rating: user.rating || 0,
        imageSrc: user.profile_picture || '',
        experience: formatExperience(user.years_of_operation),
        interest: formatArrayData(user.categories),
        reviews: user.rating ? user.rating.toString() : '0',
        baseLocation: formatStringData(user.country, 'Location not specified'),
        operatesIn: formatStringData(user.country, 'Location not specified'),
        bio: formatStringData(user.company_description, 'No bio available'),
        companyStage: formatStringData(user.selected_outcome, 'Stage not specified'),
        keyStrength: formatArrayData(user.great_at),
        topGoal: formatStringData(user.goals, 'Goals not specified'),
        brnMemberSince: formatDate(user.created_at),
        responseRate: 'N/A',
        successfulDealsRate: 'N/A',
    });

    const [selectedUser, setSelectedUser] = useState<UserProfile>(() => {
        // Prefer connected users, then all users, then pending connections
        const initialUserData =
            connectedUsers.length > 0
                ? connectedUsers[0]
                : users.length > 0
                    ? users[0]
                    : pendingConnections.length > 0
                        ? pendingConnections[0]
                        : null;

        return initialUserData ? transformUserToProfile(initialUserData) : ({} as UserProfile);
    });

    const [selectedUserId, setSelectedUserId] = useState<number>(() => {
        const initialUserData =
            connectedUsers.length > 0
                ? connectedUsers[0]
                : users.length > 0
                    ? users[0]
                    : pendingConnections.length > 0
                        ? pendingConnections[0]
                        : null;

        return initialUserData ? initialUserData.id : 0;
    });

    const [activeTab, setActiveTab] = useState<'all' | 'connections' | 'saved-directory' | 'pending'>('all');

    // Search state
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchInfo, setSearchInfo] = useState<{
        totalFound: number;
        searchTime: number;
        queryProcessed: string;
        fallbackUsed?: boolean;
    }>({
        totalFound: 0,
        searchTime: 0,
        queryProcessed: '',
    });
    const [isSearchMode, setIsSearchMode] = useState(!!search);
    const [showAIAnimation, setShowAIAnimation] = useState(false);
    const [loadingConnectionId, setLoadingConnectionId] = useState<number | null>(null);

    // Initialize search if coming from dashboard
    useEffect(() => {
        if (search && search.trim()) {
            setSearchQuery(search);
            setIsSearchMode(true);
            performSearch(search);
        }
    }, [search]);

    // Connection action handlers
    const handleConnectionAction = (userId: number, action: 'accept' | 'reject') => {
        setLoadingConnectionId(userId);
        const url = action === 'accept' ? '/connections/accept' : '/connections/reject';

        axios.post(url, { user_id: userId })
            .then(() => window.location.reload())
            .catch((err) => console.error('Connection action failed:', err))
            .finally(() => setLoadingConnectionId(null));
    };

    const handleConnect = (userId: number) => {
        setLoadingConnectionId(userId);
        axios.post('/connections/send', { connected_user_id: userId })
            .then(() => {
                if (savedUserIds.includes(userId)) {
                    axios.post('/saved-users/remove', { user_id: userId });
                }
                window.location.reload();
            })
            .catch((err) => console.error('Connection failed:', err))
            .finally(() => setLoadingConnectionId(null));
    };

    // Save user for later
    const handleSaveUser = (userId: number) => {
        setLoadingConnectionId(userId);
        axios.post('/saved-users/save', { user_id: userId })
            .then(() => window.location.reload())
            .catch((err) => console.error('Save user failed:', err))
            .finally(() => setLoadingConnectionId(null));
    };

    // Remove saved user
    const handleRemoveSavedUser = (userId: number) => {
        setLoadingConnectionId(userId);
        axios.post('/saved-users/remove', { user_id: userId })
            .then(() => window.location.reload())
            .catch((err) => console.error('Remove saved user failed:', err))
            .finally(() => setLoadingConnectionId(null));
    };

    const handleStartConversation = (userId: number) => {
        setLoadingConnectionId(userId);
        axios.post('/messages/start', { user_id: userId, redirect_to: 'message/single' })
            .then((res) => { window.location.href = res.data.redirect ?? '/message/single'; })
            .catch((err) => console.error('Failed to start conversation:', err))
            .finally(() => setLoadingConnectionId(null));
    };

    // Search function with caching
    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setIsSearchMode(false);
            setSearchResults([]);
            return;
        }

        // Check if we already have cached results for this query
        const cacheKey = `search_${query.trim().toLowerCase()}`;
        const cachedResults = sessionStorage.getItem(cacheKey);

        if (cachedResults) {
            try {
                const cached = JSON.parse(cachedResults);
                // Use cached results if they're less than 5 minutes old
                if (Date.now() - cached.timestamp < 300000) {
                    setSearchResults(cached.data.users);
                    setSearchInfo({
                        totalFound: cached.data.total_found,
                        searchTime: cached.data.search_time_ms,
                        queryProcessed: cached.data.query_processed,
                        fallbackUsed: cached.data.fallback_used,
                    });
                    setIsSearchMode(true);

                    if (cached.data.users.length > 0) {
                        const firstResult = cached.data.users[0];
                        setSelectedUser(transformUserToProfile(firstResult));
                        setSelectedUserId(firstResult.id);
                    }
                    return;
                }
            } catch {
                // Remove invalid cache
                sessionStorage.removeItem(cacheKey);
            }
        }

        setIsSearching(true);
        setShowAIAnimation(true);

        try {
            console.log('Starting search for query:', query.trim());
            const response = await axios.post('/api/search/users', {
                query: query.trim(),
                limit: 50,
            });

            console.log('Search response received:', response.data);

            if (response.data.success) {
                const searchData: SearchResult = response.data.data;

                // Ensure profile pictures are properly formatted for each user
                const usersWithFormattedPictures = searchData.users.map((user) => ({
                    ...user,
                    profile_picture: user.profile_picture || '',
                }));

                // Cache the results
                sessionStorage.setItem(
                    cacheKey,
                    JSON.stringify({
                        timestamp: Date.now(),
                        data: searchData,
                    }),
                );

                console.log('Search successful, results:', usersWithFormattedPictures.length, 'users');
                setSearchResults(usersWithFormattedPictures);
                setSearchInfo({
                    totalFound: searchData.total_found,
                    searchTime: searchData.search_time_ms,
                    queryProcessed: searchData.query_processed,
                    fallbackUsed: searchData.fallback_used,
                });
                setIsSearchMode(true);

                // Set first search result as selected user
                if (usersWithFormattedPictures.length > 0) {
                    const firstResult = usersWithFormattedPictures[0];
                    setSelectedUser(transformUserToProfile(firstResult));
                    setSelectedUserId(firstResult.id);
                }

                // Stop AI animation after 3 seconds
                setTimeout(() => {
                    setShowAIAnimation(false);
                }, 3000);
            } else {
                console.error('Search failed:', response.data.error || 'Unknown error');
                console.error('Full response:', response.data);
                setSearchResults([]);
                setIsSearchMode(false);
                setShowAIAnimation(false);
            }
        } catch (error) {
            console.error('Search error (network/axios):', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
            setSearchResults([]);
            setIsSearchMode(false);
            setShowAIAnimation(false);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input - only update query, no auto-search
    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        if (value.trim().length === 0) {
            clearSearch();
        }
    };

    // Handle search button click (immediate search)
    const handleSearch = () => {
        if (searchQuery.trim()) {
            performSearch(searchQuery);
            // Note: Temporarily commenting out router.visit to debug disappearing results
            // Update URL without refreshing the page
            // router.visit('/directory', {
            //     method: 'get',
            //     data: { search: searchQuery },
            //     preserveState: true,
            //     preserveScroll: true,
            //     only: [],
            // });
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchMode(false);
        setShowAIAnimation(false);
        setSearchInfo({
            totalFound: 0,
            searchTime: 0,
            queryProcessed: '',
        });
        window.history.replaceState(null, '', '/directory');
    };

    // Get current users to display based on search mode and active tab
    const getCurrentUsers = (): User[] => {
        if (isSearchMode) {
            // When in search mode, only return search results (even if empty)
            return searchResults;
        }

        switch (activeTab) {
            case 'connections':
                return connectedUsers;
            case 'pending':
                return pendingConnections;
            case 'saved-directory':
                return savedUsers;
            case 'all':
            default:
                return users;
        }
    };

    const currentUsers = getCurrentUsers();

    const handleUserSelection = (user: User) => {
        const userProfile = transformUserToProfile(user);
        setSelectedUser(userProfile);
        setSelectedUserId(user.id);
    };

    // ONLOAD BG BLUE BACKGROUND

    const [bgLoaded, setBgLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = images.uibg;
        img.onload = () => setBgLoaded(true);
    }, []);




    return (
        <AppLayout>
            
            <div className="relative border-0 bg-transparent pt-0 pb-2.5">
                {/* Zindex Background */}
                <div className={`absolute z-[2] hidden h-full w-full lg:block ${bgLoaded ? 'bg-[#031C5B] dark:lg:bg-gray-900' : 'bg-white'} `}></div>
                <div
                    className="relative z-[3] flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{
                        backgroundImage: `url(${images.uibg})`,
                    }}
                >
                    <div
                        className={`relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full flex-col gap-3 overflow-y-auto px-2 pb-1 lg:py-0 lg:pr-9 lg:pl-7 xl:pr-0 ${activeTab === 'all' || activeTab === 'saved-directory' ? 'xl:pl-12' : 'xl:pl-16'} `}
                    >
                        <div className="grid h-screen grid-cols-1 gap-5 overflow-hidden pt-2 lg:grid-cols-[70%_30%] lg:p-4 xl:p-0 page-transition">
                            {/* LEFT COLUMN */}
                            <div className="flex flex-col space-y-4 pb-4 lg:pr-7 lg:pl-3">
                                {/* Search Header */}
                                <div className={`rounded-md bg-[#0B2B33] lg:bg-transparent ${activeTab === 'all' ? '' : 'lg:pl-14'}`}>
                                    <div className="sticky top-0 z-10 flex items-center justify-between overflow-hidden border-b-0 bg-transparent px-3 pt-4 pb-3 lg:px-0">
                                        {/* Desktop Heading */}
                                        <h2 className="hidden text-[12px] leading-2 font-normal text-white italic sm:w-[200px] sm:text-[14px] md:w-[150px] md:text-[15px] lg:block lg:w-[180px] lg:text-[19.5px] lg:leading-6 lg:text-gray-800 xl:w-[270px]">
                                            Search for your{' '}
                                            <span className="tex-white text-base font-extrabold sm:text-xl lg:text-3xl lg:leading-3 lg:text-deepBlue">
                                                Next deal
                                            </span>
                                        </h2>

                                        {/* Mobile Heading */}
                                        <h2 className="-mt-1 ml-5 w-[120px] text-[9.8px] leading-3 font-light text-white italic sm:w-[200px] sm:text-[14px] md:w-[150px] md:text-[15px] lg:ml-0 lg:hidden lg:w-[180px] lg:text-[19.5px] lg:leading-6 lg:text-gray-800 xl:w-[270px]">
                                            Let’s find your{' '}
                                            <span className="tex-white text-[13px] font-extrabold sm:text-xl md:text-sm lg:text-3xl lg:leading-3 lg:text-deepBlue">
                                                next deal
                                            </span>
                                        </h2>

                                        <div className="lg:pace-x-2 flex w-full items-center space-x-0 lg:items-start">
                                            <div className="relative w-full">
                                                {/* <div className="relative w-[210px] sm:w-[400px] md:w-full"> */}
                                                <div className={`relative cursor-pointer ${activeTab === 'all' ? '' : 'lg:mr-16'}`}>
                                                    <input
                                                        type="text"
                                                        placeholder="Search "
                                                        value={searchQuery}
                                                        onChange={(e) => handleSearchInput(e.target.value)}
                                                        onKeyPress={handleSearchKeyPress}
                                                        disabled={isSearching}
                                                        className="w-full rounded-full border-0 bg-[#D3F1E729] px-4 py-2.5 pr-10 text-xs text-white italic placeholder:text-[11px] placeholder:font-light placeholder:text-white focus:ring-0 focus:outline-none disabled:opacity-50 lg:bg-[#27E6A729] lg:px-4 lg:py-3 lg:pl-10 lg:text-deepBlack lg:placeholder:text-sm lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                                                    />
                                                    {isSearchMode && searchQuery && (
                                                        <button
                                                            onClick={clearSearch}
                                                            className="absolute top-1/2 right-14 -translate-y-1/2 rounded-full bg-gray-500 p-1 text-white hover:bg-gray-600"
                                                        >
                                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={handleSearch}
                                                        disabled={isSearching || !searchQuery.trim()}
                                                        className={`absolute top-1/2 right-4 -translate-y-1/2 lg:right-10 ${isSearching ? 'cursor-not-allowed opacity-50' : ''} `}
                                                    >
                                                        {isSearching ? (
                                                            // Loader
                                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent lg:border-deepBlack" />
                                                        ) : (
                                                            <>
                                                                <img src={images.desktopSearch} className="hidden h-6 w-6 lg:block" alt="Search" />
                                                                <img src={images.aiSearch} className="h-5 w-5 lg:hidden" alt="AI Search" />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            {/* FILTER SIDEBAR INTEGRATION FOR SEARCH */}
                                            <FilterSidebar variant={activeTab} />
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Section */}
                                <Tabs defaultValue="all" onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="mx-auto lg:w-full">
                                    <TabsList className="mx-auto mb-5 no-scrollbar grid w-[95%] grid-cols-4 gap-5 overflow-x-auto rounded-full bg-[#F1EEEE] px-3 shadow-[0px_2px_5px_-1px_rgba(0,0,0,0.2),0px_2px_5px_-1px_rgba(0,0,0,0.2)] md:overflow-hidden lg:mx-auto lg:mb-0 lg:w-full lg:max-w-2xl lg:gap-2 lg:rounded-none lg:bg-white lg:px-0 lg:shadow-none">
                                        <TabsTrigger
                                            value="all"
                                            className="-mt-0.5 -ml-1 rounded-full border-0 px-10 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            All Directory
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="connections"
                                            className="-mx-2.5 -mt-0.5 rounded-full border-0 px-9.5 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Connections {connectionCount > 0 && `(${connectionCount})`}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="saved-directory"
                                            className="-mx-2.5 -mt-0.5 rounded-full border-0 px-10.5 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:mx-0 lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Saved Directory {savedCount > 0 && `(${savedCount})`}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="pending"
                                            className="-mx-1.5 -mt-0.5 -ml-2.5 rounded-full border-0 px-9.5 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Pending {pendingCount > 0 && `(${pendingCount})`}
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Search Results Info */}
                                    {isSearchMode && (
                                        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div className="relative">
                                                        {showAIAnimation ? (
                                                            <div className="relative h-4 w-4">
                                                                {/* Central core */}
                                                                <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500"></div>
                                                                {/* Rotating rings */}
                                                                <div className="absolute inset-0 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                                                                <div
                                                                    className="absolute inset-0.5 animate-spin rounded-full border border-blue-300 border-r-transparent"
                                                                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                                                                ></div>
                                                                {/* Pulsing outer ring */}
                                                                <div className="absolute -inset-1 animate-ping rounded-full border border-blue-200"></div>
                                                                {/* AI brain-like neural connections */}
                                                                <div className="absolute inset-0 opacity-70">
                                                                    <div className="absolute top-0 left-1/2 h-1 w-px -translate-x-1/2 transform animate-pulse bg-blue-400"></div>
                                                                    <div
                                                                        className="absolute bottom-0 left-1/2 h-1 w-px -translate-x-1/2 transform animate-pulse bg-blue-400"
                                                                        style={{ animationDelay: '0.3s' }}
                                                                    ></div>
                                                                    <div
                                                                        className="absolute top-1/2 left-0 h-px w-1 -translate-y-1/2 transform animate-pulse bg-blue-400"
                                                                        style={{ animationDelay: '0.6s' }}
                                                                    ></div>
                                                                    <div
                                                                        className="absolute top-1/2 right-0 h-px w-1 -translate-y-1/2 transform animate-pulse bg-blue-400"
                                                                        style={{ animationDelay: '0.9s' }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-blue-800">AI Search Results</span>
                                                </div>
                                                <button onClick={clearSearch} className="text-xs text-blue-600 underline hover:text-blue-800">
                                                    Clear Search
                                                </button>
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-sm text-blue-700">
                                                    <span className="font-semibold">{searchInfo.totalFound}</span> users found for
                                                    <span className="font-medium"> "{searchInfo.queryProcessed}"</span>
                                                    <span className="ml-2 text-xs text-deepBlue">
                                                        ({searchInfo.searchTime.toFixed(0)}ms)
                                                        {searchInfo.fallbackUsed && ' • Basic Search'}
                                                    </span>
                                                </p>
                                                {searchResults.length > 0 && (
                                                    <p className="mt-1 text-xs text-blue-600">
                                                        Sorted by relevance • Users with similarity scores and match reasons
                                                        {searchResults.length > 4 && ' • Scroll down to see more results'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* All Directory */}
                                    <TabsContent
                                        value="all"
                                        className="no-scrollbar h-screen overflow-y-auto rounded-2xl bg-deepBlack pt-2 lg:bg-transparent lg:pt-3"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, delay: 0.1 }}
                                            className="space-y-4 pb-40"
                                        >
                                            {currentUsers.length > 0 ? (
                                                <>
                                                    {/* First 4 cards row - always show grid for first 4 results */}
                                                    {currentUsers.length > 0 && (
                                                        <>
                                                            {/* Show search results count when in search mode */}
                                                            {isSearchMode && (
                                                                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 animate-fadeIn">
                                                                    <p className="text-center text-xs font-medium text-deepBlack">
                                                                        Found {currentUsers.length} result{currentUsers.length !== 1 ? 's' : ''}
                                                                        {currentUsers.length <= 4
                                                                            ? ' (all shown below)'
                                                                            : ' (first 4 shown in grid, remaining in list below)'}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {/* DESKTOP: First 4 cards grid */}
                                                            <div className="hidden grid-cols-1 gap-5 sm:grid-cols-2 lg:grid lg:grid-cols-4 stagger-children">
                                                                {currentUsers.slice(0, Math.min(4, currentUsers.length)).map((user, idx) => {
                                                                    const userProfile = transformUserToProfile(user);
                                                                    return (
                                                                        <div
                                                                            key={user.id}
                                                                            onClick={() => handleUserSelection(user)}
                                                                            className="relative w-full cursor-pointer"
                                                                        >
                                                                            <DirectoryLeads
                                                                                matches={[{ ...userProfile, id: user.id }]}
                                                                                onConnect={handleConnect}
                                                                                onAccept={(userId) => handleConnectionAction(userId, 'accept')}
                                                                                onStartConversation={handleStartConversation}
                                                                                connectedUsers={connected}
                                                                                pendingConnections={pending}
                                                                                loadingConnectionId={loadingConnectionId}
                                                                                authUserId={auth.user?.id}
                                                                            />
                                                                            {isSearchMode &&
                                                                                user.similarity_score &&
                                                                                user.similarity_score > 0 &&
                                                                                user.similarity_score <= 1 && (
                                                                                    <div className="absolute top-2 right-2 rounded bg-green-500 px-2 py-1 text-xs text-white">
                                                                                        {Math.round(user.similarity_score * 100)}% match
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* MOBILE: Show ALL users in list format */}
                                                    <div className="no-scrollbar max-h-[65vh] space-y-3 overflow-y-auto rounded-2xl bg-deepBlack pt-5 pb-20 lg:hidden">
                                                        {currentUsers.map((user, idx) => {
                                                            const userProfile = transformUserToProfile(user);
                                                            return (
                                                                <motion.div key={user.id} className="relative">
                                                                    <UserProfileSidebar
                                                                        variant={activeTab}
                                                                        userId={user.id}
                                                                        authUserId={auth.user?.id ?? 0}
                                                                        name={user.name}
                                                                        title={user.position || 'Position not specified'}
                                                                        imageSrc={user.profile_picture || ''}
                                                                        experience={user.years_of_operation || 'N/A'}
                                                                        industry={user.industry || 'N/A'}
                                                                        interest={formatArrayData(user.categories)}
                                                                        reviews={user.rating ? user.rating.toString() : '0'}
                                                                        baseLocation={user.country || 'N/A'}
                                                                        operatesIn={user.country || 'N/A'}
                                                                        bio={user.company_description || ''}
                                                                        companyStage={user.selected_outcome || ''}
                                                                        keyStrength={formatArrayData(user.great_at)}
                                                                        topGoal={user.goals || ''}
                                                                        brnMemberSince={formatDate(user.created_at)}
                                                                        responseRate={'N/A'}
                                                                        successfulDealsRate={'N/A'}
                                                                        connected={connected}
                                                                        pending={pending}
                                                                    >
                                                                        <DirectoryMobileList
                                                                            name={user.name}
                                                                            location={user.country || 'Location not specified'}
                                                                            title={user.position || 'Position not specified'}
                                                                            industry={user.industry || 'N/A'}
                                                                            rating={user.rating || 0}
                                                                            imageSrc={user.profile_picture || ''}
                                                                        />
                                                                    </UserProfileSidebar>

                                                                    {isSearchMode &&
                                                                        user.similarity_score &&
                                                                        user.similarity_score > 0 &&
                                                                        user.similarity_score <= 1 && (
                                                                            <div className="absolute top-4 right-4 flex flex-col items-end space-y-1">
                                                                                <div className="rounded bg-green-500 px-2 py-1 text-xs text-white">
                                                                                    {Math.round(user.similarity_score * 100)}% match
                                                                                </div>
                                                                                {user.match_reasons && user.match_reasons.length > 0 && (
                                                                                    <div className="max-w-40 truncate rounded bg-blue-500 px-2 py-1 text-xs text-white">
                                                                                        {user.match_reasons[0]}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* DESKTOP: Scrollable list - shows remaining results after first 4 */}
                                                    {currentUsers.length > 4 && (
                                                        <div className="no-scrollbar hidden max-h-[65vh] space-y-3 overflow-y-auto rounded-2xl bg-transparent pt-5 pb-8 lg:block">
                                                            {/* Show total count for search results */}
                                                            {isSearchMode && (
                                                                <div className="sticky top-0 z-10 mb-3 rounded-lg border border-gray-200 bg-white/90 p-2 backdrop-blur-sm">
                                                                    <p className="deepBlack text-center text-xs">
                                                                        Showing {currentUsers.length - 4} additional result
                                                                        {currentUsers.length - 4 !== 1 ? 's' : ''} (Total: {currentUsers.length})
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {currentUsers.slice(4).map((user, idx) => {
                                                                const userProfile = transformUserToProfile(user);
                                                                return (
                                                                    <motion.div
                                                                        key={user.id}
                                                                        onClick={() => handleUserSelection(user)}
                                                                        className="relative"
                                                                    >
                                                                        <DirectoryList {...userProfile} />
                                                                        {isSearchMode &&
                                                                            user.similarity_score &&
                                                                            user.similarity_score > 0 &&
                                                                            user.similarity_score <= 1 && (
                                                                                <div className="absolute top-4 right-4 flex flex-col items-end space-y-1">
                                                                                    <div className="rounded bg-green-500 px-2 py-1 text-xs text-white">
                                                                                        {Math.round(user.similarity_score * 100)}% match
                                                                                    </div>
                                                                                    {user.match_reasons && user.match_reasons.length > 0 && (
                                                                                        <div className="max-w-40 truncate rounded bg-blue-500 px-2 py-1 text-xs text-white">
                                                                                            {user.match_reasons[0]}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </>
                                            ) : isSearchMode ? (
                                                <div className="py-8 text-center text-gray-500">
                                                    <div className="flex flex-col items-center space-y-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                            <svg
                                                                className="h-6 w-6 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium">No matches found</p>
                                                            <p className="text-sm">Try adjusting your search terms or browse all users instead.</p>
                                                        </div>
                                                        <button
                                                            onClick={clearSearch}
                                                            className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                                                        >
                                                            Browse All Users
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center text-gray-500">
                                                    <p className="text-xs">No users found in the directory.</p>
                                                    <p className="text-sm">Please try again later.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </TabsContent>

                                    {/* Connections Tab */}
                                    <TabsContent
                                        value="connections"
                                        className="no-scrollbar h-screen overflow-y-auto rounded-2xl bg-deepBlack pt-0 lg:bg-transparent lg:pt-3"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, delay: 0.1 }}
                                            className="space-y-4 pb-40"
                                        >
                                            {connectedUsers.length > 0 ? (
                                                <>
                                                    {/* First 4 cards row */}
                                                    <div className="hidden grid-cols-4 gap-5 lg:grid">
                                                        {connectedUsers.slice(0, 4).map((user, idx) => {
                                                            const userProfile = transformUserToProfile(user);
                                                            return (
                                                                <div
                                                                    key={user.id}
                                                                    onClick={() => handleUserSelection(user)}
                                                                    className="w-full cursor-pointer"
                                                                >
                                                                    <DirectoryLeads
                                                                        matches={[{ ...userProfile, id: user.id }]}
                                                                        onConnect={handleConnect}
                                                                        onAccept={(userId) => handleConnectionAction(userId, 'accept')}
                                                                        onStartConversation={handleStartConversation}
                                                                        connectedUsers={connected}
                                                                        pendingConnections={pending}
                                                                        loadingConnectionId={loadingConnectionId}
                                                                        authUserId={auth.user?.id}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Scrollable list */}
                                                    <div className="no-scrollbar max-h-[65vh] space-y-3 overflow-y-auto rounded-2xl bg-deepBlack px-0.5 pt-3 lg:pt-0 pb-20 lg:bg-transparent lg:pb-8">
                                                        {connectedUsers.map((user, idx) => {
                                                            const userProfile = transformUserToProfile(user);
                                                            return (
                                                                <>
                                                                    <motion.div key={user.id} onClick={() => handleUserSelection(user)}>
                                                                        <div className="hidden lg:block">
                                                                            <DirectoryList {...userProfile} />
                                                                        </div>
                                                                    </motion.div>

                                                                    {/* MOBILE VIEW LIST WITH SHOW DETAIL SIDEBAR */}
                                                                    <motion.div key={user.id} className="relative lg:hidden">
                                                                        <UserProfileSidebar
                                                                            variant={activeTab}
                                                                            userId={user.id}
                                                                            authUserId={auth.user?.id ?? 0}
                                                                            key={user.id}
                                                                            name={user.name}
                                                                            title={user.position || 'Position not specified'}
                                                                            imageSrc={user.profile_picture || ''}
                                                                            experience={user.years_of_operation || 'N/A'}
                                                                            industry={user.industry || 'N/A'}
                                                                            interest={formatArrayData(user.categories)}
                                                                            reviews={user.rating ? user.rating.toString() : '0'}
                                                                            baseLocation={user.country || 'N/A'}
                                                                            operatesIn={user.country || 'N/A'}
                                                                            bio={user.company_description || ''}
                                                                            companyStage={user.selected_outcome || ''}
                                                                            keyStrength={formatArrayData(user.great_at)}
                                                                            topGoal={user.goals || ''}
                                                                            brnMemberSince={formatDate(user.created_at)}
                                                                            responseRate={'N/A'}
                                                                            successfulDealsRate={'N/A'}
                                                                            connected={connected}
                                                                            pending={pending}
                                                                        >
                                                                            <DirectoryMobileList
                                                                                name={user.name}
                                                                                location={user.country || 'Location not specified'}
                                                                                title={user.position || 'Position not specified'}
                                                                                industry={user.industry || 'N/A'}
                                                                                rating={user.rating || 0}
                                                                                imageSrc={user.profile_picture || ''}
                                                                            />
                                                                        </UserProfileSidebar>
                                                                    </motion.div>
                                                                </>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-8 text-center text-gray-500">
                                                    <p className="text-xs">No connections found.</p>
                                                    <p className="px-8 text-xs">Start connecting with other users to build your network.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </TabsContent>

                                    {/* Saved Directory Tab */}
                                    <TabsContent
                                        value="saved-directory"
                                        className="no-scrollbar h-screen overflow-y-auto rounded-2xl bg-deepBlack pt-0 lg:bg-transparent lg:pt-3"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, delay: 0.1 }}
                                            className="space-y-4 pb-40"
                                        >
                                            {savedUsers.length > 0 ? (
                                                <>
                                                    {/* First 4 cards row */}
                                                    <div className="hidden grid-cols-4 gap-6 lg:grid">
                                                        {savedUsers.slice(0, 4).map((user, idx) => {
                                                            const userProfile = transformUserToProfile(user);
                                                            return (
                                                                <div
                                                                    key={user.id}
                                                                    onClick={() => handleUserSelection(user)}
                                                                    className="w-full cursor-pointer"
                                                                >
                                                                    <DirectoryLeads
                                                                        matches={[{ ...userProfile, id: user.id }]}
                                                                        onConnect={handleConnect}
                                                                        onAccept={(userId) => handleConnectionAction(userId, 'accept')}
                                                                        onStartConversation={handleStartConversation}
                                                                        connectedUsers={connected}
                                                                        pendingConnections={pending}
                                                                        loadingConnectionId={loadingConnectionId}
                                                                        authUserId={auth.user?.id}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Scrollable list */}
                                                    <div className="no-scrollbar max-h-[65vh] space-y-3 overflow-y-auto rounded-2xl pt-3 lg:pt-0 bg-deepBlack px-0.5 pb-20 lg:bg-transparent lg:pb-8">
                                                        {savedUsers.map((user, idx) => {
                                                            const userProfile = transformUserToProfile(user);
                                                            return (
                                                                <>
                                                                    <motion.div key={user.id} onClick={() => handleUserSelection(user)}>
                                                                        <div className="hidden lg:block">
                                                                            <DirectoryList {...userProfile} />
                                                                        </div>
                                                                    </motion.div>

                                                                    {/* MOBILE VIEW LIST WITH SHOW DETAIL SIDEBAR */}
                                                                    <motion.div key={user.id} className="relative  lg:hidden">
                                                                        <UserProfileSidebar
                                                                            variant={activeTab}
                                                                            userId={user.id}
                                                                            authUserId={auth.user?.id ?? 0}
                                                                            key={user.id}
                                                                            name={user.name}
                                                                            title={user.position || 'Position not specified'}
                                                                            imageSrc={user.profile_picture || ''}
                                                                            experience={user.years_of_operation || 'N/A'}
                                                                            industry={user.industry || 'N/A'}
                                                                            interest={formatArrayData(user.categories)}
                                                                            reviews={user.rating ? user.rating.toString() : '0'}
                                                                            baseLocation={user.country || 'N/A'}
                                                                            operatesIn={user.country || 'N/A'}
                                                                            bio={user.company_description || ''}
                                                                            companyStage={user.selected_outcome || ''}
                                                                            keyStrength={formatArrayData(user.great_at)}
                                                                            topGoal={user.goals || ''}
                                                                            brnMemberSince={formatDate(user.created_at)}
                                                                            responseRate={'N/A'}
                                                                            successfulDealsRate={'N/A'}
                                                                            connected={connected}
                                                                            pending={pending}
                                                                        >
                                                                            <DirectoryMobileList
                                                                                name={user.name}
                                                                                location={user.country || 'Location not specified'}
                                                                                title={user.position || 'Position not specified'}
                                                                                industry={user.industry || 'N/A'}
                                                                                rating={user.rating || 0}
                                                                                imageSrc={user.profile_picture || ''}
                                                                            />
                                                                        </UserProfileSidebar>
                                                                    </motion.div>
                                                                </>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-8 text-center text-gray-500">
                                                    <p className="text-xs">No saved users found.</p>
                                                    <p className="px-8 text-xs">Save users for later to keep track of potential connections.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </TabsContent>

                                    {/* Pending Tab */}
                                    <TabsContent
                                        value="pending"
                                        className=" mt-5 no-scrollbar h-screen rounded-2xl bg-deepBlack pb-20 pt-3 lg:mt-0 lg:bg-transparent lg:pt-3 lg:pb-8"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, delay: 0.1 }}
                                            className="space-y-4 pb-10"
                                        >
                                            {pendingConnections.length > 0 ? (
                                                <>
                                                    {/* Scrollable list */}
                                                    <div className="no-scrollbar max-h-[65vh] space-y-4 divide-y divide-white/30 overflow-y-auto px-0.5 pt-3 pb-20 lg:max-h-[75vh] lg:pt-0 lg:pb-0">
                                                        {pendingConnections.map((user, idx) => {
                                                            const userProfile = transformUserToProfile(user);
                                                            return (
                                                                <>
                                                                    <motion.div
                                                                        key={user.id}
                                                                        className="hidden lg:block"
                                                                        onClick={() => handleUserSelection(user)}
                                                                    >
                                                                        <DirectoryPendingList
                                                                            {...userProfile}
                                                                            userId={user.id}
                                                                            direction={user.direction}
                                                                            onAccept={(userId) => handleConnectionAction(userId, 'accept')}
                                                                            onReject={(userId) => handleConnectionAction(userId, 'reject')}
                                                                            loadingUserId={loadingConnectionId}
                                                                        />
                                                                    </motion.div>

                                                                    {/* MOBILE VIEW LIST WITH SHOW DETAIL SIDEBAR */}
                                                                    <motion.div key={user.id} className="relative  lg:hidden">
                                                                        <UserProfileSidebar
                                                                            variant={activeTab}
                                                                            userId={user.id}
                                                                            authUserId={auth.user?.id ?? 0}
                                                                            key={user.id}
                                                                            name={user.name}
                                                                            title={user.position || 'Position not specified'}
                                                                            imageSrc={user.profile_picture || ''}
                                                                            experience={user.years_of_operation || 'N/A'}
                                                                            industry={user.industry || 'N/A'}
                                                                            interest={formatArrayData(user.categories)}
                                                                            reviews={user.rating ? user.rating.toString() : '0'}
                                                                            baseLocation={user.country || 'N/A'}
                                                                            operatesIn={user.country || 'N/A'}
                                                                            bio={user.company_description || ''}
                                                                            companyStage={user.selected_outcome || ''}
                                                                            keyStrength={formatArrayData(user.great_at)}
                                                                            topGoal={user.goals || ''}
                                                                            brnMemberSince={formatDate(user.created_at)}
                                                                            responseRate={'N/A'}
                                                                            successfulDealsRate={'N/A'}
                                                                            connected={connected}
                                                                            pending={pending}
                                                                        >
                                                                            <DirectoryMobilePendingList
                                                                                name={user.name}
                                                                                location={user.country || 'Location not specified'}
                                                                                title={user.position || 'Position not specified'}
                                                                                industry={user.industry || 'N/A'}
                                                                                rating={user.rating || 0}
                                                                                imageSrc={user.profile_picture || ''}
                                                                            />
                                                                        </UserProfileSidebar>
                                                                    </motion.div>
                                                                </>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                // <></>
                                                <div className="py-8 text-center text-gray-500">
                                                    <p className="text-xs">No pending connections.</p>
                                                    <p className="px-10 text-xs">Send connection requests to start building your network.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* RIGHT COLUMN (Profile Preview) */}
                            <AnimatePresence mode="wait">
                                {selectedUser && (
                                    <motion.div
                                        key={selectedUser.name}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="hidden h-full w-full overflow-y-auto px-2 lg:block"
                                    >
                                        <DirectoryLeadsSidebar
                                            userId={selectedUserId}
                                            authUserId={auth.user?.id ?? 0}
                                            name={selectedUser.name}
                                            title={selectedUser.title}
                                            imageSrc={selectedUser.imageSrc}
                                            experience={selectedUser.experience}
                                            industry={selectedUser.industry}
                                            interest={selectedUser.interest}
                                            reviews={selectedUser.reviews}
                                            baseLocation={selectedUser.baseLocation}
                                            operatesIn={selectedUser.operatesIn}
                                            bio={selectedUser.bio}
                                            companyStage={selectedUser.companyStage}
                                            keyStrength={selectedUser.keyStrength}
                                            topGoal={selectedUser.topGoal}
                                            brnMemberSince={selectedUser.brnMemberSince}
                                            responseRate={selectedUser.responseRate}
                                            successfulDealsRate={selectedUser.successfulDealsRate}
                                            variant={activeTab}
                                            onConnect={handleConnect}
                                            onStartConversation={handleStartConversation}
                                            onSaveUser={handleSaveUser}
                                            onRemoveSavedUser={handleRemoveSavedUser}
                                            savedUserIds={savedUserIds}
                                            loadingUserId={loadingConnectionId}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


export default function Directory(props: Omit<Props, 'auth'>) {
    const { user } = useAuth();
    if (!user) return null;
    return <DirectoryContent {...props} auth={{ user }} />;
}
