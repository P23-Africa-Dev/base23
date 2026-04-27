'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IoClose, IoChevronBack, IoCheckmarkDone } from 'react-icons/io5';
import { FaBell, FaUserPlus, FaCreditCard, FaShieldAlt, FaSpinner, FaHandshake } from 'react-icons/fa';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationType, DealCardStatus, DealCardData, SmartMatchData } from '@/services/notification-service';
import SmartMatchPopup from './smart-match-popup';

interface NotificationGroup {
    type: NotificationType;
    label: string;
    count: number;
    notifications: Notification[];
}

interface NotificationCardProps {
    isOpen: boolean;
    onClose: () => void;
    sidebarOpen?: boolean;
    // Callback when a sent deal card notification is clicked - opens full info modal
    onSentDealCardClick?: (dealCardData: DealCardData) => void;
    // Callback when a received deal card notification is clicked - opens popup
    onReceivedDealCardClick?: (dealCardData: DealCardData, status: DealCardStatus) => void;
    // Callback when a smart match notification is accepted
    onSmartMatchAccept?: (data: SmartMatchData) => void;
    // Callback when a smart match notification is declined
    onSmartMatchDecline?: (data: SmartMatchData) => void;
}

// Get icon background color based on notification type
const getIconBgColor = (type: NotificationType): string => {
    switch (type) {
        case 'deal_card':
            return 'bg-[#F6DB5254]'; // Yellow tint
        case 'connection':
            return 'bg-[#52F66E54]'; // Green tint
        case 'security':
            return 'bg-[#FFA0C454]'; // Pink tint
        case 'smart_match':
            return 'bg-[#5264F654]'; // Blue/Purple tint
        case 'general':
        default:
            return 'bg-[#F6DB5254]'; // Yellow tint default
    }
};

// Get icon based on notification type
const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'deal_card':
            return <FaCreditCard className="h-4 w-4 text-[#0B1727]" />;
        case 'connection':
            return <FaUserPlus className="h-4 w-4 text-[#0B1727]" />;
        case 'security':
            return <FaShieldAlt className="h-4 w-4 text-[#0B1727]" />;
        case 'smart_match':
            return <FaHandshake className="h-4 w-4 text-[#0B1727]" />;
        case 'general':
        default:
            return <FaBell className="h-4 w-4 text-[#0B1727]" />;
    }
};

// Get group label
const getGroupLabel = (type: NotificationType): string => {
    switch (type) {
        case 'deal_card':
            return 'Deal Card';
        case 'connection':
            return 'Connections';
        case 'security':
            return 'Security & Sensitive';
        case 'smart_match':
            return 'Smart Match';
        case 'general':
        default:
            return 'Others';
    }
};

const NotificationCard: React.FC<NotificationCardProps> = ({
    isOpen,
    onClose,
    sidebarOpen = true,
    onSentDealCardClick,
    onReceivedDealCardClick,
    onSmartMatchAccept,
    onSmartMatchDecline,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [expandedGroup, setExpandedGroup] = useState<NotificationType | null>(null);
    const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Smart match popup state
    const [smartMatchPopupOpen, setSmartMatchPopupOpen] = useState(false);
    const [selectedSmartMatchData, setSelectedSmartMatchData] = useState<SmartMatchData | null>(null);
    const [smartMatchLoading, setSmartMatchLoading] = useState(false);

    // Use the notifications hook to fetch data from API
    const {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        refetch,
    } = useNotifications({
        autoFetch: isOpen, // Only fetch when card is open
        pollingInterval: isOpen ? 30000 : 0, // Poll every 30 seconds when open
    });

    // Refetch notifications when card opens
    useEffect(() => {
        if (isOpen) {
            refetch();
        }
    }, [isOpen, refetch]);

    // Handle notification click
    const handleNotificationClick = useCallback(async (notification: Notification) => {
        // Mark as read when clicked
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        // Handle smart_match notifications - open popup
        if (notification.type === 'smart_match' && notification.smartMatchData) {
            setSelectedSmartMatchData(notification.smartMatchData as SmartMatchData);
            setSmartMatchPopupOpen(true);
            return;
        }

        // Only handle deal card notifications with special behavior
        if (notification.type === 'deal_card' && notification.dealCardData) {
            if (notification.dealCardDirection === 'sent') {
                // Sent deal card - open full info modal
                onSentDealCardClick?.(notification.dealCardData);
                onClose();
            } else if (notification.dealCardDirection === 'received') {
                // Received deal card - open popup
                onReceivedDealCardClick?.(notification.dealCardData, notification.dealCardStatus || 'pending');
                onClose();
            }
        }
        // For other notification types, you can add different handlers
    }, [markAsRead, onSentDealCardClick, onReceivedDealCardClick, onClose]);

    // Handle smart match accept
    const handleSmartMatchAccept = useCallback(async () => {
        if (!selectedSmartMatchData) return;

        setSmartMatchLoading(true);
        try {
            onSmartMatchAccept?.(selectedSmartMatchData);
            setSmartMatchPopupOpen(false);
            setSelectedSmartMatchData(null);
        } finally {
            setSmartMatchLoading(false);
        }
    }, [selectedSmartMatchData, onSmartMatchAccept]);

    // Handle smart match decline
    const handleSmartMatchDecline = useCallback(async () => {
        if (!selectedSmartMatchData) return;

        setSmartMatchLoading(true);
        try {
            onSmartMatchDecline?.(selectedSmartMatchData);
            setSmartMatchPopupOpen(false);
            setSelectedSmartMatchData(null);
        } finally {
            setSmartMatchLoading(false);
        }
    }, [selectedSmartMatchData, onSmartMatchDecline]);

    // Handle mark all as read
    const handleMarkAllAsRead = useCallback(async () => {
        await markAllAsRead(filterType !== 'all' ? filterType : undefined);
    }, [markAllAsRead, filterType]);

    // Handle outside click to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onClose]);

    // Reset expanded group when card closes
    useEffect(() => {
        if (!isOpen) {
            setExpandedGroup(null);
            setFilterType('all');
            setShowFilterDropdown(false);
        }
    }, [isOpen]);

    // Handle click outside filter dropdown
    useEffect(() => {
        function handleFilterClickOutside(event: MouseEvent) {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setShowFilterDropdown(false);
            }
        }

        if (showFilterDropdown) {
            document.addEventListener('mousedown', handleFilterClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleFilterClickOutside);
            };
        }
    }, [showFilterDropdown]);

    // Group notifications by type
    const groupedNotifications: NotificationGroup[] = [
        {
            type: 'deal_card',
            label: 'Deal Card',
            count: notifications.filter(n => n.type === 'deal_card').length,
            notifications: notifications.filter(n => n.type === 'deal_card'),
        },
        {
            type: 'connection',
            label: 'Connections',
            count: notifications.filter(n => n.type === 'connection').length,
            notifications: notifications.filter(n => n.type === 'connection'),
        },
        {
            type: 'security',
            label: 'Security & Sensitive',
            count: notifications.filter(n => n.type === 'security').length,
            notifications: notifications.filter(n => n.type === 'security'),
        },
        {
            type: 'smart_match',
            label: 'Smart Match',
            count: notifications.filter(n => n.type === 'smart_match').length,
            notifications: notifications.filter(n => n.type === 'smart_match'),
        },
    ];

    // Get general/other notifications
    const generalNotifications = notifications.filter(n => n.type === 'general');

    // Filter options for dropdown
    const filterOptions: { value: NotificationType | 'all'; label: string; icon: React.ReactNode }[] = [
        { value: 'all', label: 'All Notification', icon: <FaBell className="h-4 w-4" /> },
        { value: 'general', label: 'Others', icon: <FaBell className="h-4 w-4" /> },
        { value: 'deal_card', label: 'Deal Card', icon: <FaCreditCard className="h-4 w-4" /> },
        { value: 'connection', label: 'Connections', icon: <FaUserPlus className="h-4 w-4" /> },
        { value: 'security', label: 'Security & Sensitive', icon: <FaShieldAlt className="h-4 w-4" /> },
        { value: 'smart_match', label: 'Smart Match', icon: <FaHandshake className="h-4 w-4" /> },
    ];

    // Get filtered notifications based on selected filter
    const getFilteredNotifications = () => {
        if (filterType === 'all') {
            return notifications;
        }
        return notifications.filter(n => n.type === filterType);
    };

    const filteredNotifications = getFilteredNotifications();

    // Get current filter label
    const getCurrentFilterLabel = () => {
        const option = filterOptions.find(o => o.value === filterType);
        return option?.label || 'All Notification';
    };

    // Check if there are unread notifications in current view
    const hasUnreadNotifications = filteredNotifications.some(n => !n.read);

    // Render individual notification item
    const renderNotificationItem = (notification: Notification, showTypeIcon: boolean = true) => (
        <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`flex cursor-pointer items-start gap-3 rounded-[25px] p-4 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] transition-all hover:bg-[#e4e6e3] ${notification.read ? 'bg-[#ECEEEB]' : 'bg-[#E8EBE6] border-l-4 border-[#0B1727]'
                }`}
        >
            {/* Profile Picture / Icon */}
            <div className="relative flex-shrink-0">
                {notification.type === 'security' ? (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getIconBgColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                    </div>
                ) : notification.profilePicture ? (
                    <img
                        src={notification.profilePicture}
                        alt={notification.title}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-[#0B1727] to-[#193E47]">
                        <div className="flex h-full w-full items-center justify-center text-white">
                            <span className="font-montserrat text-lg font-semibold">
                                {notification.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                )}
                {/* Unread indicator dot */}
                {!notification.read && (
                    <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#0B1727] border-2 border-white" />
                )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className={`font-montserrat text-[20px] leading-[100%] text-[#0B1727] ${notification.read ? 'font-bold' : 'font-extrabold'}`}>
                            {notification.title}
                        </h4>
                        <p className="mt-1 font-montserrat text-[11px] font-medium leading-[12px] tracking-[0.5px] text-[#0B1727]">
                            {notification.subtitle}
                        </p>
                    </div>
                    {/* Type Icon */}
                    {showTypeIcon && (
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getIconBgColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                        </div>
                    )}
                </div>
                <p className="mt-2 line-clamp-2 font-montserrat text-[9px] font-normal leading-[100%] text-[#0D1A34CC]">
                    {notification.message}
                </p>
                <p className="mt-2 text-right font-montserrat text-[9px] font-normal text-[#0D1A34CC]">
                    {notification.time}
                </p>
            </div>
        </div>
    );

    // Render group card (collapsed view)
    const renderGroupCard = (group: NotificationGroup, index: number) => {
        const firstNotification = group.notifications[0];
        if (!firstNotification) return null;

        const hasUnread = group.notifications.some(n => !n.read);

        return (
            <div
                key={group.type}
                onClick={() => setExpandedGroup(group.type)}
                className={`flex cursor-pointer items-start gap-3 rounded-[25px] p-4 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] transition-all hover:bg-[#e4e6e3] ${hasUnread ? 'bg-[#E8EBE6] border-l-4 border-[#0B1727]' : 'bg-[#ECEEEB]'
                    }`}
            >
                {/* Profile Picture / Icon */}
                <div className="relative flex-shrink-0">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getIconBgColor(group.type)}`}>
                        {getNotificationIcon(group.type)}
                    </div>
                    {/* Count badge */}
                    {group.count > 1 && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0B1727] text-[10px] font-bold text-white">
                            {group.count}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className={`font-montserrat text-[20px] leading-[100%] text-[#0B1727] ${hasUnread ? 'font-extrabold' : 'font-bold'}`}>
                                {firstNotification.title}
                            </h4>
                            <p className="mt-1 font-montserrat text-[11px] font-medium leading-[12px] tracking-[0.5px] text-[#0B1727]">
                                {firstNotification.subtitle}
                            </p>
                        </div>
                        {/* Group label badge */}
                        <div className={`flex items-center gap-1 rounded-full px-2 py-1 ${getIconBgColor(group.type)}`}>
                            {getNotificationIcon(group.type)}
                            <span className="font-montserrat text-[8px] font-medium text-[#0B1727]">
                                {group.label}
                            </span>
                        </div>
                    </div>
                    <p className="mt-2 line-clamp-2 font-montserrat text-[9px] font-normal leading-[100%] text-[#0D1A34CC]">
                        {firstNotification.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="font-montserrat text-[9px] font-medium text-[#0B1727]">
                            {group.count > 1 ? `+${group.count - 1} more` : ''}
                        </span>
                        <p className="font-montserrat text-[9px] font-normal text-[#0D1A34CC]">
                            {firstNotification.time}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={cardRef}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`fixed bottom-[60px] z-[100] w-[431px] rounded-[20px] bg-white shadow-[0px_1px_2px_2px_rgba(0,0,0,0.15)] transition-[left] duration-300 ease-in-out ${sidebarOpen ? 'left-[230px]' : 'left-[70px]'
                        }`}
                    style={{ maxHeight: '702px' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 pt-5 pb-4">
                        <div className="flex items-center gap-3">
                            {expandedGroup ? (
                                <button
                                    onClick={() => setExpandedGroup(null)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
                                >
                                    <IoChevronBack className="h-5 w-5 text-[#0B1727]" />
                                </button>
                            ) : (
                                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                                    <svg className="h-5 w-5 text-[#0B1727]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            )}
                            {/* Filter Dropdown */}
                            <div className="relative" ref={filterDropdownRef}>
                                <button
                                    onClick={() => !expandedGroup && setShowFilterDropdown(!showFilterDropdown)}
                                    className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${!expandedGroup ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'
                                        }`}
                                >
                                    <span className="font-montserrat text-sm font-medium text-[#0B1727]">
                                        {expandedGroup ? getGroupLabel(expandedGroup) : getCurrentFilterLabel()}
                                    </span>
                                    {!expandedGroup && (
                                        <svg
                                            className={`h-4 w-4 text-[#0B1727] transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {showFilterDropdown && !expandedGroup && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute left-0 top-full mt-2 z-50 w-52 rounded-xl bg-white py-2 shadow-[0px_4px_16px_rgba(0,0,0,0.15)]"
                                        >
                                            {filterOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setFilterType(option.value);
                                                        setShowFilterDropdown(false);
                                                        setExpandedGroup(null);
                                                    }}
                                                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 ${filterType === option.value ? 'bg-gray-50' : ''
                                                        }`}
                                                >
                                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${option.value === 'all' ? 'bg-gray-200' :
                                                        option.value === 'general' ? 'bg-[#F6DB5254]' :
                                                            option.value === 'deal_card' ? 'bg-[#F6DB5254]' :
                                                                option.value === 'connection' ? 'bg-[#52F66E54]' :
                                                                    option.value === 'smart_match' ? 'bg-[#5264F654]' :
                                                                        'bg-[#FFA0C454]'
                                                        }`}>
                                                        {option.icon}
                                                    </div>
                                                    <span className={`font-montserrat text-sm ${filterType === option.value ? 'font-semibold text-[#0B1727]' : 'font-medium text-[#0B1727CC]'
                                                        }`}>
                                                        {option.label}
                                                    </span>
                                                    {filterType === option.value && (
                                                        <svg className="ml-auto h-4 w-4 text-[#0B1727]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Mark all as read button */}
                            {hasUnreadNotifications && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex h-8 items-center gap-1 rounded-full px-3 text-xs font-medium text-[#0B1727] transition-colors hover:bg-gray-100"
                                    title="Mark all as read"
                                >
                                    <IoCheckmarkDone className="h-4 w-4" />
                                    <span className="hidden sm:inline">Mark all read</span>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            >
                                <IoClose className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Unread count badge */}
                    {unreadCount > 0 && (
                        <div className="flex items-center justify-center py-2 text-xs text-gray-500">
                            <span className="rounded-full bg-[#0B1727] px-2 py-0.5 text-white">
                                {unreadCount} unread
                            </span>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="no-scrollbar max-h-[550px] overflow-y-auto px-3 py-4">
                        {/* Loading State */}
                        {loading && notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FaSpinner className="h-8 w-8 animate-spin text-[#0B1727]" />
                                <p className="mt-4 font-montserrat text-sm text-gray-500">Loading notifications...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FaBell className="h-12 w-12 text-gray-300" />
                                <p className="mt-4 font-montserrat text-sm text-red-500">{error}</p>
                                <button
                                    onClick={() => refetch()}
                                    className="mt-2 rounded-lg bg-[#0B1727] px-4 py-2 text-sm text-white hover:bg-[#1a2d40]"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Notification Content */}
                        {!loading && !error && (
                            <AnimatePresence mode="wait">
                                {expandedGroup ? (
                                    // Expanded group view - show all notifications in the group
                                    <motion.div
                                        key="expanded"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-3"
                                    >
                                        {groupedNotifications
                                            .find(g => g.type === expandedGroup)
                                            ?.notifications.map(notification => renderNotificationItem(notification, false))}
                                    </motion.div>
                                ) : filterType !== 'all' ? (
                                    // Filtered view - show only notifications of selected type
                                    <motion.div
                                        key={`filtered-${filterType}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-3"
                                    >
                                        {filteredNotifications.length > 0 ? (
                                            filteredNotifications.map(notification => renderNotificationItem(notification))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <FaBell className="h-12 w-12 text-gray-300" />
                                                <p className="mt-4 font-montserrat text-sm text-gray-500">
                                                    No {getCurrentFilterLabel().toLowerCase()} notifications
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    // Main view - show first general, then groups, then remaining general
                                    <motion.div
                                        key="main"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-3"
                                    >
                                        {/* First general notification */}
                                        {generalNotifications[0] && renderNotificationItem(generalNotifications[0])}

                                        {/* Grouped notifications */}
                                        {groupedNotifications.map((group, index) =>
                                            group.notifications.length > 0 && renderGroupCard(group, index)
                                        )}

                                        {/* Remaining general notifications */}
                                        {generalNotifications.slice(1).map(notification => renderNotificationItem(notification))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* Empty State */}
                        {!loading && !error && notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FaBell className="h-12 w-12 text-gray-300" />
                                <p className="mt-4 font-montserrat text-sm text-gray-500">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Smart Match Popup */}
            <SmartMatchPopup
                isOpen={smartMatchPopupOpen}
                onClose={() => {
                    setSmartMatchPopupOpen(false);
                    setSelectedSmartMatchData(null);
                }}
                onAccept={handleSmartMatchAccept}
                onDecline={handleSmartMatchDecline}
                data={selectedSmartMatchData}
                isLoading={smartMatchLoading}
            />
        </AnimatePresence>
    );
};

export default NotificationCard;
