'use client';

export const dynamic = 'force-dynamic';

import DirectChatCard from '@/components/cards/messages/user-direct-message-card';
import MessageProfileOverlay from '@/components/modals/message/MessageProfileOverlay';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import axios from 'axios';

import { TooltipProvider } from '@/components/ui/tooltip';
import { formatNameCharacters, formatText } from '@/utils/format-character';
import { FormattedMessage } from '@/utils/messageFormatter';

import { AnimatePresence, motion, Variants } from 'framer-motion';
import { createPortal } from 'react-dom';
import { IoIosArrowDown } from 'react-icons/io';

import { TbLineDashed } from 'react-icons/tb';

import images from '@/constants/image';

import { SkeletonChatItem, SkeletonMessage, SkeletonSearchBar, SkeletonText } from '@/components/ui/skeleton-loaders';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { ChatNotifications } from '@/utils/notifications';
import { useAuth } from '@/context/AuthContext';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChatUser, INITIAL_USERS } from '@/components/cards/messages/chat-user-card';
import MessageActionsDropdown from '@/components/cards/messages/chat/MessageActionsDropdown';
import MobileProfileSidebar from '@/components/cards/messages/chat/mobile-chat-profile';
import ChatUserSlider from '@/components/cards/messages/user-chat-slider';
import DropdownToggle from '@/components/DropdownToggle';
import { FormatToolbar } from '@/components/messages/FormatToolbar';
import { useClickOutsideToggle } from '@/hooks/use-click-outside-toggle';

import toast, { Toaster } from 'react-hot-toast';
import MobileDirectChatCard from '@/components/cards/messages/mobile-chat-card';

type HeaderMode = 'default' | 'selection';

// TypeScript types
type User = {
    id: number;
    name: string;
    profile_picture?: string;
    title?: string;
    experience?: string;
    industry?: string;
    interest?: string;
    reviews?: string;
    base_location?: string;
    operates_in?: string;
    bio?: string;
    company_stage?: string;
    key_strength?: string;
    top_goal?: string;
    created_at?: string;
    response_rate?: string;
    successful_deals_rate?: string;
};

type Message = {
    id: number;
    body: string;
    user: User;
    created_at: string;
    isOptimistic?: boolean;
    edited_at?: string | null;
    is_deleted?: boolean;
    file_path?: string | null;
    file_type?: 'image' | 'document' | 'voice' | 'video' | null;
    file_name?: string | null;
    file_size?: number | null;
    file_url?: string | null;
    read_status?: Array<{
        user_id: number;
        user_name: string;
        read_at: string;
    }>;
    is_starred?: boolean;
    is_pinned?: boolean;
    reply_to?: {
        id: number;
        body: string;
        user: User;
    } | null;
};

type ConversationListItem = {
    id?: any;
    encrypted_id: string;
    title?: string | null;
    participants: User[];
    unread_count?: number;
    last_message?: {
        body: string;
        created_at: string;
        is_read?: boolean;
    } | null;
};

type Props = {
    conversation?: {
        id: number;
        encrypted_id: string;
        title?: string | null;
        participants: User[];
    };
    conversations?: ConversationListItem[];
    messages?: Message[];
    activeConversationRawIds?: number[];
    auth: {
        user: User;
    };
};

// Helper to get the other participant (for 1:1 chat)
function getOtherParticipant(participants: User[], currentUserId: number): User | null {
    if (!participants || participants.length < 2) return null;
    return participants.find((u) => u.id !== currentUserId) || null;
}

// Helper to format time
function formatTime(dateString: string): string {
    // Parse ISO timestamp directly
    const date = new Date(dateString);

    // Ensure we're working with a valid date
    if (isNaN(date.getTime())) return 'Invalid time';

    // Convert to local timezone and format
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

// Helper to format relative time with optional current time reference
function formatTimeAgo(dateString: string, currentTime?: Date): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid time';

    const now = currentTime || new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInHours < 24) return 'Few hours ago';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
}

// Helper to get document icon based on file type
function getDocumentIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return '📕';
        case 'doc':
        case 'docx':
            return '📄';
        case 'xls':
        case 'xlsx':
            return '📊';
        case 'ppt':
        case 'pptx':
            return '📊';
        case 'txt':
            return '📝';
        case 'zip':
        case 'rar':
            return '🗂️';
        default:
            return '📄';
    }
}

// Helper to format file size
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const icons = {
    archieve: {
        default: images.archievechat,
        active: images.whiteActive, // <-- Add an active version if you have it
    },
    active: {
        default: images.readActivity1,
        active: images.whiteActive, // <-- Add an active version if you have it
    },
    starred: {
        default: images.readActivity2,
        active: images.whiteStar, // <-- Add an active version if you have it
    },
};

const DropdownItem = ({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) => (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-1.5 pl-7 text-[10px] text-darkBlue hover:bg-gray-100/60">
        <img src={icon} className="h-5 w-5" alt="" />
        <span>{label}</span>
    </button>
);

function MessageDropdown({ children }: { children: React.ReactNode }) {
    const { ref, isOpen, toggle } = useClickOutsideToggle(false);

    return (
        <div ref={ref} className="absolute top-0 right-0 z-[10]">
            {/* Arrow (hover only) */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    toggle();
                }}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/30"
            >
                <IoIosArrowDown className="h-3.5 w-3.5 text-white" />
            </button>

            {isOpen && children}
        </div>
    );
}

function MessageContent({
    conversation: initialConversation,
    conversations = [],
    messages: initialMessages = [],
    activeConversationRawIds = [],
    auth,
}: Props) {
    // State for conversation list
    const [conversationsList, setConversationsList] = useState<ConversationListItem[]>(
        [...conversations].sort((a, b) => {
            const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return bTime - aTime;
        }),
    );

    // State for active conversation - robust initialization
    const [selectedConversation, setSelectedConversation] = useState<{
        id: number | null;
        encrypted_id: string;
        participants: User[];
        title?: string | null;
    } | null>(() => {
        // Initialize with proper conversation data if available
        if (initialConversation) {
            return {
                id: initialConversation.id ?? null,
                encrypted_id: initialConversation.encrypted_id,
                participants: initialConversation.participants ?? [],
                title: initialConversation.title ?? null,
            };
        }

        // Fallback: check URL parameters for conversation ID
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const conversationParam = urlParams.get('conversation');
            if (conversationParam) {
                // Find conversation in the initial list
                const urlConversation = conversations.find((chat) => chat.encrypted_id === conversationParam);
                if (urlConversation) {
                    return {
                        id: urlConversation.id ?? null,
                        encrypted_id: conversationParam,
                        participants: urlConversation.participants ?? [],
                        title: urlConversation.title ?? null,
                    };
                }
            }
        }

        return null;
    });

    // Chat state
    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [text, setText] = useState('');
    const [typingUsers, setTypingUsers] = useState<User[]>([]);
    const [participants, setParticipants] = useState<User[]>(initialConversation?.participants || []);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set()); // Track online user IDs
    const [currentTime, setCurrentTime] = useState(new Date()); // Add real-time clock
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesRef = useRef<Message[]>(messages); // Add ref to track current messages
    const channelRef = useRef<any>(null);
    const [currentTab, setCurrentTab] = useState<'all' | 'active' | 'starred' | 'archive'>('all');
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [echoReady, setEchoReady] = useState(false);
    const [echoConnected, setEchoConnected] = useState(false);
    const [connectionRetries, setConnectionRetries] = useState(0);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordingCancelled, setRecordingCancelled] = useState(false);
    const recordingCancelledRef = useRef(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLTextAreaElement>(null);
    const mobileTextInputRef = useRef<HTMLTextAreaElement>(null);

    const [users, setUsers] = useState<ChatUser[]>(INITIAL_USERS);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const allSelected = users.length > 0 && selectedIds.length === users.length;

    // Route-based mobile layout control
    const [hasParams, setHasParams] = useState(false);
    const [isSingleMessageRoute, setIsSingleMessageRoute] = useState(false);

    useEffect(() => {
        setHasParams(window.location.search.length > 0);
        setIsSingleMessageRoute(window.location.pathname === '/message/single');
    }, []);

    // Mobile-only switches
    const showMobileChatView = isSingleMessageRoute && hasParams;

    const showMobileListView = isSingleMessageRoute && !hasParams;

    const toggleUserSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleDeleteSelected = () => {
        setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
        setSelectedIds([]);
        setIsRemoveMode(false);
    };

    // Message action states (star, pin, reply)
    const [starredMessageIds, setStarredMessageIds] = useState<Set<number>>(() => {
        // Load from localStorage on mount
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('starredMessages');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        }
        return new Set();
    });
    const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<number>>(new Set());
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    // Profile and Toogle Dropdowns Layouut
    const [showProfileOverlay, setShowProfileOverlay] = useState(false);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    // Search states
    const [conversationSearchQuery, setConversationSearchQuery] = useState('');
    const [messageSearchQuery, setMessageSearchQuery] = useState('');
    const [showMessageSearch, setShowMessageSearch] = useState(false);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [searchingMessages, setSearchingMessages] = useState(false);
    const [searchingConversations, setSearchingConversations] = useState(false);
    const [backendSearchedConversations, setBackendSearchedConversations] = useState<ConversationListItem[]>([]);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Permission states
    const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
    const [microphonePermission, setMicrophonePermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
    const [showPermissionBanner, setShowPermissionBanner] = useState(false);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    // File preview states
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewFileType, setPreviewFileType] = useState<'image' | 'document' | 'voice' | null>(null);
    const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Document viewer states
    const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string; type: string } | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    // Loading states for skeleton
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isConversationsLoading, setIsConversationsLoading] = useState(true);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);

    const [headerMode, setHeaderMode] = useState<HeaderMode>('default');
    const [selectedChats, setSelectedChats] = useState<number[]>([]);

    // Simulate initial page load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoading(false);
            setIsConversationsLoading(false);
        }, 1200); // Show skeleton for 1.2 seconds on initial load

        return () => clearTimeout(timer);
    }, []);

    // Read receipt polling fallback - add this state
    const [lastReadReceiptCheck, setLastReadReceiptCheck] = useState<number>(Date.now());
    const readReceiptPollingRef = useRef<NodeJS.Timeout | null>(null);

    // Audio player state for voice notes
    const [playingAudio, setPlayingAudio] = useState<number | null>(null);

    // Profile and action states for sidebar functionality
    const [removingFromList, setRemovingFromList] = useState(false);
    const [clearingChat, setClearingChat] = useState(false);
    const [markingUnread, setMarkingUnread] = useState(false);
    const [blockingUser, setBlockingUser] = useState(false);
    const [archivingChat, setArchivingChat] = useState(false);

    // Message selection mode state (for bulk delete like WhatsApp)
    const [isMessageSelectionMode, setIsMessageSelectionMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<Set<number>>(new Set());
    const [deletingSelectedMessages, setDeletingSelectedMessages] = useState(false);

    const [readReceiptTrigger, setReadReceiptTrigger] = useState(0);

    // Connected users modal state (WhatsApp-style new chat screen)
    const [showConnectedUsersModal, setShowConnectedUsersModal] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
    const [connectedUsersLoading, setConnectedUsersLoading] = useState(false);
    const [connectedUsersSearchQuery, setConnectedUsersSearchQuery] = useState('');

    // Long-press dropdown state for individual chat actions (mobile)
    const [longPressChat, setLongPressChat] = useState<{
        encryptedId: string;
        chatId: number;
        position: { top: number; left: number };
    } | null>(null);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const longPressDuration = 500; // milliseconds to trigger long press

    // Multi-select mode for hamburger menu (mobile)
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);

    // Mobile message actions state (long-press on messages)
    const [longPressMessage, setLongPressMessage] = useState<{
        message: Message;
        position: { top: number; left: number };
        isOwner: boolean;
    } | null>(null);
    const messageLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const messageLongPressDuration = 400; // milliseconds

    // Swipe-to-reply state
    const [swipingMessageId, setSwipingMessageId] = useState<number | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const swipeStartX = useRef<number>(0);
    const swipeThreshold = 80; // pixels to trigger reply

    // Typing functionality refs and state
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const typingTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map()); // Track timeouts per user
    const lastTypingTime = useRef<number>(0);

    // Active conversations state - store raw conversation IDs
    const [activeConversationRawIdsState, setActiveConversationRawIds] = useState<number[]>(() => {
        // Initialize from server-provided data instead of localStorage
        if (activeConversationRawIds && Array.isArray(activeConversationRawIds) && activeConversationRawIds.length > 0) {
            return activeConversationRawIds;
        } else {
            return [];
        }
    });

    // Track if we've loaded active conversations yet
    const [activeConversationsLoaded, setActiveConversationsLoaded] = useState(() => {
        return activeConversationRawIds && Array.isArray(activeConversationRawIds) && activeConversationRawIds.length > 0;
    });

    // Debug: Log when activeConversationRawIdsState changes
    useEffect(() => {
        // if (activeConversationRawIdsState.length > 0) {
        //     console.log('📋 Active raw IDs (first 3):', activeConversationRawIdsState.slice(0, 3));
        // }
    }, [activeConversationRawIdsState]);
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState<string | null>(null);

    // Get the other participant for display
    const otherUser = selectedConversation ? getOtherParticipant(selectedConversation.participants, auth.user.id) : null;

    // Memoized conversation selection checker to prevent unnecessary re-renders
    const isConversationSelected = useCallback(
        (chatEncryptedId: string) => {
            return selectedConversation?.encrypted_id === chatEncryptedId;
        },
        [selectedConversation?.encrypted_id],
    );

    // Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        if (!conversationSearchQuery.trim()) {
            return conversationsList;
        }

        // If we have backend search results, use those
        if (backendSearchedConversations.length > 0) {
            return backendSearchedConversations;
        }

        // Fallback to frontend filtering for immediate response
        const query = conversationSearchQuery.toLowerCase();
        return conversationsList.filter((chat) => {
            const other = getOtherParticipant(chat.participants, auth.user.id);
            return other?.name.toLowerCase().includes(query) || chat.last_message?.body.toLowerCase().includes(query);
        });
    }, [conversationsList, conversationSearchQuery, backendSearchedConversations, auth.user.id]);

    // const filteredChats = useMemo(() => {
    //     let baseChats = filteredConversations;

    //     switch (currentTab) {
    //         case 'active':
    //             return baseChats.filter((chat) => activeConversationRawIdsState.includes(chat.id));
    //         case 'starred':
    //             return baseChats.filter((chat) => chat.last_message);
    //         case 'all':
    //         default:
    //             return baseChats;
    //     }
    // }, [filteredConversations, currentTab, activeConversationRawIdsState]);

    const filteredChats = useMemo(() => {
        let baseChats = filteredConversations;

        switch (currentTab) {
            case 'archive':
                return baseChats.filter((chat) => chat);
            //   return baseChats.filter((chat) => chat.is_archived);

            case 'active':
                return baseChats.filter((chat) => activeConversationRawIdsState.includes(chat.id));

            case 'starred':
                return baseChats.filter((chat) => chat.last_message);

            case 'all':
            default:
                return baseChats;
        }
    }, [filteredConversations, currentTab, activeConversationRawIdsState]);

    // Derive ALL conversation list users for ChatUserSlider (mobile) - includes all users the current user has ever started a conversation with
    const activeConversationUsers = useMemo(() => {
        return conversationsList
            .map((chat) => {
                const other = getOtherParticipant(chat.participants, auth.user.id);
                return other
                    ? {
                        id: other.id,
                        name: other.name,
                        imageSrc: other.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || 'U')}`,
                        encrypted_id: chat.encrypted_id,
                    }
                    : null;
            })
            .filter((user): user is { id: number; name: string; imageSrc: string; encrypted_id: string } => user !== null);
    }, [conversationsList, auth.user.id]);

    // Close upload menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (showUploadMenu && !(event.target as Element).closest('.upload-menu-container')) {
                setShowUploadMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUploadMenu]);

    // Cleanup preview URLs when component unmounts or preview changes
    useEffect(() => {
        return () => {
            if (previewFileUrl) {
                URL.revokeObjectURL(previewFileUrl);
            }
        };
    }, [previewFileUrl]);

    // Cleanup search timeout on component unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Initialize notifications
    useEffect(() => {
        ChatNotifications.initialize();

        // Check initial permission states
        const checkPermissions = () => {
            // Check notification permission
            if (ChatNotifications.isSupported()) {
                const status = ChatNotifications.getPermissionStatus();
                setNotificationPermission(status as any);
            } else {
                setNotificationPermission('unsupported');
            }

            // Check microphone permission
            if (navigator.mediaDevices) {
                navigator.permissions
                    ?.query({ name: 'microphone' as PermissionName })
                    .then((result) => {
                        setMicrophonePermission(result.state as any);
                        result.onchange = () => {
                            setMicrophonePermission(result.state as any);
                        };
                    })
                    .catch(() => {
                        setMicrophonePermission('default');
                    });
            } else {
                setMicrophonePermission('unsupported');
            }

            // Show permission banner if needed
            const needsNotifications = ChatNotifications.needsPermission();
            const needsMicrophone = microphonePermission === 'default';
            setShowPermissionBanner(needsNotifications || needsMicrophone);
        };

        checkPermissions();
    }, []);

    // Monitor permission state changes and hide banner when all permissions are granted
    useEffect(() => {
        const needsNotifications = ChatNotifications.needsPermission();
        const needsMicrophone = microphonePermission === 'default';

        // If banner is currently showing and no permissions are needed anymore
        if (showPermissionBanner && !needsNotifications && !needsMicrophone) {
            setShowPermissionBanner(false);
            // toast.success("You're all set! All permissions have been granted.");
        }
        // If permissions are needed but banner is not showing, show it
        else if (!showPermissionBanner && (needsNotifications || needsMicrophone)) {
            setShowPermissionBanner(true);
        }
    }, [notificationPermission, microphonePermission, showPermissionBanner]);

    // Load active conversations from server on component mount
    useEffect(() => {
        const loadActiveConversations = async () => {
            try {
                const response = await axios.get('/api/active-conversations', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                // Always update with fresh data from API
                const serverActiveRawIds = response.data.active_conversation_raw_ids || [];

                // Force update even if array appears similar
                setActiveConversationRawIds([...serverActiveRawIds]);
                setActiveConversationsLoaded(true);

                // Additional debug
                setTimeout(() => {
                    // console.log('🕐 After state update - Active conversations count:', activeConversationRawIdsState.length);
                }, 100);
            } catch (error) {
                // console.warn('❌ Failed to load active conversations from API:', error);
            }
        };

        // Always load from API to ensure we have the latest data
        loadActiveConversations();
    }, []); // Run once on mount

    // Force re-render when active conversations change

    // Check if Echo is ready
    useEffect(() => {
        // console.log('🔄 Chat component initialized');

        const checkEcho = () => {
            if ((window as any).Echo) {
                // console.log('✅ Laravel Echo is ready');
                setEchoReady(true);
                return true;
            }
            return false;
        };

        // Check immediately
        if (checkEcho()) return;

        // Retry every 100ms for up to 5 seconds
        let attempts = 0;
        const maxAttempts = 50;
        const interval = setInterval(() => {
            attempts++;
            if (checkEcho()) {
                clearInterval(interval);
            } else if (attempts >= maxAttempts) {
                // console.error('❌ Laravel Echo failed to initialize after 5 seconds');
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Sync conversations list when prop changes, preserving selection
    useEffect(() => {
        const newSortedConversations = [...conversations].sort((a, b) => {
            const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return bTime - aTime;
        });

        setConversationsList(newSortedConversations);

        // If we have a selected conversation, ensure it's still properly set after list update
        if (selectedConversation && newSortedConversations.length > 0) {
            const currentConversation = newSortedConversations.find((chat) => chat.encrypted_id === selectedConversation.encrypted_id);
            if (currentConversation) {
                // Only update if there are actual changes to prevent unnecessary re-renders
                const needsUpdate =
                    currentConversation.participants?.length !== selectedConversation.participants?.length ||
                    currentConversation.title !== selectedConversation.title;

                if (needsUpdate) {
                    setSelectedConversation((prev) => ({
                        ...prev!,
                        participants: currentConversation.participants ?? prev!.participants,
                        title: currentConversation.title ?? prev!.title,
                    }));
                }
            }
        }
    }, [conversations]); // Remove selectedConversation?.encrypted_id dependency

    // Ensure selected conversation is properly maintained
    useEffect(() => {
        if (initialConversation && !selectedConversation) {
            setSelectedConversation({
                id: initialConversation.id ?? null,
                encrypted_id: initialConversation.encrypted_id,
                participants: initialConversation.participants ?? [],
                title: initialConversation.title ?? null,
            });
        }
    }, [initialConversation]); // Removed selectedConversation dependency

    // Ensure URL conversation is maintained after page hydration
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const conversationParam = urlParams.get('conversation');

        // If URL has a conversation but selectedConversation is null, restore it
        if (conversationParam && !selectedConversation && conversationsList.length > 0) {
            const urlConversation = conversationsList.find((chat) => chat.encrypted_id === conversationParam);
            if (urlConversation) {
                setSelectedConversation({
                    id: urlConversation.id ?? null,
                    encrypted_id: conversationParam,
                    participants: urlConversation.participants ?? [],
                    title: urlConversation.title ?? null,
                });
            }
        }
    }, [conversationsList]); // Removed selectedConversation dependency

    // Auto-mark messages as read when user is actively viewing
    useEffect(() => {
        if (!selectedConversation?.encrypted_id) return;

        // Add a window focus listener to mark messages as read when user comes back to the tab
        const handleFocus = async () => {
            try {
                await axios.post(`/messages/${selectedConversation.encrypted_id}/mark-read`);
                // Force read receipt update after marking as read
                setTimeout(() => setReadReceiptTrigger((prev) => prev + 1), 100);
            } catch (error) {
                // console.warn('⚠️ Failed to mark messages as read on focus:', error);
            }
        };

        // Also mark as read when conversation is selected (immediate marking)
        const markAsReadImmediate = async () => {
            try {
                await axios.post(`/messages/${selectedConversation.encrypted_id}/mark-read`);
                // Force read receipt update after marking as read
                setTimeout(() => setReadReceiptTrigger((prev) => prev + 1), 100);
            } catch (error) {
                // console.warn('⚠️ Failed to mark messages as read on selection:', error);
            }
        };

        // Mark as read immediately when conversation is selected
        markAsReadImmediate();

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [selectedConversation?.encrypted_id]);

    // Fallback polling for read receipts - ensures reliability when real-time events fail
    useEffect(() => {
        if (!selectedConversation?.encrypted_id || !auth?.user?.id) {
            return;
        }

        // More aggressive polling every 3 seconds for better responsiveness
        const pollReadReceipts = async () => {
            try {
                const response = await axios.get(`/api/conversation/${selectedConversation.encrypted_id}/read-status`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    timeout: 3000, // Shorter timeout for faster polling
                });

                const readStatusUpdates = response.data?.read_status || {};

                // Update messages with latest read status
                setMessages((prev) => {
                    let hasUpdates = false;
                    const updated = prev.map((message) => {
                        const messageReadStatus = readStatusUpdates[message.id];
                        if (messageReadStatus) {
                            // More robust comparison - check if arrays are different
                            const currentReadStatus = message.read_status || [];

                            // Compare by length first (quick check)
                            if (messageReadStatus.length !== currentReadStatus.length) {
                                hasUpdates = true;

                                return { ...message, read_status: messageReadStatus };
                            }

                            // Deep compare user IDs to detect new readers
                            const currentUserIds = new Set(currentReadStatus.map((r: any) => r.user_id));
                            const newUserIds = new Set(messageReadStatus.map((r: any) => r.user_id));

                            // Check if there are new readers
                            const hasNewReaders = messageReadStatus.some((r: any) => !currentUserIds.has(r.user_id));

                            if (hasNewReaders) {
                                hasUpdates = true;
                                console.log('🔄 Read status change detected for message', message.id, {
                                    current: Array.from(currentUserIds),
                                    new: Array.from(newUserIds),
                                });
                                return { ...message, read_status: messageReadStatus };
                            }
                        }
                        return message;
                    });

                    if (hasUpdates) {
                        // Trigger read receipt re-render immediately
                        setReadReceiptTrigger((prev) => prev + 1);
                    }

                    return updated;
                });

                setLastReadReceiptCheck(Date.now());
            } catch (error) {
                // console.warn(' Read receipt polling failed:', error);
            }
        };

        // Initial poll after 1 second
        const initialTimeout = setTimeout(pollReadReceipts, 1000);

        // Set up regular polling every 3 seconds for more responsive updates
        readReceiptPollingRef.current = setInterval(pollReadReceipts, 3000);

        return () => {
            clearTimeout(initialTimeout);
            if (readReceiptPollingRef.current) {
                clearInterval(readReceiptPollingRef.current);
                readReceiptPollingRef.current = null;
            }
        };
    }, [selectedConversation?.encrypted_id, auth?.user?.id, messages.length]);

    // Track global online users across all conversations
    useEffect(() => {
        if (!(window as any).Echo || conversationsList.length === 0) return;

        const channels: any[] = [];

        // Join all conversation channels to track presence globally
        // EXCEPT the currently active one (handled by main messaging useEffect)
        conversationsList.forEach((conv) => {
            if (conv.id && conv.id !== selectedConversation?.id) {
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
                    });
                channels.push({ id: conv.id, channel: chan });
            }
        });

        return () => {
            channels.forEach(({ id }) => {
                try {
                    (window as any).Echo?.leave(`conversation.${id}`);
                } catch (err) {
                    // console.warn('Error leaving global presence channel:', err);
                }
            });
        };
    }, [conversationsList, selectedConversation?.id]);

    // Update messages ref when messages state changes
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Track previous messages count to detect new messages
    const prevMessagesCountRef = useRef(messages.length);

    // Scroll to bottom when NEW messages are added (not on every messages change)
    useEffect(() => {
        const container = messagesEndRef.current?.parentElement;
        if (!container) return;

        // Only scroll when a new message is added (count increased)
        const isNewMessage = messages.length > prevMessagesCountRef.current;
        prevMessagesCountRef.current = messages.length;

        if (!isNewMessage) return; // Don't scroll on deletions, edits, etc.

        // Only auto-scroll if we're near the bottom already
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

        // Always scroll for the first message or when near bottom
        if (isNearBottom || messages.length === 1) {
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }, [messages.length]); // Only depend on messages.length, not the entire messages array

    // Real-time messaging with Laravel Echo - optimized
    useEffect(() => {
        if (!selectedConversation?.id || !auth?.user?.id) {
            return;
        }

        if (!echoReady) {
            return;
        }

        const conversationId = selectedConversation.id;

        // Leave previous channel with better cleanup
        if (channelRef.current?.chan) {
            try {
                const prevId = channelRef.current.currentConversationId;
                (window as any).Echo.leave(`conversation.${prevId}`);
            } catch (err) {
                // console.warn('Error leaving previous Echo channel:', err);
            }
            channelRef.current = null;
        }

        if (!(window as any).Echo) {
            return;
        }

        let chan: any;

        try {
            chan = (window as any).Echo.join(`conversation.${conversationId}`)
                .here((users: User[]) => {
                    setParticipants(users);
                    setOnlineUsers(new Set(users.map((u) => u.id)));
                    // Enhanced Echo connection monitoring
                    setEchoConnected(true);
                    setConnectionRetries(0);
                })
                .joining((user: User) => {
                    setParticipants((p: User[]) => [...p, user]);
                    setOnlineUsers((prev) => new Set([...prev, user.id]));
                })
                .leaving((user: User) => {
                    setParticipants((p: User[]) => p.filter((u) => u.id !== user.id));
                    setOnlineUsers((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(user.id);
                        return newSet;
                    });
                })
                .error((error: any) => {
                    setEchoConnected(false);
                    setConnectionRetries((prev) => prev + 1);

                    if (error.type === 'AuthError') {
                        toast.error('Failed to connect to chat. Please refresh the page.');
                    } else {
                        toast.error('Connection issue. Retrying...');
                    }

                    // Trigger more frequent polling when connection fails
                    if (readReceiptPollingRef.current) {
                        clearInterval(readReceiptPollingRef.current);
                        readReceiptPollingRef.current = setInterval(async () => {
                            try {
                                const response = await axios.get(`/api/conversation/${selectedConversation.encrypted_id}/read-status`);
                                const readStatusUpdates = response.data?.read_status || {};
                                setMessages((prev) =>
                                    prev.map((message) => {
                                        const messageReadStatus = readStatusUpdates[message.id];
                                        if (messageReadStatus) {
                                            const currentReadStatus = message.read_status || [];
                                            const hasNewReaders = messageReadStatus.some(
                                                (r: any) => !currentReadStatus.find((cr: any) => cr.user_id === r.user_id),
                                            );
                                            if (hasNewReaders || messageReadStatus.length !== currentReadStatus.length) {
                                                return { ...message, read_status: messageReadStatus };
                                            }
                                        }
                                        return message;
                                    }),
                                );
                            } catch (error) {
                                // console.warn('Emergency polling failed:', error);
                            }
                        }, 5000); // Poll every 5 seconds when connection is down
                    }
                })
                .listen('MessageSent', (event: { message: Message }) => {
                    const incoming = event.message;
                    if (!incoming || !incoming.user) return;

                    setMessages((prev) => {
                        // Avoid duplicates
                        if (prev.find((m) => m.id === incoming.id && !m.isOptimistic)) {
                            return prev;
                        }

                        // Find the optimistic message to preserve reply_to data
                        const optimisticMsg = prev.find((m) => m.isOptimistic && m.body === incoming.body && m.user.id === incoming.user.id);

                        // Remove optimistic message
                        const filtered = prev.filter((m) => {
                            if (m.isOptimistic && m.body === incoming.body && m.user.id === incoming.user.id) {
                                return false;
                            }
                            return true;
                        });

                        // Preserve reply_to from optimistic message if server didn't return it
                        const messageWithReply = {
                            ...incoming,
                            reply_to: incoming.reply_to || optimisticMsg?.reply_to || null,
                        };

                        // Show notification for messages from others
                        if (incoming.user.id !== auth.user.id) {
                            ChatNotifications.showMessageNotification(incoming.user.name, incoming.body, incoming.user.profile_picture);

                            // Automatically mark new messages as read if user is actively viewing the conversation
                            if (selectedConversation?.encrypted_id) {
                                setTimeout(async () => {
                                    try {
                                        await axios.post(`/messages/${selectedConversation.encrypted_id}/mark-read`);
                                        // Force read receipt update after auto-marking
                                        setTimeout(() => setReadReceiptTrigger((prev) => prev + 1), 100);
                                    } catch (error) {
                                        // console.warn('Failed to auto-mark message as read:', error);
                                    }
                                }, 200); // Reduced delay for faster marking
                            }

                            // Update conversation list
                            setConversationsList((prevConvs) => {
                                const updated = prevConvs.map((conv) => {
                                    if (conv.id === selectedConversation?.id) {
                                        return {
                                            ...conv,
                                            last_message: {
                                                body: incoming.body,
                                                created_at: incoming.created_at,
                                                is_read: false,
                                            },
                                            unread_count: (conv.unread_count || 0) + 1,
                                        };
                                    }
                                    return conv;
                                });
                                return updated.sort((a, b) => {
                                    const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
                                    const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
                                    return bTime - aTime;
                                });
                            });
                        }

                        return [...filtered, messageWithReply];
                    });
                })
                .listen('MessageEdited', (event: { message: Message }) => {
                    const edited = event.message;
                    if (!edited) return;

                    setMessages((prev) => prev.map((m) => (m.id === edited.id ? { ...m, body: edited.body, edited_at: edited.edited_at } : m)));
                })
                .listen('MessageDeleted', (event: { messageId: number }) => {
                    const { messageId } = event;
                    if (!messageId) return;

                    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true, body: 'This message was deleted' } : m)));
                })
                .listen('MessageRead', (event: { message_id: number; user: User; read_at: string; conversation_id?: number }) => {
                    const { message_id, user, read_at, conversation_id } = event;
                    if (!message_id || !user) {
                        return;
                    }

                    // Only process events for the current conversation
                    if (conversation_id && conversation_id !== selectedConversation?.id) {
                        return;
                    }

                    // Don't process our own read events
                    if (user.id === auth.user.id) {
                        return;
                    }

                    // Use the ref to get current messages to avoid stale closure
                    const currentMessages = messagesRef.current;
                    const foundMessage = currentMessages.find((m) => m.id === message_id);

                    if (!foundMessage) {
                        return;
                    }

                    // Update messages with immediate state update - no delays
                    setMessages((prev) => {
                        const updated = prev.map((m) => {
                            if (m.id === message_id) {
                                const existingReads = m.read_status || [];
                                const userAlreadyRead = existingReads.find((read) => read.user_id === user.id);

                                if (!userAlreadyRead) {
                                    const updatedMessage = {
                                        ...m,
                                        read_status: [
                                            ...existingReads,
                                            {
                                                user_id: user.id,
                                                user_name: user.name,
                                                read_at: read_at,
                                            },
                                        ],
                                    };
                                    return updatedMessage;
                                } else {
                                    const updatedMessage = {
                                        ...m,
                                        read_status: existingReads.map((read) => (read.user_id === user.id ? { ...read, read_at: read_at } : read)),
                                    };
                                    return updatedMessage;
                                }
                            }
                            return m;
                        });
                        return updated;
                    });

                    // Force immediate re-render of read receipts
                    setReadReceiptTrigger((prev) => prev + 1);
                })
                .listenForWhisper('typing', (payload: { user: User }) => {
                    if (payload?.user?.id && payload.user.id !== auth.user.id) {
                        // Clear existing timeout for this user
                        const existingTimeout = typingTimeouts.current.get(payload.user.id);
                        if (existingTimeout) {
                            clearTimeout(existingTimeout);
                        }

                        // Add user to typing list if not already there
                        setTypingUsers((prev) => {
                            const isAlreadyTyping = prev.find((u) => u.id === payload.user.id);
                            if (isAlreadyTyping) {
                                return prev; // User is already in typing list
                            }
                            return [...prev, payload.user];
                        });

                        // Set new timeout to remove user after 3 seconds
                        const timeout = setTimeout(() => {
                            setTypingUsers((prev) => prev.filter((u) => u.id !== payload.user.id));
                            typingTimeouts.current.delete(payload.user.id);
                        }, 3000);

                        typingTimeouts.current.set(payload.user.id, timeout);
                    }
                });
        } catch (echoError) {
            return;
        }

        channelRef.current = { chan, currentConversationId: conversationId };

        // Mark messages as read after Echo channel is properly set up
        const markMessagesAsRead = async () => {
            try {
                const response = await axios.post(
                    `/messages/${selectedConversation.encrypted_id}/mark-read`,
                    {},
                    {
                        timeout: 5000,
                    },
                );
            } catch (error: any) {
                // console.warn('Failed to mark messages as read after Echo setup:', error.response?.data || error.message);
            }
        };

        // Delay mark-read to ensure channel is fully established
        setTimeout(markMessagesAsRead, 100);

        // Also force a read receipt update after initial load
        setTimeout(() => {
            setReadReceiptTrigger((prev) => prev + 1);
        }, 500);

        return () => {
            try {
                // Clear all typing timeouts
                typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
                typingTimeouts.current.clear();

                // Clear typing timeout ref
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Reset typing users when leaving conversation
                setTypingUsers([]);

                // Leave Echo channel
                (window as any).Echo?.leave(`conversation.${conversationId}`);
                channelRef.current = null;
            } catch (err) {
                // console.warn('Error during cleanup:', err);
            }
        };
    }, [selectedConversation?.id, auth?.user?.id, echoReady]);

    // Real-time clock update for timestamps
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000); // Update every 30 seconds

        return () => clearInterval(timer);
    }, []);

    // Handle selecting a conversation from the list - optimized
    async function handleSelectConversation(encryptedId: string) {
        try {
            // Validate encryptedId
            if (!encryptedId || encryptedId.trim() === '') {
                toast.error('Invalid conversation selected');
                return;
            }

            // Immediately update the selected conversation to show visual feedback
            const targetConversation = conversationsList.find((chat) => chat.encrypted_id === encryptedId);
            if (targetConversation) {
                const newSelection = {
                    id: targetConversation.id ?? null,
                    encrypted_id: encryptedId,
                    participants: targetConversation.participants ?? [],
                    title: targetConversation.title ?? null,
                };
                setSelectedConversation(newSelection);
            } else {
                // console.warn('Conversation not found in local list, fetching from server');
            }

            // Fetch conversation data from server
            const res = await axios.get(`/messages/${encryptedId}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout: 10000, // 10 second timeout
            });

            const payload = res.data?.props ? res.data.props : res.data;
            const conversation = payload?.conversation ?? null;
            const msgs = payload?.messages ?? [];

            if (conversation) {
                const finalSelection = {
                    id: conversation.id ?? null,
                    encrypted_id: encryptedId,
                    participants: conversation.participants ?? [],
                    title: conversation.title ?? null,
                };
                setSelectedConversation(finalSelection);
                setMessages(msgs || []);
                setParticipants(conversation.participants ?? []);

                // For mobile view, use router.visit to trigger proper navigation
                // For desktop, use history API to avoid full page reload
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
                const newUrl = `/message/single?conversation=${encryptedId}`;

                if (isMobile) {
                    window.location.href = newUrl;
                } else {
                    window.history.replaceState(null, '', newUrl);
                }
            } else {
                toast.error('Failed to load conversation data');
            }
        } catch (err: any) {
            // Provide specific error messages based on error type
            if (err.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please check your connection.');
            } else if (err.response?.status === 404) {
                toast.error('Conversation not found.');
            } else if (err.response?.status === 403) {
                toast.error('You do not have access to this conversation.');
            } else if (err.response?.status >= 500) {
                toast.error('Server error. Please try again later.');
            } else {
                toast.error('Failed to load conversation. Please try again.');
            }

            // Reset selection on error
            setSelectedConversation(null);
            setMessages([]);
        }
    }

    // Fetch connected users for the modal
    const fetchConnectedUsers = useCallback(async () => {
        setConnectedUsersLoading(true);
        try {
            // Use the new JSON API endpoint
            const response = await axios.get('/api/connections/list', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            // Handle the response
            let users: User[] = [];
            const data = response.data;

            // The API returns { connected: [...] }
            if (data?.connected && Array.isArray(data.connected)) {
                users = data.connected;
            } else if (Array.isArray(data)) {
                users = data;
            }

            setConnectedUsers(users);
        } catch (error) {
            console.error('Failed to fetch connected users:', error);
            toast.error('Failed to load connected users');
            setConnectedUsers([]);
        } finally {
            setConnectedUsersLoading(false);
        }
    }, []);

    // Open connected users modal
    const openConnectedUsersModal = useCallback(() => {
        setShowConnectedUsersModal(true);
        setConnectedUsersSearchQuery('');
        fetchConnectedUsers();
    }, [fetchConnectedUsers]);

    // Close connected users modal
    const closeConnectedUsersModal = useCallback(() => {
        setShowConnectedUsersModal(false);
        setConnectedUsersSearchQuery('');
    }, []);

    // Start a conversation with a connected user
    const handleStartConversationWithUser = useCallback(
        async (userId: number) => {
            try {
                closeConnectedUsersModal();

                // Show loading toast
                const loadingToast = toast.loading('Starting conversation...');

                axios.post('/messages/start', { user_id: userId, redirect_to: 'message/single' })
                    .then((res) => {
                        toast.dismiss(loadingToast);
                        toast.success('Conversation started!');
                        window.location.href = res.data.redirect ?? '/message/single';
                    })
                    .catch((err) => {
                        toast.dismiss(loadingToast);
                        console.error('Failed to start conversation:', err);
                        toast.error('Failed to start conversation');
                    });
            } catch (error) {
                console.error('Error starting conversation:', error);
                toast.error('Failed to start conversation');
            }
        },
        [closeConnectedUsersModal],
    );

    // Filter connected users based on search query
    const filteredConnectedUsers = useMemo(() => {
        // Ensure connectedUsers is always an array
        const users = Array.isArray(connectedUsers) ? connectedUsers : [];

        if (!connectedUsersSearchQuery.trim()) {
            return users;
        }
        const query = connectedUsersSearchQuery.toLowerCase();
        return users.filter(
            (user) =>
                user.name?.toLowerCase().includes(query) || user.title?.toLowerCase().includes(query) || user.industry?.toLowerCase().includes(query),
        );
    }, [connectedUsers, connectedUsersSearchQuery]);

    // Send message function - optimized with better error handling
    async function sendMessage(e?: React.FormEvent) {
        e?.preventDefault();

        if (!text.trim()) {
            return;
        }

        if (!selectedConversation) {
            toast.error('Please select a conversation first');
            return;
        }

        const body = text.trim();
        const messageId = Date.now(); // Unique ID for optimistic update tracking

        // Optimistic message with proper typing
        const optimisticMessage: Message = {
            id: messageId,
            body,
            user: {
                id: auth.user.id,
                name: auth.user.name,
                profile_picture: auth.user.profile_picture,
            },
            created_at: new Date().toISOString(),
            isOptimistic: true,
            reply_to: replyingTo
                ? {
                    id: replyingTo.id,
                    body: replyingTo.body,
                    user: replyingTo.user,
                }
                : null,
        };

        // Clear input and reply state immediately for better UX
        setText('');
        const savedReplyingTo = replyingTo;
        setReplyingTo(null);
        setMessages((m) => [...m, optimisticMessage]);

        // Update conversation list optimistically
        setConversationsList((prevConvs) => {
            const updatedConvs = prevConvs.map((conv) => {
                if (conv.id === selectedConversation?.id) {
                    return {
                        ...conv,
                        last_message: {
                            body,
                            created_at: new Date().toISOString(),
                            is_read: true,
                        },
                    };
                }
                return conv;
            });
            return updatedConvs.sort((a, b) => {
                const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
                const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
                return bTime - aTime;
            });
        });

        try {
            const response = await axios.post(
                `/messages/${selectedConversation.encrypted_id}/messages`,
                {
                    body,
                    reply_to_id: savedReplyingTo?.id || null,
                },
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    timeout: 10000, // 10 second timeout
                },
            );
        } catch (err: any) {
            // Remove optimistic message on error
            setMessages((m) => m.filter((msg) => msg.id !== messageId));

            // Restore the text input and reply state
            setText(body);
            setReplyingTo(savedReplyingTo);

            // Show specific error message
            if (err.response?.status === 403) {
                toast.error('You do not have permission to send messages in this conversation');
            } else if (err.response?.status === 404) {
                toast.error('Conversation not found');
            } else if (err.code === 'ECONNABORTED') {
                toast.error('Message send timed out. Please try again.');
            } else {
                toast.error('Failed to send message. Please try again.');
            }
        }
    }

    // Handle typing with debouncing and throttling
    function handleTyping(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setText(e.target.value);

        // Throttle typing whispers to avoid overwhelming the WebSocket
        const now = Date.now();
        const timeSinceLastTyping = now - lastTypingTime.current;

        // Only send typing whisper if at least 1 second has passed since last one
        if (timeSinceLastTyping >= 1000) {
            try {
                if (channelRef.current?.chan && typeof channelRef.current.chan.whisper === 'function') {
                    channelRef.current.chan.whisper('typing', { user: auth.user });
                    lastTypingTime.current = now;
                }
            } catch (err) {
                // console.warn('Error sending typing whisper:', err);
            }
        }

        // Clear existing typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to send another typing whisper if user continues typing
        typingTimeoutRef.current = setTimeout(() => {
            // Send another whisper if user is still in the input field and has content
            const activeTag = document.activeElement?.tagName;
            if ((activeTag === 'INPUT' || activeTag === 'TEXTAREA') && e.target.value.trim()) {
                try {
                    if (channelRef.current?.chan && typeof channelRef.current.chan.whisper === 'function') {
                        channelRef.current.chan.whisper('typing', { user: auth.user });
                        lastTypingTime.current = Date.now();
                    }
                } catch (err) {
                    // console.warn('Error sending continued typing whisper:', err);
                }
            }
        }, 2000); // Send continued typing signal every 2 seconds if still typing
    }

    // Start editing a message
    function startEditing(message: Message) {
        setEditingMessageId(message.id);
        setEditText(message.body);
        setOpenMenuId(null);
    }

    // Cancel editing
    function cancelEditing() {
        setEditingMessageId(null);
        setEditText('');
    }

    // Save edited message
    async function saveEdit(messageId: number) {
        if (!editText.trim() || !selectedConversation) return;
        const newBody = editText.trim();

        try {
            await axios.patch(`/messages/${selectedConversation.encrypted_id}/messages/${messageId}`, {
                body: newBody,
            });

            // Optimistically update locally (real-time update will come via broadcast)
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, body: newBody, edited_at: new Date().toISOString() } : m)));

            cancelEditing();
            toast.success('Message edited successfully');
        } catch (err) {
            toast.error('Failed to edit message. Please try again.');
        }
    }

    // Delete message
    async function deleteMessage(messageId: number) {
        if (!selectedConversation) return;
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            await axios.delete(`/messages/${selectedConversation.encrypted_id}/messages/${messageId}`);

            // Optimistically mark as deleted (real-time update will come via broadcast)
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true, body: 'This message was deleted' } : m)));

            setOpenMenuId(null);
            toast.success('Message deleted successfully');
        } catch (err) {
            toast.error('Failed to delete message. Please try again.');
        }
    }

    // Message selection mode functions (for bulk delete like WhatsApp)
    function enterMessageSelectionMode() {
        setIsMessageSelectionMode(true);
        setSelectedMessageIds(new Set());
    }

    function exitMessageSelectionMode() {
        setIsMessageSelectionMode(false);
        setSelectedMessageIds(new Set());
    }

    function toggleMessageSelection(messageId: number) {
        setSelectedMessageIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            return newSet;
        });
    }

    function selectAllMessages() {
        const allMessageIds = messages.filter((m) => !m.is_deleted && !m.isOptimistic).map((m) => m.id);
        setSelectedMessageIds(new Set(allMessageIds));
        if (allMessageIds.length === 0) {
            toast.error('No messages to select.');
        }
    }

    function deselectAllMessages() {
        setSelectedMessageIds(new Set());
    }

    async function deleteSelectedMessages() {
        if (!selectedConversation || selectedMessageIds.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedMessageIds.size} message${selectedMessageIds.size > 1 ? 's' : ''} from your chat?`)) {
            return;
        }

        setDeletingSelectedMessages(true);

        try {
            // Delete messages - backend handles "delete for me" vs "delete for everyone" based on ownership
            const results = await Promise.allSettled(
                Array.from(selectedMessageIds).map((messageId) =>
                    axios.delete(`/messages/${selectedConversation.encrypted_id}/messages/${messageId}`),
                ),
            );

            // Count successes and failures
            const successIds: number[] = [];
            const failedIds: number[] = [];
            const messageIdArray = Array.from(selectedMessageIds);

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successIds.push(messageIdArray[index]);
                } else {
                    failedIds.push(messageIdArray[index]);
                }
            });

            // Remove hidden messages from view
            if (successIds.length > 0) {
                setMessages((prev) => prev.filter((m) => !successIds.includes(m.id)));
            }

            // Show appropriate message
            if (failedIds.length === 0) {
                toast.success(`${successIds.length} message${successIds.length > 1 ? 's' : ''} deleted`);
            } else if (successIds.length === 0) {
                toast.error('Failed to delete messages. Please try again.');
            } else {
                toast.success(`${successIds.length} message${successIds.length > 1 ? 's' : ''} deleted. ${failedIds.length} failed.`);
            }

            exitMessageSelectionMode();
        } catch (err) {
            toast.error('Failed to delete messages. Please try again.');
        } finally {
            setDeletingSelectedMessages(false);
        }
    }

    // Star/Unstar message
    function toggleStarMessage(messageId: number) {
        setStarredMessageIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
                toast.success('Message unstarred');
            } else {
                newSet.add(messageId);
                toast.success('Message starred');
            }
            // Persist to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('starredMessages', JSON.stringify([...newSet]));
            }
            return newSet;
        });
    }

    // Pin/Unpin message
    function togglePinMessage(messageId: number) {
        setPinnedMessageIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
                toast.success('Message unpinned');
            } else {
                newSet.add(messageId);
                toast.success('Message pinned');
            }
            return newSet;
        });
    }

    // Copy message text to clipboard
    async function copyMessageText(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Message copied to clipboard');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Message copied to clipboard');
        }
    }

    // Set reply to message
    function handleReplyTo(message: Message) {
        setReplyingTo(message);
        // Focus on the input field
        const inputField = document.querySelector('input[placeholder*="Type"]') as HTMLInputElement;
        if (inputField) {
            inputField.focus();
        }
    }

    // Cancel reply
    function cancelReply() {
        setReplyingTo(null);
    }

    // Get starred messages for the starred tab
    const starredMessages = useMemo(() => {
        return messages.filter((m) => starredMessageIds.has(m.id) && !m.is_deleted);
    }, [messages, starredMessageIds]);

    // Handle image upload
    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size (10MB max for images)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size must be less than 10MB');
            return;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreviewFile(file);
        setPreviewFileType('image');
        setPreviewFileUrl(previewUrl);
        setShowPreviewModal(true);

        // Clear input
        if (imageInputRef.current) imageInputRef.current.value = '';
    }

    // Handle document upload
    async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;

        // Validate file size (50MB max for documents)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('Document size must be less than 50MB');
            return;
        }

        // Create preview (for documents, we don't need a blob URL since we're just showing file info)
        setPreviewFile(file);
        setPreviewFileType('document');
        setPreviewFileUrl('document-preview'); // Placeholder since we don't need actual URL for document preview
        setShowPreviewModal(true);

        // Clear input
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    // Upload file helper function - optimized with better error handling
    async function uploadFile(file: File, fileType: 'image' | 'document' | 'voice') {
        if (!selectedConversation) {
            toast.error('Please select a conversation first');
            return;
        }

        setUploadingFile(true);
        setShowUploadMenu(false);

        const uploadId = Date.now(); // Unique ID for tracking

        // Create optimistic message
        const optimisticMessage: Message = {
            id: uploadId,
            body: fileType === 'image' ? '📷 Image' : fileType === 'voice' ? '🎤 Voice note' : '📄 ' + file.name,
            user: {
                id: auth.user.id,
                name: auth.user.name,
                profile_picture: auth.user.profile_picture,
            },
            created_at: new Date().toISOString(),
            isOptimistic: true,
            file_type: fileType,
            file_name: file.name,
        };

        setMessages((m) => [...m, optimisticMessage]);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('file_type', fileType);

            // Always include a body field based on file type
            let bodyText = '';
            switch (fileType) {
                case 'image':
                    bodyText = '📷 Image';
                    break;
                case 'voice':
                    bodyText = '🎤 Voice message';
                    break;
                case 'document':
                    bodyText = `📄 ${file.name}`;
                    break;
                default:
                    bodyText = 'File attachment';
            }
            formData.append('body', bodyText);

            const response = await axios.post(`/messages/${selectedConversation.encrypted_id}/messages`, formData, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout: 30000, // 30 second timeout for file uploads
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    }
                },
            });

            toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`);
        } catch (err: any) {
            // Remove optimistic message on error
            setMessages((m) => m.filter((msg) => msg.id !== uploadId));

            // Show specific error message
            let errorMessage = 'Failed to upload file. Please try again.';

            if (err.response?.status === 413) {
                errorMessage = 'File is too large. Please choose a smaller file.';
            } else if (err.response?.status === 415) {
                errorMessage = 'File type not supported.';
            } else if (err.response?.status === 403) {
                errorMessage = 'You do not have permission to upload files in this conversation.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Upload timed out. Please try again with a smaller file.';
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            toast.error(errorMessage);
        } finally {
            setUploadingFile(false);
        }
    }

    // Start voice recording
    async function startRecording() {
        // Check microphone permission first
        if (microphonePermission === 'denied') {
            toast.error('Microphone access is blocked. Please enable it in your browser settings.');
            return;
        }

        if (microphonePermission === 'default') {
            // Request permission first
            await requestMicrophonePermission();
            // After permission request, check if it was granted and proceed
            // We'll need to wait for the permission state to update, so we'll use a timeout
            setTimeout(async () => {
                // Check the current permission status directly from the browser
                try {
                    const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                    if (permissionStatus.state === 'granted') {
                        // Permission granted, proceed with recording
                        await beginRecording();
                    }
                } catch {
                    // Fallback: try to start recording directly
                    await beginRecording();
                }
            }, 500);
            return;
        }

        // If permission is already granted, start recording directly
        await beginRecording();
    }

    // Helper function to actually begin recording
    async function beginRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const audioChunks: BlobPart[] = [];

            // Reset cancellation state and ref
            setRecordingCancelled(false);
            recordingCancelledRef.current = false;

            recorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            recorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());

                // Only upload if recording wasn't cancelled (check ref for immediate value)
                if (!recordingCancelledRef.current) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                    await uploadFile(audioFile, 'voice');
                } else {
                    // Recording was cancelled, just clean up
                    recordingCancelledRef.current = false;
                }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            setShowUploadMenu(false);

            // Start timer
            const timer = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= 120) {
                        // 2 minutes max
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

            // Store timer in recorder for cleanup
            (recorder as any).timer = timer;
        } catch (err) {
            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError') {
                    setMicrophonePermission('denied');
                    toast.error('Microphone access denied. Please enable it in your browser settings and try again.');
                } else if (err.name === 'NotFoundError') {
                    toast.error('No microphone found. Please connect a microphone and try again.');
                } else {
                    toast.error('Could not access microphone. Please check your browser settings.');
                }
            } else {
                toast.error('Could not access microphone. Please check permissions.');
            }
        }
    }

    // Stop voice recording
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            // Ensure cancellation flag is false for normal stop
            recordingCancelledRef.current = false;

            clearInterval((mediaRecorder as any).timer);
            mediaRecorder.stop();
            setMediaRecorder(null);
            setIsRecording(false);
            setRecordingTime(0);
        }
    }

    // Cancel voice recording
    function cancelRecording() {
        if (mediaRecorder && isRecording) {
            // Set cancellation flag IMMEDIATELY in both state and ref
            setRecordingCancelled(true);
            recordingCancelledRef.current = true;

            // Clear timer
            clearInterval((mediaRecorder as any).timer);

            // Stop the recorder (this will trigger onstop event, but won't upload due to cancellation flag)
            mediaRecorder.stop();

            // Clean up state
            setMediaRecorder(null);
            setIsRecording(false);
            setRecordingTime(0);

            toast.success('Recording cancelled');
        }
    }

    // Format recording time
    function formatRecordingTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Search functions with debouncing and backend integration
    const debouncedSearchConversations = useCallback(async (query: string) => {
        if (!query.trim()) {
            setBackendSearchedConversations([]);
            setSearchingConversations(false);
            return;
        }

        try {
            setSearchingConversations(true);
            const response = await axios.get('/api/search/conversations', {
                params: { q: query },
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            setBackendSearchedConversations(response.data.conversations || []);
        } catch (error) {
            // console.error('Conversation search failed:', error);
            // toast.error('Search failed. Please try again.');
            setBackendSearchedConversations([]);
        } finally {
            setSearchingConversations(false);
        }
    }, []);

    const handleConversationSearch = useCallback(
        (query: string) => {
            setConversationSearchQuery(query);

            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            if (!query.trim()) {
                setBackendSearchedConversations([]);
                setSearchingConversations(false);
                return;
            }

            searchTimeoutRef.current = setTimeout(() => {
                debouncedSearchConversations(query);
            }, 300);
        },
        [debouncedSearchConversations],
    );

    const debouncedSearchMessages = useCallback(
        async (query: string) => {
            if (!selectedConversation) return;

            if (!query.trim()) {
                setFilteredMessages([]);
                setSearchingMessages(false);
                return;
            }

            try {
                setSearchingMessages(true);
                const response = await axios.get(`/api/search/messages/${selectedConversation.encrypted_id}`, {
                    params: { q: query },
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                setFilteredMessages(response.data.messages || []);
            } catch (error) {
                // console.error('Message search failed:', error);
                // Fallback to frontend search
                const filtered = messages.filter(
                    (message) =>
                        !message.is_deleted &&
                        (message.body.toLowerCase().includes(query.toLowerCase()) ||
                            (message.file_name && message.file_name.toLowerCase().includes(query.toLowerCase()))),
                );
                setFilteredMessages(filtered);
            } finally {
                setSearchingMessages(false);
            }
        },
        [selectedConversation, messages],
    );

    function handleMessageSearch(query: string) {
        setMessageSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!query.trim()) {
            setFilteredMessages([]);
            setSearchingMessages(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(() => {
            debouncedSearchMessages(query);
        }, 300);
    }

    function toggleMessageSearch() {
        setShowMessageSearch(!showMessageSearch);
        if (showMessageSearch) {
            setMessageSearchQuery('');
            setFilteredMessages([]);
        }
    }

    function clearMessageSearch() {
        setMessageSearchQuery('');
        setFilteredMessages([]);
        setShowMessageSearch(false);
    }

    // Permission request functions
    async function requestNotificationPermission() {
        try {
            const granted = await ChatNotifications.requestPermission();
            setNotificationPermission(granted ? 'granted' : 'denied');
            if (granted) {
                toast.success('Notification permission granted!');
            } else {
                toast.error('Notification permission denied. You can enable it in your browser settings.');
            }
        } catch (error) {
            toast.error('Failed to request notification permission.');
        }
    }

    async function requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the stream immediately, we just wanted to get permission
            stream.getTracks().forEach((track) => track.stop());
            setMicrophonePermission('granted');
            toast.success('Microphone access granted!');
        } catch (error) {
            setMicrophonePermission('denied');
            toast.error('Microphone permission denied. You can enable it in your browser settings.');
        }
    }

    function dismissPermissionBanner() {
        setShowPermissionBanner(false);
    }

    // Active conversations management functions
    const addToActiveConversations = async (encryptedId: string) => {
        try {
            const response = await axios.post(
                `/api/active-conversations/${encryptedId}`,
                {},
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            // Convert encrypted ID to raw ID for storage
            const conversation = conversationsList.find((c) => c.encrypted_id === encryptedId);
            if (conversation?.id) {
                const updatedActiveIds = [...activeConversationRawIdsState, conversation.id];
                setActiveConversationRawIds(updatedActiveIds);
            }
            toast.success('Added to Active Conversations');
        } catch (error: any) {
            toast.error('Failed to add to active conversations');
        }
    };

    const removeFromActiveConversations = async (encryptedId: string) => {
        try {
            const response = await axios.delete(`/api/active-conversations/${encryptedId}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            // Convert encrypted ID to raw ID for removal
            const conversation = conversationsList.find((c) => c.encrypted_id === encryptedId);
            if (conversation?.id) {
                const updatedActiveIds = activeConversationRawIdsState.filter((id) => id !== conversation.id);
                setActiveConversationRawIds(updatedActiveIds);
            }
            toast.success('Removed from Active Conversations');
        } catch (error: any) {
            toast.error('Failed to remove from active conversations');
        }
    };

    const isActiveConversation = (encryptedId: string) => {
        // Find the conversation and check if its raw ID is in our active list
        const conversation = conversationsList.find((c) => c.encrypted_id === encryptedId);
        if (!conversation?.id) return false;

        const isActive = activeConversationRawIdsState.includes(conversation.id);
        return isActive;
    };

    // VoiceNotePlayer Component
    const VoiceNotePlayer = ({ messageId, audioUrl, isOwner }: { messageId: number; audioUrl: string; isOwner: boolean }) => {
        const audioRef = useRef<HTMLAudioElement>(null);
        const [isPlaying, setIsPlaying] = useState(false);
        const [duration, setDuration] = useState(0);
        const [currentTime, setCurrentTime] = useState(0);

        useEffect(() => {
            const audio = audioRef.current;
            if (!audio) return;

            const updateTime = () => setCurrentTime(audio.currentTime);
            const updateDuration = () => setDuration(audio.duration);
            const handleEnded = () => {
                setIsPlaying(false);
                setPlayingAudio(null);
            };

            audio.addEventListener('timeupdate', updateTime);
            audio.addEventListener('loadedmetadata', updateDuration);
            audio.addEventListener('ended', handleEnded);

            return () => {
                audio.removeEventListener('timeupdate', updateTime);
                audio.removeEventListener('loadedmetadata', updateDuration);
                audio.removeEventListener('ended', handleEnded);
            };
        }, []);

        const togglePlayPause = () => {
            const audio = audioRef.current;
            if (!audio) return;

            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
                setPlayingAudio(null);
            } else {
                // Stop other audios
                if (playingAudio && playingAudio !== messageId) {
                    const otherAudio = document.querySelector(`audio[data-message-id="${playingAudio}"]`) as HTMLAudioElement;
                    if (otherAudio) {
                        otherAudio.pause();
                    }
                }
                audio.play();
                setIsPlaying(true);
                setPlayingAudio(messageId);
            }
        };

        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        // Generate fake waveform data (in a real app, you'd analyze the audio)
        const generateWaveform = () => {
            const bars = [];
            for (let i = 0; i < 25; i++) {
                // Reduced from 40 to 25 bars for better fit
                const height = Math.random() * 16 + 4; // Reduced height range
                const progress = duration > 0 ? currentTime / duration : 0;
                const isActive = i / 25 <= progress;

                bars.push(
                    <div
                        key={i}
                        className={`w-0.5 flex-shrink-0 rounded-full transition-colors duration-150 ${isActive ? (isOwner ? 'bg-white' : 'bg-purple-600') : isOwner ? 'bg-white/30' : 'bg-gray-300'
                            }`}
                        style={{ height: `${height}px` }}
                    />,
                );
            }
            return bars;
        };

        return (
            <div
                className={`flex w-full max-w-[250px] min-w-0 items-center space-x-2 rounded-2xl p-3 ${isOwner ? 'bg-[#6E28D9] text-white' : 'border-2 border-[#A47AF0] bg-white'
                    }`}
            >
                <audio ref={audioRef} data-message-id={messageId} preload="metadata">
                    <source src={audioUrl} type="audio/webm" />
                    <source src={audioUrl} type="audio/mp4" />
                    <source src={audioUrl} type="audio/wav" />
                </audio>

                {/* Play/Pause Button */}
                <button
                    onClick={togglePlayPause}
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors ${isOwner ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        }`}
                >
                    {isPlaying ? (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="ml-0.5 h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Waveform - with proper flex containment */}
                <div className="flex h-5 min-w-0 flex-1 items-center justify-center space-x-0.5 overflow-hidden">{generateWaveform()}</div>

                {/* Duration - with text truncation */}
                <div className={`flex-shrink-0 text-xs font-medium ${isOwner ? 'text-white/80' : 'text-gray-500'}`}>
                    <div className="text-right whitespace-nowrap">
                        {formatTime(currentTime)}
                        <br />
                        <span className="text-xs opacity-70">{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        );
    };

    // Inline ReadReceipt Component for inside message bubbles
    const InlineReadReceipt = ({ message, isOwner, isLight = false }: { message: Message; isOwner: boolean; isLight?: boolean }) => {
        if (!isOwner) return null;

        const readByOthers = message.read_status?.filter((read) => read.user_id !== auth.user.id) || [];
        const hasBeenRead = readByOthers.length > 0;

        // Don't show read receipts for optimistic messages or deleted messages
        if (message.isOptimistic || message.is_deleted) return null;

        const checkMarkColor = isLight ? 'text-gray-600' : 'text-white/70';
        const readCheckMarkColor = isLight ? 'text-blue-500' : 'text-blue-300';

        return (
            <span className="ml-2 inline-flex items-center">
                {hasBeenRead ? (
                    // Double check mark - message has been read (like WhatsApp)
                    <span className="flex items-center" title={`Read by: ${readByOthers.map((r) => r.user_name).join(', ')}`}>
                        <svg className={`h-3 w-3 ${readCheckMarkColor}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                        <svg className={`-ml-1.5 h-3 w-3 ${readCheckMarkColor}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                    </span>
                ) : (
                    // Single check mark - message sent but not read
                    <span title="Message sent">
                        <svg className={`h-3 w-3 ${checkMarkColor}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                    </span>
                )}
            </span>
        );
    };

    // Helper to render formatted message with optional search term highlighting
    function renderFormattedMessage(text: string, searchTerm: string, isLight: boolean = false): React.JSX.Element {
        return (
            <FormattedMessage
                text={text}
                isLight={isLight}
                searchHighlight={showMessageSearch ? searchTerm : undefined}
            />
        );
    }

    // Helper to highlight search terms (legacy - kept for backward compatibility)
    function highlightSearchTerm(text: string, searchTerm: string): React.JSX.Element {
        // Now uses FormattedMessage for rendering with formatting support
        return renderFormattedMessage(text, searchTerm, false);
    }

    // File Preview Modal Component
    const FilePreviewModal = () => {
        if (!showPreviewModal || !previewFile || !previewFileUrl) return null;

        const handleSendFile = async () => {
            if (previewFile && previewFileType) {
                setShowPreviewModal(false);
                await uploadFile(previewFile, previewFileType);
                // Cleanup
                URL.revokeObjectURL(previewFileUrl);
                setPreviewFile(null);
                setPreviewFileType(null);
                setPreviewFileUrl(null);
            }
        };

        const handleCancelPreview = () => {
            setShowPreviewModal(false);
            if (previewFileUrl) {
                URL.revokeObjectURL(previewFileUrl);
            }
            setPreviewFile(null);
            setPreviewFileType(null);
            setPreviewFileUrl(null);
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={handleCancelPreview}>
                <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Preview {previewFileType === 'image' ? 'Image' : 'Document'}</h3>
                        <button
                            onClick={handleCancelPreview}
                            className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {previewFileType === 'image' ? (
                            <img src={previewFileUrl} alt="Preview" className="h-auto max-h-[60vh] w-auto max-w-[80vw] rounded-lg object-contain" />
                        ) : (
                            <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-6">
                                <div className="text-4xl">{getDocumentIcon(previewFile.name)}</div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{previewFile.name}</h4>
                                    <p className="text-sm text-gray-500">
                                        {formatFileSize(previewFile.size)} • {previewFile.type || 'Unknown type'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 border-t border-gray-200 p-4">
                        <button
                            onClick={handleCancelPreview}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSendFile}
                            disabled={uploadingFile}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploadingFile ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Image Modal Component
    const ImageModal = () => {
        if (!showImageModal || !selectedImage) return null;

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                }}
            >
                <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg">
                    <img
                        src={selectedImage}
                        alt="Full size image"
                        className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => {
                            setShowImageModal(false);
                            setSelectedImage(null);
                        }}
                        className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    >
                        ✕
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (selectedImage) {
                                const link = document.createElement('a');
                                link.href = selectedImage;
                                link.download = 'image';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                toast.success('Download started');
                            }
                        }}
                        className="absolute right-4 bottom-4 rounded-full bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                    >
                        Download
                    </button>
                </div>
            </div>
        );
    };

    // Document Modal Component
    const DocumentModal = () => {
        if (!showDocumentModal || !selectedDocument) return null;

        const isPdf = selectedDocument.type === 'application/pdf' || selectedDocument.name.toLowerCase().endsWith('.pdf');

        const handleDownload = () => {
            const link = document.createElement('a');
            link.href = selectedDocument.url;
            link.download = selectedDocument.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download started');
        };

        const handleView = () => {
            window.open(selectedDocument.url, '_blank');
        };

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                }}
            >
                <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                        <h3 className="truncate text-lg font-semibold text-gray-900">{selectedDocument.name}</h3>
                        <button
                            onClick={() => {
                                setShowDocumentModal(false);
                                setSelectedDocument(null);
                            }}
                            className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isPdf ? (
                            <div className="space-y-4">
                                <iframe
                                    src={selectedDocument.url}
                                    className="h-96 w-full rounded-lg border border-gray-200"
                                    title={selectedDocument.name}
                                />
                                <p className="text-center text-sm text-gray-500">PDF preview (some features may not be available)</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="text-6xl">{getDocumentIcon(selectedDocument.name)}</div>
                                <div className="text-center">
                                    <h4 className="font-semibold text-gray-900">{selectedDocument.name}</h4>
                                    <p className="text-sm text-gray-500">{selectedDocument.type || 'Document'}</p>
                                </div>
                                <p className="max-w-md text-center text-sm text-gray-500">
                                    This file type cannot be previewed. You can download it to view the contents.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 border-t border-gray-200 p-4">
                        {isPdf && (
                            <button
                                onClick={handleView}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Open in New Tab
                            </button>
                        )}
                        <button
                            onClick={handleDownload}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Download
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ONLOAD BG BLUE BACKGROUND

    const [bgLoaded, setBgLoaded] = useState(false);

    // Select Chat Dropdown
    const { ref: selectChatRef, isOpen: isSelectChatOpen, toggle: toggleSelectChat, close: closeSelectChat } = useClickOutsideToggle(false);

    // Search Bar

    // Search
    const { ref: searchRef, isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useClickOutsideToggle(false);

    // Remove / bulk action mode
    const [isRemoveMode, setIsRemoveMode] = useState(false);

    const resetToDefault = () => {
        closeSearch();
        closeSelectChat();
        setIsRemoveMode(false);
    };

    const headerRef = useRef<HTMLDivElement>(null);

    // Single Search Bar
    const { ref: singleMessageRef, isOpen: isSingleMessageRefOpen, toggle: toggleSingleMessageSearch } = useClickOutsideToggle(false);
    // Use your standard hook pattern
    const { ref: slideRef, isOpen: isSlideOpen, toggle: toggleSlide } = useClickOutsideToggle(false);

    // ohnok for the clear chat panel
    const { ref: allmessagesEditRef, isOpen: isAllMessageEditOpen, toggle: toggleAllMessageEdit } = useClickOutsideToggle(false);

    // Hook for the edit message panel
    const { ref: messageEditRef, isOpen: isMessageEditOpen, toggle: toggleMessageEdit } = useClickOutsideToggle(false);

    const { ref: audioMessageEditRef, isOpen: isAudioMessageEditOpen, toggle: toggleAudioMessageEdit } = useClickOutsideToggle(false);

    const { ref: outgoingMessageEditRef, isOpen: isOutgoingMessageEditOpen, toggle: toggleOutgoinMessageEdit } = useClickOutsideToggle(false);
    const { ref: desktopSideProfileRef, isOpen: isDesktopSideProfileOpen, toggle: toggleDesktopSideProfile } = useClickOutsideToggle(false);

    // Animation variants
    const slideUpVariants = {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 },
    };

    // Animation Variants
    const singleSlideFadeVariants: Variants = {
        hidden: { opacity: 0, y: -10, height: 0 },
        visible: {
            opacity: 1,
            y: 0,
            height: '100%',
            transition: { duration: 0.3, ease: 'easeOut' },
        },
        exit: {
            opacity: 0,
            y: -10,
            height: 0,
            transition: { duration: 0.25, ease: 'easeIn' },
        },
    };

    // Right Slide For Edit  Variants
    const slideEditContainerRightVariants: Variants = {
        hidden: {
            opacity: 0,
            y: -40, // start above
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.35,
                ease: 'easeOut',
            },
        },
        exit: {
            opacity: 0,
            y: -40, // exit upward
            transition: {
                duration: 0.25,
                ease: 'easeIn',
            },
        },
    };

    const zoomFadeVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.25, ease: 'easeOut' },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 10,
            transition: { duration: 0.2, ease: 'easeIn' },
        },
    };

    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (!headerRef.current?.contains(e.target as Node)) {
                resetToDefault();
            }
        };

        document.addEventListener('mousedown', handleGlobalClick);
        return () => document.removeEventListener('mousedown', handleGlobalClick);
    }, []);

    useEffect(() => {
        const img = new Image();
        img.src = images.uibg;
        img.onload = () => setBgLoaded(true);
    }, []);

    const [isHoveredEditMessage, setIsHoveredEditMessage] = useState(false);
    const [isHoveredSentDesktopEditMessage, setIsHoveredSentDekstopEditMessage] = useState(false);
    const [isHoveredIncomeDesktopEditMessage, setIsHoveredIncometDekstopEditMessage] = useState(false);
    const [isHoveredAudioEditMessage, setIsHoveredAudioEditMessage] = useState(false);
    const [isHoveredOutgoingEditMessage, setIsHoveredOutgoingEditMessage] = useState(false);

    let isMessageAvailable = false;

    // Handler functions for profile actions
    const handleRemoveFromList = async () => {
        if (!selectedConversation || removingFromList) return;

        if (!confirm('Are you sure you want to remove this user from your conversation list? This action cannot be undone.')) {
            return;
        }

        try {
            setRemovingFromList(true);

            const response = await axios.delete(`/conversations/${selectedConversation.encrypted_id}/remove`);

            if (response.status === 200) {
                // Remove conversation from the list
                setConversationsList((prev) => prev.filter((conv) => conv.encrypted_id !== selectedConversation.encrypted_id));

                // Clear selected conversation
                setSelectedConversation(null);
                setMessages([]);

                toast.success('User removed from conversation list');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove user from list');
        } finally {
            setRemovingFromList(false);
        }
    };
    const handleClearChat = async () => {
        if (!selectedConversation || clearingChat) return;

        if (!confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
            return;
        }

        try {
            setClearingChat(true);

            const response = await axios.delete(`/conversations/${selectedConversation.encrypted_id}/clear`);

            if (response.status === 200) {
                // Clear messages locally
                setMessages([]);
                toast.success('Chat history cleared');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to clear chat');
        } finally {
            setClearingChat(false);
        }
    };

    // Mark conversation as unread
    const handleMarkAsUnread = async (encryptedId: string) => {
        if (markingUnread) return;

        try {
            setMarkingUnread(true);

            const response = await axios.post(
                `/messages/${encryptedId}/mark-unread`,
                {},
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (response.status === 200) {
                // Update the conversation list to show unread indicator
                setConversationsList((prev) =>
                    prev.map((conv) => (conv.encrypted_id === encryptedId ? { ...conv, unread_count: (conv.unread_count || 0) + 1 } : conv)),
                );
                toast.success('Conversation marked as unread');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to mark as unread');
        } finally {
            setMarkingUnread(false);
            setShowDropdown(null);
        }
    };

    // Block user
    const handleBlockUser = async (encryptedId: string) => {
        if (blockingUser) return;

        const conversation = conversationsList.find((c) => c.encrypted_id === encryptedId);
        const otherParticipant = conversation ? getOtherParticipant(conversation.participants, auth.user.id) : null;

        if (!confirm(`Are you sure you want to block ${otherParticipant?.name || 'this user'}? You won't receive messages from them anymore.`)) {
            return;
        }

        try {
            setBlockingUser(true);

            const response = await axios.post(
                `/users/block`,
                {
                    conversation_id: encryptedId,
                },
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (response.status === 200) {
                // Remove conversation from the list
                setConversationsList((prev) => prev.filter((conv) => conv.encrypted_id !== encryptedId));

                // If this was the selected conversation, clear it
                if (selectedConversation?.encrypted_id === encryptedId) {
                    setSelectedConversation(null);
                    setMessages([]);
                }

                toast.success(`${otherParticipant?.name || 'User'} has been blocked`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to block user');
        } finally {
            setBlockingUser(false);
            setShowDropdown(null);
        }
    };

    // Add to active conversations (wrapper for dropdown)
    const handleAddToActive = async (encryptedId: string) => {
        const isActive = isActiveConversation(encryptedId);
        if (isActive) {
            await removeFromActiveConversations(encryptedId);
        } else {
            await addToActiveConversations(encryptedId);
        }
        setShowDropdown(null);
    };

    // Remove chat from list (wrapper for dropdown with specific encryptedId)
    const handleRemoveChat = async (encryptedId: string) => {
        if (removingFromList) return;

        if (!confirm('Are you sure you want to remove this chat from your list? This action cannot be undone.')) {
            return;
        }

        try {
            setRemovingFromList(true);

            const response = await axios.delete(`/conversations/${encryptedId}/remove`);

            if (response.status === 200) {
                // Remove conversation from the list
                setConversationsList((prev) => prev.filter((conv) => conv.encrypted_id !== encryptedId));

                // If this was the selected conversation, clear it
                if (selectedConversation?.encrypted_id === encryptedId) {
                    setSelectedConversation(null);
                    setMessages([]);
                }

                toast.success('Chat removed from list');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove chat');
        } finally {
            setRemovingFromList(false);
            setShowDropdown(null);
        }
    };

    // Clear chat (wrapper for dropdown with specific encryptedId)
    const handleClearChatById = async (encryptedId: string) => {
        if (clearingChat) return;

        if (!confirm('Are you sure you want to clear all messages in this chat? This action cannot be undone.')) {
            return;
        }

        try {
            setClearingChat(true);

            const response = await axios.delete(`/conversations/${encryptedId}/clear`);

            if (response.status === 200) {
                // If this is the currently selected conversation, clear messages locally
                if (selectedConversation?.encrypted_id === encryptedId) {
                    setMessages([]);
                }

                // Update conversation list to show empty last message
                setConversationsList((prev) => prev.map((conv) => (conv.encrypted_id === encryptedId ? { ...conv, last_message: null } : conv)));

                toast.success('Chat history cleared');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to clear chat');
        } finally {
            setClearingChat(false);
            setShowDropdown(null);
        }
    };

    // Archive chat
    const handleArchiveChat = async (encryptedId: string) => {
        if (archivingChat) return;

        try {
            setArchivingChat(true);

            const response = await axios.post(
                `/conversations/${encryptedId}/archive`,
                {},
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (response.status === 200) {
                // Remove from visible conversation list (archived chats are separate)
                setConversationsList((prev) => prev.filter((conv) => conv.encrypted_id !== encryptedId));

                // If this was the selected conversation, clear it
                if (selectedConversation?.encrypted_id === encryptedId) {
                    setSelectedConversation(null);
                    setMessages([]);
                }

                toast.success('Chat archived');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to archive chat');
        } finally {
            setArchivingChat(false);
            setShowDropdown(null);
        }
    };

    // Long-press handlers for mobile chat actions
    const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent, encryptedId: string, chatId: number) => {
        e.preventDefault();
        const touch = 'touches' in e ? e.touches[0] : e;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

        longPressTimerRef.current = setTimeout(() => {
            setLongPressChat({
                encryptedId,
                chatId,
                position: {
                    top: rect.top + window.scrollY,
                    left: rect.left + rect.width / 2,
                },
            });
        }, longPressDuration);
    };

    const handleLongPressEnd = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const closeLongPressDropdown = () => {
        setLongPressChat(null);
    };

    // Multi-select handlers for hamburger menu
    const toggleMultiSelectMode = () => {
        setIsMultiSelectMode((prev) => !prev);
        setSelectedChatIds([]);
    };

    const toggleChatSelection = (encryptedId: string) => {
        setSelectedChatIds((prev) => (prev.includes(encryptedId) ? prev.filter((id) => id !== encryptedId) : [...prev, encryptedId]));
    };

    const selectAllChats = () => {
        setSelectedChatIds(filteredChats.map((chat) => chat.encrypted_id));
    };

    const deselectAllChats = () => {
        setSelectedChatIds([]);
    };

    // Bulk actions for multi-select
    const handleBulkRemove = async () => {
        if (selectedChatIds.length === 0) return;
        if (!confirm(`Are you sure you want to remove ${selectedChatIds.length} chat(s)?`)) return;

        for (const encryptedId of selectedChatIds) {
            await handleRemoveChat(encryptedId);
        }
        setSelectedChatIds([]);
        setIsMultiSelectMode(false);
    };

    const handleBulkArchive = async () => {
        if (selectedChatIds.length === 0) return;
        if (!confirm(`Are you sure you want to archive ${selectedChatIds.length} chat(s)?`)) return;

        for (const encryptedId of selectedChatIds) {
            await handleArchiveChat(encryptedId);
        }
        setSelectedChatIds([]);
        setIsMultiSelectMode(false);
    };

    const handleBulkClear = async () => {
        if (selectedChatIds.length === 0) return;
        if (!confirm(`Are you sure you want to clear ${selectedChatIds.length} chat(s)?`)) return;

        for (const encryptedId of selectedChatIds) {
            await handleClearChatById(encryptedId);
        }
        setSelectedChatIds([]);
        setIsMultiSelectMode(false);
    };

    const handleBulkMarkUnread = async () => {
        if (selectedChatIds.length === 0) return;

        for (const encryptedId of selectedChatIds) {
            await handleMarkAsUnread(encryptedId);
        }
        setSelectedChatIds([]);
        setIsMultiSelectMode(false);
        toast.success(`${selectedChatIds.length} chat(s) marked as unread`);
    };

    // Mobile message long-press handlers
    const handleMessageLongPressStart = (e: React.TouchEvent, message: Message, isOwner: boolean) => {
        const touch = e.touches[0];
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

        messageLongPressTimerRef.current = setTimeout(() => {
            // Vibrate on long press if supported
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            setLongPressMessage({
                message,
                position: {
                    top: Math.min(rect.top + window.scrollY, window.innerHeight - 320),
                    left: isOwner ? Math.max(rect.left - 160, 16) : Math.min(rect.left, window.innerWidth - 200),
                },
                isOwner,
            });
        }, messageLongPressDuration);
    };

    const handleMessageLongPressEnd = () => {
        if (messageLongPressTimerRef.current) {
            clearTimeout(messageLongPressTimerRef.current);
            messageLongPressTimerRef.current = null;
        }
    };

    const closeMessageActionsDropdown = () => {
        setLongPressMessage(null);
    };

    // Swipe-to-reply handlers
    const handleSwipeStart = (e: React.TouchEvent, messageId: number) => {
        swipeStartX.current = e.touches[0].clientX;
        setSwipingMessageId(messageId);
    };

    const handleSwipeMove = (e: React.TouchEvent) => {
        if (swipingMessageId === null) return;

        const currentX = e.touches[0].clientX;
        const diff = currentX - swipeStartX.current;

        // Only allow right swipe (positive diff) with a max of 100px
        if (diff > 0) {
            setSwipeOffset(Math.min(diff, 100));
        }
    };

    const handleSwipeEnd = (message: Message) => {
        if (swipeOffset >= swipeThreshold) {
            // Trigger reply
            handleReplyTo(message);
            // Vibrate feedback
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }
        setSwipeOffset(0);
        setSwipingMessageId(null);
    };

    return (
        <AppLayout>
            
            <FilePreviewModal />
            <ImageModal />
            <DocumentModal />

            {/* Permission Banner */}
            {showPermissionBanner && (
                <div className="fixed top-0 right-0 left-0 z-50 bg-blue-600 p-3 text-white shadow-lg">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="font-medium">Enable Permissions for Better Experience</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                {ChatNotifications.needsPermission() && (
                                    <button
                                        onClick={requestNotificationPermission}
                                        className="rounded bg-white px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-gray-100"
                                    >
                                        Enable Notifications
                                    </button>
                                )}
                                {microphonePermission === 'default' && (
                                    <button
                                        onClick={requestMicrophonePermission}
                                        className="rounded bg-white px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-gray-100"
                                    >
                                        Enable Microphone
                                    </button>
                                )}
                            </div>
                        </div>
                        <button onClick={dismissPermissionBanner} className="text-white transition-colors hover:text-gray-200">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

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

            <MessageProfileOverlay isOpen={showProfileOverlay} onClose={() => setShowProfileOverlay(false)} user={otherUser} />

            {/* Connected Users Modal - WhatsApp-style full screen */}
            <AnimatePresence>
                {showConnectedUsersModal && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex flex-col bg-deepBlack lg:hidden"
                    >
                        {/* Header with back button and search */}
                        <div className="sticky top-0 z-10 bg-deepBlack px-4 pt-8 pb-4">
                            <div className="mb-4 flex items-center gap-4">
                                {/* Back Button */}
                                <button
                                    onClick={closeConnectedUsersModal}
                                    className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/10"
                                    aria-label="Go back"
                                >
                                    <div className="relative h-4 w-4">
                                        <img src={images.leftarrow} className="absolute object-contain" alt="back" />
                                    </div>
                                </button>

                                <h2 className="text-lg font-semibold text-white">Select Contact</h2>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search connections..."
                                    value={connectedUsersSearchQuery}
                                    onChange={(e) => setConnectedUsersSearchQuery(e.target.value)}
                                    className="w-full rounded-full border-0 bg-gray-700 px-4 py-3 pl-12 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#A47AF0] focus:outline-none"
                                />
                                <div className="absolute top-1/2 left-4 -translate-y-1/2">
                                    <img src={images.aiSearch} className="h-5 w-5 opacity-60" alt="search" />
                                </div>
                            </div>
                        </div>

                        {/* Connected Users List */}
                        <div className="flex-1 overflow-y-auto px-4 pb-8">
                            {connectedUsersLoading ? (
                                /* Loading skeleton */
                                <div className="space-y-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="flex animate-pulse items-center gap-4 rounded-xl bg-gray-800/50 p-4">
                                            <div className="h-14 w-14 rounded-full bg-gray-700" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-32 rounded bg-gray-700" />
                                                <div className="h-3 w-24 rounded bg-gray-700" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredConnectedUsers.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="mb-3 px-2 text-xs text-gray-400">
                                        {filteredConnectedUsers.length} connection{filteredConnectedUsers.length !== 1 ? 's' : ''}
                                    </p>
                                    {filteredConnectedUsers.map((user) => (
                                        <motion.button
                                            key={user.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleStartConversationWithUser(user.id)}
                                            className="flex w-full items-center gap-4 rounded-xl bg-gray-800/30 p-4 text-left transition-colors hover:bg-gray-800/60 active:bg-gray-800/80"
                                        >
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div
                                                    style={{
                                                        backgroundImage: `url(${user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`})`,
                                                    }}
                                                    className="h-14 w-14 rounded-full bg-cover bg-center bg-no-repeat"
                                                />
                                                {onlineUsers.has(user.id) && (
                                                    <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-deepBlack" />
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-white">{user.name}</p>
                                                {user.title && <p className="truncate text-sm text-gray-400">{user.title}</p>}
                                                {user.industry && <p className="truncate text-xs text-gray-500">{user.industry}</p>}
                                            </div>

                                            {/* Message indicator */}
                                            <div className="flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A47AF0]/20">
                                                    <img src={images.bubbleChat} className="h-5 w-5 opacity-80" alt="" />
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                /* Empty state */
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative mb-4 h-24 w-24 opacity-50">
                                        <img src={images.noMessage} className="absolute object-contain" alt="" />
                                    </div>
                                    <p className="text-center text-gray-400">
                                        {connectedUsersSearchQuery
                                            ? 'No connections found matching your search.'
                                            : 'No connections yet. Connect with users in the directory.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative border-0 bg-transparent pt-0 pb-2.5">
                {/* Zindex Background */}
                <div className={`absolute z-[2] hidden h-full w-full lg:block ${bgLoaded ? 'bg-[#031C5B] dark:lg:bg-gray-900' : 'bg-white'} `}></div>
                <div
                    className="relative z-[3] flex flex-1 h-[98lvh] bg-cover bg-no-repeat lg:mt-1.5 lg:mr-2 lg:rounded-4xl lg:py-2"
                    style={{
                        backgroundImage: `url(${images.uibg})`,
                    }}
                >
                    {' '}
                    <div className="relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full overflow-hidden flex-col gap-3  lg:px-2 pb-1 lg:py-0 lg:pr-0 lg:pl-4 xl:pr-0">
                        {/* <div className="relative z-[10] no-scrollbar flex h-screen w-full flex-col gap-3 overflow-x-hidden overflow-y-auto pb-1 lg:py-0 lg:pr-0 lg:pl-7 xl:pr-0 xl:pl-8"> */}
                        {/* MESSAGE STATS */}

                        <div className="grid h-screen grid-cols-1 pb-5 lg:ml-4 lg:grid-cols-[26%_72%]">
                            {/* LEFT COLUMN - TRACK MESSAFES */}
                            <div className="lg:top-0 lg:z-10 lg:pt-5">
                                {/* SHORTCUTS BUTTONs */}
                                <div className="hidden border-b border-b-deepBlack/15 pb-8 lg:block lg:pl-2">
                                    <div className="max-w-[220px]">
                                        <h3 className="mb-3 text-base font-semibold text-[#242E2A]">Shortcuts</h3>

                                        <div className="flex flex-col gap-y-2.5">
                                            {/* Active/All Conversations Toggle Button */}
                                            <button
                                                onClick={() => setCurrentTab(currentTab === 'active' ? 'all' : 'active')}
                                                className={`flex items-center justify-start gap-x-2 rounded-full px-5 py-2 shadow transition-colors ${currentTab === 'active' ? 'bg-darkBlue text-white' : 'bg-[#D8E2FD]'
                                                    }`}
                                            >
                                                <div className="relative h-6 w-6">
                                                    <img
                                                        src={currentTab === 'active' ? icons.active.active : icons.active.default}
                                                        className="h-full w-full object-contain"
                                                        alt="Active Icon"
                                                    />
                                                </div>
                                                <p className="text-xs font-medium">
                                                    {currentTab === 'active' ? 'All Conversations' : 'Active Conversations'}
                                                </p>
                                            </button>

                                            {/* Starred Button */}
                                            <button
                                                onClick={() => setCurrentTab('starred')}
                                                className={`flex items-center justify-start gap-x-2 rounded-full px-5 py-2 shadow transition-colors ${currentTab === 'starred' ? 'bg-darkBlue text-white' : 'bg-[#FAE0E1]'
                                                    }`}
                                            >
                                                <div className="relative h-6 w-6">
                                                    <img
                                                        src={currentTab === 'starred' ? icons.starred.active : icons.starred.default}
                                                        className="h-full w-full object-contain"
                                                        alt="Starred Icon"
                                                    />
                                                </div>
                                                <p className="text-left text-xs font-medium">Starred Message</p>
                                            </button>

                                            {/* ARCHIVE BUTTON (FIRST) */}
                                            <button
                                                onClick={() => setCurrentTab('archive')}
                                                className={`flex items-center justify-start gap-x-2 rounded-full px-5 py-2 shadow transition-colors ${currentTab === 'archive' ? 'bg-[#193E47] text-white' : 'bg-[#BCEFF4]'
                                                    }`}
                                            >
                                                <div className="relative h-6 w-6">
                                                    <img
                                                        src={currentTab === 'archive' ? icons.archieve.active : icons.archieve.default}
                                                        className="h-full w-full object-contain"
                                                        alt="Archive Icon"
                                                    />
                                                </div>
                                                <p className="text-xs font-medium">Archived Messages</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* NETWORK MESSAGES */}
                                <div className="lg:bg-transparent">
                                    {/*-------------------------=========================================================================================---------
                                ==================================================-- Mobile View Mesage Second Screen Layout  List ===================================== -----------*/}

                                    {showMobileListView && (
                                        <div className="bg-deepBlack lg:hidden" ref={headerRef}>
                                            {/* Search Bar */}
                                            <div className="flex items-center justify-between border-b border-b-[#F3F0E966]/40 px-6 py-3 pb-4">
                                                {/* ===========================
                                                    Select Chat Button
                                                ============================ */}
                                                <div ref={selectChatRef} className="relative">
                                                    <button
                                                        onClick={toggleSelectChat}
                                                        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-800"
                                                    >
                                                        <div className="relative h-7 w-7">
                                                            <img src={images.menu2} className="absolute object-contain" alt="menu" />
                                                        </div>
                                                    </button>

                                                    {/* Dropdown Panel - Hamburger Menu for Multi-Select */}
                                                    <AnimatePresence>
                                                        {isSelectChatOpen && (
                                                            <motion.div
                                                                key="select-chat"
                                                                initial={{ opacity: 0, y: -20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -20 }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 220,
                                                                    damping: 17,
                                                                }}
                                                                className="absolute top-12 left-0 z-[20] w-48 rounded-3xl bg-white py-3 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_-2px_2px_-1px_rgba(0,0,0,0.2)]"
                                                            >
                                                                <div className="">
                                                                    {/* Select/Multi-select mode toggle */}
                                                                    <button
                                                                        onClick={() => {
                                                                            closeSelectChat();
                                                                            setIsMultiSelectMode(true);
                                                                            setSelectedChatIds([]);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60"
                                                                    >
                                                                        <svg
                                                                            className="h-5 w-5"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                                                            />
                                                                        </svg>
                                                                        <span>Select chats</span>
                                                                    </button>

                                                                    {/* Remove chat - triggers multi-select for removal */}
                                                                    <button
                                                                        onClick={() => {
                                                                            closeSelectChat();
                                                                            openSearch();
                                                                            setIsRemoveMode(true);
                                                                            setIsMultiSelectMode(true);
                                                                            setSelectedChatIds([]);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60"
                                                                    >
                                                                        <img src={images.removeChat} className="h-5 w-5" alt="" />
                                                                        <span>Remove chats</span>
                                                                    </button>

                                                                    {/* Clear chat - multi-select */}
                                                                    <button
                                                                        onClick={() => {
                                                                            closeSelectChat();
                                                                            setIsMultiSelectMode(true);
                                                                            setSelectedChatIds([]);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60"
                                                                    >
                                                                        <img src={images.clearChat} className="h-5 w-5" alt="" />
                                                                        <span>Clear chats</span>
                                                                    </button>

                                                                    {/* Mark unread - multi-select */}
                                                                    <button
                                                                        onClick={() => {
                                                                            closeSelectChat();
                                                                            setIsMultiSelectMode(true);
                                                                            setSelectedChatIds([]);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60"
                                                                    >
                                                                        <img src={images.markUnread} className="h-5 w-5" alt="" />
                                                                        <span>Mark as unread</span>
                                                                    </button>

                                                                    <div className="my-1 h-[1.5px] bg-gray-200" />

                                                                    {/* Archive - multi-select */}
                                                                    <button
                                                                        onClick={() => {
                                                                            closeSelectChat();
                                                                            setIsMultiSelectMode(true);
                                                                            setSelectedChatIds([]);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60"
                                                                    >
                                                                        <img src={images.archiveChat} className="h-5 w-5" alt="" />
                                                                        <span>Archive chats</span>
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* ===========================
                                                Search Input / Button
                                            ============================ */}
                                                <div className="flex items-center justify-center gap-3" ref={searchRef}>
                                                    <AnimatePresence mode="wait">
                                                        {!isSearchOpen && (
                                                            <motion.button
                                                                key="search-btn"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                transition={{ duration: 0.2 }}
                                                                onClick={() => {
                                                                    closeSelectChat();
                                                                    setIsRemoveMode(false);
                                                                    openSearch();
                                                                }}
                                                                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                                                            >
                                                                <div className="relative h-7 w-7">
                                                                    <img src={images.aiSearch} className="absolute object-contain" alt="search" />
                                                                </div>
                                                            </motion.button>
                                                        )}

                                                        {isSearchOpen && (
                                                            <motion.div
                                                                key="search-bar"
                                                                initial={{ opacity: 0, x: 10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 10 }}
                                                                transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                                                                // className="flex w-[70vw] max-w-[380px] rounded-full shadow-[1px_3px_10px_-1px_rgba(0,0,0,0.8),-2px_3px_10px_-1px_rgba(0,0,0,0.8)]"
                                                                className={`flex rounded-full shadow-[1px_3px_10px_-1px_rgba(0,0,0,0.8),-2px_3px_10px_-1px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out ${isRemoveMode ? '-ml-5 w-[50vw] max-w-[280px]' : 'w-[70vw] max-w-[380px]'
                                                                    }`}
                                                            >
                                                                <div className="relative w-full">
                                                                    {/* Width adjustment on remove button is click */}
                                                                    <input
                                                                        type="text"
                                                                        autoFocus
                                                                        placeholder="Search"
                                                                        className="w-full rounded-full border-0 bg-gray-700 px-4 py-2 text-xs text-white placeholder:text-xs placeholder:text-white placeholder:italic focus:ring focus:ring-primary/30 focus:outline-none lg:bg-[#27E6A729] lg:px-4 lg:py-2 lg:pl-5 lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                                                                    />

                                                                    <img
                                                                        src={images.aiSearch}
                                                                        className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 lg:right-10 lg:hidden"
                                                                        alt="search-icon"
                                                                    />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* This will be display until remove button chat button is click */}
                                                    {/* DIsplay Delete and archive */}
                                                    <AnimatePresence>
                                                        {isRemoveMode && (
                                                            <motion.div
                                                                key="remove-actions"
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 20 }}
                                                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                                                className="-mt-3 flex items-center justify-center gap-4"
                                                            >
                                                                {/* Archive */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteSelected();
                                                                    }}
                                                                    disabled={selectedIds.length === 0}
                                                                    className={`relative h-5 w-5 ${selectedIds.length === 0 ? 'opacity-40' : ''}`}
                                                                >
                                                                    <img src={images.archivemobile} className="absolute object-contain" />
                                                                </button>

                                                                {/* Cancel */}
                                                                <button onClick={() => setIsRemoveMode(false)} className="relative h-5 w-5">
                                                                    <img src={images.bubbleCancel} className="absolute object-contain" />
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* User Chat Dynamic section changes */}
                                            <div className="">
                                                {/* Section - changes for active-conversation */}

                                                <>
                                                    <div className="mt-3 ml-4 flex h-full flex-col">
                                                        <ChatUserSlider
                                                            users={activeConversationUsers}
                                                            onAddUser={() => {
                                                                // Open connected users modal (WhatsApp-style)
                                                                openConnectedUsersModal();
                                                            }}
                                                            onSelectUser={(user) => {
                                                                // Find the conversation for this user and navigate to it
                                                                const userWithConvo = activeConversationUsers.find((u) => u.id === user.id);
                                                                if (userWithConvo?.encrypted_id) {
                                                                    handleSelectConversation(userWithConvo.encrypted_id);
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="bg-deepBlack pb-4 pl-8 mt-4">
                                                        <h2 className="font-semibold tracking-wide text-white">Messages</h2>
                                                    </div>
                                                </>

                                                {/* Section - changes for start a new-conversation */}
                                                <>
                                                    {/* <div className="bg-deepBlack text-white pb-4 pl-8 pt-4">
                                                    <h2 className="text-[9px] "> Select Network to message</h2>
                                                    <h3 className="text-[17.7px] font-bold"> All Networks</h3>
                                            </div> */}
                                                </>

                                                {/* User List - Using Real Conversations */}
                                                <div
                                                    className="rounded-t-[40px] bg-cover bg-no-repeat"
                                                    style={{ backgroundImage: `url(${images.uibg})` }}
                                                >
                                                    {/* Multi-select action bar */}
                                                    {isMultiSelectMode && (
                                                        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        setIsMultiSelectMode(false);
                                                                        setSelectedChatIds([]);
                                                                        setIsRemoveMode(false);
                                                                    }}
                                                                    className="text-darkBlue"
                                                                >
                                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                                <span className="text-xs font-medium text-darkBlue">
                                                                    {selectedChatIds.length} selected
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={
                                                                        selectedChatIds.length === filteredChats.length
                                                                            ? deselectAllChats
                                                                            : selectAllChats
                                                                    }
                                                                    className="rounded-full bg-gray-100 px-3 py-1 text-[10px] text-darkBlue"
                                                                >
                                                                    {selectedChatIds.length === filteredChats.length ? 'Deselect All' : 'Select All'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Multi-select action buttons */}
                                                    {isMultiSelectMode && selectedChatIds.length > 0 && (
                                                        <div className="flex items-center justify-center gap-4 bg-white/95 px-4 py-2 backdrop-blur-sm">
                                                            <button
                                                                onClick={handleBulkRemove}
                                                                className="flex flex-col items-center gap-1 text-red-500"
                                                            >
                                                                <img src={images.removeChat} className="h-5 w-5" alt="" />
                                                                <span className="text-[9px]">Remove</span>
                                                            </button>
                                                            <button
                                                                onClick={handleBulkClear}
                                                                className="flex flex-col items-center gap-1 text-darkBlue"
                                                            >
                                                                <img src={images.clearChat} className="h-5 w-5" alt="" />
                                                                <span className="text-[9px]">Clear</span>
                                                            </button>
                                                            <button
                                                                onClick={handleBulkMarkUnread}
                                                                className="flex flex-col items-center gap-1 text-darkBlue"
                                                            >
                                                                <img src={images.markUnread} className="h-5 w-5" alt="" />
                                                                <span className="text-[9px]">Unread</span>
                                                            </button>
                                                            <button
                                                                onClick={handleBulkArchive}
                                                                className="flex flex-col items-center gap-1 text-darkBlue"
                                                            >
                                                                <img src={images.archiveChat} className="h-5 w-5" alt="" />
                                                                <span className="text-[9px]">Archive</span>
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3 px-8 pt-10">
                                                        {isConversationsLoading || isPageLoading ? (
                                                            <div className="space-y-2">
                                                                {Array.from({ length: 6 }).map((_, i) => (
                                                                    <SkeletonChatItem key={i} />
                                                                ))}
                                                            </div>
                                                        ) : filteredChats.length > 0 ? (
                                                            filteredChats.map((chat) => {
                                                                const other = getOtherParticipant(chat.participants, auth.user.id);
                                                                const isUserOnline = other ? onlineUsers.has(other.id) : false;
                                                                const isSelected = selectedChatIds.includes(chat.encrypted_id);

                                                                return (
                                                                    <div
                                                                        key={chat.encrypted_id}
                                                                        className="relative flex cursor-pointer items-center gap-2"
                                                                        onClick={() => {
                                                                            if (isMultiSelectMode) {
                                                                                toggleChatSelection(chat.encrypted_id);
                                                                            } else {
                                                                                handleSelectConversation(chat.encrypted_id);
                                                                            }
                                                                        }}
                                                                        onTouchStart={(e) => {
                                                                            if (!isMultiSelectMode) {
                                                                                handleLongPressStart(e, chat.encrypted_id, chat.id);
                                                                            }
                                                                        }}
                                                                        onTouchEnd={handleLongPressEnd}
                                                                        onTouchCancel={handleLongPressEnd}
                                                                        onContextMenu={(e) => {
                                                                            e.preventDefault();
                                                                            if (!isMultiSelectMode) {
                                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                                setLongPressChat({
                                                                                    encryptedId: chat.encrypted_id,
                                                                                    chatId: chat.id,
                                                                                    position: {
                                                                                        top: rect.top + window.scrollY,
                                                                                        left: rect.left + rect.width / 2,
                                                                                    },
                                                                                });
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Checkbox for multi-select mode */}
                                                                        {isMultiSelectMode && (
                                                                            <div
                                                                                className={`flex h-4 w-4 flex-shrink-0 -mt-9 items-center justify-center  border-2 transition-colors ${isSelected
                                                                                    ? 'border-0 bg-primary'
                                                                                    : ' bg-white'
                                                                                    }`}
                                                                            >
                                                                                {isSelected && (
                                                                                    <svg
                                                                                        className="h-3 w-3 text-white border-0 bg-[#6750A4]"
                                                                                        fill="currentColor"
                                                                                        viewBox="0 0 20 20"
                                                                                    >
                                                                                        <path
                                                                                            fillRule="evenodd"
                                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                            clipRule="evenodd"
                                                                                        />
                                                                                    </svg>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1">
                                                                            <MobileDirectChatCard
                                                                                id={chat.id}
                                                                                name={other?.name || 'Unknown'}
                                                                                lastMessage={chat.last_message?.body || 'No messages yet'}
                                                                                timeAgo={
                                                                                    chat.last_message?.created_at
                                                                                        ? formatTimeAgo(chat.last_message.created_at, currentTime)
                                                                                        : ''
                                                                                }
                                                                                avatarUrl={
                                                                                    other?.profile_picture ||
                                                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}`
                                                                                }
                                                                                isOnline={isUserOnline}
                                                                                statusDotColor={isUserOnline ? 'bg-[#2ABFBB]' : 'bg-gray-400'}
                                                                                isStarred={false}
                                                                                isStarredActive={isConversationSelected(chat.encrypted_id)}
                                                                                isActiveConversation={isActiveConversation(chat.encrypted_id)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="mt-10 text-center text-xs text-gray-400">No conversations</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Long-press dropdown for individual chat actions (mobile) */}
                                    <AnimatePresence>
                                        {longPressChat && (
                                            <>
                                                {/* Backdrop overlay */}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 z-[100] bg-black/30 lg:hidden"
                                                    onClick={closeLongPressDropdown}
                                                />
                                                {/* Dropdown menu */}
                                                <motion.div
                                                    key="long-press-dropdown"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 300,
                                                        damping: 25,
                                                    }}
                                                    className="fixed z-[101] w-48 rounded-2xl bg-white py-2 shadow-xl lg:hidden"
                                                    style={{
                                                        top: `${Math.min(longPressChat.position.top, window.innerHeight - 280)}px`,
                                                        left: `${Math.min(Math.max(longPressChat.position.left - 96, 16), window.innerWidth - 208)}px`,
                                                    }}
                                                >
                                                    {/* Remove chat */}
                                                    <button
                                                        onClick={() => {
                                                            handleRemoveChat(longPressChat.encryptedId);
                                                            closeLongPressDropdown();
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-[11px] text-darkBlue hover:bg-gray-100/60"
                                                    >
                                                        <img src={images.removeChat} className="h-5 w-5" alt="" />
                                                        <span>Remove chat</span>
                                                    </button>

                                                    {/* Clear chat */}
                                                    <button
                                                        onClick={() => {
                                                            handleClearChatById(longPressChat.encryptedId);
                                                            closeLongPressDropdown();
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-[11px] text-darkBlue hover:bg-gray-100/60"
                                                    >
                                                        <img src={images.clearChat} className="h-5 w-5" alt="" />
                                                        <span>Clear chat</span>
                                                    </button>

                                                    {/* Mark unread */}
                                                    <button
                                                        onClick={() => {
                                                            handleMarkAsUnread(longPressChat.encryptedId);
                                                            closeLongPressDropdown();
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-[11px] text-darkBlue hover:bg-gray-100/60"
                                                    >
                                                        <img src={images.markUnread} className="h-5 w-5" alt="" />
                                                        <span>Mark as unread</span>
                                                    </button>

                                                    {/* Block user */}
                                                    <button
                                                        onClick={() => {
                                                            handleBlockUser(longPressChat.encryptedId);
                                                            closeLongPressDropdown();
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-[11px] text-red-500 hover:bg-gray-100/60"
                                                    >
                                                        <img src={images.blockChat} className="h-5 w-5" alt="" />
                                                        <span>Block user</span>
                                                    </button>

                                                    {/* Add to active */}
                                                    <button
                                                        onClick={() => {
                                                            handleAddToActive(longPressChat.encryptedId);
                                                            closeLongPressDropdown();
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-[11px] text-darkBlue hover:bg-gray-100/60"
                                                    >
                                                        <img src={images.addActiveChat} className="h-5 w-5" alt="" />
                                                        <span>
                                                            {isActiveConversation(longPressChat.encryptedId) ? 'Remove from Active' : 'Add to Active'}
                                                        </span>
                                                    </button>

                                                    <div className="my-1 h-[1px] bg-gray-200" />

                                                    {/* Archive */}
                                                    <button
                                                        onClick={() => {
                                                            handleArchiveChat(longPressChat.encryptedId);
                                                            closeLongPressDropdown();
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-[11px] text-deepBlue hover:bg-gray-100/60"
                                                    >
                                                        <img src={images.archiveChat} className="h-5 w-5" alt="" />
                                                        <span>Archive chat</span>
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                    {/* -------------------------------------------  Mobile View Mesage Second Screen Layout  List ----------------------------*/}

                                    <div className="hidden flex-col items-start justify-between overflow-hidden border-b-0 bg-deepBlack px-3 pt-4 pb-3 lg:ml-4 lg:flex lg:bg-transparent lg:px-0">
                                        {isPageLoading ? (
                                            <div className="w-full space-y-3">
                                                <div className="space-y-1">
                                                    <SkeletonText className="h-3 w-32" />
                                                    <SkeletonText className="h-5 w-24" />
                                                </div>
                                                <SkeletonSearchBar />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-col">
                                                    <h2 className="text-[9px]"> Select Network to message</h2>
                                                    <h3 className="text-[17.7px] font-bold text-deepBlack"> All Networks</h3>
                                                </div>

                                                <div className="mt-2 flex w-full">
                                                    <div className="relative w-full cursor-pointer">
                                                        <input
                                                            type="text"
                                                            placeholder="Search conversations..."
                                                            value={conversationSearchQuery}
                                                            onChange={(e) => handleConversationSearch(e.target.value)}
                                                            className="w-full rounded-full border-0 bg-gray-700 px-4 py-2 text-white placeholder:text-xs placeholder:text-white placeholder:italic focus:ring focus:ring-primary/30 focus:outline-none lg:bg-[#27E6A729] lg:px-4 lg:py-2 lg:pl-5 lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
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
                                            </>
                                        )}
                                    </div>

                                    {/* MEESAGES TAB SECTION */}
                                    <div className="hidden lg:block">
                                        {/* DYNAMIC TITLE */}
                                        {currentTab === 'all' && (
                                            <div className="flex items-center justify-between pt-3 lg:ml-4">
                                                <h4 className="text-base font-semibold text-deepBlue">Direct Messages</h4>
                                                {searchingConversations && (
                                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                        <div className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent"></div>
                                                        <span>Searching...</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {currentTab === 'active' && (
                                            <h4 className="pt-3 text-base font-semibold text-deepBlue lg:ml-4">Active Conversations</h4>
                                        )}
                                        {currentTab === 'starred' && (
                                            <h4 className="pt-3 text-base font-semibold text-deepBlue lg:ml-4">Starred Messages</h4>
                                        )}

                                        {currentTab === 'archive' && (
                                            <h4 className="pt-3 text-base font-semibold text-deepBlue lg:ml-4">Archived Messages</h4>
                                        )}

                                        <Tabs value={currentTab} onValueChange={(v: any) => setCurrentTab(v)}>
                                            <TabsList className="hidden" />
                                            {/* ALL MESSAGES TAB */}
                                            <TabsContent value="all">
                                                <div className="no-scrollbar h-[42vh] relative  space-y-2 divide-y divide-white/50 overflow-y-auto pt-3 pb-4">
                                                    {isConversationsLoading || isPageLoading ? (
                                                        <div className="space-y-2">
                                                            {Array.from({ length: 6 }).map((_, i) => (
                                                                <SkeletonChatItem key={i} />
                                                            ))}
                                                        </div>
                                                    ) : filteredChats.length > 0 ? (
                                                        filteredChats.map((chat) => {
                                                            const other = getOtherParticipant(chat.participants, auth.user.id);
                                                            const isUserOnline = other ? onlineUsers.has(other.id) : false;
                                                            const statusColor = isUserOnline ? 'bg-[#2ABFBB]' : 'bg-gray-400';
                                                            const isSelected = isConversationSelected(chat.encrypted_id);

                                                            return (
                                                                <div
                                                                    key={chat.encrypted_id}
                                                                    className="relative cursor-pointer"
                                                                    onMouseEnter={() => setHoveredChatId(chat.encrypted_id)}
                                                                    onMouseLeave={() => {
                                                                        setHoveredChatId(null);
                                                                        setShowDropdown(null);
                                                                    }}
                                                                >
                                                                    <div
                                                                        onClick={() => handleSelectConversation(chat.encrypted_id)}
                                                                        className="relative"
                                                                    >
                                                                        <DirectChatCard
                                                                            id={chat.id}
                                                                            name={other?.name || 'Unknown'}
                                                                            lastMessage={chat.last_message?.body || ''}
                                                                            timeAgo={
                                                                                chat.last_message?.created_at
                                                                                    ? formatTimeAgo(chat.last_message.created_at, currentTime)
                                                                                    : ''
                                                                            }
                                                                            avatarUrl={
                                                                                other?.profile_picture ||
                                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}`
                                                                            }
                                                                            isOnline={isUserOnline}
                                                                            statusDotColor={statusColor}
                                                                            isStarred={false}
                                                                            isStarredActive={isSelected}
                                                                            isActiveConversation={isActiveConversation(chat.encrypted_id)}
                                                                        />
                                                                    </div>

                                                                    {/* Dropdown options button */}
                                                                    {(isSelected || hoveredChatId === chat.encrypted_id) && (
                                                                        <div className="absolute top-2 right-3 z-[20]">
                                                                            <DropdownToggle
                                                                                isActive={isSelected}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();

                                                                                    const rect = e.currentTarget.getBoundingClientRect();

                                                                                    setDropdownPos({
                                                                                        top: rect.top,
                                                                                        left: rect.right,
                                                                                    });

                                                                                    setShowDropdown(
                                                                                        showDropdown === chat.encrypted_id ? null : chat.encrypted_id,
                                                                                    );
                                                                                }}
                                                                            />

                                                                            {/* Dropdown menu */}
                                                                            {showDropdown === chat.encrypted_id &&
                                                                                dropdownPos &&
                                                                                createPortal(
                                                                                    <div
                                                                                        className="fixed z-[9999] w-42 rounded-3xl bg-white py-3 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_-2px_2px_-1px_rgba(0,0,0,0.2)]"
                                                                                        style={{
                                                                                            top: dropdownPos.top - 180, // opens upward
                                                                                            left: dropdownPos.left - 168, // align to button
                                                                                        }}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        {/* Remove chat */}
                                                                                        <button
                                                                                            onClick={() => handleRemoveChat(chat.encrypted_id)}
                                                                                            disabled={removingFromList}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.removeChat} className="h-5 w-5" alt="" />
                                                                                            <span>
                                                                                                {removingFromList ? 'Removing...' : 'Remove chat'}
                                                                                            </span>
                                                                                        </button>

                                                                                        {/* Clear chat */}
                                                                                        <button
                                                                                            onClick={() => handleClearChatById(chat.encrypted_id)}
                                                                                            disabled={clearingChat}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.clearChat} className="h-5 w-5" alt="" />
                                                                                            <span>{clearingChat ? 'Clearing...' : 'Clear chat'}</span>
                                                                                        </button>

                                                                                        {/* Mark unread */}
                                                                                        <button
                                                                                            onClick={() => handleMarkAsUnread(chat.encrypted_id)}
                                                                                            disabled={markingUnread}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.markUnread} className="h-5 w-5" alt="" />
                                                                                            <span>
                                                                                                {markingUnread ? 'Marking...' : 'Mark as unread'}
                                                                                            </span>
                                                                                        </button>

                                                                                        {/* Block user */}
                                                                                        <button
                                                                                            onClick={() => handleBlockUser(chat.encrypted_id)}
                                                                                            disabled={blockingUser}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-red-500 hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.blockChat} className="h-5 w-5" alt="" />
                                                                                            <span>{blockingUser ? 'Blocking...' : 'Block User'}</span>
                                                                                        </button>

                                                                                        {/* Add to active */}
                                                                                        <button
                                                                                            onClick={() => handleAddToActive(chat.encrypted_id)}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60"
                                                                                        >
                                                                                            <img
                                                                                                src={images.addActiveChat}
                                                                                                className="h-5 w-5"
                                                                                                alt=""
                                                                                            />
                                                                                            <span>
                                                                                                {isActiveConversation(chat.encrypted_id)
                                                                                                    ? 'Remove from Active'
                                                                                                    : 'Add to Active chat'}
                                                                                            </span>
                                                                                        </button>

                                                                                        <div className="my-1 h-[1.5px] bg-gray-200" />

                                                                                        {/* Archive */}
                                                                                        <button
                                                                                            onClick={() => handleArchiveChat(chat.encrypted_id)}
                                                                                            disabled={archivingChat}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img
                                                                                                src={images.archiveChat}
                                                                                                className="h-5 w-5"
                                                                                                alt=""
                                                                                            />
                                                                                            <span>
                                                                                                {archivingChat ? 'Archiving...' : 'Archive chat'}
                                                                                            </span>
                                                                                        </button>
                                                                                    </div>,
                                                                                    document.body,
                                                                                )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="flex items-center justify-center py-8">
                                                            <p className="text-sm text-gray-500">No conversations found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="active">
                                                <div className="no-scrollbar h-[42vh] space-y-2 divide-y divide-white/50 overflow-y-auto pt-3 pb-4">
                                                    {isConversationsLoading || isPageLoading ? (
                                                        <div className="space-y-2">
                                                            {Array.from({ length: 6 }).map((_, i) => (
                                                                <SkeletonChatItem key={i} />
                                                            ))}
                                                        </div>
                                                    ) : filteredChats.length > 0 ? (
                                                        filteredChats.map((chat) => {
                                                            const other = getOtherParticipant(chat.participants, auth.user.id);
                                                            const isUserOnline = other ? onlineUsers.has(other.id) : false;
                                                            const statusColor = isUserOnline ? 'bg-[#2ABFBB]' : 'bg-gray-400';
                                                            const isSelected = isConversationSelected(chat.encrypted_id);

                                                            return (
                                                                <div
                                                                    key={chat.encrypted_id}
                                                                    className="relative cursor-pointer"
                                                                    onMouseEnter={() => setHoveredChatId(chat.encrypted_id)}
                                                                    onMouseLeave={() => {
                                                                        setHoveredChatId(null);
                                                                        setShowDropdown(null);
                                                                    }}
                                                                >
                                                                    <div
                                                                        onClick={() => handleSelectConversation(chat.encrypted_id)}
                                                                        className="relative"
                                                                    >
                                                                        <DirectChatCard
                                                                            id={chat.id}
                                                                            name={other?.name || 'Unknown'}
                                                                            lastMessage={chat.last_message?.body || ''}
                                                                            timeAgo={
                                                                                chat.last_message?.created_at
                                                                                    ? formatTimeAgo(chat.last_message.created_at, currentTime)
                                                                                    : ''
                                                                            }
                                                                            avatarUrl={
                                                                                other?.profile_picture ||
                                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}`
                                                                            }
                                                                            isOnline={isUserOnline}
                                                                            statusDotColor={statusColor}
                                                                            isStarred={false}
                                                                            isStarredActive={isSelected}
                                                                            isActiveConversation={isActiveConversation(chat.encrypted_id)}
                                                                        />
                                                                    </div>

                                                                    {/* Dropdown options button */}
                                                                    {(isSelected || hoveredChatId === chat.encrypted_id) && (
                                                                        <div className="absolute top-2 right-3 z-[20]">
                                                                            <DropdownToggle
                                                                                isActive={isSelected}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();

                                                                                    const rect = e.currentTarget.getBoundingClientRect();

                                                                                    setDropdownPos({
                                                                                        top: rect.top,
                                                                                        left: rect.right,
                                                                                    });

                                                                                    setShowDropdown(
                                                                                        showDropdown === chat.encrypted_id ? null : chat.encrypted_id,
                                                                                    );
                                                                                }}
                                                                            />

                                                                            {/* Dropdown menu */}
                                                                            {showDropdown === chat.encrypted_id &&
                                                                                dropdownPos &&
                                                                                createPortal(
                                                                                    <div
                                                                                        className="fixed z-[9999] w-42 rounded-3xl bg-white py-3 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_-2px_2px_-1px_rgba(0,0,0,0.2)]"
                                                                                        style={{
                                                                                            top: dropdownPos.top - 8, // opens upward
                                                                                            left: dropdownPos.left - 168, // align to button
                                                                                        }}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        {/* Remove chat */}
                                                                                        <button
                                                                                            onClick={() => handleRemoveChat(chat.encrypted_id)}
                                                                                            disabled={removingFromList}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.removeChat} className="h-5 w-5" alt="" />
                                                                                            <span>
                                                                                                {removingFromList ? 'Removing...' : 'Remove chat'}
                                                                                            </span>
                                                                                        </button>

                                                                                        {/* Clear chat */}
                                                                                        <button
                                                                                            onClick={() => handleClearChatById(chat.encrypted_id)}
                                                                                            disabled={clearingChat}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.clearChat} className="h-5 w-5" alt="" />
                                                                                            <span>{clearingChat ? 'Clearing...' : 'Clear chat'}</span>
                                                                                        </button>

                                                                                        {/* Mark unread */}
                                                                                        <button
                                                                                            onClick={() => handleMarkAsUnread(chat.encrypted_id)}
                                                                                            disabled={markingUnread}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.markUnread} className="h-5 w-5" alt="" />
                                                                                            <span>
                                                                                                {markingUnread ? 'Marking...' : 'Mark as unread'}
                                                                                            </span>
                                                                                        </button>

                                                                                        {/* Block user */}
                                                                                        <button
                                                                                            onClick={() => handleBlockUser(chat.encrypted_id)}
                                                                                            disabled={blockingUser}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-red-500 hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.blockChat} className="h-5 w-5" alt="" />
                                                                                            <span>{blockingUser ? 'Blocking...' : 'Block User'}</span>
                                                                                        </button>

                                                                                        {/* Remove from active */}
                                                                                        <button
                                                                                            onClick={() => handleAddToActive(chat.encrypted_id)}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60"
                                                                                        >
                                                                                            <img
                                                                                                src={images.addActiveChat}
                                                                                                className="h-5 w-5"
                                                                                                alt=""
                                                                                            />
                                                                                            <span>Remove from Active</span>
                                                                                        </button>

                                                                                        <div className="my-1 h-[1.5px] bg-gray-200" />

                                                                                        {/* Archive */}
                                                                                        <button
                                                                                            onClick={() => handleArchiveChat(chat.encrypted_id)}
                                                                                            disabled={archivingChat}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img
                                                                                                src={images.archiveChat}
                                                                                                className="h-5 w-5"
                                                                                                alt=""
                                                                                            />
                                                                                            <span>
                                                                                                {archivingChat ? 'Archiving...' : 'Archive chat'}
                                                                                            </span>
                                                                                        </button>
                                                                                    </div>,
                                                                                    document.body,
                                                                                )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="flex items-center justify-center py-8">
                                                            <p className="text-sm text-gray-500">No active conversations</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="starred">
                                                <div className="no-scrollbar h-[42vh] space-y-2 overflow-y-auto pt-3 pb-4">
                                                    {isConversationsLoading || isPageLoading ? (
                                                        <div className="space-y-2">
                                                            {Array.from({ length: 6 }).map((_, i) => (
                                                                <SkeletonChatItem key={i} />
                                                            ))}
                                                        </div>
                                                    ) : starredMessages.length > 0 ? (
                                                        starredMessages.map((message) => {
                                                            const isOwner = message.user.id === auth.user.id;
                                                            return (
                                                                <div
                                                                    key={message.id}
                                                                    className="group relative cursor-pointer rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                                                                    onClick={() => {
                                                                        // Scroll to the message if it's in the current conversation
                                                                        const messageElement = document.getElementById(`message-${message.id}`);
                                                                        if (messageElement) {
                                                                            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                            messageElement.classList.add('ring-2', 'ring-[#6E28D9]', 'ring-offset-2');
                                                                            setTimeout(() => {
                                                                                messageElement.classList.remove(
                                                                                    'ring-2',
                                                                                    'ring-[#6E28D9]',
                                                                                    'ring-offset-2',
                                                                                );
                                                                            }, 2000);
                                                                        }
                                                                    }}
                                                                >
                                                                    {/* Star indicator */}
                                                                    <div className="absolute top-2 right-2 text-yellow-500">⭐</div>

                                                                    {/* Message header */}
                                                                    <div className="mb-2 flex items-center space-x-2">
                                                                        <div
                                                                            style={{
                                                                                backgroundImage: `url(${message.user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.user.name)}`})`,
                                                                            }}
                                                                            className="h-8 w-8 rounded-full bg-cover bg-center bg-no-repeat"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <p className="text-xs font-semibold text-darkBlue">
                                                                                {isOwner ? 'You' : message.user.name}
                                                                            </p>
                                                                            <p className="text-[10px] text-gray-400">
                                                                                {formatTimeAgo(message.created_at, currentTime)}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Message content */}
                                                                    <div
                                                                        className={`rounded-lg p-2 text-xs ${isOwner ? 'bg-[#6E28D9]/10 text-[#6E28D9]' : 'bg-gray-50 text-gray-700'}`}
                                                                    >
                                                                        {message.file_type ? (
                                                                            <span className="italic">
                                                                                [
                                                                                {message.file_type === 'image'
                                                                                    ? '📷 Image'
                                                                                    : message.file_type === 'voice'
                                                                                        ? '🎤 Voice note'
                                                                                        : '📄 Document'}
                                                                                ]
                                                                            </span>
                                                                        ) : (
                                                                            <p className="line-clamp-2">{message.body}</p>
                                                                        )}
                                                                    </div>

                                                                    {/* Unstar button on hover */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleStarMessage(message.id);
                                                                        }}
                                                                        className="absolute right-2 bottom-2 hidden rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600 group-hover:block hover:bg-gray-200"
                                                                    >
                                                                        Unstar
                                                                    </button>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-8">
                                                            <div className="mb-3 text-4xl">⭐</div>
                                                            <p className="text-sm font-medium text-gray-600">No starred messages</p>
                                                            <p className="mt-1 text-xs text-gray-400">
                                                                Star important messages to find them easily here
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="archive">
                                                <div className="no-scrollbar h-[42vh] space-y-2 divide-y divide-white/50 overflow-y-auto pt-3 pb-4">
                                                    {isConversationsLoading || isPageLoading ? (
                                                        <div className="space-y-2">
                                                            {Array.from({ length: 6 }).map((_, i) => (
                                                                <SkeletonChatItem key={i} />
                                                            ))}
                                                        </div>
                                                    ) : filteredChats.length > 0 ? (
                                                        filteredChats.map((chat) => {
                                                            const other = getOtherParticipant(chat.participants, auth.user.id);
                                                            const isUserOnline = other ? onlineUsers.has(other.id) : false;
                                                            const statusColor = isUserOnline ? 'bg-[#2ABFBB]' : 'bg-gray-400';
                                                            const isSelected = isConversationSelected(chat.encrypted_id);

                                                            return (
                                                                <div
                                                                    key={chat.encrypted_id}
                                                                    className="relative cursor-pointer"
                                                                    onMouseEnter={() => setHoveredChatId(chat.encrypted_id)}
                                                                    onMouseLeave={() => {
                                                                        setHoveredChatId(null);
                                                                        setShowDropdown(null);
                                                                    }}
                                                                >
                                                                    <div
                                                                        onClick={() => handleSelectConversation(chat.encrypted_id)}
                                                                        className="relative"
                                                                    >
                                                                        <DirectChatCard
                                                                            id={chat.id}
                                                                            name={other?.name || 'Unknown'}
                                                                            lastMessage={chat.last_message?.body || ''}
                                                                            timeAgo={
                                                                                chat.last_message?.created_at
                                                                                    ? formatTimeAgo(chat.last_message.created_at, currentTime)
                                                                                    : ''
                                                                            }
                                                                            avatarUrl={
                                                                                other?.profile_picture ||
                                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}`
                                                                            }
                                                                            isOnline={isUserOnline}
                                                                            statusDotColor={statusColor}
                                                                            isStarred={false}
                                                                            isStarredActive={isSelected}
                                                                            isActiveConversation={isActiveConversation(chat.encrypted_id)}
                                                                        />
                                                                    </div>

                                                                    {/* Dropdown options button */}
                                                                    {(isSelected || hoveredChatId === chat.encrypted_id) && (
                                                                        <div className="absolute top-2 right-3 z-[20]">
                                                                            <DropdownToggle
                                                                                isActive={isSelected}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();

                                                                                    const rect = e.currentTarget.getBoundingClientRect();

                                                                                    setDropdownPos({
                                                                                        top: rect.top,
                                                                                        left: rect.right,
                                                                                    });

                                                                                    setShowDropdown(
                                                                                        showDropdown === chat.encrypted_id ? null : chat.encrypted_id,
                                                                                    );
                                                                                }}
                                                                            />

                                                                            {/* Dropdown menu */}
                                                                            {showDropdown === chat.encrypted_id &&
                                                                                dropdownPos &&
                                                                                createPortal(
                                                                                    <div
                                                                                        className="fixed z-[9999] w-42 rounded-3xl bg-white py-3 shadow-[1px_3px_2px_-1px_rgba(0,0,0,0.2),-2px_-2px_2px_-1px_rgba(0,0,0,0.2)]"
                                                                                        style={{
                                                                                            top: dropdownPos.top - 8, // opens upward
                                                                                            left: dropdownPos.left - 168, // align to button
                                                                                        }}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        {/* Remove chat */}
                                                                                        <button
                                                                                            onClick={() => handleRemoveChat(chat.encrypted_id)}
                                                                                            disabled={removingFromList}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.removeChat} className="h-5 w-5" alt="" />
                                                                                            <span>
                                                                                                {removingFromList ? 'Removing...' : 'Remove chat'}
                                                                                            </span>
                                                                                        </button>

                                                                                        {/* Clear chat */}
                                                                                        <button
                                                                                            onClick={() => handleClearChatById(chat.encrypted_id)}
                                                                                            disabled={clearingChat}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.clearChat} className="h-5 w-5" alt="" />
                                                                                            <span>{clearingChat ? 'Clearing...' : 'Clear chat'}</span>
                                                                                        </button>

                                                                                        {/* Mark unread */}
                                                                                        <button
                                                                                            onClick={() => handleMarkAsUnread(chat.encrypted_id)}
                                                                                            disabled={markingUnread}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.markUnread} className="h-5 w-5" alt="" />
                                                                                            <span>
                                                                                                {markingUnread ? 'Marking...' : 'Mark as unread'}
                                                                                            </span>
                                                                                        </button>

                                                                                        {/* Block user */}
                                                                                        <button
                                                                                            onClick={() => handleBlockUser(chat.encrypted_id)}
                                                                                            disabled={blockingUser}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-red-500 hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img src={images.blockChat} className="h-5 w-5" alt="" />
                                                                                            <span>{blockingUser ? 'Blocking...' : 'Block User'}</span>
                                                                                        </button>

                                                                                        {/* Remove from active */}
                                                                                        <button
                                                                                            onClick={() => handleAddToActive(chat.encrypted_id)}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60"
                                                                                        >
                                                                                            <img
                                                                                                src={images.addActiveChat}
                                                                                                className="h-5 w-5"
                                                                                                alt=""
                                                                                            />
                                                                                            <span>Remove from Active</span>
                                                                                        </button>

                                                                                        <div className="my-1 h-[1.5px] bg-gray-200" />

                                                                                        {/* Archive */}
                                                                                        <button
                                                                                            onClick={() => handleArchiveChat(chat.encrypted_id)}
                                                                                            disabled={archivingChat}
                                                                                            className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60 disabled:opacity-50"
                                                                                        >
                                                                                            <img
                                                                                                src={images.archiveChat}
                                                                                                className="h-5 w-5"
                                                                                                alt=""
                                                                                            />
                                                                                            <span>
                                                                                                {archivingChat ? 'Archiving...' : 'Archive chat'}
                                                                                            </span>
                                                                                        </button>
                                                                                    </div>,
                                                                                    document.body,
                                                                                )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="flex items-center justify-center py-8">
                                                            <p className="text-sm text-gray-500">No Archieve conversations</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            </div>

                            {/*  COLUMN MESSAGE LAYOUT - Desktop & Mobile  */}

                            <div className="h-screen lg:ml-10 lg:block lg:pt-1">
                                {/* DESKTOP Message  Layout */}

                                <div
                                    style={{
                                        backgroundImage: `url(${images.formBG})`,
                                    }}
                                    className="hidden no-scrollbar  h-[94lvh]  w-full flex-col overflow-hidden rounded-4xl shadow-[2px_2px_5px_-4px_rgba(0,0,0,0.2),-2px_3px_5px_-1px_rgba(0,0,0,0.2)] lg:flex"
                                >
                                    {selectedConversation && otherUser ? (
                                        // MESSAGING SCREEN LAYOUT FOR ACTIVE USER
                                        <>
                                            {/* Message Heading */}
                                            <div className="relative top-0 z-[1] mx-6 flex items-center justify-between border-b-2 border-b-[#F6FCFF] bg-white pt-3 pb-3">
                                                {/* Left Heading */}
                                                <div
                                                    className="flex cursor-pointer items-center space-x-4"
                                                    onClick={() => setShowProfileOverlay(true)}
                                                >
                                                    <div
                                                        style={{
                                                            backgroundImage: `url(${otherUser.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}`})`,
                                                        }}
                                                        className="relative h-12 w-12 rounded-full bg-cover bg-center bg-no-repeat ring-2 ring-gray-100"
                                                    >
                                                        <span
                                                            className={`absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${onlineUsers.has(otherUser.id) ? 'bg-[#2ABFBB]' : 'bg-gray-400'}`}
                                                            aria-label="Online status"
                                                        ></span>
                                                    </div>
                                                    {/* Content */}
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center space-x-7">
                                                            <h5 className="text-sm font-bold text-darkBlue">{otherUser.name}</h5>
                                                            <p className="text-[10px] font-light text-darkBlue">
                                                                {messages.length > 0 && messages[messages.length - 1].created_at
                                                                    ? formatTime(messages[messages.length - 1].created_at)
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                        <p className="text-[9.5px] tracking-tight">
                                                            COO Francophone Africa Startups
                                                            {/* {participants.length} participant{participants.length !== 1 ? 's' : ''} */}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="relative flex items-center space-x-3">
                                                    <button className="flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-darkBlue whitespace-nowrap">
                                                        <div className="relative h-6 w-6">
                                                            <img src={images.phone} className="absolute object-contain" alt="" />
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={toggleMessageSearch}
                                                        className={`flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-darkBlue whitespace-nowrap`}
                                                    >
                                                        <div className="relative h-6 w-6">
                                                            <img src={images.search} className="absolute object-contain" alt="" />
                                                        </div>
                                                    </button>
                                                    {notificationPermission === 'default' && (
                                                        <button
                                                            onClick={requestNotificationPermission}
                                                            className="flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-orange-500 whitespace-nowrap transition-colors hover:bg-orange-600"
                                                            title="Enable Notifications"
                                                        >
                                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={toggleDesktopSideProfile}
                                                        className="flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-darkBlue whitespace-nowrap"
                                                    >
                                                        <div className="relative h-6 w-6">
                                                            <img src={images.menu} className="absolute object-contain" alt="" />
                                                        </div>
                                                    </button>

                                                    {/* Animated Slide-In Message Edit Panel */}
                                                    <TooltipProvider delayDuration={100}>
                                                        <AnimatePresence>
                                                            {isDesktopSideProfileOpen && (
                                                                <motion.div
                                                                    ref={desktopSideProfileRef}
                                                                    key="dekstop-message-edit-panel"
                                                                    variants={slideEditContainerRightVariants}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    exit="exit"
                                                                    className="absolute top-16 right-3 z-[2]"
                                                                >
                                                                    <MessageActionsDropdown
                                                                        onDelete={() => {
                                                                            enterMessageSelectionMode();
                                                                            toggleDesktopSideProfile();
                                                                        }}
                                                                        onClear={() => {
                                                                            if (selectedConversation) {
                                                                                handleClearChat();
                                                                            }
                                                                            toggleDesktopSideProfile();
                                                                        }}
                                                                        onBlock={() => {
                                                                            if (selectedConversation) {
                                                                                handleBlockUser(selectedConversation.encrypted_id);
                                                                            }
                                                                            toggleDesktopSideProfile();
                                                                        }}
                                                                        onMore={() => console.log('More')}
                                                                        onActivity={() => console.log('Activity')}
                                                                        onFlag={() => console.log('Flag')}
                                                                    />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </TooltipProvider>
                                                </div>
                                            </div>

                                            {/* Message Search Bar */}
                                            {showMessageSearch && (
                                                <div className="mx-6 mb-4 flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Search messages..."
                                                            value={messageSearchQuery}
                                                            onChange={(e) => handleMessageSearch(e.target.value)}
                                                            className="w-full rounded-md border border-[#C6C9CD] bg-white px-3 py-2 text-sm ring-0 focus:ring-0"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={clearMessageSearch}
                                                        className="rounded-md bg-darkBlue px-3 py-2 text-sm text-white"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            )}

                                            {/* Search Results Info */}
                                            {showMessageSearch && messageSearchQuery && (
                                                <div className="mx-6 mb-2 text-xs text-gray-600">
                                                    {searchingMessages
                                                        ? 'Searching...'
                                                        : `Found ${filteredMessages.length} message${filteredMessages.length !== 1 ? 's' : ''}`}
                                                </div>
                                            )}

                                            {/* Message Selection Toolbar */}
                                            {isMessageSelectionMode && (
                                                <div className="mx-6 mb-3 flex items-center justify-between rounded-xl bg-[#6E28D9] px-4 py-3 text-white shadow-lg">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={exitMessageSelectionMode}
                                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                                                        >
                                                            ✕
                                                        </button>
                                                        <span className="text-sm font-medium">{selectedMessageIds.size} selected</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={selectedMessageIds.size > 0 ? deselectAllMessages : selectAllMessages}
                                                            className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/30"
                                                        >
                                                            {selectedMessageIds.size > 0 ? 'Deselect All' : 'Select All'}
                                                        </button>
                                                        <button
                                                            onClick={deleteSelectedMessages}
                                                            disabled={selectedMessageIds.size === 0 || deletingSelectedMessages}
                                                            className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {deletingSelectedMessages ? (
                                                                <>
                                                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                                                    Deleting...
                                                                </>
                                                            ) : (
                                                                <>🗑️ Delete ({selectedMessageIds.size})</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Message Body */}
                                            <div className="mx-6 flex h-[80vh] flex-col overflow-hidden rounded-2xl bg-white">
                                                <div id="messageBody" className="no-scrollbar flex h-full flex-col-reverse overflow-y-auto px-3 py-4">
                                                    {isMessagesLoading || isPageLoading ? (
                                                        <div className="w-full space-y-4 py-4">
                                                            {Array.from({ length: 8 }).map((_, i) => (
                                                                <SkeletonMessage key={i} isOwner={Math.random() > 0.5} />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full space-y-3">
                                                            {(showMessageSearch && messageSearchQuery ? filteredMessages : messages).map((message) =>
                                                                message.user.id === auth.user.id ? (
                                                                    /* Sent Messages */
                                                                    <div
                                                                        key={message.id}
                                                                        id={`message-${message.id}`}
                                                                        className={`group relative flex items-start justify-end gap-2 transition-all ${starredMessageIds.has(message.id) ? 'rounded-lg bg-yellow-50/50' : ''} ${isMessageSelectionMode && selectedMessageIds.has(message.id) ? 'rounded-lg bg-purple-50' : ''}`}
                                                                    >
                                                                        {/* Selection Checkbox */}
                                                                        {isMessageSelectionMode && !message.is_deleted && !message.isOptimistic && (
                                                                            <div
                                                                                className="flex cursor-pointer items-center self-center pr-2"
                                                                                onClick={() => toggleMessageSelection(message.id)}
                                                                            >
                                                                                <div
                                                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${selectedMessageIds.has(message.id) ? 'border-[#6E28D9] bg-[#6E28D9]' : 'border-gray-400 hover:border-[#6E28D9]'}`}
                                                                                >
                                                                                    {selectedMessageIds.has(message.id) && (
                                                                                        <span className="text-xs text-white">✓</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {editingMessageId === message.id ? (
                                                                            <div className="flex w-full items-end justify-end gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editText}
                                                                                    onChange={(e) => setEditText(e.target.value)}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') saveEdit(message.id);
                                                                                        if (e.key === 'Escape') cancelEditing();
                                                                                    }}
                                                                                    className="w-full max-w-[300px] rounded-full border-2 border-[#6E28D9] px-5 py-2 text-xs focus:outline-none"
                                                                                    autoFocus
                                                                                />
                                                                                <button
                                                                                    onClick={() => saveEdit(message.id)}
                                                                                    className="rounded-full bg-darkBlue p-2 text-white"
                                                                                >
                                                                                    ✓
                                                                                </button>
                                                                                <button
                                                                                    onClick={cancelEditing}
                                                                                    className="rounded-full bg-gray-400 p-2 text-white hover:bg-gray-500"
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex flex-col items-end">
                                                                                {/* Image Attachment */}
                                                                                {message.file_type === 'image' &&
                                                                                    message.file_url &&
                                                                                    !message.is_deleted && (
                                                                                        <div className="group relative mb-2 max-w-[300px] cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-lg">
                                                                                            <img
                                                                                                src={message.file_url}
                                                                                                alt={message.file_name || 'Image'}
                                                                                                className="h-auto w-full transition-transform hover:scale-105"
                                                                                                onClick={() => {
                                                                                                    setSelectedImage(message.file_url!);
                                                                                                    setShowImageModal(true);
                                                                                                }}
                                                                                                onError={(e) => {
                                                                                                    const target = e.target as HTMLImageElement;
                                                                                                    target.style.display = 'none';
                                                                                                    toast.error('Failed to load image');
                                                                                                }}
                                                                                            />
                                                                                            {/* Read receipt overlay */}
                                                                                            {!message.isOptimistic && !message.is_deleted && (
                                                                                                <div className="absolute right-2 bottom-2 flex items-center rounded-full bg-black/50 px-2 py-1 text-xs backdrop-blur-sm">
                                                                                                    <InlineReadReceipt
                                                                                                        key={`${message.id}-${readReceiptTrigger}`}
                                                                                                        message={message}
                                                                                                        isOwner={true}
                                                                                                    />
                                                                                                </div>
                                                                                            )}
                                                                                            {/* Preview overlay - only show on hover and don't block clicks */}
                                                                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                                                                                <div className="rounded-full bg-white/20 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                                                                                    <span className="text-sm font-medium text-white">
                                                                                                        Click to view
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                            {/* Filename and download overlay */}
                                                                                            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                                                                <p className="truncate text-xs text-white">
                                                                                                    {message.file_name}
                                                                                                </p>
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        if (message.file_url) {
                                                                                                            const link = document.createElement('a');
                                                                                                            link.href = message.file_url;
                                                                                                            link.download =
                                                                                                                message.file_name || 'image';
                                                                                                            document.body.appendChild(link);
                                                                                                            link.click();
                                                                                                            document.body.removeChild(link);
                                                                                                            toast.success('Download started');
                                                                                                        }
                                                                                                    }}
                                                                                                    className="pointer-events-auto mt-1 rounded-full bg-white/20 px-2 py-1 text-xs text-white transition-colors hover:bg-white/30"
                                                                                                >
                                                                                                    📥 Download
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                {/* Voice Note Attachment */}
                                                                                {message.file_type === 'voice' &&
                                                                                    message.file_url &&
                                                                                    !message.is_deleted && (
                                                                                        <div className="mb-2 flex items-center space-x-2">
                                                                                            <VoiceNotePlayer
                                                                                                messageId={message.id}
                                                                                                audioUrl={message.file_url}
                                                                                                isOwner={true}
                                                                                            />
                                                                                            <InlineReadReceipt
                                                                                                key={`${message.id}-${readReceiptTrigger}`}
                                                                                                message={message}
                                                                                                isOwner={true}
                                                                                            />
                                                                                        </div>
                                                                                    )}

                                                                                {/* Document Attachment */}
                                                                                {message.file_type === 'document' &&
                                                                                    message.file_url &&
                                                                                    !message.is_deleted && (
                                                                                        <div className="group mb-2 max-w-[300px] cursor-pointer">
                                                                                            <div
                                                                                                className="relative overflow-hidden rounded-xl bg-[#6E28D9] transition-all hover:bg-[#5a1fb3] hover:shadow-lg"
                                                                                                onClick={() => {
                                                                                                    setSelectedDocument({
                                                                                                        url: message.file_url!,
                                                                                                        name: message.file_name || 'Document',
                                                                                                        type:
                                                                                                            message.file_name?.split('.').pop() ||
                                                                                                            'unknown',
                                                                                                    });
                                                                                                    setShowDocumentModal(true);
                                                                                                }}
                                                                                            >
                                                                                                {/* Read receipt overlay */}
                                                                                                {!message.isOptimistic && !message.is_deleted && (
                                                                                                    <div className="absolute right-2 bottom-2 flex items-center">
                                                                                                        <InlineReadReceipt
                                                                                                            key={`${message.id}-${readReceiptTrigger}`}
                                                                                                            message={message}
                                                                                                            isOwner={true}
                                                                                                        />
                                                                                                    </div>
                                                                                                )}
                                                                                                <div className="flex items-center space-x-3 px-4 py-3 text-white transition-all">
                                                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                                                                                                        <span className="text-2xl">
                                                                                                            {getDocumentIcon(message.file_name || '')}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="flex-1 overflow-hidden">
                                                                                                        <p className="truncate text-sm font-semibold">
                                                                                                            {message.file_name}
                                                                                                        </p>
                                                                                                        <p className="text-xs opacity-75">
                                                                                                            {message.file_size
                                                                                                                ? formatFileSize(message.file_size)
                                                                                                                : 'Unknown size'}
                                                                                                        </p>
                                                                                                        <p className="mt-1 text-xs opacity-60">
                                                                                                            Click to view/download
                                                                                                        </p>
                                                                                                    </div>
                                                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                                                                                        <span className="text-sm">👁️</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                                {/* Hover indicator */}
                                                                                                <div className="absolute top-2 left-2 rounded-full bg-white/20 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                                                                    Click to view
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                {/* Text Message - only show if no file attachment */}
                                                                                {message.body && !message.file_type && (
                                                                                    <div
                                                                                        className={`relative max-w-[80vw] rounded-3xl rounded-br-none px-5 py-2 text-xs shadow-[1px_4px_2px_-1px_rgba(0,0,0,0.1),-2px_4px_2px_-1px_rgba(0,0,0,0.2)] sm:max-w-[500px] ${message.is_deleted ? 'bg-gray-400 text-gray-700 italic' : 'bg-[#6E28D9] pt-4 pb-3 text-white'} `}
                                                                                    >
                                                                                        {/* Starred indicator */}
                                                                                        {starredMessageIds.has(message.id) && !message.is_deleted && (
                                                                                            <span className="absolute -top-2 -left-2 text-sm">
                                                                                                ⭐
                                                                                            </span>
                                                                                        )}
                                                                                        {/* Pinned indicator */}
                                                                                        {pinnedMessageIds.has(message.id) && !message.is_deleted && (
                                                                                            <span className="absolute -top-2 left-4 text-sm">📌</span>
                                                                                        )}
                                                                                        {!message.is_deleted && !message.isOptimistic && (
                                                                                            <MessageDropdown>
                                                                                                <div className="absolute -top-[200px] right-0 z-[60] w-44 rounded-2xl bg-white py-2 pb-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                                                                                                    <DropdownItem
                                                                                                        icon={images.editchat}
                                                                                                        label="Edit"
                                                                                                        onClick={() => startEditing(message)}
                                                                                                    />
                                                                                                    <DropdownItem
                                                                                                        icon={images.copychat}
                                                                                                        label="Copy"
                                                                                                        onClick={() => copyMessageText(message.body)}
                                                                                                    />
                                                                                                    <DropdownItem
                                                                                                        icon={images.replychat}
                                                                                                        label="Reply"
                                                                                                        onClick={() => handleReplyTo(message)}
                                                                                                    />
                                                                                                    <DropdownItem
                                                                                                        icon={images.starchat}
                                                                                                        label={
                                                                                                            starredMessageIds.has(message.id)
                                                                                                                ? 'Unstar'
                                                                                                                : 'Star'
                                                                                                        }
                                                                                                        onClick={() => toggleStarMessage(message.id)}
                                                                                                    />
                                                                                                    <DropdownItem
                                                                                                        icon={images.pinchat}
                                                                                                        label={
                                                                                                            pinnedMessageIds.has(message.id)
                                                                                                                ? 'Unpin'
                                                                                                                : 'Pin'
                                                                                                        }
                                                                                                        onClick={() => togglePinMessage(message.id)}
                                                                                                    />

                                                                                                    <div className="my-1 h-[3px] bg-[#E5E6E9]" />

                                                                                                    <DropdownItem
                                                                                                        icon={images.deleteChat}
                                                                                                        label="Delete"
                                                                                                        onClick={() => deleteMessage(message.id)}
                                                                                                    />
                                                                                                </div>
                                                                                            </MessageDropdown>
                                                                                        )}

                                                                                        {/* Reply reference */}
                                                                                        {message.reply_to && (
                                                                                            <div
                                                                                                className="mb-2 cursor-pointer rounded-lg border-l-2 border-white/50 bg-white/10 px-2 py-1"
                                                                                                onClick={() => {
                                                                                                    const replyElement = document.getElementById(
                                                                                                        `message-${message.reply_to?.id}`,
                                                                                                    );
                                                                                                    if (replyElement) {
                                                                                                        replyElement.scrollIntoView({
                                                                                                            behavior: 'smooth',
                                                                                                            block: 'center',
                                                                                                        });
                                                                                                        replyElement.classList.add(
                                                                                                            'ring-2',
                                                                                                            'ring-white',
                                                                                                            'ring-offset-2',
                                                                                                        );
                                                                                                        setTimeout(() => {
                                                                                                            replyElement.classList.remove(
                                                                                                                'ring-2',
                                                                                                                'ring-white',
                                                                                                                'ring-offset-2',
                                                                                                            );
                                                                                                        }, 2000);
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <p className="text-[9px] font-semibold text-white/70">
                                                                                                    ↩{' '}
                                                                                                    {message.reply_to.user.id === auth.user.id
                                                                                                        ? 'You'
                                                                                                        : message.reply_to.user.name}
                                                                                                </p>
                                                                                                <p className="truncate text-[10px] text-white/60">
                                                                                                    {message.reply_to.body}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Message content */}
                                                                                        <span className="flex items-center justify-between gap-2">
                                                                                            <span>
                                                                                                {renderFormattedMessage(
                                                                                                    message.body,
                                                                                                    messageSearchQuery,
                                                                                                    true
                                                                                                )}
                                                                                            </span>

                                                                                            <InlineReadReceipt
                                                                                                key={`${message.id}-${readReceiptTrigger}`}
                                                                                                message={message}
                                                                                                isOwner={true}
                                                                                            />
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                {message.edited_at && !message.is_deleted && (
                                                                                    <span className="mt-1 text-[9px] text-gray-500 italic">
                                                                                        Edited
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    /* Incoming Messages */
                                                                    <div
                                                                        key={message.id}
                                                                        id={`message-${message.id}`}
                                                                        className={`flex items-start transition-all ${starredMessageIds.has(message.id) ? 'rounded-lg bg-yellow-50/50' : ''} ${isMessageSelectionMode && selectedMessageIds.has(message.id) ? 'rounded-lg bg-purple-50' : ''}`}
                                                                    >
                                                                        {/* Selection Checkbox */}
                                                                        {isMessageSelectionMode && !message.is_deleted && !message.isOptimistic && (
                                                                            <div
                                                                                className="flex cursor-pointer items-center self-center pr-2 pl-1"
                                                                                onClick={() => toggleMessageSelection(message.id)}
                                                                            >
                                                                                <div
                                                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${selectedMessageIds.has(message.id) ? 'border-[#6E28D9] bg-[#6E28D9]' : 'border-gray-400 hover:border-[#6E28D9]'}`}
                                                                                >
                                                                                    {selectedMessageIds.has(message.id) && (
                                                                                        <span className="text-xs text-white">✓</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex flex-col items-start">
                                                                            {/* Image Attachment */}
                                                                            {message.file_type === 'image' &&
                                                                                message.file_url &&
                                                                                !message.is_deleted && (
                                                                                    <div className="group relative mb-2 max-w-[300px] cursor-pointer overflow-hidden rounded-xl border-2 border-[#A47AF0] shadow-lg">
                                                                                        <img
                                                                                            src={message.file_url}
                                                                                            alt={message.file_name || 'Image'}
                                                                                            className="h-auto w-full transition-transform hover:scale-105"
                                                                                            onClick={() => {
                                                                                                setSelectedImage(message.file_url!);
                                                                                                setShowImageModal(true);
                                                                                            }}
                                                                                            onError={(e) => {
                                                                                                const target = e.target as HTMLImageElement;
                                                                                                target.style.display = 'none';
                                                                                                toast.error('Failed to load image');
                                                                                            }}
                                                                                        />
                                                                                        {/* Preview overlay - don't block clicks */}
                                                                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                                                                            <div className="rounded-full bg-white/20 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                                                                                <span className="text-sm font-medium text-white">
                                                                                                    Click to view
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                                                            <p className="truncate text-xs text-white">
                                                                                                {message.file_name}
                                                                                            </p>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    if (message.file_url) {
                                                                                                        const link = document.createElement('a');
                                                                                                        link.href = message.file_url;
                                                                                                        link.download = message.file_name || 'image';
                                                                                                        document.body.appendChild(link);
                                                                                                        link.click();
                                                                                                        document.body.removeChild(link);
                                                                                                        toast.success('Download started');
                                                                                                    }
                                                                                                }}
                                                                                                className="pointer-events-auto mt-1 rounded-full bg-white/20 px-2 py-1 text-xs text-white transition-colors hover:bg-white/30"
                                                                                            >
                                                                                                📥 Download
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                            {/* Voice Note Attachment */}
                                                                            {message.file_type === 'voice' &&
                                                                                message.file_url &&
                                                                                !message.is_deleted && (
                                                                                    <div className="mb-2">
                                                                                        <VoiceNotePlayer
                                                                                            messageId={message.id}
                                                                                            audioUrl={message.file_url}
                                                                                            isOwner={false}
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                            {/* Document Attachment */}
                                                                            {message.file_type === 'document' &&
                                                                                message.file_url &&
                                                                                !message.is_deleted && (
                                                                                    <div className="group mb-2 max-w-[300px] cursor-pointer">
                                                                                        <div
                                                                                            className="relative overflow-hidden rounded-xl border-2 border-[#A47AF0] bg-white transition-all hover:shadow-lg"
                                                                                            onClick={() => {
                                                                                                setSelectedDocument({
                                                                                                    url: message.file_url!,
                                                                                                    name: message.file_name || 'Document',
                                                                                                    type:
                                                                                                        message.file_name?.split('.').pop() ||
                                                                                                        'unknown',
                                                                                                });
                                                                                                setShowDocumentModal(true);
                                                                                            }}
                                                                                        >
                                                                                            <div className="flex items-center space-x-3 px-4 py-3 transition-all hover:bg-gray-50">
                                                                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#A47AF0]/10">
                                                                                                    <span className="text-2xl">
                                                                                                        {getDocumentIcon(message.file_name || '')}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex-1 overflow-hidden">
                                                                                                    <p className="truncate text-sm font-semibold text-gray-800">
                                                                                                        {message.file_name}
                                                                                                    </p>
                                                                                                    <p className="text-xs text-gray-500">
                                                                                                        {message.file_size
                                                                                                            ? formatFileSize(message.file_size)
                                                                                                            : 'Unknown size'}
                                                                                                    </p>
                                                                                                    <p className="mt-1 text-xs text-gray-400">
                                                                                                        Click to view/download
                                                                                                    </p>
                                                                                                </div>
                                                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A47AF0]/20 transition-colors group-hover:bg-[#A47AF0]/30">
                                                                                                    <span className="text-sm text-[#A47AF0]">�️</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            {/* View indicator */}
                                                                                            <div className="absolute top-2 right-2 rounded-full bg-blue-500 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                                                                Click to view
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                            {/* Text Message - only show if no file attachment */}
                                                                            {message.body && !message.file_type && (
                                                                                <div
                                                                                    className={`group relative inline-block rounded-t-xl rounded-br-xl bg-transparent p-[2px] ${message.is_deleted
                                                                                        ? 'bg-gray-300'
                                                                                        : 'bg-gradient-to-r from-[#A47AF0] to-[#CCA6FF] shadow-[-2px_-6px_10px_-3px_rgba(0,0,0,0.1),-5px_10px_10px_-3px_rgba(0,0,0,0.1)]'
                                                                                        }`}
                                                                                >
                                                                                    {/* Starred indicator */}
                                                                                    {starredMessageIds.has(message.id) && !message.is_deleted && (
                                                                                        <span className="absolute -top-2 -left-2 text-sm">⭐</span>
                                                                                    )}
                                                                                    {/* Pinned indicator */}
                                                                                    {pinnedMessageIds.has(message.id) && !message.is_deleted && (
                                                                                        <span className="absolute -top-2 left-4 text-sm">📌</span>
                                                                                    )}
                                                                                    {!message.is_deleted && !message.isOptimistic && (
                                                                                        <MessageDropdown>
                                                                                            <div className="absolute -top-[160px] left-0 z-[60] w-44 rounded-2xl bg-white py-2 pb-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                                                                                                <DropdownItem
                                                                                                    icon={images.copychat}
                                                                                                    label="Copy"
                                                                                                    onClick={() => copyMessageText(message.body)}
                                                                                                />
                                                                                                <DropdownItem
                                                                                                    icon={images.replychat}
                                                                                                    label="Reply"
                                                                                                    onClick={() => handleReplyTo(message)}
                                                                                                />
                                                                                                <DropdownItem
                                                                                                    icon={images.starchat}
                                                                                                    label={
                                                                                                        starredMessageIds.has(message.id)
                                                                                                            ? 'Unstar'
                                                                                                            : 'Star'
                                                                                                    }
                                                                                                    onClick={() => toggleStarMessage(message.id)}
                                                                                                />
                                                                                                <DropdownItem
                                                                                                    icon={images.pinchat}
                                                                                                    label={
                                                                                                        pinnedMessageIds.has(message.id)
                                                                                                            ? 'Unpin'
                                                                                                            : 'Pin'
                                                                                                    }
                                                                                                    onClick={() => togglePinMessage(message.id)}
                                                                                                />
                                                                                            </div>
                                                                                        </MessageDropdown>
                                                                                    )}
                                                                                    <div className="max-w-[80vw] rounded-t-xl rounded-br-xl bg-white px-4 py-2 text-sm text-gray-800 sm:max-w-[500px]">
                                                                                        <p className="mb-1 text-[10px] font-semibold text-gray-600">
                                                                                            {message.user.name}
                                                                                        </p>

                                                                                        {/* Reply reference */}
                                                                                        {message.reply_to && (
                                                                                            <div
                                                                                                className="mb-2 cursor-pointer rounded-lg border-l-2 border-[#A47AF0] bg-[#A47AF0]/10 px-2 py-1"
                                                                                                onClick={() => {
                                                                                                    const replyElement = document.getElementById(
                                                                                                        `message-${message.reply_to?.id}`,
                                                                                                    );
                                                                                                    if (replyElement) {
                                                                                                        replyElement.scrollIntoView({
                                                                                                            behavior: 'smooth',
                                                                                                            block: 'center',
                                                                                                        });
                                                                                                        replyElement.classList.add(
                                                                                                            'ring-2',
                                                                                                            'ring-[#A47AF0]',
                                                                                                            'ring-offset-2',
                                                                                                        );
                                                                                                        setTimeout(() => {
                                                                                                            replyElement.classList.remove(
                                                                                                                'ring-2',
                                                                                                                'ring-[#A47AF0]',
                                                                                                                'ring-offset-2',
                                                                                                            );
                                                                                                        }, 2000);
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <p className="text-[9px] font-semibold text-[#A47AF0]">
                                                                                                    ↩{' '}
                                                                                                    {message.reply_to.user.id === auth.user.id
                                                                                                        ? 'You'
                                                                                                        : message.reply_to.user.name}
                                                                                                </p>
                                                                                                <p className="truncate text-[10px] text-gray-500">
                                                                                                    {message.reply_to.body}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

                                                                                        <p
                                                                                            className={`mb-2 text-xs font-medium ${message.is_deleted ? 'text-gray-500 italic' : ''
                                                                                                }`}
                                                                                        >
                                                                                            {highlightSearchTerm(message.body, messageSearchQuery)}
                                                                                        </p>
                                                                                        <div className="flex items-center justify-between">
                                                                                            <p className="text-[9px] text-gray-400">
                                                                                                {formatTime(message.created_at)}
                                                                                            </p>
                                                                                            {message.edited_at && !message.is_deleted && (
                                                                                                <span className="text-[9px] text-gray-500 italic">
                                                                                                    Edited
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                            <div ref={messagesEndRef}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Typing indicator */}
                                            {typingUsers.length > 0 && (
                                                <div className="flex w-full items-center justify-center self-end py-6">
                                                    <p className="text-xs text-gray-500 italic">
                                                        {typingUsers.map((u) => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                                                        ………
                                                    </p>
                                                </div>
                                            )}

                                            {/* Recording Interface */}
                                            {isRecording && (
                                                <div className="mx-6 mb-4 flex items-center justify-between rounded-xl bg-red-50 p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex h-10 w-10 items-center justify-center">
                                                            <div className="h-4 w-4 animate-pulse rounded-full bg-red-500"></div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-red-600">Recording...</p>
                                                            <p className="text-xs text-gray-600">{formatRecordingTime(recordingTime)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={cancelRecording}
                                                            className="rounded-full bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={stopRecording}
                                                            className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Uploading Indicator */}
                                            {uploadingFile && (
                                                <div className="mx-6 mb-4 flex items-center justify-center rounded-xl bg-blue-50 p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                                        <p className="text-sm font-medium text-blue-600">Uploading file...</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Reply Preview */}
                                            {replyingTo && (
                                                <div className="mx-6 mb-2 flex items-center justify-between rounded-xl border-l-4 border-[#6E28D9] bg-gray-50 p-3">
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-xs font-semibold text-[#6E28D9]">
                                                            Replying to {replyingTo.user.id === auth.user.id ? 'yourself' : replyingTo.user.name}
                                                        </p>
                                                        <p className="truncate text-xs text-gray-600">
                                                            {replyingTo.file_type ? `[${replyingTo.file_type}]` : replyingTo.body}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={cancelReply}
                                                        className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}

                                            {/* Fixed Mesage Input */}
                                            <div className="sticky bottom-0 bg-white py-4">
                                                <form onSubmit={sendMessage}>
                                                    <div className="mx-6 flex items-center justify-between border-b-2 border-b-[#F6FCFF]">
                                                        <div className="flex w-[85%] items-center space-x-4">
                                                            <div
                                                                style={{
                                                                    backgroundImage: `url(${auth.user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}`})`,
                                                                }}
                                                                className="relative h-12 w-12 rounded-full bg-cover bg-center bg-no-repeat ring-2 ring-gray-100"
                                                            >
                                                                <span
                                                                    className={`absolute top-0 right-0 block h-3 w-3 rounded-full bg-[#F9CD33] ring-2 ring-white`}
                                                                    aria-label="Online status"
                                                                ></span>
                                                            </div>
                                                            {/* Format Toolbar */}
                                                            <FormatToolbar
                                                                text={text}
                                                                setText={setText}
                                                                inputRef={textInputRef}
                                                            />
                                                            {/* Content */}
                                                            <div className="flex w-full flex-col">
                                                                <div className="relative w-full cursor-pointer">
                                                                    <textarea
                                                                        ref={textInputRef}
                                                                        value={text}
                                                                        onChange={handleTyping}
                                                                        onKeyDown={(e) => {
                                                                            // Desktop: Enter sends, Shift+Enter adds new line
                                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                                e.preventDefault();
                                                                                sendMessage();
                                                                            }
                                                                            // Shift+Enter allows default behavior (new line)
                                                                        }}
                                                                        placeholder="Write your message ..."
                                                                        rows={1}
                                                                        className="no-scrollbar max-h-32 min-h-[44px] w-full resize-none overflow-y-auto rounded-3xl border-none bg-gray-700 px-4 py-3 text-xs text-deepBlack placeholder:text-xs placeholder:text-white focus:border-0 focus:ring-0 focus:ring-primary/30 focus:outline-none lg:bg-[#F6FCFF] lg:px-4 lg:py-3 lg:pl-5 lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-0"
                                                                        style={{
                                                                            height: 'auto',
                                                                            minHeight: '44px',
                                                                        }}
                                                                        onInput={(e) => {
                                                                            // Auto-resize textarea
                                                                            const target = e.target as HTMLTextAreaElement;
                                                                            target.style.height = 'auto';
                                                                            target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="relative flex items-center space-x-3">
                                                            {/* File Upload Button with Menu */}
                                                            <div className="upload-menu-container relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                                                                    disabled={uploadingFile || isRecording}
                                                                    className="flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-[#F6FCFF] whitespace-nowrap shadow-[-2px_-2px_2px_-3px_rgba(0,0,0,0.1),-2px_5px_2px_-3px_rgba(0,0,0,0.1)] disabled:opacity-50"
                                                                >
                                                                    <div className="relative h-6 w-6">
                                                                        <img src={images.file} className="absolute object-contain" alt="" />
                                                                    </div>
                                                                </button>

                                                                {/* Upload Menu Dropdown */}
                                                                {showUploadMenu && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 1, y: 70 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                                                        className="ring-opacity-5 absolute right-0 bottom-12 z-20 w-48 rounded-lg bg-darkBlue py-10 text-white shadow-2xl ring-1 ring-darkBlue"
                                                                    >
                                                                        <div className="flex flex-col justify-center pl-9">
                                                                            <button
                                                                                onClick={startRecording}
                                                                                disabled={
                                                                                    microphonePermission === 'denied' ||
                                                                                    microphonePermission === 'unsupported'
                                                                                }
                                                                                className={`flex items-center py-2 text-sm transition-colors ${microphonePermission === 'denied' ||
                                                                                    microphonePermission === 'unsupported'
                                                                                    ? 'cursor-not-allowed text-gray-400'
                                                                                    : microphonePermission === 'default'
                                                                                        ? 'cursor-pointer'
                                                                                        : 'hover:bg-darkBlue/70'
                                                                                    }`}
                                                                            >
                                                                                <div
                                                                                    className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-transparent ${microphonePermission === 'denied' ||
                                                                                        microphonePermission === 'unsupported'
                                                                                        ? ''
                                                                                        : ''
                                                                                        }`}
                                                                                >
                                                                                    {microphonePermission === 'denied' ? (
                                                                                        <svg
                                                                                            className="h-5 w-5 text-gray-400"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            viewBox="0 0 24 24"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                strokeWidth={2}
                                                                                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-2.5-2.5m0 0L12 15l-2.5 2.5m7-4.5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                                            />
                                                                                        </svg>
                                                                                    ) : (
                                                                                        <img src={images.mic} alt="" />
                                                                                    )}
                                                                                </div>
                                                                                <span
                                                                                    className={`text-left text-xs font-light ${microphonePermission === 'denied' ||
                                                                                        microphonePermission === 'unsupported'
                                                                                        ? ''
                                                                                        : 'text-white'
                                                                                        }`}
                                                                                >
                                                                                    {microphonePermission === 'denied'
                                                                                        ? 'Microphone Blocked'
                                                                                        : microphonePermission === 'unsupported'
                                                                                            ? 'Microphone Unavailable'
                                                                                            : microphonePermission === 'default'
                                                                                                ? 'Click to Enable Microphone'
                                                                                                : 'Audio'}
                                                                                </span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    fileInputRef.current?.click();
                                                                                    setShowUploadMenu(false);
                                                                                }}
                                                                                className="flex items-center py-2 text-sm text-white transition-colors"
                                                                            >
                                                                                <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-transparent">
                                                                                    <img src={images.doc} alt="" />
                                                                                </div>
                                                                                <span className="text-xs font-light">Document</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    imageInputRef.current?.click();
                                                                                    setShowUploadMenu(false);
                                                                                }}
                                                                                className="flex items-center py-2 text-sm text-white transition-colors"
                                                                            >
                                                                                <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full">
                                                                                    <img src={images.album} alt="" />
                                                                                </div>
                                                                                <span className="text-xs font-light">Photos</span>
                                                                            </button>
                                                                        </div>
                                                                        <div className="mt-5 border-t pt-4 pl-9">
                                                                            <button
                                                                                onClick={() => setShowUploadMenu(!showUploadMenu)}
                                                                                className="flex items-center gap-y-2"
                                                                            >
                                                                                <div className="mr-1 flex h-6 w-6 items-center justify-center rounded-full">
                                                                                    <img src={images.close} alt="" />
                                                                                </div>
                                                                                <span className="ml-2 text-xs font-light"> Close </span>
                                                                            </button>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </div>

                                                            {/* Hidden File Inputs */}
                                                            <input
                                                                ref={imageInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                className="hidden"
                                                            />
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
                                                                onChange={handleDocumentUpload}
                                                                className="hidden"
                                                            />

                                                            {/* Send Button */}
                                                            <button
                                                                type="submit"
                                                                disabled={uploadingFile || isRecording}
                                                                className="flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-darkBlue whitespace-nowrap shadow-[-2px_-2px_6px_-3px_rgba(0,0,0,0.1),-2px_5px_6px_-3px_rgba(0,0,0,0.1)] disabled:opacity-50"
                                                            >
                                                                <div className="relative h-6 w-6">
                                                                    <img src={images.messageArrowUp} className="absolute object-contain" alt="" />
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* NO active Message User body */}
                                            <div className="mx-6 no-scrollbar flex h-full items-center justify-center">
                                                <div className="mx-auto w-full max-w-md">
                                                    <div className="mb-5 flex w-full items-center justify-center">
                                                        <div className="relative h-[150px] w-[150px]">
                                                            <img src={images.noMessage} className="absolute object-contain" alt="" />
                                                        </div>
                                                    </div>

                                                    <div className="px-12 text-center text-deepBlack">
                                                        <h4 className="text-lg font-bold">No conversation selected</h4>
                                                        <p className="text-xs">
                                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/*-------------------------=========================================================================================---------
                                ==================================================-- Mobile Mesage Chat  Mobile View Mesage  Individual Chat Layout===================================== -----------*/}

                                {showMobileChatView && selectedConversation && otherUser && (
                                    <div className="bg-deepBlack lg:hidden">
                                        {/* Show User Header Bar */}

                                        <div className="sticky top-0 z-[3] bg-deepBlack px-6 pt-8 pb-5">
                                            {/* Header Top Bar */}
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    {/* Back Button */}
                                                    <button
                                                        key="left-btn"
                                                        onClick={() => {
                                                            setSelectedConversation(null);
                                                            setMessages([]);
                                                            window.location.href = '/message/single';
                                                        }}
                                                        className="flex items-center justify-center rounded-full transition-colors"
                                                        aria-label="Back to messages"
                                                    >
                                                        <div className="relative h-2 w-2">
                                                            <img src={images.leftarrow} className="absolute object-contain" alt="back" />
                                                        </div>
                                                    </button>

                                                    {/* Avatar + Name */}
                                                    <div className="flex items-center gap-6">
                                                        {/* Avatar + Name → Sheet Trigger */}
                                                        <Sheet>
                                                            <SheetTrigger asChild>
                                                                <div className="flex cursor-pointer items-center space-x-3">
                                                                    {/* Avatar */}
                                                                    <div className="relative">
                                                                        <div
                                                                            style={{
                                                                                backgroundImage: `url(${otherUser.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}`})`,
                                                                            }}
                                                                            className="h-[50px] w-[50px] rounded-full bg-cover bg-top bg-no-repeat"
                                                                        />
                                                                        <span
                                                                            className={`absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white ${onlineUsers.has(otherUser.id) ? 'bg-green-500' : 'bg-gray-400'}`}
                                                                        />
                                                                    </div>

                                                                    {/* User Info */}
                                                                    <div className="flx flex-col text-secondaryWhite">
                                                                        <p className="text-xs font-semibold tracking-wide  whitespace-nowrap">

                                                                            {formatText(`${otherUser.name}`, 10)}
                                                                        </p>
                                                                        <p className="text-[10px] italic">
                                                                            {onlineUsers.has(otherUser.id) ? 'Active now' : 'Offline'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </SheetTrigger>

                                                            <MobileProfileSidebar
                                                                imageSrc={
                                                                    otherUser.profile_picture ||
                                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}`
                                                                }
                                                                name={otherUser.name}
                                                                title={otherUser.title || ''}
                                                                bio={otherUser.bio || ''}
                                                                experience={otherUser.experience || ''}
                                                                interest={otherUser.interest || ''}
                                                                industry={otherUser.industry || ''}
                                                                companyStage={otherUser.company_stage || ''}
                                                                keyStrength={otherUser.key_strength || ''}
                                                                topGoal={otherUser.top_goal || ''}
                                                                baseLocation={otherUser.base_location || ''}
                                                                operatesIn={otherUser.operates_in || ''}
                                                                reviews={otherUser.reviews || '0'}
                                                                brnMemberSince={
                                                                    otherUser.created_at
                                                                        ? new Date(otherUser.created_at).getFullYear().toString()
                                                                        : ''
                                                                }
                                                                responseRate={otherUser.response_rate || ''}
                                                                successfulDealsRate={otherUser.successful_deals_rate || ''}
                                                            />
                                                        </Sheet>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex  gap-2">
                                                    {/* Search Button */}
                                                    <button
                                                        key="search-btn"
                                                        onClick={toggleSingleMessageSearch}
                                                        className="flex items-center justify-center rounded-full transition-colors"
                                                    >
                                                        <div className="relative h-6 w-6">
                                                            <img src={images.aiSearch} className="absolute object-contain" alt="search" />
                                                        </div>
                                                    </button>

                                                    {/* toggle message edit */}
                                                    <button
                                                        key="open-list-btn"
                                                        onClick={toggleAllMessageEdit}
                                                        className="flex items-center justify-center rounded-full transition-colors"
                                                    >
                                                        <TbLineDashed className="h-7 w-7 text-white" />
                                                    </button>
                                                </div>

                                                {/* Animated Slide-In Message Edit Panel */}

                                                {/* Animated Slide-In Message Edit Panel */}
                                                <AnimatePresence>
                                                    {isAllMessageEditOpen && (
                                                        <motion.div
                                                            ref={allmessagesEditRef}
                                                            key="message-edit-panel"
                                                            variants={slideEditContainerRightVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="exit"
                                                            className="absolute top-20 -right-2 z-[2]"
                                                        >
                                                            <MessageActionsDropdown
                                                                onDelete={() => {
                                                                    enterMessageSelectionMode();
                                                                    toggleAllMessageEdit();
                                                                }}
                                                                onClear={() => {
                                                                    if (selectedConversation) {
                                                                        handleClearChat();
                                                                    }
                                                                    toggleAllMessageEdit();
                                                                }}
                                                                onBlock={() => {
                                                                    if (selectedConversation) {
                                                                        handleBlockUser(selectedConversation.encrypted_id);
                                                                    }
                                                                    toggleAllMessageEdit();
                                                                }}
                                                                onMore={() => { }}
                                                                onActivity={() => {
                                                                    if (selectedConversation) {
                                                                        handleArchiveChat(selectedConversation.encrypted_id);
                                                                    }
                                                                    toggleAllMessageEdit();
                                                                }}
                                                                onFlag={() => {
                                                                    // Report user functionality
                                                                    if (selectedConversation && otherUser) {
                                                                        toast.success(`Report submitted for ${otherUser.name}`);
                                                                    }
                                                                    toggleAllMessageEdit();
                                                                }}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Slide-Fade Animated Search Bar */}
                                            <AnimatePresence>
                                                {isSingleMessageRefOpen && (
                                                    <motion.div
                                                        ref={singleMessageRef}
                                                        key="single-search-bar"
                                                        variants={singleSlideFadeVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        className="relative z-[2] mt-3 flex w-full flex-col items-center justify-center"
                                                    >
                                                        <div className="flex w-[70vw] max-w-[380px] rounded-full shadow-[1px_3px_10px_-1px_rgba(0,0,0,0.8),-2px_3px_10px_-1px_rgba(0,0,0,0.8)]">
                                                            <div className="relative w-full">
                                                                <input
                                                                    type="text"
                                                                    autoFocus
                                                                    placeholder="Search"
                                                                    className="w-full rounded-full border-0 bg-gray-700 px-4 py-2 text-white placeholder:text-sm placeholder:text-white placeholder:italic focus:ring focus:ring-primary/30 focus:outline-none lg:bg-[#27E6A729] lg:px-4 lg:py-2 lg:pl-5 lg:placeholder:text-primary/80 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* User Chat Section */}
                                        <>
                                            <div
                                                style={{
                                                    backgroundImage: `url(${images.uibg})`,
                                                }}
                                                className="z-[0] h-screen w-full flex-col overflow-hidden overflow-y-auto rounded-t-3xl"
                                            >
                                                {selectedConversation ? (
                                                    /* MESSAGING SCREEN LAYOUT - Using Real Messages */
                                                    <div className="overflow-y-auto rounded-t-3xl">
                                                        {/* Messages Container */}
                                                        <div className="relative no-scrollbar h-[70vh] flex-1 overflow-y-auto px-4 py-5 pb-32">
                                                            {/* Date divider */}
                                                            <div className="mb-6 flex items-center pt-10 pb-6 text-xs text-gray-400">
                                                                <div className="flex-grow border-t border-[#F6FCFF]"></div>
                                                                <span className="mx-4 text-center text-[#C7C6C6]">Today</span>
                                                                <div className="flex-grow border-t border-[#F6FCFF]"></div>
                                                            </div>

                                                            {/* Loading State */}
                                                            {isMessagesLoading ? (
                                                                <div className="w-full space-y-4 py-4">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <SkeletonMessage key={i} isOwner={Math.random() > 0.5} />
                                                                    ))}
                                                                </div>
                                                            ) : messages.length > 0 ? (
                                                                /* Real Messages */
                                                                messages.map((message) => {
                                                                    const isOwner = message.user.id === auth.user.id;
                                                                    const isBeingSwiped = swipingMessageId === message.id;

                                                                    return isOwner ? (
                                                                        /* Sent Messages (Owner) */
                                                                        <div
                                                                            key={message.id}
                                                                            className="mb-6 flex flex-col justify-end"
                                                                            style={{
                                                                                transform: isBeingSwiped
                                                                                    ? `translateX(${swipeOffset}px)`
                                                                                    : 'translateX(0)',
                                                                                transition: isBeingSwiped ? 'none' : 'transform 0.2s ease-out',
                                                                            }}
                                                                            onTouchStart={(e) => {
                                                                                handleMessageLongPressStart(e, message, true);
                                                                                handleSwipeStart(e, message.id);
                                                                            }}
                                                                            onTouchMove={handleSwipeMove}
                                                                            onTouchEnd={() => {
                                                                                handleMessageLongPressEnd();
                                                                                handleSwipeEnd(message);
                                                                            }}
                                                                            onTouchCancel={() => {
                                                                                handleMessageLongPressEnd();
                                                                                setSwipeOffset(0);
                                                                                setSwipingMessageId(null);
                                                                            }}
                                                                        >
                                                                            {/* Swipe reply indicator */}
                                                                            {isBeingSwiped && swipeOffset > 20 && (
                                                                                <div
                                                                                    className="absolute left-0 flex items-center justify-center"
                                                                                    style={{
                                                                                        opacity: Math.min(swipeOffset / swipeThreshold, 1),
                                                                                        transform: `translateX(-${40 - Math.min(swipeOffset * 0.3, 20)}px)`,
                                                                                    }}
                                                                                >
                                                                                    <div
                                                                                        className={`flex h-8 w-8 items-center justify-center  rounded-full ${swipeOffset >= swipeThreshold ? 'bg-[#6E3ACE]' : 'bg-gray-300'}`}
                                                                                    >
                                                                                        <svg
                                                                                            className="h-4 w-4 text-white"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            viewBox="0 0 24 24"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                strokeWidth={2}
                                                                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                                                                            />
                                                                                        </svg>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <div className="mb-3">
                                                                                <div className="flex flex-col items-end space-y-1">
                                                                                    {/* Voice Note */}
                                                                                    {message.file_type === 'voice' &&
                                                                                        message.file_url &&
                                                                                        !message.is_deleted && (
                                                                                            <div className="mb-2">
                                                                                                <VoiceNotePlayer
                                                                                                    messageId={message.id}
                                                                                                    audioUrl={message.file_url}
                                                                                                    isOwner={true}
                                                                                                />
                                                                                            </div>
                                                                                        )}

                                                                                    {/* Image */}
                                                                                    {message.file_type === 'image' &&
                                                                                        message.file_url &&
                                                                                        !message.is_deleted && (
                                                                                            <div
                                                                                                className="mb-2 max-w-[200px] cursor-pointer overflow-hidden rounded-xl"
                                                                                                onClick={() => {
                                                                                                    setSelectedImage(message.file_url!);
                                                                                                    setShowImageModal(true);
                                                                                                }}
                                                                                            >
                                                                                                <img
                                                                                                    src={message.file_url}
                                                                                                    alt={message.file_name || 'Image'}
                                                                                                    className="h-auto w-full rounded-xl"
                                                                                                />
                                                                                            </div>
                                                                                        )}

                                                                                    {/* Document */}
                                                                                    {message.file_type === 'document' &&
                                                                                        message.file_url &&
                                                                                        !message.is_deleted && (
                                                                                            <div
                                                                                                className="mb-2 flex max-w-[200px] cursor-pointer items-center gap-2 rounded-xl bg-[#6E3ACE] p-3"
                                                                                                onClick={() => {
                                                                                                    setSelectedDocument({
                                                                                                        url: message.file_url!,
                                                                                                        name: message.file_name || 'Document',
                                                                                                        type:
                                                                                                            message.file_name?.split('.').pop() ||
                                                                                                            'unknown',
                                                                                                    });
                                                                                                    setShowDocumentModal(true);
                                                                                                }}
                                                                                            >
                                                                                                <span className="text-xl">
                                                                                                    {getDocumentIcon(message.file_name || '')}
                                                                                                </span>
                                                                                                <span className="truncate text-xs text-white">
                                                                                                    {message.file_name}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}

                                                                                    {/* Text Message */}
                                                                                    {message.body && !message.file_type && (
                                                                                        <div
                                                                                            className={`relative max-w-xs rounded-4xl rounded-br-none px-4 py-2 shadow-[1px_3px_6px_-1px_rgba(0,0,0,0.3),-2px_3px_6px_-1px_rgba(0,0,0,0.3)] ${message.is_deleted
                                                                                                ? 'bg-gray-400 text-gray-600 italic'
                                                                                                : 'bg-[#6E3ACE]'
                                                                                                }`}
                                                                                        >
                                                                                            {/* Reply reference */}
                                                                                            {message.reply_to && (
                                                                                                <div className="mb-2 rounded-lg border-l-2 border-white/50 bg-white/10 px-2 py-1">
                                                                                                    <p className="text-[9px] font-semibold text-white/70">
                                                                                                        ↩{' '}
                                                                                                        {message.reply_to.user.id === auth.user.id
                                                                                                            ? 'You'
                                                                                                            : message.reply_to.user.name}
                                                                                                    </p>
                                                                                                    <p className="truncate text-[10px] text-white/60">
                                                                                                        {message.reply_to.body}
                                                                                                    </p>
                                                                                                </div>
                                                                                            )}

                                                                                            <div className="max-w-xs pt-2 pr-6 text-white">
                                                                                                <p className="text-[10px] leading-relaxed tracking-wide ">
                                                                                                    <FormattedMessage text={message.body} isLight={true} />
                                                                                                </p>
                                                                                            </div>

                                                                                            {/* Read Receipt */}
                                                                                            <div className="absolute right-2 bottom-1 flex items-center text-[10px]">
                                                                                                <InlineReadReceipt
                                                                                                    key={`mobile-${message.id}-${readReceiptTrigger}`}
                                                                                                    message={message}
                                                                                                    isOwner={true}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <p className="mt-2 mr-10 text-right text-[10px] text-[#8A8A8A]">
                                                                                    {formatTime(message.created_at)}
                                                                                    {message.edited_at && !message.is_deleted && ' • Edited'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        /* Received Messages (Other User) */
                                                                        <div
                                                                            key={message.id}
                                                                            className="relative mb-5 flex justify-start"
                                                                            style={{
                                                                                transform:
                                                                                    swipingMessageId === message.id
                                                                                        ? `translateX(${swipeOffset}px)`
                                                                                        : 'translateX(0)',
                                                                                transition:
                                                                                    swipingMessageId === message.id
                                                                                        ? 'none'
                                                                                        : 'transform 0.2s ease-out',
                                                                            }}
                                                                            onTouchStart={(e) => {
                                                                                handleMessageLongPressStart(e, message, false);
                                                                                handleSwipeStart(e, message.id);
                                                                            }}
                                                                            onTouchMove={handleSwipeMove}
                                                                            onTouchEnd={() => {
                                                                                handleMessageLongPressEnd();
                                                                                handleSwipeEnd(message);
                                                                            }}
                                                                            onTouchCancel={() => {
                                                                                handleMessageLongPressEnd();
                                                                                setSwipeOffset(0);
                                                                                setSwipingMessageId(null);
                                                                            }}
                                                                        >
                                                                            {/* Swipe reply indicator */}
                                                                            {swipingMessageId === message.id && swipeOffset > 20 && (
                                                                                <div
                                                                                    className="absolute top-1/2 -left-10 flex -translate-y-1/2 items-center justify-center"
                                                                                    style={{
                                                                                        opacity: Math.min(swipeOffset / swipeThreshold, 1),
                                                                                    }}
                                                                                >
                                                                                    <div
                                                                                        className={`flex h-8 w-8 items-center justify-center  rounded-full ${swipeOffset >= swipeThreshold ? 'bg-[#6E3ACE]' : 'bg-gray-300'}`}
                                                                                    >
                                                                                        <svg
                                                                                            className="h-4 w-4 text-white"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            viewBox="0 0 24 24"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                strokeWidth={2}
                                                                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                                                                            />
                                                                                        </svg>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex max-w-md items-start gap-2">
                                                                                <div className="relative">
                                                                                    <div
                                                                                        style={{
                                                                                            backgroundImage: `url(${message.user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.user.name)}`})`,
                                                                                        }}
                                                                                        className="h-[35px] w-[35px] rounded-full bg-cover bg-top bg-no-repeat"
                                                                                    ></div>
                                                                                    <span
                                                                                        className={`absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white ${onlineUsers.has(message.user.id) ? 'bg-green-500' : 'bg-gray-400'}`}
                                                                                        aria-label="Online"
                                                                                    ></span>
                                                                                </div>

                                                                                <div>
                                                                                    {/* Voice Note */}
                                                                                    {message.file_type === 'voice' &&
                                                                                        message.file_url &&
                                                                                        !message.is_deleted && (
                                                                                            <div className="mb-3">
                                                                                                <VoiceNotePlayer
                                                                                                    messageId={message.id}
                                                                                                    audioUrl={message.file_url}
                                                                                                    isOwner={false}
                                                                                                />
                                                                                                <p className="mt-2 ml-5 text-left text-[10px] text-[#8A8A8A]">
                                                                                                    {formatTime(message.created_at)}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

                                                                                    {/* Image */}
                                                                                    {message.file_type === 'image' &&
                                                                                        message.file_url &&
                                                                                        !message.is_deleted && (
                                                                                            <div className="mb-3">
                                                                                                <div
                                                                                                    className="max-w-[200px] cursor-pointer overflow-hidden rounded-xl border-2 border-[#A47AF0]"
                                                                                                    onClick={() => {
                                                                                                        setSelectedImage(message.file_url!);
                                                                                                        setShowImageModal(true);
                                                                                                    }}
                                                                                                >
                                                                                                    <img
                                                                                                        src={message.file_url}
                                                                                                        alt={message.file_name || 'Image'}
                                                                                                        className="h-auto w-full"
                                                                                                    />
                                                                                                </div>
                                                                                                <p className="mt-2 ml-5 text-left text-[9px] text-[#8A8A8A]">
                                                                                                    {formatTime(message.created_at)}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

                                                                                    {/* Document */}
                                                                                    {message.file_type === 'document' &&
                                                                                        message.file_url &&
                                                                                        !message.is_deleted && (
                                                                                            <div className="mb-3">
                                                                                                <div
                                                                                                    className="flex max-w-[200px] cursor-pointer items-center gap-2 rounded-xl border-2 border-[#A47AF0] bg-white p-3"
                                                                                                    onClick={() => {
                                                                                                        setSelectedDocument({
                                                                                                            url: message.file_url!,
                                                                                                            name: message.file_name || 'Document',
                                                                                                            type:
                                                                                                                message.file_name?.split('.').pop() ||
                                                                                                                'unknown',
                                                                                                        });
                                                                                                        setShowDocumentModal(true);
                                                                                                    }}
                                                                                                >
                                                                                                    <span className="text-xl">
                                                                                                        {getDocumentIcon(message.file_name || '')}
                                                                                                    </span>
                                                                                                    <span className="truncate text-xs text-gray-700">
                                                                                                        {message.file_name}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <p className="mt-2 ml-5 text-left text-[10px] text-[#8A8A8A]">
                                                                                                    {formatTime(message.created_at)}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

                                                                                    {/* Text Message */}
                                                                                    {message.body && !message.file_type && (
                                                                                        <div className="mb-3 w-[60vw] max-w-[320px]">
                                                                                            <div
                                                                                                className={`relative rounded-2xl rounded-bl-none border-2 border-[#A47AF0] bg-white p-2 shadow-lg ${message.is_deleted ? 'bg-gray-200' : ''}`}
                                                                                            >
                                                                                                {/* Reply reference */}
                                                                                                {message.reply_to && (
                                                                                                    <div className="mb-2 rounded-lg border-l-2 border-[#A47AF0] bg-[#A47AF0]/10 px-2 py-1">
                                                                                                        <p className="text-[9px] font-semibold text-[#A47AF0]">
                                                                                                            ↩{' '}
                                                                                                            {message.reply_to.user.id === auth.user.id
                                                                                                                ? 'You'
                                                                                                                : message.reply_to.user.name}
                                                                                                        </p>
                                                                                                        <p className="truncate text-[10px] text-gray-500">
                                                                                                            {message.reply_to.body}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                )}

                                                                                                <p
                                                                                                    className={`text-[11px] leading-relaxed ${message.is_deleted ? 'text-gray-500 italic' : 'text-deepBlack'}`}
                                                                                                >
                                                                                                    <FormattedMessage text={message.body} isLight={false} />
                                                                                                </p>
                                                                                            </div>
                                                                                            <p className="mt-2 ml-5 text-left text-[10px] text-[#8A8A8A]">
                                                                                                {formatTime(message.created_at)}
                                                                                                {message.edited_at &&
                                                                                                    !message.is_deleted &&
                                                                                                    ' • Edited'}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                /* No Messages */
                                                                <div className="flex h-full flex-col items-center justify-center py-20">
                                                                    <div className="relative mb-4 h-[100px] w-[100px]">
                                                                        <img src={images.noMessage} className="absolute object-contain" alt="" />
                                                                    </div>
                                                                    <p className="text-center text-sm text-gray-500">No messages yet</p>
                                                                    <p className="mt-1 text-center text-xs text-gray-400">Start the conversation!</p>
                                                                </div>
                                                            )}

                                                            {/* Scroll anchor */}
                                                            <div ref={messagesEndRef}></div>

                                                            {/* Typing Indicator */}
                                                            {typingUsers.length > 0 && (
                                                                <div className="mb-3 flex items-center justify-center">
                                                                    <p className="text-center text-[10px] text-deepBlue italic">
                                                                        {typingUsers.map((u) => u.name).join(', ')}{' '}
                                                                        {typingUsers.length === 1 ? 'is' : 'are'} typing...
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Input Field */}
                                                        <motion.div
                                                            animate={{ y: isSlideOpen ? -5 : 0 }}
                                                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                                                            className="fixed bottom-0 flex w-full flex-col items-center justify-center"
                                                        >
                                                            {/* Reply Preview for Mobile */}
                                                            {replyingTo && (
                                                                <div
                                                                    style={{ backgroundImage: `url(${images.uibg})` }}
                                                                    className="w-full bg-cover bg-center bg-no-repeat px-4 pt-3"
                                                                >
                                                                    <div className="flex items-center justify-between rounded-xl border-l-4 border-[#6E28D9] bg-white/90 p-3 shadow-sm">
                                                                        <div className="flex-1 overflow-hidden">
                                                                            <p className="text-[10px] font-semibold text-[#6E28D9]">
                                                                                Replying to{' '}
                                                                                {replyingTo.user.id === auth.user.id
                                                                                    ? 'yourself'
                                                                                    : replyingTo.user.name}
                                                                            </p>
                                                                            <p className="truncate text-[10px] text-gray-600">
                                                                                {replyingTo.file_type ? `[${replyingTo.file_type}]` : replyingTo.body}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={cancelReply}
                                                                            className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 active:bg-gray-400"
                                                                        >
                                                                            <svg
                                                                                className="h-3 w-3"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M6 18L18 6M6 6l12 12"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Input area container */}
                                                            <form
                                                                onSubmit={sendMessage}
                                                                style={{
                                                                    backgroundImage: `url(${images.uibg})`,
                                                                }}
                                                                className="w-full bg-cover bg-center bg-no-repeat"
                                                            >
                                                                <div className="flex w-full items-center gap-x-2 py-3">
                                                                    {/* LEFT SIDE - Avatar + Input */}
                                                                    <div className="flex flex-1 items-center gap-x-1 pl-4">
                                                                        <div className="relative">
                                                                            <div
                                                                                style={{
                                                                                    backgroundImage: `url(${auth.user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}`})`,
                                                                                }}
                                                                                className="h-[45px] w-[45px] rounded-full bg-cover bg-top bg-no-repeat"
                                                                            ></div>
                                                                            <span
                                                                                className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"
                                                                                aria-label="Online"
                                                                            ></span>
                                                                        </div>
                                                                        {/* Format Toolbar for Mobile */}
                                                                        <FormatToolbar
                                                                            text={text}
                                                                            setText={setText}
                                                                            inputRef={mobileTextInputRef}
                                                                        />
                                                                        <div className="w-full">
                                                                            <textarea
                                                                                ref={mobileTextInputRef}
                                                                                placeholder="Write your message..."
                                                                                value={text}
                                                                                onChange={handleTyping}
                                                                                rows={1}
                                                                                className="max-h-24 min-h-[50px] w-full flex-1 resize-none overflow-y-auto rounded-2xl border border-gray-200 bg-[#F6FCFF] px-4 py-3 text-sm text-[10px] text-gray-700 shadow-[-2px_-2px_6px_-3px_rgba(0,0,0,0.4),-2px_5px_6px_-3px_rgba(0,0,0,0.4)] outline-none placeholder:text-[10.5px] placeholder:text-deepBlue placeholder:italic focus:ring-0"
                                                                                style={{
                                                                                    height: 'auto',
                                                                                    minHeight: '50px',
                                                                                }}
                                                                                onInput={(e) => {
                                                                                    // Auto-resize textarea
                                                                                    const target = e.target as HTMLTextAreaElement;
                                                                                    target.style.height = 'auto';
                                                                                    target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* RIGHT SIDE - Buttons */}
                                                                    <div className="flex items-end justify-end gap-3 pr-4">
                                                                        {/* Attachment toggle button */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={toggleSlide}
                                                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6FCFF] shadow-[-2px_-2px_6px_-3px_rgba(0,0,0,0.4),-2px_5px_6px_-3px_rgba(0,0,0,0.4)]"
                                                                        >
                                                                            <div className="relative h-6 w-6">
                                                                                <img src={images.file} className="absolute object-contain" alt="" />
                                                                            </div>
                                                                        </button>

                                                                        {/* Send button */}
                                                                        <button
                                                                            type="submit"
                                                                            className="flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-darkBlue whitespace-nowrap shadow-[-2px_-2px_6px_-3px_rgba(0,0,0,0.4),-2px_5px_6px_-3px_rgba(0,0,0,0.4)]"
                                                                        >
                                                                            <div className="relative h-6 w-6">
                                                                                <img
                                                                                    src={images.messageArrowUp}
                                                                                    className="absolute object-contain"
                                                                                    alt=""
                                                                                />
                                                                            </div>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </form>

                                                            {/* SLIDE-UP PANEL */}
                                                            <AnimatePresence>
                                                                {isSlideOpen && (
                                                                    <motion.div
                                                                        ref={slideRef}
                                                                        key="slide-up-panel"
                                                                        variants={slideUpVariants}
                                                                        initial="hidden"
                                                                        animate="visible"
                                                                        exit="exit"
                                                                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                                                                        className="flex w-full flex-col items-center justify-center overflow-hidden rounded-t-3xl bg-[#C6C9CD] py-5 shadow-xl"
                                                                    >
                                                                        <div className="flex w-[50vw] max-w-[500px] flex-col items-center gap-5">
                                                                            {/* Attachment Options */}
                                                                            <div className="flex gap-5">
                                                                                <div className="flex flex-col items-center">
                                                                                    <button
                                                                                        key="search-btn"
                                                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6FCFF] shadow-[-2px_-2px_4px_-3px_rgba(0,0,0,0.2),-2px_5px_4px_-3px_rgba(0,0,0,0.2)] transition-colors"
                                                                                    >
                                                                                        <div className="relative h-6 w-6">
                                                                                            <img
                                                                                                src={images.micaudio}
                                                                                                className="absolute object-contain"
                                                                                                alt="search"
                                                                                            />
                                                                                        </div>
                                                                                    </button>
                                                                                    <p className="mt-1 text-center text-[12px] text-[#193E47]">
                                                                                        Audio
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex flex-col items-center">
                                                                                    <button
                                                                                        key="search-btn"
                                                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6FCFF] shadow-[-2px_-2px_4px_-3px_rgba(0,0,0,0.2),-2px_5px_4px_-3px_rgba(0,0,0,0.2)] transition-colors"
                                                                                    >
                                                                                        <div className="relative h-6 w-6">
                                                                                            <img
                                                                                                src={images.fileview}
                                                                                                className="absolute object-contain"
                                                                                                alt="search"
                                                                                            />
                                                                                        </div>
                                                                                    </button>
                                                                                    <p className="mt-1 text-center text-[12px] text-[#193E47]">
                                                                                        Document
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex flex-col items-center">
                                                                                    <button
                                                                                        key="search-btn"
                                                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6FCFF] shadow-[-2px_-2px_4px_-3px_rgba(0,0,0,0.2),-2px_5px_4px_-3px_rgba(0,0,0,0.2)] transition-colors"
                                                                                    >
                                                                                        <div className="relative h-6 w-6">
                                                                                            <img
                                                                                                src={images.albumview}
                                                                                                className="absolute object-contain"
                                                                                                alt="search"
                                                                                            />
                                                                                        </div>
                                                                                    </button>
                                                                                    <p className="mt-1 text-center text-[12px] text-[#193E47]">
                                                                                        Photos
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex flex-col items-center">
                                                                                    <button
                                                                                        key="search-btn"
                                                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6FCFF] shadow-[-2px_-2px_4px_-3px_rgba(0,0,0,0.2),-2px_5px_4px_-3px_rgba(0,0,0,0.2)] transition-colors"
                                                                                    >
                                                                                        <div className="relative h-6 w-6">
                                                                                            <img
                                                                                                src={images.callView}
                                                                                                className="absolute object-contain"
                                                                                                alt="search"
                                                                                            />
                                                                                        </div>
                                                                                    </button>
                                                                                    <p className="mt-1 text-center text-[12px] text-[#193E47]">
                                                                                        Call
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="h-1.5 w-[30vw] max-w-[200px] rounded-full bg-black" />
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* NO active Message User body */}
                                                        <div className="mx-6 no-scrollbar flex h-full items-center justify-center">
                                                            <div className="mx-auto w-full max-w-md">
                                                                <div className="mb-5 flex w-full items-center justify-center">
                                                                    <div className="relative h-[150px] w-[150px]">
                                                                        <img src={images.noMessage} className="absolute object-contain" alt="" />
                                                                    </div>
                                                                </div>

                                                                <div className="px-12 text-center text-deepBlack">
                                                                    <h4 className="text-lg font-bold">No conversation selected</h4>
                                                                    <p className="text-xs">
                                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>

                                        {/* Mobile Message Actions Dropdown (Long-press on message) */}
                                        <AnimatePresence>
                                            {longPressMessage && (
                                                <>
                                                    {/* Backdrop */}
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="fixed inset-0 z-[200] bg-black/40"
                                                        onClick={closeMessageActionsDropdown}
                                                    />
                                                    {/* Actions Menu */}
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                        className="fixed z-[201] w-52 rounded-2xl bg-white py-2 shadow-2xl"
                                                        style={{
                                                            top: `${Math.min(longPressMessage.position.top, window.innerHeight - 350)}px`,
                                                            left: `${longPressMessage.position.left}px`,
                                                        }}
                                                    >
                                                        {/* Message Preview */}
                                                        <div className="mb-1 border-b border-gray-100 px-3 pb-2">
                                                            <p className="truncate text-[10px] text-gray-400">
                                                                {longPressMessage.message.body?.substring(0, 40) || '[Media]'}
                                                                {longPressMessage.message.body && longPressMessage.message.body.length > 40
                                                                    ? '...'
                                                                    : ''}
                                                            </p>
                                                        </div>

                                                        {/* Reply */}
                                                        <button
                                                            onClick={() => {
                                                                handleReplyTo(longPressMessage.message);
                                                                closeMessageActionsDropdown();
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-[11px] text-darkBlue hover:bg-gray-50 active:bg-gray-100"
                                                        >
                                                            <svg
                                                                className="h-5 w-5 text-[#6E3ACE]"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                                                />
                                                            </svg>
                                                            <span>Reply</span>
                                                        </button>

                                                        {/* Copy */}
                                                        {longPressMessage.message.body && !longPressMessage.message.is_deleted && (
                                                            <button
                                                                onClick={() => {
                                                                    copyMessageText(longPressMessage.message.body);
                                                                    closeMessageActionsDropdown();
                                                                }}
                                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-[11px] text-darkBlue hover:bg-gray-50 active:bg-gray-100"
                                                            >
                                                                <svg
                                                                    className="h-5 w-5 text-gray-500"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                                <span>Copy</span>
                                                            </button>
                                                        )}

                                                        {/* Edit (only for own messages) */}
                                                        {longPressMessage.isOwner &&
                                                            longPressMessage.message.body &&
                                                            !longPressMessage.message.is_deleted && (
                                                                <button
                                                                    onClick={() => {
                                                                        startEditing(longPressMessage.message);
                                                                        closeMessageActionsDropdown();
                                                                    }}
                                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-[11px] text-darkBlue hover:bg-gray-50 active:bg-gray-100"
                                                                >
                                                                    <svg
                                                                        className="h-5 w-5 text-blue-500"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                        />
                                                                    </svg>
                                                                    <span>Edit</span>
                                                                </button>
                                                            )}

                                                        {/* Star */}
                                                        <button
                                                            onClick={() => {
                                                                toggleStarMessage(longPressMessage.message.id);
                                                                closeMessageActionsDropdown();
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-[11px] text-darkBlue hover:bg-gray-50 active:bg-gray-100"
                                                        >
                                                            <svg
                                                                className={`h-5 w-5 ${starredMessageIds.has(longPressMessage.message.id) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'}`}
                                                                fill={starredMessageIds.has(longPressMessage.message.id) ? 'currentColor' : 'none'}
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                                />
                                                            </svg>
                                                            <span>{starredMessageIds.has(longPressMessage.message.id) ? 'Unstar' : 'Star'}</span>
                                                        </button>

                                                        {/* Pin */}
                                                        <button
                                                            onClick={() => {
                                                                togglePinMessage(longPressMessage.message.id);
                                                                closeMessageActionsDropdown();
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-[11px] text-darkBlue hover:bg-gray-50 active:bg-gray-100"
                                                        >
                                                            <svg
                                                                className={`h-5 w-5 ${pinnedMessageIds.has(longPressMessage.message.id) ? 'text-[#6E3ACE]' : 'text-gray-500'}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                                                />
                                                            </svg>
                                                            <span>{pinnedMessageIds.has(longPressMessage.message.id) ? 'Unpin' : 'Pin'}</span>
                                                        </button>

                                                        <div className="my-1 h-[1px] bg-gray-100" />

                                                        {/* Delete (only for own messages or if not deleted) */}
                                                        {!longPressMessage.message.is_deleted && (
                                                            <button
                                                                onClick={() => {
                                                                    deleteMessage(longPressMessage.message.id);
                                                                    closeMessageActionsDropdown();
                                                                }}
                                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-[11px] text-red-500 hover:bg-red-50 active:bg-red-100"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                                <span>Delete</span>
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/*-------------------------=========================================================================================---------
                                ==================================================-- Mobile Mesage Chat  Mobile View Mesage  Individual Chat Layout END ===================================== -----------*/}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Message(props: Omit<Props, 'auth'>) {
    const { user } = useAuth();
    if (!user) return null;
    return <MessageContent {...props} auth={{ user }} />;
}

export default Message;
