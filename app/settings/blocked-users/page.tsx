'use client';


import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

type BlockedUser = {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
    blocked_at: string;
};

type Props = {
    blockedUsers: BlockedUser[];
};

export default function BlockedUsers({ blockedUsers: initialBlockedUsers }: Props) {
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(initialBlockedUsers);
    const [unblockingUserId, setUnblockingUserId] = useState<number | null>(null);

    const handleUnblock = async (userId: number, userName: string) => {
        if (!confirm(`Are you sure you want to unblock ${userName}? They will be able to message you again.`)) {
            return;
        }

        setUnblockingUserId(userId);

        try {
            const response = await axios.post('/users/unblock', {
                user_id: userId,
            });

            if (response.data.success) {
                setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
                toast.success(`${userName} has been unblocked`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to unblock user');
        } finally {
            setUnblockingUserId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Blocked Users"
                        description="Manage users you have blocked. Blocked users cannot send you messages."
                    />

                    {blockedUsers.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">No blocked users</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You haven't blocked anyone yet. When you block a user, they'll appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {blockedUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={
                                                user.profile_picture ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`
                                            }
                                            alt={user.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            <p className="text-xs text-gray-400">
                                                Blocked on {formatDate(user.blocked_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUnblock(user.id, user.name)}
                                        disabled={unblockingUserId === user.id}
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        {unblockingUserId === user.id ? (
                                            <span className="flex items-center gap-2">
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                Unblocking...
                                            </span>
                                        ) : (
                                            'Unblock'
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="rounded-lg bg-amber-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-amber-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-amber-800">About Blocking</h3>
                                <div className="mt-2 text-sm text-amber-700">
                                    <ul className="list-inside list-disc space-y-1">
                                        <li>Blocked users cannot send you messages</li>
                                        <li>Your existing conversations with them will be hidden</li>
                                        <li>They won't be notified that you blocked them</li>
                                        <li>You can unblock users at any time</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
