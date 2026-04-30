'use client';

export const dynamic = 'force-dynamic';

import UserMessageCard from '@/components/cards/messages/user-message-card';
import RecentChatCard from '@/components/cards/messages/user-recent-message-card';
import images from '@/constants/image';
import AppLayout from '@/layouts/app-layout';
import { ChatNotifications } from '@/utils/notifications';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

type User = {
    id: number;
    name: string;
    profile_picture?: string;
    position?: string;
    company_name?: string;
    industry?: string;
    country?: string;
};

type Conversation = {
    id: number;
    encrypted_id: string;
    title?: string | null;
    participants: User[];
    other_participant?: User;
    unread_count?: number;
    last_message?: {
        body: string;
        created_at: string;
        is_read?: boolean;
    } | null;
};

type MessageStats = {
    activeConversations: number;
    readMessages: number;
    unreadMessages: number;
};

interface MessagePageProps {
    connections: User[];
    conversations: Conversation[];
    stats: MessageStats;
    auth: {
        user: User;
    };
}

// Helper to format time ago
function formatTimeAgo(dateString: string, currentTime?: Date): string {
    // Parse the ISO timestamp directly
    const date = new Date(dateString);
    const now = currentTime || new Date();

    // Ensure we're working with valid dates
    if (isNaN(date.getTime())) return 'N/A';

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle negative values (future dates) - this can happen with slight time differences
    if (seconds < 0) return 'Just now';

    // Less than 1 minute
    if (seconds < 60) return 'Just now';

    // Less than 1 hour - show in minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;

    // 1 hour or more - show as "Few hours ago"
    return 'Few hours ago';
}

// Helper to get current date info
function getCurrentDateInfo() {
    const now = new Date();
    const day = now.getDate();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    return { day, dayName, monthName };
}

// Helper to get time-based greeting
function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
}

// Helper to get first name from full name
function getFirstName(fullName: string): string {
    return fullName?.split(' ')[0] || 'User';
}

function Message({ connections = [], conversations = [], stats = { activeConversations: 0, readMessages: 0, unreadMessages: 0 } }: Partial<MessagePageProps>) {
    const { user: authUser } = useAuth();
    const auth = { user: authUser };
    const [searchConnectionQuery, setSearchConnectionQuery] = useState('');
    const [searchChatQuery, setSearchChatQuery] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set()); // Track online user IDs
    const [conversationsList, setConversationsList] = useState<Conversation[]>(conversations);
    const [messageStats, setMessageStats] = useState<MessageStats>(stats);
    const [currentTime, setCurrentTime] = useState(new Date()); // Add state for current time
    const dateInfo = getCurrentDateInfo();

    // Automatically request notification permission on first visit
    useEffect(() => {
        const requestNotificationPermissionOnFirstVisit = async () => {
            // Initialize notifications first
            await ChatNotifications.initialize();

            // Check if we need to request permission
            if (ChatNotifications.needsPermission()) {
                try {
                    const granted = await ChatNotifications.requestPermission();
                    if (granted) {
                        toast.success("Notification permission granted! You'll be notified of new messages.");
                    }
                } catch (error) {
                    console.error('Error requesting notification permission:', error);
                }
            }
        };

        requestNotificationPermissionOnFirstVisit();
    }, []); // Run only once on component mount

    // Real-time clock update for dynamic timestamps
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000); // Update every 30 seconds

        return () => clearInterval(timer);
    }, []);

    // Update conversations list when prop changes and sort by most recent
    useEffect(() => {
        // Sort conversations by last message time (most recent first)
        const sortedConversations = [...conversations].sort((a, b) => {
            const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return bTime - aTime;
        });
        setConversationsList(sortedConversations);
    }, [conversations]); // Remove currentTime dependency - it's not needed for sorting

    // Track online users and real-time message updates
    useEffect(() => {
        // Join all conversation channels to track presence and messages
        if (!(window as any).Echo || conversationsList.length === 0) return;

        const channels: any[] = [];

        conversationsList.forEach((conv) => {
            if (conv.id) {
                const chan = (window as any).Echo.join(`conversation.${conv.id}`)
                    .here((users: User[]) => {
                        setOnlineUsers((prev) => {
                            const newSet = new Set(prev);
                            users.forEach((u) => newSet.add(u.id));
                            return newSet;
                        });
                    })
                    .joining((user: User) => {
                        setOnlineUsers((prev) => new Set([...prev, user.id]));
                    })
                    .leaving((user: User) => {
                        setOnlineUsers((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(user.id);
                            return newSet;
                        });
                    })
                    .listen('MessageSent', (event: { message: any }) => {
                        const message = event.message;
                        if (!message || !message.user) return;

                        // Update conversation list with new message
                        setConversationsList((prevConversations) => {
                            const updatedConversations = prevConversations.map((conversation) => {
                                if (conversation.id === message.conversation_id) {
                                    // Check if the message is from another user (not current user)
                                    const isFromOtherUser = message.user.id !== auth.user?.id;

                                    return {
                                        ...conversation,
                                        last_message: {
                                            body: message.body,
                                            created_at: message.created_at,
                                            is_read: !isFromOtherUser, // Mark as read if it's from current user
                                        },
                                        unread_count: isFromOtherUser ? (conversation.unread_count || 0) + 1 : conversation.unread_count,
                                    };
                                }
                                return conversation;
                            });

                            // Sort conversations by last message time
                            return updatedConversations.sort((a, b) => {
                                const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
                                const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
                                return bTime - aTime;
                            });
                        });

                        // Update stats if message is from another user
                        if (message.user.id !== auth.user?.id) {
                            setMessageStats((prevStats) => ({
                                ...prevStats,
                                unreadMessages: prevStats.unreadMessages + 1,
                            }));

                            // Show notification for messages from others
                            ChatNotifications.showMessageNotification(message.user.name, message.body, message.user.profile_picture);
                        }
                    })
                    .listen('MessageRead', (event: { message_id: number; user: User; conversation_id: number }) => {
                        // Update unread count when message is read by current user
                        if (event.user.id === auth.user?.id) {
                            setConversationsList((prevConversations) =>
                                prevConversations.map((conversation) => {
                                    if (conversation.id === event.conversation_id) {
                                        return {
                                            ...conversation,
                                            unread_count: Math.max(0, (conversation.unread_count || 0) - 1),
                                        };
                                    }
                                    return conversation;
                                }),
                            );

                            setMessageStats((prevStats) => ({
                                ...prevStats,
                                unreadMessages: Math.max(0, prevStats.unreadMessages - 1),
                                readMessages: prevStats.readMessages + 1,
                            }));
                        }
                    });
                channels.push({ id: conv.id, channel: chan });
            }
        });

        return () => {
            channels.forEach(({ id }) => {
                try {
                    (window as any).Echo?.leave(`conversation.${id}`);
                } catch (err) {
                    console.warn('Error leaving channel:', err);
                }
            });
        };
    }, [conversationsList, auth.user?.id]);

    // Filter connections based on search
    const filteredConnections = connections.filter(
        (user) =>
            user.name.toLowerCase().includes(searchConnectionQuery.toLowerCase()) ||
            user.position?.toLowerCase().includes(searchConnectionQuery.toLowerCase()) ||
            user.company_name?.toLowerCase().includes(searchConnectionQuery.toLowerCase()),
    );

    // Filter conversations based on search
    const filteredConversations = conversationsList.filter((conv) => {
        const otherUser = conv.other_participant;
        return (
            otherUser?.name.toLowerCase().includes(searchChatQuery.toLowerCase()) ||
            conv.last_message?.body.toLowerCase().includes(searchChatQuery.toLowerCase())
        );
    });

    // Handle starting a conversation with a connection
    const handleStartConversation = (userId: number) => {
        axios.post('/messages/start', { user_id: userId, redirect_to: 'message/single' })
            .then((res) => { window.location.href = res.data.redirect ?? '/message/single'; })
            .catch((err) => console.error('Failed to start conversation:', err));
    };

    // Mark conversation as read when opened
    const handleOpenConversation = useCallback(async (encryptedId: string, conversationId: number) => {
        // Mark conversation as read in local state immediately
        setConversationsList((prevConversations) =>
            prevConversations.map((conversation) => {
                if (conversation.id === conversationId) {
                    const wasUnread = (conversation.unread_count || 0) > 0;
                    if (wasUnread) {
                        // Update stats
                        setMessageStats((prevStats) => ({
                            ...prevStats,
                            unreadMessages: Math.max(0, prevStats.unreadMessages - (conversation.unread_count || 0)),
                            readMessages: prevStats.readMessages + (conversation.unread_count || 0),
                        }));
                    }
                    return {
                        ...conversation,
                        unread_count: 0,
                    };
                }
                return conversation;
            }),
        );

        // Navigate to conversation
        window.location.href = `/message/single?conversation=${encryptedId}`;
    }, []);

    // ONLOAD BG BLUE BACKGROUND

    const [bgLoaded, setBgLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = images.uibg;
        img.onload = () => setBgLoaded(true);
    }, []);

    return (
        <AppLayout>
            
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#031c5b',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#ef4444',
                        },
                    },
                }}
            />
            <div className="relative border-0 bg-transparent pt-0 pb-2.5">
                {/* Zindex Background */}
                <div className={`absolute z-[2] hidden h-full w-full lg:block ${bgLoaded ? 'bg-[#031C5B] dark:lg:bg-gray-900' : 'bg-white'} `}></div>
                <div
                    className="relative z-[3] flex flex-1 bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{
                        backgroundImage: `url(${images.uibg})`,
                    }}
                >
                    <div className="relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full flex-col gap-3 overflow-y-auto pb-1 lg:px-2 lg:py-0 lg:pr-9 lg:pl-7 xl:pr-17 xl:pl-12">
                        {/* -------------------------------------------MOBILE STRUCTURE-------------------------------------------------------- */}
                        <div className="h-screen lg:pt-5 page-transition">
                            {/* FIRST ROW MOBILE MESSAGE STATS */}
                            <div className="min-h-screen overflow-y-auto pb-0 lg:hidden animate-fadeIn">
                                {/* PROFILE HEADING */}
                                <div className="rounded-br-[40px] bg-darkBlue py-2 shadow-[1px_3px_6px_-1px_rgba(0,0,0,0.2),-2px_3px_6px_-1px_rgba(0,0,0,0.2)]">
                                    {/* HEADING */}

                                    <div className="flex w-full justify-between px-6 pl-7">
                                        <div className="mt-3.5 w-[60%] text-secondaryWhite">
                                            <div className="leading-4">
                                                <h2 className="text-[18px] font-bold">Hello, {getFirstName(auth.user?.name || '')}!</h2>
                                                <h4 className="text-xs font-light">{getGreeting()}</h4>
                                            </div>
                                        </div>

                                        <div className="relative w-[40%] lg:hidden">
                                            <img
                                                src={images.profilepattern}
                                                alt={`lead card bg`}
                                                className="reduce-h absolute inset-0 top-0 z-[1] h-[70px] w-full object-cover"
                                            />

                                            <div className="relative z-[2] mt-3 flex items-center justify-center gap-3">
                                                <div role="button" className="relative h-4.5 w-4.5 overflow-hidden rounded-full">
                                                    <img
                                                        src={images.notificationsnooze}
                                                        alt={` profile`}
                                                        className="absolute h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        backgroundImage: `url(${auth.user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || '')}&background=6366f1&color=ffffff&size=200`})`,
                                                    }}
                                                    className="h-[46px] w-[46px] max-w-full overflow-hidden rounded-full bg-cover bg-top bg-no-repeat"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Stats */}
                                    <div className="mt-6 max-h-[120px] w-[75%] sm:max-h-[90px]">

                                        <div className="relative w-full bg-no-repeat pb-4 lg:hidden">
                                            <img
                                                src={images.unionmssagebg}
                                                alt={`lead card bg`}
                                                className="absolute inset-0 top-0 h-auto w-full object-cover"
                                            />

                                            <div className="relative z-[2] overflow-hidden rounded-tr-3xl pl-7">
                                                <div className="flex justify-between">
                                                    <div className="flex items-center pt-5">
                                                        <div className="relative h-fit w-fit">
                                                            <p className="relative z-10 bg-gradient-to-b from-[#121E2E] via-[#1B2C44] to-[#1B2F4B] bg-clip-text text-[40px] leading-none font-extrabold text-transparent">
                                                                {dateInfo.day}

                                                            </p>
                                                        </div>

                                                        <div className="ml-1">
                                                            <p className="-mb-3 bg-gradient-to-b from-[#121E2E] via-[#1B2C44] to-[#1B2F4B] bg-clip-text text-[11px] font-light">
                                                                {dateInfo.dayName}

                                                            </p>
                                                            <p className="mt-2 bg-gradient-to-b from-[#121E2E] via-[#1B2C44] to-[#1B2F4B] bg-clip-text text-[17px] font-bold">
                                                                {dateInfo.monthName}

                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 text-[#242E2A]">
                                                    <h2 className="tracking-wid text-[20px] font-semibold">Message Stats</h2>
                                                    <p className="max-w-[190px] pr-4 text-[8.8px] leading-3">
                                                        Start building trusted partnerships across Africa with encrypted executive messaging.
                                                    </p>
                                                </div>
                                                <img src={images.messagemobilepattern} className="absolute -top-4.5 -right-2 w-[122px]" alt="" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shortcuts */}
                                <div className="mt-[4.7rem] border-black pb-3">
                                    <h2 className="pl-8 text-[16px] font-extrabold text-deepBlue">Shortcuts</h2>
                                    <div className="grid grid-cols-2 gap-4 px-6.5 pt-4">
                                        {/*===========================================  Conversations -============================== */}
                                        <div className="flex flex-col gap-x-5 gap-y-3">
                                            {/*====================== Active Conversations -============ */}

                                            <Link href="/message/single">
                                                <div className="flex w-full flex-col justify-between rounded-2xl bg-[#D8E2FD] pt-4 pr-3 pb-3 pl-5 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.2)]">
                                                    {' '}
                                                    <div className="text-deepBlack">
                                                        <h4 className="mb-2 max-w-[100px] text-[11px] leading-3.5 font-semibold tracking-wide">
                                                            Active Conversations
                                                        </h4>
                                                        <h3 className="mt-3 text-[27px] leading-3 font-bold">{messageStats.activeConversations}</h3>
                                                    </div>
                                                    {/* Bottom */}
                                                    <div className="mt-1 flex flex-col justify-between">
                                                        <div className="flex items-center self-end">
                                                            <p className="text-[16px] font-medium text-deepBlack">15% </p>
                                                            <div>
                                                                <img className="h-5 w-5" src={images.arrowUp} alt={'Active'} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="flex w-full flex-col justify-between rounded-2xl bg-[#DAEAEA] py-6 pr-3 pl-5 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.2)]">
                                                {' '}
                                                <div className="pr-10 pb-3 text-deepBlack">
                                                    <h4 className="mb-2 max-w-[100px] text-[11px] leading-3.5 font-semibold tracking-wide">
                                                        Unread Messages
                                                    </h4>
                                                    <h3 className="mt-3 text-[27px] leading-3 font-bold">{messageStats.unreadMessages}</h3>
                                                </div>
                                                <img src={images.messageunlock} className="h-full w-[85px] self-end" alt="" />
                                                <div className="flex flex-col justify-between pt-4 pr-5">
                                                    <p className="self-start text-[9.7px] tracking-tight text-[#454545]">Increase this week</p>

                                                    <div className="flex items-center self-start">
                                                        <p className="text-xl font-semibold text-deepBlack">
                                                            {messageStats.readMessages + messageStats.unreadMessages > 0
                                                                ? Math.round(
                                                                    (messageStats.readMessages /
                                                                        (messageStats.readMessages + messageStats.unreadMessages)) *
                                                                    100,
                                                                )
                                                                : 0}
                                                            %
                                                        </p>
                                                        <div>
                                                            <img className="h-6 w-6" src={images.arrowUp} alt={'Read'} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/*===========================================  Messages -============================== */}

                                        <div className="flex flex-col gap-x-5 gap-y-4">
                                            {/*====================== Read Messages -============ */}

                                            <div className="flex w-full flex-col justify-between rounded-2xl bg-[#FAE0E1] py-6 pr-3 pl-6 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.2)]">
                                                {' '}
                                                <div className="pr-10 pb-1.5 text-deepBlack">
                                                    <h4 className="mb-2 max-w-[100px] text-[11px] leading-3.5 font-semibold tracking-wide">
                                                        Read Messages
                                                    </h4>
                                                    <h3 className="mt-3 text-[27px] leading-3 font-bold">{messageStats.readMessages} </h3>
                                                </div>
                                                <img src={images.messageunlock} className="h-full w-[85px] self-end" alt="" />
                                                <div className="flex flex-col justify-between pt-4 pr-0">
                                                    <p className="self-start text-[9.7px] text-[#454545]">Increase this week</p>

                                                    <div className="flex items-center self-start">
                                                        <p className="text-xl font-semibold text-deepBlack">
                                                            {messageStats.readMessages + messageStats.unreadMessages > 0
                                                                ? Math.round(
                                                                    (messageStats.readMessages /
                                                                        (messageStats.readMessages + messageStats.unreadMessages)) *
                                                                    100,
                                                                )
                                                                : 0}
                                                            %
                                                        </p>
                                                        <div>
                                                            <img className="h-6 w-6" src={images.arrowUp} alt={'Read'} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link href="/message/single">
                                                <div className="flex w-full flex-col justify-between rounded-2xl bg-deepBlack pt-4 pr-3 pb-3 pl-5 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_3px_2px_-1px_rgba(0,0,0,0.2)]">
                                                    {' '}
                                                    <div className="">
                                                        <h4 className="mb-2 max-w-[100px] text-[11px] leading-3.5 font-semibold tracking-wide text-secondaryWhite">
                                                            Start a new Conversations
                                                        </h4>

                                                        {/* message read */}
                                                        <img src={images.messageread} className="h-full w-[36px] self-end" alt="" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MESSAGE STATS */}
                            <div className="relative hidden w-full rounded-3xl pt-5 pr-10 pl-6 shadow-[-2px_-6px_10px_-3px_rgba(0,0,0,0.1),-5px_10px_10px_-3px_rgba(0,0,0,0.1)] lg:block">
                                <div className="w-[72%]">
                                    <div className="flex w-full justify-between">
                                        <div className="pl-5 text-[#242E2A]">
                                            <h2 className="text-[32px] font-semibold">Message Stats</h2>
                                            <p className="max-w-xs text-[11px]">
                                                Start building trusted partnerships across Africa with encrypted executive messaging.
                                            </p>
                                        </div>

                                        <div className="flex items-center">
                                            <div className="relative h-fit w-fit">
                                                <p className="relative z-10 bg-gradient-to-b from-[#121E2E] via-[#1B2C44] to-[#1B2F4B] bg-clip-text text-[50px] leading-none font-extrabold text-transparent">
                                                    {dateInfo.day}
                                                </p>
                                            </div>

                                            <div className="ml-1">
                                                <p className="bg-gradient-to-b from-[#121E2E] via-[#1B2C44] to-[#1B2F4B] bg-clip-text text-[14px]">
                                                    {dateInfo.dayName}
                                                </p>
                                                <p className="bg-gradient-to-b from-[#121E2E] via-[#1B2C44] to-[#1B2F4B] bg-clip-text text-sm font-bold">
                                                    {dateInfo.monthName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex max-h-[90px] w-full gap-5">
                                        {/* Top */}

                                        <div className="flex h-[127px] w-full flex-col justify-between rounded-lg bg-[#D8E2FD] pt-6 pr-10 pb-3 pl-6 shadow-[-2px_-2px_5px_-3px_rgba(0,0,0,0.5),-2px_2px_5px_-3px_rgba(0,0,0,0.5)]">
                                            {' '}
                                            <div className="text-deepBlack">
                                                <h4 className="mb-2 text-[13px] font-bold">Active Conversations</h4>
                                                <h3 className="text-[32px] leading-3 font-bold">{messageStats.activeConversations}</h3>
                                            </div>
                                            {/* Bottom */}
                                            <div className="flex justify-between">
                                                <p className="self-end text-[10.7px] text-[#454545]">Total conversations</p>

                                                <div className="flex items-center self-start">
                                                    <p className="text-xl font-semibold text-deepBlack">{conversationsList.length} </p>
                                                    <div>
                                                        <img className="h-6 w-6" src={images.arrowUp} alt={'Active'} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex h-[127px] w-full flex-col justify-between rounded-lg bg-[#FAE0E1] pt-6 pr-10 pb-3 pl-6 shadow-[-2px_-2px_5px_-3px_rgba(0,0,0,0.5),-2px_2px_5px_-3px_rgba(0,0,0,0.5)]">
                                            {' '}
                                            <div className="text-deepBlack">
                                                <h4 className="mb-2 text-[13px] font-bold">Read Messages</h4>
                                                <h3 className="text-[32px] leading-3 font-bold">{messageStats.readMessages}</h3>
                                            </div>
                                            {/* Bottom */}
                                            <div className="flex justify-between">
                                                <p className="self-end text-[10.7px] text-[#454545]">Messages read</p>

                                                <div className="flex items-center self-start">
                                                    <p className="text-xl font-semibold text-deepBlack">
                                                        {messageStats.readMessages + messageStats.unreadMessages > 0
                                                            ? Math.round(
                                                                (messageStats.readMessages /
                                                                    (messageStats.readMessages + messageStats.unreadMessages)) *
                                                                100,
                                                            )
                                                            : 0}
                                                        %
                                                    </p>
                                                    <div>
                                                        <img className="h-6 w-6" src={images.arrowUp} alt={'Read'} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex h-[127px] w-full flex-col justify-between rounded-lg bg-[#DAEAEA] pt-6 pr-10 pb-3 pl-6 shadow-[-2px_-2px_5px_-3px_rgba(0,0,0,0.5),-2px_2px_5px_-3px_rgba(0,0,0,0.5)]">
                                            {' '}
                                            <div className="text-deepBlack">
                                                <h4 className="mb-2 text-[13px] font-bold">Unread Messages</h4>
                                                <h3 className="text-[32px] leading-3 font-bold">{messageStats.unreadMessages}</h3>
                                            </div>
                                            {/* Bottom */}
                                            <div className="flex justify-between">
                                                <p className="self-end text-[10.7px] text-[#454545]">Pending messages</p>

                                                <div className="flex items-center self-start">
                                                    <p className="text-xl font-semibold text-deepBlack">
                                                        {messageStats.unreadMessages > 0 ? messageStats.unreadMessages : '0'}
                                                    </p>
                                                    <div>
                                                        <img className="h-6 w-6" src={images.arrowUp} alt={'Unread'} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <img className="absolute top-5 right-5 h-[180px] w-[20%] max-w-[400px]" src={images.groupmessage} alt="" />
                            </div>

                            {/* ALL NETWORKS */}
                            <div className="grid grid-cols-1 gap-x-0 pb-10 lg:mt-12 lg:ml-4 lg:grid-cols-[63%_35%]">
                                <div className="relative aspect-auto h-[45vh] overflow-hidden rounded-3xl bg-deepBlack bg-cover bg-center bg-no-repeat p-4 pb-30 md:h-[75vh] lg:bg-transparent lg:pr-15 lg:pb-20 lg:pl-16">
                                    <img
                                        src={images.messageCardBg}
                                        alt={`lead card bg`}
                                        className="absolute inset-0 hidden h-full w-full overflow-hidden rounded-3xl object-center lg:block"
                                    />


                                    <div className="relative no-scrollbar flex-1 overflow-y-auto px-2 pb-10">
                                        {/* ==================================== Search Header
                                        MOBILE AND DESKTOP
                                         ====================================================*/}
                                        <div className="sticky top-0 z-10 flex items-center justify-between overflow-hidden border-b-0 bg-deepBlack pt-1 lg:pt-4 pb-3 lg:border-b-1 lg:bg-white lg:px-0">
                                            <div className="mr-3 flex w-[25%] flex-col lg:w-[30%]">
                                                {/* Mobile */}
                                                <>
                                                    <h2 className="text-[7px] mt-1.5 leading-1 tracking-wider text-white italic lg:hidden lg:text-deepBlack">
                                                        {' '}
                                                        Select Network to{' '}
                                                    </h2>
                                                    <h3 className="text-[13px] lg:text-base tracking-wider font-bold text-white italic lg:hidden lg:text-deepBlack"> Message</h3>
                                                </>

                                                {/* Desktop */}
                                                <>
                                                    <h2 className="hidden text-[8px] text-white lg:block lg:text-[10px] lg:text-deepBlack">
                                                        {' '}
                                                        Select Network to message
                                                    </h2>
                                                    <h3 className="hidden text-xs font-bold text-white lg:block lg:text-base lg:text-deepBlack">
                                                        {' '}
                                                        All Networks ({connections.length})
                                                    </h3>
                                                </>
                                            </div>

                                            <div className="flex w-[62%] lg:w-[50%] transform -translate-x-1 md:-translate-x-0">
                                                <div className="relative w-full cursor-pointer">
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        value={searchConnectionQuery}
                                                        onChange={(e) => setSearchConnectionQuery(e.target.value)}
                                                        className="w-full rounded-full border-0 bg-gray-700 px-4 py-1 lg:py-2 pl-5 text-deepBlack placeholder:text-xs placeholder:font-light placeholder:text-white placeholder:italic focus:ring-0 focus:ring-primary/30 focus:outline-none lg:bg-[#27E6A729] lg:px-4 lg:py-2 lg:pl-5 lg:placeholder:text-base lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                                                    />
                                                    <img
                                                        src={images.desktopSearch}
                                                        className="absolute top-1/2 right-2 hidden h-6 w-6 -translate-y-1/2 lg:right-5 lg:block"
                                                        alt=""
                                                    />
                                                    <img
                                                        src={images.aiSearch}
                                                        className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 lg:right-10 lg:hidden"
                                                        alt=""
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex w-[14%]  items-end justify-end lg:w-[20%] mr-2 md-mr-0 transform -translate-x-1.5 md:-translate-x-0">
                                                <button className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#ECF8FF] lg:flex">
                                                    <ChevronRight className="h-5 w-5 text-[#193E47]" />
                                                </button>
                                                <Link href="/message/single">
                                                    <button className="flex w-5.5 h-5.5 md:h-10 md:w-10 items-center justify-center rounded-full lg:hidden">
                                                        <div className="relative h-6 w-6">
                                                            <img src={images.messageread} className="absolute object-contain" alt="" />
                                                        </div>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>


                                        {/* Desktop Cards Container */}
                                        <div className="h-[30vh] sm:h-[50vh] lg:h-[55vh]  no-scrollbar divide-y divide-white/20  overflow-y-auto pb-8 lg:pb-0">
                                            {filteredConnections.length > 0 ? (
                                                filteredConnections.map((user) => (
                                                    <div key={user.id} onClick={() => handleStartConversation(user.id)} className="cursor-pointer">
                                                        <UserMessageCard
                                                            name={user.name}
                                                            title={user.position || 'Member'}
                                                            imageSrc={
                                                                user.profile_picture ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`
                                                            }
                                                            industry={user.industry || 'N/A'}
                                                            location={user.country || 'N/A'}
                                                            rating={0}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center text-gray-500">
                                                    <p className="text-xs max-w-[250px] mx-auto">
                                                        {searchConnectionQuery
                                                            ? 'No connections found matching your search.'
                                                            : 'No connections yet. Connect with other users to start messaging.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative hidden aspect-auto overflow-hidden bg-deepBlack bg-cover bg-center bg-no-repeat lg:block lg:bg-transparent">
                                    <div className="relative bg-transparent px-4 pt-2 pb-4">
                                        <div className="sticky top-0 z-10 mx-4 mb-2 flex items-center justify-between overflow-hidden rounded-t-3xl px-5 py-0 pt-4 pb-2 shadow-[-2px_-2px_2px_-3px_rgba(0,0,0,0.1),-5px_5px_2px_-3px_rgba(0,0,0,0.1)] lg:bg-white">
                                            <h3 className="text-base font-normal text-deepBlack">
                                                {' '}
                                                Your Most Recent <span className="font-bold">Chats</span>{' '}
                                            </h3>

                                            <div className="flex w-[20%] items-end justify-end">
                                                <Link className="block cursor-pointer" href={'/message/single'}>
                                                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-deepBlack">
                                                        <div className="relative h-6 w-6">
                                                            <img src={images.bubbleChatadd} className="absolute object-contain" alt="" />
                                                        </div>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Search Header */}
                                        <div className="sticky top-20 z-10 mx-4 flex items-center justify-between overflow-hidden bg-white px-4 py-4">
                                            <div className="flex w-[75%]">
                                                <div className="relative w-full cursor-pointer">
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        value={searchChatQuery}
                                                        onChange={(e) => setSearchChatQuery(e.target.value)}
                                                        className="w-full rounded-full border-0 bg-gray-700 px-4 py-2 text-deepBlack placeholder:text-white focus:ring-0 focus:ring-primary/30 focus:outline-none lg:bg-[#F6FCFF] lg:px-4 lg:py-2 lg:pl-5 lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                                                    />
                                                    <img
                                                        src={images.desktopSearch}
                                                        className="absolute top-1/2 right-2 hidden h-6 w-6 -translate-y-1/2 lg:right-5 lg:block"
                                                        alt=""
                                                    />
                                                    <img
                                                        src={images.aiSearch}
                                                        className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 lg:right-10 lg:hidden"
                                                        alt=""
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex w-[25%] items-end justify-end">
                                                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECF8FF]">
                                                    <div className="relative h-6 w-6">
                                                        <img src={images.notificationMessage} className="absolute object-contain" alt="" />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Cards Container */}
                                        <div className="no-scrollbar space-y-2 divide-y divide-white/50 overflow-y-auto p-4">
                                            {/* Mapping over the data to render the list items */}
                                            {filteredConversations.length > 0 ? (
                                                filteredConversations.map((conversation) => {
                                                    const otherUser = conversation.other_participant;
                                                    if (!otherUser) return null;

                                                    const isUserOnline = onlineUsers.has(otherUser.id);
                                                    const statusDotColor = isUserOnline ? 'bg-[#2ABFBB]' : 'bg-gray-400';

                                                    return (
                                                        <div
                                                            key={conversation.id}
                                                            onClick={() => handleOpenConversation(conversation.encrypted_id, conversation.id)}
                                                            className="cursor-pointer"
                                                        >
                                                            <RecentChatCard
                                                                name={otherUser.name}
                                                                lastMessage={conversation.last_message?.body || 'No messages yet'}
                                                                timeAgo={
                                                                    conversation.last_message?.created_at
                                                                        ? formatTimeAgo(conversation.last_message.created_at, currentTime)
                                                                        : 'N/A'
                                                                }
                                                                avatarUrl={
                                                                    otherUser.profile_picture ||
                                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=6366f1&color=ffffff&size=200`
                                                                }
                                                                isOnline={isUserOnline}
                                                                statusDotColor={statusDotColor}
                                                                unreadCount={conversation.unread_count || 0}
                                                                hasNewMessage={(conversation.unread_count || 0) > 0}
                                                            />
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="py-3 text-center text-gray-500">
                                                    <p className="text-sm">
                                                        {searchChatQuery
                                                            ? 'No conversations found matching your search.'
                                                            : 'No recent chats. Start a conversation from your connections.'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Add New Chat */}

                                            <div className="rounded-b-2xl bg-white pt-15 pb-8 shadow-[-2px_-2px_5px_-3px_rgba(0,0,0,0.5),-2px_2px_5px_-3px_rgba(0,0,0,0.5)]">
                                                <div className="mx-auto max-w-[240px]">
                                                    <Link href="/message/single">
                                                        <button className="w-full rounded-full bg-gradient-to-r from-[#A47AF0] to-[#CCA6FF] px-6 py-2.5 text-sm font-light text-white transition-opacity duration-300 hover:opacity-90">
                                                            Add a new chat
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Message;
