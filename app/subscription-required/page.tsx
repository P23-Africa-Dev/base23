'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import images from '@/constants/image';
import { AlertTriangle, CreditCard, Crown, Loader2, RefreshCw, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { resolveStripeError } from '@/lib/stripe-errors';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            profile_picture?: string | null;
        } | null;
    };
    hasExpiredSubscription?: boolean;
    subscriptionStatus?: string | null;
}

// Inline Stripe card form for subscribing
function SubscribeCardForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [cardReady, setCardReady] = useState(false);
    const [cardName, setCardName] = useState('');

    const handleSubmit = async () => {
        if (!stripe || !elements || processing) return;
        setProcessing(true);

        try {
            // Create setup intent
            const { data: setupData } = await axios.post('/api/subscription/setup-intent');
            if (!setupData.success) throw new Error(setupData.error || 'Failed to create setup intent');

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) throw new Error('Card element not found');

            const { error, setupIntent } = await stripe.confirmCardSetup(setupData.client_secret, {
                payment_method: {
                    card: cardElement,
                    billing_details: { name: cardName || undefined },
                },
            });

            if (error) throw new Error(resolveStripeError(error));
            if (!setupIntent?.payment_method) throw new Error('No payment method returned');

            // Create subscription
            const { data: subData } = await axios.post('/api/subscription/create', {
                payment_method_id: typeof setupIntent.payment_method === 'string'
                    ? setupIntent.payment_method
                    : setupIntent.payment_method.id,
                customer_id: setupData.customer_id,
            });

            if (subData.success) {
                toast.success('Subscription activated! Welcome to NOEL.');
                onSuccess();
            } else {
                throw new Error(subData.error || 'Failed to create subscription');
            }
        } catch (err: any) {
            toast.error(err.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Name on card</label>
                <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#024E44] focus:outline-none focus:ring-1 focus:ring-[#024E44]"
                />
            </div>
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Card details</label>
                <div className="rounded-lg border border-gray-300 px-4 py-3">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#1f2937',
                                    '::placeholder': { color: '#9ca3af' },
                                },
                            },
                        }}
                        onChange={(e) => setCardReady(e.complete)}
                    />
                </div>
            </div>
            <Button
                onClick={handleSubmit}
                disabled={processing || !cardReady || !stripe}
                className="w-full bg-[#024E44] py-6 text-white hover:bg-[#024E44]/90 disabled:opacity-50"
            >
                {processing ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                ) : (
                    <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Start 14-Day Free Trial</span>
                )}
            </Button>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-[10px] font-medium text-amber-800 lg:text-[11px]">
                    🔒 A temporary <strong>£1.00</strong> verification charge will be applied to confirm your card is valid. This will be <strong>refunded immediately</strong> — you won't be billed until the trial ends.
                </p>
            </div>
        </div>
    );
}

// Renew form for expired subscriptions
function RenewSection() {
    const [renewLoading, setRenewLoading] = useState(false);

    const handleRenew = async () => {
        setRenewLoading(true);
        try {
            const { data } = await axios.post('/api/subscription/renew');
            if (data.success) {
                toast.success('Subscription renewed!');
                window.location.href = '/dashboard';
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Renewal failed');
        } finally {
            setRenewLoading(false);
        }
    };

    return (
        <Button
            onClick={handleRenew}
            disabled={renewLoading}
            className="w-full bg-orange-600 py-6 text-white hover:bg-orange-700 disabled:opacity-50"
        >
            {renewLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Renewing...</span>
            ) : (
                <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Renew Subscription</span>
            )}
        </Button>
    );
}

export default function SubscriptionRequired({ auth, hasExpiredSubscription, subscriptionStatus }: Props) {
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [priceFormatted, setPriceFormatted] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const [keyRes, priceRes] = await Promise.all([
                    axios.get('/api/stripe/key'),
                    axios.get('/api/subscription/price'),
                ]);

                if (keyRes.data.public_key) {
                    setStripePromise(loadStripe(keyRes.data.public_key));
                }
                if (priceRes.data.success) {
                    setPriceFormatted(priceRes.data.price_formatted);
                }
            } catch (e) {
                console.error('Failed to initialize:', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleSuccess = () => {
        window.location.href = '/dashboard';
    };

    return (
        <>
            
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8F7F4] to-[#EEF2E6] p-4">
                <div className="w-full max-w-lg">
                    {/* Header card */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="bg-gradient-to-r from-[#024E44] to-[#013831] px-8 py-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                                {hasExpiredSubscription ? (
                                    <AlertTriangle className="h-8 w-8 text-orange-300" />
                                ) : (
                                    <Crown className="h-8 w-8 text-[#D6E264]" />
                                )}
                            </div>
                            <h1 className="mb-2 text-2xl font-bold text-white">
                                {hasExpiredSubscription ? 'Subscription Expired' : 'Subscription Required'}
                            </h1>
                            <p className="text-sm text-gray-300">
                                {hasExpiredSubscription
                                    ? 'Your subscription has expired. Renew to continue using NOEL.'
                                    : 'You need an active subscription to access NOEL. Start your 14-day free trial today.'}
                            </p>
                        </div>

                        <div className="p-8">
                            {/* Price display */}
                            {priceFormatted && (
                                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Monthly Subscription</p>
                                            {!hasExpiredSubscription && (
                                                <p className="text-xs text-green-600 font-medium">14-day free trial included</p>
                                            )}
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">{priceFormatted}/mo</p>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                </div>
                            ) : hasExpiredSubscription ? (
                                <div className="space-y-4">
                                    <RenewSection />
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                                        <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-500">or add a new card</span></div>
                                    </div>
                                    {stripePromise && (
                                        <Elements stripe={stripePromise}>
                                            <SubscribeCardForm onSuccess={handleSuccess} />
                                        </Elements>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {stripePromise ? (
                                        <Elements stripe={stripePromise}>
                                            <SubscribeCardForm onSuccess={handleSuccess} />
                                        </Elements>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-red-500">Failed to load payment form. Please refresh.</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Benefits */}
                            <div className="mt-8 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900">What's included:</h3>
                                <div className="grid gap-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#024E44]" />
                                        Smart Matching to find ideal business partners
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#024E44]" />
                                        Full Directory access to browse the network
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#024E44]" />
                                        Lead generation tools and opportunities
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#024E44]" />
                                        Messaging and deal card features
                                    </div>
                                </div>
                            </div>

                            {/* Profile link */}
                            <div className="mt-6 text-center">
                                <a
                                    href="/profile?tab=subscription"
                                    className="text-sm text-[#024E44] underline hover:text-[#024E44]/80"
                                >
                                    <CreditCard className="mr-1 inline h-3.5 w-3.5" />
                                    Manage payment cards in profile
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => axios.post('/logout').then(() => { window.location.href = '/login'; })}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
