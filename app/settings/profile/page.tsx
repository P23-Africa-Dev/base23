'use client';

import { Transition } from '@headlessui/react';
import axios from 'axios';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoutConfirmationModal } from '@/components/ui/logout-confirmation-modal';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const mustVerifyEmail = searchParams.get('mustVerifyEmail') === 'true';
    const status = searchParams.get('status') || '';

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            await axios.patch('/profile', { name, email });
            setRecentlySuccessful(true);
            setTimeout(() => setRecentlySuccessful(false), 2000);
        } catch (err: any) {
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const sendVerification = async () => {
        await axios.post('/email/verification-notification');
    };

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        axios.post('/logout').then(() => { window.location.href = '/login'; });
    };

    return (
        <AppLayout>
            <div className="relative z-0">
                <SettingsLayout>
                    <div className="space-y-6">
                        <HeadingSmall title="Profile information" description="Update your name and email address" />

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            {mustVerifyEmail && user && !user.email_verified_at && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        Your email address is unverified.{' '}
                                        <button type="button" onClick={sendVerification} className="text-foreground underline decoration-neutral-300 underline-offset-4 hover:decoration-current">
                                            Click here to resend the verification email.
                                        </button>
                                    </p>
                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has been sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save</Button>
                                <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                    <p className="text-sm text-neutral-600">Saved</p>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    <DeleteUser />

                    <button onClick={() => setShowLogoutModal(true)} className="mx-auto block text-sm text-foreground underline decoration-neutral-300 underline-offset-4 hover:decoration-current">
                        Log out
                    </button>

                    <LogoutConfirmationModal isOpen={showLogoutModal} onConfirm={handleLogoutConfirm} onCancel={() => setShowLogoutModal(false)} />
                </SettingsLayout>
            </div>
        </AppLayout>
    );
}
