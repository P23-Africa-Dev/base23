'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import images from '@/constants/image';
import { formatText } from '@/utils/format-character';
import axios from 'axios';
import { usePathname } from 'next/navigation';

import { Star } from 'lucide-react';
import React, { useState } from 'react';
import UserDetailedSidebar from './user-profile';

type Variant = 'all' | 'connections' | 'saved-directory' | 'pending';

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
    children: React.ReactNode;
    connected?: Array<{ id: number; name: string }>;
    pending?: Array<{ id: number; name: string }>;
    saveButtonLabel?: string; // Custom label for the save button
    saveButtonIcon?: React.ReactNode; // Custom icon for the save button
}

interface ExtraProps {
    variant: Variant;
}

const UserProfileSidebar: React.FC<UserProfileSidebarProps & ExtraProps & { userId: number; authUserId: number }> = ({
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
    children,
    userId,
    authUserId,
    connected,
    pending,
    variant,
    saveButtonLabel = 'Save for later',
    saveButtonIcon,
}) => {
    let connectionStatus: 'none' | 'pending' | 'accepted' = 'none';
    if (!connected || !pending) {
        // If not present, warn developer to provide these props from the parent page (e.g., dashboard or user profile page)
        console.warn('Sidebar: connected/pending props missing. Ensure parent page provides them from database.');
    } else if (connected.some((u) => u.id === userId)) {
        connectionStatus = 'accepted';
    } else if (pending.some((u) => u.id === userId)) {
        connectionStatus = 'pending';
    }
    const [loading, setLoading] = useState(false);

    const pathname = usePathname();
    const isHomePage = pathname.startsWith('/');

    const handleConnect = () => {
        setLoading(true);
        axios.post('/connections/send', { connected_user_id: userId })
            .then(() => window.location.reload())
            .finally(() => setLoading(false));
    };

    // Listen for changes in connected/pending to update UI after accept/decline
    React.useEffect(() => {
        // This effect will re-render the button as soon as connection status changes
    }, [connected, pending]);

    const handleStartConversation = () => {
        setLoading(true);
        axios.post('/messages/start', { user_id: userId, redirect_to: 'message/single' })
            .then((res) => { window.location.href = res.data.redirect ?? '/message'; })
            .catch((err) => console.error('Failed to start conversation:', err))
            .finally(() => setLoading(false));
    };

    function formatArrayData(data: string | string[] | null | undefined): string {
        if (!data) return 'Not specified';

        // If it's already a string, return it
        if (typeof data === 'string') {
            try {
                // Try to parse if it's a JSON string
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed.join(', ');
                }
                return data;
            } catch {
                // If parsing fails, return the string as is
                return data;
            }
        }

        // If it's an array, join with commas
        if (Array.isArray(data)) {
            return data.join(', ');
        }

        return 'Not specified';
    }

    function formatDate(dateString: string | null | undefined): string {
        if (!dateString) return 'Not available';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                {/* UserCard component triggers this sidebar */}
                <div className="cursor-pointer">{children}</div>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="top-[53px] h-[80vh] max-w-[240px] overflow-y-hidden rounded-tl-4xl rounded-bl-4xl border-none bg-white p-2 outline-0 sm:max-w-[310px] md:overflow-y-auto md:rounded-tr-4xl md:rounded-br-4xl lg:top-0 lg:h-screen lg:max-w-[360px] [&>button.absolute.right-4.top-4]:hidden shadow-[-2px_-2px_6px_-3px_rgba(0,0,0,0.6),-2px_2px_6px_-3px_rgba(0,0,0,0.6)]"
            >
                <div className="no-scrollbar flex h-full flex-col overflow-y-hidden rounded-tl-3xl rounded-tr-none rounded-br-none shadow-lg md:overflow-y-auto md:rounded-3xl">
                    {/* Profile Header Section */}
                    <div
                        className="relative flex h-[300px] flex-col items-center justify-end rounded-3xl rounded-tl-3xl rounded-tr-none rounded-br-none bg-cover bg-top text-white shadow-[0px_-2px_10px_-3px_rgba(0,0,0,0.5),5px_5px_10px_-4px_rgba(0,0,0,0.4)] md:h-[66%]"
                        style={{
                            backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.1)), url(${imageSrc})`,
                        }}
                    >
                        {/* blurProfilename */}
                        <div
                            style={{
                                backgroundImage: ` url(${images.blurProfilename})`,
                            }}
                            className="absolute bottom-8 bg-cover bg-center bg-no-repeat px-3 pl-5 text-right md:bottom-15"
                        >
                            <div className="py-3">
                                <h1 className="text-sm leading-3.5 font-bold md:text-base lg:text-2xl"> {formatText(`${name}`, 15)}</h1>
                                <p className="mt-1 text-xs font-medium md:text-sm"> {formatText(`${title}`, 20)}</p>
                            </div>
                        </div>
                    </div>
                    {/* Content Section */}
                    <div className="mt-2 no-scrollbar w-full rounded-tl-[67px] border md:h-[34%] xl:min-h-[200px]">
                        {/* Details Grid */}
                        <div className="flex h-full w-full flex-col rounded-tl-[50px] rounded-br-none rounded-bl-2xl bg-darkBlue px-5 pt-5 pb-10 pl-6 md:h-auto md:py-3 md:pt-8 md:pb-14 md:pl-7 lg:mb-0 lg:rounded-tl-[67px] lg:pt-5">
                            <div className="flex w-full flex-col md:mt-0 md:flex-row md:pl-2.5">
                                <div className="grid grid-cols-3 gap-1">
                                    <div className="grid w-[200px] grid-cols-2 gap-3 pb-3.5">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-semibold text-secondaryWhite md:text-xs">Experience</p>
                                            <p className="text-[9.5px] font-extralight text-secondaryWhite md:text-[11px]">
                                                {' '}
                                                {formatText(`${experience}`, 6)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-semibold text-secondaryWhite md:text-xs">Industry</p>
                                            <p className="text-[9.5px] font-extralight text-secondaryWhite md:text-[11px]">
                                                {' '}
                                                {formatText(`${industry}`, 6)}
                                            </p>
                                        </div>
                                        <div className="col-span-2 flex flex-col">
                                            <p className="text-[10px] font-semibold text-secondaryWhite md:text-xs">Interest</p>
                                            <p className="text-[9.5px] font-extralight text-secondaryWhite md:text-[11px]">
                                                {' '}
                                                {formatText(`${interest}`, 19)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-start-1 col-end-3 flex items-center space-x-2 pb-3 md:pb-8">
                                        <p className="text-[13px] font-bold text-secondaryWhite md:text-[14px]">{reviews}</p>
                                        <Star className="h-4.5 w-4.5 fill-[#27E6A7] text-[#27E6A7] md:h-5 md:w-5" />
                                    </div>
                                </div>
                                <div className="flex items-start justify-between">
                                    <div className="flex w-full gap-2 md:flex-col">
                                        <UserDetailedSidebar
                                            name={name}
                                            title={title}
                                            imageSrc={imageSrc}
                                            reviews={reviews}
                                            baseLocation={baseLocation}
                                            operatesIn={operatesIn}
                                            bio={bio}
                                            experience={experience}
                                            interest={formatArrayData(interest)}
                                            industry={industry}
                                            companyStage={companyStage}
                                            keyStrength={formatArrayData(keyStrength)}
                                            topGoal={topGoal}
                                            brnMemberSince={formatDate(brnMemberSince)}
                                            responseRate={responseRate}
                                            successfulDealsRate={successfulDealsRate}
                                        >
                                            <button className="flex h-[42px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600 md:h-9 md:w-9">
                                                <img src={images.userList} className="h-6 w-6 md:h-6 md:w-6" alt="" />
                                            </button>
                                        </UserDetailedSidebar>
                                        {variant === 'pending' ? (
                                            <>
                                                <button className="flex h-[42px] w-[45px] items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600 md:h-9 md:w-9">
                                                    <img src={images.directoryCancelIcon} className="h-6 w-6 md:h-6 md:w-6" alt="" />
                                                </button>
                                            </>
                                        ) : (
                                            <button className="flex h-[42px] w-[45px] items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600 md:h-9 md:w-9">
                                                <img src={images.messageO} className="h-6 w-6 md:h-6 md:w-6" alt="" />
                                            </button>
                                        )}

                                        <button className="flex h-[42px] w-[45px] items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600 md:h-9 md:w-9">
                                            <img src={images.creditCard} className="h-6 w-6 md:h-6 md:w-6" alt="" />
                                        </button>
                                        {/* <button className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-[#D7F6EC] p-1 hover:text-gray-600 md:h-9 md:w-9">
                                            <img src={images.videoCamera} className="h-5 w-5 md:h-6 md:w-6" alt="" />
                                        </button> */}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Currently commented out as handlers are not implemented */}
                            <div className="mt-4 transform translate-y-[12px] flex space-x-3 md:mt-0 md:space-x-1.5 lg:-mt-4">
                                {userId !== authUserId &&
                                    (connectionStatus === 'accepted' ? (
                                        <button
                                            className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#A47AF0] from-45% to-[#CCA6FF] px-3.5 py-1.5   whitespace-nowrap text-secondaryWhite"
                                            onClick={handleStartConversation}
                                            disabled={loading}
                                        >
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent">
                                                <img src={images.messageO} className="h-6 w-6" alt="" />
                                            </span>
                                            <span className="text-[11px]">{loading ? 'Loading...' : 'Message Now'}</span>
                                        </button>
                                    ) : (
                                        <button
                                            className={`flex items-center justify-center gap-2 rounded-md px-3.5 py-2.5 font-medium whitespace-nowrap text-secondaryWhite ${connectionStatus === 'pending' ? 'bg-gray-400' : 'bg-[#7937F1] from-[#A47AF0] from-45% to-[#CCA6FF] md:bg-gradient-to-r'}`}
                                            onClick={handleConnect}
                                            disabled={connectionStatus !== 'none' || loading}
                                        >
                                            <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-secondaryWhite">
                                                <img src={images.connectLink} className="h-2.5 w-2.5" alt="" />
                                            </span>
                                            <span className="text-[12px]">
                                                {connectionStatus === 'pending' ? 'Pending' : loading ? 'Connecting...' : 'Connect Now'}
                                            </span>
                                        </button>
                                    ))}
                                <button className="flex items-center gap-2 transform -translate-x-[10px] lg:-translate-x-[0px] rounded-full bg-transparent px-3 py-2 whitespace-nowrap text-secondaryWhite">
                                    <div className="relative h-5.5 w-5.5 flex items-center justify-center">
                                        {saveButtonIcon ? (
                                            saveButtonIcon
                                        ) : (
                                            <img src={images.bookmark} className="absolute object-contain" alt="" />
                                        )}
                                    </div>
                                    <span className="hidden text-[11px] md:block">{saveButtonLabel}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default UserProfileSidebar;
