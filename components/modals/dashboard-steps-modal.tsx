'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import images from '@/constants/image';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import axios from 'axios';
import { resolveStripeError } from '@/lib/stripe-errors';
import { Check, Loader2, PartyPopper, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useOnboarding } from '../OnboardingContext';

// Animated Success Toast Component
function SuccessToast({ show, onComplete, isSkipped }: { show: boolean; onComplete: () => void; isSkipped?: boolean }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (show) {
            // Animate in
            setTimeout(() => setIsVisible(true), 50);

            // Start exit animation after 4.5 seconds
            const exitTimer = setTimeout(() => {
                setIsExiting(true);
            }, 4500);

            // Complete and redirect after 5 seconds
            const completeTimer = setTimeout(() => {
                onComplete();
            }, 6000);

            return () => {
                clearTimeout(exitTimer);
                clearTimeout(completeTimer);
            };
        } else {
            setIsVisible(false);
            setIsExiting(false);
        }
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className="fixed top-6 right-6 z-[100]">
            <div
                className={`transform transition-all duration-500 ease-out ${isExiting ? 'translate-x-[120%] opacity-0' : isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
                    }`}
            >
                <div className="relative max-w-[400px] min-w-[320px] overflow-hidden rounded-2xl border border-[#CFE96D]/20 bg-gradient-to-r from-[#024E44] to-[#013831] p-5 shadow-2xl">
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-[#CFE96D]/30">
                        <div
                            className={`h-full bg-[#CFE96D] transition-all ease-linear ${isVisible ? 'w-0' : 'w-full'}`}
                            style={{ transitionDuration: isVisible ? '5000ms' : '0ms' }}
                        />
                    </div>

                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#CFE96D] transition-all duration-700 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                                }`}
                        >
                            <PartyPopper className="h-6 w-6 text-[#024E44]" />
                        </div>

                        {/* Content */}
                        <div
                            className={`flex-1 transition-all delay-200 duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                                }`}
                        >
                            <h3 className="mb-1 text-lg font-bold text-white">Welcome to NOEL! 🎉</h3>
                            <p className="text-sm text-gray-200">
                                {isSkipped ? (
                                    <>
                                        Your account is ready. <span className="text-[#CFE96D]">Subscribe anytime!</span>
                                    </>
                                ) : (
                                    <>
                                        Subscription active. <span className="text-[#CFE96D]">Enjoy your 14-day trial!</span>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onComplete}
                            className={`flex-shrink-0 text-white/60 transition-all duration-300 hover:text-white ${isVisible ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Decorative dots */}
                    <div
                        className={`absolute top-2 right-12 h-1.5 w-1.5 rounded-full bg-[#CFE96D]/60 transition-all delay-300 duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                            }`}
                    />
                    <div
                        className={`absolute right-4 bottom-4 h-2 w-2 rounded-full bg-yellow-400/40 transition-all delay-400 duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                            }`}
                    />
                </div>
            </div>
        </div>
    );
}

interface StepModalProps {
    open: boolean;
    onClose: () => void;
}

const cardElementOptions = {
    style: {
        base: {
            fontSize: '14px',
            color: '#ffffff',
            '::placeholder': {
                color: '#9ca3af',
            },
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        invalid: {
            color: '#ef4444',
        },
    },
    hidePostalCode: true,
};

function StripePaymentForm({
    onSuccess,
    onError,
    onSubmitReady,
    cardName,
    setCardName,
    isProcessing,
    setIsProcessing,
    setCardReady,
}: {
    onSuccess: () => void;
    onError: (error: string) => void;
    onSubmitReady: (submit: (() => Promise<void>) | null) => void;
    cardName: string;
    setCardName: (name: string) => void;
    isProcessing: boolean;
    setIsProcessing: (processing: boolean) => void;
    setCardReady: (ready: boolean) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [cardComplete, setCardComplete] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    // Notify parent when stripe and card are ready
    useEffect(() => {
        setCardReady(!!stripe && cardComplete && cardName.trim().length > 0);
    }, [stripe, cardComplete, cardName, setCardReady]);

    const handleSubmit = useCallback(async () => {
        if (!stripe || !elements) {
            onError('Stripe not loaded. Please refresh and try again.');
            return;
        }

        if (!cardName.trim()) {
            onError('Please enter the card holder name.');
            return;
        }

        if (!cardComplete) {
            onError('Please enter complete card details.');
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            onError('Card element not found.');
            return;
        }

        setIsProcessing(true);
        console.log('Starting subscription process...');

        try {
            console.log('Creating setup intent...');
            const { data: setupData } = await axios.post('/api/subscription/setup-intent');
            console.log('Setup intent response:', setupData);

            if (!setupData.success) {
                throw new Error(setupData.error || 'Failed to create setup intent');
            }

            console.log('Confirming card setup...');
            const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(setupData.client_secret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: cardName,
                    },
                },
            });

            if (stripeError) {
                console.error('Stripe error:', stripeError);
                throw new Error(resolveStripeError(stripeError));
            }

            if (!setupIntent || setupIntent.status !== 'succeeded') {
                console.error('Setup intent status:', setupIntent?.status);
                throw new Error('Card setup did not complete successfully');
            }

            console.log('Setup intent succeeded, creating subscription...');
            console.log('Payment method ID:', setupIntent.payment_method);

            const { data: subscriptionData } = await axios.post('/api/subscription/create', {
                payment_method_id: setupIntent.payment_method,
                customer_id: setupData.customer_id,
            });

            console.log('Subscription response:', subscriptionData);

            if (!subscriptionData.success) {
                throw new Error(subscriptionData.error || 'Failed to create subscription');
            }

            if (!subscriptionData.subscription?.id) {
                throw new Error('Subscription was not activated. Please try again.');
            }

            console.log('Subscription created successfully! Calling onSuccess...');
            onSuccess();
        } catch (error: any) {
            console.error('Payment error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Payment failed. Please try again.';
            console.error('Displaying error:', errorMessage);
            onError(errorMessage);
        } finally {
            // Always reset processing state
            setIsProcessing(false);
        }
    }, [stripe, elements, cardName, cardComplete, onError, onSuccess, setIsProcessing]);

    useEffect(() => {
        if (!stripe || !elements) {
            onSubmitReady(null);
            return;
        }

        onSubmitReady(() => handleSubmit);

        return () => {
            onSubmitReady(null);
        };
    }, [stripe, elements, handleSubmit, onSubmitReady]);

    return (
        <div className="rounded-3xl bg-[#276860] px-6 py-3.5 lg:px-5">
            <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#BBBBBB]">Billed to</label>
                <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Card Name"
                    className="w-full rounded-md border border-[#EFFDB9] bg-[#CFE96D] px-3 py-2 text-sm font-medium text-[#1B252B] placeholder:text-[#1B252B] focus:outline-none"
                />
            </div>

            <div className="mt-2">
                <div className="relative w-full">
                    <div className="w-full rounded-md border border-[#CECECE] bg-transparent px-3 py-2.5 pr-26">
                        <CardElement
                            options={cardElementOptions}
                            onChange={(e) => {
                                setCardComplete(e.complete);
                                setCardError(e.error?.message || null);
                            }}
                        />
                    </div>

                    <div className="absolute inset-y-0 right-3 flex items-center gap-0.5">
                        <button type="button" className="flex items-center">
                            <div className="relative flex h-4 w-6 items-center justify-center border bg-white">
                                <img src={images.visa} className="h-auto w-4 object-contain" alt="" />
                            </div>
                        </button>
                        <button type="button" className="flex items-center">
                            <div className="relative flex h-4 w-6 items-center justify-center border bg-white">
                                <img src={images.mastercard} className="h-auto w-4 object-contain" alt="" />
                            </div>
                        </button>
                        <button type="button" className="flex items-center">
                            <div className="relative flex h-4 w-6 items-center justify-center border bg-white">
                                <img src={images.paypallogo} className="h-auto w-2 object-contain" alt="" />
                            </div>
                        </button>
                    </div>
                </div>
                {cardError && <p className="mt-1 text-xs text-red-300">{cardError}</p>}
            </div>
        </div>
    );
}

export function StepModal({ open, onClose }: StepModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [cardName, setCardName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [stripeError, setStripeError] = useState<string | null>(null);
    const [cardReady, setCardReady] = useState(false);
    const [submitPayment, setSubmitPayment] = useState<(() => Promise<void>) | null>(null);
    const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [wasSkipped, setWasSkipped] = useState(false);
    const [subscriptionPrice, setSubscriptionPrice] = useState<string | null>(null);

    const { completeOnboarding } = useOnboarding();

    // Check verification status on modal open to determine starting step
    useEffect(() => {
        const checkVerificationStatus = async () => {
            if (!open) return;

            setCheckingStatus(true);
            try {
                const { data } = await axios.get('/api/verification/status');
                console.log('Verification status:', data);

                // Helper function to check if LinkedIn value is valid
                const hasValidLinkedIn = (linkedin: any): boolean => {
                    if (!linkedin || typeof linkedin !== 'string') return false;
                    const trimmed = linkedin.trim();
                    // Check if it's a non-empty string (optionally, you can also validate it looks like a LinkedIn URL)
                    return trimmed.length > 0;
                };

                // If user has a valid LinkedIn profile, auto-verify CEO and skip to step 2 (payment)
                if (data.success && hasValidLinkedIn(data.user?.linkedin)) {
                    console.log('User has valid LinkedIn profile, auto-verifying CEO and skipping to step 2');
                    setStep(2);
                }
                // If business document already uploaded, skip to step 2
                else if (data.success && data.documents?.business_registration) {
                    console.log('Business document already uploaded, skipping to step 2');
                    setStep(2);
                }
                // Otherwise, stay on step 1 (verify CEO modal) - this is the default
                else {
                    console.log('No LinkedIn or business document found, showing step 1 (verify CEO)');
                    setStep(1);
                }
            } catch (error) {
                console.error('Failed to check verification status:', error);
                // Default to step 1 if we can't check
                setStep(1);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkVerificationStatus();
    }, [open]);

    useEffect(() => {
        const loadStripeKey = async () => {
            try {
                setStripeError(null);
                const { data } = await axios.get('/api/stripe/key');
                if (data.public_key) {
                    setStripePromise(loadStripe(data.public_key));
                } else {
                    setStripeError('Stripe public key not configured');
                }
            } catch (error: any) {
                console.error('Failed to load Stripe key:', error);
                setStripeError(error.response?.data?.message || 'Failed to load payment form');
            }
        };

        const fetchPrice = async () => {
            try {
                const { data } = await axios.get('/api/subscription/price');
                if (data.success) {
                    setSubscriptionPrice(data.price_formatted);
                }
            } catch (error) {
                console.error('Failed to fetch subscription price:', error);
            }
        };

        if (open && step === 2) {
            loadStripeKey();
            fetchPrice();
        }
    }, [open, step]);

    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [uploadedDoc, setUploadedDoc] = useState<any>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const uploaded = e.target.files[0];

        if (uploaded.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(uploaded.type)) {
            toast.error('Only JPG, PNG, or PDF files are allowed');
            return;
        }

        setFile(uploaded);
        setProgress(0);

        const formData = new FormData();
        formData.append('document', uploaded);
        formData.append('document_type', 'business_registration');

        try {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await axios.post('/api/verification/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            clearInterval(interval);
            setProgress(100);

            if (response.data.success) {
                setUploadedDoc(response.data.document);
                toast.success('Document uploaded successfully!');
            } else {
                throw new Error(response.data.error || 'Upload failed');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.message || 'Failed to upload document');
            setFile(null);
            setProgress(0);
        }
    };

    const removeFile = async () => {
        if (uploadedDoc?.id) {
            try {
                await axios.delete(`/api/verification/document/${uploadedDoc.id}`);
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        }
        setFile(null);
        setProgress(0);
        setUploadedDoc(null);
    };

    const nextStep = () => {
        if (file && progress === 100) setStep(2);
    };

    const handlePaymentSuccess = () => {
        console.log('Payment success callback called!');
        setPaymentErrorMessage(null);

        // Clean up state
        setFile(null);
        setProgress(0);
        setCardName('');
        setStep(1);
        setIsProcessing(false);
        setLoading(false);
        onClose();

        // Mark onboarding as complete so modal doesn't reappear
        completeOnboarding();

        // Store flag so dashboard shows a welcome toast after reload
        localStorage.setItem('subscription_success', 'true');

        // Force full page reload so server sends needsOnboarding=false
        // (Without this, the OnboardingActivator re-opens the modal because
        //  the Inertia page prop needsOnboarding is still true.)
        window.location.href = '/dashboard';
    };

    const handleSuccessConfirm = () => {
        setShowSuccessPopup(false);
        setWasSkipped(false);
        // Redirect to dashboard after user acknowledges
        // window.location.href = '/dashboard';
    };

    const handleSkip = async () => {
        try {
            // Save skip preference to backend so modal doesn't show again
            await axios.post('/api/subscription/skip');
        } catch (error) {
            console.error('Failed to save skip preference:', error);
        }

        // Close the modal
        setFile(null);
        setProgress(0);
        setCardName('');
        setStep(1);

        // Mark as skipped and show the welcome popup
        setWasSkipped(true);
        setShowSuccessPopup(true);

        onClose();
        completeOnboarding();
    };

    const handlePaymentError = (error: string) => {
        console.error('Payment error callback:', error);
        setPaymentErrorMessage(error);
        toast.error(error, { duration: 5000 });
        setIsProcessing(false);
    };

    const handleConfirm = async () => {
        if (isProcessing) {
            console.log('Already processing, ignoring click');
            return;
        }

        if (!cardReady) {
            toast.error('Please fill in all card details before proceeding.');
            return;
        }

        if (!submitPayment) {
            console.error('Payment submit callback not ready');
            toast.error('Payment form not ready. Please try again.');
            return;
        }

        setPaymentErrorMessage(null);

        try {
            await submitPayment();
        } catch {
            // Error handling is performed in StripePaymentForm via onError.
        }
    };

    const truncateFileName = (text: string, limit = 12) => {
        const words = text.split(' ');
        if (words.length <= limit) return text;
        return words.slice(0, limit).join(' ') + ' ...';
    };

    useEffect(() => {
        if (open) {
            document.body.style.overflow = '';
        } else {
            document.body.style.overflow = 'scroll';
            document.body.style.overflow = 'scroll';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    useEffect(() => {
        if (checkingStatus) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [checkingStatus]);


    return (
        <>
            {/* Overlay - only show when modal is open */}
            {open && <div className="fixed inset-0 z-[49] overflow-hidden bg-black/85" />}
            {/* Checking Status Overlay */}
            {open && checkingStatus && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-[#3DAAB2]" />
                        <p className="text-sm font-medium text-white">Verifying your account…</p>
                    </div>
                </div>
            )}

            {open && !checkingStatus && (

                <div
                    style={{ display: open ? 'flex' : 'none' }}
                    className={`overlay-step-modal relative flex items-center justify-center overflow-y-auto lg:h-auto lg:max-h-max lg:overflow-hidden ${step === 1 ? 'h-[70vh] max-h-[calc(100vh-30rem)]' : 'h-[90vh] max-h-[calc(100vh-4rem)]'} `}
                >
                    <Dialog
                        open={open}
                        modal={false} // MUST be false to use custom overlay
                        onOpenChange={(isOpen) => {
                            if (!isOpen) onClose();
                        }}
                    >
                        <DialogContent
                            onInteractOutside={(e) => e.preventDefault()}
                            onEscapeKeyDown={(e) => e.preventDefault()}
                            className={`!absolute !left-1/2 z-50 mx-auto no-scrollbar w-full max-w-[340px] !-translate-x-1/2 !translate-y-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl md:h-[90vh] md:max-w-xl md:overflow-y-auto lg:!top-[50px] lg:mb-auto lg:h-[50vw] lg:max-w-[900px] xl:h-[38vw] [&>button.absolute.right-4.top-4]:hidden ${step === 1 ? '!top-[20px] mb-10 bg-[#ffff]' : '!top-[90px] mb-10 bg-[#F2F2F2] lg:mb-0 lg:overflow-hidden'}`}
                        >
                            {step === 1 && (
                                <div className="relative flex h-full flex-col py-8">
                                    <div className="flex px-5 pt-16 lg:pl-16">
                                        <div className="h-full w-1 rounded-md bg-[#a3a3a378] lg:hidden"></div>
                                        <div className="absolute top-12 hidden h-[75%] w-[4.5px] bg-[#a3a3a378] lg:block"></div>

                                        <div className="flex h-auto flex-col lg:w-full lg:flex-row">
                                            <div className="relative mb-6 ml-4 flex flex-col items-start gap-3 lg:w-full lg:max-w-[190px]">
                                                <div
                                                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] ${step >= 1 ? 'border-[#137077] bg-[#3DAAB2] text-white' : 'border-[#CFD0D0] bg-[#EBEFEE] text-[#CFD0D0]'}`}
                                                >
                                                    1
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-lg font-bold text-deepBlack">Verified CEO</h4>
                                                    <p className="max-w-[200px] text-[13px] leading-[17px] text-deepBlack lg:max-w-full lg:text-[12px]">
                                                        Verify your company's legitimacy and activates full access to the CEO Network.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative ml-4 flex flex-col gap-5 lg:mt-13 lg:ml-10 lg:w-full lg:max-w-full">
                                                <div className="flex flex-col gap-5 lg:ml-10 lg:max-w-[440px]">
                                                    <div className="pt-6 lg:pl-10">
                                                        <h4 className="text-[16px] font-bold text-deepBlack lg:text-lg">Become a Verified CEO</h4>
                                                        <p className="max-w-[177px] pr-2 text-[10px] leading-3 text-[#2A2A2A] lg:max-w-[370px] lg:pr-2 lg:text-[13px] lg:leading-4">
                                                            Upload company registration/tax certificate/proof of business activity (invoice, contract,
                                                            business bill)
                                                        </p>
                                                    </div>

                                                    <div className="flex h-[74px] w-full flex-row items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 px-3 py-2.5 text-center lg:gap-5 lg:py-4 lg:pl-8.5">
                                                        <img src={images.uploaddoc} alt="" className="h-7 w-auto lg:h-9" />
                                                        <div className="text-left">
                                                            <p className="mb-1 text-[7px] text-deepBlack lg:text-[12.5px]">
                                                                Select a file or drag and drop here
                                                            </p>
                                                            <p className="text-[8px] leading-3 text-gray-500 lg:text-[9.5px]">
                                                                JPG, PNG or PDF, file size no more than 10MB
                                                            </p>
                                                        </div>
                                                        <label
                                                            htmlFor="fileUpload"
                                                            className="cursor-pointer rounded-full border border-[#3DAAB2] px-2 py-2 text-[8px] whitespace-nowrap text-[#3DAAB2] uppercase lg:px-3 lg:text-[11px]"
                                                        >
                                                            {file ? 'Change File' : 'Select File'}
                                                        </label>
                                                        <input
                                                            id="fileUpload"
                                                            type="file"
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                            className="hidden"
                                                            onChange={handleFileChange}
                                                        />
                                                    </div>
                                                </div>

                                                {file && (
                                                    <div className="mt-5 w-full bg-transparent lg:translate-x-[-50px]">
                                                        {progress < 100 ? (
                                                            <>
                                                                <p className="text-sm font-medium">Uploading...</p>
                                                                <div className="flex w-full max-w-3xl items-center">
                                                                    <div className="mr-4 flex h-10 w-10 items-center justify-center">
                                                                        <img src={images.fileIcon} className="h-6 w-6 object-cover" alt="" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="mb-1 text-[11px] text-gray-700">
                                                                                {truncateFileName(file?.name || '')}
                                                                            </div>
                                                                            <div className="ml-4 text-xs text-gray-500">
                                                                                {(file.size / 1024 / 1024).toFixed(2)}MB
                                                                            </div>
                                                                        </div>
                                                                        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                                                                            <div
                                                                                className="h-1 rounded-full bg-[#0F91D2]"
                                                                                style={{ width: `${progress}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm font-light">File added</p>
                                                                <div className="group relative mt-4 mb-4 flex w-full max-w-xl items-center justify-between rounded-md p-3 py-4 transition-colors duration-500 hover:bg-black/10 lg:mb-0">
                                                                    <div className="flex">
                                                                        <div className="mr-3 flex items-center justify-center">
                                                                            <img src={images.uploadview} className="h-6 w-6 object-cover" alt="" />
                                                                        </div>
                                                                        <div className="flex gap-3">
                                                                            <div className="mb-1 text-[11px] text-gray-700 lg:mt-2">
                                                                                {truncateFileName(file?.name || '')}
                                                                            </div>
                                                                            <span className="font-bold text-gray-900">.</span>
                                                                            <button
                                                                                onClick={() => setPreviewOpen(true)}
                                                                                className="text-xs text-blue-800"
                                                                            >
                                                                                Preview
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4 text-xs text-gray-500">
                                                                        {(file.size / 1024 / 1024).toFixed(2)}MB
                                                                    </div>
                                                                    <div className="pointer-events-none absolute -top-2 right-0 translate-y-1 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                                                                        <button
                                                                            onClick={removeFile}
                                                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-800"
                                                                        >
                                                                            <X className="h-3 w-3 text-white" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`relative mx-auto mt-auto flex max-w-[400px] pt-0 md:max-w-full lg:mr-16 lg:w-[54%] lg:max-w-full lg:self-end lg:pb-0`}
                                    >
                                        <div className="flex w-full gap-3 py-20 lg:mt-10 lg:py-0">
                                            <Button className="w-full rounded-full border border-[#3DAAB2] bg-transparent px-8 py-3 text-[10px] font-light text-[#3DAAB2] hover:bg-transparent lg:px-0 lg:py-5 lg:text-base">
                                                Why It's Needed
                                            </Button>
                                            <Button
                                                onClick={nextStep}
                                                disabled={!file || progress < 100}
                                                className="w-full rounded-full bg-[#3DAAB2] px-16 py-3 text-[10px] font-light text-white hover:bg-[#3DAAB2]/90 lg:px-0 lg:px-18 lg:py-5 lg:text-base"
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <>
                                    <DialogHeader className="border-0 text-left lg:px-5 lg:pt-6">
                                        <div className="grid grid-cols-1 gap-7 rounded-b-[40px] bg-[#024E44] px-4 py-3 pr-8 pb-7 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:pt-6">
                                            <div className="flex flex-col gap-2 pt-7 pl-6 lg:gap-4 lg:pl-0">
                                                <h3 className="text-xl leading-6 font-bold text-[#F3F0E9] lg:text-2xl lg:leading-7">
                                                    Activate Your Free Trial Subscription
                                                </h3>
                                                <p className="max-w-[260px] text-[12px] text-[#BBBBBB] lg:max-w-[300px] lg:text-xs lg:leading-[18px]">
                                                    Start your 14-day premium trial immediately. Your plan will auto-renew at {subscriptionPrice ?? '...'}/month after the trial.
                                                    Cancel anytime.
                                                </p>
                                            </div>

                                            {stripePromise ? (
                                                <Elements stripe={stripePromise}>
                                                    <StripePaymentForm
                                                        onSuccess={handlePaymentSuccess}
                                                        onError={handlePaymentError}
                                                        onSubmitReady={setSubmitPayment}
                                                        cardName={cardName}
                                                        setCardName={setCardName}
                                                        isProcessing={isProcessing}
                                                        setIsProcessing={setIsProcessing}
                                                        setCardReady={setCardReady}
                                                    />
                                                </Elements>
                                            ) : stripeError ? (
                                                <div className="rounded-3xl bg-[#276860] px-6 py-3.5 lg:px-5 flex flex-col items-center justify-center gap-2">
                                                    <span className="text-red-300 text-sm">{stripeError}</span>
                                                    <button onClick={() => { setStripeError(null); setStripePromise(null); }} className="text-white text-xs underline">Retry</button>
                                                </div>
                                            ) : (
                                                <div className="rounded-3xl bg-[#276860] px-6 py-3.5 lg:px-5 flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                    <span className="ml-2 text-white text-sm">Loading payment form...</span>
                                                </div>
                                            )}
                                        </div>
                                    </DialogHeader>

                                    <div className="px-5 pb-6">
                                        <div className="flex flex-col gap-6 md:gap-14 lg:max-w-[830px] lg:flex-row">
                                            <div className="h-fit w-full rounded-4xl bg-white px-6 pt-4 pb-7 lg:w-auto lg:max-w-[348px]">
                                                <h2 className="mb-2 text-[13.5px] font-semibold text-[#1B252B] lg:text-base">What you'll get.</h2>
                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-[#2ABFBB] lg:text-sm">
                                                            1. Connect with Verified Trust
                                                        </p>
                                                        <p className="mt-1 ml-3 text-[10px] font-light text-[#8A9399] lg:text-xs">
                                                            Every member is vetted. Negotiate and share securely.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-[#2ABFBB] lg:text-sm">
                                                            2. See Your Network's Real Value
                                                        </p>
                                                        <p className="mt-1 ml-3 text-[10px] font-light text-[#8A9399] lg:text-xs">
                                                            Track which connections actually lead to closed business.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-[#2ABFBB] lg:text-sm">
                                                            3. Do More Deals, Less Networking
                                                        </p>
                                                        <p className="mt-1 ml-3 pr-1 text-[10px] font-light text-[#8A9399] lg:text-xs">
                                                            Get quality introductions to partners who are ready to do business.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    {/* <label className="mb-1.5 block pl-9 text-[12px] font-medium text-[#606060] lg:pl-10">
                                                        Membership Type
                                                    </label> */}
                                                    <div className="space-y-2">
                                                        <div className="flex cursor-pointer items-center justify-between rounded-3xl border border-pinkLight bg-white px-4 py-3.5 pr-6 transition lg:rounded-3xl lg:px-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-[#2ABFBB] bg-transparent text-[#2ABFBB] transition">
                                                                    <Check className="h-2.5 w-2.5 text-[#2ABFBB]" />
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-xs font-semibold text-[#1B252B] lg:text-sm">Pay Monthly</span>
                                                                    <span className="text-[10px] tracking-wide text-[#8A9399] lg:text-xs">
                                                                        {subscriptionPrice ?? '...'} / Month
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-bold text-deepBlack">14-Day Free Trial</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="px-4 lg:px-10">
                                                        {/* <p className="text-[11px] font-medium text-[#84949E] lg:pr-7 lg:text-[13px]">
                                                            Enjoy NOEL Premium free for 14 days. Your plan will auto-renew at {subscriptionPrice ?? '...'}/month after the trial.
                                                            Cancel anytime.
                                                        </p> */}
                                                        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                                                            <p className="text-[10px] font-medium text-amber-800 lg:text-[11px]">
                                                                🔒 A temporary <strong>£1.00</strong> verification charge will be applied to confirm your card is valid. This will be <strong>refunded immediately</strong>. You won't be billed until the trial ends.
                                                            </p>
                                                        </div>
                                                        <p className="mt-3 text-left text-[10px] text-gray-500 lg:mt-2 lg:text-[11px]">
                                                            By continuing{' '}
                                                            <a href="#" className="font-semibold text-pinkLight underline">
                                                                you agree to our terms and conditions.
                                                            </a>
                                                        </p>
                                                    </div>

                                                    <DialogFooter className="pt-8">
                                                        <div className="w-full space-y-3">
                                                            <Button disabled={loading || isProcessing || !cardReady || !submitPayment} onClick={handleConfirm} className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#024E44] py-7 text-xs font-semibold text-white hover:cursor-pointer hover:bg-[#024E44]/90 disabled:cursor-not-allowed disabled:opacity-50 lg:text-base">
                                                                {(loading || isProcessing) ? (<><Loader2 className="h-4 w-4 animate-spin" />Processing...</>) : (<><Zap className="h-4 w-4" />Start Free Trial</>)}
                                                            </Button>
                                                            {paymentErrorMessage && (
                                                                <p className="text-center text-xs text-red-600">
                                                                    {paymentErrorMessage}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </DialogFooter>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {isPreviewOpen && file && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                    <div className="relative w-full max-w-2xl rounded-lg bg-white p-4">
                                        <button onClick={() => setPreviewOpen(false)} className="absolute top-3 right-3 text-black">
                                            <X />
                                        </button>
                                        {file?.type?.includes('pdf') ? (
                                            <iframe src={URL.createObjectURL(file)} className="h-[70vh] w-full" />
                                        ) : (
                                            <img src={URL.createObjectURL(file)} className="mx-auto max-h-[70vh]" />
                                        )}
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

            )}
            {/* Animated Success Toast */}
            <SuccessToast show={showSuccessPopup} onComplete={handleSuccessConfirm} isSkipped={wasSkipped} />
        </>
    );
}
