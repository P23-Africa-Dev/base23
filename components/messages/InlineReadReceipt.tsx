'use client';

import type { Message } from '@/types/messages';

type Props = {
    message: Message;
    isOwner: boolean;
    currentUserId: number;
    isLight?: boolean;
};

export default function InlineReadReceipt({ message, isOwner, currentUserId, isLight = false }: Props) {
    if (!isOwner) return null;
    if (message.isOptimistic || message.is_deleted) return null;

    const readByOthers = message.read_status?.filter((r) => r.user_id !== currentUserId) || [];
    const hasBeenRead = readByOthers.length > 0;

    const checkMarkColor = isLight ? 'text-gray-600' : 'text-white/70';
    const readCheckMarkColor = isLight ? 'text-blue-500' : 'text-blue-300';

    return (
        <span className="ml-2 inline-flex items-center">
            {hasBeenRead ? (
                <span className="flex items-center" title={`Read by: ${readByOthers.map((r) => r.user_name).join(', ')}`}>
                    <svg className={`h-3 w-3 ${readCheckMarkColor}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    <svg className={`-ml-1.5 h-3 w-3 ${readCheckMarkColor}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                </span>
            ) : (
                <span title="Message sent">
                    <svg className={`h-3 w-3 ${checkMarkColor}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                </span>
            )}
        </span>
    );
}
