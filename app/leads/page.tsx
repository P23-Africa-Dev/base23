'use client';

import images from '@/constants/image';

import LeadsGridCard from '@/components/leads/LeadsGridCard';
import { LeadActionsDropdown } from '@/components/leads/LeadActionsDropdown';
import { LeadImportModal } from '@/components/leads/LeadImportModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import { LeadsFilterSidebar } from '@/components/leads/leads-sidebar-filter';
import LeadsSidebar, { LeadSidebarProfile } from '@/components/leads/LeadsSidebar';
import { Lead } from '@/dummyDatas/leads';

import { EmptyCollectionState } from '@/components/leads/empty-collections';
import { LeadFullProfilePanel } from '@/components/leads/lead-full-profile-panel';
import LeadsMobileSidebar from '@/components/leads/leads-mobile-sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import axios from 'axios';

// API Lead type (snake_case from backend)
interface ApiLead {
    id: number;
    type: 'person' | 'company';
    name: string;
    company_name?: string;
    position?: string;
    bio?: string;
    email: string;
    phone?: string;
    location?: string;
    experience?: string;
    industry?: string;
    interest?: string;
    company_stage?: string;
    key_strength?: string;
    top_goal?: string;
    base_location?: string;
    operates_in?: string;
    member_since?: string;
    response_rate?: string;
    successful_deals_rate?: string;
    rating?: number;
    logo?: string;
    created_at?: string;
    updated_at?: string;
    // New Lead Bank profile fields
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    address?: string;
    company_description?: string;
}

// Convert API lead to frontend Lead type
const mapApiLeadToLead = (apiLead: ApiLead): Lead => ({
    id: apiLead.id,
    type: apiLead.type,
    logo: apiLead.type === 'company' ? images.buildingleads : images.userCheckleads,
    name: apiLead.name,
    companyName: apiLead.company_name,
    position: apiLead.position,
    bio: apiLead.bio || '',
    email: apiLead.email,
    phone: apiLead.phone || '',
    location: apiLead.location || '',
    experience: apiLead.experience || '',
    industry: apiLead.industry || '',
    interest: apiLead.interest || '',
    companyStage: apiLead.company_stage,
    keyStrength: apiLead.key_strength,
    topGoal: apiLead.top_goal,
    baseLocation: apiLead.base_location,
    operatesIn: apiLead.operates_in,
    memberSince: apiLead.member_since,
    responseRate: apiLead.response_rate,
    successfulDealsRate: apiLead.successful_deals_rate,
    rating: apiLead.rating,
    // New Lead Bank profile fields
    linkedin: apiLead.linkedin,
    twitter: apiLead.twitter,
    facebook: apiLead.facebook,
    instagram: apiLead.instagram,
    address: apiLead.address,
    companyDescription: apiLead.company_description,
});

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

export default function Leads() {
    const { user: authUserForAdmin } = useAuth();
    const isAdmin = (authUserForAdmin as any)?.is_admin ?? false;

    const COLLECTION_STORAGE_KEY = 'leads:collections';

    const [activeTab, setActiveTab] = useState<'all' | 'company' | 'person'>('all');

    // Leads state - only from database
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoadingLeads, setIsLoadingLeads] = useState(true);

    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const [collectionIds, setCollectionIds] = useState<number[]>([]);

    const [isFullProfileOpen, setIsFullProfileOpen] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const [unlockedLeadIds, setUnlockedLeadIds] = useState<number[]>([]);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const { pathname } = window.location;

    const isLeadsPage = pathname === '/leads';

    // Fetch leads from API
    const fetchLeads = useCallback(async () => {
        setIsLoadingLeads(true);
        try {
            const response = await fetch('/api/leads');
            const data = await response.json();

            if (data.success && Array.isArray(data.leads)) {
                const apiLeads = data.leads.map(mapApiLeadToLead);
                setLeads(apiLeads);
                // Select first lead if none selected
                if (!selectedLead && apiLeads.length > 0) {
                    setSelectedLead(apiLeads[0]);
                }
            } else {
                setLeads([]);
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            setLeads([]);
        } finally {
            setIsLoadingLeads(false);
        }
    }, [selectedLead]);

    // Load leads on mount
    useEffect(() => {
        fetchLeads();
    }, []);

    // Fetch unlocked leads on mount
    useEffect(() => {
        const fetchUnlockedLeads = async () => {
            try {
                const response = await axios.get('/api/coins/unlocked-leads');
                if (response.data.success && Array.isArray(response.data.unlocked_lead_ids)) {
                    setUnlockedLeadIds(response.data.unlocked_lead_ids);
                }
            } catch (error) {
                console.error('Failed to fetch unlocked leads:', error);
            }
        };
        fetchUnlockedLeads();
    }, []);

    // Handle unlocking a lead (deducts 1 leads coin)
    const handleUnlockLead = async (leadId: number) => {
        if (unlockedLeadIds.includes(leadId)) return; // Already unlocked
        setIsUnlocking(true);
        try {
            const response = await axios.post('/api/coins/deduct-lead', { lead_id: leadId });
            if (response.data.success) {
                setUnlockedLeadIds((prev) => [...prev, leadId]);
            } else {
                alert(response.data.message || 'Failed to unlock lead. You may not have enough coins.');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to unlock lead.';
            alert(msg);
            console.error('Failed to unlock lead:', error);
        } finally {
            setIsUnlocking(false);
        }
    };

    const addToCollection = (id: number) => {
        setCollectionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const removeFromCollection = (id: number) => {
        setCollectionIds((prev) => prev.filter((cid) => cid !== id));
    };

    const mapLeadToSidebar = (lead: Lead): LeadSidebarProfile => ({
        id: lead.id,
        name: lead.name,
        title: lead.position || lead.industry,
        bio: lead.bio,
        email: lead.email,
        phone: lead.phone,
        location: lead.location,
        experience: lead.experience,
        industry: lead.industry,
        interest: lead.interest,
        // Extended profile fields
        companyStage: lead.companyStage,
        keyStrength: lead.keyStrength,
        topGoal: lead.topGoal,
        baseLocation: lead.baseLocation,
        operatesIn: lead.operatesIn,
        memberSince: lead.memberSince,
        responseRate: lead.responseRate,
        successfulDealsRate: lead.successfulDealsRate,
        rating: lead.rating,
        // New Lead Bank profile fields
        linkedin: lead.linkedin,
        twitter: lead.twitter,
        facebook: lead.facebook,
        instagram: lead.instagram,
        address: lead.address,
        companyDescription: lead.companyDescription,
        companyName: lead.companyName,
    });

    const selectedSidebarData = selectedLead ? mapLeadToSidebar(selectedLead) : null;
    const isSelectedLeadCollected = selectedLead ? collectionIds.includes(selectedLead.id) : false;

    const [filters, setFilters] = useState<{
        collectionOnly: boolean;
    }>({
        collectionOnly: false,
    });

    const getLeadsByTab = (tab: 'all' | 'company' | 'person') => {
        let result = leads;

        // Filter by tab type
        if (tab !== 'all') {
            result = result.filter((lead) => lead.type === tab);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((lead) =>
                lead.name.toLowerCase().includes(query) ||
                lead.email.toLowerCase().includes(query) ||
                lead.industry.toLowerCase().includes(query) ||
                lead.location.toLowerCase().includes(query) ||
                lead.bio.toLowerCase().includes(query) ||
                (lead.position && lead.position.toLowerCase().includes(query)) ||
                (lead.companyName && lead.companyName.toLowerCase().includes(query)) ||
                lead.interest.toLowerCase().includes(query) ||
                (lead.keyStrength && lead.keyStrength.toLowerCase().includes(query)) ||
                (lead.topGoal && lead.topGoal.toLowerCase().includes(query))
            );
        }

        // Filter by collection only
        if (filters.collectionOnly) {
            result = result.filter((lead) => collectionIds.includes(lead.id));
        }

        return result;
    };

    const getVisibleLeads = (tab: 'all' | 'company' | 'person') => getLeadsByTab(tab);

    const isEmptyCollection = (tab: 'all' | 'company' | 'person') => filters.collectionOnly && getVisibleLeads(tab).length === 0;

    // ONLOAD BG BLUE BACKGROUND

    const [bgLoaded, setBgLoaded] = useState(false);
    const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

    // Local storage for tracking collections
    useEffect(() => {
        try {
            const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setCollectionIds(parsed);
                }
            }
        } catch (error) {
            console.error('Failed to load collections from storage', error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collectionIds));
        } catch (error) {
            console.error('Failed to save collections to storage', error);
        }
    }, [collectionIds]);

    useEffect(() => {
        const img = new Image();
        img.src = images.uibg;
        img.onload = () => setBgLoaded(true);
    }, []);

    return (
        <AppLayout>
            
            <div id="leads" className="relative border-0 bg-transparent pt-0 pb-2.5">
                {/* Zindex Background */}
                <div
                    className={`absolute z-[2] hidden h-full w-full lg:block ${bgLoaded && isLeadsPage ? 'bg-[linear-gradient(180deg,#4D95AF_0%,#215568_100%)]' : bgLoaded && !isLeadsPage ? 'bg-[#031C5B] dark:lg:bg-gray-900' : 'bg-white'} `}
                ></div>
                <div
                    className="relative z-[3] flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{
                        backgroundImage: `url(${images.uibg})`,
                    }}
                >
                    <div
                        className={`relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full flex-col gap-3 overflow-y-auto px-2 pb-1 lg:py-0 lg:pr-9 lg:pl-7 xl:pr-0 ${activeTab === 'all' || activeTab === 'person' ? 'xl:pl-12' : 'xl:pl-16'} `}
                    >
                        <div className="grid h-screen grid-cols-1 gap-5 overflow-hidden pt-2 lg:grid-cols-[70%_30%] lg:p-4 xl:p-0 page-transition">
                            {/* LEFT COLUMN */}
                            <div className="flex flex-col space-y-4 pb-4 lg:pr-7">
                                {/* Search Header */}
                                <div className={`rounded-md bg-[#0B2B33] lg:bg-transparent`}>
                                    <div className="sticky top-0 z-10 flex items-center justify-between border-b-0 bg-transparent px-3 pt-4 pb-3 lg:px-0">
                                        {/* Desktop Heading */}
                                        <h2 className="hidden text-[12px] leading-2 font-normal text-white italic sm:w-[200px] sm:text-[14px] md:w-[150px] md:text-[15px] lg:block lg:w-[180px] lg:text-[19.5px] lg:leading-6 lg:text-gray-800 xl:w-[270px]">
                                            Search for your{' '}
                                            <span className="tex-white text-base font-extrabold sm:text-xl lg:text-3xl lg:leading-3 lg:text-deepBlue">
                                                next Leads
                                            </span>
                                        </h2>

                                        {/* Mobile Heading */}
                                        <h2 className="-mt-1 ml-4 w-[120px] text-[8.8px] leading-3 font-light text-white italic sm:w-[200px] sm:text-[14px] md:w-[150px] md:text-[15px] lg:ml-0 lg:hidden lg:w-[180px] lg:text-[19.5px] lg:leading-6 lg:text-gray-800 xl:w-[270px]">
                                            Search for your <br />
                                            next
                                            <span className="tex-white ml-1 text-[10px] font-extrabold sm:text-xl md:text-sm lg:text-3xl lg:leading-3 lg:text-deepBlue">
                                                Leads
                                            </span>
                                        </h2>

                                        <div className="lg:pace-x-2 flex w-full items-center space-x-0 lg:items-start">
                                            <div className="relative w-[80%]">
                                                <div className={`relative cursor-pointer`}>
                                                    <input
                                                        type="text"
                                                        placeholder="search  "
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full rounded-full border-0 bg-[#D3F1E729] px-4 py-2 pr-10 text-[10px] text-white italic placeholder:text-[11px] placeholder:font-light placeholder:text-white focus:ring-0 focus:outline-none disabled:opacity-50 lg:bg-[#BCD6F2CC] lg:px-4 lg:py-3 lg:pl-10 lg:text-deepBlack lg:placeholder:text-sm lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                                                    />

                                                    <button className={`absolute top-1/2 right-4 -translate-y-1/2 lg:right-10`}>
                                                        <img src={images.desktopSearch} className="hidden h-6 w-6 lg:block" alt="Search" />
                                                        <img src={images.aiSearch} className="h-5 w-5 lg:hidden" alt="AI Search" />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* FILTER SIDEBAR INTEGRATION FOR SEARCH */}

                                            <LeadsFilterSidebar
                                                variant={activeTab}
                                                onFilterChange={(values) => {
                                                    setFilters({
                                                        collectionOnly: values.collectionOnly,
                                                    });
                                                }}
                                            />

                                            {/* Admin Import/Export Dropdown - Compact single button */}
                                            {isAdmin && (
                                                <div className="hidden lg:block ml-2">
                                                    <LeadActionsDropdown
                                                        type={activeTab}
                                                        onImportClick={() => setIsImportModalOpen(true)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Section */}
                                <Tabs defaultValue="all" onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="lg:w-full">
                                    <div className="flex gap-x-5 lg:gap-x-0">
                                        <TabsList className="lg:bg-white4 mb-3 ml-4 no-scrollbar grid h-9 w-[70%] grid-cols-3 gap-5 overflow-x-auto rounded-full bg-[#F1EEEE] px-2 pr-6 shadow-[0px_2px_5px_-1px_rgba(0,0,0,0.2),0px_2px_5px_-1px_rgba(0,0,0,0.2)] md:overflow-hidden lg:mx-auto lg:mb-0 lg:w-[78%] lg:max-w-xl lg:gap-2 lg:rounded-none lg:bg-white! lg:px-0 lg:pr-0 lg:shadow-none">
                                            <TabsTrigger
                                                value="all"
                                                className="-mt-0.5 -ml-1 rounded-none rounded-l-full border-0 border-deepBlack px-10 py-[7px] text-[9.7px] font-normal text-deepBlack duration-200 data-[state=active]:rounded-l-full data-[state=active]:bg-[#1F4857] data-[state=active]:font-bold data-[state=active]:text-white data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:border-r-0 lg:border-b-2 lg:border-transparent lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:rounded-l-none lg:data-[state=active]:border-b-2 lg:data-[state=active]:border-b-[#27E6A7] lg:data-[state=active]:bg-transparent lg:data-[state=active]:text-darkBlue"
                                            >
                                                All Leads
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="company"
                                                className="-mt-0.5 rounded-none border-0 border-r border-deepBlack px-10 py-[7px] text-[9.7px] font-normal text-deepBlack duration-200 data-[state=active]:bg-[#1F4857] data-[state=active]:font-bold data-[state=active]:text-white data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:border-r-0 lg:border-b-2 lg:border-transparent lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:rounded-l-none lg:data-[state=active]:border-b-2 lg:data-[state=active]:border-b-[#27E6A7] lg:data-[state=active]:bg-transparent lg:data-[state=active]:text-darkBlue"
                                            >
                                                Company
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="person"
                                                className="-mt-0.5 rounded-none border-0 px-10 py-[7px] text-[9.7px] font-normal text-deepBlack duration-200 data-[state=active]:rounded-r-full data-[state=active]:bg-[#1F4857] data-[state=active]:font-bold data-[state=active]:text-white data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:border-r-0 lg:border-b-2 lg:border-transparent lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:rounded-l-none lg:data-[state=active]:rounded-r-none lg:data-[state=active]:border-b-2 lg:data-[state=active]:border-b-[#27E6A7] lg:data-[state=active]:bg-transparent lg:data-[state=active]:text-darkBlue"
                                            >
                                                Person
                                            </TabsTrigger>
                                        </TabsList>

                                        {/* Mobile Filter Connection Button */}

                                        <button
                                            title={filters.collectionOnly ? 'Show all leads' : 'Show collections'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFilters((prev) => ({
                                                    collectionOnly: !prev.collectionOnly,
                                                }));
                                            }}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full transition lg:hidden ${filters.collectionOnly ? 'bg-[#193E47]' : 'bg-darkBlue'} `}
                                        >
                                            <img
                                                src={images.bookmark}
                                                className={`h-5 w-5 transition ${filters.collectionOnly ? 'opacity-100' : 'opacity-60'}`}
                                                alt="collection filter"
                                            />
                                        </button>
                                    </div>

                                    {/* All Leads */}
                                    <TabsContent
                                        value="all"
                                        className="no-scrollbar h-screen overflow-y-auto rounded-[26px] bg-[#1F4857] pt-1 lg:bg-transparent lg:pt-3"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, delay: 0.1 }}
                                            className="no-scrollbar grid h-auto grid-cols-1 gap-4 overflow-y-auto pb-8 lg:h-[80vh] lg:grid-cols-4 lg:pt-6 lg:pb-20 lg:pl-3"
                                        >
                                            {isEmptyCollection('all') ? (
                                                <EmptyCollectionState />
                                            ) : (
                                                getVisibleLeads('all').map((lead) => (
                                                    <LeadsGridCard
                                                        key={lead.id}
                                                        lead={lead}
                                                        isCollected={collectionIds.includes(lead.id)}
                                                        collectionMode={filters.collectionOnly}
                                                        onToggleCollection={() => {
                                                            if (filters.collectionOnly) {
                                                                removeFromCollection(lead.id);
                                                            } else {
                                                                addToCollection(lead.id);
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            setSelectedLead(lead);
                                                            if (window.innerWidth < 1024) {
                                                                setIsMobileProfileOpen(true);
                                                            }
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </motion.div>
                                    </TabsContent>

                                    {/* Company Tab */}
                                    <TabsContent
                                        value="company"
                                        className="no-scrollbar h-screen overflow-y-auto rounded-2xl bg-[#1F4857] pt-1 lg:bg-transparent lg:pt-3"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, delay: 0.1 }}
                                            className="no-scrollbar grid h-auto grid-cols-1 gap-4 overflow-y-auto pb-8 lg:h-[80vh] lg:grid-cols-4 lg:pt-6 lg:pb-20 lg:pl-3"
                                        >
                                            {isEmptyCollection('company') ? (
                                                <EmptyCollectionState />
                                            ) : (
                                                getVisibleLeads('company').map((lead) => (
                                                    <LeadsGridCard
                                                        key={lead.id}
                                                        lead={lead}
                                                        isCollected={collectionIds.includes(lead.id)}
                                                        collectionMode={filters.collectionOnly}
                                                        onToggleCollection={() => {
                                                            if (filters.collectionOnly) {
                                                                removeFromCollection(lead.id);
                                                            } else {
                                                                addToCollection(lead.id);
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            setSelectedLead(lead);
                                                            if (window.innerWidth < 1024) {
                                                                setIsMobileProfileOpen(true);
                                                            }
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </motion.div>
                                    </TabsContent>

                                    {/* Person */}
                                    <TabsContent
                                        value="person"
                                        className="no-scrollbar h-screen overflow-y-auto rounded-2xl bg-[#1F4857] pt-1 lg:bg-transparent lg:pt-3"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, delay: 0.1 }}
                                            className="no-scrollbar grid h-auto grid-cols-1 gap-4 overflow-y-auto pb-8 lg:h-[80vh] lg:grid-cols-4 lg:pt-6 lg:pb-20 lg:pl-3"
                                        >
                                            {isEmptyCollection('person') ? (
                                                <EmptyCollectionState />
                                            ) : (
                                                getVisibleLeads('person').map((lead) => (
                                                    <LeadsGridCard
                                                        key={lead.id}
                                                        lead={lead}
                                                        isCollected={collectionIds.includes(lead.id)}
                                                        collectionMode={filters.collectionOnly}
                                                        onToggleCollection={() => {
                                                            if (filters.collectionOnly) {
                                                                removeFromCollection(lead.id);
                                                            } else {
                                                                addToCollection(lead.id);
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            setSelectedLead(lead);
                                                            if (window.innerWidth < 1024) {
                                                                setIsMobileProfileOpen(true);
                                                            }
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </motion.div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* RIGHT COLUMN  */}

                            <div className="hidden pt-2 lg:block">
                                {/* COMMUNITY CONTAINER */}
                                <div className="grid-card-shadow relative mr-10 aspect-auto overflow-hidden rounded-2xl">
                                    <div className="h-full w-full bg-gradient-to-r from-[#12553F] to-[#02251A] pl-6">
                                        <div className="flex w-full gap-3">
                                            <div className="flex w-[40%] flex-col justify-end pt-8 pb-3">
                                                <h4 className="leading-5 font-semibold text-white lg:text-[16px]">Let’s Join Our Community</h4>

                                                <div className="mt-3 flex items-center gap-1">
                                                    <div className="flex">
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${images.man3})`,
                                                            }}
                                                            className="relative h-6 w-6 overflow-hidden rounded-full bg-cover bg-top bg-no-repeat"
                                                        ></div>
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${images.man1})`,
                                                            }}
                                                            className="relative h-6 w-6 overflow-hidden rounded-full bg-cover bg-top bg-no-repeat"
                                                        ></div>
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${images.man5})`,
                                                            }}
                                                            className="relative h-6 w-6 overflow-hidden rounded-full bg-cover bg-top bg-no-repeat"
                                                        ></div>
                                                    </div>

                                                    <h4 className="ml-1 w-full flex-1 text-[9px] whitespace-nowrap text-white/70">200k+ People</h4>
                                                </div>
                                            </div>
                                            <div className="relative w-[60%]">
                                                <img className="absolute -bottom-3 w-full max-w-[340px]" src={images.flowerPattern} alt="" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SHOW PROFILE */}
                                <AnimatePresence mode="wait">
                                    {selectedSidebarData && (
                                        <div key={selectedSidebarData.name} className="mr-2 h-[76vh] w-full">
                                            <LeadsSidebar
                                                data={selectedSidebarData}
                                                isCollected={isSelectedLeadCollected}
                                                isUnlocked={selectedLead ? unlockedLeadIds.includes(selectedLead.id) : false}
                                                isUnlocking={isUnlocking}
                                                onToggleCollection={() => {
                                                    if (!selectedLead) return;

                                                    collectionIds.includes(selectedLead.id)
                                                        ? removeFromCollection(selectedLead.id)
                                                        : addToCollection(selectedLead.id);
                                                }}
                                                onViewFullProfile={() => setIsFullProfileOpen(true)}
                                                onUnlockLead={() => {
                                                    if (selectedLead) handleUnlockLead(selectedLead.id);
                                                }}
                                            />
                                        </div>
                                    )}
                                </AnimatePresence>

                                <div id="leadsMobileSidebar" className="lg:hidden!">
                                    {/* MOBILE PROFILE SIDEBAR */}

                                    <Sheet open={isMobileProfileOpen} onOpenChange={setIsMobileProfileOpen}>
                                        <SheetContent
                                            side="right"
                                            className="top-[60px] h-[77vh] max-w-[240px] overflow-y-hidden rounded-tl-4xl rounded-bl-4xl border-none bg-white p-2 outline-0 sm:max-w-[310px] md:overflow-y-auto md:rounded-tr-4xl md:rounded-br-4xl lg:top-0 lg:h-screen [&>button.absolute.right-4.top-4]:hidden"
                                        >
                                            <div className="h-full overflow-y-auto">
                                                {selectedSidebarData && (
                                                    <LeadsMobileSidebar
                                                        data={selectedSidebarData}
                                                        isCollected={isSelectedLeadCollected}
                                                        isUnlocked={selectedLead ? unlockedLeadIds.includes(selectedLead.id) : false}
                                                        isUnlocking={isUnlocking}
                                                        onToggleCollection={() => {
                                                            if (!selectedLead) return;

                                                            collectionIds.includes(selectedLead.id)
                                                                ? removeFromCollection(selectedLead.id)
                                                                : addToCollection(selectedLead.id);
                                                        }}
                                                        onViewFullProfile={() => setIsFullProfileOpen(true)}
                                                        onUnlockLead={() => {
                                                            if (selectedLead) handleUnlockLead(selectedLead.id);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>

                                {/* FULL PROFILE PANEL (Mobile + Desktop) */}
                                <Sheet open={isFullProfileOpen} onOpenChange={setIsFullProfileOpen}>
                                    <SheetContent
                                        side="right"
                                        className="w-[390px] max-w-[275px] border-none bg-transparent sm:max-w-md md:w-auto md:max-w-[700px] lg:max-w-[710px] [&>button.absolute.right-4.top-4]:hidden"
                                    >
                                        {selectedSidebarData && (
                                            <>
                                                <LeadFullProfilePanel data={selectedSidebarData} onClose={() => setIsFullProfileOpen(false)} />
                                            </>
                                        )}
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Import Modal */}
            {isAdmin && (
                <LeadImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImportComplete={() => {
                        // Refresh leads data after successful import
                        fetchLeads();
                        console.log('Import completed - refreshing leads');
                    }}
                />
            )}
        </AppLayout>
    );
}
