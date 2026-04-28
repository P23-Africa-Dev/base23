'use client';

export const dynamic = 'force-dynamic';

import images from '@/constants/image';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';

import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DirectoryLeadsSidebar from '@/components/cards/directory/directory-user-profile';
import axios from 'axios';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type User = {
    id: number;
    name: string;
    email: string;
    profile_picture?: string | null;
    company_name?: string;
};

// Profile type for sidebar display
type RecipientProfile = {
    name: string;
    title: string;
    imageSrc: string;
    experience: string;
    industry: string;
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

type DealCard = {
    id: number;
    title: string;
    description: string;
    deal_type: string;
    industry: string;
    timeline: string;
    geography: string;
    status: 'viewed' | 'accepted' | 'rejected' | 'pending';
    created_at: string;
    viewed_at?: string | null;
    time_spent?: number | null; // in minutes
    profile_views?: number | null;
    recipient: {
        id: number;
        name: string;
        email: string;
        profile_picture?: string | null;
        position?: string;
        company_name?: string;
        company_description?: string;
        industry?: string;
        country?: string;
        years_of_operation?: string;
        categories?: string;
        great_at?: string;
        goals?: string;
        selected_outcome?: string;
        rating?: number;
        created_at?: string;
    };
    sender?: {
        id: number;
        name: string;
        email: string;
        profile_picture?: string | null;
    };
};

interface Props extends PageProps {
    dealCards: DealCard[];
    users?: User[];
    stats?: {
        viewed: number;
        accepted: number;
        rejected: number;
        pending: number;
        total_sent: number;
    };
    activeTab?: string;
    connected?: Array<{ id: number; name: string }>;
    pending?: Array<{ id: number; name: string }>;
}

// Card gradient backgrounds
const cardGradients = [
    'linear-gradient(180deg, #FDEFE3 0%, #243F78 100%)',
    'linear-gradient(180deg, #E2FEF4 0%, #243F78 100%)',
    'linear-gradient(180deg, #F5EFFB 0%, #243F78 100%)',
];

function DealCardView({ auth, dealCards = [], users = [], stats, activeTab: initialTab = 'viewed', connected = [], pending = [] }: Props) {
    const [bgLoaded, setBgLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'viewed' | 'accepted' | 'rejected' | 'pending'>(initialTab as 'viewed' | 'accepted' | 'rejected' | 'pending');
    const [searchQuery, setSearchQuery] = useState('');

    // Forward modal state
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardingCard, setForwardingCard] = useState<DealCard | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [forwardSearchQuery, setForwardSearchQuery] = useState('');
    const [isForwarding, setIsForwarding] = useState(false);

    // Deal card detail modal state
    const [showDealCardModal, setShowDealCardModal] = useState(false);
    const [selectedDealCard, setSelectedDealCard] = useState<DealCard | null>(null);

    // Delivery & Open Status card state
    const [showStatsCard, setShowStatsCard] = useState(false);
    const [statsCardDealCard, setStatsCardDealCard] = useState<DealCard | null>(null);

    // Get counts from stats or calculate from dealCards
    const viewedCount = stats?.viewed ?? dealCards.filter(c => c.status === 'viewed').length;
    const acceptedCount = stats?.accepted ?? dealCards.filter(c => c.status === 'accepted').length;
    const rejectedCount = stats?.rejected ?? dealCards.filter(c => c.status === 'rejected').length;
    const pendingCount = stats?.pending ?? dealCards.filter(c => c.status === 'pending').length;

    useEffect(() => {
        const img = new Image();
        img.src = images.uibg;
        img.onload = () => setBgLoaded(true);
    }, []);

    // Format date helper
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

    // Format experience helper
    const formatExperience = (years: string | null | undefined): string => {
        if (!years || years.trim() === '') return 'Not specified';
        const cleaned = years.trim();
        if (/^\d+$/.test(cleaned)) {
            return `${cleaned} year${cleaned === '1' ? '' : 's'}`;
        }
        if (cleaned.toLowerCase().includes('year')) {
            return cleaned;
        }
        if (/^\d+/.test(cleaned)) {
            return `${cleaned} years`;
        }
        return cleaned;
    };

    // Format array data helper
    const formatArrayData = (data: string | string[] | null | undefined): string => {
        if (!data) return 'Not specified';
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed.join(', ');
                }
                return data;
            } catch {
                return data;
            }
        }
        if (Array.isArray(data)) {
            return data.join(', ');
        }
        return 'Not specified';
    };

    // Transform deal card recipient to profile format for sidebar display
    const transformRecipientToProfile = (recipient: DealCard['recipient']): RecipientProfile => ({
        name: recipient.name || 'Unknown User',
        title: recipient.position || 'Position not specified',
        imageSrc: recipient.profile_picture || '',
        experience: formatExperience(recipient.years_of_operation),
        industry: recipient.industry || 'Industry not specified',
        interest: formatArrayData(recipient.categories),
        reviews: recipient.rating ? recipient.rating.toString() : '0',
        baseLocation: recipient.country || 'Location not specified',
        operatesIn: recipient.country || 'Location not specified',
        bio: recipient.company_description || 'No bio available',
        companyStage: recipient.selected_outcome || 'Stage not specified',
        keyStrength: formatArrayData(recipient.great_at),
        topGoal: recipient.goals || 'Goals not specified',
        brnMemberSince: formatDate(recipient.created_at),
        responseRate: 'N/A',
        successfulDealsRate: 'N/A',
    });

    // Selected recipient state for sidebar - initialize with first deal card recipient
    const [selectedRecipient, setSelectedRecipient] = useState<RecipientProfile | null>(() => {
        if (dealCards.length > 0 && dealCards[0].recipient) {
            return transformRecipientToProfile(dealCards[0].recipient);
        }
        return null;
    });

    const [selectedRecipientId, setSelectedRecipientId] = useState<number>(() => {
        if (dealCards.length > 0 && dealCards[0].recipient) {
            return dealCards[0].recipient.id;
        }
        return 0;
    });

    // Handle recipient selection when clicking a deal card
    const handleRecipientClick = (card: DealCard) => {
        const profile = transformRecipientToProfile(card.recipient);
        setSelectedRecipient(profile);
        setSelectedRecipientId(card.recipient.id);
    };

    // Filter deal cards by status and search query
    const getFilteredCards = (status: string) => {
        let filtered = dealCards.filter(card => card.status === status);

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(card =>
                card.title.toLowerCase().includes(query) ||
                card.recipient.name.toLowerCase().includes(query) ||
                card.description?.toLowerCase().includes(query)
            );
        }

        return filtered;
    };

    const viewedCards = getFilteredCards('viewed');
    const acceptedCards = getFilteredCards('accepted');
    const rejectedCards = getFilteredCards('rejected');
    const pendingCards = getFilteredCards('pending');

    // Get gradient for card based on index
    const getCardGradient = (index: number) => cardGradients[index % cardGradients.length];

    // Sort and filter users for forward modal
    const sortedUsers = useMemo(() => {
        console.log('Users received from backend:', users);
        console.log('Auth user:', auth.user);

        const connectedIds = new Set(connected.map(u => u.id));
        // Filter out current user - users already filtered from backend but double-check
        const allUsers = (users || []).filter(u => u.id !== auth.user?.id);

        console.log('Filtered users for modal:', allUsers);

        return [...allUsers].sort((a, b) => {
            const aConnected = connectedIds.has(a.id) ? 1 : 0;
            const bConnected = connectedIds.has(b.id) ? 1 : 0;
            return bConnected - aConnected;
        });
    }, [users, connected, auth.user?.id]);

    const filteredForwardUsers = useMemo(() => {
        if (!forwardSearchQuery.trim()) return sortedUsers;
        const query = forwardSearchQuery.toLowerCase();
        return sortedUsers.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.company_name?.toLowerCase().includes(query)
        );
    }, [sortedUsers, forwardSearchQuery]);

    // Handle user selection for forwarding (max 10)
    // Get all recipient IDs that have already received this deal card
    const getAlreadySentUserIds = (dealCardId: number): Set<number> => {
        const recipientIds = dealCards
            .filter(card => card.id === dealCardId)
            .map(card => card.recipient.id);
        return new Set(recipientIds);
    };

    const handleUserSelect = (userId: number) => {
        // Prevent selecting users who already received this deal card
        if (forwardingCard) {
            const alreadySent = getAlreadySentUserIds(forwardingCard.id);
            if (alreadySent.has(userId)) {
                return; // Don't allow selection
            }
        }

        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            if (prev.length >= 10) {
                return prev;
            }
            return [...prev, userId];
        });
    };

    // Handle opening forward modal
    const handleForwardClick = (e: React.MouseEvent, card: DealCard) => {
        e.stopPropagation(); // Prevent sidebar from opening
        setForwardingCard(card);
        setShowForwardModal(true);
    };

    // Handle opening deal card detail modal
    const handleDealCardClick = (e: React.MouseEvent, card: DealCard) => {
        e.stopPropagation();
        setSelectedDealCard(card);
        setShowDealCardModal(true);
        // Also update the right sidebar
        handleRecipientClick(card);
    };

    // Handle forwarding deal card
    const handleForwardDealCard = async () => {
        if (!forwardingCard || selectedUsers.length === 0) return;

        setIsForwarding(true);
        try {
            const response = await axios.post(`/api/dealcards/${forwardingCard.id}/forward`, {
                recipient_ids: selectedUsers,
            });

            if (response.data.success) {
                setShowForwardModal(false);
                setForwardingCard(null);
                setSelectedUsers([]);
                setForwardSearchQuery('');
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to forward deal card:', error);
            alert('Failed to forward deal card. Please try again.');
        } finally {
            setIsForwarding(false);
        }
    };

    // Get first name from full name
    const getFirstName = (name: string) => name.split(' ')[0];
    const getLastName = (name: string) => {
        const parts = name.split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    };

    // Deal Card Component - profile image updates right sidebar, card body opens deal card details
    const DealCardItem = ({ card, index }: { card: DealCard; index: number }) => {
        // Handle profile picture click - updates the right sidebar display
        const handleProfileClick = (e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent deal card modal from opening
            handleRecipientClick(card); // Update the right sidebar
        };

        return (
            <div
                onClick={(e) => handleDealCardClick(e, card)}
                className={`relative h-[200px] w-[267px] cursor-pointer overflow-hidden rounded-[30px] shadow-[0px_1px_2px_2px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.02] ${selectedRecipientId === card.recipient.id ? 'ring-2 ring-[#eee] ring-offset-2' : ''}`}
                style={{ background: getCardGradient(index) }}
            >
                {/* Profile Picture - positioned at top - clicking updates the right sidebar */}
                <div className="absolute top-[35px] left-[24px] z-10 flex items-center gap-2">
                    <div
                        onClick={handleProfileClick}
                        className="h-[70px] w-[70px] overflow-hidden rounded-full border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-[#27E6A7] transition-all"
                    >
                        {card.recipient.profile_picture ? (
                            <img
                                src={card.recipient.profile_picture}
                                alt={card.recipient.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0B1727] to-[#193E47] text-white">
                                <span className="font-montserrat text-2xl font-semibold">
                                    {card.recipient.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className='relative top-3'>
                        {/* Deal Type Label */}
                        <p className="font-montserrat text-[9px] font-[400] capitalize leading-[14px] tracking-wide text-[#0B1727]">
                            {card.deal_type || 'Software Development'}
                        </p>

                        {/* Recipient Name */}
                        <p className="mt-0 font-montserrat text-[10px] font-[800] leading-[18px] text-[#193E47]">
                            Recipient: {card.recipient.name}
                        </p>
                    </div>
                </div>

                {/* Inner White Card */}
                <div className="absolute top-[60px] left-[8px] right-[8px] bottom-[8px] rounded-[24px] bg-white px-5 pt-10 pb-4">


                    {/* Description */}
                    <p className="mt-3 line-clamp-2 font-montserrat text-[8px] font-[500] leading-[14px] text-[#0B1727]">
                        {card.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.'}
                    </p>

                    {/* Bottom Row */}
                    <div className="absolute bottom-2 left-5 right-5 flex items-center justify-between">
                        <button
                            onClick={(e) => handleForwardClick(e, card)}
                            className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                        >
                            {/* <img src={images.shareKnowledge} className="h-4 w-4" alt="Send" /> */}

                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.3958 4.5H8.35413C5.40785 4.5 3.93471 4.5 3.01942 5.37868C2.10413 6.25736 2.10413 7.67157 2.10413 10.5V14.5C2.10413 17.3284 2.10413 18.7426 3.01942 19.6213C3.93471 20.5 5.40785 20.5 8.35413 20.5H12.5608C15.5071 20.5 16.9802 20.5 17.8955 19.6213C18.4885 19.052 18.6973 18.2579 18.7708 17" stroke="#535353" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M16.1667 7V3.85355C16.1667 3.65829 16.3316 3.5 16.535 3.5C16.6326 3.5 16.7263 3.53725 16.7954 3.60355L21.5275 8.14645C21.7634 8.37282 21.8958 8.67986 21.8958 9C21.8958 9.32014 21.7634 9.62718 21.5275 9.85355L16.7954 14.3964C16.7263 14.4628 16.6326 14.5 16.535 14.5C16.3316 14.5 16.1667 14.3417 16.1667 14.1464V11H13.1157C8.875 11 7.3125 14.5 7.3125 14.5V12C7.3125 9.23858 9.64435 7 12.5208 7H16.1667Z" stroke="#535353" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span className="font-montserrat text-[12px] font-[300] text-[#626C70]">
                                Send to Someone else
                            </span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setStatsCardDealCard(card);
                                setShowStatsCard(true);
                                handleRecipientClick(card); // Also update the sidebar
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B1727]/10 transition-colors hover:bg-[#0B1727]/20"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.33337 11.667V9.66699M7.66671 11.667V5.66699M11 11.667V9.00033" stroke="#4E4E4E" strokeWidth="0.7" strokeLinecap="round" />
                                <path d="M14.3334 3.66699C14.3334 4.77156 13.438 5.66699 12.3334 5.66699C11.2288 5.66699 10.3334 4.77156 10.3334 3.66699C10.3334 2.56243 11.2288 1.66699 12.3334 1.66699C13.438 1.66699 14.3334 2.56243 14.3334 3.66699Z" strokeWidth="0.7" stroke="#4E4E4E" />
                                <path d="M14.3303 7.33366C14.3303 7.33366 14.3333 7.55999 14.3333 8.00033C14.3333 10.9859 14.3333 12.4787 13.4058 13.4062C12.4783 14.3337 10.9855 14.3337 7.99996 14.3337C5.0144 14.3337 3.52162 14.3337 2.59412 13.4062C1.66663 12.4787 1.66663 10.9859 1.66663 8.00033C1.66663 5.01479 1.66663 3.52201 2.59412 2.59451C3.52162 1.66701 5.0144 1.66701 7.99996 1.66701L8.66663 1.66699" stroke="#4E4E4E" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Empty state component
    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex h-[400px] flex-col items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <p className="mt-4 font-montserrat text-sm text-gray-500">{message}</p>
        </div>
    );

    return (
        <AppLayout>
            

            <div className="relative border-0 bg-transparent pt-0 pb-2.5">
                {/* Background */}
                <div className={`absolute z-[2] hidden h-full w-full lg:block ${bgLoaded ? 'bg-[#031C5B] dark:lg:bg-gray-900' : 'bg-white'}`}></div>
                <div
                    className="relative z-[3] flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{ backgroundImage: `url(${images.uibg})` }}
                >
                    <div className="relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full flex-col gap-3 overflow-y-auto px-2 pb-1 lg:py-0 lg:pr-9 lg:pl-7 xl:pr-0 xl:pl-12">
                        <div className="grid h-screen grid-cols-1 gap-5 overflow-hidden pt-2 lg:grid-cols-[70%_30%] lg:p-4 xl:p-0">
                            {/* LEFT COLUMN */}
                            <div className="flex flex-col space-y-4 pb-4 lg:pr-7 lg:pl-3">
                                {/* Search Header */}
                                <div className="rounded-md bg-[#0B2B33] lg:bg-transparent">
                                    <div className="sticky top-0 z-10 flex items-center justify-between overflow-hidden border-b-0 bg-transparent px-3 pt-4 pb-3 lg:px-0">
                                        {/* Desktop Heading */}
                                        <h2 className="hidden text-[12px] leading-2 font-normal text-white italic sm:w-[200px] sm:text-[14px] md:w-[150px] md:text-[15px] lg:block lg:w-[180px] lg:text-[19.5px] lg:leading-6 lg:text-gray-800 xl:w-[270px]">
                                            Search for your{' '}
                                            <span className="tex-white text-base font-extrabold sm:text-xl lg:text-3xl lg:leading-3 lg:text-deepBlue">
                                                Deal Cards
                                            </span>
                                        </h2>

                                        {/* Mobile Heading */}
                                        <h2 className="-mt-1 ml-5 w-[120px] text-[9.8px] leading-3 font-light text-white italic sm:w-[200px] sm:text-[14px] md:w-[150px] md:text-[15px] lg:ml-0 lg:hidden lg:w-[180px] lg:text-[19.5px] lg:leading-6 lg:text-gray-800 xl:w-[270px]">
                                            Search for your{' '}
                                            <span className="tex-white text-[13px] font-extrabold sm:text-xl md:text-sm lg:text-3xl lg:leading-3 lg:text-deepBlue">
                                                Deal Cards
                                            </span>
                                        </h2>

                                        <div className="lg:pace-x-2 flex w-full items-center space-x-0 lg:items-start">
                                            <div className="relative w-full">
                                                <div className="relative cursor-pointer lg:mr-16">
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full rounded-full border-0 bg-[#D3F1E729] px-4 py-2.5 pr-10 text-xs text-white italic placeholder:text-[11px] placeholder:font-light placeholder:text-white focus:ring-0 focus:outline-none disabled:opacity-50 lg:bg-[#27E6A729] lg:px-4 lg:py-3 lg:pl-10 lg:text-deepBlack lg:placeholder:text-sm lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                                                    />
                                                    {searchQuery && (
                                                        <button
                                                            onClick={() => setSearchQuery('')}
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

                                                    <button className="absolute top-1/2 right-4 -translate-y-1/2 lg:right-10">
                                                        <img src={images.desktopSearch} className="hidden h-6 w-6 lg:block" alt="Search" />
                                                        <img src={images.aiSearch} className="h-5 w-5 lg:hidden" alt="Search" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Refresh Button */}
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="ml-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50 lg:ml-0"
                                        >

                                            <svg width="45" height="42" viewBox="0 0 45 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect width="45" height="42" rx="20" fill="#0B1727" />
                                                <path d="M31.0092 11V14.1322C31.0092 14.4261 30.6418 14.5591 30.4537 14.3333C28.6226 12.2875 25.9617 11 23 11C17.4771 11 13 15.4771 13 21C13 26.5228 17.4771 31 23 31C28.5228 31 33 26.5228 33 21" stroke="#F3F0E9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>

                                            {/* <svg className="h-5 w-5 text-[#0B1727]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg> */}
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs Section */}
                                <Tabs defaultValue={initialTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="mx-auto lg:w-full">
                                    <TabsList className="mx-auto mb-5 no-scrollbar grid w-[95%] grid-cols-4 gap-5 overflow-x-auto rounded-full bg-[#F1EEEE] px-3 shadow-[0px_2px_5px_-1px_rgba(0,0,0,0.2),0px_2px_5px_-1px_rgba(0,0,0,0.2)] md:overflow-hidden lg:mx-auto lg:mb-0 lg:w-full lg:max-w-2xl lg:gap-2 lg:rounded-none lg:bg-white lg:px-0 lg:shadow-none">
                                        <TabsTrigger
                                            value="viewed"
                                            className="-mt-0.5 -ml-1 rounded-full border-0 px-10 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Viewed {viewedCount > 0 && `(${viewedCount})`}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="accepted"
                                            className="-mx-2.5 -mt-0.5 rounded-full border-0 px-9.5 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Accepted {acceptedCount > 0 && `(${acceptedCount})`}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="rejected"
                                            className="-mx-2.5 -mt-0.5 rounded-full border-0 px-10.5 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:mx-0 lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Rejected {rejectedCount > 0 && `(${rejectedCount})`}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="pending"
                                            className="-mx-1.5 -mt-0.5 -ml-2.5 rounded-full border-0 px-9.5 py-[9px] text-[8px] font-normal text-deepBlue data-[state=active]:border-b-[#27E6A7] data-[state=active]:bg-[#A87EF7] data-[state=active]:font-bold data-[state=active]:text-darkBlue data-[state=active]:shadow-none md:text-[10px] lg:rounded-none lg:text-[13px] lg:text-darkBlue lg:data-[state=active]:border-b-3 lg:data-[state=active]:bg-transparent"
                                        >
                                            Pending {pendingCount > 0 && `(${pendingCount})`}
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Viewed Tab Content */}
                                    <TabsContent value="viewed" className="mt-2">
                                        <div className="no-scrollbar max-h-[65vh] overflow-y-auto pb-8">
                                            {viewedCards.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                    {viewedCards.map((card, index) => (
                                                        <DealCardItem key={card.id} card={card} index={index} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState message="No viewed deal cards yet" />
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Accepted Tab Content */}
                                    <TabsContent value="accepted" className="mt-2">
                                        <div className="no-scrollbar max-h-[65vh] overflow-y-auto pb-8">
                                            {acceptedCards.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                    {acceptedCards.map((card, index) => (
                                                        <DealCardItem key={card.id} card={card} index={index} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState message="No accepted deal cards yet" />
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Rejected Tab Content */}
                                    <TabsContent value="rejected" className="mt-2">
                                        <div className="no-scrollbar max-h-[65vh] overflow-y-auto pb-8">
                                            {rejectedCards.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                    {rejectedCards.map((card, index) => (
                                                        <DealCardItem key={card.id} card={card} index={index} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState message="No rejected deal cards yet" />
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Pending Tab Content */}
                                    <TabsContent value="pending" className="mt-2">
                                        <div className="no-scrollbar max-h-[65vh] overflow-y-auto pb-8">
                                            {pendingCards.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                    {pendingCards.map((card, index) => (
                                                        <DealCardItem key={card.id} card={card} index={index} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState message="No pending deal cards yet" />
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* RIGHT COLUMN (Recipient Profile Preview) */}
                            <div className="relative hidden lg:block">
                                <AnimatePresence mode="wait">
                                    {selectedRecipient && (
                                        <motion.div
                                            key={selectedRecipient.name}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="h-full w-full overflow-y-auto px-2"
                                        >
                                            <DirectoryLeadsSidebar
                                                userId={selectedRecipientId}
                                                authUserId={auth.user?.id ?? 0}
                                                name={selectedRecipient.name}
                                                title={selectedRecipient.title}
                                                imageSrc={selectedRecipient.imageSrc}
                                                experience={selectedRecipient.experience}
                                                industry={selectedRecipient.industry}
                                                interest={selectedRecipient.interest}
                                                reviews={selectedRecipient.reviews}
                                                baseLocation={selectedRecipient.baseLocation}
                                                operatesIn={selectedRecipient.operatesIn}
                                                bio={selectedRecipient.bio}
                                                companyStage={selectedRecipient.companyStage}
                                                keyStrength={selectedRecipient.keyStrength}
                                                topGoal={selectedRecipient.topGoal}
                                                brnMemberSince={selectedRecipient.brnMemberSince}
                                                responseRate={selectedRecipient.responseRate}
                                                successfulDealsRate={selectedRecipient.successfulDealsRate}
                                                variant="all"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Delivery & Open Status Card Overlay */}
                                <AnimatePresence mode="wait">
                                    {showStatsCard && statsCardDealCard && (
                                        <motion.div
                                            key={statsCardDealCard.id}
                                            initial={{ opacity: 0, x: 100 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 100 }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            className="absolute bottom-4 right-4 left-4 z-20"
                                        >
                                            <div className="rounded-[16px] bg-[#0B1727] p-5 shadow-xl">
                                                {/* Header with title and info icon */}
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-montserrat text-[16px] font-[800] leading-[100%] text-[#F3F0E9]">
                                                                Delivery & Open Status
                                                            </h3>
                                                            <img className="h-6 w-6" src={images.informationCircle} alt="Information icon" />
                                                        </div>
                                                        <p className="mt-1 font-montserrat text-[10px] font-[300] leading-[14px] text-[#F3F0E9]/70">
                                                            updated in real time
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowStatsCard(false)}
                                                        className="flex h-5 w-5 items-center justify-center rounded-full text-[#F3F0E9]/70 transition-colors hover:text-[#F3F0E9]"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Top Stats Row: Date Sent & Opened */}
                                                <div className="mt-4 grid grid-cols-2 gap-3">
                                                    <div className="rounded-[8px] border border-[#B9B9B9] px-3 py-2">
                                                        <p className="font-montserrat text-[8px] font-[400] leading-[17px] tracking-[-0.3px] text-[#F3F0E9]/70">
                                                            Date Sent
                                                        </p>
                                                        <p className="font-montserrat text-[12px] font-[800] leading-[100%] text-[#F3F0E9]">
                                                            {statsCardDealCard.created_at
                                                                ? new Date(statsCardDealCard.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-[8px] border border-[#B9B9B9] px-3 py-2">
                                                        <p className="font-montserrat text-[8px] font-[400] leading-[17px] tracking-[-0.3px] text-[#F3F0E9]/70">
                                                            Opened
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-montserrat text-[12px] font-[800] leading-[100%] text-[#F3F0E9]">
                                                                {statsCardDealCard.viewed_at
                                                                    ? new Date(statsCardDealCard.viewed_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })
                                                                    : 'Not opened'}
                                                            </p>
                                                            {statsCardDealCard.viewed_at && (
                                                                <span className="rounded bg-[#F3F0E9]/20 px-1.5 py-0.5 font-montserrat text-[8px] text-[#F3F0E9]">
                                                                    {new Date(statsCardDealCard.viewed_at).toLocaleTimeString('en-US', {
                                                                        hour: 'numeric',
                                                                        minute: '2-digit',
                                                                        hour12: true,
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Stats Row: Time Spent & Profile Views */}
                                                <div className="mt-3 grid grid-cols-2 gap-3">
                                                    <div className="rounded-[8px] border border-[#B9B9B9] px-3 py-2">
                                                        <p className="font-montserrat text-[8px] font-[400] leading-[17px] tracking-[-0.3px] text-[#F3F0E9]/70">
                                                            Time Spent
                                                        </p>
                                                        <p className="font-montserrat text-[12px] font-[800] leading-[100%] text-[#F3F0E9]">
                                                            {statsCardDealCard.time_spent
                                                                ? `${statsCardDealCard.time_spent} minutes`
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-[8px] border border-[#B9B9B9] px-3 py-2">
                                                        <p className="font-montserrat text-[8px] font-[400] leading-[17px] tracking-[-0.3px] text-[#F3F0E9]/70">
                                                            Profile Views
                                                        </p>
                                                        <p className="font-montserrat text-[12px] font-[800] leading-[100%] text-[#F3F0E9]">
                                                            {statsCardDealCard.profile_views !== null && statsCardDealCard.profile_views !== undefined
                                                                ? `${statsCardDealCard.profile_views} times`
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Send to Someone else link */}
                                                <div className="mt-4 flex items-center gap-2">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M9.3958 4.5H8.35413C5.40785 4.5 3.93471 4.5 3.01942 5.37868C2.10413 6.25736 2.10413 7.67157 2.10413 10.5V14.5C2.10413 17.3284 2.10413 18.7426 3.01942 19.6213C3.93471 20.5 5.40785 20.5 8.35413 20.5H12.5608C15.5071 20.5 16.9802 20.5 17.8955 19.6213C18.4885 19.052 18.6973 18.2579 18.7708 17" stroke="#F3F0E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M16.1667 7V3.85355C16.1667 3.65829 16.3316 3.5 16.535 3.5C16.6326 3.5 16.7263 3.53725 16.7954 3.60355L21.5275 8.14645C21.7634 8.37282 21.8958 8.67986 21.8958 9C21.8958 9.32014 21.7634 9.62718 21.5275 9.85355L16.7954 14.3964C16.7263 14.4628 16.6326 14.5 16.535 14.5C16.3316 14.5 16.1667 14.3417 16.1667 14.1464V11H13.1157C8.875 11 7.3125 14.5 7.3125 14.5V12C7.3125 9.23858 9.64435 7 12.5208 7H16.1667Z" stroke="#F3F0E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowStatsCard(false);
                                                            setForwardingCard(statsCardDealCard);
                                                            setShowForwardModal(true);
                                                        }}
                                                        className="font-montserrat text-[12px] font-[300] text-[#F3F0E9]/80 hover:text-[#F3F0E9] transition-colors"
                                                    >
                                                        Send to Someone else,
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Forward Deal Card Modal */}
            {showForwardModal && forwardingCard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative mx-4 w-full max-w-[600px] rounded-[20px] bg-white p-6 shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowForwardModal(false);
                                setForwardingCard(null);
                                setSelectedUsers([]);
                                setForwardSearchQuery('');
                            }}
                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Title */}
                        <h2 className="mb-2 text-center font-montserrat text-xl font-semibold text-[#0B1727]">
                            Forward Deal Card
                        </h2>
                        <p className="mb-6 text-center font-montserrat text-sm text-gray-500">
                            "{forwardingCard.title}"
                        </p>

                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={forwardSearchQuery}
                                onChange={(e) => setForwardSearchQuery(e.target.value)}
                                className="h-[50px] w-full rounded-full border border-gray-200 bg-[#F5F5F5] py-3 pr-12 pl-5 font-montserrat text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#0B2B5B] focus:ring-1 focus:ring-[#0B2B5B]"
                            />
                            <div className="absolute top-1/2 right-4 -translate-y-1/2">
                                <img src={images.aiSearch} className="h-5 w-5" alt="Search" />
                            </div>
                        </div>

                        {/* Selection Info */}
                        {selectedUsers.length > 0 && (
                            <div className="mb-4 text-center">
                                <span className="font-montserrat text-sm text-gray-600">
                                    {selectedUsers.length} of 10 selected
                                </span>
                            </div>
                        )}

                        {/* Users Grid */}
                        <div className="no-scrollbar max-h-[300px] overflow-y-auto">
                            <div className="grid grid-cols-6 gap-x-4 gap-y-6">
                                {filteredForwardUsers.map((user) => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    const isConnected = connected.some(c => c.id === user.id);
                                    const alreadySentIds = forwardingCard ? getAlreadySentUserIds(forwardingCard.id) : new Set<number>();
                                    const isAlreadySent = alreadySentIds.has(user.id);

                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => !isAlreadySent && handleUserSelect(user.id)}
                                            className={`flex flex-col items-center transition-all ${isAlreadySent
                                                ? 'opacity-50 cursor-not-allowed'
                                                : isSelected
                                                    ? 'scale-105 cursor-pointer'
                                                    : 'hover:scale-105 cursor-pointer'
                                                } ${selectedUsers.length >= 10 && !isSelected && !isAlreadySent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {/* User Avatar */}
                                            <div className={`relative h-14 w-14 overflow-hidden rounded-full border-2 ${isAlreadySent
                                                ? 'border-orange-400 ring-2 ring-orange-400/30'
                                                : isSelected
                                                    ? 'border-[#0FAF62] ring-2 ring-[#0FAF62]/30'
                                                    : 'border-transparent'
                                                }`}>
                                                {user.profile_picture ? (
                                                    <img
                                                        src={user.profile_picture}
                                                        alt={user.name}
                                                        className={`h-full w-full object-cover ${isAlreadySent ? 'grayscale' : ''}`}
                                                    />
                                                ) : (
                                                    <div className={`flex h-full w-full items-center justify-center ${isAlreadySent
                                                        ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                                        : 'bg-gradient-to-br from-[#0B1727] to-[#193E47]'
                                                        } text-white`}>
                                                        <span className="font-montserrat text-lg font-semibold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Already Sent Badge */}
                                                {isAlreadySent && (
                                                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                                                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Selection Checkmark */}
                                                {isSelected && !isAlreadySent && (
                                                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0FAF62]">
                                                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* User Name */}
                                            <div className="mt-2 text-center">
                                                <p className={`font-montserrat text-[10px] font-semibold leading-tight ${isAlreadySent ? 'text-gray-400' : 'text-[#0B1727]'}`}>
                                                    {getFirstName(user.name)}
                                                </p>
                                                <p className={`font-montserrat text-[10px] font-normal leading-tight ${isAlreadySent ? 'text-gray-400' : 'text-[#0B1727]'}`}>
                                                    {getLastName(user.name)}
                                                </p>
                                                {isAlreadySent ? (
                                                    <span className="font-montserrat text-[8px] text-orange-500">
                                                        Already sent
                                                    </span>
                                                ) : isConnected ? (
                                                    <span className="font-montserrat text-[8px] text-[#0FAF62]">
                                                        Connected
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Empty State */}
                            {filteredForwardUsers.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="font-montserrat text-sm text-gray-500">No users found</p>
                                    <p className="mt-1 font-montserrat text-xs text-gray-400">Try a different search term</p>
                                </div>
                            )}
                        </div>

                        {/* Forward Button */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleForwardDealCard}
                                disabled={selectedUsers.length === 0 || isForwarding}
                                className={`h-[45px] w-full max-w-[200px] rounded-full font-montserrat text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedUsers.length > 0 && !isForwarding
                                    ? 'bg-[#0B1727] hover:bg-[#0a2550] focus:ring-[#0B2B5B]'
                                    : 'cursor-not-allowed bg-gray-300'
                                    }`}
                            >
                                {isForwarding ? 'Forwarding...' : `Forward to ${selectedUsers.length > 0 ? `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}` : 'selected'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deal Card Detail Modal */}
            {showDealCardModal && selectedDealCard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative mx-4 w-full max-w-[700px] rounded-[24px] bg-white p-0 shadow-2xl overflow-hidden">
                        {/* Header with gradient background */}
                        <div
                            className="relative h-[140px] px-6 pt-6"
                            style={{ background: cardGradients[0] }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowDealCardModal(false);
                                    setSelectedDealCard(null);
                                }}
                                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Sender Info */}
                            <div className="flex items-center gap-3">
                                <div className="h-[60px] w-[60px] overflow-hidden rounded-full border-2 border-white shadow-md">
                                    {selectedDealCard.sender?.profile_picture ? (
                                        <img
                                            src={selectedDealCard.sender.profile_picture}
                                            alt={selectedDealCard.sender?.name || 'Sender'}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0B1727] to-[#193E47] text-white">
                                            <span className="font-montserrat text-xl font-semibold">
                                                {(selectedDealCard.sender?.name || 'S').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-montserrat text-xs text-white/80">Sent by</p>
                                    <p className="font-montserrat text-lg font-bold text-white">{selectedDealCard.sender?.name || 'You'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="relative -mt-10 mx-4 rounded-[20px] bg-white p-6 shadow-lg mb-6">
                            {/* Status Badge */}
                            <div className="absolute -top-3 right-6">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${selectedDealCard.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                    selectedDealCard.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        selectedDealCard.status === 'viewed' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {selectedDealCard.status}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="font-montserrat text-xl font-bold text-[#0B1727] mb-4 pr-20">
                                {selectedDealCard.title}
                            </h2>

                            {/* Description */}
                            <div className="mb-6">
                                <p className="font-montserrat text-sm text-gray-600 leading-relaxed">
                                    {selectedDealCard.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Deal Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="font-montserrat text-xs text-gray-500 mb-1">Deal Type</p>
                                    <p className="font-montserrat text-sm font-semibold text-[#0B1727] capitalize">
                                        {selectedDealCard.deal_type || 'Not specified'}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="font-montserrat text-xs text-gray-500 mb-1">Industry</p>
                                    <p className="font-montserrat text-sm font-semibold text-[#0B1727]">
                                        {selectedDealCard.industry || 'Not specified'}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="font-montserrat text-xs text-gray-500 mb-1">Timeline</p>
                                    <p className="font-montserrat text-sm font-semibold text-[#0B1727]">
                                        {selectedDealCard.timeline || 'Not specified'}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="font-montserrat text-xs text-gray-500 mb-1">Geography</p>
                                    <p className="font-montserrat text-sm font-semibold text-[#0B1727]">
                                        {selectedDealCard.geography || 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            {/* Recipient Section */}
                            <div className="border-t border-gray-100 pt-4">
                                <p className="font-montserrat text-xs text-gray-500 mb-3">Sent to</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-[45px] w-[45px] overflow-hidden rounded-full border-2 border-[#27E6A7] shadow-sm">
                                        {selectedDealCard.recipient.profile_picture ? (
                                            <img
                                                src={selectedDealCard.recipient.profile_picture}
                                                alt={selectedDealCard.recipient.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0B1727] to-[#193E47] text-white">
                                                <span className="font-montserrat text-lg font-semibold">
                                                    {selectedDealCard.recipient.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-montserrat text-sm font-semibold text-[#0B1727]">
                                            {selectedDealCard.recipient.name}
                                        </p>
                                        <p className="font-montserrat text-xs text-gray-500">
                                            {selectedDealCard.recipient.position || selectedDealCard.recipient.company_name || 'No position'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="mt-4 text-right">
                                <p className="font-montserrat text-xs text-gray-400">
                                    Created {formatDate(selectedDealCard.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 pb-6 flex gap-3 justify-center">
                            <button
                                onClick={(e) => {
                                    setShowDealCardModal(false);
                                    handleForwardClick(e, selectedDealCard);
                                }}
                                className="flex items-center gap-2 rounded-full bg-[#0B1727] px-6 py-3 font-montserrat text-sm font-semibold text-white transition-all hover:bg-[#0a2550]"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.3958 4.5H8.35413C5.40785 4.5 3.93471 4.5 3.01942 5.37868C2.10413 6.25736 2.10413 7.67157 2.10413 10.5V14.5C2.10413 17.3284 2.10413 18.7426 3.01942 19.6213C3.93471 20.5 5.40785 20.5 8.35413 20.5H12.5608C15.5071 20.5 16.9802 20.5 17.8955 19.6213C18.4885 19.052 18.6973 18.2579 18.7708 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16.1667 7V3.85355C16.1667 3.65829 16.3316 3.5 16.535 3.5C16.6326 3.5 16.7263 3.53725 16.7954 3.60355L21.5275 8.14645C21.7634 8.37282 21.8958 8.67986 21.8958 9C21.8958 9.32014 21.7634 9.62718 21.5275 9.85355L16.7954 14.3964C16.7263 14.4628 16.6326 14.5 16.535 14.5C16.3316 14.5 16.1667 14.3417 16.1667 14.1464V11H13.1157C8.875 11 7.3125 14.5 7.3125 14.5V12C7.3125 9.23858 9.64435 7 12.5208 7H16.1667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Forward to Someone
                            </button>
                            <button
                                onClick={() => {
                                    setShowDealCardModal(false);
                                    setSelectedDealCard(null);
                                }}
                                className="rounded-full border border-gray-300 px-6 py-3 font-montserrat text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

export default DealCardView;
