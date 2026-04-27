'use client';

import images from '@/constants/image';
import type { MatchResult } from '@/types/smart-match';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

type MatchedUserInfo = {
    id: number;
    name: string;
    profile_picture: string | null;
    position: string | null;
    company_name: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    matchResult?: MatchResult | null;
    // Legacy support for dummy data
    user?: {
        id: number;
        name: string;
        role?: string;
        company?: string;
        image?: string;
        compatibility?: number;
    } | null;
};

export function MatchSidebar({ open, onClose, matchResult, user }: Props) {
    if (!open) return null;

    const root = document.getElementById('overlay-root');
    if (!root) return null;

    // Get matched user info from matchResult or fallback to legacy user prop
    const matchedUser: MatchedUserInfo | null = matchResult?.matched_user || (user ? {
        id: user.id,
        name: user.name,
        profile_picture: user.image || null,
        position: user.role || null,
        company_name: user.company || null,
    } : null);

    const currentUser: MatchedUserInfo | null = matchResult?.current_user || null;

    // Conversation ID for starting chat
    const conversationId = matchResult?.conversation?.encrypted_id;

    // Handle Start a Chat click
    const handleStartChat = () => {
        if (conversationId) {
            window.location.href = `/message/single?conversation=${conversationId}`;
        } else if (matchedUser?.id) {
            axios.post('/messages/start', {
                user_id: matchedUser.id,
                redirect_to: 'message/single',
            }).then((res) => {
                window.location.href = res.data.redirect ?? '/message';
            });
        }
        onClose();
    };

    // Get display info for matched user
    const matchedUserName = matchedUser?.name || 'User';
    const matchedUserRole = matchedUser?.position || '';
    const matchedUserCompany = matchedUser?.company_name ? `at ${matchedUser.company_name}` : '';
    const matchedUserImage = matchedUser?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUserName)}&background=6366f1&color=ffffff&size=200`;
    const matchedFallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUserName)}&background=6366f1&color=ffffff&size=200`;

    // Get display info for current user
    const currentUserName = currentUser?.name || 'You';
    const currentUserRole = currentUser?.position || '';
    const currentUserImage = currentUser?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=6366f1&color=ffffff&size=200`;
    const currentFallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=6366f1&color=ffffff&size=200`;

    return createPortal(
        <AnimatePresence>
            <>
                {/* OVERLAY */}
                <motion.div
                    className="fixed inset-0 z-[999] bg-black/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    onClick={onClose}
                />

                <motion.div
                    style={{
                        backgroundImage: `url(${images.formBG})`,
                    }}
                    className="fixed top-0 right-0 z-[1000] h-full w-full overflow-hidden rounded-3xl rounded-r-none bg-cover bg-top bg-no-repeat lg:top-10 lg:right-2 lg:h-[90vh] lg:w-[420px] lg:shadow-[1px_7px_2px_-1px_rgba(0,0,0,0.1),-2px_7px_2px_-1px_rgba(0,0,0,0.1)]"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{
                        x: { duration: 0.35, ease: 'easeInOut' },
                    }}
                >
                    {/* First Card Profile */}
                    <div className="flex w-full flex-col">
                        <div className="mx-auto mt-4 flex h-[405px] w-[90%] flex-col items-center justify-center rounded-2xl border border-secondaryWhite shadow-[3px_3px_6px_-2px_rgba(0,0,0,0.2),2px_3px_6px_-2px_rgba(0,0,0,0.2)]">
                            <img src={images.referralPattern} className="absolute w-[260px] object-cover" alt="" />
                        </div>

                        {/* Buttons Actions */}
                        <div className="mx-auto mt-7 w-[80%] px-3">
                            <div className="max-w-md">
                                <h4 className="text-3xl leading-7 font-bold text-deepBlack">
                                    It’s a Business <span className="text-deepBlue">Match!</span>
                                </h4>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-x-2.5">
                                <button onClick={onClose} className="flex h-[8px] w-[8px] cursor-pointer items-center justify-center">
                                    <div className="relative h-5 w-5">
                                        <img src={images.deepRighticon} className="absolute object-contain" alt="" />
                                    </div>
                                </button>
                                <button
                                    onClick={handleStartChat}
                                    className="ml-2 rounded-full border border-deepBlack bg-deepBlack px-10 py-4.5 text-[14px] font-semibold text-white shadow-[1px_3px_5px_-1px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)] transition-colors duration-500 hover:bg-transparent hover:text-deepBlack"
                                >
                                    Start a Chat
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ================= MATCH CARDS ================= */}
                    <div className="absolute top-0 mx-auto mt-8 flex h-[360px] w-[90%] items-center justify-center bg-transparent">
                        {/* ================= LEFT CARD (MATCHED USER) ================= */}
                        <motion.div
                            initial={{ x: -80, opacity: 0, rotate: -14 }}
                            animate={{ x: 0, opacity: 1, rotate: -9 }}
                            exit={{ x: -60, opacity: 0, rotate: -14 }}
                            transition={{
                                delay: 1,
                                type: 'spring',
                                stiffness: 120,
                                damping: 10,
                                duration: 0.9,
                            }}
                            className="absolute top-16 left-12 z-30 flex h-[190px] w-[160px] -rotate-9 flex-col items-center justify-center rounded-xl bg-[#6B1D55] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                        >
                            <div className="mb-4 h-[90px] w-[90px] overflow-hidden rounded-full">
                                <img
                                    src={matchedUserImage}
                                    alt={matchedUserName}
                                    className="h-full w-full object-cover object-top"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = matchedFallbackAvatar;
                                    }}
                                />
                            </div>
                            <h4 className="text-sm leading-4 font-semibold text-white">{matchedUserName}</h4>
                            <p className="text-[10px] font-extralight text-white">{matchedUserRole} {matchedUserCompany}</p>
                        </motion.div>

                        {/* ================= RIGHT CARD (CURRENT USER) ================= */}
                        <motion.div
                            initial={{ x: 80, opacity: 0, rotate: 12 }}
                            animate={{ x: 0, opacity: 1, rotate: 6 }}
                            exit={{ x: 60, opacity: 0, rotate: 12 }}
                            transition={{
                                delay: 1,
                                type: 'spring',
                                stiffness: 120,
                                damping: 10,
                                duration: 0.9,
                            }}
                            className="absolute right-6 bottom-10 z-20 flex h-[190px] w-[160px] rotate-6 flex-col items-center justify-center rounded-xl bg-[#143D44] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                        >
                            <div className="mb-4 h-[90px] w-[90px] overflow-hidden rounded-full">
                                <img
                                    src={currentUserImage}
                                    alt={currentUserName}
                                    className="h-full w-full object-cover object-top"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = currentFallbackAvatar;
                                    }}
                                />
                            </div>
                            <h4 className="text-sm leading-4 font-semibold text-white">{currentUserName}</h4>
                            <p className="text-[10px] font-extralight text-white">{currentUserRole}</p>
                        </motion.div>
                    </div>
                </motion.div>
            </>
        </AnimatePresence>,
        root,
    );
}
