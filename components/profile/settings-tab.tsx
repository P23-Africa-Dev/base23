import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoutConfirmationModal } from '@/components/ui/logout-confirmation-modal';
import { Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { AlertTriangle, Eye, EyeOff, LogOut, Monitor, Moon, Shield, Sun, Trash2, Ban, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email: string;
}

interface BlockedUser {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
    blocked_at: string;
}

interface SettingsTabProps {
    user: User;
    mustVerifyEmail?: boolean;
    status?: string;
}

type PasswordForm = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export default function SettingsTab({ user, mustVerifyEmail = false, status }: SettingsTabProps) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    // Blocked users state
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [loadingBlockedUsers, setLoadingBlockedUsers] = useState(true);
    const [unblockingUserId, setUnblockingUserId] = useState<number | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
        defaultValues: { current_password: '', password: '', password_confirmation: '' },
    });
    const [serverErrors, setServerErrors] = useState<Partial<PasswordForm>>({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const processing = isSubmitting;

    // Load blocked users on mount
    useEffect(() => {
        const loadBlockedUsers = async () => {
            try {
                const response = await axios.get('/api/users/blocked');
                setBlockedUsers(response.data.blocked_users || []);
            } catch (error) {
                console.error('Failed to load blocked users:', error);
            } finally {
                setLoadingBlockedUsers(false);
            }
        };

        loadBlockedUsers();
    }, []);

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
                setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
                toast.success(`${userName} has been unblocked`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to unblock user');
        } finally {
            setUnblockingUserId(null);
        }
    };

    const formatBlockedDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const submitPasswordChange = handleSubmit(async (formData) => {
        setServerErrors({});
        try {
            await axios.put('/password', formData);
            reset();
            setRecentlySuccessful(true);
            setTimeout(() => setRecentlySuccessful(false), 2000);
        } catch (err: any) {
            setServerErrors(err.response?.data?.errors || {});
        }
    });

    const handleLogoutClick = () => setShowLogoutModal(true);

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        axios.post('/logout').then(() => { window.location.href = '/login'; });
    };

    const handleLogoutCancel = () => setShowLogoutModal(false);

    const requestAccountDeletion = () => {
        if (showDeleteConfirm) {
            axios.post('/profile/delete-request')
                .then(() => setShowDeleteConfirm(false))
                .catch((err) => console.error('Delete request failed:', err));
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        // Apply theme immediately
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else if (newTheme === 'light') {
            root.classList.add('light');
        } else {
            // System theme
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.add('light');
            }
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 py-6 pb-20">
            {/* Password Change Section */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                            <p className="text-sm text-gray-600">Update your password to keep your account secure.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={submitPasswordChange} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="current_password" className="text-sm font-medium text-gray-700">
                                Current Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    {...register('current_password', { required: true })}
                                    required
                                    placeholder="Enter your current password"
                                    className="w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <InputError message={serverErrors.current_password} />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        {...register('password', { required: true })}
                                        required
                                        placeholder="Enter new password"
                                        className="w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={serverErrors.password} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('password_confirmation', { required: true })}
                                        required
                                        placeholder="Confirm new password"
                                        className="w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={serverErrors.password_confirmation} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <div className="flex items-center space-x-2 text-green-600">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Password updated successfully!</span>
                                </div>
                            </Transition>

                            <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700">
                                {processing ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <Sun className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                            <p className="text-sm text-gray-600">Choose how the interface looks to you.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-700">Theme Preference</Label>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-4 transition-colors ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Sun className="h-6 w-6 text-yellow-500" />
                                <span className="text-sm font-medium">Light</span>
                            </button>

                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-4 transition-colors ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Moon className="h-6 w-6 text-gray-700" />
                                <span className="text-sm font-medium">Dark</span>
                            </button>

                            <button
                                onClick={() => handleThemeChange('system')}
                                className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-4 transition-colors ${theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Monitor className="h-6 w-6 text-gray-600" />
                                <span className="text-sm font-medium">System</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blocked Users Section */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2">
                            <Ban className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Blocked Users</h2>
                            <p className="text-sm text-gray-600">Manage users you have blocked from messaging you.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {loadingBlockedUsers ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Loading blocked users...</span>
                        </div>
                    ) : blockedUsers.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <Ban className="h-5 w-5 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">No blocked users</h3>
                            <p className="mt-1 text-xs text-gray-500">
                                You haven't blocked anyone. When you block a user from messages, they'll appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {blockedUsers.map((blockedUser) => (
                                <div
                                    key={blockedUser.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-shadow hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                blockedUser.profile_picture ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(blockedUser.name)}&background=6366f1&color=ffffff&size=200`
                                            }
                                            alt={blockedUser.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">{blockedUser.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                Blocked {formatBlockedDate(blockedUser.blocked_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUnblock(blockedUser.id, blockedUser.name)}
                                        disabled={unblockingUserId === blockedUser.id}
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        {unblockingUserId === blockedUser.id ? (
                                            <span className="flex items-center gap-1">
                                                <Loader2 className="h-3 w-3 animate-spin" />
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

                    {/* Info box */}
                    <div className="mt-4 rounded-lg bg-amber-50 p-3">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="ml-2">
                                <p className="text-xs text-amber-700">
                                    Blocked users cannot send you messages. They won't be notified that they've been blocked.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-red-100 p-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
                            <p className="text-sm text-red-600">Irreversible and destructive actions.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-6">
                        {/* Account Deletion */}
                        <div className="rounded-lg border border-red-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-red-900">Request Account Deletion</h3>
                                    <p className="mt-1 text-sm text-red-600">
                                        Submit a request to permanently delete your account and all associated data.
                                    </p>
                                </div>
                                <Button
                                    onClick={requestAccountDeletion}
                                    variant="destructive"
                                    className={showDeleteConfirm ? 'bg-red-700' : ''}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {showDeleteConfirm ? 'Confirm Delete Request' : 'Request Deletion'}
                                </Button>
                            </div>

                            {showDeleteConfirm && (
                                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                                    <p className="text-sm text-red-800">
                                        <strong>Warning:</strong> This will submit a request to delete your account. The process is
                                        irreversible and will remove all your data from our systems. Click "Confirm Delete Request" to
                                        proceed.
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" size="sm">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logout */}
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Sign Out</h3>
                                    <p className="mt-1 text-sm text-gray-600">Sign out of your account on this device.</p>
                                </div>
                                <Button
                                    onClick={handleLogoutClick}
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmationModal isOpen={showLogoutModal} onConfirm={handleLogoutConfirm} onCancel={handleLogoutCancel} />
        </div>
    );
}
