import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    subscription?: {
        is_active: boolean;
        on_trial: boolean;
        status: string;
        trial_days_remaining: number;
        trial_ends_at?: string | null;
        current_period_end?: string | null;
    } | null;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    profile_picture?: string;
    company_name?: string;
    company_description?: string;
    industry?: string;
    phone?: string;
    linkedin?: string;
    country?: string;
    position?: string;
    years_of_operation?: string;
    number_of_employees?: string;
    selected_outcome?: string;
    goals?: string;
    categories?: string;
    great_at?: string[];
    can_help_with?: string[];
    email_verified_at: string | null;
    is_admin?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface PageProps {
    auth: {
        user?: User;
    };
}
