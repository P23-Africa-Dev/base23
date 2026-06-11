'use client';

import { Card } from '@/components/ui/card';
import images from '@/constants/image';
import { formatCharacters, formatNameCharacters } from '@/utils/format-character';
import { Star } from 'lucide-react';
import React from 'react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SmartMatch {
    id?: number; // User ID for connection functionality
    name: string;
    title: string;
    industry: string;
    rating: number;
    imageSrc: string;
    // optional extras
    location?: string;
    experience?: string;
    interest?: string;
    reviews?: string;
    // Connection status
    connection_status?: 'connected' | 'pending' | 'none';
    direction?: 'incoming' | 'outgoing';
}

interface DirectoryLeadsProps {
    matches: SmartMatch[];
    // Connection functionality props
    onConnect?: (userId: number) => void;
    onAccept?: (userId: number) => void;
    onStartConversation?: (userId: number) => void;
    connectedUsers?: Array<{ id: number; name: string }>;
    pendingConnections?: Array<{ id: number; name: string; direction?: 'incoming' | 'outgoing' }>;
    loadingConnectionId?: number | null;
    authUserId?: number;
}

export const DirectoryLeads: React.FC<DirectoryLeadsProps> = ({
    matches,
    onConnect,
    onAccept,
    onStartConversation,
    connectedUsers = [],
    pendingConnections = [],
    loadingConnectionId,
    authUserId
}) => {
    // Helper function to get connection status and direction
    const getConnectionStatus = (userId: number) => {
        if (!userId || userId === authUserId) return { status: 'self', direction: undefined };

        const isConnected = connectedUsers.some(user => user.id === userId);
        if (isConnected) return { status: 'connected', direction: undefined };

        const pendingConnection = pendingConnections.find(user => user.id === userId);
        if (pendingConnection) return { status: 'pending', direction: pendingConnection.direction };

        return { status: 'none', direction: undefined };
    };

    // Helper function to handle button click
    const handleButtonClick = (match: SmartMatch, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!match.id || match.id === authUserId) return;

        const { status, direction } = getConnectionStatus(match.id);

        if (status === 'connected' && onStartConversation) {
            onStartConversation(match.id);
        } else if (status === 'pending' && direction === 'incoming' && onAccept) {
            onAccept(match.id);
        } else if (status === 'none' && onConnect) {
            onConnect(match.id);
        }
        // For outgoing pending connections, do nothing (button shows pending state)
    };

    // Helper function to get button content
    const getButtonContent = (match: SmartMatch) => {
        if (!match.id || match.id === authUserId) {
            return {
                icon: images.directoryConnect,
                tooltip: 'Your profile',
                disabled: true
            };
        }

        const { status, direction } = getConnectionStatus(match.id);
        const isLoading = loadingConnectionId === match.id;

        if (isLoading) {
            return {
                icon: images.directoryConnect,
                tooltip: 'Processing...',
                disabled: true,
                showSpinner: true
            };
        }

        switch (status) {
            case 'connected':
                return {
                    icon: images.userMessage,
                    tooltip: 'Send message',
                    disabled: false
                };
            case 'pending':
                // Incoming request - show accept button
                if (direction === 'incoming') {
                    return {
                        icon: images.directoryConnect,
                        tooltip: 'Accept Request',
                        disabled: false
                    };
                }
                // Outgoing request - show pending state
                return {
                    icon: images.directoryConnect,
                    tooltip: 'Request sent',
                    disabled: true,
                    opacity: 'opacity-50'
                };
            default:
                return {
                    icon: images.directoryConnect,
                    tooltip: 'Add to network',
                    disabled: false
                };
        }
    };
    return (
        <>
            {matches.map((match, index) => (
                <div key={index} className="w-full">
                    <Card
                        className="relative  flex h-[302px] w-full max-w-[250px] flex-col justify-end overflow-hidden rounded-xl px-[0.35px] shadow-[-2px_-6px_5px_-3px_rgba(0,0,0,0.1),-5px_10px_5px_-3px_rgba(0,0,0,0.1)]"
                    >
                        {/* Background image */}
                        <div
                            style={{
                                backgroundImage: `url(${match.imageSrc})`,
                            }}
                            className="absolute inset-0 z-0 h-full w-full overflow-hidden bg-cover bg-top bg-no-repeat object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Content */}
                        <div
                            style={{
                                backgroundImage: `url(${images.directoryleadseffect})`,
                            }}
                            className="relative bottom-[-21.4px] z-20 bg-cover bg-center bg-no-repeat py-4"
                        >
                            <div className="absolute inset-0 bottom-0 z-10 bg-gradient-to-t from-black/10 to-transparent" />

                            <div className="px-3">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="w-[130px]">
                                        <h3 className="text-[13.5px] leading-4 font-bold text-darkBlue">
                                            {' '}

                                            {formatNameCharacters(`${match.name}`, 12)}
                                        </h3>

                                        <div className="pt-0.5 flex gap-1.5">
                                            <img src={images.desktopLocation} className="hidden h-4 w-4 lg:block" alt="" />
                                            <p className="text-xs font-[400] text-darkBlue opacity-90">{match.location}</p>
                                        </div>
                                    </div>

                                    {/* ✅ Dynamic Connection Button */}
                                    {(() => {
                                        const buttonContent = getButtonContent(match);
                                        return (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={(e) => handleButtonClick(match, e)}
                                                        disabled={buttonContent.disabled}
                                                        className={`z-[10] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-darkBlue p-1.5 transition-colors hover:bg-darkBlue/70 disabled:cursor-not-allowed ${buttonContent.opacity || ''}`}
                                                    >
                                                        {buttonContent.showSpinner ? (
                                                            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                                                        ) : (
                                                            <div className="relative h-3 w-3">
                                                                <img
                                                                    src={buttonContent.icon}
                                                                    className="absolute object-contain"
                                                                    alt="Action icon"
                                                                />
                                                            </div>
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="z-[9999] flex w-[130px]">
                                                    <p className="text-xs font-medium text-deepBlue whitespace-nowrap">
                                                        {buttonContent.tooltip}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })()}
                                </div>

                                <div className="mt-4 flex w-full flex-wrap items-center justify-between">
                                    <div className="flex w-[55%] items-center">
                                        <span className="mr-1 text-base font-light text-darkBlue">{match.rating}</span>
                                        <Star className="h-5 w-5 fill-darkGreen text-darkGreen" />
                                    </div>
                                    <div className="flex w-[45%] items-end justify-end">
                                        <p className="text-right text-[9.5px] font-[700] text-darkBlue opacity-90">{match.title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </>
    );
};
