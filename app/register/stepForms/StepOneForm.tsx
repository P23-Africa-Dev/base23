'use client';

import { Button } from '@/components/ui/button';
import { ValidationError } from '@/components/ui/NetworkStatusBanner';
import images from '@/constants/image';
import {
    validateRegistrationStep,
    checkOnlineStatus,
    NetworkValidationResult,
    StepValidationResponse
} from '@/services/networkValidation';
import { Eye, EyeOff, RefreshCw, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

// StepOneForm
type Step1FormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

type Step1Props = {
    defaultValues: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    };
    onNext: (data: Step1FormData) => void;
};

type ValidationState = 'idle' | 'validating' | 'retrying' | 'success' | 'error';

export default function StepOneForm({ defaultValues, onNext }: Step1Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [meterVisible, setMeterVisible] = useState(false);

    // Network-aware validation state
    const [validationState, setValidationState] = useState<ValidationState>('idle');
    const [retryCount, setRetryCount] = useState(0);
    const [networkError, setNetworkError] = useState<{
        type: string;
        message: string;
        retryable: boolean;
    } | null>(null);
    const [isOnline, setIsOnline] = useState(true);

    const stepContainerRef = useRef<HTMLDivElement | null>(null);
    const submitAttemptRef = useRef(0);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        getValues,
        formState: { errors },
    } = useForm<Step1FormData>({
        defaultValues,
        mode: 'onBlur',
    });

    const password = watch('password');

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setNetworkError(null);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setNetworkError({
                type: 'offline',
                message: 'You appear to be offline. Please check your internet connection.',
                retryable: true,
            });
        };

        setIsOnline(checkOnlineStatus());
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const scrollToTop = useCallback(() => {
        if (stepContainerRef.current) {
            stepContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToTop();
    }, [scrollToTop]);

    const performValidation = async (data: Step1FormData): Promise<NetworkValidationResult<StepValidationResponse>> => {
        return validateRegistrationStep(1, {
            name: data.name,
            email: data.email,
            password: data.password,
            password_confirmation: data.password_confirmation,
        }, {
            onRetry: (attempt) => {
                setRetryCount(attempt);
                setValidationState('retrying');
                toast.loading(`Connection issue. Retrying... (${attempt}/3)`, { id: 'retry-toast' });
            },
        });
    };

    const handleValidationResult = (
        result: NetworkValidationResult<StepValidationResponse>,
        data: Step1FormData
    ) => {
        toast.dismiss('retry-toast');

        if (result.success && result.data?.success) {
            setValidationState('success');
            setNetworkError(null);

            // Log successful validation
            console.log('[StepOneForm] Validation successful, proceeding to next step');

            // toast.success('Step 1 validated successfully!', { duration: 1500 });

            setTimeout(() => {
                scrollToTop();
                onNext(data);
            }, 500);
            return;
        }

        setValidationState('error');

        // Handle network/connection errors
        if (result.error) {
            const { type, message, retryable } = result.error;

            if (['network', 'timeout', 'offline'].includes(type)) {
                setNetworkError({ type, message, retryable });
                toast.error(message, { duration: 5000 });
                return;
            }

            // Handle validation errors from server
            if (type === 'validation' && result.error.details) {
                const details = result.error.details;

                // Email already exists - redirect
                if (details.error_type === 'email_exists') {
                    toast.error(details.error || 'This email is already registered.');

                    const params = new URLSearchParams({
                        message: details.redirect?.message || 'This email is already registered with an existing account.',
                        buttonText: details.redirect?.buttonText || 'Proceed to Login',
                        buttonLink: details.redirect?.buttonLink || '/login',
                        title: 'Account Already Exists',
                    });
                    window.location.href = `/auth-error?${params.toString()}`;
                    return;
                }

                // Field-specific validation errors
                if (details.errors) {
                    Object.keys(details.errors).forEach((field) => {
                        const fieldMessage = Array.isArray(details.errors[field])
                            ? details.errors[field][0]
                            : details.errors[field];
                        setError(field as keyof Step1FormData, {
                            type: 'server',
                            message: fieldMessage,
                        });
                    });

                    const firstError = Object.values(details.errors)[0];
                    toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
                    return;
                }

                toast.error(details.error || message);
                return;
            }

            // Generic error
            toast.error(message);
        }
    };

    const onSubmit = async (data: Step1FormData) => {
        // Track submission attempt
        submitAttemptRef.current += 1;
        const attemptId = submitAttemptRef.current;

        console.log(`[StepOneForm] Submit attempt #${attemptId}`, {
            email: data.email,
            timestamp: new Date().toISOString(),
        });

        // Check online status first
        if (!checkOnlineStatus()) {
            setNetworkError({
                type: 'offline',
                message: 'You appear to be offline. Please check your internet connection and try again.',
                retryable: true,
            });
            toast.error('No internet connection. Please check your network.');
            return;
        }

        setValidationState('validating');
        setNetworkError(null);
        setRetryCount(0);

        try {
            const result = await performValidation(data);

            // Ensure this is still the current attempt
            if (attemptId !== submitAttemptRef.current) {
                console.log(`[StepOneForm] Ignoring stale response for attempt #${attemptId}`);
                return;
            }

            handleValidationResult(result, data);
        } catch (error: any) {
            console.error('[StepOneForm] Unexpected error:', error);

            setValidationState('error');
            setNetworkError({
                type: 'unknown',
                message: 'An unexpected error occurred. Please try again.',
                retryable: true,
            });
            toast.error('Something went wrong. Please try again.');
        }
    };

    const handleRetry = () => {
        const currentValues = getValues();
        setNetworkError(null);
        onSubmit(currentValues);
    };

    const passwordRules = {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /[0-9]/,
        special: /[#?!@$%^&*-]/,
        length: /.{8,}/,
    };

    const isStrongPassword = (password: string) => {
        return Object.values(passwordRules).every((rule) => rule.test(password));
    };

    const getPasswordRules = (password: string) => [
        { label: 'One uppercase letter', valid: passwordRules.uppercase.test(password) },
        { label: 'One lowercase letter', valid: passwordRules.lowercase.test(password) },
        { label: 'One number', valid: passwordRules.number.test(password) },
        { label: 'One special character', valid: passwordRules.special.test(password) },
        { label: 'At least 8 characters', valid: passwordRules.length.test(password) },
    ];

    const isValidating = validationState === 'validating' || validationState === 'retrying';

    return (
        <div className="w-full overflow-x-hidden">
            <div ref={stepContainerRef} className="relative z-7 mt-11 h-[800px] w-full overflow-x-hidden p-5 md:h-[670px] lg:mt-3 lg:h-auto">
                <div className="mx-auto max-w-md">
                    {/* Offline Warning Banner */}
                    {!isOnline && (
                        <div className="mb-4 rounded-xl bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3">
                            <WifiOff className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-yellow-800">You're offline</p>
                                <p className="text-sm text-yellow-700">Please check your internet connection to continue.</p>
                            </div>
                        </div>
                    )}

                    {/* Network Error Display */}
                    {networkError && (
                        <ValidationError
                            error={networkError}
                            onRetry={networkError.retryable ? handleRetry : undefined}
                        />
                    )}

                    {/* Heading */}
                    <div className="mb-10">
                        <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">First, Account Setup</h2>
                        <p className="max-w-sm pr-20 text-[12px] font-normal text-primary lg:pr-5 lg:text-[17px] dark:text-black">
                            Setup the account and joined like minds in few steps.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="mr-6 space-y-7">
                        {/* Name */}
                        <div className="relative w-full">
                            <label htmlFor="name" className="absolute -top-2.5 left-8 bg-white px-4 text-sm text-[#0B1727]/70">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={defaultValues.name}
                                disabled
                                {...register('name')}
                                className="w-full rounded-2xl border border-primary py-3 pl-11 font-semibold text-gray-900 ring-1 ring-[#0B1727]/80 outline-none"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="relative w-full">
                            <label htmlFor="email" className="absolute -top-2.5 left-8 bg-white px-4 text-sm text-[#0B1727]">
                                Email
                            </label>
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={defaultValues.email}
                            readOnly
                            {...register('email')}
                            onFocus={(e) => {
                                const el = e.currentTarget;
                                requestAnimationFrame(() => {
                                    el.scrollLeft = el.scrollWidth;
                                });
                            }}
                            className="w-full overflow-x-auto rounded-2xl border border-primary py-3 pr-4 pl-11 font-semibold whitespace-nowrap text-gray-900 ring-1 ring-[#0B1727]/80 outline-none"
                        />

                        {/* Password */}
                        <div className="relative w-full">
                            <div className="relative w-full">
                                <label htmlFor="password" className="absolute -top-2.5 left-8 bg-white px-4 text-sm text-[#0B1727]">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password', {
                                        required: 'Password is required',
                                        validate: (value) =>
                                            isStrongPassword(value) ||
                                            'Password must include uppercase, lowercase, number, special character and be at least 8 characters',
                                    })}
                                    onFocus={() => setMeterVisible(true)}
                                    onBlur={() => setMeterVisible(false)}
                                    disabled={isValidating}
                                    className="w-full rounded-2xl border border-primary py-3 pr-12 pl-11 font-semibold text-gray-900 ring-1 ring-[#0B1727]/80 outline-none placeholder:bg-white disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {errors.password && <p className="mt-1 ml-3 text-xs text-red-500">{errors.password.message}</p>}

                            {/* Password strength meter */}
                            {meterVisible && password && (
                                <div className="absolute z-10 h-[160px] w-full space-y-2 rounded-2xl bg-white px-5 py-4 shadow-2xl">
                                    <div className="h-2 w-full rounded bg-gray-200">
                                        <div
                                            className={`h-full rounded transition-all duration-300 ${[
                                                    'w-1/5 bg-red-500',
                                                    'w-2/5 bg-orange-500',
                                                    'w-3/5 bg-yellow-500',
                                                    'w-4/5 bg-blue-500',
                                                    'w-full bg-green-500',
                                                ][getPasswordRules(password).filter((r) => r.valid).length]
                                                }`}
                                        ></div>
                                    </div>
                                    <ul className="space-y-1 text-sm">
                                        {getPasswordRules(password).map((rule, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${rule.valid ? 'text-green-600' : 'text-gray-500'}`}>
                                                {rule.valid ? '✅' : '❌'} {rule.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="w-full">
                            <div className="relative w-full">
                                <label htmlFor="password_confirmation" className="absolute -top-2.5 left-8 bg-white px-4 text-sm text-[#0B1727]">
                                    Confirm Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('password_confirmation', {
                                        required: 'Confirm your password',
                                        validate: (value) => value === password || "Password doesn't match",
                                    })}
                                    disabled={isValidating}
                                    className="w-full rounded-2xl border-1 border-primary py-3 pr-12 pl-11 font-semibold text-gray-900 ring-1 ring-[#0B1727]/80 outline-none placeholder:bg-white disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 ml-3 text-xs text-red-500">{errors.password_confirmation.message}</p>
                            )}
                        </div>

                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                    fontSize: '12px',
                                },
                                success: {
                                    duration: 4000,
                                    style: {
                                        background: '#031c5b',
                                        fontSize: '12px',
                                    },
                                },
                                error: {
                                    duration: 5000,
                                    style: {
                                        background: '#ef4444',
                                        fontSize: '12px',
                                    },
                                },
                            }}
                        />

                        {/* Submit Button */}
                        <div className="mt-20 flex flex-col items-center">
                            <Button
                                type="submit"
                                disabled={isValidating || !isOnline}
                                className="w-full rounded-2xl bg-pinkLight py-8 text-lg font-semibold text-white hover:bg-pinkLight/90 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {validationState === 'validating' ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Validating...
                                    </span>
                                ) : validationState === 'retrying' ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Retrying ({retryCount}/3)...
                                    </span>
                                ) : !isOnline ? (
                                    <span className="flex items-center gap-2">
                                        <WifiOff className="h-5 w-5" />
                                        Offline
                                    </span>
                                ) : (
                                    'Proceed'
                                )}
                            </Button>

                            {/* Validation Status Message */}
                            {validationState === 'retrying' && (
                                <p className="mt-3 text-sm text-yellow-600 text-center">
                                    Connection issue detected. Automatically retrying...
                                </p>
                            )}
                        </div>
                    </form>

                    {/* Login/Signups */}
                    <div className="mt-10 -ml-12 w-[400px] px-4 text-left md:hidden lg:px-0">
                        <p className="mb-1 pl-10 text-sm font-extralight">
                            Already have an account?{' '}
                            <a href="/login" className="font-bold text-deepBlack italic hover:underline dark:text-deepBlack">
                                Sign In
                            </a>
                        </p>
                        <p className="pl-10 text-sm">
                            <a href="/help" className="font-bold text-deepBlack italic hover:underline dark:text-deepBlack">
                                Need Help?
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <img src={images.bottomFormBgP} className="absolute top-[5%] z-2 h-auto w-full object-cover md:hidden" alt="" />
        </div>
    );
}
