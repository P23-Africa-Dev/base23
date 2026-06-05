import images from '@/constants/image';

export type ChatUser = {
    id: number;
    name: string;
    message: string;
    time: string;
    avatar: string;
};

export const INITIAL_USERS: ChatUser[] = [
    {
        id: 1,
        name: 'John Doe',
        message: 'Hey, are we still meeting later?',
        time: '2h ago',
        avatar: images.man2,
    },
    {
        id: 2,
        name: 'Sarah Miles',
        message: 'Sent you the files',
        time: '3h ago',
        avatar: images.man2,
    },
    {
        id: 3,
        name: 'Alex Brown',
        message: 'Let’s reschedule',
        time: '5h ago',
        avatar: images.man2,
    },
    {
        id: 4,
        name: 'Micheal Young',
        message: 'Okay 👍',
        time: '1d ago',
        avatar: images.man2,
    },
    {
        id: 5,
        name: 'Jane Smith',
        message: 'Thanks!',
        time: '2d ago',
        avatar: images.man2,
    },
];

type ChatUserCardProps = {
    user: ChatUser;
    isRemoveMode: boolean;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
};

export default function ChatUserCard({ user, isRemoveMode, isSelected, onToggleSelect }: ChatUserCardProps) {
    const handleCardClick = () => {
        if (!isRemoveMode) return;
        onToggleSelect(user.id);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`flex flex-col rounded-xl py-3 transition-colors ${isRemoveMode ? 'cursor-pointer' : 'cursor-default'} `}
        >
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div
                            style={{ backgroundImage: `url(${user.avatar})` }}
                            className="h-[60px] w-[60px] rounded-full bg-cover bg-top bg-no-repeat"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex max-w-[145px] flex-col">
                        <p className="text-sm font-semibold text-darkBlue">{user.name}</p>
                        <p className="text-[10px]">{user.message}</p>
                    </div>
                </div>

                {/* Checkbox */}

                {/* Right Section: Active Conversation Icon or Status Dot */}
                <div className="flex items-center justify-center">
                    {/* Lightning/Flash icon */}
                    {!isRemoveMode && (
                        <div className="relative">
                            <span
                                className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-[#2ABFBB] ring-2 ring-white"
                                aria-label="Online"
                            ></span>
                        </div>
                    )}

                    {/* Display until when the delete button to is toggle */}
                    {isRemoveMode && <input type="checkbox" className="h-4 w-4 accent-purple-600" onClick={(e) => e.stopPropagation()} />}
                </div>
            </div>

            <div className="flex justify-end">
                <div className="flex w-[60vw] max-w-[180px] items-center justify-between">
                    <p className="text-xs font-semibold">Last chat</p>
                    <p className="text-[9px] text-darkBlue">{user.time}</p>
                </div>
            </div>
        </div>
    );
}
