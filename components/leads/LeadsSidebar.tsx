// types/LeadSidebarProfile.ts
import images from '@/constants/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

export type LeadSidebarProfile = {
    id: number;
    name: string;
    title: string;
    bio: string;
    email: string;
    phone: string;
    location: string;
    experience: string;
    industry: string;
    interest: string;
    // Extended profile fields
    companyStage?: string;
    keyStrength?: string;
    topGoal?: string;
    baseLocation?: string;
    operatesIn?: string;
    memberSince?: string;
    responseRate?: string;
    successfulDealsRate?: string;
    rating?: number;
    // New Lead Bank profile fields
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    address?: string;
    companyDescription?: string;
    companyName?: string;
    website?: string;
    yearsOfOperation?: string;
};

type Props = {
    data: LeadSidebarProfile;
    isCollected: boolean;
    isUnlocked: boolean;
    isUnlocking?: boolean;
    onToggleCollection: () => void;
    onViewFullProfile: () => void;
    onUnlockLead: () => void;
};

export default function LeadsSidebar({ data, onViewFullProfile, onToggleCollection, isCollected, isUnlocked, isUnlocking, onUnlockLead }: Props) {
    const [showShareToast, setShowShareToast] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: data.name,
            text: `Check out ${data.name} - ${data.title}\n${data.bio}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                const shareText = `${data.name} - ${data.title}\n${data.email}\n${data.phone}\n${window.location.href}`;
                await navigator.clipboard.writeText(shareText);
                setShowShareToast(true);
                setTimeout(() => setShowShareToast(false), 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="relative mt-4 h-full rounded-md rounded-tr-[85px] rounded-br-[55px] bg-white py-3 pr-10 pl-4 text-white shadow-[-2px_-2px_8px_-3px_rgba(0,0,0,0.3),-2px_2px_8px_-3px_rgba(0,0,0,0.3)]">
            {/* Share Toast */}
            {showShareToast && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
                    Copied to clipboard!
                </div>
            )}
            <div className="h-full rounded-tr-[50px] rounded-br-2xl bg-[#1F4B57] py-4 pl-6 pr-4 shadow-[-2px_-2px_8px_-3px_rgba(0,0,0,0.3),-2px_2px_8px_-3px_rgba(0,0,0,0.3)]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex h-full flex-col justify-between"
                >
                    <div className="overflow-y-auto no-scrollbar pr-2">
                        {/* Header */}
                        <h2 className="mb-1 text-xl leading-6 font-extrabold text-white">{data.name}</h2>
                        <p className="text-sm font-light text-[#27E6A7]">{data.title}</p>

                        {/* Bio */}
                        <p className="mt-4 pr-6 text-[11px] leading-relaxed tracking-wide text-secondaryWhite/90">{data.bio}</p>

                        {/* Info List with Action Buttons */}
                        <div className="mt-5 flex w-full text-sm tracking-wide text-secondaryWhite">
                            <div className="flex w-full justify-between">
                                {/* Left Column - Info */}
                                <div className={`flex flex-col gap-y-3 flex-1 pr-4 ${!isUnlocked ? 'select-none' : ''}`}>
                                    {/* Mail */}
                                    <div>
                                        <p className="text-[12px] font-bold text-white">Mail</p>
                                        <p className={`text-[10px] text-secondaryWhite/80 ${!isUnlocked ? 'blur-sm' : ''}`}>{data.email}</p>
                                    </div>

                                    {/* Contact Number */}
                                    <div>
                                        <p className="text-[12px] font-bold text-white">Contact Number</p>
                                        <p className={`text-[10px] text-secondaryWhite/80 ${!isUnlocked ? 'blur-sm' : ''}`}>{data.phone || 'Not provided'}</p>
                                    </div>

                                    {/* Head quarters Location */}
                                    <div>
                                        <p className="text-[12px] font-bold text-white">Head quarters Location</p>
                                        <p className={`text-[10px] text-secondaryWhite/80 ${!isUnlocked ? 'blur-sm' : ''}`}>{data.location || data.baseLocation || 'Not specified'}</p>
                                    </div>

                                    {/* LinkedIn */}
                                    <div>
                                        <p className="text-[12px] font-bold text-white">LinkedIn</p>
                                        <p className={`text-[10px] text-secondaryWhite/80 ${!isUnlocked ? 'blur-sm' : ''}`}>{data.linkedin || 'linkedin.com/username'}</p>
                                    </div>

                                    {/* Industry and Years of Operation - Side by Side */}
                                    <div className="flex gap-x-6">
                                        <div>
                                            <p className="text-[12px] font-bold text-white">Industry</p>
                                            <p className="text-[10px] text-secondaryWhite/80">{data.industry || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold text-white">Years of Operation</p>
                                            <p className="text-[10px] text-secondaryWhite/80">{data.yearsOfOperation || data.experience || '20+'}</p>
                                        </div>
                                    </div>

                                    {/* Interest */}
                                    <div>
                                        <p className="text-[12px] font-bold text-white">Interest</p>
                                        <p className="text-[10px] text-secondaryWhite/80">{data.interest || 'Not specified'}</p>
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <p className="text-[12px] font-bold text-white">Website</p>
                                        <p className={`text-[10px] text-secondaryWhite/80 ${!isUnlocked ? 'blur-sm' : ''}`}>{data.website || 'www.website.com'}</p>
                                    </div>
                                </div>

                                {/* Right Column - Action Buttons */}
                                <div className="flex flex-col gap-y-3">
                                    {/* Collection Button */}
                                    <button
                                        onClick={onToggleCollection}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full p-1 transition ${isCollected ? 'bg-darkGreen' : 'bg-[#BCD6F2]'}`}
                                    >
                                        <img
                                            src={images.connectionsleads}
                                            className={`h-5 w-5 transition ${isCollected ? 'opacity-100' : 'opacity-60'}`}
                                            alt="collection"
                                        />
                                    </button>

                                    {/* Profile Button */}
                                    <button
                                        onClick={onViewFullProfile}
                                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#BCD6F2] p-1 hover:bg-[#9BC5E5] transition-colors"
                                    >
                                        <img src={images.userleadprofile2} className="h-5 w-5" alt="View Profile" />
                                    </button>

                                    {/* Share Button */}
                                    <button
                                        onClick={handleShare}
                                        title="Share profile"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#BCD6F2] p-1 hover:bg-[#9BC5E5] transition-colors"
                                    >
                                        <img src={images.shareLeads} className="h-5 w-5" alt="Share" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section - Social Icons and View Button */}
                    <div className="mt-4 flex items-center justify-between pr-4">
                        {/* Social Icons */}
                        <div className="flex gap-x-2">
                            {/* Facebook */}
                            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D5F6B] hover:bg-[#3A7585] transition-colors">
                                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                            {/* Instagram */}
                            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D5F6B] hover:bg-[#3A7585] transition-colors">
                                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </button>
                        </div>

                        {/* View Leads Details / See Full Profile Button */}
                        {isUnlocked ? (
                            <button
                                onClick={onViewFullProfile}
                                className="flex items-center justify-center gap-2 rounded-full bg-[#27E6A7] px-4 py-2 text-sm font-medium shadow hover:bg-[#1fd498] transition-colors"
                            >
                                <div className="flex h-5 w-5 items-center justify-center">
                                    <img src={images.userleadprofile} className="h-5 w-5" alt="" />
                                </div>
                                <span className="text-[12px] text-white whitespace-nowrap">See Full Profile</span>
                            </button>
                        ) : (
                            <button
                                onClick={onUnlockLead}
                                disabled={isUnlocking}
                                className="flex items-center justify-center gap-2 rounded-full bg-[#9C7CF4] px-4 py-2 text-sm font-medium shadow hover:bg-[#8A6AE0] transition-colors disabled:opacity-50"
                            >
                                <div className="flex h-5 w-5 items-center justify-center">
                                    <img src={images.userleadprofile} className="h-5 w-5" alt="" />
                                </div>
                                <span className="text-[12px] text-white whitespace-nowrap">
                                    {isUnlocking ? 'Unlocking...' : 'View Lead Details'}
                                </span>
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
