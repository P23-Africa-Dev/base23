export type HeaderMode = 'default' | 'selection';

export type User = {
    id: number;
    name: string;
    profile_picture?: string;
    title?: string;
    experience?: string;
    industry?: string;
    interest?: string;
    reviews?: string;
    base_location?: string;
    operates_in?: string;
    bio?: string;
    company_stage?: string;
    key_strength?: string;
    top_goal?: string;
    created_at?: string;
    response_rate?: string;
    successful_deals_rate?: string;
};

export type Message = {
    id: number;
    body: string;
    user: User;
    created_at: string;
    isOptimistic?: boolean;
    edited_at?: string | null;
    is_deleted?: boolean;
    file_path?: string | null;
    file_type?: 'image' | 'document' | 'voice' | 'video' | null;
    file_name?: string | null;
    file_size?: number | null;
    file_url?: string | null;
    read_status?: Array<{
        user_id: number;
        user_name: string;
        read_at: string;
    }>;
    is_starred?: boolean;
    is_pinned?: boolean;
    reply_to?: {
        id: number;
        body: string;
        user: User;
    } | null;
};

export type ConversationListItem = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id?: any;
    encrypted_id: string;
    title?: string | null;
    participants: User[];
    unread_count?: number;
    last_message?: {
        body: string;
        created_at: string;
        is_read?: boolean;
    } | null;
};

export type Props = {
    conversation?: {
        id: number;
        encrypted_id: string;
        title?: string | null;
        participants: User[];
    };
    conversations?: ConversationListItem[];
    messages?: Message[];
    activeConversationRawIds?: number[];
    auth: {
        user: User;
    };
};

export type SelectedConversation = {
    id: number | null;
    encrypted_id: string;
    participants: User[];
    title?: string | null;
};
