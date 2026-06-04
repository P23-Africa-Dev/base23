'use client';

import { Star, UserRoundPlus, MessageSquareText, Bookmark } from 'lucide-react';
import React from 'react';
import { DirectorUser } from '@/dummyDatas/director';

interface DirectorProfileSidebarProps {
    user: DirectorUser;
}

const DirectorProfileSidebar: React.FC<DirectorProfileSidebarProps> = ({ user }) => {
    return (
        <div className="flex h-full w-full flex-col gap-3 overflow-hidden rounded-[28px] bg-white p-3 shadow-[0px_4px_24px_rgba(0,0,0,0.10)]">

            {/* ── Photo card ── */}
            <div
                className="relative min-h-0 flex-[0_0_66%] overflow-hidden rounded-[22px] bg-cover bg-top shadow-[0px_2px_12px_rgba(0,0,0,0.15)]"
                style={{
                    backgroundImage: `url(${user.imageSrc})`,
                }}
            >
                {/* Name overlay */}
                <div className="absolute bottom-4 left-4 rounded-2xl bg-[#0B2127]/60 backdrop-blur-md px-5 py-3">
                    <h1 className="text-[22px] font-extrabold leading-tight text-white drop-shadow-sm">
                        {user.name}
                    </h1>
                    <p className="mt-0.5 text-[14px] font-medium text-white/90 drop-shadow-sm">
                        {user.title}
                    </p>
                </div>
            </div>

            {/* ── Info card ── */}
            <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[22px] bg-[#1B363A] px-5 py-5">

                {/* Stats + icon buttons */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-3.5">
                        {/* Row 1: Experience | Interest */}
                        <div className="flex gap-10">
                            <div>
                                <p className="text-[11.5px] font-bold text-white tracking-wide">Experience</p>
                                <p className="mt-0.5 text-[11.5px] font-light text-white/80">{user.experience || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[11.5px] font-bold text-white tracking-wide">Interest</p>
                                <p className="mt-0.5 text-[11.5px] font-light text-white/80">{user.interest || 'N/A'}</p>
                            </div>
                        </div>
                        {/* Row 2: Industry */}
                        <div>
                            <p className="text-[11.5px] font-bold text-white tracking-wide">Industry</p>
                            <p className="mt-0.5 text-[11.5px] font-light text-white/80">{user.industry || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Icon buttons */}
                    <div className="flex shrink-0 flex-col gap-3">
                        <button className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#DFF1E8] transition hover:bg-[#D0EBDD]">
                            <UserRoundPlus className="h-[22px] w-[22px] text-[#1B363A]" strokeWidth={1.5} />
                        </button>
                        <button className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#DFF1E8] transition hover:bg-[#D0EBDD]">
                            <MessageSquareText className="h-[22px] w-[22px] text-[#1B363A]" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Assessment Result */}
                <div className="flex items-center gap-2 mt-4">
                    <p className="cursor-pointer text-[11px] font-bold text-white underline decoration-[1.5px] underline-offset-[5px]">
                        Assessment Result
                    </p>
                    <Star className="h-[15px] w-[15px] fill-[#B886F8] text-[#B886F8]" />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-2">
                    <button className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-[#B886F8] py-[13px] text-[12px] font-semibold text-white transition hover:opacity-90">
                        <UserRoundPlus className="h-[16px] w-[16px]" strokeWidth={1.5} />
                        See Profile
                    </button>
                    <button className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-transparent py-[13px] text-[12px] font-medium text-white transition hover:bg-white/5">
                        <Bookmark className="h-[16px] w-[16px]" strokeWidth={1.5} />
                        Shortlist
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DirectorProfileSidebar;
