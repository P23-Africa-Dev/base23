import { formatNameCharacters } from '@/utils/format-character';

interface MobileDirectChatCardProps {
    id: number;
    name: string;
    lastMessage: string;
    timeAgo: string;
    avatarUrl: string;
    isOnline: boolean;
    isStarred: boolean;
    isStarredActive?: boolean;
    isActiveConversation?: boolean;
    statusDotColor?: string;
}

const MobileDirectChatCard: React.FC<MobileDirectChatCardProps> = ({
    name,
    lastMessage,
    timeAgo,
    avatarUrl,
    isOnline,
    isStarredActive,
    isActiveConversation,
    statusDotColor,
}) => {
    /* -----------------------------
     * Status dot style resolver
     * ----------------------------- */
    const getDotClasses = () => {
        // Active conversation (avatar dot)
        if (isActiveConversation && isStarredActive) {
            return 'bg-[#2ABFBB] border-2 border-[#193E47]';
        }

        // Online (right-side dot)
        if (isOnline) {
            return 'bg-[#2ABFBB]';
        }

        // Offline (right-side gradient dot)
        return 'bg-gradient-to-b from-[#EE8821] to-[#F05831]';
    };

    return (
        <div className={`flex cursor-pointer flex-col justify-between rounded-3xl mb-2  py-0`}>
      
            <div className="flex items-center justify-between pb-2">
                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-start gap-y-4">
                                {/* Avatar */}
                                <div className="relative">
                                    <img src={avatarUrl} alt={`${name}'s avatar`} className="h-12 w-12 rounded-full object-cover" />

                                    {/* Avatar dot – ONLY for active */}
                                    {isActiveConversation && isStarredActive && (
                                        <span
                                            className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full transition-all duration-300 ${getDotClasses()} `}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col items-start gap-y-2.5">
                                <div className="flex max-w-[145px] flex-col">
                                    <p className="text-xs font-semibold text-darkBlue">{name}</p>
                                    <p className="mt-1 text-[9.5px] leading-3 tracking-wide text-deepBlack">
                                        {formatNameCharacters(lastMessage, 35)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Right-side status dot (online / offline only) */}

                        <div>
                            {statusDotColor && isOnline ? (
                                <div className="flex h-4 w-4 items-center justify-center bg-white">
                                    <div className={`h-3 w-3 rounded-full transition-all duration-300 ${getDotClasses()} `} />
                                </div>
                            ) : (
                                <div className="flex h-4 w-4 items-center justify-center bg-white">
                                    <div className={`h-3 w-3 rounded-full transition-all duration-300 ${getDotClasses()} `} />
                                </div>
                            )}

                        
                        </div>
                    </div>

                    <div className="flex w-[280px] items-center justify-end space-x-10">
                        <p className="text-[9px] font-semibold">Last chat</p>

                        <p className="-mr-2 text-[7px]">{timeAgo}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileDirectChatCard;
