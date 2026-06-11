import images from '@/constants/image';
import Link from 'next/link';
import axios from 'axios';
import { Check, ChevronLeft, ChevronRight, Minimize2, X, XCircle, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type ReceivedDealCard = {
    id: number;
    deal_card_id: number;
    status: 'pending' | 'viewed' | 'accepted' | 'rejected';
    viewed_at: string | null;
    responded_at: string | null;
    created_at: string;
    deal_card: {
        id: number;
        title: string;
        deal_type: string;
        industry: string;
        description: string;
        timeline: string;
        geography: string;
        deal_value: string;
        tags: string[];
        created_at: string;
        sender: {
            id: number;
            name: string;
            avatar: string | null;
            job_title: string;
            company: string;
        } | null;
    };
};

// Type for single card view from notifications
type SingleDealCardData = {
    id: number;
    title: string;
    deal_type: string;
    industry: string;
    description: string;
    timeline: string;
    geography: string;
    deal_value: string;
    sender?: {
        id: number;
        name: string;
        profile_picture?: string | null;
        avatar?: string | null; // Some sources use avatar instead of profile_picture
        job_title?: string;
        company?: string;
    } | null;
};

interface DealCardPopupProps {
    dealCards: ReceivedDealCard[];
    onDealCardsUpdate: (cards: ReceivedDealCard[]) => void;
    // Optional props for single card view from notifications
    singleCard?: SingleDealCardData | null;
    singleCardStatus?: 'pending' | 'viewed' | 'accepted' | 'rejected';
    onSingleCardClose?: () => void;
}

export default function DealCardPopup({
    dealCards,
    onDealCardsUpdate,
    singleCard,
    singleCardStatus = 'pending',
    onSingleCardClose,
}: DealCardPopupProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false); // Completely hidden state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [processingAction, setProcessingAction] = useState<'accept' | 'reject' | 'close' | null>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isAnimatingIn, setIsAnimatingIn] = useState(true);
    const [minimizedCount, setMinimizedCount] = useState(0);
    const [pulseMinimized, setPulseMinimized] = useState(false);

    // Determine if in single card mode (from notification)
    const isSingleCardMode = !!singleCard;
    const canTakeAction = isSingleCardMode
        ? (singleCardStatus === 'pending' || singleCardStatus === 'viewed')
        : true;

    // Current card being displayed
    const currentCard = dealCards[currentIndex];

    // Check localStorage on mount to see if popup was already shown this session
    useEffect(() => {
        if (!isSingleCardMode && dealCards.length > 0) {
            const hasSeenPopup = localStorage.getItem('dealCardPopupSeen');
            const dismissedUntil = localStorage.getItem('dealCardPopupDismissed');

            // Check if popup was dismissed (hide completely including floating button)
            if (dismissedUntil) {
                const dismissedTime = parseInt(dismissedUntil, 10);
                // If dismissed less than 24 hours ago, stay dismissed
                if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setIsDismissed(true);
                    return;
                } else {
                    // Clear old dismissal
                    localStorage.removeItem('dealCardPopupDismissed');
                }
            }

            // If user has seen the popup before, start minimized
            if (hasSeenPopup) {
                setIsMinimized(true);
                setMinimizedCount(dealCards.length);
                setIsAnimatingIn(false);
            } else {
                // First time seeing - show the popup
                setIsVisible(true);
                setIsAnimatingIn(true);
                const timer = setTimeout(() => setIsAnimatingIn(false), 500);
                // Mark as seen
                localStorage.setItem('dealCardPopupSeen', 'true');
                return () => clearTimeout(timer);
            }
        }
    }, [dealCards.length, isSingleCardMode]);

    // Update minimized count when cards change
    useEffect(() => {
        if (isMinimized) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMinimizedCount(dealCards.length);
        }
    }, [dealCards.length, isMinimized]);

    // Handle accept/reject
    const handleDealCardResponse = async (status: 'accepted' | 'rejected') => {
        // For single card mode
        if (isSingleCardMode && singleCard) {
            setProcessingAction(status === 'accepted' ? 'accept' : 'reject');
            try {
                const response = await axios.post(`/api/dealcards/${singleCard.id}/status`, { status });
                if (response.data.success) {
                    toast.success(status === 'accepted' ? 'Deal card accepted!' : 'Deal card declined');
                    handleSingleCardClose();
                }
            } catch (error) {
                console.error('Error updating deal card status:', error);
                toast.error('Failed to update deal card status');
            } finally {
                setProcessingAction(null);
            }
            return;
        }

        // For multi card mode
        if (!currentCard) return;

        setProcessingAction(status === 'accepted' ? 'accept' : 'reject');
        try {
            const response = await axios.post(`/api/dealcards/${currentCard.deal_card_id}/status`, { status });
            if (response.data.success) {
                toast.success(status === 'accepted' ? 'Deal card accepted!' : 'Deal card declined');

                // Remove the card from the list
                const updatedCards = dealCards.filter((_, idx) => idx !== currentIndex);
                onDealCardsUpdate(updatedCards);

                // Adjust current index if needed
                if (currentIndex >= updatedCards.length && updatedCards.length > 0) {
                    setCurrentIndex(updatedCards.length - 1);
                }

                // If no more cards, close the popup
                if (updatedCards.length === 0) {
                    handleCloseAll();
                }
            }
        } catch (error) {
            console.error('Error updating deal card status:', error);
            toast.error('Failed to update deal card status');
        } finally {
            setProcessingAction(null);
        }
    };

    // Handle close (mark as viewed for sender, keep pending for receiver)
    const handleClose = async () => {
        if (!currentCard) return;

        setProcessingAction('close');
        try {
            // Mark as viewed (sender sees "viewed", receiver keeps it in pending)
            await axios.post(`/api/dealcards/${currentCard.deal_card_id}/view`);

            // Animate out and minimize
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsMinimized(true);
                setMinimizedCount(dealCards.length);
                setIsAnimatingOut(false);
                setPulseMinimized(true);
                setTimeout(() => setPulseMinimized(false), 1000);
            }, 300);
        } catch (error) {
            console.error('Error marking deal card as viewed:', error);
            // Still minimize even if API fails
            setIsMinimized(true);
            setMinimizedCount(dealCards.length);
        } finally {
            setProcessingAction(null);
        }
    };

    // Handle minimize
    const handleMinimize = async () => {
        if (!currentCard) return;

        try {
            // Mark as viewed when minimizing
            await axios.post(`/api/dealcards/${currentCard.deal_card_id}/view`);
        } catch (error) {
            console.error('Error marking deal card as viewed:', error);
        }

        setIsAnimatingOut(true);
        setTimeout(() => {
            setIsMinimized(true);
            setMinimizedCount(dealCards.length);
            setIsAnimatingOut(false);
            setPulseMinimized(true);
            setTimeout(() => setPulseMinimized(false), 1000);
        }, 300);
    };

    // Handle expand from minimized state
    const handleExpand = () => {
        setIsMinimized(false);
        setIsAnimatingIn(true);
        setTimeout(() => setIsAnimatingIn(false), 500);
    };

    // Handle close all (completely hide) - called when X button is clicked
    const handleCloseAll = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsMinimized(false);
            setIsDismissed(true);
            // Store dismissal time in localStorage
            localStorage.setItem('dealCardPopupDismissed', Date.now().toString());
            // Show toast informing user about notification access
            toast.success('Deal cards can still be accessed from Notifications', {
                duration: 4000,
                icon: '📬',
            });
        }, 300);
    };

    // Navigate between cards
    const handlePrevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNextCard = () => {
        if (currentIndex < dealCards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // Helper function to get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return (
                    <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-700">
                        <Check className="h-5 w-5" />
                        <span className="font-semibold">Accepted</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-red-700">
                        <XCircle className="h-5 w-5" />
                        <span className="font-semibold">Declined</span>
                    </div>
                );
            case 'viewed':
                return (
                    <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
                        <Eye className="h-5 w-5" />
                        <span className="font-semibold">Viewed</span>
                    </div>
                );
            default:
                return null;
        }
    };

    // Single card mode close handler
    const handleSingleCardClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onSingleCardClose?.();
        }, 300);
    };

    // Don't render if dismissed (user clicked X to close completely)
    if (isDismissed && !isSingleCardMode) return null;

    // Don't render if not in single card mode and no cards or not visible
    if (!isSingleCardMode && (!isVisible || dealCards.length === 0)) return null;

    // For single card mode, just check if we have a card
    if (isSingleCardMode && !singleCard) return null;

    // Minimized state - floating button in bottom right (not used in single card mode)
    if (isMinimized && !isSingleCardMode) {
        return (
            <div
                className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 ease-out ${pulseMinimized ? 'animate-bounce' : ''
                    }`}
            >
                <div className="relative group">
                    {/* Ripple effect */}
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />

                    {/* Main button */}
                    <div
                        onClick={handleExpand}
                        className="relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-110"
                    >
                        <img
                            src={images.dealcrdfolder}
                            alt="Deal Cards"
                            className="h-7 w-7 brightness-0 invert"
                        />

                        {/* Badge with count */}
                        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
                            {minimizedCount}
                        </div>
                    </div>

                    {/* Close button - appears on hover */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCloseAll();
                        }}
                        className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-gray-900"
                        title="Dismiss"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {minimizedCount} pending deal card{minimizedCount !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        );
    }

    // Full popup modal
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isAnimatingOut ? 'opacity-0' : isAnimatingIn ? 'animate-fadeIn' : 'opacity-100'
                    }`}
                onClick={isSingleCardMode ? handleSingleCardClose : handleMinimize}
            />

            {/* Modal */}
            <div
                className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isAnimatingOut
                    ? 'scale-0 opacity-0 translate-x-full translate-y-full'
                    : isAnimatingIn
                        ? 'animate-slideInScale'
                        : ''
                    }`}
                style={{
                    transformOrigin: 'bottom right',
                }}
            >
                <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <img src={images.dealcrdfolder} alt="Deal Card" className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-montserrat text-lg font-semibold text-gray-900">
                                    {isSingleCardMode ? 'Deal Card' : 'Incoming Deal Card'}
                                </h2>
                                {!isSingleCardMode && (
                                    <p className="text-sm text-gray-500">
                                        {currentIndex + 1} of {dealCards.length} pending
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {!isSingleCardMode && (
                                <button
                                    onClick={handleMinimize}
                                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                    title="Minimize"
                                >
                                    <Minimize2 className="h-5 w-5" />
                                </button>
                            )}
                            <button
                                onClick={isSingleCardMode ? handleSingleCardClose : handleClose}
                                disabled={processingAction === 'close'}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                title="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Card Content - Single Card Mode */}
                    {isSingleCardMode && singleCard && (
                        <div className="p-6">
                            {/* Sender info */}
                            <div className="mb-5 flex items-center gap-4">
                                <div
                                    className="h-14 w-14 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-primary/20"
                                    style={{
                                        backgroundImage: (singleCard.sender?.profile_picture || singleCard.sender?.avatar)
                                            ? `url(${singleCard.sender.profile_picture || singleCard.sender.avatar})`
                                            : `url(${images.man6})`,
                                    }}
                                />
                                <div className="flex-1">
                                    <p className="font-montserrat font-semibold text-gray-900">
                                        {singleCard.sender?.name || 'Unknown Sender'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {singleCard.sender?.job_title}
                                        {singleCard.sender?.company && ` at ${singleCard.sender.company}`}
                                    </p>
                                </div>
                                {/* Status badge */}
                                {singleCardStatus === 'pending' ? (
                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                        Pending
                                    </span>
                                ) : singleCardStatus === 'viewed' ? (
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                        Viewed
                                    </span>
                                ) : singleCardStatus === 'accepted' ? (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                        Accepted
                                    </span>
                                ) : singleCardStatus === 'rejected' ? (
                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                        Declined
                                    </span>
                                ) : null}
                            </div>

                            {/* Deal card details */}
                            <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-5">
                                <h3 className="mb-2 font-montserrat text-xl font-bold text-gray-900">
                                    {singleCard.title}
                                </h3>

                                <div className="mb-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                                        {singleCard.deal_type}
                                    </span>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                        {singleCard.industry}
                                    </span>
                                </div>

                                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                                    {singleCard.description}
                                </p>

                                <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">Timeline</p>
                                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                                            {singleCard.timeline || 'Flexible'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">Value</p>
                                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                                            {singleCard.deal_value || 'Negotiable'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">Geography</p>
                                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                                            {singleCard.geography || 'Global'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons - only show if can take action */}
                            {canTakeAction ? (
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => handleDealCardResponse('rejected')}
                                        disabled={processingAction !== null}
                                        className="flex-1 rounded-xl border-2 border-red-200 bg-white px-6 py-3.5 font-montserrat text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {processingAction === 'reject' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                                Processing...
                                            </span>
                                        ) : (
                                            'Decline'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDealCardResponse('accepted')}
                                        disabled={processingAction !== null}
                                        className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3.5 font-montserrat text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
                                    >
                                        {processingAction === 'accept' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Processing...
                                            </span>
                                        ) : (
                                            'Accept Deal'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-6 flex justify-center">
                                    {getStatusBadge(singleCardStatus)}
                                </div>
                            )}

                            {/* View all link */}
                            <div className="mt-4 text-center">
                                <Link
                                    href="/dealcard/view"
                                    className="text-sm text-gray-500 underline-offset-2 hover:text-primary hover:underline"
                                >
                                    View all deal cards
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Card Content - Multi Card Mode */}
                    {!isSingleCardMode && currentCard && currentCard.deal_card && (
                        <div className="p-6">
                            {/* Sender info */}
                            <div className="mb-5 flex items-center gap-4">
                                <div
                                    className="h-14 w-14 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-primary/20"
                                    style={{
                                        backgroundImage: currentCard.deal_card.sender?.avatar
                                            ? `url(${currentCard.deal_card.sender.avatar})`
                                            : `url(${images.man6})`,
                                    }}
                                />
                                <div className="flex-1">
                                    <p className="font-montserrat font-semibold text-gray-900">
                                        {currentCard.deal_card.sender?.name || 'Unknown Sender'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {currentCard.deal_card.sender?.job_title}
                                        {currentCard.deal_card.sender?.company && ` at ${currentCard.deal_card.sender.company}`}
                                    </p>
                                </div>
                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                    New
                                </span>
                            </div>

                            {/* Deal card details */}
                            <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-5">
                                <h3 className="mb-2 font-montserrat text-xl font-bold text-gray-900">
                                    {currentCard.deal_card.title}
                                </h3>

                                <div className="mb-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                                        {currentCard.deal_card.deal_type}
                                    </span>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                        {currentCard.deal_card.industry}
                                    </span>
                                </div>

                                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                                    {currentCard.deal_card.description}
                                </p>

                                <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">Timeline</p>
                                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                                            {currentCard.deal_card.timeline || 'Flexible'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">Value</p>
                                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                                            {currentCard.deal_card.deal_value || 'Negotiable'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">Geography</p>
                                        <p className="font-montserrat text-sm font-semibold text-gray-900">
                                            {currentCard.deal_card.geography || 'Global'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation (if multiple cards) */}
                            {dealCards.length > 1 && (
                                <div className="mt-4 flex items-center justify-center gap-4">
                                    <button
                                        onClick={handlePrevCard}
                                        disabled={currentIndex === 0}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    {/* Dots indicator */}
                                    <div className="flex gap-1.5">
                                        {dealCards.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`h-2 rounded-full transition-all ${idx === currentIndex
                                                    ? 'w-6 bg-primary'
                                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleNextCard}
                                        disabled={currentIndex === dealCards.length - 1}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => handleDealCardResponse('rejected')}
                                    disabled={processingAction !== null}
                                    className="flex-1 rounded-xl border-2 border-red-200 bg-white px-6 py-3.5 font-montserrat text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                                >
                                    {processingAction === 'reject' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                            Processing...
                                        </span>
                                    ) : (
                                        'Decline'
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDealCardResponse('accepted')}
                                    disabled={processingAction !== null}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3.5 font-montserrat text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
                                >
                                    {processingAction === 'accept' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Processing...
                                        </span>
                                    ) : (
                                        'Accept Deal'
                                    )}
                                </button>
                            </div>

                            {/* View all link */}
                            <div className="mt-4 text-center">
                                <Link
                                    href="/dealcard/view?tab=pending"
                                    className="text-sm text-gray-500 underline-offset-2 hover:text-primary hover:underline"
                                >
                                    View all pending deal cards
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideInScale {
                    0% {
                        opacity: 0;
                        transform: scale(0.5) translateY(100px);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.02) translateY(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                .animate-slideInScale {
                    animation: slideInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
        </>
    );
}
