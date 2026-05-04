// types/LeadSidebarProfile.ts
import images from '@/constants/image';
import { motion } from 'framer-motion';

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

export default function LeadsMobileSidebar({ data, onViewFullProfile, onToggleCollection, isCollected, isUnlocked, isUnlocking, onUnlockLead }: Props) {
    return (
        <div className="h-full rounded-tl-4xl rounded-bl-4xl bg-[#193E47] py-4 pl-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                {/* Header */}
                <h2 className="text-base leading-3.5 font-extrabold text-secondaryWhite">{data.name}</h2>
                <p className="mt-0.5 text-[10px] font-light text-secondaryWhite">{data.title}</p>

                {/* Bio */}
                <p className="mt-4 pr-4 text-sm text-[10px] leading-relaxed text-secondaryWhite">{data.bio}</p>

                {/* Info List */}

                <div className={`mt-6 space-y-2 pr-4 text-sm text-secondaryWhite ${!isUnlocked ? 'select-none' : ''}`}>
                    <div className="flex w-full justify-between">
                        <div className="">
                            <p className="text-[11px] font-bold">Contact Number</p>
                            <p className={`text-[10px] ${!isUnlocked ? 'blur-sm' : ''}`}>{data.phone}</p>
                        </div>

                        <div className="">
                            <p className="text-[11px] font-bold">Location</p>
                            <p className={`text-[10px] ${!isUnlocked ? 'blur-sm' : ''}`}>{data.location}</p>
                        </div>
                    </div>

                    <div className="">
                        <p className="text-[11px] font-bold">Mail</p>
                        <p className={`text-[10px] ${!isUnlocked ? 'blur-sm' : ''}`}>{data.email}</p>
                    </div>

                    <div className="flex w-full justify-between">
                        <div>
                            <p className="text-[11px] font-bold">Experience</p>
                            <p className="text-[10px]">{data.experience}</p>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold">Industry</p>
                            <p className="text-[10px]">{data.industry}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-[11px] font-bold">Interest</p>
                        <p className="text-[10px]">{data.interest}</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-x-3">
                    {/* Collection Leads button */}

                    <button
                        onClick={onToggleCollection}
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#BCD6F2] p-1 transition md:h-9 md:w-9 ${isCollected ? 'bg-darkGreen' : 'bg-[#BCD6F2]'}`}
                    >
                        <img src={images.connectionsleads} className={`h-6 w-6 transition ${isCollected ? 'opacity-100' : 'opacity-60'}`} alt="" />
                    </button>

                    <button
                        onClick={onViewFullProfile}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BCD6F2] p-1 md:h-9 md:w-9"
                    >
                        <img src={images.userleadprofile2} className="h-6 w-6" alt="" />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BCD6F2] p-1 md:h-9 md:w-9">
                        <img src={images.shareLeads} className="h-6 w-6" alt="" />
                    </button>
                </div>

                {/* CTA */}
                {isUnlocked ? (
                    <button
                        onClick={onViewFullProfile}
                        className="mt-16 flex w-[85%] items-center justify-center gap-2 rounded-xl bg-[#27E6A7] py-2.5 text-sm font-medium"
                    >
                        <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full md:h-9 md:w-9">
                            <img src={images.userleadprofile} className="h-5 w-5" alt="" />
                        </div>
                        <span className="text-[13px] text-white">See Full Profile</span>
                    </button>
                ) : (
                    <button
                        onClick={onUnlockLead}
                        disabled={isUnlocking}
                        className="mt-16 flex w-[85%] items-center justify-center gap-2 rounded-xl bg-[#7937F1] py-2.5 text-sm font-medium disabled:opacity-50"
                    >
                        <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full md:h-9 md:w-9">
                            <img src={images.userleadprofile} className="h-5 w-5" alt="" />
                        </div>
                        <span className="text-[13px] text-white">
                            {isUnlocking ? 'Unlocking...' : 'View Lead Details'}
                        </span>
                    </button>
                )}
            </motion.div>
        </div>
    );
}
