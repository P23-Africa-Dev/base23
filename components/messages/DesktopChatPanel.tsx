'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { formatTime, getDocumentIcon, formatFileSize } from '@/utils/message-helpers';
import { FormattedMessage } from '@/utils/messageFormatter';
import images from '@/constants/image';
import { DropdownItem, MessageDropdown } from '@/components/messages/message-ui-helpers';
import { SkeletonMessage } from '@/components/ui/skeleton-loaders';
import { TooltipProvider } from '@/components/ui/tooltip';
import VoiceNotePlayer from '@/components/messages/VoiceNotePlayer';
import InlineReadReceipt from '@/components/messages/InlineReadReceipt';
import MessageActionsDropdown from '@/components/cards/messages/chat/MessageActionsDropdown';
import { FormatToolbar } from '@/components/messages/FormatToolbar';
import { slideEditContainerRightVariants } from '@/constants/animationVariants';
import { useMessagingCtx } from '@/contexts/MessagingContext';

export function DesktopChatPanel() {
    const {
        auth,
        messages,
        selectedConversation,
        otherUser,
        text,
        setText,
        isMessagesLoading,
        editingMessageId,
        editText,
        setEditText,
        openMenuId,
        setOpenMenuId,
        replyingTo,
        messageSearchQuery,
        showMessageSearch,
        filteredMessages,
        searchingMessages,
        starredMessageIds,
        pinnedMessageIds,
        playingAudio,
        setPlayingAudio,
        readReceiptTrigger,
        isMessageSelectionMode,
        selectedMessageIds,
        deletingSelectedMessages,
        messagesEndRef,
        textInputRef,
        fileInputRef,
        imageInputRef,
        showUploadMenu,
        setShowUploadMenu,
        isRecording,
        recordingTime,
        uploadingFile,
        showProfileOverlay,
        setShowProfileOverlay,
        dropdownPos,
        setDropdownPos,
        activeDropdownId,
        setActiveDropdownId,
        isHoveredEditMessage,
        setIsHoveredEditMessage,
        isHoveredSentDesktopEditMessage,
        setIsHoveredSentDekstopEditMessage,
        isHoveredIncomeDesktopEditMessage,
        setIsHoveredIncometDekstopEditMessage,
        isHoveredAudioEditMessage,
        setIsHoveredAudioEditMessage,
        isHoveredOutgoingEditMessage,
        setIsHoveredOutgoingEditMessage,
        showDropdown,
        setShowDropdown,
        slideRef,
        isSlideOpen,
        toggleSlide,
        allmessagesEditRef,
        isAllMessageEditOpen,
        toggleAllMessageEdit,
        messageEditRef,
        isMessageEditOpen,
        toggleMessageEdit,
        audioMessageEditRef,
        isAudioMessageEditOpen,
        toggleAudioMessageEdit,
        outgoingMessageEditRef,
        isOutgoingMessageEditOpen,
        toggleOutgoinMessageEdit,
        desktopSideProfileRef,
        isDesktopSideProfileOpen,
        toggleDesktopSideProfile,
        singleMessageRef,
        isSingleMessageRefOpen,
        toggleSingleMessageSearch,
        headerRef,
        sendMessage,
        handleTyping,
        startEditing,
        cancelEditing,
        saveEdit,
        deleteMessage,
        toggleStarMessage,
        togglePinMessage,
        copyMessageText,
        handleReplyTo,
        cancelReply,
        handleImageUpload,
        handleDocumentUpload,
        startRecording,
        stopRecording,
        cancelRecording,
        formatRecordingTime,
        handleMessageSearch,
        toggleMessageSearch,
        clearMessageSearch,
        enterMessageSelectionMode,
        exitMessageSelectionMode,
        toggleMessageSelection,
        selectAllMessages,
        deselectAllMessages,
        deleteSelectedMessages,
        setSelectedImage,
        setShowImageModal,
        setSelectedDocument,
        setShowDocumentModal,
        typingUsers,
        onlineUsers,
        isPageLoading,
        notificationPermission,
        microphonePermission,
        requestNotificationPermission,
        handleBlockUser,
        handleClearChat,
    } = useMessagingCtx();

    function renderFormattedMessage(text: string, searchTerm: string, isLight: boolean = false): React.JSX.Element {
        return (
            <FormattedMessage
                text={text}
                isLight={isLight}
                searchHighlight={showMessageSearch ? searchTerm : undefined}
            />
        );
    }

    function highlightSearchTerm(text: string, searchTerm: string): React.JSX.Element {
        return renderFormattedMessage(text, searchTerm, false);
    }

    return (
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
                                                                <SkeletonMessage key={i} isOwner={i % 2 === 0} />
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
                                                                                                        currentUserId={auth.user.id}
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
                                                                                                playingAudio={playingAudio}
                                                                                                onSetPlayingAudio={setPlayingAudio}
                                                                                            />
                                                                                            <InlineReadReceipt
                                                                                                key={`${message.id}-${readReceiptTrigger}`}
                                                                                                message={message}
                                                                                                isOwner={true}
                                                                                                currentUserId={auth.user.id}
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
                                                                                                            currentUserId={auth.user.id}
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
                                                                                                currentUserId={auth.user.id}
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
                                                                                            playingAudio={playingAudio}
                                                                                            onSetPlayingAudio={setPlayingAudio}
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
    );
}
