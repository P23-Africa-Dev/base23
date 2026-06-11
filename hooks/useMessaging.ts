'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { ChatUser, INITIAL_USERS } from '@/components/cards/messages/chat-user-card';
import { useClickOutsideToggle } from '@/hooks/use-click-outside-toggle';
import type { ConversationListItem, Message, Props, SelectedConversation, User } from '@/types/messages';
import { ChatNotifications } from '@/utils/notifications';
import { DUMMY_CONNECTIONS, DEFAULT_DUMMY_CONVERSATIONS, createInitialMessagesMap } from '@/constants/message-dummy-data';
import { getOtherParticipant } from '@/utils/message-helpers';

export function useMessaging({
    conversation: initialConversation,
    conversations = [],
    messages: initialMessages = [],
    activeConversationRawIds = [],
    auth,
}: Props) {
    // ─── Messages map (keyed by encrypted_id) ────────────────────────────────
    const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() =>
        createInitialMessagesMap(auth.user),
    );

    // ─── Conversations list ───────────────────────────────────────────────────
    const [conversationsList, setConversationsList] = useState<ConversationListItem[]>(() => {
        const base = conversations && conversations.length > 0 ? conversations : DEFAULT_DUMMY_CONVERSATIONS(auth.user);
        return [...base].sort((a, b) => {
            const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return bTime - aTime;
        });
    });

    // ─── Selected conversation ────────────────────────────────────────────────
    const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(() => {
        if (initialConversation) {
            return {
                id: initialConversation.id ?? null,
                encrypted_id: initialConversation.encrypted_id,
                participants: initialConversation.participants ?? [],
                title: initialConversation.title ?? null,
            };
        }
        return null;
    });

    // ─── Chat state ───────────────────────────────────────────────────────────
    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [text, setText] = useState('');
    const [typingUsers, setTypingUsers] = useState<User[]>([]);
    const [participants, setParticipants] = useState<User[]>(initialConversation?.participants || []);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const [currentTime, setCurrentTime] = useState(new Date());
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesRef = useRef<Message[]>(messages);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // ─── Mobile layout control ────────────────────────────────────────────────
    const [hasParams, setHasParams] = useState(false);
    const [isSingleMessageRoute, setIsSingleMessageRoute] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasParams(window.location.search.length > 0);
        setIsSingleMessageRoute(window.location.pathname === '/message/single');
    }, []);

    const showMobileChatView = isSingleMessageRoute && hasParams;
    const showMobileListView = isSingleMessageRoute && !hasParams;

    const toggleUserSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const [isRemoveMode, setIsRemoveMode] = useState(false);

    const handleDeleteSelected = () => {
        setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
        setSelectedIds([]);
        setIsRemoveMode(false);
    };

    // ─── Message action states ────────────────────────────────────────────────
    const [starredMessageIds, setStarredMessageIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const saved = localStorage.getItem('starredMessages');
        if (saved) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            try { setStarredMessageIds(new Set(JSON.parse(saved))); } catch { /* noop */ }
        }
    }, []);

    const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<number>>(new Set());
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    // ─── Profile / dropdown state ─────────────────────────────────────────────
    const [showProfileOverlay, setShowProfileOverlay] = useState(false);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    // ─── Search state ─────────────────────────────────────────────────────────
    const [conversationSearchQuery, setConversationSearchQuery] = useState('');
    const [messageSearchQuery, setMessageSearchQuery] = useState('');
    const [showMessageSearch, setShowMessageSearch] = useState(false);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [searchingMessages, setSearchingMessages] = useState(false);
    const [searchingConversations, setSearchingConversations] = useState(false);
    const [backendSearchedConversations, setBackendSearchedConversations] = useState<ConversationListItem[]>([]);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ─── Permission state ─────────────────────────────────────────────────────
    const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
    const [microphonePermission, setMicrophonePermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
    const [showPermissionBanner, setShowPermissionBanner] = useState(false);

    // ─── Image / document modal state ─────────────────────────────────────────
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewFileType, setPreviewFileType] = useState<'image' | 'document' | 'voice' | null>(null);
    const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string; type: string } | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    // ─── Loading state ────────────────────────────────────────────────────────
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isConversationsLoading, setIsConversationsLoading] = useState(true);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [bgLoaded, setBgLoaded] = useState(false);

    // ─── Header / selection state ─────────────────────────────────────────────
    const [headerMode, setHeaderMode] = useState<'default' | 'selection'>('default');
    const [selectedChats, setSelectedChats] = useState<number[]>([]);

    // ─── Read receipt state ───────────────────────────────────────────────────
    const [lastReadReceiptCheck, setLastReadReceiptCheck] = useState<number>(Date.now());
    const readReceiptPollingRef = useRef<NodeJS.Timeout | null>(null);
    const [readReceiptTrigger, setReadReceiptTrigger] = useState(0);

    // ─── Audio / recording state ──────────────────────────────────────────────
    const [playingAudio, setPlayingAudio] = useState<number | null>(null);

    // ─── Profile action loading states ────────────────────────────────────────
    const [removingFromList, setRemovingFromList] = useState(false);
    const [clearingChat, setClearingChat] = useState(false);
    const [markingUnread, setMarkingUnread] = useState(false);
    const [blockingUser, setBlockingUser] = useState(false);
    const [archivingChat, setArchivingChat] = useState(false);

    // ─── Message selection mode ───────────────────────────────────────────────
    const [isMessageSelectionMode, setIsMessageSelectionMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<Set<number>>(new Set());
    const [deletingSelectedMessages, setDeletingSelectedMessages] = useState(false);

    // ─── Connected users modal ────────────────────────────────────────────────
    const [showConnectedUsersModal, setShowConnectedUsersModal] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
    const [connectedUsersLoading, setConnectedUsersLoading] = useState(false);
    const [connectedUsersSearchQuery, setConnectedUsersSearchQuery] = useState('');

    // ─── Long-press / multi-select state (mobile) ─────────────────────────────
    const [longPressChat, setLongPressChat] = useState<{ encryptedId: string; chatId: number; position: { top: number; left: number } } | null>(null);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const longPressDuration = 500;
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);

    // ─── Mobile message long-press ────────────────────────────────────────────
    const [longPressMessage, setLongPressMessage] = useState<{ message: Message; position: { top: number; left: number }; isOwner: boolean } | null>(null);
    const messageLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const messageLongPressDuration = 400;

    // ─── Swipe-to-reply state ─────────────────────────────────────────────────
    const [swipingMessageId, setSwipingMessageId] = useState<number | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const swipeStartX = useRef<number>(0);
    const swipeThreshold = 80;

    // ─── Typing refs ──────────────────────────────────────────────────────────
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const typingTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
    const lastTypingTime = useRef<number>(0);

    // ─── Active conversations ─────────────────────────────────────────────────
    const [activeConversationRawIdsState, setActiveConversationRawIds] = useState<number[]>(() => {
        if (activeConversationRawIds && Array.isArray(activeConversationRawIds) && activeConversationRawIds.length > 0) {
            return activeConversationRawIds;
        }
        return [];
    });
    const [activeConversationsLoaded, setActiveConversationsLoaded] = useState(() =>
        activeConversationRawIds && Array.isArray(activeConversationRawIds) && activeConversationRawIds.length > 0,
    );

    // ─── Hover / dropdown state ───────────────────────────────────────────────
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState<string | null>(null);

    // ─── UI toggles ───────────────────────────────────────────────────────────
    const { ref: selectChatRef, isOpen: isSelectChatOpen, toggle: toggleSelectChat, close: closeSelectChat } = useClickOutsideToggle(false);
    const { ref: searchRef, isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useClickOutsideToggle(false);
    const { ref: singleMessageRef, isOpen: isSingleMessageRefOpen, toggle: toggleSingleMessageSearch } = useClickOutsideToggle(false);
    const { ref: slideRef, isOpen: isSlideOpen, toggle: toggleSlide } = useClickOutsideToggle(false);
    const { ref: allmessagesEditRef, isOpen: isAllMessageEditOpen, toggle: toggleAllMessageEdit } = useClickOutsideToggle(false);
    const { ref: messageEditRef, isOpen: isMessageEditOpen, toggle: toggleMessageEdit } = useClickOutsideToggle(false);
    const { ref: audioMessageEditRef, isOpen: isAudioMessageEditOpen, toggle: toggleAudioMessageEdit } = useClickOutsideToggle(false);
    const { ref: outgoingMessageEditRef, isOpen: isOutgoingMessageEditOpen, toggle: toggleOutgoinMessageEdit } = useClickOutsideToggle(false);
    const { ref: desktopSideProfileRef, isOpen: isDesktopSideProfileOpen, toggle: toggleDesktopSideProfile } = useClickOutsideToggle(false);
    const headerRef = useRef<HTMLDivElement>(null);

    // ─── Inline edit hover state ──────────────────────────────────────────────
    const [isHoveredEditMessage, setIsHoveredEditMessage] = useState(false);
    const [isHoveredSentDesktopEditMessage, setIsHoveredSentDekstopEditMessage] = useState(false);
    const [isHoveredIncomeDesktopEditMessage, setIsHoveredIncometDekstopEditMessage] = useState(false);
    const [isHoveredAudioEditMessage, setIsHoveredAudioEditMessage] = useState(false);
    const [isHoveredOutgoingEditMessage, setIsHoveredOutgoingEditMessage] = useState(false);

    // ─── Derived state ────────────────────────────────────────────────────────
    const otherUser = selectedConversation ? getOtherParticipant(selectedConversation.participants, auth.user.id) : null;

    const isConversationSelected = useCallback(
        (chatEncryptedId: string) => selectedConversation?.encrypted_id === chatEncryptedId,
        [selectedConversation?.encrypted_id],
    );

    const filteredConversations = useMemo(() => {
        if (!conversationSearchQuery.trim()) return conversationsList;
        if (backendSearchedConversations.length > 0) return backendSearchedConversations;
        const query = conversationSearchQuery.toLowerCase();
        return conversationsList.filter((chat) => {
            const other = getOtherParticipant(chat.participants, auth.user.id);
            return other?.name.toLowerCase().includes(query) || chat.last_message?.body.toLowerCase().includes(query);
        });
    }, [conversationsList, conversationSearchQuery, backendSearchedConversations, auth.user.id]);

    const filteredChats = useMemo(() => {
        const base = filteredConversations;
        switch (currentTab) {
            case 'archive': return base.filter((c) => c);
            case 'active': return base.filter((c) => activeConversationRawIdsState.includes(c.id));
            case 'starred': return base.filter((c) => c.last_message);
            default: return base;
        }
    }, [filteredConversations, currentTab, activeConversationRawIdsState]);

    const activeConversationUsers = useMemo(() => {
        return conversationsList
            .map((chat) => {
                const other = getOtherParticipant(chat.participants, auth.user.id);
                return other
                    ? { id: other.id, name: other.name, imageSrc: other.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || 'U')}`, encrypted_id: chat.encrypted_id }
                    : null;
            })
            .filter((u): u is { id: number; name: string; imageSrc: string; encrypted_id: string } => u !== null);
    }, [conversationsList, auth.user.id]);

    const starredMessages = useMemo(() => messages.filter((m) => starredMessageIds.has(m.id) && !m.is_deleted), [messages, starredMessageIds]);

    const filteredConnectedUsers = useMemo(() => {
        const list = Array.isArray(connectedUsers) ? connectedUsers : [];
        if (!connectedUsersSearchQuery.trim()) return list;
        const q = connectedUsersSearchQuery.toLowerCase();
        return list.filter((u) => u.name?.toLowerCase().includes(q) || u.title?.toLowerCase().includes(q) || u.industry?.toLowerCase().includes(q));
    }, [connectedUsers, connectedUsersSearchQuery]);

    const resetToDefault = useCallback(() => {
        closeSearch();
        closeSelectChat();
        setIsRemoveMode(false);
    }, [closeSearch, closeSelectChat]);

    // ─── Effects ──────────────────────────────────────────────────────────────

    // Close upload menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showUploadMenu && !(event.target as Element).closest('.upload-menu-container')) {
                setShowUploadMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUploadMenu]);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => { if (previewFileUrl) URL.revokeObjectURL(previewFileUrl); };
    }, [previewFileUrl]);

    // Cleanup search timeout on unmount
    useEffect(() => {
        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, []);

    // Initialize notifications and permissions
    useEffect(() => {
        ChatNotifications.initialize();
        if (ChatNotifications.isSupported()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect
            setNotificationPermission(ChatNotifications.getPermissionStatus() as any);
        } else {
            setNotificationPermission('unsupported');
        }
        if (navigator.mediaDevices) {
            navigator.permissions?.query({ name: 'microphone' as PermissionName }).then((result) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setMicrophonePermission(result.state as any);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result.onchange = () => setMicrophonePermission(result.state as any);
            }).catch(() => setMicrophonePermission('default'));
        } else {
            setMicrophonePermission('unsupported');
        }
        setShowPermissionBanner(ChatNotifications.needsPermission());
    }, []);

    // Monitor permission banner visibility
    useEffect(() => {
        const needsNotifications = ChatNotifications.needsPermission();
        const needsMic = microphonePermission === 'default';
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (showPermissionBanner && !needsNotifications && !needsMic) setShowPermissionBanner(false);
        else if (!showPermissionBanner && (needsNotifications || needsMic)) setShowPermissionBanner(true);
    }, [notificationPermission, microphonePermission, showPermissionBanner]);

    // Initial load skeleton
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoading(false);
            setIsConversationsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    // Load bg image
    useEffect(() => {
        // bg loaded state triggers after image loads (handled in page.tsx)
    }, []);

    // Load active conversations from server
    useEffect(() => {
        axios.get('/api/active-conversations', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((res) => {
                setActiveConversationRawIds([...(res.data.active_conversation_raw_ids || [])]);
                setActiveConversationsLoaded(true);
            })
            .catch(() => { /* noop */ });
    }, []);

    // Check Echo is ready
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (win.Echo) { setEchoReady(true); return; }
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (win.Echo) { setEchoReady(true); clearInterval(interval); }
            else if (attempts >= 50) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Sync conversations list when prop changes
    useEffect(() => {
        if (!conversations || conversations.length === 0) return;
        const sorted = [...conversations].sort((a, b) => {
            const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return bTime - aTime;
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConversationsList(sorted);
        if (selectedConversation) {
            const cur = sorted.find((c) => c.encrypted_id === selectedConversation.encrypted_id);
            if (cur) {
                const needsUpdate = cur.participants?.length !== selectedConversation.participants?.length || cur.title !== selectedConversation.title;
                if (needsUpdate) {
                    setSelectedConversation((prev) => ({ ...prev!, participants: cur.participants ?? prev!.participants, title: cur.title ?? prev!.title }));
                }
            }
        }
    }, [conversations]);

    // Restore selected conversation from initial prop
    useEffect(() => {
        if (initialConversation && !selectedConversation) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedConversation({ id: initialConversation.id ?? null, encrypted_id: initialConversation.encrypted_id, participants: initialConversation.participants ?? [], title: initialConversation.title ?? null });
        }
    }, [initialConversation]);

    // Restore conversation from URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const conversationParam = urlParams.get('conversation');
        const startConvoWithIdStr = urlParams.get('start_conversation_with_id');

        if (startConvoWithIdStr) {
            const userId = parseInt(startConvoWithIdStr, 10);
            const matchedUser = DUMMY_CONNECTIONS.find((u) => u.id === userId);
            if (matchedUser) {
                const existingConv = conversationsList.find((c) => {
                    const other = getOtherParticipant(c.participants, auth.user.id);
                    return other?.id === userId;
                });
                if (existingConv) {
                    handleSelectConversation(existingConv.encrypted_id);
                } else {
                    const newEncId = `conv_local_${matchedUser.id}_${Date.now()}`;
                    const newConvItem: ConversationListItem = {
                        id: userId + 1000,
                        encrypted_id: newEncId,
                        participants: [auth.user, matchedUser],
                        unread_count: 0,
                        last_message: { body: 'Conversation started', created_at: new Date().toISOString(), is_read: true },
                    };
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setConversationsList((prev) => [newConvItem, ...prev]);
                    setMessagesMap((prev) => ({ ...prev, [newEncId]: [] }));
                    setSelectedConversation({ id: newConvItem.id, encrypted_id: newEncId, participants: newConvItem.participants, title: newConvItem.title ?? null });
                    setMessages([]);
                    setParticipants(newConvItem.participants);
                    window.history.replaceState(null, '', `/message/single?conversation=${newEncId}`);
                }
            }
        } else if (conversationParam) {
            const existingConv = conversationsList.find((c) => c.encrypted_id === conversationParam);
            if (existingConv) {
                if (!selectedConversation || selectedConversation.encrypted_id !== conversationParam) {
                    setSelectedConversation({ id: existingConv.id ?? null, encrypted_id: conversationParam, participants: existingConv.participants ?? [], title: existingConv.title ?? null });
                    setMessages(messagesMap[conversationParam] || []);
                    setParticipants(existingConv.participants ?? []);
                }
            } else {
                const matchedDefault = DEFAULT_DUMMY_CONVERSATIONS(auth.user).find((c) => c.encrypted_id === conversationParam);
                if (matchedDefault) {
                    setConversationsList((prev) => prev.find((c) => c.encrypted_id === conversationParam) ? prev : [matchedDefault, ...prev]);
                    setSelectedConversation({ id: matchedDefault.id ?? null, encrypted_id: conversationParam, participants: matchedDefault.participants, title: matchedDefault.title ?? null });
                    setMessages(messagesMap[conversationParam] || []);
                    setParticipants(matchedDefault.participants);
                }
            }
        }
    }, [conversationsList.length, auth.user?.id]);

    // Auto-mark read on select and window focus
    useEffect(() => {
        if (!selectedConversation?.encrypted_id) return;
        const markRead = async () => {
            try {
                await axios.post(`/messages/${selectedConversation.encrypted_id}/mark-read`);
                setTimeout(() => setReadReceiptTrigger((p) => p + 1), 100);
            } catch { /* noop */ }
        };
        markRead();
        window.addEventListener('focus', markRead);
        return () => window.removeEventListener('focus', markRead);
    }, [selectedConversation?.encrypted_id]);

    // Read receipt polling
    useEffect(() => {
        if (!selectedConversation?.encrypted_id || !auth?.user?.id) return;

        const pollReadReceipts = async () => {
            try {
                const res = await axios.get(`/api/conversation/${selectedConversation.encrypted_id}/read-status`, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    timeout: 3000,
                });
                const readStatusUpdates = res.data?.read_status || {};
                setMessages((prev) => {
                    let hasUpdates = false;
                    const updated = prev.map((m) => {
                        const msgReadStatus = readStatusUpdates[m.id];
                        if (msgReadStatus) {
                            const current = m.read_status || [];
                            if (msgReadStatus.length !== current.length) { hasUpdates = true; return { ...m, read_status: msgReadStatus }; }
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const currentIds = new Set(current.map((r: any) => r.user_id));
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const hasNew = msgReadStatus.some((r: any) => !currentIds.has(r.user_id));
                            if (hasNew) { hasUpdates = true; return { ...m, read_status: msgReadStatus }; }
                        }
                        return m;
                    });
                    if (hasUpdates) setReadReceiptTrigger((p) => p + 1);
                    return updated;
                });
                setLastReadReceiptCheck(Date.now());
            } catch { /* noop */ }
        };

        const initialTimeout = setTimeout(pollReadReceipts, 1000);
        readReceiptPollingRef.current = setInterval(pollReadReceipts, 3000);
        return () => {
            clearTimeout(initialTimeout);
            if (readReceiptPollingRef.current) { clearInterval(readReceiptPollingRef.current); readReceiptPollingRef.current = null; }
        };
    }, [selectedConversation?.encrypted_id, auth?.user?.id, messages.length]);

    // Global online presence tracking (non-active conversations)
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (!win.Echo || conversationsList.length === 0) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channels: any[] = [];
        conversationsList.forEach((conv) => {
            if (conv.id && conv.id !== selectedConversation?.id) {
                const chan = win.Echo.join(`conversation.${conv.id}`)
                    .here((users: User[]) => setOnlineUsers((prev) => { const s = new Set(prev); users.forEach((u) => s.add(u.id)); return s; }))
                    .joining((user: User) => setOnlineUsers((prev) => new Set([...prev, user.id])))
                    .leaving((user: User) => setOnlineUsers((prev) => { const s = new Set(prev); s.delete(user.id); return s; }));
                channels.push({ id: conv.id, channel: chan });
            }
        });
        return () => channels.forEach(({ id }) => { try { win.Echo?.leave(`conversation.${id}`); } catch { /* noop */ } });
    }, [conversationsList, selectedConversation?.id]);

    // Sync messagesRef
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    // Scroll to bottom on new messages
    const prevMessagesCountRef = useRef(messages.length);
    useEffect(() => {
        const container = messagesEndRef.current?.parentElement;
        if (!container) return;
        const isNew = messages.length > prevMessagesCountRef.current;
        prevMessagesCountRef.current = messages.length;
        if (!isNew) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom || messages.length === 1) {
            requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
        }
    }, [messages.length]);

    // Real-time Echo channel
    useEffect(() => {
        if (!selectedConversation?.id || !auth?.user?.id || !echoReady) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        const conversationId = selectedConversation.id;

        if (channelRef.current?.chan) {
            try { win.Echo.leave(`conversation.${channelRef.current.currentConversationId}`); } catch { /* noop */ }
            channelRef.current = null;
        }
        if (!win.Echo) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let chan: any;
        try {
            chan = win.Echo.join(`conversation.${conversationId}`)
                .here((users: User[]) => { setParticipants(users); setOnlineUsers(new Set(users.map((u) => u.id))); setEchoConnected(true); setConnectionRetries(0); })
                .joining((user: User) => { setParticipants((p) => [...p, user]); setOnlineUsers((prev) => new Set([...prev, user.id])); })
                .leaving((user: User) => { setParticipants((p) => p.filter((u) => u.id !== user.id)); setOnlineUsers((prev) => { const s = new Set(prev); s.delete(user.id); return s; }); })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .error((error: any) => {
                    setEchoConnected(false);
                    setConnectionRetries((p) => p + 1);
                    if (error.type === 'AuthError') toast.error('Failed to connect to chat. Please refresh the page.');
                    else toast.error('Connection issue. Retrying...');
                })
                .listen('MessageSent', (event: { message: Message }) => {
                    const incoming = event.message;
                    if (!incoming || !incoming.user) return;
                    setMessages((prev) => {
                        if (prev.find((m) => m.id === incoming.id && !m.isOptimistic)) return prev;
                        const optimistic = prev.find((m) => m.isOptimistic && m.body === incoming.body && m.user.id === incoming.user.id);
                        const filtered = prev.filter((m) => !(m.isOptimistic && m.body === incoming.body && m.user.id === incoming.user.id));
                        const withReply = { ...incoming, reply_to: incoming.reply_to || optimistic?.reply_to || null };
                        if (incoming.user.id !== auth.user.id) {
                            ChatNotifications.showMessageNotification(incoming.user.name, incoming.body, incoming.user.profile_picture);
                            if (selectedConversation?.encrypted_id) {
                                setTimeout(async () => {
                                    try { await axios.post(`/messages/${selectedConversation.encrypted_id}/mark-read`); setTimeout(() => setReadReceiptTrigger((p) => p + 1), 100); } catch { /* noop */ }
                                }, 200);
                            }
                            setConversationsList((prevConvs) => {
                                const updated = prevConvs.map((conv) =>
                                    conv.id === selectedConversation?.id
                                        ? { ...conv, last_message: { body: incoming.body, created_at: incoming.created_at, is_read: false }, unread_count: (conv.unread_count || 0) + 1 }
                                        : conv,
                                );
                                return updated.sort((a, b) => { const aT = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0; const bT = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0; return bT - aT; });
                            });
                        }
                        return [...filtered, withReply];
                    });
                })
                .listen('MessageEdited', (event: { message: Message }) => {
                    const edited = event.message;
                    if (!edited) return;
                    setMessages((prev) => prev.map((m) => m.id === edited.id ? { ...m, body: edited.body, edited_at: edited.edited_at } : m));
                })
                .listen('MessageDeleted', (event: { messageId: number }) => {
                    const { messageId } = event;
                    if (!messageId) return;
                    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, is_deleted: true, body: 'This message was deleted' } : m));
                })
                .listen('MessageRead', (event: { message_id: number; user: User; read_at: string; conversation_id?: number }) => {
                    const { message_id, user, read_at, conversation_id } = event;
                    if (!message_id || !user) return;
                    if (conversation_id && conversation_id !== selectedConversation?.id) return;
                    if (user.id === auth.user.id) return;
                    const found = messagesRef.current.find((m) => m.id === message_id);
                    if (!found) return;
                    setMessages((prev) => prev.map((m) => {
                        if (m.id !== message_id) return m;
                        const existing = m.read_status || [];
                        const alreadyRead = existing.find((r) => r.user_id === user.id);
                        return alreadyRead
                            ? { ...m, read_status: existing.map((r) => r.user_id === user.id ? { ...r, read_at } : r) }
                            : { ...m, read_status: [...existing, { user_id: user.id, user_name: user.name, read_at }] };
                    }));
                    setReadReceiptTrigger((p) => p + 1);
                })
                .listenForWhisper('typing', (payload: { user: User }) => {
                    if (payload?.user?.id && payload.user.id !== auth.user.id) {
                        const existing = typingTimeouts.current.get(payload.user.id);
                        if (existing) clearTimeout(existing);
                        setTypingUsers((prev) => prev.find((u) => u.id === payload.user.id) ? prev : [...prev, payload.user]);
                        const timeout = setTimeout(() => { setTypingUsers((prev) => prev.filter((u) => u.id !== payload.user.id)); typingTimeouts.current.delete(payload.user.id); }, 3000);
                        typingTimeouts.current.set(payload.user.id, timeout);
                    }
                });
        } catch { return; }

        channelRef.current = { chan, currentConversationId: conversationId };

        setTimeout(async () => {
            try { await axios.post(`/messages/${selectedConversation.encrypted_id}/mark-read`, {}, { timeout: 5000 }); } catch { /* noop */ }
        }, 100);
        setTimeout(() => setReadReceiptTrigger((p) => p + 1), 500);

        return () => {
            try {
                typingTimeouts.current.forEach((t) => clearTimeout(t));
                typingTimeouts.current.clear();
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                setTypingUsers([]);
                win.Echo?.leave(`conversation.${conversationId}`);
                channelRef.current = null;
            } catch { /* noop */ }
        };
    }, [selectedConversation?.id, auth?.user?.id, echoReady]);

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    // Global click handler for header reset
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (!headerRef.current?.contains(e.target as Node)) resetToDefault();
        };
        document.addEventListener('mousedown', handleGlobalClick);
        return () => document.removeEventListener('mousedown', handleGlobalClick);
    }, [resetToDefault]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    async function handleSelectConversation(encryptedId: string) {
        if (!encryptedId || encryptedId.trim() === '') { toast.error('Invalid conversation selected'); return; }
        const target = conversationsList.find((c) => c.encrypted_id === encryptedId);
        if (target) {
            setSelectedConversation({ id: target.id ?? null, encrypted_id: encryptedId, participants: target.participants ?? [], title: target.title ?? null });
            setMessages(messagesMap[encryptedId] || []);
            setParticipants(target.participants ?? []);
            setConversationsList((prev) => prev.map((c) => c.encrypted_id === encryptedId ? { ...c, unread_count: 0 } : c));
        }
        const isMobile = window.innerWidth < 1024;
        const newUrl = `/message/single?conversation=${encryptedId}`;
        window.history.replaceState(null, '', newUrl);
        if (isMobile) setHasParams(true);

        axios.get(`/messages/${encryptedId}`, { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, timeout: 5000 })
            .then((res) => {
                const payload = res.data?.props ? res.data.props : res.data;
                const msgs = payload?.messages ?? [];
                if (msgs.length > 0) { setMessages(msgs); setMessagesMap((prev) => ({ ...prev, [encryptedId]: msgs })); }
            })
            .catch(() => { /* offline / mock mode */ });
    }

    const fetchConnectedUsers = useCallback(async () => {
        setConnectedUsersLoading(true);
        try {
            const res = await axios.get('/api/connections/list', { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
            const data = res.data;
            if (data?.connected && Array.isArray(data.connected)) setConnectedUsers(data.connected);
            else if (Array.isArray(data)) setConnectedUsers(data);
            else setConnectedUsers([]);
        } catch {
            setConnectedUsers(DUMMY_CONNECTIONS);
        } finally {
            setConnectedUsersLoading(false);
        }
    }, []);

    const openConnectedUsersModal = useCallback(() => {
        setShowConnectedUsersModal(true);
        setConnectedUsersSearchQuery('');
        fetchConnectedUsers();
    }, [fetchConnectedUsers]);

    const closeConnectedUsersModal = useCallback(() => {
        setShowConnectedUsersModal(false);
        setConnectedUsersSearchQuery('');
    }, []);

    const handleStartConversationWithUser = useCallback(async (userId: number) => {
        closeConnectedUsersModal();
        const loadingToast = toast.loading('Starting conversation...');
        axios.post('/messages/start', { user_id: userId, redirect_to: 'message/single' })
            .then((res) => { toast.dismiss(loadingToast); toast.success('Conversation started!'); window.location.href = res.data.redirect ?? '/message/single'; })
            .catch(() => {
                toast.dismiss(loadingToast);
                const matchedUser = DUMMY_CONNECTIONS.find((u) => u.id === userId);
                if (matchedUser) {
                    const newEncId = `conv_local_${matchedUser.id}_${Date.now()}`;
                    const newConvItem: ConversationListItem = { id: userId + 1000, encrypted_id: newEncId, participants: [auth.user, matchedUser], unread_count: 0, last_message: { body: 'Conversation started', created_at: new Date().toISOString(), is_read: true } };
                    setConversationsList((prev) => [newConvItem, ...prev]);
                    setMessagesMap((prev) => ({ ...prev, [newEncId]: [] }));
                    handleSelectConversation(newEncId);
                    toast.success('Conversation started locally!');
                } else {
                    toast.error('Failed to start conversation');
                }
            });
    }, [closeConnectedUsersModal, auth.user]);

    async function sendMessage(e?: React.FormEvent) {
        e?.preventDefault();
        if (!text.trim() || !selectedConversation) { if (!selectedConversation) toast.error('Please select a conversation first'); return; }
        const body = text.trim();
        const messageId = Date.now();
        const userMessage: Message = {
            id: messageId, body, user: { id: auth.user.id, name: auth.user.name, profile_picture: auth.user.profile_picture },
            created_at: new Date().toISOString(),
            reply_to: replyingTo ? { id: replyingTo.id, body: replyingTo.body, user: replyingTo.user } : null,
        };
        setText('');
        const savedReplyingTo = replyingTo;
        setReplyingTo(null);
        setMessages((m) => [...m, userMessage]);
        setMessagesMap((prev) => ({ ...prev, [selectedConversation.encrypted_id]: [...(prev[selectedConversation.encrypted_id] || []), userMessage] }));
        setConversationsList((prevConvs) => {
            const updated = prevConvs.map((conv) =>
                conv.encrypted_id === selectedConversation.encrypted_id
                    ? { ...conv, last_message: { body, created_at: new Date().toISOString(), is_read: true } }
                    : conv,
            );
            return updated.sort((a, b) => { const aT = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0; const bT = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0; return bT - aT; });
        });

        axios.post(`/messages/${selectedConversation.encrypted_id}/messages`, { body, reply_to_id: savedReplyingTo?.id || null }, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, timeout: 3000 })
            .catch(() => { /* offline / mock */ });

        // Simulate reply in demo mode
        const otherParticipant = getOtherParticipant(selectedConversation.participants, auth.user.id);
        if (otherParticipant) {
            setTimeout(() => setTypingUsers([otherParticipant]), 800);
            setTimeout(() => {
                setTypingUsers([]);
                const lowerBody = body.toLowerCase();
                let responseBody = "Thank you for the message. I will check this and get back to you.";
                if (lowerBody.includes("hello") || lowerBody.includes("hi")) responseBody = `Hi ${auth.user.name.split(' ')[0]}! Hope you are doing well. How can I help you today?`;
                else if (lowerBody.includes("call") || lowerBody.includes("meet") || lowerBody.includes("sync") || lowerBody.includes("schedule")) responseBody = "Sure, I'm open for a call. Thursday afternoon works best for me. Let me know what time suits you!";
                else if (lowerBody.includes("price") || lowerBody.includes("cost") || lowerBody.includes("rate")) responseBody = "I can share our standard rate sheet and packages. Let me send a PDF summary to your email.";
                else if (lowerBody.includes("fintech") || lowerBody.includes("payment") || lowerBody.includes("money")) responseBody = "Yes, fintech and payment integrations are our core focus. We support mobile money, card payments, and bank transfers across multiple countries.";
                else if (lowerBody.includes("thank")) responseBody = "You're very welcome! Let me know if there's anything else.";
                const replyMessage: Message = { id: Date.now() + 1, body: responseBody, user: otherParticipant, created_at: new Date().toISOString() };
                setMessages((m) => [...m, replyMessage]);
                setMessagesMap((prev) => ({ ...prev, [selectedConversation.encrypted_id]: [...(prev[selectedConversation.encrypted_id] || []), replyMessage] }));
                setConversationsList((prevConvs) => {
                    const updated = prevConvs.map((conv) =>
                        conv.encrypted_id === selectedConversation.encrypted_id
                            ? { ...conv, last_message: { body: responseBody, created_at: new Date().toISOString(), is_read: false } }
                            : conv,
                    );
                    return updated.sort((a, b) => { const aT = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0; const bT = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0; return bT - aT; });
                });
                toast(`New message from ${otherParticipant.name}`, { icon: '💬' });
            }, 2500);
        }
    }

    function handleTyping(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setText(e.target.value);
        const now = Date.now();
        if (now - lastTypingTime.current >= 1000) {
            try { if (channelRef.current?.chan?.whisper) { channelRef.current.chan.whisper('typing', { user: auth.user }); lastTypingTime.current = now; } } catch { /* noop */ }
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            const activeTag = document.activeElement?.tagName;
            if ((activeTag === 'INPUT' || activeTag === 'TEXTAREA') && e.target.value.trim()) {
                try { if (channelRef.current?.chan?.whisper) { channelRef.current.chan.whisper('typing', { user: auth.user }); lastTypingTime.current = Date.now(); } } catch { /* noop */ }
            }
        }, 2000);
    }

    function startEditing(message: Message) { setEditingMessageId(message.id); setEditText(message.body); setOpenMenuId(null); }
    function cancelEditing() { setEditingMessageId(null); setEditText(''); }

    async function saveEdit(messageId: number) {
        if (!editText.trim() || !selectedConversation) return;
        const newBody = editText.trim();
        try {
            await axios.patch(`/messages/${selectedConversation.encrypted_id}/messages/${messageId}`, { body: newBody });
            setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, body: newBody, edited_at: new Date().toISOString() } : m));
            cancelEditing();
            toast.success('Message edited successfully');
        } catch { toast.error('Failed to edit message. Please try again.'); }
    }

    async function deleteMessage(messageId: number) {
        if (!selectedConversation || !confirm('Are you sure you want to delete this message?')) return;
        try {
            await axios.delete(`/messages/${selectedConversation.encrypted_id}/messages/${messageId}`);
            setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, is_deleted: true, body: 'This message was deleted' } : m));
            setOpenMenuId(null);
            toast.success('Message deleted successfully');
        } catch { toast.error('Failed to delete message. Please try again.'); }
    }

    function enterMessageSelectionMode() { setIsMessageSelectionMode(true); setSelectedMessageIds(new Set()); }
    function exitMessageSelectionMode() { setIsMessageSelectionMode(false); setSelectedMessageIds(new Set()); }
    function toggleMessageSelection(messageId: number) { setSelectedMessageIds((prev) => { const s = new Set(prev); s.has(messageId) ? s.delete(messageId) : s.add(messageId); return s; }); }
    function selectAllMessages() {
        const ids = messages.filter((m) => !m.is_deleted && !m.isOptimistic).map((m) => m.id);
        setSelectedMessageIds(new Set(ids));
        if (ids.length === 0) toast.error('No messages to select.');
    }
    function deselectAllMessages() { setSelectedMessageIds(new Set()); }

    async function deleteSelectedMessages() {
        if (!selectedConversation || selectedMessageIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedMessageIds.size} message${selectedMessageIds.size > 1 ? 's' : ''} from your chat?`)) return;
        setDeletingSelectedMessages(true);
        try {
            const results = await Promise.allSettled(Array.from(selectedMessageIds).map((id) => axios.delete(`/messages/${selectedConversation.encrypted_id}/messages/${id}`)));
            const successIds: number[] = [];
            const failedIds: number[] = [];
            const idArray = Array.from(selectedMessageIds);
            results.forEach((r, i) => r.status === 'fulfilled' ? successIds.push(idArray[i]) : failedIds.push(idArray[i]));
            if (successIds.length > 0) setMessages((prev) => prev.filter((m) => !successIds.includes(m.id)));
            if (failedIds.length === 0) toast.success(`${successIds.length} message${successIds.length > 1 ? 's' : ''} deleted`);
            else if (successIds.length === 0) toast.error('Failed to delete messages. Please try again.');
            else toast.success(`${successIds.length} deleted. ${failedIds.length} failed.`);
            exitMessageSelectionMode();
        } catch { toast.error('Failed to delete messages. Please try again.'); } finally { setDeletingSelectedMessages(false); }
    }

    function toggleStarMessage(messageId: number) {
        setStarredMessageIds((prev) => {
            const s = new Set(prev);
            s.has(messageId) ? (s.delete(messageId), toast.success('Message unstarred')) : (s.add(messageId), toast.success('Message starred'));
            localStorage.setItem('starredMessages', JSON.stringify([...s]));
            return s;
        });
    }

    function togglePinMessage(messageId: number) {
        setPinnedMessageIds((prev) => {
            const s = new Set(prev);
            s.has(messageId) ? (s.delete(messageId), toast.success('Message unpinned')) : (s.add(messageId), toast.success('Message pinned'));
            return s;
        });
    }

    async function copyMessageText(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Message copied to clipboard');
        } catch {
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            toast.success('Message copied to clipboard');
        }
    }

    function handleReplyTo(message: Message) {
        setReplyingTo(message);
        const input = document.querySelector('input[placeholder*="Type"]') as HTMLInputElement;
        if (input) input.focus();
    }
    function cancelReply() { setReplyingTo(null); }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('Image size must be less than 10MB'); return; }
        const url = URL.createObjectURL(file);
        setPreviewFile(file); setPreviewFileType('image'); setPreviewFileUrl(url); setShowPreviewModal(true);
        if (imageInputRef.current) imageInputRef.current.value = '';
    }

    async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;
        if (file.size > 50 * 1024 * 1024) { toast.error('Document size must be less than 50MB'); return; }
        setPreviewFile(file); setPreviewFileType('document'); setPreviewFileUrl('document-preview'); setShowPreviewModal(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function uploadFile(file: File, fileType: 'image' | 'document' | 'voice') {
        if (!selectedConversation) { toast.error('Please select a conversation first'); return; }
        setUploadingFile(true); setShowUploadMenu(false);
        const uploadId = Date.now();
        const optimistic: Message = {
            id: uploadId,
            body: fileType === 'image' ? '📷 Image' : fileType === 'voice' ? '🎤 Voice note' : '📄 ' + file.name,
            user: { id: auth.user.id, name: auth.user.name, profile_picture: auth.user.profile_picture },
            created_at: new Date().toISOString(),
            isOptimistic: true, file_type: fileType, file_name: file.name,
        };
        setMessages((m) => [...m, optimistic]);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('file_type', fileType);
            formData.append('body', fileType === 'image' ? '📷 Image' : fileType === 'voice' ? '🎤 Voice message' : `📄 ${file.name}`);
            await axios.post(`/messages/${selectedConversation.encrypted_id}/messages`, formData, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, timeout: 30000 });
            toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setMessages((m) => m.filter((msg) => msg.id !== uploadId));
            let errMsg = 'Failed to upload file. Please try again.';
            if (err.response?.status === 413) errMsg = 'File is too large.';
            else if (err.response?.status === 415) errMsg = 'File type not supported.';
            else if (err.response?.data?.message) errMsg = err.response.data.message;
            toast.error(errMsg);
        } finally { setUploadingFile(false); }
    }

    async function requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((t) => t.stop());
            setMicrophonePermission('granted');
            toast.success('Microphone access granted!');
        } catch {
            setMicrophonePermission('denied');
            toast.error('Microphone permission denied.');
        }
    }

    async function startRecording() {
        if (microphonePermission === 'denied') { toast.error('Microphone access is blocked. Please enable it in your browser settings.'); return; }
        if (microphonePermission === 'default') {
            await requestMicrophonePermission();
            setTimeout(async () => {
                try {
                    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                    if (status.state === 'granted') await beginRecording();
                } catch { await beginRecording(); }
            }, 500);
            return;
        }
        await beginRecording();
    }

    async function beginRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            setRecordingCancelled(false); recordingCancelledRef.current = false;
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                if (!recordingCancelledRef.current) {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    await uploadFile(new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' }), 'voice');
                } else { recordingCancelledRef.current = false; }
            };
            recorder.start();
            setMediaRecorder(recorder); setIsRecording(true); setRecordingTime(0); setShowUploadMenu(false);
            const timer = setInterval(() => { setRecordingTime((p) => { if (p >= 120) { stopRecording(); return p; } return p + 1; }); }, 1000);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (recorder as any).timer = timer;
        } catch (err) {
            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError') { setMicrophonePermission('denied'); toast.error('Microphone access denied.'); }
                else if (err.name === 'NotFoundError') toast.error('No microphone found.');
                else toast.error('Could not access microphone.');
            } else toast.error('Could not access microphone.');
        }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            recordingCancelledRef.current = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clearInterval((mediaRecorder as any).timer);
            mediaRecorder.stop(); setMediaRecorder(null); setIsRecording(false); setRecordingTime(0);
        }
    }

    function cancelRecording() {
        if (mediaRecorder && isRecording) {
            setRecordingCancelled(true); recordingCancelledRef.current = true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clearInterval((mediaRecorder as any).timer);
            mediaRecorder.stop(); setMediaRecorder(null); setIsRecording(false); setRecordingTime(0);
            toast.success('Recording cancelled');
        }
    }

    function formatRecordingTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    const debouncedSearchConversations = useCallback(async (query: string) => {
        if (!query.trim()) { setBackendSearchedConversations([]); setSearchingConversations(false); return; }
        try {
            setSearchingConversations(true);
            const res = await axios.get('/api/search/conversations', { params: { q: query }, headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
            setBackendSearchedConversations(res.data.conversations || []);
        } catch { setBackendSearchedConversations([]); } finally { setSearchingConversations(false); }
    }, []);

    const handleConversationSearch = useCallback((query: string) => {
        setConversationSearchQuery(query);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!query.trim()) { setBackendSearchedConversations([]); setSearchingConversations(false); return; }
        searchTimeoutRef.current = setTimeout(() => debouncedSearchConversations(query), 300);
    }, [debouncedSearchConversations]);

    const debouncedSearchMessages = useCallback(async (query: string) => {
        if (!selectedConversation) return;
        if (!query.trim()) { setFilteredMessages([]); setSearchingMessages(false); return; }
        try {
            setSearchingMessages(true);
            const res = await axios.get(`/api/search/messages/${selectedConversation.encrypted_id}`, { params: { q: query }, headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
            setFilteredMessages(res.data.messages || []);
        } catch {
            setFilteredMessages(messages.filter((m) => !m.is_deleted && m.body.toLowerCase().includes(query.toLowerCase())));
        } finally { setSearchingMessages(false); }
    }, [selectedConversation, messages]);

    function handleMessageSearch(query: string) {
        setMessageSearchQuery(query);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!query.trim()) { setFilteredMessages([]); setSearchingMessages(false); return; }
        searchTimeoutRef.current = setTimeout(() => debouncedSearchMessages(query), 300);
    }

    function toggleMessageSearch() { setShowMessageSearch((p) => !p); if (showMessageSearch) { setMessageSearchQuery(''); setFilteredMessages([]); } }
    function clearMessageSearch() { setMessageSearchQuery(''); setFilteredMessages([]); setShowMessageSearch(false); }

    async function requestNotificationPermission() {
        try {
            const granted = await ChatNotifications.requestPermission();
            setNotificationPermission(granted ? 'granted' : 'denied');
            if (granted) toast.success('Notification permission granted!');
            else toast.error('Notification permission denied.');
        } catch { toast.error('Failed to request notification permission.'); }
    }

    function dismissPermissionBanner() { setShowPermissionBanner(false); }

    const addToActiveConversations = async (encryptedId: string) => {
        try {
            await axios.post(`/api/active-conversations/${encryptedId}`, {}, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            const conv = conversationsList.find((c) => c.encrypted_id === encryptedId);
            if (conv?.id) setActiveConversationRawIds([...activeConversationRawIdsState, conv.id]);
            toast.success('Added to Active Conversations');
        } catch { toast.error('Failed to add to active conversations'); }
    };

    const removeFromActiveConversations = async (encryptedId: string) => {
        try {
            await axios.delete(`/api/active-conversations/${encryptedId}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            const conv = conversationsList.find((c) => c.encrypted_id === encryptedId);
            if (conv?.id) setActiveConversationRawIds(activeConversationRawIdsState.filter((id) => id !== conv.id));
            toast.success('Removed from Active Conversations');
        } catch { toast.error('Failed to remove from active conversations'); }
    };

    const isActiveConversation = (encryptedId: string) => {
        const conv = conversationsList.find((c) => c.encrypted_id === encryptedId);
        return conv?.id ? activeConversationRawIdsState.includes(conv.id) : false;
    };

    const handleRemoveFromList = async () => {
        if (!selectedConversation || removingFromList) return;
        if (!confirm('Are you sure you want to remove this user from your conversation list?')) return;
        try {
            setRemovingFromList(true);
            const res = await axios.delete(`/conversations/${selectedConversation.encrypted_id}/remove`);
            if (res.status === 200) {
                setConversationsList((prev) => prev.filter((c) => c.encrypted_id !== selectedConversation.encrypted_id));
                setSelectedConversation(null); setMessages([]);
                toast.success('User removed from conversation list');
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to remove user from list'); } finally { setRemovingFromList(false); }
    };

    const handleClearChat = async () => {
        if (!selectedConversation || clearingChat) return;
        if (!confirm('Are you sure you want to clear this chat?')) return;
        try {
            setClearingChat(true);
            const res = await axios.delete(`/conversations/${selectedConversation.encrypted_id}/clear`);
            if (res.status === 200) { setMessages([]); toast.success('Chat history cleared'); }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to clear chat'); } finally { setClearingChat(false); }
    };

    const handleMarkAsUnread = async (encryptedId: string) => {
        if (markingUnread) return;
        try {
            setMarkingUnread(true);
            const res = await axios.post(`/messages/${encryptedId}/mark-unread`, {}, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (res.status === 200) {
                setConversationsList((prev) => prev.map((c) => c.encrypted_id === encryptedId ? { ...c, unread_count: (c.unread_count || 0) + 1 } : c));
                toast.success('Conversation marked as unread');
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to mark as unread'); } finally { setMarkingUnread(false); setShowDropdown(null); }
    };

    const handleBlockUser = async (encryptedId: string) => {
        if (blockingUser) return;
        const conv = conversationsList.find((c) => c.encrypted_id === encryptedId);
        const other = conv ? getOtherParticipant(conv.participants, auth.user.id) : null;
        if (!confirm(`Are you sure you want to block ${other?.name || 'this user'}?`)) return;
        try {
            setBlockingUser(true);
            const res = await axios.post('/users/block', { conversation_id: encryptedId }, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (res.status === 200) {
                setConversationsList((prev) => prev.filter((c) => c.encrypted_id !== encryptedId));
                if (selectedConversation?.encrypted_id === encryptedId) { setSelectedConversation(null); setMessages([]); }
                toast.success(`${other?.name || 'User'} has been blocked`);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to block user'); } finally { setBlockingUser(false); setShowDropdown(null); }
    };

    const handleAddToActive = async (encryptedId: string) => {
        if (isActiveConversation(encryptedId)) await removeFromActiveConversations(encryptedId);
        else await addToActiveConversations(encryptedId);
        setShowDropdown(null);
    };

    const handleRemoveChat = async (encryptedId: string) => {
        if (removingFromList || !confirm('Are you sure you want to remove this chat?')) return;
        try {
            setRemovingFromList(true);
            const res = await axios.delete(`/conversations/${encryptedId}/remove`);
            if (res.status === 200) {
                setConversationsList((prev) => prev.filter((c) => c.encrypted_id !== encryptedId));
                if (selectedConversation?.encrypted_id === encryptedId) { setSelectedConversation(null); setMessages([]); }
                toast.success('Chat removed from list');
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to remove chat'); } finally { setRemovingFromList(false); setShowDropdown(null); }
    };

    const handleClearChatById = async (encryptedId: string) => {
        if (clearingChat || !confirm('Are you sure you want to clear all messages?')) return;
        try {
            setClearingChat(true);
            const res = await axios.delete(`/conversations/${encryptedId}/clear`);
            if (res.status === 200) {
                if (selectedConversation?.encrypted_id === encryptedId) setMessages([]);
                setConversationsList((prev) => prev.map((c) => c.encrypted_id === encryptedId ? { ...c, last_message: null } : c));
                toast.success('Chat history cleared');
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to clear chat'); } finally { setClearingChat(false); setShowDropdown(null); }
    };

    const handleArchiveChat = async (encryptedId: string) => {
        if (archivingChat) return;
        try {
            setArchivingChat(true);
            const res = await axios.post(`/conversations/${encryptedId}/archive`, {}, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (res.status === 200) {
                setConversationsList((prev) => prev.filter((c) => c.encrypted_id !== encryptedId));
                if (selectedConversation?.encrypted_id === encryptedId) { setSelectedConversation(null); setMessages([]); }
                toast.success('Chat archived');
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to archive chat'); } finally { setArchivingChat(false); setShowDropdown(null); }
    };

    // Long-press (mobile chat list)
    const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent, encryptedId: string, chatId: number) => {
        e.preventDefault();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        longPressTimerRef.current = setTimeout(() => {
            setLongPressChat({ encryptedId, chatId, position: { top: rect.top + window.scrollY, left: rect.left + rect.width / 2 } });
        }, longPressDuration);
    };
    const handleLongPressEnd = () => { if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; } };
    const closeLongPressDropdown = () => setLongPressChat(null);

    // Multi-select (mobile)
    const toggleMultiSelectMode = () => { setIsMultiSelectMode((p) => !p); setSelectedChatIds([]); };
    const toggleChatSelection = (encryptedId: string) => setSelectedChatIds((prev) => prev.includes(encryptedId) ? prev.filter((id) => id !== encryptedId) : [...prev, encryptedId]);
    const selectAllChats = () => setSelectedChatIds(filteredChats.map((c) => c.encrypted_id));
    const deselectAllChats = () => setSelectedChatIds([]);
    const handleBulkRemove = async () => { if (!selectedChatIds.length || !confirm(`Remove ${selectedChatIds.length} chat(s)?`)) return; for (const id of selectedChatIds) await handleRemoveChat(id); setSelectedChatIds([]); setIsMultiSelectMode(false); };
    const handleBulkArchive = async () => { if (!selectedChatIds.length || !confirm(`Archive ${selectedChatIds.length} chat(s)?`)) return; for (const id of selectedChatIds) await handleArchiveChat(id); setSelectedChatIds([]); setIsMultiSelectMode(false); };
    const handleBulkClear = async () => { if (!selectedChatIds.length || !confirm(`Clear ${selectedChatIds.length} chat(s)?`)) return; for (const id of selectedChatIds) await handleClearChatById(id); setSelectedChatIds([]); setIsMultiSelectMode(false); };
    const handleBulkMarkUnread = async () => { if (!selectedChatIds.length) return; for (const id of selectedChatIds) await handleMarkAsUnread(id); setSelectedChatIds([]); setIsMultiSelectMode(false); toast.success(`${selectedChatIds.length} chat(s) marked as unread`); };

    // Mobile message long-press
    const handleMessageLongPressStart = (e: React.TouchEvent, message: Message, isOwner: boolean) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        messageLongPressTimerRef.current = setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate(50);
            setLongPressMessage({ message, position: { top: Math.min(rect.top + window.scrollY, window.innerHeight - 320), left: isOwner ? Math.max(rect.left - 160, 16) : Math.min(rect.left, window.innerWidth - 200) }, isOwner });
        }, messageLongPressDuration);
    };
    const handleMessageLongPressEnd = () => { if (messageLongPressTimerRef.current) { clearTimeout(messageLongPressTimerRef.current); messageLongPressTimerRef.current = null; } };
    const closeMessageActionsDropdown = () => setLongPressMessage(null);

    // Swipe-to-reply
    const handleSwipeStart = (e: React.TouchEvent, messageId: number) => { swipeStartX.current = e.touches[0].clientX; setSwipingMessageId(messageId); };
    const handleSwipeMove = (e: React.TouchEvent) => { if (swipingMessageId === null) return; const diff = e.touches[0].clientX - swipeStartX.current; if (diff > 0) setSwipeOffset(Math.min(diff, 100)); };
    const handleSwipeEnd = (message: Message) => {
        if (swipeOffset >= swipeThreshold) { handleReplyTo(message); if (navigator.vibrate) navigator.vibrate(30); }
        setSwipeOffset(0); setSwipingMessageId(null);
    };

    // File preview send / cancel
    const handleSendPreviewFile = async () => {
        if (previewFile && previewFileType) {
            setShowPreviewModal(false);
            await uploadFile(previewFile, previewFileType);
            if (previewFileUrl) URL.revokeObjectURL(previewFileUrl);
            setPreviewFile(null); setPreviewFileType(null); setPreviewFileUrl(null);
        }
    };

    const handleCancelPreview = () => {
        setShowPreviewModal(false);
        if (previewFileUrl) URL.revokeObjectURL(previewFileUrl);
        setPreviewFile(null); setPreviewFileType(null); setPreviewFileUrl(null);
    };

    return {
        // state
        auth, messagesMap, conversationsList, selectedConversation, messages, text, setText,
        typingUsers, participants, onlineUsers, currentTime, messagesEndRef,
        currentTab, setCurrentTab, editingMessageId, editText, setEditText, openMenuId, setOpenMenuId,
        echoReady, echoConnected, connectionRetries, showUploadMenu, setShowUploadMenu,
        isRecording, recordingTime, uploadingFile, fileInputRef, imageInputRef, textInputRef, mobileTextInputRef,
        users, setUsers, selectedIds, allSelected, showMobileChatView, showMobileListView, isRemoveMode, setIsRemoveMode,
        setMessages, setSelectedConversation,
        setIsMultiSelectMode, setSelectedChatIds, setLongPressChat,
        setSwipeOffset, setSwipingMessageId,
        starredMessageIds, pinnedMessageIds, replyingTo, showProfileOverlay, setShowProfileOverlay,
        dropdownPos, setDropdownPos, activeDropdownId, setActiveDropdownId,
        conversationSearchQuery, messageSearchQuery, showMessageSearch, filteredMessages, searchingMessages, searchingConversations,
        notificationPermission, microphonePermission, showPermissionBanner,
        selectedImage, setSelectedImage, showImageModal, setShowImageModal,
        previewFile, previewFileType, previewFileUrl, showPreviewModal,
        selectedDocument, setSelectedDocument, showDocumentModal, setShowDocumentModal,
        isPageLoading, isConversationsLoading, isMessagesLoading, bgLoaded, setBgLoaded,
        headerMode, selectedChats, readReceiptTrigger,
        playingAudio, setPlayingAudio,
        removingFromList, clearingChat, markingUnread, blockingUser, archivingChat,
        isMessageSelectionMode, selectedMessageIds, deletingSelectedMessages,
        showConnectedUsersModal, connectedUsersLoading, connectedUsersSearchQuery, setConnectedUsersSearchQuery,
        longPressChat, isMultiSelectMode, selectedChatIds,
        longPressMessage, swipingMessageId, swipeOffset, swipeThreshold,
        hoveredChatId, setHoveredChatId, showDropdown, setShowDropdown,
        headerRef,
        // UI toggles
        selectChatRef, isSelectChatOpen, toggleSelectChat, closeSelectChat,
        searchRef, isSearchOpen, openSearch, closeSearch,
        singleMessageRef, isSingleMessageRefOpen, toggleSingleMessageSearch,
        slideRef, isSlideOpen, toggleSlide,
        allmessagesEditRef, isAllMessageEditOpen, toggleAllMessageEdit,
        messageEditRef, isMessageEditOpen, toggleMessageEdit,
        audioMessageEditRef, isAudioMessageEditOpen, toggleAudioMessageEdit,
        outgoingMessageEditRef, isOutgoingMessageEditOpen, toggleOutgoinMessageEdit,
        desktopSideProfileRef, isDesktopSideProfileOpen, toggleDesktopSideProfile,
        isHoveredEditMessage, setIsHoveredEditMessage,
        isHoveredSentDesktopEditMessage, setIsHoveredSentDekstopEditMessage,
        isHoveredIncomeDesktopEditMessage, setIsHoveredIncometDekstopEditMessage,
        isHoveredAudioEditMessage, setIsHoveredAudioEditMessage,
        isHoveredOutgoingEditMessage, setIsHoveredOutgoingEditMessage,
        // derived
        otherUser, isConversationSelected, filteredChats, activeConversationUsers, starredMessages, filteredConnectedUsers,
        // handlers
        resetToDefault, handleSelectConversation,
        fetchConnectedUsers, openConnectedUsersModal, closeConnectedUsersModal, handleStartConversationWithUser,
        sendMessage, handleTyping, startEditing, cancelEditing, saveEdit, deleteMessage,
        enterMessageSelectionMode, exitMessageSelectionMode, toggleMessageSelection, selectAllMessages, deselectAllMessages, deleteSelectedMessages,
        toggleStarMessage, togglePinMessage, copyMessageText, handleReplyTo, cancelReply,
        handleImageUpload, handleDocumentUpload, uploadFile, handleSendPreviewFile, handleCancelPreview,
        startRecording, stopRecording, cancelRecording, formatRecordingTime, requestMicrophonePermission,
        handleConversationSearch, handleMessageSearch, toggleMessageSearch, clearMessageSearch,
        requestNotificationPermission, dismissPermissionBanner,
        isActiveConversation, addToActiveConversations, removeFromActiveConversations,
        handleRemoveFromList, handleClearChat, handleMarkAsUnread, handleBlockUser,
        handleAddToActive, handleRemoveChat, handleClearChatById, handleArchiveChat,
        handleLongPressStart, handleLongPressEnd, closeLongPressDropdown,
        toggleMultiSelectMode, toggleChatSelection, selectAllChats, deselectAllChats,
        handleBulkRemove, handleBulkArchive, handleBulkClear, handleBulkMarkUnread,
        handleMessageLongPressStart, handleMessageLongPressEnd, closeMessageActionsDropdown,
        handleSwipeStart, handleSwipeMove, handleSwipeEnd,
        toggleUserSelect, handleDeleteSelected,
    };
}

export type MessagingState = ReturnType<typeof useMessaging>;
