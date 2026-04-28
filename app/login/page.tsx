'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import LeftDesktopContent from '@/components/auths/LeftDesktopContent';
import MobileTopContent from '@/components/auths/MobileContent';
import StepTopContent from '@/components/auths/StepTopContent';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import images from '@/constants/image';
import axios from 'axios';
import { LoaderCircle, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

const loginMobileContent = {
    title: "We're glad to have you back.",
    description: 'Log in to continue building connections and discover the endless opportunities awaiting you.',
    headingClassName: 'text-2xl font-bold text-white',
    paragraphClassName: 'max-w-sm pr-5 text-[14px] font-light text-white',
};

function Login() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || '';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [processing, setProcessing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const handleOnline = () => { setIsOnline(true); toast.success('You are back online!'); };
        const handleOffline = () => { setIsOnline(false); toast.error('You are offline. Please check your connection.'); };
        setIsOnline(navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }, []);

    useEffect(() => { if (status) toast.success(status, { duration: 4000 }); }, [status]);

    useEffect(() => {
        if (errors.email) toast.error(errors.email, { duration: 5000 });
        if (errors.password) toast.error(errors.password, { duration: 5000 });
    }, [errors.email, errors.password]);

    const validateForm = () => {
        if (!email.trim()) { toast.error('Please enter your email address.'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { toast.error('Please enter a valid email address.'); return false; }
        if (!password) { toast.error('Please enter your password.'); return false; }
        return true;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!navigator.onLine) { toast.error('You are offline.'); return; }
        if (!validateForm()) return;
        setProcessing(true);
        setErrors({});
        try {
            await axios.post('/login', { email, password, remember });
            toast.success('Login successful! Redirecting...', { duration: 2000 });
            window.location.href = '/dashboard';
        } catch (err: any) {
            const errs = err.response?.data?.errors || {};
            setErrors(errs);
            if (!errs || Object.keys(errs).length === 0) {
                toast.error('Login failed. Please check your credentials.');
            } else {
                const first = Object.values(errs)[0] as string;
                toast.error(Array.isArray(first) ? first[0] : first);
            }
        } finally {
            setProcessing(false);
            setPassword('');
        }
    };

    return (
        <>
            {!isOnline && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white py-2 px-4 text-center flex items-center justify-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-medium">You are offline. Please check your internet connection.</span>
                </div>
            )}

            <AuthLayout
                mobileTopContent={<MobileTopContent content={loginMobileContent} />}
                LeftDesktopContent={
                    <LeftDesktopContent
                        topContentLayout={
                            <StepTopContent
                                title="We're glad to have you back."
                                description="Log in to continue building connections and discover the endless opportunities awaiting you."
                                headingClassName="max-w-[100px] lg:max-w-[300px]"
                            />
                        }
                    />
                }
            >
                <div className="w-full overflow-x-hidden">
                    <div className={`mt-13 w-full h-[700px] md:h-auto p-8 md:mt-0 lg:overflow-y-auto -ml-2 md:-ml-0 ${!isOnline ? 'pt-12' : ''}`}>
                        <div className="relative z-10 mx-auto max-w-md">
                            <div className="mb-10">
                                <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-[25px] dark:text-white">
                                    Smart connections. Seamless experiences. Real impact.
                                </h2>
                                <p className="max-w-sm pr-5 text-[13px] font-normal text-primary dark:text-gray-300">
                                    Log in to make meaningful connections.
                                </p>
                            </div>

                            <div className="max-w-sm">
                                <form onSubmit={submit} className="space-y-7">
                                    <div className="relative w-full">
                                        <Label htmlFor="email" className="absolute -top-2.5 left-8 bg-white px-3 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                            Email
                                        </Label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={processing}
                                            className={`w-full rounded-2xl border-1 border-primary bg-white py-5 pl-11 font-semibold text-gray-900 ring-1 ring-[#0B1727]/80 outline-none placeholder:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:ring-gray-600 ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="relative w-full">
                                        <label htmlFor="password" className="absolute -top-2.5 left-8 bg-white px-3 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={processing}
                                            className={`w-full rounded-2xl border-1 border-primary bg-white py-5 pl-11 font-semibold text-gray-900 ring-1 ring-[#0B1727]/80 outline-none placeholder:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:ring-gray-600 ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center justify-between px-2 text-sm font-medium text-primary dark:text-gray-300">
                                        <label className="flex cursor-pointer items-center gap-2 text-[11px] lg:text-xs">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                checked={remember}
                                                onClick={() => setRemember(!remember)}
                                                tabIndex={3}
                                                disabled={processing}
                                                className="h-4 w-4 border border-black accent-deepBlack dark:accent-white"
                                            />
                                            Remember for 30 days
                                        </label>
                                        <TextLink href="/forgot-password" className="text-[10px] font-semibold text-primary italic lg:text-xs dark:text-blue-400">
                                            Forgot Password
                                        </TextLink>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-10 w-full rounded-2xl bg-pinkLight py-8 text-lg font-semibold text-white hover:bg-pinkLight/90 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                        tabIndex={4}
                                        disabled={processing || !isOnline}
                                    >
                                        {processing ? (
                                            <><LoaderCircle className="h-4 w-4 animate-spin mr-2" />Logging in...</>
                                        ) : !isOnline ? (
                                            <><WifiOff className="h-4 w-4 mr-2" />Offline</>
                                        ) : (
                                            'Log in'
                                        )}
                                    </Button>

                                    <div className="mt-0 flex justify-center">
                                        <p className="text-sm font-light text-primary dark:text-gray-300">
                                            Don't have an account?{' '}
                                            <TextLink tabIndex={5} href="https://p23africa.com/brn-form" className="text-xs font-bold text-primary italic dark:text-blue-400">
                                                Register Now
                                            </TextLink>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <img src={images.bottomFormBgP} className="absolute top-[1%] z-2 h-auto w-full object-cover md:hidden" alt="" />
                </div>
            </AuthLayout>
        </>
    );
}

export default function LoginPage() { return <Suspense fallback={null}><Login /></Suspense>; }
