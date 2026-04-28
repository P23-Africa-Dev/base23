'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import images from '@/constants/image';
import React, { useState } from 'react';
import { FilterSidebar } from '../sidebars/dashbord-filter';
import UserCard from './UserCard';
import UserProfileSidebar from '../sidebars/user-show-sidebar';

interface User {
    id: number;
    name: string;
    position?: string;
    country?: string;
    industry?: string;
    rating?: number;
    profile_picture?: string;
    company_description?: string;
    leads: 'connection' | 'smart-match' | 'active-lead';
    years_of_operation?: number;
    selected_outcome?: string;
    great_at?: string[];
    goals?: string;
    total_score?: number;
    match_reasons?: string[];
    created_at?: string;
}

interface MobileTabsLeadsProps {
    users: User[];
    isLoadingSortedUsers?: boolean;
    connected?: Array<{ id: number; name: string }>;
    pending?: Array<{ id: number; name: string }>;
    auth?: any;
}

export const MobileTabsLeads: React.FC<MobileTabsLeadsProps> = ({
    users,
    isLoadingSortedUsers = false,
    connected = [],
    pending = [],
    auth,
}) => {
    const [activeTab, setActiveTab] = useState('connections');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const sortedUsers = users;

    const formatArrayData = (data: string | string[] | null | undefined): string => {
        if (!data) return 'Not specified';
        if (typeof data === 'string') {
            try { const p = JSON.parse(data); return Array.isArray(p) ? p.join(', ') : data; } catch { return data; }
        }
        return Array.isArray(data) ? data.join(', ') : 'Not specified';
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Not available';
        try { return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
        catch { return 'Invalid date'; }
    };

    const handleSearchIconClick = () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 1000);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearchIconClick();
    };

    return (
        <div className="block lg:hidden">
            <Tabs defaultValue="connections" onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
                <TabsList className="grid grid-cols-3 place-items-center rounded-full border border-[#F9F9F9] bg-[#F1EEEE] py-0.5 shadow-md">
                    <TabsTrigger
                        value="connections"
                        className="rounded-full bg-transparent px-4 py-1.5 text-[13px] font-normal whitespace-nowrap text-primary data-[state=active]:bg-[#A87EF7]"
                    >
                        Connections
                    </TabsTrigger>
                    <TabsTrigger
                        value="smart-matches"
                        className="rounded-full bg-transparent px-4 py-1.5 text-[13px] font-normal whitespace-nowrap text-primary data-[state=active]:bg-[#A87EF7]"
                    >
                        Smart matches
                    </TabsTrigger>
                    <TabsTrigger
                        value="active-leads"
                        className="rounded-full bg-transparent px-4 py-1.5 text-[13px] font-normal whitespace-nowrap text-primary data-[state=active]:bg-[#A87EF7]"
                    >
                        Active leads
                    </TabsTrigger>
                </TabsList>

                <div className="sticky top-0 z-10 flex w-full items-center justify-between overflow-hidden rounded-3xl border-b-0 bg-deepBlack px-3 pt-4 pb-3">
                    <div className="flex w-[27%] flex-col text-white italic xl:w-[160px]">
                        <h2 className="text-[12px] leading-2 font-normal sm:text-[14px] md:text-[15px]"> Let's find your</h2>
                        <h3 className="text-base font-extrabold sm:text-xl"> next deal</h3>
                    </div>

                    <div className="flex w-[57%] items-center space-x-2">
                        <div className="relative w-full cursor-pointer">
                            <input
                                type="text"
                                placeholder="Search "
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                disabled={isSearching}
                                className="w-full rounded-full border-0 bg-gray-700 px-4 py-2 text-deepBlack placeholder:text-sm placeholder:text-white placeholder:italic focus:ring-0 focus:ring-primary/30 focus:outline-none disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                            />
                            <button
                                onClick={handleSearchIconClick}
                                disabled={isSearching || !searchQuery.trim()}
                                className="absolute top-1/2 right-5 -translate-y-1/2 disabled:cursor-not-allowed"
                            >
                                <img src={images.desktopSearch} className="hidden h-6 w-6" alt="Search" />
                                <img src={images.aiSearch} className="h-7 w-7" alt="AI Search" />
                            </button>
                            {isSearching && (
                                <div className="absolute top-1/2 right-12 -translate-y-1/2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FILTER SIDEBAR INTEGRATION FOR SEARCH */}
                    <FilterSidebar variant="dashboard" />
                </div>

                {/* Tab Contents */}
                <TabsContent value="connections" className="mt-4">
                    <div className="h-[40vh] divide-y divide-white/30 overflow-y-auto">
                        {isLoadingSortedUsers ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-white lg:text-deepBlack">Loading connections...</div>
                            </div>
                        ) : (
                            sortedUsers
                                .filter((user) => user.categories === 'connection')
                                .map((user) => (
                                    <UserProfileSidebar
                                        variant="all"
                                        key={user.id}
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
                                        intelligentScore={user.total_score}
                                        matchReasons={user.match_reasons}
                                    >
                                        <UserCard
                                            name={user.name}
                                            location={user.country || 'Location not specified'}
                                            title={user.position || 'Position not specified'}
                                            industry={user.industry || 'N/A'}
                                            rating={user.rating || 0}
                                            imageSrc={user.profile_picture || ''}
                                        />
                                    </UserProfileSidebar>
                                ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="smart-matches" className="mt-4">
                 <div className="h-[40vh] divide-y divide-white/30 overflow-y-auto">
                        {isLoadingSortedUsers ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-white lg:text-deepBlack">Loading connections...</div>
                            </div>
                        ) : (
                            sortedUsers
                                .filter((user) => user.categories === 'smart-match')
                                .map((user) => (
                                    <UserProfileSidebar
                                        variant="all"
                                        key={user.id}
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
                                        intelligentScore={user.total_score}
                                        matchReasons={user.match_reasons}
                                    >
                                        <UserCard
                                            name={user.name}
                                            location={user.country || 'Location not specified'}
                                            title={user.position || 'Position not specified'}
                                            industry={user.industry || 'N/A'}
                                            rating={user.rating || 0}
                                            imageSrc={user.profile_picture || ''}
                                        />
                                    </UserProfileSidebar>
                                ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="active-leads" className="mt-4">
                     <div className="h-[40vh] divide-y divide-white/30 overflow-y-auto">
                        {isLoadingSortedUsers ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-white lg:text-deepBlack">Loading connections...</div>
                            </div>
                        ) : (
                            sortedUsers
                                .filter((user) => user.categories === 'connection')
                                .map((user) => (
                                    <UserProfileSidebar
                                        variant="all"
                                        key={user.id}
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
                                        intelligentScore={user.total_score}
                                        matchReasons={user.match_reasons}
                                    >
                                        <UserCard
                                            name={user.name}
                                            location={user.country || 'Location not specified'}
                                            title={user.position || 'Position not specified'}
                                            industry={user.industry || 'N/A'}
                                            rating={user.rating || 0}
                                            imageSrc={user.profile_picture || ''}
                                        />
                                    </UserProfileSidebar>
                                ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
