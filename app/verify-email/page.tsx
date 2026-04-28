'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyEmail() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || '';
    const [processing, setProcessing] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await axios.post('/email/verification-notification');
            window.location.href = '/verify-email?status=verification-link-sent';
        } finally {
            setProcessing(false);
        }
    };

    const logout = () => {
        axios.post('/logout').then(() => { window.location.href = '/login'; });
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                    Resend verification email
                </Button>

                <button type="button" onClick={logout} className="mx-auto block text-sm underline decoration-neutral-300 underline-offset-4 hover:decoration-current">
                    Log out
                </button>
            </form>
        </AuthLayout>
    );
}

export default function VerifyEmailPage() { return <Suspense fallback={null}><VerifyEmail /></Suspense>; }
