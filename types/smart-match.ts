// Smart Match Types

export interface SmartMatchPreferences {
    // New preference structure
    user_needs: string | null;
    preferred_industry: PreferredIndustry | null;
    business_level: BusinessLevel | null;
    selected_tags: string[] | null;
    // Legacy fields (kept for backward compatibility)
    preferred_role?: PreferredRole | null;
    preferred_company_stage?: PreferredCompanyStage | null;
    preferred_geography?: PreferredGeography | null;
}

// New preference types
export type PreferredIndustry =
    | 'Technology & Digital Services'
    | 'Financial & Professional Services'
    | 'Manufacturing & Industrial'
    | 'Healthcare & Pharmaceuticals'
    | 'Energy & Utilities'
    | 'Retail & Consumer Goods'
    | 'Logistics & Transportation'
    | 'Agriculture & Food Processing'
    | 'Real Estate & Construction'
    | 'Media & Communications'
    | 'Education & Training'
    | 'Government & Public Services'
    | 'Environmental & Specialized Services';

export type BusinessLevel = 'Below 5 years' | '5 - 10 years' | '10+ years';

// Legacy types (kept for backward compatibility)
export type PreferredRole = 'Founders' | 'Executives' | 'Managers' | 'Consultant' | 'Investor';

export type PreferredCompanyStage = 'Small' | 'Medium' | 'Large';

export type PreferredGeography = 'Local' | 'International' | 'No preference';

// All available industries for selection
export const INDUSTRIES: PreferredIndustry[] = [
    'Technology & Digital Services',
    'Financial & Professional Services',
    'Manufacturing & Industrial',
    'Healthcare & Pharmaceuticals',
    'Energy & Utilities',
    'Retail & Consumer Goods',
    'Logistics & Transportation',
    'Agriculture & Food Processing',
    'Real Estate & Construction',
    'Media & Communications',
    'Education & Training',
    'Government & Public Services',
    'Environmental & Specialized Services',
];

// Business level options
export const BUSINESS_LEVELS: BusinessLevel[] = ['Below 5 years', '5 - 10 years', '10+ years'];

export interface CompatibilityBreakdown {
    // New breakdown fields
    industry_match: number;
    business_level_match: number;
    tags_match: number;
    needs_match: number;
    ai_similarity_score?: number;
    // Legacy fields (kept for backward compatibility)
    role_match?: number;
    company_stage_match?: number;
    geography_match?: number;
}

export interface SmartMatchUser {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
    position: string | null;
    company_name: string | null;
    industry: string | null;
    country: string | null;
    company_stage: string;
    compatibility: number;
    compatibility_breakdown: CompatibilityBreakdown;
    match_reasons: string[];
    ai_insights?: string;
    // User's stated needs (what they need help with)
    user_needs?: string | null;
    preferred_industry?: string | null;
    business_level?: string | null;
    selected_tags?: string[] | null;
}

export interface RecentNetworkUser {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
    position: string | null;
    company_name: string | null;
    company_description: string | null;
    industry: string | null;
    country: string | null;
    great_at: string | null;
    can_help_with: string | null;
    goals: string | null;
    categories: string | null;
    years_of_operation: string | null;
    number_of_employees: string | null;
    year_established: number | null;
    member_since: string | null;
    connected_at: string;
    connection_status: string | null;
}

export interface ConnectionStatus {
    status: 'none' | 'pending' | 'accepted' | 'rejected';
    direction: 'incoming' | 'outgoing' | null;
}

export interface MatchedUserInfo {
    id: number;
    name: string;
    profile_picture: string | null;
    position: string | null;
    company_name: string | null;
}

export interface ConversationInfo {
    id: number;
    encrypted_id: string;
}

export interface MatchResult {
    success: boolean;
    connection_status: string;
    connection_id: number | null;
    conversation_id: number | null;
    message: string;
    // Extended fields for MatchSidebar
    matched_user?: MatchedUserInfo | null;
    current_user?: MatchedUserInfo | null;
    conversation?: ConversationInfo | null;
}

export interface SendSmartMatchRequest {
    recipient_id: number;
    compatibility: number;
    match_reasons?: string[];
    why_this_match?: string;
}

export interface SendSmartMatchResponse {
    success: boolean;
    message: string;
    notification_id?: number | null;
    smart_match_id?: number | null;
}

export interface AcceptSmartMatchRequest {
    sender_id: number;
    notification_id?: number;
    recipient_needs?: string;
}

export interface AcceptSmartMatchResponse {
    success: boolean;
    message: string;
    conversation_id?: number | null;
    encrypted_conversation_id?: string | null;
    first_message_sent?: boolean;
}

export interface AcceptSmartMatchResponse {
    success: boolean;
    message: string;
    conversation_id?: number | null;
    encrypted_conversation_id?: string | null;
    first_message_sent?: boolean;
}

export interface SmartMatchesResponse {
    success: boolean;
    matches: SmartMatchUser[];
    total_count: number;
    has_preferences: boolean;
    message?: string | null;
}

export interface PreferencesResponse {
    success: boolean;
    preferences: SmartMatchPreferences | null;
    message?: string | null;
}

export interface RecentNetworkResponse {
    success: boolean;
    connections: RecentNetworkUser[];
    total_count: number;
}

export interface CompatibilityResponse {
    success: boolean;
    compatibility: number;
    breakdown: CompatibilityBreakdown;
    reasons: string[];
    ai_insights?: string;
}

// Step content mapping for the preference setup flow (Updated 4-step flow)
export const PREFERENCE_STEP_CONTENT = {
    1: {
        title: 'What do you need help with?',
        subtitle: "Describe what you're looking for or the problem you want to solve",
        field: 'user_needs' as const,
        type: 'text-input' as const,
    },
    2: {
        title: 'Select your preferred industry',
        subtitle: 'Choose the industry most relevant to your needs',
        field: 'preferred_industry' as const,
        type: 'single-select-industry' as const,
        options: INDUSTRIES,
    },
    3: {
        title: 'Business experience level',
        subtitle: 'Select the years of operation you prefer to work with',
        field: 'business_level' as const,
        type: 'single-select' as const,
        options: BUSINESS_LEVELS,
    },
    4: {
        title: 'Select relevant tags',
        subtitle: 'Choose up to 5 tags that best describe what you need',
        field: 'selected_tags' as const,
        type: 'tag-select' as const,
        maxTags: 5,
    },
    5: {
        title: 'Review your preferences',
        subtitle: 'Please confirm your selections before proceeding',
        field: 'summary' as const,
        type: 'summary' as const,
    },
} as const;

// Legacy step content (kept for backward compatibility)
export const LEGACY_PREFERENCE_STEP_CONTENT = {
    1: {
        title: 'Who do you prefer to connect with?',
        field: 'preferred_role' as const,
        options: ['Founders', 'Executives', 'Managers', 'Consultant', 'Investor'] as PreferredRole[],
    },
    2: {
        title: 'What company stage do you prefer to engage with?',
        field: 'preferred_company_stage' as const,
        options: ['Small', 'Medium', 'Large'] as PreferredCompanyStage[],
    },
    3: {
        title: 'Geographic relevance of your ideal connections (Country)',
        field: 'preferred_geography' as const,
        options: ['Local', 'International', 'No preference'] as PreferredGeography[],
    },
} as const;
