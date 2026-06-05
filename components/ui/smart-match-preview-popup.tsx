'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, HelpCircle, Building2, Clock, Tags, TrendingUp } from 'lucide-react';
import React from 'react';

export interface CompatibilityBreakdown {
    industry_match: number;
    business_level_match: number;
    tags_match: number;
    needs_match: number;
    ai_similarity_score?: number;
    // Legacy fields
    role_match?: number;
    company_stage_match?: number;
    geography_match?: number;
}

export interface SmartMatchPreviewData {
    id: number;
    name: string;
    position: string | null;
    company: string | null;
    industry: string | null;
    image: string;
    compatibility: number;
    compatibility_breakdown?: CompatibilityBreakdown;
    match_reasons?: string[];
    why_this_match?: string;
    // What the user needs help with
    user_needs: string | null;
    preferred_industry?: string | null;
    business_level?: string | null;
    selected_tags?: string[] | null;
}

interface SmartMatchPreviewPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onMatch: () => void;
    data: SmartMatchPreviewData | null;
    isLoading?: boolean;
}

export default function SmartMatchPreviewPopup({
    isOpen,
    onClose,
    onMatch,
    data,
    isLoading = false,
}: SmartMatchPreviewPopupProps) {
    // Debug log to see what data the popup receives
    React.useEffect(() => {
        if (isOpen && data) {
            console.log('SmartMatchPreviewPopup - Received data:', data);
            console.log('SmartMatchPreviewPopup - user_needs value:', data.user_needs);
        }
    }, [isOpen, data]);

    if (!data) return null;

    // Generate fallback avatar URL
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=6366f1&color=ffffff&size=200`;

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

                                {/* User Info with Avatar */}
                                <div className="flex items-center gap-4 pt-4">
                                    {/* Avatar */}
                                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
                                        <img
                                            src={data.image || fallbackAvatar}
                                            alt={data.name}
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
                                                {data.name}
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
                                            {data.position || 'Professional'} {data.company ? `at ${data.company}` : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Decorative circles */}
                                <div className="absolute bottom-4 left-6 h-3 w-3 rounded-full bg-white/30" />
                                <div className="absolute bottom-8 right-8 h-2 w-2 rounded-full bg-white/20" />
                            </div>

                            {/* Content section */}
                            <div className="px-8 py-6">
                                {/* What They Need Help With - Main Focus */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <HelpCircle className="h-5 w-5 text-purple-600" />
                                        <h2
                                            className="font-montserrat text-[16px] font-bold leading-[17px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            What They Need Help With
                                        </h2>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                        <p
                                            className="font-montserrat text-[13px] font-normal leading-[20px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            {data.user_needs || 'This user has not specified their needs yet.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Preference Details Grid */}
                                <div className="mb-6 grid grid-cols-3 gap-4">
                                    {/* Preferred Industry */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Building2 className="h-4 w-4 text-gray-500" />
                                            <p
                                                className="font-montserrat text-[11px] font-semibold leading-[14px] tracking-[0px]"
                                                style={{ color: '#193E47' }}
                                            >
                                                Looking For
                                            </p>
                                        </div>
                                        <p
                                            className="font-montserrat text-[12px] font-normal leading-[16px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            {data.preferred_industry || data.industry || 'Any Industry'}
                                        </p>
                                    </div>

                                    {/* Business Level */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <p
                                                className="font-montserrat text-[11px] font-semibold leading-[14px] tracking-[0px]"
                                                style={{ color: '#193E47' }}
                                            >
                                                Experience Level
                                            </p>
                                        </div>
                                        <p
                                            className="font-montserrat text-[12px] font-normal leading-[16px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            {data.business_level || 'Any Level'}
                                        </p>
                                    </div>

                                    {/* Match Rate */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Sparkles className="h-4 w-4 text-gray-500" />
                                            <p
                                                className="font-montserrat text-[11px] font-semibold leading-[14px] tracking-[0px]"
                                                style={{ color: '#193E47' }}
                                            >
                                                Match Score
                                            </p>
                                        </div>
                                        <p
                                            className="font-montserrat text-[12px] font-bold leading-[16px] tracking-[0px]"
                                            style={{ color: '#7C3AED' }}
                                        >
                                            {data.compatibility}% Compatible
                                        </p>
                                    </div>
                                </div>

                                {/* Tags They're Looking For */}
                                {data.selected_tags && data.selected_tags.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tags className="h-4 w-4 text-gray-500" />
                                            <p
                                                className="font-montserrat text-[12px] font-semibold leading-[14px] tracking-[0px]"
                                                style={{ color: '#193E47' }}
                                            >
                                                Skills They're Looking For
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.selected_tags.map((tag, index) => (
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

                                {/* Why You're a Good Match - Compatibility Statistics */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <p
                                            className="font-montserrat text-[14px] font-bold leading-[17px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            Why You're a Good Match
                                        </p>
                                    </div>

                                    {data.compatibility_breakdown ? (
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            {/* Industry Match */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-montserrat text-[12px] font-medium" style={{ color: '#193E47' }}>
                                                        Industry Match
                                                    </span>
                                                    <span className="font-montserrat text-[12px] font-bold" style={{ color: '#7C3AED' }}>
                                                        {data.compatibility_breakdown.industry_match}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${data.compatibility_breakdown.industry_match}%`,
                                                            background: 'linear-gradient(90deg, #7C3AED 0%, #BE51EA 100%)'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Business Level Match */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-montserrat text-[12px] font-medium" style={{ color: '#193E47' }}>
                                                        Experience Level Match
                                                    </span>
                                                    <span className="font-montserrat text-[12px] font-bold" style={{ color: '#7C3AED' }}>
                                                        {data.compatibility_breakdown.business_level_match}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${data.compatibility_breakdown.business_level_match}%`,
                                                            background: 'linear-gradient(90deg, #7C3AED 0%, #BE51EA 100%)'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Tags/Skills Match */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-montserrat text-[12px] font-medium" style={{ color: '#193E47' }}>
                                                        Skills Match
                                                    </span>
                                                    <span className="font-montserrat text-[12px] font-bold" style={{ color: '#7C3AED' }}>
                                                        {data.compatibility_breakdown.tags_match}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${data.compatibility_breakdown.tags_match}%`,
                                                            background: 'linear-gradient(90deg, #7C3AED 0%, #BE51EA 100%)'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Needs Match */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-montserrat text-[12px] font-medium" style={{ color: '#193E47' }}>
                                                        Needs Alignment
                                                    </span>
                                                    <span className="font-montserrat text-[12px] font-bold" style={{ color: '#7C3AED' }}>
                                                        {data.compatibility_breakdown.needs_match}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${data.compatibility_breakdown.needs_match}%`,
                                                            background: 'linear-gradient(90deg, #7C3AED 0%, #BE51EA 100%)'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* AI Similarity Score (if available and > 0) */}
                                            {data.compatibility_breakdown.ai_similarity_score !== undefined &&
                                                data.compatibility_breakdown.ai_similarity_score > 0 && (
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-montserrat text-[12px] font-medium" style={{ color: '#193E47' }}>
                                                                AI Similarity
                                                            </span>
                                                            <span className="font-montserrat text-[12px] font-bold" style={{ color: '#7C3AED' }}>
                                                                {Math.round(data.compatibility_breakdown.ai_similarity_score * 100)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${data.compatibility_breakdown.ai_similarity_score * 100}%`,
                                                                    background: 'linear-gradient(90deg, #7C3AED 0%, #BE51EA 100%)'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    ) : data.match_reasons && data.match_reasons.length > 0 ? (
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <ul className="space-y-2">
                                                {data.match_reasons.map((reason, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-2 font-montserrat text-[12px] font-normal"
                                                        style={{ color: '#193E47' }}
                                                    >
                                                        <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                                        {reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p
                                            className="font-montserrat text-[12px] font-light leading-[18px] tracking-[0px]"
                                            style={{ color: '#6B7280' }}
                                        >
                                            Your profile aligns with what this user is looking for.
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4 pt-2">
                                    {/* Match us Now Button - 174x39 with 10px border-radius */}
                                    <button
                                        onClick={onMatch}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-[9px] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{
                                            width: '174px',
                                            height: '39px',
                                            borderRadius: '10px',
                                            padding: '8px 13px',
                                            background: 'linear-gradient(83.85deg, #360D56 10.01%, #751DBC 88.82%)',
                                        }}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#F3F0E9' }} />
                                        ) : (
                                            <Sparkles className="h-4 w-4" style={{ color: '#F3F0E9' }} />
                                        )}
                                        <span
                                            className="font-montserrat text-[14px] font-semibold leading-[25px] tracking-[0px]"
                                            style={{ color: '#F3F0E9' }}
                                        >
                                            {isLoading ? 'Matching...' : 'Offer to Help'}
                                        </span>
                                    </button>

                                    {/* Not Now Button */}
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 rounded-[10px] bg-transparent px-4 py-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <X className="h-4 w-4" style={{ color: '#193E47' }} />
                                        <span
                                            className="font-montserrat text-[14px] font-semibold leading-[25px] tracking-[0px]"
                                            style={{ color: '#193E47' }}
                                        >
                                            Not Now
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
