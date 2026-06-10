'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import images from '@/constants/image';
import AppLayout from '@/layouts/app-layout';
import { Toaster } from 'react-hot-toast';
import MessageProfileOverlay from '@/components/modals/message/MessageProfileOverlay';

import FilePreviewModal from '@/components/messages/FilePreviewModal';
import ImageModal from '@/components/messages/ImageModal';
import DocumentModal from '@/components/messages/DocumentModal';
import { ConversationSidebar } from '@/components/messages/ConversationSidebar';
import { DesktopChatPanel } from '@/components/messages/DesktopChatPanel';
import { MobileChatPanel } from '@/components/messages/MobileChatPanel';

import { useMessaging } from '@/hooks/useMessaging';
import { MessagingContext } from '@/contexts/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { ChatNotifications } from '@/utils/notifications';

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
    read_status?: Array<{ user_id: number; user_name: string; read_at: string; }>;
    is_starred?: boolean;
    is_pinned?: boolean;
    reply_to?: { id: number; body: string; user: User; } | null;
};

type ConversationListItem = {
    id?: any;
    encrypted_id: string;
    title?: string | null;
    participants: User[];
    unread_count?: number;
    last_message?: { body: string; created_at: string; is_read?: boolean; } | null;
};

type Props = {
    conversation?: { id: number; encrypted_id: string; title?: string | null; participants: User[]; };
    conversations?: ConversationListItem[];
    messages?: Message[];
    activeConversationRawIds?: number[];
    auth: { user: User; };
};

function MessageContent(props: Props) {
    const state = useMessaging(props);
    const {
        auth,
        showPermissionBanner,
        microphonePermission,
        showProfileOverlay,
        setShowProfileOverlay,
        otherUser,
        bgLoaded,
        showPreviewModal,
        previewFile,
        previewFileType,
        previewFileUrl,
        uploadingFile,
        handleSendPreviewFile,
        handleCancelPreview,
        showImageModal,
        setShowImageModal,
        selectedImage,
        setSelectedImage,
        showDocumentModal,
        setShowDocumentModal,
        selectedDocument,
        setSelectedDocument,
        requestNotificationPermission,
        requestMicrophonePermission,
        dismissPermissionBanner,
        showConnectedUsersModal,
        connectedUsersLoading,
        connectedUsersSearchQuery,
        setConnectedUsersSearchQuery,
        filteredConnectedUsers,
        onlineUsers,
        closeConnectedUsersModal,
        handleStartConversationWithUser,
    } = state;

    return (
        <MessagingContext.Provider value={state}>
        <AppLayout>
            
            <FilePreviewModal
                show={showPreviewModal}
                file={previewFile}
                fileType={previewFileType}
                fileUrl={previewFileUrl}
                uploadingFile={uploadingFile}
                onSend={handleSendPreviewFile}
                onCancel={handleCancelPreview}
            />
            <ImageModal
                show={showImageModal}
                imageUrl={selectedImage}
                onClose={() => { setShowImageModal(false); setSelectedImage(null); }}
            />
            <DocumentModal
                show={showDocumentModal}
                document={selectedDocument}
                onClose={() => { setShowDocumentModal(false); setSelectedDocument(null); }}
            />

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
                            <ConversationSidebar />
                            <div className="h-screen lg:ml-10 lg:block lg:pt-1">
                                <DesktopChatPanel />
                                <MobileChatPanel />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    </MessagingContext.Provider>
    );
}

function Message(props: Omit<Props, 'auth'>) {
    const { user } = useAuth();
    if (!user) return null;
    return <MessageContent {...props} auth={{ user }} />;
}

export default Message;
