'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import axios from 'axios';
import { resolveStripeError } from '@/lib/stripe-errors';

import images from '@/constants/image';
import { Check, X, Zap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

// Card Element styling to match existing design
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

// Inner payment form component that uses Stripe hooks
function StripePaymentForm({
    onSuccess,
    onError,
    cardName,
    setCardName,
    isProcessing,
    setIsProcessing
}: {
    onSuccess: () => void;
    onError: (error: string) => void;
    cardName: string;
    setCardName: (name: string) => void;
    isProcessing: boolean;
    setIsProcessing: (processing: boolean) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [cardComplete, setCardComplete] = useState(false);

    const handleSubmit = async () => {
        if (!stripe || !elements) {
            onError('Stripe not loaded. Please refresh and try again.');
            return;
        }

        if (!cardName.trim()) {
            onError('Please enter the card holder name.');
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            onError('Card element not found.');
            return;
        }

        setIsProcessing(true);

        try {
            // Create a SetupIntent first
            const { data: setupData } = await axios.post('/api/subscription/setup-intent');

            if (!setupData.success) {
                throw new Error(setupData.error || 'Failed to create setup intent');
            }

            // Confirm the setup with the card details
            const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(
                setupData.client_secret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: cardName,
                        },
                    },
                }
            );

            if (stripeError) {
                throw new Error(resolveStripeError(stripeError));
            }

            if (!setupIntent || setupIntent.status !== 'succeeded') {
                throw new Error('Card setup did not complete successfully');
            }

            // Create the subscription with the payment method (30-day trial, won't charge now)
            const { data: subscriptionData } = await axios.post('/api/subscription/create', {
                payment_method_id: setupIntent.payment_method,
                customer_id: setupData.customer_id,
            });

            if (!subscriptionData.success) {
                throw new Error(subscriptionData.error || 'Failed to create subscription');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Payment error:', error);
            onError(error.response?.data?.error || error.message || 'Payment failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="rounded-3xl bg-[#276860] px-6 py-3.5 lg:px-5">
            <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#BBBBBB]">Billed to</label>
                <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Card Name"
                    className="w-full rounded-md border placeholder:text-[#1B252B] border-[#EFFDB9] bg-[#CFE96D] px-3 py-2 text-sm font-medium text-[#1B252B] focus:outline-none"
                />
            </div>

            <div className="mt-2">
                <div className="relative w-full">
                    <div className="w-full rounded-md border border-[#CECECE] bg-transparent px-3 py-2.5 pr-26">
                        <CardElement
                            options={cardElementOptions}
                            onChange={(e) => setCardComplete(e.complete)}
                        />
                    </div>

                    {/* pay card icons */}
                    <div className="absolute inset-y-0 right-3 flex gap-0.5 items-center">
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
            </div>

            {/* Hidden submit trigger - actual button is in footer */}
            <input type="hidden" id="stripe-card-complete" value={cardComplete ? 'true' : 'false'} />
            <button
                id="stripe-submit-btn"
                type="button"
                onClick={handleSubmit}
                className="hidden"
                disabled={!stripe || !cardComplete || isProcessing}
            />
        </div>
    );
}

export function OnBoardingStepModal({ isOpen, onClose, onConfirm }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [cardName, setCardName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [stripeError, setStripeError] = useState<string | null>(null);

    // Load Stripe public key
    useEffect(() => {
        const loadStripeKey = async () => {
            try {
                setStripeError(null);
                const { data } = await axios.get('/api/stripe/key');
                console.log('Stripe key response:', data);
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

        if (isOpen && step === 2) {
            loadStripeKey();
        }
    }, [isOpen, step]);

    // File Upload State
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [isPreviewOpen, setPreviewOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const uploaded = e.target.files[0];
        setFile(uploaded);
        setProgress(0);

        // Start the fake upload progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10; // Change the step for a smoother progress
            });
        }, 500); // Adjust speed of progress
    };

    const removeFile = () => {
        setFile(null);
        setProgress(0);
    };

    const nextStep = () => {
        if (file && progress === 100) setStep(2);
    };

    const handlePaymentSuccess = () => {
        setLoading(true);
        toast.success('Subscription activated! Enjoy your 30-day free trial.');

        setTimeout(() => {
            setLoading(false);
            // Reset state
            setFile(null);
            setProgress(0);
            setCardName('');
            setStep(1);
            onConfirm();
            // Redirect to dashboard
            window.location.href = '/dashboard';
        }, 1500);
    };

    const handlePaymentError = (error: string) => {
        toast.error(error);
    };

    const handleConfirm = () => {
        // Trigger the hidden Stripe submit button
        const submitBtn = document.getElementById('stripe-submit-btn');
        if (submitBtn) {
            submitBtn.click();
        }
    };

    const truncateFileName = (text: string, limit = 12) => {
        const words = text.split(' ');
        if (words.length <= limit) return text;
        return words.slice(0, limit).join(' ') + ' ...';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()} // block outside click
                onEscapeKeyDown={(e) => e.preventDefault()} // block ESC close
                className={`no-scrollbar h-[70vh] max-w-sm overflow-hidden overflow-y-auto rounded-2xl border-0! p-0 shadow-2xl md:max-w-xl lg:h-[50vw] lg:max-w-[900px] xl:h-[38vw] [&>button.absolute.right-4.top-4]:hidden ${step === 1 ? 'bg-[#ffff]' : 'bg-[#F2F2F2]'}`}
            >
                {/* =========================== STEP 1 =========================== */}
                {step === 1 && (
                    <div className="relative flex h-full flex-col py-8">
                        <div className="flex px-5 pt-16 lg:pl-16">
                            <div className="h-full w-1 rounded-md bg-[#a3a3a378] lg:hidden"></div>
                            <div className="absolute top-12 hidden h-[75%] w-[4.5px] bg-[#a3a3a378] lg:block"></div>

                            <div className="flex h-auto flex-col lg:w-full lg:flex-row">
                                {/* MOBILE HEADER */}
                                <div className="relative mb-6 ml-4 flex flex-col items-start gap-3 lg:w-full lg:max-w-[190px]">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] ${step >= 1 ? 'border-[#137077] bg-[#3DAAB2] text-white' : 'border-[#CFD0D0] bg-[#EBEFEE] text-[#CFD0D0]'
                                            }`}
                                    >
                                        1
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg font-bold text-deepBlack">Verified CEO</h4>
                                        <p className="max-w-[200px] text-sm leading-4 text-deepBlack lg:max-w-full lg:text-[12px]">
                                            Verify your company’s legitimacy and activates full access to the CEO Network.
                                        </p>
                                    </div>
                                </div>

                                {/* MAIN CONTENT */}
                                <div className="relative ml-4 flex flex-col gap-5 lg:mt-13 lg:ml-10 lg:w-full lg:max-w-full">
                                    <div className="flex flex-col gap-5 lg:ml-10 lg:max-w-[440px]">
                                        <div className="pt-6 lg:pl-10">
                                            <h4 className="text-lg font-bold text-deepBlack">Become a Verified CEO</h4>
                                            <p className="max-w-[247px] pr-2 text-sm leading-3.5 text-[#2A2A2A] lg:max-w-[370px] lg:text-[13px] lg:leading-4">
                                                Upload company registration/tax certificate/proof of business activity (invoice, contract, business
                                                bill)
                                            </p>
                                        </div>

                                        {/* ======================= FILE UPLOAD BOX ======================= */}
                                        <div className="flex h-20 w-full flex-row items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 px-3 py-2.5 text-center lg:gap-5 lg:py-4 lg:pl-8.5">
                                            <img src={images.uploaddoc} alt="" className="h-7 w-auto lg:h-9" />

                                            <div className="text-left">
                                                <p className="mb-1 text-[9px] text-deepBlack lg:text-[12.5px]">Select a file or drag and drop here</p>
                                                <p className="text-[8px] leading-3 text-gray-500 lg:text-[9.5px]">
                                                    JPG, PNG or PDF, file size no more than 10MB
                                                </p>
                                            </div>

                                            <label
                                                htmlFor="fileUpload"
                                                className="cursor-pointer rounded-full border border-[#3DAAB2] px-2 py-2 text-[10px] whitespace-nowrap text-[#3DAAB2] uppercase lg:px-3 lg:text-[11px]"
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

                                    {/* ======================= FILE UPLOADED CARD ======================= */}
                                    {file && (
                                        <div className="mt-5 w-full bg-transparent lg:translate-x-[-50px]">
                                            {/* When File is Uploading */}
                                            {progress < 100 ? (
                                                <>
                                                    <p className="text-sm font-medium">
                                                        Uploading...
                                                        {/* <sup>{progress}%</sup> */}
                                                    </p>
                                                    <div className="flex w-full max-w-3xl items-center">
                                                        <div className="mr-4 flex h-10 w-10 items-center justify-center">
                                                            <div className="relative h-6 w-6">
                                                                <img src={images.fileIcon} className="h-auto w-full object-cover" alt="" />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <div className="mb-1 text-[11px] text-gray-700">
                                                                    {' '}
                                                                    {truncateFileName(file?.name || '', 5)}
                                                                </div>

                                                                <div className="ml-4 text-xs text-gray-500">
                                                                    {(file?.size ?? 0 / 1024 / 1024).toFixed(2)}MB
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
                                                // When Finished Uploading
                                                <>
                                                    <p className="text-sm font-light">File added</p>
                                                    <div className="group relative mt-4 flex w-full max-w-xl items-center justify-between rounded-md p-3 py-4 transition-colors duration-500 hover:bg-black/10">
                                                        <div className="flex">
                                                            <div className="mr-3 flex items-center justify-center">
                                                                <div className="relative h-6 w-6">
                                                                    <img src={images.uploadview} className="h-auto w-full object-cover" alt="" />
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <div className="mb-1 text-[11px] text-gray-700 lg:mt-2">
                                                                    {truncateFileName(file?.name || '', 5)}
                                                                </div>
                                                                <span className="font-bold text-gray-900">.</span>
                                                                <button onClick={() => setPreviewOpen(true)} className="text-xs text-blue-800">
                                                                    Preview
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="ml-4 text-xs text-gray-500">
                                                                {(file?.size ?? 0 / 1024 / 1024).toFixed(2)}MB
                                                            </div>
                                                        </div>

                                                        {/* Show close on hover of parent group */}
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

                        {/* FOOTER BUTTONS */}
                        <div className="relative mx-auto mt-auto flex max-w-[400px] pt-0 lg:mr-16 lg:w-[54%] lg:max-w-full lg:self-end">
                            <div className="mt-20 flex w-full gap-3 lg:mt-10">
                                <Button className="w-full rounded-full border border-[#3DAAB2] bg-transparent px-3 py-4 font-light text-[#3DAAB2] hover:bg-transparent lg:px-0">
                                    Why It’s Needed
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    disabled={!file || progress < 100}
                                    className="w-full rounded-full bg-[#3DAAB2] px-18 py-4 font-light text-white hover:bg-[#3DAAB2]/90 lg:px-0"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===========================
                     STEP 2 → Existing Payment UI
                ============================ */}
                {step === 2 && (
                    <>
                        {/* Header Payment */}
                        <DialogHeader className="border-0! text-left lg:px-5 lg:pt-6">
                            <div className="grid grid-cols-1 gap-7 rounded-b-[40px] bg-[#024E44] px-4 py-3 pr-8 pb-7 lg:grid-cols-2 lg:gap-10 lg:px-10">
                                <div className="flex flex-col gap-2 pt-7 pl-6 lg:gap-4 lg:pl-0">
                                    <h3 className="text-xl leading-6 font-bold text-[#F3F0E9] lg:text-2xl lg:leading-7">
                                        Activate Your Free Trial Subscription
                                    </h3>

                                    <p className="max-w-[260px] text-[12px] text-[#BBBBBB] lg:max-w-[300px] lg:leading-[18px] lg:text-sm">
                                        Start your 1-month complimentary premium trial immediately. Your subscription will only begin after the free
                                        period, and you can cancel anytime.
                                    </p>
                                </div>

                                {stripePromise ? (
                                    <Elements stripe={stripePromise}>
                                        <StripePaymentForm
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                            cardName={cardName}
                                            setCardName={setCardName}
                                            isProcessing={isProcessing}
                                            setIsProcessing={setIsProcessing}
                                        />
                                    </Elements>
                                ) : stripeError ? (
                                    <div className="rounded-3xl bg-[#276860] px-6 py-3.5 lg:px-5 flex flex-col items-center justify-center gap-2">
                                        <span className="text-red-300 text-sm">{stripeError}</span>
                                        <button
                                            onClick={() => {
                                                setStripeError(null);
                                                setStripePromise(null);
                                            }}
                                            className="text-white text-xs underline"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : (
                                    <div className="rounded-3xl bg-[#276860] px-6 py-3.5 lg:px-5 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                        <span className="ml-2 text-white text-sm">Loading payment form...</span>
                                    </div>
                                )}
                            </div>
                        </DialogHeader>

                        {/* Body Payment */}
                        <div className="px-5 pb-6">
                            <div className="flex flex-col gap-10 md:gap-14 lg:max-w-[830px] lg:flex-row">
                                {/* LEFT COLUMN */}
                                {/* <div className="flex-1 space-y-2"> */}
                                <div className="h-fit max-w-[348px] rounded-4xl bg-white px-6 pt-4 pb-7 lg:shadow-lg">
                                    <h2 className="mb-2 text-base font-bold text-[#1B252B]">What you’ll get.</h2>

                                    <div className="space-y-6">
                                        {/* Item 1 */}
                                        <div>
                                            <p className="text-sm font-semibold text-[#2ABFBB]">1. Connect with Verified Trust</p>
                                            <p className="mt-1 ml-3 text-xs font-light text-[#8A9399]">
                                                Every member is vetted. Negotiate and share securely.
                                            </p>
                                        </div>

                                        {/* Item 2 */}
                                        <div>
                                            <p className="text-sm font-semibold text-[#2ABFBB]">2. See Your Network’s Real Value</p>
                                            <p className="mt-1 ml-3 text-xs font-light text-[#8A9399]">
                                                Track which connections actually lead to closed business.
                                            </p>
                                        </div>

                                        {/* Item 3 */}
                                        <div>
                                            <p className="text-sm font-semibold text-[#2ABFBB]">3. Do More Deals, Less Networking</p>
                                            <p className="mt-1 ml-3 pr-1 text-xs font-light text-[#8A9399]">
                                                Get quality introductions to partners who are ready to do business.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* </div> */}

                                {/* RIGHT COLUMN */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="mb-1.5 block pl-9 text-[12px] font-medium text-[#606060] lg:pl-10">Membership Type</label>
                                        <div className="space-y-2">
                                            {/* Quarterly */}
                                            <div

                                                className={`flex cursor-pointer items-center justify-between rounded-3xl border border-pinkLight bg-white px-4 py-3.5 pr-6 transition lg:rounded-3xl lg:px-5 `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-4 w-4 border-[#2ABFBB] text-[#2ABFBB] items-center justify-center rounded-full border bg-transparent transition `}
                                                    >
                                                        <Check
                                                            className={`h-2.5 w-2.5 text-[#2ABFBB] `}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-semibold text-[#1B252B]">Pay Monthly</span>
                                                        <span className="text-xs tracking-wide text-[#8A9399]">$0 / Month Per Member</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-xs font-bold text-deepBlack">Save 100%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terms */}
                                    <div>
                                        <div className="px-4 lg:px-10">
                                            <p className="text-[12px] font-medium text-[#84949E]">
                                                Enjoy NOEL Premium free for 30 days. Your plan will auto-renew for $1/month after the trial. Cancel
                                                anytime.
                                            </p>
                                            <p className="mt-3 text-left text-[11px] text-gray-500 lg:mt-5">
                                                By continuing{' '}
                                                <a href="#" className="font-semibold text-pinkLight underline">
                                                    you agree to our terms and conditions.
                                                </a>
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <DialogFooter className="pt-4">
                                            <div className="w-full">
                                                <Button
                                                    disabled={loading || isProcessing}
                                                    onClick={handleConfirm}
                                                    className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#024E44] py-7 font-semibold text-white hover:bg-[#024E44]/90"
                                                >
                                                    {(loading || isProcessing) ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap className="h-4 w-4" />
                                                            Proceed to NOEL
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </DialogFooter>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {/* ======================= PREVIEW MODAL ======================= */}
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
    );
}
