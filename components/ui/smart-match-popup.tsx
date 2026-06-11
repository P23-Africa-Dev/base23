'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, HelpCircle, Building2, Tags, TrendingUp } from 'lucide-react';
import React from 'react';
import type { SmartMatchData } from '@/services/notification-service';

interface SmartMatchPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    onDecline: () => void;
    data: SmartMatchData | null;
    isLoading?: boolean;
}

export default function SmartMatchPopup({
    isOpen,
    onClose,
    onAccept,
    onDecline,
    data,
    isLoading = false,
}: SmartMatchPopupProps) {
    if (!data) return null;

    // Generate fallback avatar URL
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.sender_name || 'User')}&background=6366f1&color=ffffff&size=200`;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Popup - 683x auto with 20px border-radius */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed left-1/2 top-1/2 z-[101] w-[90%] max-w-[683px] -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto"
                    >
                        <div
                            className="overflow-hidden bg-white"
                            style={{
                                borderRadius: '20px',
                                boxShadow: '0px 4px 4px -1px rgba(0, 0, 0, 0.1), 0px 4px 4px -1px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            {/* Header with gradient background */}
                            <div
                                className="relative px-8 pb-10 pt-8"
                                style={{
                                    background: 'linear-gradient(73.97deg, #321C84 -9.64%, #533188 59.9%, #BE51EA 95.5%)',
                                    boxShadow: '0px 100.48px 104.67px 0px rgba(255, 255, 255, 0.25) inset',
                                }}
                            >
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Someone Wants to Help Title */}
                                <div className="flex items-center gap-4 pt-4">
                                    {/* Sender Avatar */}
                                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
                                        <img
                                            src={data.sender_profile_picture || fallbackAvatar}
                                            alt={data.sender_name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = fallbackAvatar;
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h1
                                                className="font-montserrat text-[24px] font-extrabold leading-[100%] tracking-[0px] text-left"
                                                style={{ color: '#F3F0E9' }}
                                            >
                                                Someone Wants to Help!
                                            </h1>
                                            {/* Compatibility Badge */}
                                            <div
                                                className="flex items-center justify-center rounded-full px-3 py-1"
                                                style={{
                                                    background: 'linear-gradient(90deg, #DF87B1 0%, #CD6BD0 49.4%, #BE51EA 92.79%)',
                                                }}
                                            >
                                                <span className="text-white text-sm font-bold">{data.compatibility}%</span>
                                            </div>
                                        </div>
                                        {/* Subtitle */}
                                        <p
                                            className="mt-1 text-left font-montserrat text-[13px] font-light leading-[16px] tracking-[0px]"
                                            style={{ color: '#F3F0E9' }}
                                        >
                                            <span className="font-semibold">{data.sender_name}</span> has offered to help with your request
                                        </p>
                                    </div>
                                </div>

                                {/* Decorative circles */}
                                <div className="absolute bottom-4 left-6 h-3 w-3 rounded-full bg-white/30" />
                                <div className="absolute bottom-8 right-8 h-2 w-2 rounded-full bg-white/20" />
                            </div>

                            {/* Content section */}
                            <div className="px-8 py-6">
                                {/* What You Asked For - Main Focus */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <HelpCircle className="h-5 w-5 text-purple-600" />
                                        <h2
                                            className="font-montserrat text-[16px] font-bold leading-[17px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            What You Asked For
                                        </h2>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                        <p
                                            className="font-montserrat text-[13px] font-normal leading-[20px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            {data.recipient_needs || 'You requested help with your business needs.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Helper Information Header */}
                                <h2
                                    className="mb-4 font-montserrat text-[14px] font-bold leading-[17px] tracking-[0px]"
                                    style={{ color: '#193E47' }}
                                >
                                    Who Wants to Help
                                </h2>

                                {/* Helper Info Grid */}
                                <div className="mb-5 grid grid-cols-3 gap-4">
                                    {/* Name & Position */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p
                                            className="font-montserrat text-[11px] font-semibold leading-[14px] tracking-[0px] mb-1"
                                            style={{ color: '#6B7280' }}
                                        >
                                            Name
                                        </p>
                                        <p
                                            className="font-montserrat text-[13px] font-medium leading-[16px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            {data.sender_name}
                                        </p>
                                        <p
                                            className="font-montserrat text-[11px] font-light leading-[14px] tracking-[0px] mt-0.5"
                                            style={{ color: '#6B7280' }}
                                        >
                                            {data.sender_position || 'Professional'}
                                        </p>
                                    </div>

                                    {/* Company */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Building2 className="h-3 w-3 text-gray-400" />
                                            <p
                                                className="font-montserrat text-[11px] font-semibold leading-[14px] tracking-[0px]"
                                                style={{ color: '#6B7280' }}
                                            >
                                                Company
                                            </p>
                                        </div>
                                        <p
                                            className="font-montserrat text-[13px] font-medium leading-[16px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            {data.sender_company || 'Not specified'}
                                        </p>
                                    </div>

                                    {/* Match Rate */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <TrendingUp className="h-3 w-3 text-gray-400" />
                                            <p
                                                className="font-montserrat text-[11px] font-semibold leading-[14px] tracking-[0px]"
                                                style={{ color: '#6B7280' }}
                                            >
                                                Match Rate
                                            </p>
                                        </div>
                                        <p
                                            className="font-montserrat text-[13px] font-bold leading-[16px] tracking-[0px]"
                                            style={{ color: '#7C3AED' }}
                                        >
                                            {data.compatibility}% Compatible
                                        </p>
                                    </div>
                                </div>

                                {/* Tags You're Looking For (if available) */}
                                {data.recipient_selected_tags && data.recipient_selected_tags.length > 0 && (
                                    <div className="mb-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tags className="h-4 w-4 text-gray-500" />
                                            <p
                                                className="font-montserrat text-[12px] font-semibold leading-[14px] tracking-[0px]"
                                                style={{ color: '#193E47' }}
                                            >
                                                Skills You&apos;re Looking For
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.recipient_selected_tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Why They're a Good Match */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-purple-500" />
                                        <p
                                            className="font-montserrat text-[12px] font-semibold leading-[14px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            Why They Can Help
                                        </p>
                                    </div>
                                    <p
                                        className="font-montserrat text-[12px] font-light leading-[18px] tracking-[0px]"
                                        style={{ color: '#193E47' }}
                                    >
                                        {data.why_this_match ||
                                            'This professional has experience solving challenges similar to your request and aligns strongly with your needs.'}
                                    </p>

                                    {/* Match Reasons */}
                                    {data.match_reasons && data.match_reasons.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {data.match_reasons.map((reason, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center gap-2 font-montserrat text-[11px] font-normal"
                                                    style={{ color: '#6B7280' }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Smart Match Badge */}
                                <div className="mb-6 flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-4 py-3 border border-purple-100">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="font-montserrat text-[12px] font-semibold text-purple-700">
                                            Smart Match Connection
                                        </p>
                                        <p className="font-montserrat text-[10px] font-light text-purple-600">
                                            Clicking &ldquo;Match us Now&rdquo; will start a Smart Match conversation with {data.sender_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4">
                                    {/* Match us Now Button */}
                                    <button
                                        onClick={onAccept}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-[9px] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{
                                            width: '180px',
                                            height: '42px',
                                            borderRadius: '10px',
                                            padding: '8px 13px',
                                            background: 'linear-gradient(83.85deg, #360D56 10.01%, #751DBC 88.82%)',
                                        }}
                                    >
                                        <MessageCircle className="h-4 w-4" style={{ color: '#F3F0E9' }} />
                                        <span
                                            className="font-montserrat text-[14px] font-semibold leading-[25px] tracking-[0px]"
                                            style={{ color: '#F3F0E9' }}
                                        >
                                            {isLoading ? 'Connecting...' : 'Match us Now!'}
                                        </span>
                                    </button>

                                    {/* Not Needed Anymore Button */}
                                    <button
                                        onClick={onDecline}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 rounded-[10px] bg-transparent px-4 py-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <X className="h-4 w-4" style={{ color: '#193E47' }} />
                                        <span
                                            className="font-montserrat text-[14px] font-semibold leading-[25px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            Not Needed Anymore
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
