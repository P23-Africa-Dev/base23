'use client';

import { Card } from '@/components/ui/card';
import { MatchSidebar } from '@/components/referral/MatchSidebar';
import images from '@/constants/image';
import SmartMatchService, { setCurrentUserId } from '@/services/smart-match-service';
import type { MatchResult, SmartMatchUser } from '@/types/smart-match';
import { useAuth } from '@/context/AuthContext';
import { Link2, Star, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import toast from 'react-hot-toast';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

interface SmartMatch {
    id: number;
    name: string;
    title: string;
    company: string;
    rating: number;
    imageSrc: string;
    compatibility?: number;
    match_reasons?: string[];
    why_this_match?: string;
}

interface SmartMatchCardProps {
    match: SmartMatch;
    onMatch: (match: SmartMatch) => void;
    isMatching?: boolean;
}

const SmartMatchCard: React.FC<SmartMatchCardProps> = ({ match, onMatch, isMatching }) => {
    return (
        <Card className="relative flex h-[202px] w-full max-w-[250px] flex-col justify-end overflow-hidden rounded-xl shadow-lg">
            {/* Placeholder for the image, replace with actual image source */}
            <div
                style={{
                    backgroundImage: `url(${match.imageSrc})`,
                }}
                className="absolute inset-0 z-0 h-full w-full overflow-hidden bg-cover bg-top bg-no-repeat object-cover"
            ></div>
            {/* Overlay for text readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 to-transparent"></div>

            <div className="relative -bottom-7 z-20 bg-[#FFFFFFCC]/80 p-4">
                <h3 className="text-sm font-bold text-darkBlue">{match.name}</h3>
                <p className="text-xs font-medium text-darkBlue opacity-90">{match.title}</p>
                <div className="mt-2 flex items-center">
                    <span className="mr-1 text-lg font-semibold text-darkBlue">
                        {match.compatibility ? `${match.compatibility}%` : match.rating}
                    </span>
                    <Star className="h-5 w-5 fill-darkGreen text-darkGreen" />
                </div>
                <button
                    onClick={() => onMatch(match)}
                    disabled={isMatching}
                    className="absolute right-4 bottom-4 flex items-center justify-center rounded-full bg-darkBlue p-2 backdrop-blur-sm transition-colors hover:bg-darkBlue/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Match Us!"
                >
                    {isMatching ? (
                        <Loader2 className="h-3 w-3 text-white animate-spin" />
                    ) : (
                        <Link2 className="h-3 w-3 text-white" />
                    )}
                </button>
            </div>
        </Card>
    );
};

interface SwiperCarouselProps {
    matches: SmartMatch[];
    onMatch: (match: SmartMatch) => void;
    matchingId: number | null;
}

const SwiperCarousel: React.FC<SwiperCarouselProps> = ({ matches, onMatch, matchingId }) => {
    return (
        <Swiper
            slidesPerView={2.3} // Show 2 and a half slides
            spaceBetween={16} // Add spacing between cards (adjust px value as needed)
            freeMode={true}
            pagination={{ clickable: true }}
            className="mySwiper"
        >
            {matches.map((match) => (
                <SwiperSlide key={match.id} className="w-full">
                    <SmartMatchCard
                        match={match}
                        onMatch={onMatch}
                        isMatching={matchingId === match.id}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default function SmartMatchesSection() {
    const { user } = useAuth();
    const authUserId = user?.id || 0;

    const [matches, setMatches] = useState<SmartMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [matchingId, setMatchingId] = useState<number | null>(null);
    const [isMatchSidebarOpen, setIsMatchSidebarOpen] = useState(false);
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [activeMatch, setActiveMatch] = useState<SmartMatch | null>(null);

    // Set the user ID for the smart match service
    useEffect(() => {
        if (authUserId > 0) {
            setCurrentUserId(authUserId);
        }
    }, [authUserId]);

    // Fetch smart matches from API
    const fetchMatches = useCallback(async () => {
        if (authUserId <= 0) return;

        setIsLoading(true);
        try {
            const response = await SmartMatchService.getMatches(10);
            console.log('Smart match API response:', response);

            if (response.success && response.matches && response.matches.length > 0) {
                // Convert API matches to component format
                const formattedMatches: SmartMatch[] = response.matches.map((match: SmartMatchUser) => ({
                    id: match.id,
                    name: match.name,
                    title: match.position || 'Professional',
                    company: match.company_name || '',
                    rating: Number(match.compatibility) / 20 || 4.5, // Convert compatibility to 5-star rating
                    imageSrc: match.profile_picture || images.businessMan1,
                    compatibility: match.compatibility,
                    match_reasons: match.match_reasons,
                    why_this_match: match.ai_insights,
                }));
                setMatches(formattedMatches);
            } else {
                // No matches available - set empty array
                setMatches([]);
            }
        } catch (error) {
            console.error('Error fetching smart matches:', error);
            // Set empty array on error
            setMatches([]);
        } finally {
            setIsLoading(false);
        }
    }, [authUserId]);

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    // Handle match action
    const handleMatch = async (match: SmartMatch) => {
        setMatchingId(match.id);
        setActiveMatch(match);

        try {
            // First, send the match request (connection + conversation)
            const result = await SmartMatchService.matchUser(match.id);

            if (result) {
                setMatchResult(result);
                setIsMatchSidebarOpen(true);

                // Also send a smart match notification to the recipient
                const notificationResult = await SmartMatchService.sendSmartMatch({
                    recipient_id: match.id,
                    compatibility: match.compatibility || 0,
                    match_reasons: match.match_reasons,
                    why_this_match: match.why_this_match,
                });

                if (notificationResult.success) {
                    toast.success(`Match request sent to ${match.name}!`, {
                        duration: 4000,
                        position: 'top-center',
                        style: {
                            background: '#0B1727',
                            color: '#fff',
                            padding: '16px',
                            borderRadius: '12px',
                        },
                        icon: '🤝',
                    });
                }
            }
        } catch (error) {
            console.error('Error matching user:', error);
            toast.error('Failed to send match request. Please try again.', {
                duration: 3000,
                position: 'top-center',
            });
        } finally {
            setMatchingId(null);
        }
    };

    // Close match sidebar
    const handleMatchClose = () => {
        setIsMatchSidebarOpen(false);
        setMatchResult(null);
        setActiveMatch(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-darkBlue" />
            </div>
        );
    }

    // Show empty state if no matches
    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="mb-3 rounded-full bg-gray-100 p-4">
                    <Star className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-darkBlue mb-1">No One Needs Your Help Yet</h3>
                <p className="text-xs text-gray-500 max-w-[200px]">
                    When users set up their preferences, you'll see those whose problems match your expertise.
                </p>
            </div>
        );
    }

    return (
        <>
            <SwiperCarousel
                matches={matches}
                onMatch={handleMatch}
                matchingId={matchingId}
            />

            {/* Match Sidebar */}
            <MatchSidebar
                open={isMatchSidebarOpen}
                onClose={handleMatchClose}
                matchResult={matchResult}
                user={activeMatch ? {
                    id: activeMatch.id,
                    name: activeMatch.name,
                    role: activeMatch.title,
                    company: activeMatch.company,
                    image: activeMatch.imageSrc,
                    compatibility: activeMatch.compatibility,
                } : null}
            />
        </>
    );
}
