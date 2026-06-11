"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { formatTime, formatTimeAgo, getOtherParticipant } from '@/utils/message-helpers';
import images from '@/constants/image';
import { icons, DropdownItem } from '@/components/messages/message-ui-helpers';
import { SkeletonChatItem, SkeletonSearchBar, SkeletonText } from '@/components/ui/skeleton-loaders';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import DirectChatCard from '@/components/cards/messages/user-direct-message-card';
import MobileDirectChatCard from '@/components/cards/messages/mobile-chat-card';
import ChatUserSlider from '@/components/cards/messages/user-chat-slider';
import DropdownToggle from '@/components/DropdownToggle';
import { useMessagingCtx } from '@/contexts/MessagingContext';

export function ConversationSidebar() {
  const {
    auth,
    conversationsList,
    selectedConversation,
    currentTab,
    setCurrentTab,
    isConversationsLoading,
    conversationSearchQuery,
    searchingConversations,
    filteredChats,
    activeConversationUsers,
    hoveredChatId,
    setHoveredChatId,
    headerMode,
    selectedChats,
    longPressChat,
    isMultiSelectMode,
    selectedChatIds,
    clearingChat,
    archivingChat,
    removingFromList,
    markingUnread,
    isConversationSelected,
    isActiveConversation,
    selectChatRef,
    isSelectChatOpen,
    toggleSelectChat,
    closeSelectChat,
    searchRef,
    isSearchOpen,
    openSearch,
    closeSearch,
    handleSelectConversation,
    handleConversationSearch,
    handleRemoveChat,
    handleClearChatById,
    handleArchiveChat,
    handleMarkAsUnread,
    handleBlockUser,
    handleAddToActive,
    closeLongPressDropdown,
    toggleMultiSelectMode,
    toggleChatSelection,
    selectAllChats,
    deselectAllChats,
    handleBulkRemove,
    handleBulkArchive,
    handleBulkClear,
    handleBulkMarkUnread,
    showMobileListView,
    headerRef,
    isRemoveMode,
    setIsRemoveMode,
    selectedIds,
    handleDeleteSelected,
    openConnectedUsersModal,
    isPageLoading,
    onlineUsers,
    handleLongPressStart,
    handleLongPressEnd,
    setLongPressChat,
    currentTime,
    showDropdown,
    setShowDropdown,
    dropdownPos,
    setDropdownPos,
    blockingUser,
    handleClearChat,
    starredMessages,
    toggleStarMessage,
    setIsMultiSelectMode,
    setSelectedChatIds,
  } = useMessagingCtx();

  return (
    <div className="lg:top-0 lg:z-10 lg:pt-5">
      {/* SHORTCUTS BUTTONs */}
      <div className="hidden border-b border-b-deepBlack/15 pb-8 lg:block lg:pl-2">
        <div className="max-w-[220px]">
          <h3 className="mb-3 text-base font-semibold text-[#242E2A]">
            Shortcuts
          </h3>

          <div className="flex flex-col gap-y-2.5">
            {/* Active/All Conversations Toggle Button */}
            <button
              onClick={() =>
                setCurrentTab(currentTab === "active" ? "all" : "active")
              }
              className={`flex items-center justify-start gap-x-2 rounded-full px-5 py-2 shadow transition-colors ${
                currentTab === "active"
                  ? "bg-darkBlue text-white"
                  : "bg-[#D8E2FD]"
              }`}
            >
              <div className="relative h-6 w-6">
                <img
                  src={
                    currentTab === "active"
                      ? icons.active.active
                      : icons.active.default
                  }
                  className="h-full w-full object-contain"
                  alt="Active Icon"
                />
              </div>
              <p className="text-xs font-medium">
                {currentTab === "active"
                  ? "All Conversations"
                  : "Active Conversations"}
              </p>
            </button>

            {/* Starred Button */}
            <button
              onClick={() => setCurrentTab("starred")}
              className={`flex items-center justify-start gap-x-2 rounded-full px-5 py-2 shadow transition-colors ${
                currentTab === "starred"
                  ? "bg-darkBlue text-white"
                  : "bg-[#FAE0E1]"
              }`}
            >
              <div className="relative h-6 w-6">
                <img
                  src={
                    currentTab === "starred"
                      ? icons.starred.active
                      : icons.starred.default
                  }
                  className="h-full w-full object-contain"
                  alt="Starred Icon"
                />
              </div>
              <p className="text-left text-xs font-medium">Starred Message</p>
            </button>

            {/* ARCHIVE BUTTON (FIRST) */}
            <button
              onClick={() => setCurrentTab("archive")}
              className={`flex items-center justify-start gap-x-2 rounded-full px-5 py-2 shadow transition-colors ${
                currentTab === "archive"
                  ? "bg-[#193E47] text-white"
                  : "bg-[#BCEFF4]"
              }`}
            >
              <div className="relative h-6 w-6">
                <img
                  src={
                    currentTab === "archive"
                      ? icons.archieve.active
                      : icons.archieve.default
                  }
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
                    <img
                      src={images.menu2}
                      className="absolute object-contain"
                      alt="menu"
                    />
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
                        type: "spring",
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
                          <img
                            src={images.removeChat}
                            className="h-5 w-5"
                            alt=""
                          />
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
                          <img
                            src={images.clearChat}
                            className="h-5 w-5"
                            alt=""
                          />
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
                          <img
                            src={images.markUnread}
                            className="h-5 w-5"
                            alt=""
                          />
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
                          <img
                            src={images.archiveChat}
                            className="h-5 w-5"
                            alt=""
                          />
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
              <div
                className="flex items-center justify-center gap-3"
                ref={searchRef}
              >
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
                        <img
                          src={images.aiSearch}
                          className="absolute object-contain"
                          alt="search"
                        />
                      </div>
                    </motion.button>
                  )}

                  {isSearchOpen && (
                    <motion.div
                      key="search-bar"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 22,
                      }}
                      // className="flex w-[70vw] max-w-[380px] rounded-full shadow-[1px_3px_10px_-1px_rgba(0,0,0,0.8),-2px_3px_10px_-1px_rgba(0,0,0,0.8)]"
                      className={`flex rounded-full shadow-[1px_3px_10px_-1px_rgba(0,0,0,0.8),-2px_3px_10px_-1px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out ${
                        isRemoveMode
                          ? "-ml-5 w-[50vw] max-w-[280px]"
                          : "w-[70vw] max-w-[380px]"
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
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="-mt-3 flex items-center justify-center gap-4"
                    >
                      {/* Archive */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSelected();
                        }}
                        disabled={selectedIds.length === 0}
                        className={`relative h-5 w-5 ${selectedIds.length === 0 ? "opacity-40" : ""}`}
                      >
                        <img
                          src={images.archivemobile}
                          className="absolute object-contain"
                        />
                      </button>

                      {/* Cancel */}
                      <button
                        onClick={() => setIsRemoveMode(false)}
                        className="relative h-5 w-5"
                      >
                        <img
                          src={images.bubbleCancel}
                          className="absolute object-contain"
                        />
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
                      const userWithConvo = activeConversationUsers.find(
                        (u) => u.id === user.id,
                      );
                      if (userWithConvo?.encrypted_id) {
                        handleSelectConversation(userWithConvo.encrypted_id);
                      }
                    }}
                  />
                </div>

                <div className="bg-deepBlack pb-4 pl-8 mt-4">
                  <h2 className="font-semibold tracking-wide text-white">
                    Messages
                  </h2>
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
                        {selectedChatIds.length === filteredChats.length
                          ? "Deselect All"
                          : "Select All"}
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
                      <img
                        src={images.archiveChat}
                        className="h-5 w-5"
                        alt=""
                      />
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
                      const other = getOtherParticipant(
                        chat.participants,
                        auth.user.id,
                      );
                      const isUserOnline = other
                        ? onlineUsers.has(other.id)
                        : false;
                      const isSelected = selectedChatIds.includes(
                        chat.encrypted_id,
                      );

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
                              handleLongPressStart(
                                e,
                                chat.encrypted_id,
                                chat.id,
                              );
                            }
                          }}
                          onTouchEnd={handleLongPressEnd}
                          onTouchCancel={handleLongPressEnd}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!isMultiSelectMode) {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
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
                              className={`flex h-4 w-4 flex-shrink-0 -mt-9 items-center justify-center  border-2 transition-colors ${
                                isSelected ? "border-0 bg-primary" : " bg-white"
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
                              name={other?.name || "Unknown"}
                              lastMessage={
                                chat.last_message?.body || "No messages yet"
                              }
                              timeAgo={
                                chat.last_message?.created_at
                                  ? formatTimeAgo(
                                      chat.last_message.created_at,
                                      currentTime,
                                    )
                                  : ""
                              }
                              avatarUrl={
                                other?.profile_picture ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || "U")}`
                              }
                              isOnline={isUserOnline}
                              statusDotColor={
                                isUserOnline ? "bg-[#2ABFBB]" : "bg-gray-400"
                              }
                              isStarred={false}
                              isStarredActive={isConversationSelected(
                                chat.encrypted_id,
                              )}
                              isActiveConversation={isActiveConversation(
                                chat.encrypted_id,
                              )}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="mt-10 text-center text-xs text-gray-400">
                      No conversations
                    </p>
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
                  type: "spring",
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
                    {isActiveConversation(longPressChat.encryptedId)
                      ? "Remove from Active"
                      : "Add to Active"}
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
                <h3 className="text-[17.7px] font-bold text-deepBlack">
                  {" "}
                  All Networks
                </h3>
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
          {currentTab === "all" && (
            <div className="flex items-center justify-between pt-3 lg:ml-4">
              <h4 className="text-base font-semibold text-deepBlue">
                Direct Messages
              </h4>
              {searchingConversations && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent"></div>
                  <span>Searching...</span>
                </div>
              )}
            </div>
          )}
          {currentTab === "active" && (
            <h4 className="pt-3 text-base font-semibold text-deepBlue lg:ml-4">
              Active Conversations
            </h4>
          )}
          {currentTab === "starred" && (
            <h4 className="pt-3 text-base font-semibold text-deepBlue lg:ml-4">
              Starred Messages
            </h4>
          )}

          {currentTab === "archive" && (
            <h4 className="pt-3 text-base font-semibold text-deepBlue lg:ml-4">
              Archived Messages
            </h4>
          )}

          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'all' | 'active' | 'starred' | 'archive')}>
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
                    const other = getOtherParticipant(
                      chat.participants,
                      auth.user.id,
                    );
                    const isUserOnline = other
                      ? onlineUsers.has(other.id)
                      : false;
                    const statusColor = isUserOnline
                      ? "bg-[#2ABFBB]"
                      : "bg-gray-400";
                    const isSelected = isConversationSelected(
                      chat.encrypted_id,
                    );

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
                          onClick={() =>
                            handleSelectConversation(chat.encrypted_id)
                          }
                          className="relative"
                        >
                          <DirectChatCard
                            id={chat.id}
                            name={other?.name || "Unknown"}
                            lastMessage={chat.last_message?.body || ""}
                            timeAgo={
                              chat.last_message?.created_at
                                ? formatTimeAgo(
                                    chat.last_message.created_at,
                                    currentTime,
                                  )
                                : ""
                            }
                            avatarUrl={
                              other?.profile_picture ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || "U")}`
                            }
                            isOnline={isUserOnline}
                            statusDotColor={statusColor}
                            isStarred={false}
                            isStarredActive={isSelected}
                            isActiveConversation={isActiveConversation(
                              chat.encrypted_id,
                            )}
                          />
                        </div>

                        {/* Dropdown options button */}
                        {(isSelected ||
                          hoveredChatId === chat.encrypted_id) && (
                          <div className="absolute top-2 right-3 z-[20]">
                            <DropdownToggle
                              isActive={isSelected}
                              onClick={(e) => {
                                e.stopPropagation();

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                setDropdownPos({
                                  top: rect.top,
                                  left: rect.right,
                                });

                                setShowDropdown(
                                  showDropdown === chat.encrypted_id
                                    ? null
                                    : chat.encrypted_id,
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
                                    onClick={() =>
                                      handleRemoveChat(chat.encrypted_id)
                                    }
                                    disabled={removingFromList}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.removeChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {removingFromList
                                        ? "Removing..."
                                        : "Remove chat"}
                                    </span>
                                  </button>

                                  {/* Clear chat */}
                                  <button
                                    onClick={() =>
                                      handleClearChatById(chat.encrypted_id)
                                    }
                                    disabled={clearingChat}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.clearChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {clearingChat
                                        ? "Clearing..."
                                        : "Clear chat"}
                                    </span>
                                  </button>

                                  {/* Mark unread */}
                                  <button
                                    onClick={() =>
                                      handleMarkAsUnread(chat.encrypted_id)
                                    }
                                    disabled={markingUnread}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.markUnread}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {markingUnread
                                        ? "Marking..."
                                        : "Mark as unread"}
                                    </span>
                                  </button>

                                  {/* Block user */}
                                  <button
                                    onClick={() =>
                                      handleBlockUser(chat.encrypted_id)
                                    }
                                    disabled={blockingUser}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-red-500 hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.blockChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {blockingUser
                                        ? "Blocking..."
                                        : "Block User"}
                                    </span>
                                  </button>

                                  {/* Add to active */}
                                  <button
                                    onClick={() =>
                                      handleAddToActive(chat.encrypted_id)
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60"
                                  >
                                    <img
                                      src={images.addActiveChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {isActiveConversation(chat.encrypted_id)
                                        ? "Remove from Active"
                                        : "Add to Active chat"}
                                    </span>
                                  </button>

                                  <div className="my-1 h-[1.5px] bg-gray-200" />

                                  {/* Archive */}
                                  <button
                                    onClick={() =>
                                      handleArchiveChat(chat.encrypted_id)
                                    }
                                    disabled={archivingChat}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.archiveChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {archivingChat
                                        ? "Archiving..."
                                        : "Archive chat"}
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
                    <p className="text-sm text-gray-500">
                      No conversations found
                    </p>
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
                    const other = getOtherParticipant(
                      chat.participants,
                      auth.user.id,
                    );
                    const isUserOnline = other
                      ? onlineUsers.has(other.id)
                      : false;
                    const statusColor = isUserOnline
                      ? "bg-[#2ABFBB]"
                      : "bg-gray-400";
                    const isSelected = isConversationSelected(
                      chat.encrypted_id,
                    );

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
                          onClick={() =>
                            handleSelectConversation(chat.encrypted_id)
                          }
                          className="relative"
                        >
                          <DirectChatCard
                            id={chat.id}
                            name={other?.name || "Unknown"}
                            lastMessage={chat.last_message?.body || ""}
                            timeAgo={
                              chat.last_message?.created_at
                                ? formatTimeAgo(
                                    chat.last_message.created_at,
                                    currentTime,
                                  )
                                : ""
                            }
                            avatarUrl={
                              other?.profile_picture ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || "U")}`
                            }
                            isOnline={isUserOnline}
                            statusDotColor={statusColor}
                            isStarred={false}
                            isStarredActive={isSelected}
                            isActiveConversation={isActiveConversation(
                              chat.encrypted_id,
                            )}
                          />
                        </div>

                        {/* Dropdown options button */}
                        {(isSelected ||
                          hoveredChatId === chat.encrypted_id) && (
                          <div className="absolute top-2 right-3 z-[20]">
                            <DropdownToggle
                              isActive={isSelected}
                              onClick={(e) => {
                                e.stopPropagation();

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                setDropdownPos({
                                  top: rect.top,
                                  left: rect.right,
                                });

                                setShowDropdown(
                                  showDropdown === chat.encrypted_id
                                    ? null
                                    : chat.encrypted_id,
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
                                    onClick={() =>
                                      handleRemoveChat(chat.encrypted_id)
                                    }
                                    disabled={removingFromList}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.removeChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {removingFromList
                                        ? "Removing..."
                                        : "Remove chat"}
                                    </span>
                                  </button>

                                  {/* Clear chat */}
                                  <button
                                    onClick={() =>
                                      handleClearChatById(chat.encrypted_id)
                                    }
                                    disabled={clearingChat}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.clearChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {clearingChat
                                        ? "Clearing..."
                                        : "Clear chat"}
                                    </span>
                                  </button>

                                  {/* Mark unread */}
                                  <button
                                    onClick={() =>
                                      handleMarkAsUnread(chat.encrypted_id)
                                    }
                                    disabled={markingUnread}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.markUnread}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {markingUnread
                                        ? "Marking..."
                                        : "Mark as unread"}
                                    </span>
                                  </button>

                                  {/* Block user */}
                                  <button
                                    onClick={() =>
                                      handleBlockUser(chat.encrypted_id)
                                    }
                                    disabled={blockingUser}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-red-500 hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.blockChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {blockingUser
                                        ? "Blocking..."
                                        : "Block User"}
                                    </span>
                                  </button>

                                  {/* Remove from active */}
                                  <button
                                    onClick={() =>
                                      handleAddToActive(chat.encrypted_id)
                                    }
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
                                    onClick={() =>
                                      handleArchiveChat(chat.encrypted_id)
                                    }
                                    disabled={archivingChat}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.archiveChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {archivingChat
                                        ? "Archiving..."
                                        : "Archive chat"}
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
                    <p className="text-sm text-gray-500">
                      No active conversations
                    </p>
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
                          const messageElement = document.getElementById(
                            `message-${message.id}`,
                          );
                          if (messageElement) {
                            messageElement.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                            messageElement.classList.add(
                              "ring-2",
                              "ring-[#6E28D9]",
                              "ring-offset-2",
                            );
                            setTimeout(() => {
                              messageElement.classList.remove(
                                "ring-2",
                                "ring-[#6E28D9]",
                                "ring-offset-2",
                              );
                            }, 2000);
                          }
                        }}
                      >
                        {/* Star indicator */}
                        <div className="absolute top-2 right-2 text-yellow-500">
                          ⭐
                        </div>

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
                              {isOwner ? "You" : message.user.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {formatTimeAgo(message.created_at, currentTime)}
                            </p>
                          </div>
                        </div>

                        {/* Message content */}
                        <div
                          className={`rounded-lg p-2 text-xs ${isOwner ? "bg-[#6E28D9]/10 text-[#6E28D9]" : "bg-gray-50 text-gray-700"}`}
                        >
                          {message.file_type ? (
                            <span className="italic">
                              [
                              {message.file_type === "image"
                                ? "📷 Image"
                                : message.file_type === "voice"
                                  ? "🎤 Voice note"
                                  : "📄 Document"}
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
                    <p className="text-sm font-medium text-gray-600">
                      No starred messages
                    </p>
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
                    const other = getOtherParticipant(
                      chat.participants,
                      auth.user.id,
                    );
                    const isUserOnline = other
                      ? onlineUsers.has(other.id)
                      : false;
                    const statusColor = isUserOnline
                      ? "bg-[#2ABFBB]"
                      : "bg-gray-400";
                    const isSelected = isConversationSelected(
                      chat.encrypted_id,
                    );

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
                          onClick={() =>
                            handleSelectConversation(chat.encrypted_id)
                          }
                          className="relative"
                        >
                          <DirectChatCard
                            id={chat.id}
                            name={other?.name || "Unknown"}
                            lastMessage={chat.last_message?.body || ""}
                            timeAgo={
                              chat.last_message?.created_at
                                ? formatTimeAgo(
                                    chat.last_message.created_at,
                                    currentTime,
                                  )
                                : ""
                            }
                            avatarUrl={
                              other?.profile_picture ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || "U")}`
                            }
                            isOnline={isUserOnline}
                            statusDotColor={statusColor}
                            isStarred={false}
                            isStarredActive={isSelected}
                            isActiveConversation={isActiveConversation(
                              chat.encrypted_id,
                            )}
                          />
                        </div>

                        {/* Dropdown options button */}
                        {(isSelected ||
                          hoveredChatId === chat.encrypted_id) && (
                          <div className="absolute top-2 right-3 z-[20]">
                            <DropdownToggle
                              isActive={isSelected}
                              onClick={(e) => {
                                e.stopPropagation();

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                setDropdownPos({
                                  top: rect.top,
                                  left: rect.right,
                                });

                                setShowDropdown(
                                  showDropdown === chat.encrypted_id
                                    ? null
                                    : chat.encrypted_id,
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
                                    onClick={() =>
                                      handleRemoveChat(chat.encrypted_id)
                                    }
                                    disabled={removingFromList}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.removeChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {removingFromList
                                        ? "Removing..."
                                        : "Remove chat"}
                                    </span>
                                  </button>

                                  {/* Clear chat */}
                                  <button
                                    onClick={() =>
                                      handleClearChatById(chat.encrypted_id)
                                    }
                                    disabled={clearingChat}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.clearChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {clearingChat
                                        ? "Clearing..."
                                        : "Clear chat"}
                                    </span>
                                  </button>

                                  {/* Mark unread */}
                                  <button
                                    onClick={() =>
                                      handleMarkAsUnread(chat.encrypted_id)
                                    }
                                    disabled={markingUnread}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-darkBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.markUnread}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {markingUnread
                                        ? "Marking..."
                                        : "Mark as unread"}
                                    </span>
                                  </button>

                                  {/* Block user */}
                                  <button
                                    onClick={() =>
                                      handleBlockUser(chat.encrypted_id)
                                    }
                                    disabled={blockingUser}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-red-500 hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.blockChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {blockingUser
                                        ? "Blocking..."
                                        : "Block User"}
                                    </span>
                                  </button>

                                  {/* Remove from active */}
                                  <button
                                    onClick={() =>
                                      handleAddToActive(chat.encrypted_id)
                                    }
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
                                    onClick={() =>
                                      handleArchiveChat(chat.encrypted_id)
                                    }
                                    disabled={archivingChat}
                                    className="flex w-full items-center gap-3 px-4 py-1.5 text-[10px] text-deepBlue hover:bg-gray-100/60 disabled:opacity-50"
                                  >
                                    <img
                                      src={images.archiveChat}
                                      className="h-5 w-5"
                                      alt=""
                                    />
                                    <span>
                                      {archivingChat
                                        ? "Archiving..."
                                        : "Archive chat"}
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
                    <p className="text-sm text-gray-500">
                      No Archieve conversations
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
