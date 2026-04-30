'use client';

export const dynamic = 'force-dynamic';

import images from '@/constants/image';

import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { useAuth } from '@/context/AuthContext';

import axios from 'axios';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// import { Upload } from 'lucide-react';

type User = {
    id: number;
    name: string;
    email: string;
    profile_picture?: string | null;
    company_name?: string;
    company_description?: string;
    industry?: string;
    categories?: string;
    great_at?: string;
    can_help_with?: string;
    rating?: number;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    phone?: string;
    linkedin?: string;
    country?: string;
    position?: string;
    years_of_operation?: string;
    number_of_employees?: string;
    selected_outcome?: string;
    goals?: string;
    similarity_score?: number;
};

type DealStats = {
    viewed: number;
    accepted: number;
    rejected: number;
    pending: number;
    total_sent: number;
    viewed_rate?: number;
    accepted_rate?: number;
    rejected_rate?: number;
};

type RecentDeal = {
    id: number;
    title: string;
    deal_type: string;
    recipient_names: string;
    recipient_count: number;
    status: 'pending' | 'viewed' | 'accepted' | 'rejected';
    created_at: string;
    viewed_at?: string | null;
    time_spent?: number | null;
    profile_views?: number | null;
};

interface Props extends PageProps {
    users: User[];
    connected: User[];
    pending: User[];
    recentDeals?: RecentDeal[];
    stats?: DealStats;
    recommendedLeads?: User[];
    needsOnboarding?: boolean;
}

function DealCardContent({ auth, users, connected, pending, recentDeals = [], stats, recommendedLeads, needsOnboarding }: Props) {
    const [bgLoaded, setBgLoaded] = useState(false);
    const [showSendToModal, setShowSendToModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Statistics card state
    const [showStatsCard, setShowStatsCard] = useState(false);
    const [statsCardDeal, setStatsCardDeal] = useState<RecentDeal | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        deal_type: '',
        industry: '',
        description: '',
        timeline: '',
        geography: '',
    });

    useEffect(() => {
        const img = new Image();
        img.src = images.uibg;
        img.onload = () => setBgLoaded(true);
    }, []);

    // Sort users: connected first, then by activity/rating
    const sortedUsers = useMemo(() => {
        const connectedArray = connected || [];
        const usersArray = users || [];
        const connectedIds = new Set(connectedArray.map(u => u.id));
        const allUsers = usersArray.filter(u => u.id !== auth.user?.id);

        return [...allUsers].sort((a, b) => {
            // Connected users first
            const aConnected = connectedIds.has(a.id) ? 1 : 0;
            const bConnected = connectedIds.has(b.id) ? 1 : 0;
            if (bConnected !== aConnected) return bConnected - aConnected;

            // Then by rating (most active indicator)
            const aRating = a.rating || 0;
            const bRating = b.rating || 0;
            return bRating - aRating;
        });
    }, [users, connected, auth.user?.id]);

    // Filter users by search query
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return sortedUsers;
        const query = searchQuery.toLowerCase();
        return sortedUsers.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.company_name?.toLowerCase().includes(query)
        );
    }, [sortedUsers, searchQuery]);

    // Handle user selection (max 10)
    const handleUserSelect = (userId: number) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            if (prev.length >= 10) {
                return prev; // Max 10 selections
            }
            return [...prev, userId];
        });
    };

    // Handle form submit
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Please enter a deal title');
            return;
        }
        setShowSendToModal(true);
    };

    // Handle send deal card
    const handleSendDealCard = async () => {
        if (selectedUsers.length === 0) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/dealcards', {
                ...formData,
                recipient_ids: selectedUsers,
            });

            if (response.data.success) {
                // Reset form and modal
                setShowSendToModal(false);
                setSelectedUsers([]);
                setSearchQuery('');
                setFormData({
                    title: '',
                    deal_type: '',
                    industry: '',
                    description: '',
                    timeline: '',
                    geography: '',
                });

                // Refresh the page to show updated data
                window.location.reload();
            }
        } catch (error: unknown) {
            console.error('Failed to send deal card:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to send deal card. Please try again.';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get first name from full name
    const getFirstName = (name: string) => {
        const parts = name.split(' ');
        return parts[0];
    };

    // Get last name from full name
    const getLastName = (name: string) => {
        const parts = name.split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    };

    return (
        <AppLayout>
            

            <div className="main-dashboard relative border-0 bg-transparent pt-0 pb-2.5">
                {/* Zindex Background */}
                <div className={`absolute z-[2] hidden h-full w-full lg:block ${bgLoaded ? 'bg-[#031C5B] dark:lg:bg-gray-900' : 'bg-white'} `}></div>
                <div
                    className="relative z-[3] flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{
                        backgroundImage: `url(${images.uibg})`,
                    }}
                >
                    <div className="relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full flex-col gap-3 overflow-y-auto px-2 pb-20 lg:py-4 lg:pb-10 lg:pr-9 lg:pl-7 xl:pr-17 xl:pl-12">
                        {/* FIRST DEALS CARDS ROW */}
                        <div className="grid auto-rows-min gap-4 pt-5 lg:grid-cols-3 stagger-children">
                            {/* Viewed Deal Card */}
                            <div
                                onClick={() => window.location.href = '/dealcard/view?tab=viewed'}
                                className="relative h-[148px] w-full max-w-[350px] cursor-pointer overflow-hidden rounded-[10px] bg-[#F0F6FF] p-5 shadow-[0px_1px_2px_2px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.02] hover:shadow-[0px_2px_4px_3px_rgba(0,0,0,0.2)] hover-lift"
                            >
                                <div className="flex h-full flex-col justify-between">
                                    <div className="flex flex-row items-start justify-between">
                                        <div>
                                            <h4 className="mb-2 font-montserrat text-xs font-medium uppercase leading-none tracking-normal text-[#626C70]">
                                                Viewed Deal CARD
                                            </h4>
                                            <p className="font-montserrat text-2xl font-semibold leading-8 tracking-normal text-black">
                                                {stats?.viewed?.toLocaleString() || 0}
                                            </p>
                                        </div>

                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-5">
                                            <img className="h-6 w-6" src={images.dealcrdfolder} alt="Folder icon" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-x-1">
                                        {(stats?.viewed_rate ?? 0) >= 0 ? (
                                            <ArrowUp className="h-4 w-4 text-[#0FAF62]" />
                                        ) : (
                                            <ArrowDown className="h-4 w-4 text-[#E53935]" />
                                        )}
                                        <span className={`font-montserrat text-sm font-medium leading-5 ${(stats?.viewed_rate ?? 0) >= 0 ? 'text-[#0FAF62]' : 'text-[#E53935]'}`}>
                                            {Math.abs(stats?.viewed_rate ?? 0).toFixed(1)}% {(stats?.viewed_rate ?? 0) >= 0 ? 'Increase' : 'Decrease'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Accepted Deal Card */}
                            <div
                                onClick={() => window.location.href = '/dealcard/view?tab=accepted'}
                                className="relative h-[148px] w-full max-w-[350px] cursor-pointer overflow-hidden rounded-[10px] bg-[#FFFAC2] p-5 shadow-[0px_1px_2px_2px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.02] hover:shadow-[0px_2px_4px_3px_rgba(0,0,0,0.2)] hover-lift"
                            >
                                <div className="flex h-full flex-col justify-between">
                                    <div className="flex flex-row items-start justify-between">
                                        <div>
                                            <h4 className="mb-2 font-montserrat text-xs font-medium uppercase leading-none tracking-normal text-[#626C70]">
                                                ACCEPTED Deal CARD
                                            </h4>
                                            <p className="font-montserrat text-2xl font-semibold leading-8 tracking-normal text-black">
                                                {stats?.accepted?.toLocaleString() || 0}
                                            </p>
                                        </div>

                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-5">
                                            <img className="h-6 w-6" src={images.dealcrdaccept} alt="Folder icon" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-x-1">
                                        {(stats?.accepted_rate ?? 0) >= 0 ? (
                                            <ArrowUp className="h-4 w-4 text-[#0FAF62]" />
                                        ) : (
                                            <ArrowDown className="h-4 w-4 text-[#E53935]" />
                                        )}
                                        <span className={`font-montserrat text-sm font-medium leading-5 ${(stats?.accepted_rate ?? 0) >= 0 ? 'text-[#0FAF62]' : 'text-[#E53935]'}`}>
                                            {Math.abs(stats?.accepted_rate ?? 0).toFixed(1)}% {(stats?.accepted_rate ?? 0) >= 0 ? 'Increase' : 'Decrease'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Rejected Deal Card */}
                            <div
                                onClick={() => window.location.href = '/dealcard/view?tab=rejected'}
                                className="relative h-[148px] w-full max-w-[350px] cursor-pointer overflow-hidden rounded-[10px] bg-[#FDCECC] p-5 shadow-[0px_1px_2px_2px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.02] hover:shadow-[0px_2px_4px_3px_rgba(0,0,0,0.2)] hover-lift"
                            >
                                <div className="flex h-full flex-col justify-between">
                                    <div className="flex flex-row items-start justify-between">
                                        <div>
                                            <h4 className="mb-2 font-montserrat text-xs font-medium uppercase leading-none tracking-normal text-[#626C70]">
                                                Rejected Deal CARD
                                            </h4>
                                            <p className="font-montserrat text-2xl font-semibold leading-8 tracking-normal text-black">
                                                {stats?.rejected?.toLocaleString() || 0}
                                            </p>
                                        </div>

                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-5">
                                            <img className="h-6 w-6" src={images.dealcrdreject} alt="Folder icon" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-x-1">
                                        {(stats?.rejected_rate ?? 0) >= 0 ? (
                                            <ArrowUp className="h-4 w-4 text-[#0FAF62]" />
                                        ) : (
                                            <ArrowDown className="h-4 w-4 text-[#E53935]" />
                                        )}
                                        <span className={`font-montserrat text-sm font-medium leading-5 ${(stats?.rejected_rate ?? 0) >= 0 ? 'text-[#0FAF62]' : 'text-[#E53935]'}`}>
                                            {Math.abs(stats?.rejected_rate ?? 0).toFixed(1)}% {(stats?.rejected_rate ?? 0) >= 0 ? 'Increase' : 'Decrease'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SENDING DEALS TO USER CARDS ROW */}
                        <div className="rounded-[40px] bg-white p-4 shadow-sm animate-fadeInUp animate-delay-200">
                            <div className="flex flex-col gap-4 lg:flex-row">
                                {/* Deal Card Creation Section - Left Side */}
                                <div className="relative flex-2 rounded-[30px] bg-white">
                                    {/* Top Header Card - constrained width */}
                                    <div className="flex h-[130px] flex-col items-center justify-center rounded-tl-[23px] rounded-tr-[23px] rounded-br-[20px] rounded-bl-[20px] bg-[#0B1727] text-white">
                                        <div className="text-center">
                                            <h3 className="font-montserrat text-2xl font-bold leading-[17px] tracking-[0px]">
                                                Deal Card Creation
                                            </h3>
                                            <p className="mx-auto mt-4 max-w-[220px] font-montserrat text-xs font-light leading-3 tracking-[0.5px] opacity-90">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                            </p>
                                        </div>
                                    </div>

                                    {/* FORM AREA */}
                                    <form className="mt-8 px-1" onSubmit={handleFormSubmit}>
                                        <div className="mx-auto flex max-w-[680px] flex-col gap-6 md:flex-row md:justify-center md:gap-[40px]">
                                            {/* Left Column - Deal Title, Deal Type, Industry */}
                                            <div className="w-full space-y-5 md:w-[264px]">
                                                {/* Deal Title */}
                                                <div className="w-full">
                                                    <label className="mb-2 block px-2 font-montserrat text-base font-bold leading-none text-[#193E47]">
                                                        Deal Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Input Deal Title"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                        className="h-[60px] w-[264px] rounded-[20px] border-[1.5px] border-[#C0E7EA] bg-white py-2.5 pr-4 pl-[15px] font-montserrat text-sm text-gray-900 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] outline-none transition-all placeholder:text-xs placeholder:font-light placeholder:text-gray-400 focus:border-[#0B2B5B] focus:ring-1 focus:ring-[#0B2B5B]"
                                                        required
                                                    />
                                                </div>

                                                {/* Deal Type */}
                                                <div className="w-full">
                                                    <label className="mb-2 block px-2 font-montserrat text-base font-bold leading-none text-[#193E47]">
                                                        Deal Type
                                                    </label>
                                                    <div className="relative w-[264px]">
                                                        <select
                                                            value={formData.deal_type}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, deal_type: e.target.value }))}
                                                            className="h-[60px] w-full appearance-none rounded-[20px] border-[1.5px] border-[#C0E7EA] bg-white py-2.5 pr-10 pl-[15px] font-montserrat text-xs text-gray-900 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] outline-none transition-all focus:border-[#0B2B5B] focus:ring-1 focus:ring-[#0B2B5B]"
                                                        >
                                                            <option value="">Select Deal Type</option>
                                                            <option value="partnership">Partnership</option>
                                                            <option value="investment">Investment</option>
                                                            <option value="acquisition">Acquisition</option>
                                                            <option value="collaboration">Collaboration</option>
                                                            <option value="joint_venture">Joint Venture</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                            <svg className="h-5 w-5 text-[#0B2B5B]" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Industry */}
                                                <div className="w-[264px]">
                                                    <label className="mb-2 block px-2 font-montserrat text-base font-bold leading-none text-[#193E47]">
                                                        Industry
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            value={formData.industry}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                                                            className="h-[60px] w-full appearance-none rounded-[20px] border-[1.5px] border-[#C0E7EA] bg-white py-2.5 pr-10 pl-[15px] font-montserrat text-xs text-gray-900 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] outline-none transition-all focus:border-[#0B2B5B] focus:ring-1 focus:ring-[#0B2B5B]"
                                                        >
                                                            <option value="">Select Industry</option>
                                                            <option value="technology">Technology</option>
                                                            <option value="finance">Finance</option>
                                                            <option value="healthcare">Healthcare</option>
                                                            <option value="real_estate">Real Estate</option>
                                                            <option value="manufacturing">Manufacturing</option>
                                                            <option value="agriculture">Agriculture</option>
                                                            <option value="retail">Retail</option>
                                                            <option value="energy">Energy</option>
                                                            <option value="education">Education</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                            <svg className="h-5 w-5 text-[#0B2B5B]" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column - Short Deal Description + Timeline & Geography */}
                                            <div className="w-full space-y-5 md:w-[377px]">
                                                {/* Short Deal Description */}
                                                <div className="w-full">
                                                    <label className="mb-2 block px-2 font-montserrat text-base font-bold leading-none text-[#193E47]">
                                                        Short Deal Description
                                                    </label>
                                                    <textarea
                                                        placeholder="Type in a short description about this deal"
                                                        value={formData.description}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                        className="h-[156px] w-[377px] resize-none rounded-[20px] border-[1.5px] border-[#C0E7EA] bg-white p-4 pl-[15px] font-montserrat text-sm text-gray-900 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] outline-none transition-all placeholder:text-xs placeholder:font-light placeholder:text-gray-400 focus:border-[#0B2B5B] focus:ring-1 focus:ring-[#0B2B5B]"
                                                    />
                                                </div>

                                                {/* Timeline & Geography Row - below textarea */}
                                                <div className="flex gap-[13px]">
                                                    {/* Timeline */}
                                                    <div className="w-[182px]">
                                                        <label className="mb-2 block px-2 font-montserrat text-base font-bold leading-none text-[#193E47]">
                                                            Timeline
                                                        </label>
                                                        <div className="relative">
                                                            <select
                                                                value={formData.timeline}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                                                                className="h-[60px] w-full appearance-none rounded-[20px] border-[1.5px] border-[#C0E7EA] bg-white py-2.5 pr-8 pl-[15px] font-montserrat text-xs text-gray-900 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] outline-none transition-all focus:border-[#0B2B5B] focus:ring-1 focus:ring-[#0B2B5B]"
                                                            >
                                                                <option value="">Select one</option>
                                                                <option value="1month">1 Month</option>
                                                                <option value="3months">3 Months</option>
                                                                <option value="6months">6 Months</option>
                                                                <option value="1year">1 Year</option>
                                                                <option value="ongoing">Ongoing</option>
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                <svg className="h-4 w-4 text-[#0B2B5B]" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Geography */}
                                                    <div className="w-[182px]">
                                                        <label className="mb-2 block px-2 font-montserrat text-base font-bold leading-none text-[#193E47]">
                                                            Geography
                                                        </label>
                                                        <div className="relative">
                                                            <select
                                                                value={formData.geography}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, geography: e.target.value }))}
                                                                className="h-[60px] w-full appearance-none rounded-[20px] border-[1.5px] border-[#C0E7EA] bg-white py-2.5 pr-8 pl-[15px] font-montserrat text-xs text-gray-900 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] outline-none transition-all focus:border-[#0B2B5B] focus:ring-1 focus:ring-[#0B2B5B]"
                                                            >
                                                                <option value="">Select one</option>
                                                                <option value="africa">Africa</option>
                                                                <option value="europe">Europe</option>
                                                                <option value="asia">Asia</option>
                                                                <option value="north_america">North America</option>
                                                                <option value="south_america">South America</option>
                                                                <option value="global">Global</option>
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                <svg className="h-4 w-4 text-[#0B2B5B]" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Send Button */}
                                        <div className="mt-8 flex justify-center">
                                            <button
                                                type="submit"
                                                disabled={!formData.title.trim()}
                                                className={`h-[50px] w-full max-w-[280px] rounded-full font-montserrat text-base font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#0B2B5B] focus:ring-offset-2 ${formData.title.trim() ? 'bg-[#0B1727] hover:bg-[#0a2550]' : 'cursor-not-allowed bg-gray-400'}`}
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Deals Sidebar - Right Side */}
                                <div className="w-full shrink-0 rounded-[40px] bg-[#FAF8F8] p-5 lg:w-[265px]">
                                    <h3 className="font-montserrat text-base font-bold leading-none text-[#193E47]">Deals</h3>

                                    {/* Deal Items */}
                                    <div className="mt-4 space-y-3">
                                        {recentDeals.length > 0 ? (
                                            recentDeals.map((deal) => (
                                                <div key={deal.id} className="rounded-[10px] bg-white p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-montserrat text-[8px] font-normal uppercase leading-[17px] text-[#0B1727]">
                                                                {deal.deal_type?.replace('_', ' ') || deal.title}
                                                            </p>
                                                            <p className="font-montserrat text-xs font-extrabold leading-[25px] text-[#193E47]">
                                                                Sent to: {deal.recipient_names || 'N/A'}
                                                            </p>
                                                            <div className="mt-1 w-full max-w-[194px] border-t border-[#CACACA]"></div>
                                                            <p
                                                                onClick={() => {
                                                                    setStatsCardDeal(deal);
                                                                    setShowStatsCard(true);
                                                                }}
                                                                className="cursor-pointer font-montserrat text-[8px] font-normal uppercase leading-[17px] text-[#0B1727] hover:underline"
                                                            >
                                                                VIEW STATISTICS
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <p className="font-montserrat text-[8px] font-semibold leading-[25px] text-[#0B1727]">
                                                                {deal.created_at}
                                                            </p>
                                                            {/* Status indicator */}
                                                            <div className={`mt-1 flex h-4 w-4 items-center justify-center rounded ${deal.status === 'accepted' ? 'bg-[#235F1E]' :
                                                                deal.status === 'rejected' ? 'bg-[#EF413B]' :
                                                                    deal.status === 'viewed' ? 'bg-[#2E80FB]' :
                                                                        'bg-[#FFA500]'
                                                                }`}>
                                                                {deal.status === 'accepted' && (
                                                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                                {deal.status === 'rejected' && (
                                                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                                {deal.status === 'viewed' && (
                                                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                    </svg>
                                                                )}
                                                                {deal.status === 'pending' && (
                                                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-[10px] bg-white p-4 text-center">
                                                <p className="font-montserrat text-sm text-gray-500">No deals sent yet</p>
                                                <p className="mt-1 font-montserrat text-xs text-gray-400">Create your first deal card above</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* View All Deals Link */}
                                    <div className="mt-4 text-center">
                                        <a
                                            onClick={() => window.location.href = '/dealcard/view'}
                                            className="cursor-pointer font-montserrat text-[11px] font-normal leading-[17px] text-[#0B1727] hover:underline"
                                        >
                                            View all Deals.
                                        </a>
                                    </div>

                                    {/* Deal Rate Section */}
                                    <div className="mt-4 rounded-xl bg-white p-4 shadow-[0px_1px_2px_2px_rgba(0,0,0,0.15)]">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-montserrat text-[10px] font-light leading-8 text-[#0B1727]">
                                                    DEAL RATE
                                                </p>
                                                <p className="font-montserrat text-base font-bold leading-8 text-[#0B1727]">
                                                    {stats && stats.accepted + stats.rejected > 0
                                                        ? `${((stats.accepted / (stats.accepted + stats.rejected)) * 100).toFixed(1)}%`
                                                        : '0%'
                                                    }
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="flex h-6 w-6 items-center justify-center">
                                                    <ArrowUp className="h-4 w-4 text-[#0FAF62]" />
                                                </div>
                                                <span className="font-montserrat text-[8px] font-normal leading-8 text-[#0FAF62]">
                                                    1% In a week
                                                </span>
                                            </div>
                                        </div>

                                        {/* Simple Chart Representation */}
                                        <div className="mt-2 h-16">
                                            <svg viewBox="0 0 200 60" className="h-full w-full">
                                                <path
                                                    d="M0,45 Q20,40 40,35 T80,30 T120,25 T160,20 T200,15"
                                                    fill="none"
                                                    stroke="#22C55E"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    d="M0,45 Q20,40 40,35 T80,30 T120,25 T160,20 T200,15 L200,60 L0,60 Z"
                                                    fill="url(#gradient)"
                                                    opacity="0.2"
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#22C55E" />
                                                        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send To Modal */}
            {showSendToModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="relative mx-4 w-full max-w-[600px] rounded-[20px] bg-white p-6 shadow-2xl animate-scaleIn">
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowSendToModal(false);
                                setSelectedUsers([]);
                                setSearchQuery('');
                            }}
                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Title */}
                        <h2 className="mb-6 text-center font-montserrat text-xl font-semibold text-[#0B1727]">
                            Send to,
                        </h2>

                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                        {/* Users Grid - 6 columns, scrollable */}
                        <div className="no-scrollbar max-h-[300px] overflow-y-auto">
                            <div className="grid grid-cols-6 gap-x-4 gap-y-6">
                                {filteredUsers.map((user) => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    const isConnected = (connected || []).some(c => c.id === user.id);

                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => handleUserSelect(user.id)}
                                            className={`flex cursor-pointer flex-col items-center transition-all ${isSelected ? 'scale-105' : 'hover:scale-105'
                                                } ${selectedUsers.length >= 10 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {/* User Avatar */}
                                            <div className={`relative h-14 w-14 overflow-hidden rounded-full border-2 ${isSelected ? 'border-[#0FAF62] ring-2 ring-[#0FAF62]/30' : 'border-transparent'
                                                }`}>
                                                {user.profile_picture ? (
                                                    <img
                                                        src={user.profile_picture}
                                                        alt={user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0B1727] to-[#193E47] text-white">
                                                        <span className="font-montserrat text-lg font-semibold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Selection Checkmark */}
                                                {isSelected && (
                                                    <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0FAF62]">
                                                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* User Name */}
                                            <div className="mt-2 text-center">
                                                <p className="font-montserrat text-[10px] font-semibold leading-tight text-[#0B1727]">
                                                    {getFirstName(user.name)}
                                                </p>
                                                <p className="font-montserrat text-[10px] font-normal leading-tight text-[#0B1727]">
                                                    {getLastName(user.name)}
                                                </p>
                                                {isConnected && (
                                                    <p className="mt-0.5 font-montserrat text-[8px] font-medium text-[#0FAF62]">
                                                        Connected
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Empty State */}
                            {filteredUsers.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="font-montserrat text-sm text-gray-500">No users found</p>
                                    <p className="mt-1 font-montserrat text-xs text-gray-400">Try a different search term</p>
                                </div>
                            )}
                        </div>

                        {/* Send Button */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleSendDealCard}
                                disabled={selectedUsers.length === 0 || isSubmitting}
                                className={`h-[45px] w-full max-w-[200px] rounded-full font-montserrat text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedUsers.length > 0 && !isSubmitting
                                    ? 'bg-[#0B1727] hover:bg-[#0a2550] focus:ring-[#0B2B5B]'
                                    : 'cursor-not-allowed bg-gray-300'
                                    }`}
                            >
                                {isSubmitting ? 'Sending...' : `Send to ${selectedUsers.length > 0 ? `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}` : 'selected'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery & Open Status Card - Fixed Bottom Right */}
            <AnimatePresence mode="wait">
                {showStatsCard && statsCardDeal && (
                    <motion.div
                        key={statsCardDeal.id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed bottom-6 right-6 z-[50] w-[340px]"
                    >
                        <div className="rounded-[16px] bg-[#0B1727] p-5 shadow-xl">
                            {/* Header with title and close button */}
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

                            {/* Deal Info */}
                            <div className="mt-3 rounded-[8px] border border-[#B9B9B9] px-3 py-2">
                                <p className="font-montserrat text-[8px] font-[400] leading-[17px] tracking-[-0.3px] text-[#F3F0E9]/70">
                                    Deal
                                </p>
                                <p className="font-montserrat text-[12px] font-[800] leading-[100%] text-[#F3F0E9]">
                                    {statsCardDeal.title}
                                </p>
                                <p className="mt-1 font-montserrat text-[10px] font-[300] leading-[14px] text-[#F3F0E9]/70">
                                    Sent to: {statsCardDeal.recipient_names}
                                </p>
                            </div>

                            {/* Top Stats Row: Date Sent & Opened */}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-[8px] border border-[#B9B9B9] px-3 py-2">
                                    <p className="font-montserrat text-[8px] font-[400] leading-[17px] tracking-[-0.3px] text-[#F3F0E9]/70">
                                        Date Sent
                                    </p>
                                    <p className="font-montserrat text-[12px] font-[800] leading-[100%] text-[#F3F0E9]">
                                        {statsCardDeal.created_at || 'N/A'}
                                    </p>
                                </div>
                                <div className="rounded-[8px] border border-[#B9B9B9] px-3 py-2">
                                    <p className="font-montserrat text-[8px] font-[400] leading-[17px] tracking-[-0.3px] text-[#F3F0E9]/70">
                                        Opened
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-montserrat text-[12px] font-[800] leading-[100%] text-[#F3F0E9]">
                                            {statsCardDeal.viewed_at
                                                ? new Date(statsCardDeal.viewed_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : 'Not opened'}
                                        </p>
                                        {statsCardDeal.viewed_at && (
                                            <span className="rounded bg-[#F3F0E9]/20 px-1.5 py-0.5 font-montserrat text-[8px] text-[#F3F0E9]">
                                                {new Date(statsCardDeal.viewed_at).toLocaleTimeString('en-US', {
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
                                        {statsCardDeal.time_spent
                                            ? `${statsCardDeal.time_spent} minutes`
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="rounded-[8px] border border-[#B9B9B9] px-3 py-2">
                                    <p className="font-montserrat text-[8px] font-[400] leading-[17px] tracking-[-0.3px] text-[#F3F0E9]/70">
                                        Profile Views
                                    </p>
                                    <p className="font-montserrat text-[12px] font-[800] leading-[100%] text-[#F3F0E9]">
                                        {statsCardDeal.profile_views !== null && statsCardDeal.profile_views !== undefined
                                            ? `${statsCardDeal.profile_views} times`
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-montserrat text-[10px] font-[300] text-[#F3F0E9]/70">Status:</span>
                                    <span className={`rounded-full px-3 py-1 font-montserrat text-[10px] font-[600] capitalize ${statsCardDeal.status === 'accepted' ? 'bg-[#235F1E] text-white' :
                                        statsCardDeal.status === 'rejected' ? 'bg-[#EF413B] text-white' :
                                            statsCardDeal.status === 'viewed' ? 'bg-[#2E80FB] text-white' :
                                                'bg-[#FFA500] text-white'
                                        }`}>
                                        {statsCardDeal.status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowStatsCard(false);
                                        window.location.href = `/dealcard/view?tab=${statsCardDeal.status}`;
                                    }}
                                    className="font-montserrat text-[10px] font-[400] text-[#F3F0E9]/80 hover:text-[#F3F0E9] hover:underline transition-colors"
                                >
                                    View All Deals →
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}

export default function DealCard(props: Omit<Props, 'auth'>) {
    const { user } = useAuth();
    if (!user) return null;
    return <DealCardContent {...props} auth={{ user }} />;
}
