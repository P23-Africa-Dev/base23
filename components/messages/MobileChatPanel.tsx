'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TbLineDashed } from 'react-icons/tb';
import toast from 'react-hot-toast';
import { formatTime, getDocumentIcon } from '@/utils/message-helpers';
import { formatText } from '@/utils/format-character';
import { FormattedMessage } from '@/utils/messageFormatter';
import images from '@/constants/image';
import { SkeletonMessage } from '@/components/ui/skeleton-loaders';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import VoiceNotePlayer from '@/components/messages/VoiceNotePlayer';
import InlineReadReceipt from '@/components/messages/InlineReadReceipt';
import MessageActionsDropdown from '@/components/cards/messages/chat/MessageActionsDropdown';
import MobileProfileSidebar from '@/components/cards/messages/chat/mobile-chat-profile';
import { FormatToolbar } from '@/components/messages/FormatToolbar';
import { slideEditContainerRightVariants, singleSlideFadeVariants, slideUpVariants } from '@/constants/animationVariants';
import { useMessagingCtx } from '@/contexts/MessagingContext';

export function MobileChatPanel() {
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
        replyingTo,
        readReceiptTrigger,
        playingAudio,
        setPlayingAudio,
        starredMessageIds,
        pinnedMessageIds,
        isMessageSelectionMode,
        selectedMessageIds,
        deletingSelectedMessages,
        messagesEndRef,
        mobileTextInputRef,
        fileInputRef,
        imageInputRef,
        showUploadMenu,
        setShowUploadMenu,
        isRecording,
        recordingTime,
        uploadingFile,
        showMobileChatView,
        showDropdown,
        setShowDropdown,
        longPressMessage,
        swipingMessageId,
        swipeOffset,
        swipeThreshold,
        isMultiSelectMode,
        selectedChatIds,
        showConnectedUsersModal,
        connectedUsersLoading,
        connectedUsersSearchQuery,
        setConnectedUsersSearchQuery,
        filteredConnectedUsers,
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
        requestMicrophonePermission,
        enterMessageSelectionMode,
        exitMessageSelectionMode,
        toggleMessageSelection,
        selectAllMessages,
        deselectAllMessages,
        deleteSelectedMessages,
        closeMessageActionsDropdown,
        handleMessageLongPressStart,
        handleMessageLongPressEnd,
        handleSwipeStart,
        handleSwipeMove,
        handleSwipeEnd,
        setSelectedImage,
        setShowImageModal,
        setSelectedDocument,
        setShowDocumentModal,
        openConnectedUsersModal,
        closeConnectedUsersModal,
        handleStartConversationWithUser,
        fetchConnectedUsers,
        typingUsers,
        onlineUsers,
        starredMessages,
        setMessages,
        setSelectedConversation,
        setSwipeOffset,
        setSwipingMessageId,
        allmessagesEditRef,
        isAllMessageEditOpen,
        toggleAllMessageEdit,
        isSingleMessageRefOpen,
        singleMessageRef,
        toggleSingleMessageSearch,
        isSlideOpen,
        slideRef,
        toggleSlide,
        handleArchiveChat,
        handleBlockUser,
        handleClearChat,
    } = useMessagingCtx();

    if (!showMobileChatView || !selectedConversation || !otherUser) return null;

    return (
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
                                                                        <SkeletonMessage key={i} isOwner={i % 2 === 0} />
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
                                                                                                    playingAudio={playingAudio}
                                                                                                    onSetPlayingAudio={setPlayingAudio}
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
                                                                                                    currentUserId={auth.user.id}
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
                                                                                                    playingAudio={playingAudio}
                                                                                                    onSetPlayingAudio={setPlayingAudio}
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
    );
}
