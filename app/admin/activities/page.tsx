'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    SkeletonText,
    SkeletonCard,
    SkeletonUserCard
} from '@/components/ui/skeleton-loaders';
import axios from 'axios';
import { format } from 'date-fns';

type ActivityType = 
    | 'login' 
    | 'logout' 
    | 'online' 
    | 'offline' 
    | 'connection_request' 
    | 'connection_accepted' 
    | 'chat_initiated' 
    | 'message_sent' 
    | 'page_visit' 
    | 'profile_update'
    | 'search_performed';

type UserActivity = {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    activity_type: ActivityType;
    description: string;
    metadata: {
        ip_address?: string;
        user_agent?: string;
        browser?: string;
        os?: string;
        device_type?: string;
        page_url?: string;
        target_user_id?: number;
        target_user_name?: string;
        session_duration?: number;
        [key: string]: any;
    };
    created_at: string;
    updated_at: string;
};

type UserStats = {
    total_users: number;
    active_users_today: number;
    online_users: number;
    total_logins_today: number;
    total_connections_today: number;
    total_messages_today: number;
    total_page_views_today: number;
    peak_online_time: string;
    avg_session_duration: number;
};

type AnalyticsData = {
    activity_trends: {
        dates: string[];
        activity_counts: number[];
    };
    hourly_activity: {
        hours: number[];
        counts: number[];
    };
    activity_type_distribution: {
        types: string[];
        counts: number[];
    };
    device_stats: {
        device_types: string[];
        counts: number[];
    };
    browser_stats: {
        browsers: string[];
        counts: number[];
    };
    top_pages: {
        pages: string[];
        views: number[];
    };
};

interface Props extends PageProps {
    activities?: UserActivity[];
    stats?: UserStats;
}

const ActivityIcon = ({ type }: { type: ActivityType }) => {
    const iconMap = {
        login: '🔐',
        logout: '🚪',
        online: '🟢',
        offline: '⚫',
        connection_request: '🤝',
        connection_accepted: '✅',
        chat_initiated: '💬',
        message_sent: '📨',
        page_visit: '👁️',
        profile_update: '✏️',
        search_performed: '🔍'
    };
    
    return <span className="text-lg">{iconMap[type] || '📋'}</span>;
};

const ActivityTypeFilter = ({ 
    selectedTypes, 
    onToggle 
}: { 
    selectedTypes: ActivityType[]; 
    onToggle: (type: ActivityType) => void;
}) => {
    const activityTypes: { type: ActivityType; label: string; color: string }[] = [
        { type: 'login', label: 'Login', color: 'bg-green-100 text-green-800' },
        { type: 'logout', label: 'Logout', color: 'bg-red-100 text-red-800' },
        { type: 'online', label: 'Online', color: 'bg-emerald-100 text-emerald-800' },
        { type: 'offline', label: 'Offline', color: 'bg-gray-100 text-gray-800' },
        { type: 'connection_request', label: 'Connection Request', color: 'bg-blue-100 text-blue-800' },
        { type: 'connection_accepted', label: 'Connection Accepted', color: 'bg-purple-100 text-purple-800' },
        { type: 'chat_initiated', label: 'Chat Started', color: 'bg-indigo-100 text-indigo-800' },
        { type: 'message_sent', label: 'Message Sent', color: 'bg-teal-100 text-teal-800' },
        { type: 'page_visit', label: 'Page Visit', color: 'bg-orange-100 text-orange-800' },
        { type: 'profile_update', label: 'Profile Update', color: 'bg-pink-100 text-pink-800' },
        { type: 'search_performed', label: 'Search', color: 'bg-yellow-100 text-yellow-800' }
    ];

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {activityTypes.map(({ type, label, color }) => (
                <button
                    key={type}
                    onClick={() => onToggle(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedTypes.includes(type) 
                            ? color + ' ring-2 ring-offset-1' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <ActivityIcon type={type} /> {label}
                </button>
            ))}
        </div>
    );
};

export default function AdminActivities({ auth, activities = [], stats }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'users' | 'analytics'>('overview');
    const [activityData, setActivityData] = useState<UserActivity[]>(activities);
    const [userStats, setUserStats] = useState<UserStats | null>(stats || null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedActivityTypes, setSelectedActivityTypes] = useState<ActivityType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('today');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Fetch activities and stats
    const fetchActivities = async (page = 1) => {
        setIsLoading(true);
        try {
            // Get CSRF token for authentication
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const params: any = {
                page,
                per_page: 50,
                date_range: dateRange
            };
            
            // Only add activity_types if some are selected
            if (selectedActivityTypes.length > 0) {
                params.activity_types = selectedActivityTypes.join(',');
            }
            
            // Only add search if it's not empty
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }
            
            const response = await axios.get('/api/admin/activities', {
                params,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                withCredentials: true,
            });
            
            if (response.data.success) {
                setActivityData(response.data.data.activities);
                setTotalPages(response.data.data.pagination.last_page);
                setCurrentPage(response.data.data.pagination.current_page);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Get CSRF token for authentication
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await axios.get('/api/admin/activities/stats', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                withCredentials: true,
            });
            
            if (response.data.success) {
                setUserStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchOnlineUsers = async () => {
        try {
            // Get CSRF token for authentication
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await axios.get('/api/admin/activities/online-users', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                withCredentials: true,
            });
            
            if (response.data.success) {
                setOnlineUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch online users:', error);
        }
    };

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            // Get CSRF token for authentication
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await axios.get('/api/admin/activities/analytics', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                withCredentials: true,
            });
            
            if (response.data.success) {
                setAnalyticsData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };


    useEffect(() => {
        fetchStats();
        fetchOnlineUsers();
        
        // Refresh data every 30 seconds
        const interval = setInterval(() => {
            fetchStats();
            fetchOnlineUsers();
            if (activeTab === 'activities') {
                fetchActivities(currentPage);
            } else if (activeTab === 'analytics') {
                fetchAnalytics();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTab === 'activities') {
            fetchActivities(1);
        } else if (activeTab === 'analytics') {
            fetchAnalytics();
        }
    }, [selectedActivityTypes, searchQuery, dateRange, activeTab]);

    const toggleActivityType = (type: ActivityType) => {
        setSelectedActivityTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return `${Math.floor(diffInMs / (1000 * 60))} minutes ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else {
            return format(date, 'MMM dd, yyyy HH:mm');
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes > 0) {
                return `${hours}h ${remainingMinutes}m`;
            }
            return `${hours}h`;
        }
        return `${minutes}m`;
    };

    const getActivityColor = (type: ActivityType) => {
        const colorMap = {
            login: 'text-green-600 bg-green-50',
            logout: 'text-red-600 bg-red-50',
            online: 'text-emerald-600 bg-emerald-50',
            offline: 'text-gray-600 bg-gray-50',
            connection_request: 'text-blue-600 bg-blue-50',
            connection_accepted: 'text-purple-600 bg-purple-50',
            chat_initiated: 'text-indigo-600 bg-indigo-50',
            message_sent: 'text-teal-600 bg-teal-50',
            page_visit: 'text-orange-600 bg-orange-50',
            profile_update: 'text-pink-600 bg-pink-50',
            search_performed: 'text-yellow-600 bg-yellow-50'
        };
        return colorMap[type] || 'text-gray-600 bg-gray-50';
    };

    const StatCard = ({ title, value, subtitle, icon }: { 
        title: string; 
        value: string | number; 
        subtitle?: string; 
        icon: string;
    }) => (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className="text-2xl">{icon}</div>
            </div>
        </div>
    );

    return (
        <AppLayout>
            
            
            <div className="relative border-0 bg-transparent pt-0 pb-2.5 lg:bg-white dark:lg:bg-gray-900">
                <div className="relative z-[3] flex flex-1 rounded-4xl bg-cover bg-no-repeat lg:mt-1.5 lg:py-2">
                    <div className="relative z-[10] no-scrollbar flex h-screen max-h-[96vh] w-full flex-col gap-3 overflow-y-auto px-2 pb-1 lg:py-0 lg:pr-9 lg:pl-7 xl:pr-17 xl:pl-12">
                        
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Activities Management
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Monitor and analyze all user activities across the platform
                            </p>
                        </div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-6">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="activities">Activities</TabsTrigger>
                                <TabsTrigger value="users">Online Users</TabsTrigger>
                                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview">
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    {userStats ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <StatCard 
                                                title="Total Users" 
                                                value={userStats.total_users}
                                                icon="👥"
                                            />
                                            <StatCard 
                                                title="Active Today" 
                                                value={userStats.active_users_today}
                                                subtitle="users active today"
                                                icon="🔥"
                                            />
                                            <StatCard 
                                                title="Currently Online" 
                                                value={userStats.online_users}
                                                subtitle="users online now"
                                                icon="🟢"
                                            />
                                            <StatCard 
                                                title="Logins Today" 
                                                value={userStats.total_logins_today}
                                                icon="🔐"
                                            />
                                            <StatCard 
                                                title="Connections Today" 
                                                value={userStats.total_connections_today}
                                                icon="🤝"
                                            />
                                            <StatCard 
                                                title="Messages Today" 
                                                value={userStats.total_messages_today}
                                                icon="💬"
                                            />
                                            <StatCard 
                                                title="Page Views Today" 
                                                value={userStats.total_page_views_today}
                                                icon="👁️"
                                            />
                                            <StatCard 
                                                title="Avg Session" 
                                                value={formatDuration(Math.round(userStats.avg_session_duration))}
                                                subtitle="average duration"
                                                icon="⏱️"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <SkeletonCard key={i} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Recent Activities Preview */}
                                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                                        <div className="space-y-3">
                                            {activityData.slice(0, 5).map((activity) => (
                                                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <ActivityIcon type={activity.activity_type} />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {activity.user_name}
                                                        </p>
                                                        <p className="text-xs text-gray-600">{activity.description}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimeAgo(activity.created_at)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Activities Tab */}
                            <TabsContent value="activities">
                                <div className="space-y-4">
                                    {/* Filters */}
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                        <div className="flex flex-col lg:flex-row gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Search activities, users, or descriptions..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <select
                                                value={dateRange}
                                                onChange={(e) => setDateRange(e.target.value)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="today">Today</option>
                                                <option value="yesterday">Yesterday</option>
                                                <option value="last_7_days">Last 7 Days</option>
                                                <option value="last_30_days">Last 30 Days</option>
                                                <option value="this_month">This Month</option>
                                            </select>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <ActivityTypeFilter 
                                                selectedTypes={selectedActivityTypes}
                                                onToggle={toggleActivityType}
                                            />
                                        </div>
                                    </div>

                                    {/* Activities List */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                User Activities
                                                {selectedActivityTypes.length > 0 && (
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        ({selectedActivityTypes.length} filter{selectedActivityTypes.length !== 1 ? 's' : ''} applied)
                                                    </span>
                                                )}
                                            </h3>
                                        </div>
                                        
                                        <div className="divide-y divide-gray-200">
                                            {isLoading ? (
                                                Array.from({ length: 10 }).map((_, i) => (
                                                    <div key={i} className="p-4">
                                                        <SkeletonText />
                                                    </div>
                                                ))
                                            ) : activityData.length > 0 ? (
                                                activityData.map((activity) => (
                                                    <motion.div
                                                        key={activity.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-start space-x-4">
                                                            <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                                                                <ActivityIcon type={activity.activity_type} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {activity.user_name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {activity.user_email}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatTimeAgo(activity.created_at)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-700 mt-1">
                                                                    {activity.description}
                                                                </p>
                                                                
                                                                {/* Metadata */}
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {activity.metadata.ip_address && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                                                            📍 {activity.metadata.ip_address}
                                                                        </span>
                                                                    )}
                                                                    {activity.metadata.browser && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                                            🌐 {activity.metadata.browser}
                                                                        </span>
                                                                    )}
                                                                    {activity.metadata.os && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                                            💻 {activity.metadata.os}
                                                                        </span>
                                                                    )}
                                                                    {activity.metadata.device_type && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                                            📱 {activity.metadata.device_type}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-500">
                                                    <p>No activities found matching your filters.</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                                                <button
                                                    onClick={() => fetchActivities(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                <span className="text-sm text-gray-700">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => fetchActivities(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Online Users Tab */}
                            <TabsContent value="users">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Currently Online Users ({onlineUsers.length})
                                        </h3>
                                    </div>
                                    
                                    <div className="divide-y divide-gray-200">
                                        {onlineUsers.length > 0 ? (
                                            onlineUsers.map((user) => (
                                                <div key={user.id} className="p-4 flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            {user.profile_picture ? (
                                                                <img 
                                                                    src={user.profile_picture} 
                                                                    alt={user.name}
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                        {user.last_activity && (
                                                            <p className="text-xs text-green-600">
                                                                Active {formatTimeAgo(user.last_activity)}
                                                            </p>
                                                        )}
                                                        {user.last_activity_description && (
                                                            <p className="text-xs text-gray-500">
                                                                {user.last_activity_description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                            🟢 Online
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <p>No users are currently online.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Analytics Tab */}
                            <TabsContent value="analytics">
                                <div className="space-y-6">
                                    {analyticsLoading ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <SkeletonCard key={i} />
                                            ))}
                                        </div>
                                    ) : analyticsData ? (
                                        <>
                                            {/* Activity Trends Chart */}
                                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trends (Last 7 Days)</h3>
                                                <ReactApexChart
                                                    options={{
                                                        chart: {
                                                            type: 'line',
                                                            height: 350,
                                                            toolbar: { show: false },
                                                        },
                                                        xaxis: {
                                                            categories: analyticsData.activity_trends.dates,
                                                            type: 'category',
                                                        },
                                                        yaxis: {
                                                            title: {
                                                                text: 'Number of Activities'
                                                            }
                                                        },
                                                        stroke: {
                                                            curve: 'smooth',
                                                            width: 3,
                                                        },
                                                        colors: ['#3B82F6'],
                                                        dataLabels: {
                                                            enabled: false,
                                                        },
                                                        grid: {
                                                            strokeDashArray: 4,
                                                        },
                                                    }}
                                                    series={[{
                                                        name: 'Activities',
                                                        data: analyticsData.activity_trends.activity_counts
                                                    }]}
                                                    type="line"
                                                    height={350}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Hourly Activity Chart */}
                                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Hours</h3>
                                                    <ReactApexChart
                                                        options={{
                                                            chart: {
                                                                type: 'bar',
                                                                height: 300,
                                                                toolbar: { show: false },
                                                            },
                                                            xaxis: {
                                                                categories: analyticsData.hourly_activity.hours.map(h => `${h}:00`),
                                                                title: {
                                                                    text: 'Hour of Day'
                                                                }
                                                            },
                                                            yaxis: {
                                                                title: {
                                                                    text: 'Activity Count'
                                                                }
                                                            },
                                                            colors: ['#10B981'],
                                                            dataLabels: {
                                                                enabled: false,
                                                            },
                                                        }}
                                                        series={[{
                                                            name: 'Activities',
                                                            data: analyticsData.hourly_activity.counts
                                                        }]}
                                                        type="bar"
                                                        height={300}
                                                    />
                                                </div>

                                                {/* Activity Type Distribution */}
                                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h3>
                                                    <ReactApexChart
                                                        options={{
                                                            chart: {
                                                                type: 'donut',
                                                                height: 300,
                                                            },
                                                            labels: analyticsData.activity_type_distribution.types,
                                                            colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
                                                            dataLabels: {
                                                                enabled: true,
                                                            },
                                                            legend: {
                                                                position: 'bottom',
                                                            },
                                                        }}
                                                        series={analyticsData.activity_type_distribution.counts}
                                                        type="donut"
                                                        height={300}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Device Statistics */}
                                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
                                                    <ReactApexChart
                                                        options={{
                                                            chart: {
                                                                type: 'pie',
                                                                height: 300,
                                                            },
                                                            labels: analyticsData.device_stats.device_types,
                                                            colors: ['#3B82F6', '#10B981', '#F59E0B'],
                                                            dataLabels: {
                                                                enabled: true,
                                                            },
                                                            legend: {
                                                                position: 'bottom',
                                                            },
                                                        }}
                                                        series={analyticsData.device_stats.counts}
                                                        type="pie"
                                                        height={300}
                                                    />
                                                </div>

                                                {/* Browser Statistics */}
                                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Usage</h3>
                                                    <ReactApexChart
                                                        options={{
                                                            chart: {
                                                                type: 'bar',
                                                                height: 300,
                                                                toolbar: { show: false },
                                                            },
                                                            xaxis: {
                                                                categories: analyticsData.browser_stats.browsers,
                                                            },
                                                            colors: ['#8B5CF6'],
                                                            dataLabels: {
                                                                enabled: false,
                                                            },
                                                            plotOptions: {
                                                                bar: {
                                                                    horizontal: true,
                                                                }
                                                            }
                                                        }}
                                                        series={[{
                                                            name: 'Users',
                                                            data: analyticsData.browser_stats.counts
                                                        }]}
                                                        type="bar"
                                                        height={300}
                                                    />
                                                </div>
                                            </div>

                                            {/* Top Pages */}
                                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Visited Pages</h3>
                                                <div className="space-y-3">
                                                    {analyticsData.top_pages.pages.map((page, index) => (
                                                        <div key={page} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-sm font-medium text-gray-900 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                    #{index + 1}
                                                                </span>
                                                                <span className="text-sm text-gray-700">{page}</span>
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {analyticsData.top_pages.views[index]} views
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                            <div className="text-center text-gray-500">
                                                <p>No analytics data available.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}