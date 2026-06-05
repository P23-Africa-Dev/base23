'use client';
import ConnectionModal from '@/components/modals/ConnectionModal';
import UserDetailedSidebar from '@/components/sidebars/user-profile';
import images from '@/constants/image';
import { formatCharacters, formatNameCharacters } from '@/utils/format-character';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Star } from 'lucide-react';
import React, { useState } from 'react';

type Variant = 'all' | 'connections' | 'saved-directory' | 'pending';

//
interface UserProfileSidebarProps {
    name: string;
    title: string;
    imageSrc: string;
    experience: string;
    industry: string;
    interest: string;
    reviews: string;
    baseLocation: string;
    operatesIn: string;
    bio: string;
    companyStage: string;
    keyStrength: string;
    topGoal: string;
    brnMemberSince: string;
    responseRate: string;
    successfulDealsRate: string;
}

interface ExtraProps {
    userId: number;
    authUserId: number;
    variant: Variant;
    onConnect?: (userId: number) => void;
    onStartConversation?: (userId: number) => void;
    onSaveUser?: (userId: number) => void;
    onRemoveSavedUser?: (userId: number) => void;
    savedUserIds?: number[];
    loadingUserId?: number | null;
    connected?: { id: number }[];
    pending?: { id: number; direction?: 'incoming' | 'outgoing' }[];
    conversations?: { id?: string; encrypted_id?: string; participants?: { id: number }[] }[];
}

const DirectoryLeadsSidebar: React.FC<UserProfileSidebarProps & ExtraProps> = ({
    name,
    title,
    imageSrc,
    experience,
    industry,
    interest,
    reviews,
    baseLocation,
    operatesIn,
    bio,
    companyStage,
    keyStrength,
    topGoal,
    brnMemberSince,
    responseRate,
    successfulDealsRate,
    userId,
    authUserId,
    variant,
    onConnect,
    onStartConversation,
    onSaveUser,
    onRemoveSavedUser,
    savedUserIds = [],
    loadingUserId,
    connected,
    pending,
    conversations = [],
}) => {
    const { user: authUser } = useAuth();
    const auth = authUser ? { user: { id: authUser.id } } : undefined;
    // Connection status logic with direction for incoming/outgoing requests
    let connectionStatus: 'none' | 'pending' | 'accepted' = 'none';
    let connectionDirection: 'incoming' | 'outgoing' | undefined = undefined;
    if (!connected || !pending) {
        // If not present, warn developer to provide these props from the parent page (e.g., dashboard or user profile page)
        console.warn('Sidebar: connected/pending props missing. Ensure parent page provides them from database.');
    } else if (connected.some((u) => u.id === userId)) {
        connectionStatus = 'accepted';
    } else {
        const pendingConnection = pending.find((u) => u.id === userId);
        if (pendingConnection) {
            connectionStatus = 'pending';
            connectionDirection = pendingConnection.direction;
        }
    }
    const [loading, setLoading] = useState(false);
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [isConnectingAndMessaging, setIsConnectingAndMessaging] = useState(false);
    const [loadingConnectionId, setLoadingConnectionId] = useState<number | null>(null);

    // Find existing conversation with this user (if any)
    let conversationLink: string | null = null;
    if (Array.isArray(conversations) && auth?.user?.id) {
        const found = conversations.find((c) => {
            // Direct message: only 2 participants, and the other is userId
            if (c.participants && c.participants.length === 2 && auth.user) {
                return c.participants.some((p) => p.id === userId) && !!auth.user && c.participants.some((p) => p.id === auth.user?.id);
            }
            return false;
        });
        if (found && found.encrypted_id) {
            conversationLink = `/message/single?conversation=${found.encrypted_id}`;
        }
    }

    const handleStartConversation = () => {
        if (onStartConversation) {
            onStartConversation(userId);
        } else if (conversationLink) {
            window.location.href = conversationLink;
        } else {
            setLoading(true);
            axios.post('/messages/start', { user_id: userId, redirect_to: 'message/single' })
                .then((res) => { window.location.href = res.data.redirect ?? '/message'; })
                .catch((err) => console.error('Failed to start conversation:', err))
                .finally(() => setLoading(false));
        }
    };

    const handleMessageIconClick = () => {
        if (connectionStatus === 'accepted') {
            handleStartConversation();
        } else {
            setShowConnectionModal(true);
        }
    };

    const handleConnectAndMessage = async () => {
        setIsConnectingAndMessaging(true);
        try {
            await axios.post('/connections/send', { connected_user_id: userId });
            const res = await axios.post('/messages/start', { user_id: userId, redirect_to: 'message/single' });
            window.location.href = res.data.redirect ?? '/message';
        } catch (err) {
            console.error('Failed to connect and message:', err);
        } finally {
            setIsConnectingAndMessaging(false);
            setShowConnectionModal(false);
        }
    };

    const isCurrentUserLoading = loadingUserId === userId || loading;

    const handleConnect = () => {
        if (onConnect) {
            onConnect(userId);
        } else {
            setLoading(true);
            axios.post('/connections/send', { connected_user_id: userId })
                .then(() => window.location.reload())
                .finally(() => setLoading(false));
        }
    };

    React.useEffect(() => {}, [connected, pending]);

    const handleConnectionAction = (userId: number, action: 'accept' | 'reject') => {
        setLoadingConnectionId(userId);
        const url = action === 'accept' ? '/connections/accept' : '/connections/reject';
        axios.post(url, { user_id: userId })
            .then(() => window.location.reload())
            .catch((err) => console.error('Connection action failed:', err))
            .finally(() => setLoadingConnectionId(null));
    };

    return (
        <>
            <div className="h-[98vh] max-h-[96vh] w-full overflow-y-hidden rounded-tl-4xl rounded-tr-[37px] rounded-br-[37px] rounded-bl-4xl border-2 border-none bg-white p-2 pr-5 shadow-[-2px_-6px_5px_-3px_rgba(0,0,0,0.1),-5px_10px_5px_-3px_rgba(0,0,0,0.1)] outline-0">
                <div className="no-scrollbar flex h-full flex-col overflow-y-auto rounded-3xl md:overflow-y-hidden">
                    {/* Profile Header Section */}
                    <div
                        className="relative flex h-[68%] flex-col items-center justify-end rounded-3xl bg-cover bg-top text-white shadow-[0px_-2px_10px_-3px_rgba(0,0,0,0.5),5px_5px_10px_-4px_rgba(0,0,0,0.4)] md:h-[66%]"
                        style={{
                            backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.1)), url(${imageSrc})`,
                        }}
                    >
                        <div
                            style={{
                                backgroundImage: ` url(${images.blurProfilename})`,
                            }}
                            className="absolute bottom-15 rounded-xl bg-cover bg-center bg-no-repeat px-3 pl-5 text-right"
                        >
                            <div className="py-4 pr-3">
                                <h1 className="text-2xl leading-5 font-bold"> {formatNameCharacters(`${name}`, 12)}</h1>
                                <p className="mt-1 text-sm font-medium">{title}</p>
                            </div>
                        </div>
                    </div>
                    {/* Content Section */}

                    <div className="mt-3 no-scrollbar h-[32%] w-full overflow-hidden rounded-tl-[67px] bg-darkBlue md:h-[34%] xl:min-h-[200px]">
                        {/* Details Grid */}
                        <div className="flex h-auto w-full flex-col rounded-tl-[67px] rounded-bl-2xl bg-darkBlue px-5 py-3 pt-5 pl-7 lg:min-h-[30px]">
                            <div className="flex w-full pl-5">
                                <div className="grid grid-cols-3 gap-1">
                                    <div className="grid w-[200px] grid-cols-2 gap-3 pb-4">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-semibold text-secondaryWhite">Experience</p>
                                            <p className="text-[11px] font-extralight text-secondaryWhite">
                                                {formatCharacters(`${experience}`, 2, 5, false)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-semibold text-secondaryWhite">Industry</p>
                                            <p className="text-[11px] font-extralight text-secondaryWhite">
                                                {' '}
                                                {formatCharacters(`${industry}`, 2, 3)}
                                            </p>
                                        </div>
                                        <div className="col-span-2 flex flex-col">
                                            <p className="text-xs font-semibold text-secondaryWhite">Interest</p>
                                            <p className="text-[11px] font-extralight text-secondaryWhite">{formatCharacters(`${interest}`, 2, 5)}</p>
                                        </div>
                                    </div>

                                    <div className="col-start-1 col-end-3 mb-4 flex items-center space-x-2 pb-4 md:pb-2">
                                        <p className="text-base font-bold text-secondaryWhite md:text-[14px]">{reviews}</p>
                                        <Star className="h-5 w-5 fill-[#27E6A7] text-[#27E6A7]" />
                                    </div>
                                </div>
                                <div className="flex items-start justify-between">
                                    <div className="flex w-full flex-col gap-2">
                                        {/* The "Users" button now triggers the new UserDetailedSidebar */}
                                        <UserDetailedSidebar
                                            name={name}
                                            title={title}
                                            imageSrc={imageSrc}
                                            reviews={reviews}
                                            baseLocation={baseLocation}
                                            operatesIn={operatesIn}
                                            bio={bio}
                                            experience={experience}
                                            interest={interest}
                                            industry={industry}
                                            companyStage={companyStage}
                                            keyStrength={keyStrength}
                                            topGoal={topGoal}
                                            brnMemberSince={brnMemberSince}
                                            responseRate={responseRate}
                                            successfulDealsRate={successfulDealsRate}
                                        >
                                            <button
                                                title="View User Details"
                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600"
                                            >
                                                <img src={images.userList} className="h-6 w-6" alt="" />
                                            </button>
                                        </UserDetailedSidebar>

                                        {/* DIFFERENT BUTTONS BASED ON VARIANTS  */}
                                        {(variant === 'all' || variant === 'saved-directory') && (
                                            <button
                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600"
                                                onClick={handleMessageIconClick}
                                                title={connectionStatus === 'accepted' ? 'Send Message' : 'Connect first to send messages'}
                                            >
                                                <img src={images.messageO} className="h-6 w-6" alt="" />
                                            </button>
                                        )}

                                        {variant === 'connections' && (
                                            <>
                                                {connectionStatus === 'accepted' ? (
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600"
                                                        onClick={handleMessageIconClick}
                                                        title="Send Message"
                                                    >
                                                        <img src={images.messageO} className="h-6 w-6" alt="" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600 ${loadingConnectionId === userId ? 'cursor-not-allowed opacity-50' : ''
                                                            }`}
                                                        onClick={() => handleConnectionAction(userId, 'reject')}
                                                        disabled={loadingConnectionId === userId}
                                                        title="Cancel Connection Request"
                                                    >
                                                        {loadingConnectionId === userId ? (
                                                            <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-[#193E47] border-t-transparent"></div>
                                                        ) : (
                                                            <img src={images.directoryCancelIcon} className="h-6 w-6" alt="Cancel Connection" />
                                                        )}
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {variant === 'pending' && (
                                            <>
                                                {connectionStatus === 'accepted' ? (
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600"
                                                        onClick={handleMessageIconClick}
                                                        title="Send Message"
                                                    >
                                                        <img src={images.messageO} className="h-6 w-6" alt="" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600"
                                                        onClick={handleConnect}
                                                        title="Send Connection Request"
                                                    >
                                                        <img src={images.connectLink} className="h-4.5 w-4.5" alt="" />
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        <button
                                            title="Start Video Call"
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600"
                                        >
                                            <img src={images.videoCamera} className="h-6 w-6" alt="" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* DIFFERENT BUTTONS BASED ON VARIANTS */}
                            <div className="mt-2 flex space-x-3">
                                {/* RIGHT SIDE BUTTONS */}

                                <>
                                    {/** ALL DIRECTORY VARIANT */}
                                    {(variant === 'all' || variant === 'saved-directory') && (
                                        <>
                                            {userId !== authUserId && connectionStatus === 'accepted' ? (
                                                <button
                                                    className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#A47AF0] from-45% to-[#CCA6FF] px-3.5 py-0.5 whitespace-nowrap text-secondaryWhite"
                                                    onClick={() => {
                                                        if (conversationLink) {
                                                            if (conversationLink) window.location.href = conversationLink;
                                                        } else {
                                                            handleStartConversation();
                                                        }
                                                    }}
                                                    disabled={isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent">
                                                        <img src={images.messageConnectimage} className="h-6 w-6" alt="Message" />
                                                    </span>
                                                    <span className="text-[11px]">{isCurrentUserLoading ? 'Loading...' : 'Message Now'}</span>
                                                </button>
                                            ) : userId !== authUserId && connectionStatus === 'pending' && connectionDirection === 'incoming' ? (
                                                <button
                                                    className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#22C55E] from-45% to-[#4ADE80] px-3.5 py-1.5 whitespace-nowrap text-secondaryWhite"
                                                    onClick={() => handleConnectionAction(userId, 'accept')}
                                                    disabled={isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondaryWhite">
                                                        <img src={images.connectLink} className="h-4 w-4" alt="Accept" />
                                                    </span>
                                                    <span className="text-[11px]">
                                                        {isCurrentUserLoading ? 'Accepting...' : 'Accept Request'}
                                                    </span>
                                                </button>
                                            ) : userId !== authUserId ? (
                                                <button
                                                    className={`flex items-center justify-center gap-2 rounded-md px-3.5 py-1.5 whitespace-nowrap text-secondaryWhite ${connectionStatus === 'pending'
                                                        ? 'bg-gray-400'
                                                        : 'bg-gradient-to-r from-[#A47AF0] from-45% to-[#CCA6FF]'
                                                        }`}
                                                    onClick={handleConnect}
                                                    disabled={connectionStatus !== 'none' || isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondaryWhite">
                                                        <img src={images.connectLink} className="h-4 w-4" alt="Connect" />
                                                    </span>
                                                    <span className="text-[11px]">
                                                        {connectionStatus === 'pending'
                                                            ? 'Pending'
                                                            : isCurrentUserLoading
                                                                ? 'Connecting...'
                                                                : 'Connect Now'}
                                                    </span>
                                                </button>
                                            ) : null}
                                        </>
                                    )}

                                    {/** CONNECTIONS VARIANT */}

                                    {variant === 'connections' && (
                                        <>
                                            {connectionStatus === 'accepted' ? (
                                                <button
                                                    className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#A47AF0] from-45% to-[#CCA6FF] px-3.5 py-1.5 whitespace-nowrap text-secondaryWhite"
                                                    onClick={() => {
                                                        if (conversationLink) {
                                                            if (conversationLink) window.location.href = conversationLink;
                                                        } else {
                                                            handleStartConversation();
                                                        }
                                                    }}
                                                    disabled={isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent">
                                                        <img src={images.messageConnectimage} className="h-6 w-6" alt="Message" />
                                                    </span>
                                                    <span className="text-[11px]">{isCurrentUserLoading ? 'Loading...' : 'Message Now'}</span>
                                                </button>
                                            ) : connectionStatus === 'pending' && connectionDirection === 'incoming' ? (
                                                <button
                                                    className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#22C55E] from-45% to-[#4ADE80] px-3.5 py-1.5 whitespace-nowrap text-secondaryWhite"
                                                    onClick={() => handleConnectionAction(userId, 'accept')}
                                                    disabled={isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondaryWhite">
                                                        <img src={images.connectLink} className="h-4 w-4" alt="Accept" />
                                                    </span>
                                                    <span className="text-[11px]">
                                                        {isCurrentUserLoading ? 'Accepting...' : 'Accept Request'}
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    className={`flex items-center justify-center gap-2 rounded-md px-3.5 py-1.5 whitespace-nowrap text-secondaryWhite ${connectionStatus === 'pending'
                                                        ? 'bg-gray-400'
                                                        : 'bg-gradient-to-r from-[#A47AF0] from-45% to-[#CCA6FF]'
                                                        }`}
                                                    onClick={handleConnect}
                                                    disabled={connectionStatus === 'pending' || isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondaryWhite">
                                                        <img src={images.connectLink} className="h-4 w-4" alt="Connect" />
                                                    </span>
                                                    <span className="text-[11px]">
                                                        {connectionStatus === 'pending'
                                                            ? 'Pending'
                                                            : isCurrentUserLoading
                                                                ? 'Connecting...'
                                                                : 'Connect Now'}
                                                    </span>
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {variant === 'pending' && userId !== authUserId && (
                                        <>
                                            {connectionStatus === 'accepted' ? (
                                                <button
                                                    className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#A47AF0] from-45% to-[#CCA6FF] px-3.5 py-1.5 whitespace-nowrap text-secondaryWhite"
                                                    onClick={() => {
                                                        if (conversationLink) {
                                                            if (conversationLink) window.location.href = conversationLink;
                                                        } else {
                                                            handleStartConversation();
                                                        }
                                                    }}
                                                    disabled={isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent">
                                                        <img src={images.messageConnectimage} className="h-6 w-6" alt="Message" />
                                                    </span>
                                                    <span className="text-[11px]">{isCurrentUserLoading ? 'Loading...' : 'Message Now'}</span>
                                                </button>
                                            ) : connectionStatus === 'pending' && connectionDirection === 'incoming' ? (
                                                <button
                                                    className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#22C55E] from-45% to-[#4ADE80] px-3.5 py-1.5 whitespace-nowrap text-secondaryWhite"
                                                    onClick={() => handleConnectionAction(userId, 'accept')}
                                                    disabled={isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondaryWhite">
                                                        <img src={images.connectLink} className="h-4 w-4" alt="Accept" />
                                                    </span>
                                                    <span className="text-[11px]">
                                                        {isCurrentUserLoading ? 'Accepting...' : 'Accept Request'}
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    className={`flex items-center justify-center gap-2 rounded-md px-3.5 py-1.5 whitespace-nowrap text-secondaryWhite ${connectionStatus === 'pending'
                                                        ? 'bg-gray-400'
                                                        : 'bg-gradient-to-r from-[#A47AF0] from-45% to-[#CCA6FF]'
                                                        }`}
                                                    onClick={handleConnect}
                                                    disabled={connectionStatus === 'pending' || isCurrentUserLoading}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondaryWhite">
                                                        <img src={images.connectLink} className="h-4 w-4" alt="Connect" />
                                                    </span>
                                                    <span className="text-[11px]">
                                                        {connectionStatus === 'pending'
                                                            ? 'Pending'
                                                            : isCurrentUserLoading
                                                                ? 'Connecting...'
                                                                : 'Connect Now'}
                                                    </span>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </>

                                {/* LEFT SIDE BUTTONS */}
                                <>
                                    {/** Save For Later - shows when user is not saved yet */}
                                    {(variant === 'all' || variant === 'pending') && !savedUserIds.includes(userId) && (
                                        <button
                                            className={`flex items-center gap-2 rounded-full bg-transparent px-3 py-1.5 whitespace-nowrap text-secondaryWhite hover:bg-white/10 ${loadingUserId === userId ? 'cursor-not-allowed opacity-50' : ''
                                                }`}
                                            onClick={() => onSaveUser?.(userId)}
                                            disabled={loadingUserId === userId}
                                            title="Save for later"
                                        >
                                            <div className="relative h-6 w-6">
                                                {loadingUserId === userId ? (
                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                ) : (
                                                    <img src={images.bookmark} className="absolute object-contain" alt="" />
                                                )}
                                            </div>
                                            <span className="hidden text-[11px] md:block">Save for later</span>
                                        </button>
                                    )}

                                    {/** Remove from Saved - shows when user is already saved (in all/pending tabs) */}
                                    {(variant === 'all' || variant === 'pending') && savedUserIds.includes(userId) && (
                                        <button
                                            className={`flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1.5 whitespace-nowrap text-green-400 hover:bg-red-500/20 hover:text-red-400 ${loadingUserId === userId ? 'cursor-not-allowed opacity-50' : ''
                                                }`}
                                            onClick={() => onRemoveSavedUser?.(userId)}
                                            disabled={loadingUserId === userId}
                                            title="Remove from saved"
                                        >
                                            <div className="relative h-6 w-6">
                                                {loadingUserId === userId ? (
                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-400 border-t-transparent"></div>
                                                ) : (
                                                    <img src={images.bookmark} className="absolute object-contain" alt="" />
                                                )}
                                            </div>
                                            <span className="hidden text-[11px] md:block">Saved ✓</span>
                                        </button>
                                    )}

                                    {/** CONNECTIONS VARIANT */}
                                    {variant === 'connections' && (
                                        <button className="flex items-center gap-2 rounded-full bg-transparent px-3 py-1.5 whitespace-nowrap text-secondaryWhite">
                                            <div className="relative h-6 w-6">
                                                <img src={images.reportuser} className="absolute object-contain" alt="" />
                                            </div>
                                            <span className="text-[11px]">Report User</span>
                                        </button>
                                    )}

                                    {/** SAVED DIRECTORY VARIANT - Remove button */}
                                    {variant === 'saved-directory' && (
                                        <button
                                            className={`flex items-center gap-2 rounded-full bg-transparent px-4 py-1.5 whitespace-nowrap text-secondaryWhite hover:bg-red-500/20 hover:text-red-400 ${loadingUserId === userId ? 'cursor-not-allowed opacity-50' : ''
                                                }`}
                                            onClick={() => onRemoveSavedUser?.(userId)}
                                            disabled={loadingUserId === userId}
                                            title="Remove from saved directory"
                                        >
                                            <div className="relative h-6 w-6">
                                                {loadingUserId === userId ? (
                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                ) : (
                                                    <img src={images.directoryRemoveIcon} className="absolute object-contain" alt="" />
                                                )}
                                            </div>
                                            <span className="text-[11px]">{loadingUserId === userId ? 'Removing...' : 'Remove'}</span>
                                        </button>
                                    )}
                                </>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connection Modal */}
            <ConnectionModal
                isOpen={showConnectionModal}
                onClose={() => setShowConnectionModal(false)}
                onConnectAndMessage={handleConnectAndMessage}
                userName={name}
                userImage={imageSrc}
                isLoading={isConnectingAndMessaging}
            />
        </>
    );
};

export default DirectoryLeadsSidebar;
