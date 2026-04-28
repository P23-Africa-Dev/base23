'use client';

export const dynamic = 'force-dynamic';

import LeftDesktopContent from '@/components/auths/LeftDesktopContent';
import Loader from '@/components/auths/Loader';
import MobileTopContent from '@/components/auths/MobileContent';
import RegistrationLoader from '@/components/auths/RegistrationLoader';
import StepTopContent from '@/components/auths/StepTopContent';
import NetworkStatusBanner from '@/components/ui/NetworkStatusBanner';
import AuthLayout from '@/layouts/auth-layout';
import { checkOnlineStatus, submitRegistration } from '@/services/networkValidation';
import { optimizeImageToMaxSize } from '@/utils/imageOptimizer';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import StepOneForm from './stepForms/StepOneForm';
import StepThreeForm from './stepForms/StepThreeForm';
import StepTwoForm from './stepForms/StepTwoForm';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    profile_picture: File | null;
    company_name: string;
    company_description: string;
    industry: string;
    categories: string[];
    great_at: string[];
    can_help_with: string[];
    visibilitySettings?: boolean[];
    phone: string;
    linkedin: string;
    country: string;
    position: string;
    years_of_operation: string;
    number_of_employees: string;
    selected_outcome: string;
    goals: string;
    year_established: string;
    tier?: string; // Membership tier (silver, gold, platinum) - hidden from user
};

type PrefillData = {
    name?: string;
    email?: string;
    company_name?: string;
    industry?: string;
    phone?: string;
    linkedin?: string;
    country?: string;
    position?: string;
    years_of_operation?: string;
    number_of_employees?: string;
    selected_outcome?: string;
    goals?: string;
    categories?: string[];
    reg_number?: string;
    website?: string;
    offer_value?: string;
    b2b_interest?: string;
    year_established?: string;
    tier?: string; // Membership tier (silver, gold, platinum) - hidden from user
};

type RegisterProps = {
    prefill?: PrefillData;
};

const STORAGE_KEY = 'register_form';
const PROFILE_PIC_KEY = 'register_profile_pic';

// Helper functions for encoding/decoding sensitive data
const encodeData = (data: string): string => {
    try {
        return btoa(encodeURIComponent(data));
    } catch {
        return '';
    }
};

const decodeData = (encoded: string): string => {
    try {
        return decodeURIComponent(atob(encoded));
    } catch {
        return '';
    }
};

// Convert File to base64 for localStorage storage
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

// Convert base64 back to File
const base64ToFile = (base64: string, filename: string): File | null => {
    try {
        const arr = base64.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    } catch (error) {
        console.warn('Error converting base64 to file:', error);
        return null;
    }
};

const topContentPerStep = [
    { title: "Let's get you started!", description: 'Welcome! You’re just a few steps away from getting everything set up. We’ve made the process simple and quick.' },
    { title: 'Company Snapshot', description: 'A quick glimpse of your company. Let others see who you are, what you do, and why you matter.' },
    {
        title: 'Almost There!',
        spanElement: 'Superpowers',
        description: 'Share your business superpowers and attract the partnerships or support you’re looking for.',
        headingClassName: 'max-w-[300px] font-light',
    },
];

const mobileTopContentPerStep = [
    {
        title: 'First, the essential',
        description: 'This helps members recognise and trust you.',
        headingClassName: 'text-3xl font-bold text-white',
        paragraphClassName: 'max-w-sm pr-20 text-[14px] font-light text-white',
    },
    {
        title: 'Tell us about your company',
        description: "We'll use this to find your perfect matches",
        headingClassName: 'text-2xl leading-5.5 font-bold text-white',
        paragraphClassName: 'max-w-sm pr-5 text-[16px] leading-4 font-light text-gray-200',
    },
    {
        title: 'What is your secret sauce',
        description: 'Members will search for this skills!',
        headingClassName: 'text-2xl leading-6 pr-10 font-bold text-white',
        paragraphClassName: 'max-w-sm  text-[14px]! font-light text-gray-300',
    },
];

export default function Register({ prefill }: RegisterProps) {
    const [step, setStep] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

    // Network-aware submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionProgress, setSubmissionProgress] = useState(0);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [isOnline, setIsOnline] = useState(true);

    // Track submission attempts for debugging
    const submissionAttemptRef = useRef(0);

    useEffect(() => {
        const getStepFromUrl = () => Number(new URLSearchParams(window.location.search).get('step') || 1);
        setStep(getStepFromUrl());
        const handlePopState = () => setStep(getStepFromUrl());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        setIsOnline(checkOnlineStatus());
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Restore profile picture from localStorage on mount
    useEffect(() => {
        try {
            const savedPic = localStorage.getItem(PROFILE_PIC_KEY);
            if (savedPic) {
                const file = base64ToFile(savedPic, 'profile_picture.jpg');
                if (file) {
                    setProfilePicFile(file);
                    setProfilePicPreview(savedPic);
                }
            }
        } catch (error) {
            console.warn('Error restoring profile picture:', error);
        }
    }, []);

    const [formData, setFormData] = useState<RegisterForm>({
        name: prefill?.name ?? '',
        email: prefill?.email ?? '',
        password: '',
        password_confirmation: '',
        profile_picture: null,
        company_name: prefill?.company_name ?? '',
        company_description: '',
        industry: prefill?.industry ?? '',
        categories: prefill?.categories ?? [],
        great_at: [],
        can_help_with: [],
        phone: prefill?.phone ?? '',
        linkedin: prefill?.linkedin ?? '',
        country: prefill?.country ?? '',
        position: prefill?.position ?? '',
        years_of_operation: prefill?.years_of_operation ?? '',
        number_of_employees: prefill?.number_of_employees ?? '',
        selected_outcome: prefill?.selected_outcome ?? '',
        goals: prefill?.goals ?? '',
        year_established: prefill?.year_established ?? '',
        tier: prefill?.tier ?? 'silver',
    });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsedData = JSON.parse(saved);
                const decodedPassword = parsedData._encodedPassword ? decodeData(parsedData._encodedPassword) : '';
                const decodedPasswordConfirmation = parsedData._encodedPasswordConfirmation ? decodeData(parsedData._encodedPasswordConfirmation) : '';
                setFormData((base) => ({
                    ...base,
                    ...parsedData,
                    password: decodedPassword,
                    password_confirmation: decodedPasswordConfirmation,
                    great_at: Array.isArray(parsedData.great_at) ? parsedData.great_at : [],
                    can_help_with: Array.isArray(parsedData.can_help_with) ? parsedData.can_help_with : [],
                    categories: Array.isArray(parsedData.categories) ? parsedData.categories : (prefill?.categories ?? []),
                    name: prefill?.name || parsedData.name || '',
                    email: prefill?.email || parsedData.email || '',
                    company_name: prefill?.company_name || parsedData.company_name || '',
                    industry: prefill?.industry || parsedData.industry || '',
                    country: prefill?.country || parsedData.country || '',
                    number_of_employees: prefill?.number_of_employees || parsedData.number_of_employees || '',
                    years_of_operation: prefill?.years_of_operation || parsedData.years_of_operation || '',
                    phone: prefill?.phone || parsedData.phone || '',
                    linkedin: prefill?.linkedin || parsedData.linkedin || '',
                    position: prefill?.position || parsedData.position || '',
                    year_established: prefill?.year_established || parsedData.year_established || '',
                    tier: prefill?.tier || parsedData.tier || 'silver',
                    profile_picture: null,
                }));
            }
        } catch (error) {
            console.warn('Error restoring form data:', error);
        }
    }, []);

    const steps = ['Account Info', 'Company Info', 'Interests'];

    // Persist formData in localStorage (including encoded passwords)
    useEffect(() => {
        const { profile_picture, ...dataToSave } = formData;

        const storageData = {
            ...dataToSave,
            password: '',
            password_confirmation: '',
            _encodedPassword: formData.password ? encodeData(formData.password) : '',
            _encodedPasswordConfirmation: formData.password_confirmation ? encodeData(formData.password_confirmation) : '',
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    }, [formData]);

    // Save profile picture to localStorage when it changes
    useEffect(() => {
        const saveProfilePic = async () => {
            if (profilePicFile) {
                try {
                    const base64 = await fileToBase64(profilePicFile);
                    localStorage.setItem(PROFILE_PIC_KEY, base64);
                    setProfilePicPreview(base64);
                } catch (error) {
                    console.warn('Error saving profile picture:', error);
                }
            }
        };
        saveProfilePic();
    }, [profilePicFile]);

    const goToStep = (newStep: number) => {
        setStep(newStep);
        const url = new URL(window.location.href);
        url.searchParams.set('step', String(newStep));
        window.history.pushState({}, '', url.toString());
    };

    const nextStep = async (data?: Partial<RegisterForm>, isFinalStep = false) => {
        let updatedData: RegisterForm;

        if (data) {
            if (data.profile_picture instanceof File) {
                let file = data.profile_picture;
                setProfilePicFile(file);

                // Optimize large images
                if (file.size > 5 * 1024 * 1024) {
                    try {
                        const optimized = await optimizeImageToMaxSize(file, 5);
                        if (optimized.size < file.size) {
                            toast.success('Profile image optimized for upload!');
                            file = optimized;
                            setProfilePicFile(file);
                        }
                    } catch (error) {
                        console.error('Image optimization failed:', error);
                    }
                }

                updatedData = { ...formData, ...data, profile_picture: file };
            } else if (data.profile_picture === null) {
                updatedData = { ...formData, ...data, profile_picture: null };
                setProfilePicFile(null);
            } else {
                updatedData = { ...formData, ...data };
            }
        } else {
            updatedData = formData;
        }

        setFormData(updatedData);

        if (isFinalStep) {
            handleSubmitFinal(updatedData);
        } else {
            goToStep(step + 1);
        }
    };

    const handleSubmitFinal = async (finalData: RegisterForm) => {
        // Track submission attempt
        submissionAttemptRef.current += 1;
        const attemptId = submissionAttemptRef.current;

        console.log(`[Register] Final submission attempt #${attemptId}`, {
            email: finalData.email,
            timestamp: new Date().toISOString(),
        });

        // Pre-submission network check
        if (!checkOnlineStatus()) {
            toast.error('You appear to be offline. Please check your internet connection and try again.');
            return;
        }

        // Pre-submission validation for required fields
        if (!finalData.name?.trim()) {
            toast.error('Name is required');
            goToStep(1);
            return;
        }

        if (!finalData.email?.trim()) {
            toast.error('Email is required');
            goToStep(1);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(finalData.email.trim())) {
            toast.error('Please enter a valid email address');
            goToStep(1);
            return;
        }

        if (!finalData.password) {
            toast.error('Password is required');
            goToStep(1);
            return;
        }

        if (finalData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            goToStep(1);
            return;
        }

        if (finalData.password !== finalData.password_confirmation) {
            toast.error('Passwords do not match');
            goToStep(1);
            return;
        }

        // Validate profile picture exists
        const fileToUpload = profilePicFile || finalData.profile_picture;
        if (!(fileToUpload instanceof File)) {
            toast.error('Profile picture is required. Please go back and upload one.');
            goToStep(2);
            return;
        }

        // Validate file size (5120 KB = 5242880 bytes)
        const MAX_FILE_SIZE = 5120 * 1024;
        if (fileToUpload.size > MAX_FILE_SIZE) {
            toast.error('Profile picture must be less than 5MB');
            goToStep(2);
            return;
        }

        // Define field to step mapping for error navigation
        const fieldStepMap: Record<string, number> = {
            name: 1, email: 1, password: 1, password_confirmation: 1,
            profile_picture: 2, company_name: 2, company_description: 2, industry: 2,
            country: 2, number_of_employees: 2, years_of_operation: 2, year_established: 2,
            phone: 2, linkedin: 2, position: 2,
            great_at: 3, can_help_with: 3, categories: 3, selected_outcome: 3, goals: 3,
        };

        try {
            setLoading(true);
            setIsSubmitting(true);
            setSubmissionStatus('uploading');
            setSubmissionProgress(0);

            console.log(`[Register] Preparing form data for submission #${attemptId}`);

            const payload = new FormData();

            // Append all form fields
            const fields: Record<string, string> = {
                name: finalData.name.trim(),
                email: finalData.email.trim().toLowerCase(),
                password: finalData.password,
                password_confirmation: finalData.password_confirmation,
                company_name: finalData.company_name || '',
                company_description: finalData.company_description || '',
                industry: finalData.industry || '',
                phone: finalData.phone || '',
                linkedin: finalData.linkedin || '',
                country: finalData.country || '',
                position: finalData.position || '',
                years_of_operation: finalData.years_of_operation || '',
                number_of_employees: finalData.number_of_employees || '',
                selected_outcome: finalData.selected_outcome || '',
                goals: finalData.goals || '',
                year_established: finalData.year_established || '',
                tier: finalData.tier || 'silver', // Membership tier (hidden from user)
            };

            Object.entries(fields).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    payload.append(key, value);
                }
            });

            // Append profile picture
            payload.append('profile_picture', fileToUpload);
            console.log(`[Register] Profile picture: ${fileToUpload.name} (${(fileToUpload.size / 1024).toFixed(1)}KB)`);

            // Append array fields
            const appendArrayField = (fieldName: string, array: any[] | undefined) => {
                if (array && Array.isArray(array) && array.length > 0) {
                    array.forEach((item, index) => {
                        if (item !== null && item !== undefined && item !== '') {
                            payload.append(`${fieldName}[${index}]`, String(item));
                        }
                    });
                }
            };

            appendArrayField('categories', finalData.categories);
            appendArrayField('great_at', finalData.great_at);
            appendArrayField('can_help_with', finalData.can_help_with);

            console.log(`[Register] Submitting registration #${attemptId}...`);
            setSubmissionStatus('processing');

            try {
                await axios.post('/register', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (e) => {
                        if (e.total) setSubmissionProgress(Math.round((e.loaded * 100) / e.total));
                    },
                });
                console.log(`[Register] Registration #${attemptId} successful!`);
                setSubmissionStatus('success');
                clearRegistrationData();
                toast.success('Registration successful! Welcome aboard!');
                window.location.href = '/dashboard';
            } catch (axiosErr: any) {
                const errors = axiosErr.response?.data?.errors || {};
                console.error(`[Register] Registration #${attemptId} errors:`, errors);
                setSubmissionStatus('error');
                const errorStr = JSON.stringify(errors).toLowerCase();
                if (errorStr.includes('419') || errorStr.includes('csrf') || errorStr.includes('token mismatch')) {
                    toast.error('Your session has expired. The page will refresh.');
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    if (errors.general) toast.error(errors.general);
                    let targetStep: number | null = null;
                    Object.entries(errors).forEach(([field, message]) => {
                        if (field !== 'general') {
                            const msg = Array.isArray(message) ? message[0] : String(message);
                            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')}: ${msg}`);
                            const fieldStep = fieldStepMap[field];
                            if (fieldStep && (targetStep === null || fieldStep < targetStep)) targetStep = fieldStep;
                        }
                    });
                    if (targetStep !== null) goToStep(targetStep);
                }
            } finally {
                setIsSubmitting(false);
                setLoading(false);
                console.log(`[Register] Registration #${attemptId} finished`);
            }
        } catch (err: any) {
            console.error(`[Register] Registration #${attemptId} exception:`, err);
            setSubmissionStatus('error');
            setLoading(false);
            setIsSubmitting(false);

            // Handle different error types
            if (err?.message?.includes('Network Error') || err?.message?.includes('Failed to fetch')) {
                toast.error('Network error. Please check your internet connection and try again.');
            } else if (err?.response?.status === 413) {
                toast.error('File too large. Please reduce the profile picture size.');
                goToStep(2);
            } else if (err?.response?.status === 422) {
                toast.error('Validation error. Please check your inputs.');
            } else if (err?.response?.status === 419) {
                toast.error('Your session has expired. The page will refresh.');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                toast.error('Registration failed. Please try again.');
            }
        }
    };

    const clearRegistrationData = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(PROFILE_PIC_KEY);
        } catch (error) {
            console.error('Error clearing registration data:', error);
        }
    };

    // Show loading overlay during submission
    if (isSubmitting) {
        // Map submission status to loader status (idle defaults to uploading)
        const loaderStatus = submissionStatus === 'idle' ? 'uploading' : submissionStatus;

        return (
            <RegistrationLoader
                status={loaderStatus}
                uploadProgress={submissionProgress}
            />
        );
    }

    if (loading) return <Loader />;

    return (
        <>
            {/* Network Status Banner */}
            <NetworkStatusBanner onStatusChange={setIsOnline} />

            <AuthLayout
                mobileTopContent={<MobileTopContent steps={steps} step={step} content={mobileTopContentPerStep} />}
                LeftDesktopContent={
                    <LeftDesktopContent
                        topContentLayout={
                            <StepTopContent
                                steps={steps}
                                currentStep={step}
                                title={topContentPerStep[step - 1].title}
                                spanElement={topContentPerStep[step - 1].spanElement}
                                headingClassName={topContentPerStep[step - 1].headingClassName}
                                description={topContentPerStep[step - 1].description}
                            />
                        }
                    />
                }
            >
                {step === 1 && (
                    <StepOneForm
                        defaultValues={{
                            name: formData.name,
                            email: formData.email,
                            password: formData.password,
                            password_confirmation: formData.password_confirmation,
                        }}
                        onNext={(data) => nextStep(data)}
                    />
                )}

                {step === 2 && (
                    <StepTwoForm
                        defaultValues={{
                            company_name: formData.company_name,
                            industry: formData.industry,
                            country: formData.country,
                            number_of_employees: formData.number_of_employees,
                            years_of_operation: formData.years_of_operation,
                            name: formData.name,
                            offer_value: prefill?.offer_value,
                            year_established: formData.year_established,
                        }}
                        onNext={(data) => nextStep(data)}
                        restoredProfilePic={profilePicFile}
                        restoredProfilePicPreview={profilePicPreview}
                    />
                )}

                {step === 3 && (
                    <StepThreeForm
                        defaultValues={{
                            great_at: formData.great_at,
                            can_help_with: formData.can_help_with,
                        }}
                        onNext={(data) =>
                            nextStep(
                                {
                                    great_at: data.great_at,
                                    can_help_with: data.can_help_with,
                                },
                                true,
                            )
                        }
                    />
                )}
            </AuthLayout>
        </>
    );
}
