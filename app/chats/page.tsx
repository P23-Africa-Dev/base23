'use client';

export const dynamic = 'force-dynamic';

import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/context/AuthContext';

import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ChatNotifications } from '@/utils/notifications';

// Helper to get the other participant (for 1:1 chat)
function getOtherParticipant(participants: User[], currentUserId: number): User | null {
    if (!participants || participants.length < 2) return null;
    return participants.find((u) => u.id !== currentUserId) || null;
}

// Helper to format time in 12-hour format (HH:MM AM/PM)
function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

type User = {
    id: number;
    name: string;
    profile_picture?: string;
};

type Message = {
    id: number;
    body: string;
    user: User;
    created_at: string;
    isOptimistic?: boolean; // For optimistic UI updates
};

type ConversationListItem = {
    id?: any; // may be encrypted in index response — we'll fetch full conversation on select
    encrypted_id: string;
    title?: string | null;
    participants: User[];
    unread_count?: number; // Add unread count
    last_message?: {
        body: string;
        created_at: string;
        is_read?: boolean; // Add read status
    } | null;
};

type Props = {
    conversations?: ConversationListItem[];
    auth: {
        user: User;
    };
};

function IndexContent({ conversations = [], auth }: Props) {
    const [selectedEncryptedId, setSelectedEncryptedId] = useState<string | null>(null);

    // Get encryptedId from URL after mount
    useEffect(() => {
        const urlMatch = window.location.pathname.match(/\/messages\/(\w+)/);
        if (urlMatch) setSelectedEncryptedId(urlMatch[1]);
    }, []);

    // Manage conversations list with real-time sorting
    const [conversationsList, setConversationsList] = useState<ConversationListItem[]>(
        [...conversations].sort((a, b) => {
            const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return bTime - aTime; // Most recent first
        })
    );

    // Full conversation data we fetch when a conversation is selected
    const [selectedConversation, setSelectedConversation] = useState<{
        id: number | null; // raw numeric id required for Echo channel
        encrypted_id: string;
        participants: User[];
        title?: string | null;
    } | null>(null);

    // Chat state for selected conversation
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [typingUsers, setTypingUsers] = useState<User[]>([]);
    const [participants, setParticipants] = useState<User[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const channelRef = useRef<any>(null);

    // Load conversations list participant avatars already provided by server (props)
    // When selectedEncryptedId changes we fetch that conversation's messages & raw id
    useEffect(() => {
        // Initialize notifications on component mount
        ChatNotifications.initialize();
    }, []);

    // Sync conversations list when prop changes
    useEffect(() => {
        setConversationsList(
            [...conversations].sort((a, b) => {
                const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
                const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
                return bTime - aTime;
            })
        );
    }, [conversations]);

    useEffect(() => {
        if (!selectedEncryptedId) {
            setSelectedConversation(null);
            setMessages([]);
            setParticipants([]);
            return;
        }

        async function loadConversation(encryptedId: string) {
            try {
                // Attempt to fetch the same data returned by ChatController::show.
                // Use Accept: 'application/json' and X-Requested-With to encourage JSON props from Inertia if configured.
                const res = await axios.get(`/messages/${encryptedId}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                // Inertia returns props under res.data.props, otherwise try res.data
                const payload = res.data?.props ? res.data.props : res.data;

                // Try to get conversation and messages from payload (matches ChatController::show)
                const conversation = payload?.conversation ?? payload?.props?.conversation ?? null;
                const msgs = payload?.messages ?? payload?.props?.messages ?? null;

                // Sometimes server may return in different shapes — try to detect
                // If `conversation` doesn't contain raw id, attempt to infer or fallback
                if (!conversation || !('id' in conversation)) {
                    // fallback: try `payload.conversation` or `payload.page` etc.
                    // (not exhaustive — but will fall back to fetch messages route if available)
                }

                if (conversation && msgs) {
                    setSelectedConversation({
                        id: conversation.id ?? null,
                        encrypted_id: conversation.encrypted_id ?? encryptedId,
                        participants: conversation.participants ?? [],
                        title: conversation.title ?? null,
                    });
                    setMessages(msgs || []);
                    setParticipants(conversation.participants ?? []);
                    return;
                }

                // FALLBACK: older setup — try a dedicated messages endpoint (if available)
                const fallback = await axios.get(`/messages/${encryptedId}/messages`, {
                    headers: { Accept: 'application/json' },
                });
                const fallbackData = fallback.data?.props ? fallback.data.props : fallback.data;
                // If fallbackData contains conversation or messages, use them
                const fallbackConv = fallbackData?.conversation ?? null;
                const fallbackMsgs = fallbackData?.messages ?? fallbackData?.messages ?? fallbackData;
                setSelectedConversation({
                    id: fallbackConv?.id ?? null,
                    encrypted_id: encryptedId,
                    participants: fallbackConv?.participants ?? [],
                    title: fallbackConv?.title ?? null,
                });
                setMessages(fallbackMsgs || []);
                setParticipants(fallbackConv?.participants ?? []);
            } catch (err) {
                console.error('Error loading conversation:', err);
                // If the GET /messages/{encryptedId} returned HTML (Inertia non-JSON) axios may throw
                // Try to call a minimal API: GET /messages/{encryptedId}/messages (if your backend supports it)
                try {
                    const fallback = await axios.get(`/messages/${encryptedId}/messages`, {
                        headers: { Accept: 'application/json' },
                    });
                    const fallbackData = fallback.data?.props ? fallback.data.props : fallback.data;
                    const fallbackConv = fallbackData?.conversation ?? null;
                    const fallbackMsgs = fallbackData?.messages ?? [];
                    setSelectedConversation({
                        id: fallbackConv?.id ?? null,
                        encrypted_id: encryptedId,
                        participants: fallbackConv?.participants ?? [],
                        title: fallbackConv?.title ?? null,
                    });
                    setMessages(fallbackMsgs || []);
                    setParticipants(fallbackConv?.participants ?? []);
                } catch (err2) {
                    console.error('Fallback load also failed', err2);
                }
            }
        }

        loadConversation(selectedEncryptedId);
    }, [selectedEncryptedId]);

    // Real-time and typing logic (use raw numeric id for channel)
    useEffect(() => {
        // we need the raw numeric id that the server broadcasts to (conversation.id)
        if (!selectedConversation?.id || !auth?.user?.id) return;
        const conversationId = selectedConversation.id;

        // Leave any previous channel first
        if (channelRef.current?.chan) {
            try {
                (window as any).Echo.leave(`conversation.${channelRef.current.currentConversationId}`);
            } catch (err) {
                console.warn('Error leaving previous channel:', err);
            }
            channelRef.current = null;
        }

        // Check if Echo is available
        if (!(window as any).Echo) {
            console.error('Laravel Echo is not available - make sure bootstrap.ts is imported');
            return;
        }

        console.log('Joining channel:', `conversation.${conversationId}`, 'with user:', auth.user.id);
        const chan = (window as any).Echo.join(`conversation.${conversationId}`)
            .here((users: User[]) => {
                console.log('Users currently in channel:', users);
                setParticipants(users);
            })
            .joining((user: User) => {
                console.log('User joined:', user);
                setParticipants((p: User[]) => [...p, user]);
            })
            .leaving((user: User) => {
                console.log('User left:', user);
                setParticipants((p: User[]) => p.filter((u) => u.id !== user.id));
            })
            .error((error: any) => {
                console.error('Echo channel error:', error);
            })
            .listen('MessageSent', (event: { message: Message }) => {
                console.log('🔥 Received MessageSent event:', event);
                console.log('🔥 Current user ID:', auth.user.id);
                console.log('🔥 Message sender ID:', event.message?.user?.id);
                const incoming = event.message;
                if (!incoming || !incoming.user) {
                    console.warn('Invalid message received:', incoming);
                    return;
                }

                // Add all received messages but avoid duplicates
                setMessages((prev) => {
                    console.log('🔥 Current messages count:', prev.length);
                    // Check if message already exists to prevent duplicates
                    if (prev.find((m) => m.id === incoming.id && !m.isOptimistic)) {
                        console.log('🔥 Message already exists, skipping');
                        return prev;
                    }

                    // Remove any optimistic message with the same content
                    const filtered = prev.filter((m) => {
                        if (m.isOptimistic && m.user.id === incoming.user.id && m.body === incoming.body) {
                            console.log('🔥 Removing optimistic message');
                            return false;
                        }
                        return true;
                    });

                    console.log('🔥 Adding new message to chat');
                    const newMessages = [...filtered, incoming];

                    // Update conversations list with new message info for real-time sorting
                    if (incoming.user.id !== auth.user.id) {
                        setConversationsList(prevConvs => {
                            const updatedConvs = prevConvs.map(conv => {
                                if (conv.id === selectedConversation?.id) {
                                    return {
                                        ...conv,
                                        last_message: {
                                            body: incoming.body,
                                            created_at: incoming.created_at,
                                            is_read: false
                                        },
                                        unread_count: (conv.unread_count || 0) + 1
                                    };
                                }
                                return conv;
                            });
                            // Re-sort by most recent message
                            return updatedConvs.sort((a, b) => {
                                const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
                                const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
                                return bTime - aTime;
                            });
                        });

                        ChatNotifications.showMessageNotification(
                            incoming.user.name,
                            incoming.body,
                            incoming.user.profile_picture
                        );
                    }

                    return newMessages;
                });
            })
            .listenForWhisper('typing', (payload: { user: User }) => {
                if (payload?.user?.id && payload.user.id !== auth.user.id) {
                    setTypingUsers((prev) => (prev.find((u) => u.id === payload.user.id) ? prev : [...prev, payload.user]));
                    setTimeout(() => {
                        setTypingUsers((prev) => prev.filter((u) => u.id !== payload.user.id));
                    }, 2000);
                }
            });

        // store channel and conversation id for leaving later
        channelRef.current = { chan, currentConversationId: conversationId };

        return () => {
            try {
                (window as any).Echo?.leave(`conversation.${conversationId}`);
                channelRef.current = null;
            } catch (err) {
                // ignore
            }
        };
    }, [selectedConversation?.id, auth?.user?.id]);

    // scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function sendMessage(e?: React.FormEvent) {
        e?.preventDefault();
        if (editingMessageId !== null) {
            // Save edited message
            await handleSaveEdit(editingMessageId);
            return;
        }
        if (!text.trim() || !selectedConversation) return;
        const body = text.trim();

        // Create optimistic message for immediate UI feedback
        const optimisticMessage = {
            id: Date.now(), // temporary ID
            body,
            user: {
                id: auth.user.id,
                name: auth.user.name,
                profile_picture: auth.user.profile_picture,
            },
            created_at: new Date().toISOString(),
            isOptimistic: true, // flag to identify optimistic messages
        };

        // Clear input immediately for better UX
        setText('');

        // Add optimistic message to UI
        setMessages((m) => [...m, optimisticMessage]);

        // Update conversations list with sent message for real-time sorting
        setConversationsList(prevConvs => {
            const updatedConvs = prevConvs.map(conv => {
                if (conv.id === selectedConversation?.id) {
                    return {
                        ...conv,
                        last_message: {
                            body: optimisticMessage.body,
                            created_at: optimisticMessage.created_at,
                            is_read: true
                        }
                    };
                }
                return conv;
            });
            // Re-sort by most recent message
            return updatedConvs.sort((a, b) => {
                const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
                const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
                return bTime - aTime;
            });
        });

        try {
            const res = await axios.post(`/messages/${selectedConversation.encrypted_id}/messages`, { body });

            // Only remove optimistic message - the real message will be added via broadcast
            setMessages((m) => m.filter((msg) => !(msg.isOptimistic && msg.body === body)));
        } catch (err) {
            console.error('Send message failed', err);
            // Remove optimistic message and restore text on failure
            setMessages((m) => m.filter((msg) => !(msg.isOptimistic && msg.body === body)));
            setText(body);
        }
    }

    // Edit message handlers
    function handleEditMessage(messageId: number, currentBody: string) {
        setEditingMessageId(messageId);
        setEditText(currentBody);
    }

    function handleCancelEdit() {
        setEditingMessageId(null);
        setEditText('');
    }

    async function handleSaveEdit(messageId: number) {
        if (!editText.trim() || !selectedConversation) return;
        try {
            // TODO: Replace with actual backend PATCH endpoint
            await axios.patch(`/messages/${selectedConversation.encrypted_id}/messages/${messageId}`, { body: editText });
            setMessages((msgs) => msgs.map((msg) => (msg.id === messageId ? { ...msg, body: editText } : msg)));
            setEditingMessageId(null);
            setEditText('');
        } catch (err) {
            console.error('Edit message failed', err);
        }
    }

    async function handleDeleteMessage(messageId: number) {
        if (!selectedConversation) return;
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            // TODO: Replace with actual backend DELETE endpoint
            await axios.delete(`/messages/${selectedConversation.encrypted_id}/messages/${messageId}`);
            setMessages((msgs) => msgs.filter((msg) => msg.id !== messageId));
        } catch (err) {
            console.error('Delete message failed', err);
        }
    }

    function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
        setText(e.target.value);
        try {
            if (channelRef.current?.chan && typeof channelRef.current.chan.whisper === 'function') {
                channelRef.current.chan.whisper('typing', { user: auth.user });
            }
        } catch (err) {
            // ignore whisper errors
        }
    }

    // When a conversation is selected, update the URL with encrypted_id and load messages
    async function handleSelectConversation(encryptedId: string) {
        setSelectedEncryptedId(encryptedId);

        // Mark messages as read when conversation is opened
        try {
            await axios.post(`/messages/${encryptedId}/mark-read`);
        } catch (err) {
            console.warn('Failed to mark messages as read:', err);
        }

        // Update the browser URL without a full navigation
        window.location.href = `/messages/${encryptedId}`;
    }

    return (
        <AppLayout>
            <div className="flex h-screen bg-gray-50 page-transition">
                <aside className="w-96 border-r bg-white p-6 animate-fadeInLeft">
                    <h2 className="mb-4 text-xl font-semibold">Direct Messages</h2>
                    <div className="space-y-4">
                        {Array.isArray(conversationsList) && conversationsList.length > 0 ? (
                            conversationsList.map((c) => {
                                const other = getOtherParticipant(c.participants, auth.user.id) || c.participants[0];
                                return (
                                    <button
                                        key={c.encrypted_id}
                                        onClick={() => handleSelectConversation(c.encrypted_id)}
                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-4 shadow hover:bg-gray-50 ${selectedEncryptedId === c.encrypted_id ? 'bg-indigo-50' : 'bg-white'}`}
                                        style={{ border: selectedEncryptedId === c.encrypted_id ? '2px solid #6366f1' : undefined }}
                                    >
                                        <img
                                            src={
                                                other?.profile_picture ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'User')}&background=6366f1&color=ffffff&size=200`
                                            }
                                            alt={other?.name || 'User'}
                                            className="h-10 w-10 rounded-full border object-cover"
                                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                const target = e.target as HTMLImageElement;
                                                if (!target.src.includes('ui-avatars.com')) {
                                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'User')}&background=6366f1&color=ffffff&size=200`;
                                                }
                                            }}
                                        />
                                        <div className="min-w-0 flex-1 text-left">
                                            <div className="truncate font-semibold">{other?.name || 'User'}</div>
                                            <div className={`truncate text-sm ${c.last_message?.is_read === false && c.last_message?.body
                                                    ? 'font-semibold text-gray-900'
                                                    : 'text-gray-500'
                                                }`}>
                                                {c.last_message?.body || 'No messages yet'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-xs whitespace-nowrap text-gray-400">
                                                {c.last_message?.created_at && formatTime(c.last_message.created_at)}
                                            </div>
                                            {/* Unread badge */}
                                            {c.unread_count && c.unread_count > 0 && (
                                                <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                                                    {c.unread_count > 99 ? '99+' : c.unread_count}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-4 text-center text-gray-500">No conversations available</div>
                        )}
                    </div>
                </aside>

                <div className="flex flex-1 flex-col bg-white">
                    {selectedConversation ? (
                        <>
                            <div className="relative mb-6 flex items-center gap-3 px-8 py-4 pb-0">
                                {(() => {
                                    const other = getOtherParticipant(selectedConversation.participants, auth.user.id);
                                    // Find the last message from the other participant, or just the last message
                                    let lastMsg = null;
                                    if (messages && messages.length > 0) {
                                        // Prefer last message from the other participant
                                        lastMsg =
                                            [...messages].reverse().find((m) => other && m.user.id === other.id) || messages[messages.length - 1];
                                    }
                                    return (
                                        <>
                                            <img
                                                src={
                                                    other && other.profile_picture
                                                        ? other.profile_picture
                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'User')}&background=6366f1&color=ffffff&size=200`
                                                }
                                                alt={other?.name || 'User'}
                                                className="h-12 w-12 rounded-full border object-cover"
                                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.src.includes('ui-avatars.com')) {
                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'User')}&background=6366f1&color=ffffff&size=200`;
                                                    } else {
                                                        target.src = '/images/no-user-dp.png';
                                                    }
                                                }}
                                            />
                                            <div>
                                                <h3 className="text-lg font-semibold">{other?.name || 'User'}</h3>
                                            </div>
                                            {/* Close icon */}
                                            <button
                                                onClick={() => {
                                                    setSelectedEncryptedId(null);
                                                    setSelectedConversation(null);
                                                    setMessages([]);
                                                    setParticipants([]);
                                                    setText('');
                                                    window.location.href = '/messages';
                                                }}
                                                className="absolute top-2 right-2 rounded-full p-2 hover:bg-gray-200 focus:outline-none"
                                                title="Close chat"
                                                type="button"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-gray-500"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="flex-1 overflow-auto bg-gray-50 p-6">
                                <div className="mx-auto max-w-3xl space-y-4">
                                    {messages.map((m) => {
                                        const isOwn = m.user.id === auth.user.id;
                                        const isEditing = editingMessageId === m.id;
                                        return (
                                            <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group items-start gap-2`}>
                                                {/* Profile picture for other users (left side) */}
                                                {!isOwn && (
                                                    <img
                                                        src={
                                                            m.user.profile_picture ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name)}&background=6366f1&color=ffffff&size=200`
                                                        }
                                                        alt={m.user.name}
                                                        className="mt-1 h-8 w-8 flex-shrink-0 rounded-full border object-cover"
                                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                            const target = e.target as HTMLImageElement;
                                                            if (!target.src.includes('ui-avatars.com')) {
                                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name)}&background=6366f1&color=ffffff&size=200`;
                                                            }
                                                        }}
                                                        title={m.user.name}
                                                    />
                                                )}

                                                <div
                                                    className={`${isOwn ? 'bg-indigo-600 text-white' : 'bg-white'} relative max-w-[70%] rounded-lg p-3 shadow`}
                                                >
                                                    {/* Show sender name for other users' messages */}
                                                    {!isOwn && <div className="mb-1 text-xs font-medium text-gray-500">{m.user.name}</div>}
                                                    {isEditing ? (
                                                        <form
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                handleSaveEdit(m.id);
                                                            }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <input
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="flex-1 rounded border px-2 py-1 text-white focus:outline-none"
                                                                autoFocus
                                                            />
                                                            {/* Save icon */}
                                                            <button type="submit" title="Save" className="ml-1 rounded p-1 hover:bg-gray-200">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4 text-green-600"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            {/* Cancel icon */}
                                                            <button
                                                                type="button"
                                                                title="Cancel"
                                                                onClick={handleCancelEdit}
                                                                className="ml-1 rounded p-1 hover:bg-gray-200"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4 text-gray-400"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </form>
                                                    ) : (
                                                        <>
                                                            <div className="text-sm break-words">{m.body}</div>
                                                            <div className="mt-1 text-xs text-gray-400">
                                                                {formatTime(m.created_at)}
                                                            </div>
                                                            {isOwn && (
                                                                <div className="flex w-full justify-end">
                                                                    <div className="absolute right-0 bottom-1 left-0 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                                        <button
                                                                            title="Edit"
                                                                            className="rounded p-1 hover:bg-gray-200"
                                                                            onClick={() => handleEditMessage(m.id, m.body)}
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-4 w-4 text-gray-500"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.263-1.263l1-4a4 4 0 01.828-1.414z"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            title="Delete"
                                                                            className="rounded p-1 hover:bg-gray-200"
                                                                            onClick={() => handleDeleteMessage(m.id)}
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-4 w-4 text-gray-500"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
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
                                                        </>
                                                    )}
                                                </div>

                                                {/* Profile picture for own messages (right side) */}
                                                {isOwn && (
                                                    <img
                                                        src={
                                                            auth.user.profile_picture ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=6366f1&color=ffffff&size=200`
                                                        }
                                                        alt={auth.user.name}
                                                        className="mt-1 h-8 w-8 flex-shrink-0 rounded-full border object-cover"
                                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                            const target = e.target as HTMLImageElement;
                                                            if (!target.src.includes('ui-avatars.com')) {
                                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=6366f1&color=ffffff&size=200`;
                                                            }
                                                        }}
                                                        title={auth.user.name}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div ref={messagesEndRef}></div>
                                </div>

                                {/* Reserved typing indicator space - always present to prevent layout shifts */}
                                <div className="mx-auto max-w-3xl mt-4 h-12 flex items-center">
                                    <div className={`transition-opacity duration-300 ease-in-out ${typingUsers.length > 0 ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                        {typingUsers.length > 0 && (
                                            <div className="flex justify-start items-center gap-2">
                                                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    </div>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        {typingUsers.map((u) => u.name).join(', ')} typing...
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t p-4">
                                <form onSubmit={sendMessage} className="mx-auto flex max-w-3xl items-center gap-3">
                                    <input
                                        value={text}
                                        onChange={handleTyping}
                                        placeholder="Write your message..."
                                        className="flex-1 rounded-full border px-4 py-2 focus:outline-none"
                                    />
                                    <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-white">
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center text-gray-400">Select a conversation</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export default function Index(props: Omit<Props, 'auth'>) {
    const { user } = useAuth();
    if (!user) return null;
    return <IndexContent {...props} auth={{ user }} />;
}
