import { formatNameCharacters } from "@/utils/format-character";

// Define the structure for the chat item data
interface RecentChatCardProps {
    name: string;
    lastMessage: string;
    timeAgo: string;
    avatarUrl: string;
    isOnline: boolean;
    statusDotColor: string;
    unreadCount?: number;
    hasNewMessage?: boolean;
}
const RecentChatCard: React.FC<RecentChatCardProps> = ({
    name,
    lastMessage,
    timeAgo,
    avatarUrl,
    isOnline,
    statusDotColor,
    unreadCount = 0,
    hasNewMessage = false,
}) => {
    return (
        <div
            className={`flex cursor-pointer flex-col justify-between px-5 py-4 pr-12 text-deepBlack shadow-[-2px_-2px_2px_-3px_rgba(0,0,0,0.1),-5px_5px_2px_-3px_rgba(0,0,0,0.1)] ${
                hasNewMessage ? 'border-l-4 border-blue-500 bg-blue-50' : 'bg-white'
            }`}
        >
            <div className="flex justify-between pb-4">
                <div className="flex items-center space-x-4 self-center">
                    {/* Avatar and Status Dot Container */}
                    <div className="relative">
                        <img className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100" src={avatarUrl} alt={`${name}'s avatar`} />
                        {isOnline && (
                            <span
                                className={`absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${statusDotColor}`}
                                aria-label="Online status"
                            ></span>
                        )}
                    </div>
                    {/* Content */}
                    <div className="flex max-w-[200px] flex-col">
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                            <p className={`text-sm font-semibold text-darkBlue ${hasNewMessage ? 'font-bold' : ''}`}>{name}</p>
                        </div>
                        <p className={`text-[11px] ${hasNewMessage ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{formatNameCharacters(lastMessage, 15)} </p>
                    </div>
                </div>
                {/* Right Section: Status Dot and New Message Indicator */}
                <div className="flex items-center gap-2">
                    {hasNewMessage && <div className="h-2 w-2 rounded-full bg-blue-500" aria-label="New message indicator"></div>}
                    {isOnline && <div className={`h-3 w-3 rounded-full ${statusDotColor}`} aria-label="Status indicator"></div>}
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <p className="text-xs font-semibold">Last chat</p>
                <p className="text-xs text-[9px]">{timeAgo}</p>
            </div>
        </div>
    );
};

export default RecentChatCard;
