import type { User } from '@/types/messages';

export function getOtherParticipant(participants: User[], currentUserId: number): User | null {
    if (!participants || participants.length < 2) return null;
    return participants.find((u) => u.id !== currentUserId) || null;
}

export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid time';
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatTimeAgo(dateString: string, currentTime?: Date): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid time';

    const now = currentTime || new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInHours < 24) return 'Few hours ago';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
}

export function getDocumentIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return '📕';
        case 'doc':
        case 'docx':
            return '📄';
        case 'xls':
        case 'xlsx':
            return '📊';
        case 'ppt':
        case 'pptx':
            return '📊';
        case 'txt':
            return '📝';
        case 'zip':
        case 'rar':
            return '🗂️';
        default:
            return '📄';
    }
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
