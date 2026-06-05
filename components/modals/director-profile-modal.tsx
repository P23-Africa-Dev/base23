'use client';

import React, { useState } from 'react';
import { X, Star, MessageSquare, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DirectorUser } from '@/dummyDatas/director';

interface DirectorProfileModalProps {
    user: DirectorUser;
    open: boolean;
    onClose: () => void;
}

const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ user, open, onClose }) => {
    const [workPage, setWorkPage] = useState(0);
    const experiences = user.workExperience ?? [];
    const current = experiences[workPage];
    const totalPages = Math.max(experiences.length, 1);

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent 
                side="right" 
                className="!w-full sm:!max-w-[760px] !right-0 sm:!right-4 !top-0 sm:!top-4 !bottom-0 sm:!bottom-4 sm:!h-[calc(100vh-32px)] !border-none p-0 overflow-y-auto lg:overflow-hidden sm:!rounded-[40px] shadow-[0px_10px_40px_rgba(0,0,0,0.2)] [&>button]:hidden bg-white"
            >
                <div className="flex flex-col lg:grid lg:h-full lg:grid-cols-[340px_1fr]">

                    {/* ── LEFT PANEL ── */}
                    <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-8 sm:px-8 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.15)] lg:overflow-y-auto lg:shadow-[10px_0_20px_-10px_rgba(0,0,0,0.15)]" style={{ background: '#C8DCE0' }}>

                        {/* Close button (mobile only — top right of left panel) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-black/30 lg:hidden"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Avatar with gradient ring */}
                        <div className="relative mt-2 shrink-0">
                            <div className="h-[148px] w-[148px] rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #A87EF7 0%, #4A6CF7 50%, #1B2A6B 100%)' }}>
                                <div className="h-full w-full overflow-hidden rounded-full border-[3px] border-white">
                                    <img
                                        src={user.imageSrc}
                                        alt={user.name}
                                        className="h-full w-full object-cover object-top"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Name + title */}
                        <div className="text-center">
                            <h2 className="text-[26px] font-extrabold leading-tight text-[#0B1727]">{user.name}</h2>
                            <p className="mt-0.5 text-[18px] font-medium text-[#0B1727]/70">{user.title}</p>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <p className="max-w-[260px] text-center text-[13px] leading-relaxed text-[#0B1727]/75">
                                {user.bio}
                            </p>
                        )}

                        {/* Reviews */}
                        {user.reviews !== undefined && (
                            <div className="flex items-center gap-2">
                                <span className="cursor-pointer text-[15px] font-extrabold text-[#0B1727] underline underline-offset-4">
                                    {user.reviews} Reviews
                                </span>
                                <Star className="h-5 w-5 fill-[#A87EF7] text-[#A87EF7]" />
                            </div>
                        )}

                        {/* Info grid */}
                        <div className="w-full space-y-2.5 pt-1">
                            {user.industry && (
                                <div>
                                    <p className="text-[12px] font-bold text-[#0B1727]">Industry</p>
                                    <p className="text-[12px] font-normal text-[#0B1727]/75">{user.industry}</p>
                                </div>
                            )}
                            {user.baseLocation && (
                                <div>
                                    <p className="text-[12px] font-bold text-[#0B1727]">Base Location</p>
                                    <p className="text-[12px] font-normal text-[#0B1727]/75">{user.baseLocation}</p>
                                </div>
                            )}
                            {user.operatesIn && (
                                <div>
                                    <p className="text-[12px] font-bold text-[#0B1727]">Operates In:</p>
                                    <p className="text-[12px] font-normal text-[#0B1727]/75">{user.operatesIn}</p>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-2 flex w-full items-center gap-2 sm:gap-3">
                            <button className="flex h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] shrink-0 items-center justify-center rounded-full bg-[#1B363A] transition hover:bg-[#1B363A]/80">
                                <MessageSquare className="h-[20px] w-[20px] sm:h-[22px] sm:w-[22px] text-white" strokeWidth={1.5} />
                            </button>
                            <button className="flex h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] shrink-0 items-center justify-center rounded-full bg-[#1B363A] transition hover:bg-[#1B363A]/80">
                                <Phone className="h-[20px] w-[20px] sm:h-[22px] sm:w-[22px] text-white" strokeWidth={1.5} />
                            </button>
                            <button className="flex flex-1 items-center justify-center rounded-full bg-[#1B363A] py-3.5 text-[12px] sm:text-[13px] font-semibold text-white transition hover:bg-[#1B363A]/80">
                                Request Interview
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div className="relative flex flex-col bg-white px-6 py-8 sm:px-8 lg:overflow-y-auto">

                        {/* Close button (desktop) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 lg:flex"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Professional Summary */}
                        <section className="mb-6 mt-2">
                            <h3 className="text-[18px] font-extrabold text-[#0B1727]">Professional Summary</h3>
                            <p className="mt-2 text-[14px] leading-relaxed text-[#0B1727]/70">
                                {user.bio ?? 'No summary available.'}
                            </p>
                        </section>

                        {/* Stats grid */}
                        <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                            {user.experience && (
                                <div>
                                    <p className="text-[14px] font-bold text-[#0B1727]">Experience</p>
                                    <p className="text-[14px] text-[#0B1727]/70 mt-1">{user.experience}</p>
                                </div>
                            )}
                            {user.interest && (
                                <div>
                                    <p className="text-[14px] font-bold text-[#0B1727]">Interest</p>
                                    <p className="text-[14px] text-[#0B1727]/70 mt-1">{user.interest}</p>
                                </div>
                            )}
                            {user.languages && (
                                <div className="sm:col-span-2">
                                    <p className="text-[14px] font-bold text-[#0B1727]">Languages</p>
                                    <p className="text-[14px] text-[#0B1727]/70 mt-1">{user.languages}</p>
                                </div>
                            )}
                            {user.expectedRate && (
                                <div className="sm:col-span-2">
                                    <p className="text-[14px] font-bold text-[#0B1727]">Expected Rate</p>
                                    <p className="text-[14px] text-[#0B1727]/70 mt-1">{user.expectedRate}</p>
                                </div>
                            )}
                            {user.availability && (
                                <div className="sm:col-span-2">
                                    <p className="text-[14px] font-bold text-[#0B1727]">Availability</p>
                                    <p className="text-[14px] text-[#0B1727]/70 mt-1">{user.availability}</p>
                                </div>
                            )}
                        </section>

                        {/* Work Experience card */}
                        {experiences.length > 0 && current && (
                            <div className="flex-1 rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] rounded-br-[64px] bg-[#1B363A] p-6 sm:p-8">
                                <h3 className="mb-6 text-[20px] font-extrabold text-white">Work Experience</h3>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[15px] font-bold text-white">{current.role}</p>
                                        <p className="text-[13px] text-white/70">
                                            {current.company} · {current.location} | {current.period}
                                        </p>
                                    </div>

                                    {current.achievements.length > 0 && (
                                        <div>
                                            <p className="text-[14px] font-bold text-white">Achievements</p>
                                            <ul className="mt-1.5 space-y-1">
                                                {current.achievements.map((a, i) => (
                                                    <li key={i} className="text-[13px] text-white/80">- {a}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {current.successfulDealsRate && (
                                        <div>
                                            <p className="text-[14px] font-bold text-white">Successful Deals Rate</p>
                                            <p className="text-[13px] text-white/80">{current.successfulDealsRate}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setWorkPage(i)}
                                                className={`h-2 rounded-full transition-all ${i === workPage ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setWorkPage((p) => Math.max(0, p - 1))}
                                            disabled={workPage === 0}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/70 transition hover:border-white/60 disabled:opacity-30"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setWorkPage((p) => Math.min(totalPages - 1, p + 1))}
                                            disabled={workPage === totalPages - 1}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/70 transition hover:border-white/60 disabled:opacity-30"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="mt-7 space-y-3">
                                    <button className="flex items-center text-[13px] italic font-extrabold text-white underline underline-offset-4 transition hover:text-white/80">
                                        View CV
                                    </button>
                                    <button className="flex items-center text-[13px] italic font-extrabold text-white underline underline-offset-4 transition hover:text-white/80">
                                        Watch Candidate intro Video
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default DirectorProfileModal;
