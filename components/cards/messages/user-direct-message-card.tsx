// import { formatNameCharacters } from "@/utils/format-character";

// // Define the structure for the chat item data
// interface DirectChatCardProps {
//     id: number;
//     name: string;
//     lastMessage: string;
//     timeAgo: string;
//     avatarUrl: string;
//     isOnline: boolean;
//     isStarred: boolean;
//     isStarredActive?: boolean;
//     statusDotColor: string;
//     isActiveConversation?: boolean;
// }

// const DirectChatCard: React.FC<DirectChatCardProps> = ({ name, lastMessage, timeAgo, avatarUrl, isOnline, statusDotColor, isStarredActive, isActiveConversation }) => {
//     return (
// <div
//     className={`flex cursor-pointer flex-col justify-between rounded-4xl px-5 py-3 shadow-[-2px_-2px_2px_-3px_rgba(0,0,0,0.1),-5px_5px_2px_-3px_rgba(0,0,0,0.1)] ${
//         isStarredActive ? 'bg-darkBlue text-white' : 'bg-white hover:bg-[#ECECEC] text-deepBlack'
//     }`}
// >
//             <div className="flex items-center justify-between pb-2">
//                 <div className="flex items-center space-x-4">
//                     {/* Avatar and Status Dot Container */}
//                     <di\v className="relative">
//                         <img className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100" src={avatarUrl} alt={`${name}'s avatar`} />
//                         <span
//                             className={`absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${statusDotColor}`}
//                             aria-label={isOnline ? "Online" : "Offline"}
//                         ></span>
//                     </di>

//                     {/* Content */}
//                     <div className="flex max-w-[145px] flex-col">
//                         <p className="text-sm font-semibold">{name}</p>
//                         <p className="text-[10px]">{formatNameCharacters(lastMessage, 35)}</p>
//                     </div>
//                 </div>

//                 {/* Right Section: Active Conversation Icon or Status Dot */}
//                 <div className="flex items-center justify-center">
//                     {/* Lightning/Flash icon for both active and non-active conversations */}
//                     <svg
//                         className={`h-4 w-4 ${!isActiveConversation
//                             ? (isStarredActive ? 'text-blue-600' : 'text-blue-600')
//                             : (isStarredActive ? 'text-transparent' : 'text-transparent')
//                         }`}
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                         aria-label={!isActiveConversation ? "Active Conversation" : "Non-Active Conversation"}
//                     >
//                         <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
//                     </svg>
//                 </div>
//             </div>

//             <div className="flex items-center space-x-6">
//                 <p className="text-xs font-semibold">Last chat</p>
//                 <p className="text-xs text-[9px]">{timeAgo}</p>
//             </div>
//         </div>
//     );
// };

// export default DirectChatCard;

import { formatNameCharacters } from '@/utils/format-character';

interface DirectChatCardProps {
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

const DirectChatCard: React.FC<DirectChatCardProps> = ({
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
        <div
            className={`flex cursor-pointer flex-col justify-between rounded-3xl px-5 py-3 shadow-[2px_-1px_2px_-4px_rgba(0,0,0,0.3),-2px_2px_2px_-1px_rgba(0,0,0,0.3)] lg:mx-2 ${
                isStarredActive ? 'bg-darkBlue text-white' : 'bg-white text-deepBlack hover:bg-[#ECECEC]'
            }`}
        >
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-start gap-y-4">
                        {/* Avatar */}
                        <div className="relative">
                            <img src={avatarUrl} alt={`${name}'s avatar`} className="h-10 w-10 rounded-full object-cover" />

                            {/* Avatar dot – ONLY for active */}
                            {isActiveConversation && isStarredActive && (
                                <span
                                    className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full transition-all duration-300 ${getDotClasses()} `}
                                />
                            )}
                        </div>

                        <div>
                            <p className="text-[9px] font-semibold">Last chat</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col items-start gap-y-2.5">
                        <div className="flex max-w-[145px] flex-col">
                            <p className="text-sm font-semibold">{name}</p>
                            <p className="mt-1 text-[9.5px] leading-3 tracking-wide">{formatNameCharacters(lastMessage, 35)}</p>
                        </div>

                        <div className="flex items-center space-x-6">
                            <p className="text-[7px]">{timeAgo}</p>
                        </div>
                    </div>
                </div>

              
                <div>
                    {statusDotColor && isOnline ? (
                        <div className="flex h-5 w-5 items-center justify-center">
                            <div className={`h-3.5 w-3.5 rounded-full transition-all duration-300 ${getDotClasses()} `} />
                        </div>
                    ) : (
                        <div className="flex h-5 w-5 items-center justify-center">
                            <div className={`h-3.5 w-3.5 rounded-full transition-all duration-300 ${getDotClasses()} `} />
                        </div>
                    )}
                </div>

                {/* Right-side status dot (online / offline only) */}
            </div>
        </div>
    );
};

export default DirectChatCard;
