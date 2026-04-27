import { Button } from '@/components/ui/button';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import axios from 'axios';
import { CreditCard, Coins, Crown, Loader2, RefreshCw, Trash2, Zap, BookOpen, Target, Plus, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface SubscriptionInfo {
    id: number;
    status: string;
    is_active: boolean;
    is_trial: boolean;
    trial_ends_at: string | null;
    ends_at: string | null;
    days_remaining: number | null;
    price: number;
    price_formatted: string;
    auto_renew: boolean;
}

interface CoinBalance {
    smart_matching: number | null;
    directory: number | null;
    leads: number | null;
}

interface PaymentCardInfo {
    id: number;
    brand: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
    is_primary: boolean;
    display_brand: string;
}

interface SubscriptionTabProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

const cardElementOptions = {
    style: {
        base: {
            fontSize: '14px',
            color: '#1f2937',
            '::placeholder': { color: '#9ca3af' },
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        invalid: { color: '#ef4444' },
    },
    hidePostalCode: true,
};

/* ──────────────────────────────────────────────
   Inner Stripe form used inside <Elements>
   ────────────────────────────────────────────── */
function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [cardName, setCardName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);

    const handleSubmit = async () => {
        if (!stripe || !elements) return;
        if (!cardName.trim()) { toast.error('Please enter the cardholder name.'); return; }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        setProcessing(true);
        try {
            const { data: setupData } = await axios.post('/api/subscription/setup-intent');
            if (!setupData.success) throw new Error(setupData.error || 'Failed to create setup intent');

            const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(setupData.client_secret, {
                payment_method: { card: cardElement, billing_details: { name: cardName } },
            });

            if (stripeError) throw new Error(stripeError.message || 'Card verification failed');
            if (!setupIntent || setupIntent.status !== 'succeeded') throw new Error('Card setup did not complete');

            await axios.post('/api/payment-cards', { payment_method_id: setupIntent.payment_method });
            toast.success('Card added successfully');
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Failed to add card');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h4 className="text-sm font-semibold text-gray-900">Add New Card</h4>
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Cardholder Name</label>
                <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Card Details</label>
                <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5">
                    <CardElement options={cardElementOptions} onChange={(e) => setCardComplete(e.complete)} />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleSubmit}
                    disabled={!stripe || !cardComplete || processing || !cardName.trim()}
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                    size="sm"
                >
                    {processing ? (
                        <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</span>
                    ) : (
                        <span className="flex items-center gap-2"><Plus className="h-3.5 w-3.5" /> Add Card</span>
                    )}
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={processing}>Cancel</Button>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Subscribe form used inside <Elements>
   ────────────────────────────────────────────── */
function SubscribeForm({ onSuccess, stripePromise }: { onSuccess: () => void; stripePromise: Promise<Stripe | null> }) {
    return (
        <Elements stripe={stripePromise}>
            <SubscribeFormInner onSuccess={onSuccess} />
        </Elements>
    );
}

function SubscribeFormInner({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [cardName, setCardName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);

    const handleSubscribe = async () => {
        if (!stripe || !elements) return;
        if (!cardName.trim()) { toast.error('Please enter the cardholder name.'); return; }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        setProcessing(true);
        try {
            const { data: setupData } = await axios.post('/api/subscription/setup-intent');
            if (!setupData.success) throw new Error(setupData.error || 'Failed to create setup intent');

            const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(setupData.client_secret, {
                payment_method: { card: cardElement, billing_details: { name: cardName } },
            });

            if (stripeError) throw new Error(stripeError.message || 'Card verification failed');
            if (!setupIntent || setupIntent.status !== 'succeeded') throw new Error('Card setup did not complete');

            const { data: subData } = await axios.post('/api/subscription/create', {
                payment_method_id: setupIntent.payment_method,
                customer_id: setupData.customer_id,
            });

            if (!subData.success) throw new Error(subData.error || 'Failed to create subscription');

            toast.success('Subscription activated! Enjoy your 14-day free trial.');
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Subscription failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Cardholder Name</label>
                <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Card Details</label>
                <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5">
                    <CardElement options={cardElementOptions} onChange={(e) => setCardComplete(e.complete)} />
                </div>
            </div>
            <Button
                onClick={handleSubscribe}
                disabled={!stripe || !cardComplete || processing || !cardName.trim()}
                className="w-full bg-[#024E44] text-white hover:bg-[#024E44]/90 py-5"
            >
                {processing ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                ) : (
                    <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Start Free 14-Day Trial</span>
                )}
            </Button>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-center text-[10px] font-medium text-amber-800 lg:text-[11px]">
                    🔒 A temporary <strong>£1.00</strong> verification charge will be applied to confirm your card is valid. This will be <strong>refunded immediately</strong>.
                </p>
            </div>
            <p className="text-center text-xs text-gray-500">
                Your card will not be charged during the trial period. After 14 days your subscription will auto-renew.
            </p>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Main Subscription Tab component
   ────────────────────────────────────────────── */
export default function SubscriptionTab({ user }: SubscriptionTabProps) {
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [coins, setCoins] = useState<CoinBalance>({ smart_matching: 0, directory: 0, leads: 0 });
    const [cards, setCards] = useState<PaymentCardInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [renewLoading, setRenewLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [deletingCardId, setDeletingCardId] = useState<number | null>(null);
    const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);

    // Add card state
    const [showAddCard, setShowAddCard] = useState(false);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [stripeLoading, setStripeLoading] = useState(false);
    const [subscriptionPrice, setSubscriptionPrice] = useState<string | null>(null);

    // Topup state
    const [selectedSmartPlan, setSelectedSmartPlan] = useState<{ coins: number; amount: number } | null>(null);
    const [selectedDirectoryPlan, setSelectedDirectoryPlan] = useState<{ coins: number; amount: number } | null>(null);
    const [selectedLeadPlan, setSelectedLeadPlan] = useState<{ coins: number; amount: number } | null>(null);
    const [enableSmart, setEnableSmart] = useState(false);
    const [enableDirectory, setEnableDirectory] = useState(false);
    const [enableLead, setEnableLead] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [topupProcessing, setTopupProcessing] = useState(false);

    const hasInvalidTopupSelection =
        (enableSmart && !selectedSmartPlan)
        || (enableDirectory && !selectedDirectoryPlan)
        || (enableLead && !selectedLeadPlan);

    const computeTotal = () => {
        let total = 0;
        if (enableSmart && selectedSmartPlan) total += selectedSmartPlan.amount;
        if (enableDirectory && selectedDirectoryPlan) total += selectedDirectoryPlan.amount;
        if (enableLead && selectedLeadPlan) total += selectedLeadPlan.amount;
        return total;
    };

    const handleTopup = async () => {
        const total = computeTotal();
        if (total <= 0) {
            toast.error('Please select at least one plan to top up');
            return;
        }
        if (hasInvalidTopupSelection) {
            toast.error('Please select a plan for each enabled coin type.');
            return;
        }
        if (cards.length > 0 && !selectedCardId) {
            toast.error('Please select a card to pay with');
            return;
        }

        setTopupProcessing(true);
        try {
            const payload: any = {
                card_id: selectedCardId,
                idempotency_key: (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
                    ? crypto.randomUUID()
                    : String(Date.now()) + '-' + String(Math.random()),
            };
            if (enableSmart && selectedSmartPlan) payload.smart_plan = 'smart_' + selectedSmartPlan.coins;
            if (enableDirectory && selectedDirectoryPlan) payload.directory_plan = 'directory_' + selectedDirectoryPlan.coins;
            if (enableLead && selectedLeadPlan) payload.lead_plan = 'lead_' + selectedLeadPlan.coins;

            const { data } = await axios.post('/api/subscription/topup', payload);
            if (data.success) {
                toast.success('Top up successful. Your coins have been credited.');
                // Refresh coin balances and cards
                await fetchData();
                // reset selections
                setEnableSmart(false);
                setEnableDirectory(false);
                setEnableLead(false);
                setSelectedSmartPlan(null);
                setSelectedDirectoryPlan(null);
                setSelectedLeadPlan(null);
            } else {
                toast.error(data.message || 'Top up failed');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Top up failed';
            toast.error(msg);
            console.error('Topup error', err);
        } finally {
            setTopupProcessing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const loadStripeKey = async () => {
        if (stripePromise) return;
        setStripeLoading(true);
        try {
            const { data } = await axios.get('/api/stripe/key');
            if (data.public_key) {
                setStripePromise(loadStripe(data.public_key));
            }
        } catch (err) {
            console.error('Failed to load Stripe key:', err);
            toast.error('Failed to load payment form');
        } finally {
            setStripeLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subRes, coinsRes, cardsRes, priceRes] = await Promise.all([
                axios.get('/api/subscription/status'),
                axios.get('/api/subscription/coins'),
                axios.get('/api/payment-cards'),
                axios.get('/api/subscription/price'),
            ]);
            setHasSubscription(subRes.data.hasSubscription);
            setSubscription(subRes.data.subscription);
            setCoins(coinsRes.data.coins);
            const fetchedCards = cardsRes.data.cards || [];
            setCards(fetchedCards);
            // default selected card to primary if any and not already selected
            if (!selectedCardId && fetchedCards.length > 0) {
                const primary = fetchedCards.find((c: any) => c.is_primary);
                setSelectedCardId(primary ? primary.id : fetchedCards[0].id);
            }
            if (priceRes.data.success) {
                setSubscriptionPrice(priceRes.data.price_formatted);
            }

            // If no subscription, preload Stripe for the subscribe form
            if (!subRes.data.hasSubscription) {
                loadStripeKey();
            }
        } catch (err) {
            console.error('Error fetching subscription data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRenew = async () => {
        setRenewLoading(true);
        try {
            await axios.post('/api/subscription/renew');
            toast.success('Subscription renewed successfully');
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to renew subscription');
        } finally {
            setRenewLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.')) return;
        setCancelLoading(true);
        try {
            await axios.post('/api/subscription/cancel');
            toast.success('Subscription will be canceled at the end of the billing period');
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to cancel subscription');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleSetPrimary = async (cardId: number) => {
        setSettingPrimaryId(cardId);
        try {
            await axios.post('/api/payment-cards/' + cardId + '/primary');
            toast.success('Primary card updated');
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to set primary card');
        } finally {
            setSettingPrimaryId(null);
        }
    };

    const handleDeleteCard = async (cardId: number) => {
        if (!confirm('Are you sure you want to remove this card?')) return;
        setDeletingCardId(cardId);
        try {
            await axios.delete('/api/payment-cards/' + cardId);
            toast.success('Card removed successfully');
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete card');
        } finally {
            setDeletingCardId(null);
        }
    };

    const handleShowAddCard = () => {
        loadStripeKey();
        setShowAddCard(true);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            trial: 'bg-blue-100 text-blue-800',
            trialing: 'bg-blue-100 text-blue-800',
            canceled: 'bg-red-100 text-red-800',
            expired: 'bg-gray-100 text-gray-800',
        };
        const label = status === 'trialing' ? 'Trial' : status.charAt(0).toUpperCase() + status.slice(1);
        return (
            <span className={'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' + (styles[status] || styles.expired)}>
                {label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-3 text-sm text-gray-500">Loading subscription details...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 py-6 pb-20">

            {/* ═══════════════════════════════════════════
                NO SUBSCRIPTION — Subscribe Prompt
               ═══════════════════════════════════════════ */}
            {!hasSubscription && (
                <div className="rounded-xl border-2 border-[#024E44] bg-white shadow-lg overflow-hidden">
                    <div className="bg-[#024E44] px-6 py-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Crown className="h-7 w-7 text-[#D6E264]" />
                            <h2 className="text-xl font-bold text-white">Activate Your Subscription</h2>
                        </div>
                        <p className="text-sm text-gray-300 max-w-lg">
                            Start your 14-day free trial today. Your card will not be charged during the trial period. After 14 days your subscription will auto-renew at {subscriptionPrice ?? '...'}/month.
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Benefits */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900">What you will get:</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                        <p className="text-sm text-gray-700">Connect with verified CEOs and business leaders</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                        <p className="text-sm text-gray-700">Smart Matching coins to find ideal partners</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                        <p className="text-sm text-gray-700">Directory access to browse the full network</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                        <p className="text-sm text-gray-700">Leads coins for business opportunities</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stripe card form */}
                            <div>
                                {stripePromise ? (
                                    <SubscribeForm onSuccess={fetchData} stripePromise={stripePromise} />
                                ) : stripeLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                        <span className="ml-2 text-sm text-gray-500">Loading payment form...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                                        <AlertCircle className="h-6 w-6 text-red-400" />
                                        <p className="text-sm text-red-600">Failed to load payment form</p>
                                        <Button variant="outline" size="sm" onClick={loadStripeKey}>Retry</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════
                        SUBSCRIPTION DETAILS TABLE
                       ═══════════════════════════════════════════ */}
            {hasSubscription && subscription && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="rounded-lg bg-indigo-100 p-2">
                                    <Crown className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Subscription Plan</h2>
                                    <p className="text-sm text-gray-600">Your current subscription details</p>
                                </div>
                            </div>
                            {getStatusBadge(subscription.status)}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="whitespace-nowrap py-3 pr-6 font-medium text-gray-500">Status</td>
                                        <td className="py-3">{getStatusBadge(subscription.status)}</td>
                                    </tr>
                                    <tr>
                                        <td className="whitespace-nowrap py-3 pr-6 font-medium text-gray-500">Monthly Price</td>
                                        <td className="py-3 text-lg font-bold text-gray-900">{subscription.price_formatted}</td>
                                    </tr>
                                    <tr>
                                        <td className="whitespace-nowrap py-3 pr-6 font-medium text-gray-500">
                                            {subscription.is_trial ? 'Trial Ends' : 'Next Billing Date'}
                                        </td>
                                        <td className="py-3 text-gray-900">
                                            {formatDate(subscription.is_trial ? subscription.trial_ends_at : subscription.ends_at)}
                                        </td>
                                    </tr>
                                    {subscription.days_remaining !== null && (
                                        <tr>
                                            <td className="whitespace-nowrap py-3 pr-6 font-medium text-gray-500">Days Remaining</td>
                                            <td className="py-3">
                                                <span className={'font-semibold ' + (subscription.days_remaining <= 5 ? 'text-red-600' : 'text-gray-900')}>
                                                    {subscription.days_remaining} days
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="whitespace-nowrap py-3 pr-6 font-medium text-gray-500">Auto-Renew</td>
                                        <td className="py-3">
                                            <span className={'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' + (subscription.auto_renew ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {(subscription.status === 'expired' || subscription.status === 'canceled') && (
                                <div className="mt-6 border-t border-gray-100 pt-4">
                                    <Button
                                        onClick={handleRenew}
                                        disabled={renewLoading}
                                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        {renewLoading ? (
                                            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Renewing...</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Renew Subscription</span>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {(subscription.status === 'active' || subscription.status === 'trial' || subscription.status === 'trialing') && (
                                <div className="mt-6 border-t border-gray-100 pt-4">
                                    <Button
                                        onClick={handleCancelSubscription}
                                        disabled={cancelLoading}
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        {cancelLoading ? (
                                            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Canceling...</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><XCircle className="h-4 w-4" /> Cancel Subscription</span>
                                        )}
                                    </Button>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Your subscription will remain active until the end of the current billing period.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════
                        COIN BALANCE TABLE
                       ═══════════════════════════════════════════ */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-yellow-100 p-2">
                            <Coins className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Coin Balance</h2>
                            <p className="text-sm text-gray-600">Your available coins for platform features</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-3 pr-6 font-semibold text-gray-700">Feature</th>
                                    <th className="pb-3 pr-6 font-semibold text-gray-700">Available</th>
                                    <th className="pb-3 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-3.5 pr-6">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-purple-500" />
                                            <span className="font-medium text-gray-900">Smart Matching</span>
                                        </div>
                                    </td>
                                    <td className="py-3.5 pr-6">
                                        <span className="text-lg font-bold text-gray-900">{coins.smart_matching ?? 0}</span>
                                    </td>
                                    <td className="py-3.5">
                                        {(coins.smart_matching ?? 0) > 0 ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Available</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Depleted</span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 pr-6">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium text-gray-900">Directory</span>
                                        </div>
                                    </td>
                                    <td className="py-3.5 pr-6">
                                        <span className="text-lg font-bold text-gray-900">{coins.directory ?? 0}</span>
                                    </td>
                                    <td className="py-3.5">
                                        {(coins.directory ?? 0) > 0 ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Available</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Depleted</span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 pr-6">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-green-500" />
                                            <span className="font-medium text-gray-900">Leads</span>
                                        </div>
                                    </td>
                                    <td className="py-3.5 pr-6">
                                        <span className="text-lg font-bold text-gray-900">
                                            {coins.leads === null ? '\u221E' : coins.leads ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3.5">
                                        {coins.leads === null ? (
                                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">Unlimited</span>
                                        ) : (coins.leads ?? 0) > 0 ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Available</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Depleted</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">
                        Coins are allocated at the start of each subscription period and reset upon renewal.
                    </p>

                    {/* ═══════════════════════════════════════════
                                COIN TOPUP SECTION
                       ═══════════════════════════════════════════ */}
                    <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Top up Coins</h3>

                        <div className="grid gap-4 lg:grid-cols-3">
                            {/* Smart Matching Plans */}
                            <div className="rounded-md border p-3">
                                <h4 className="text-sm font-medium text-gray-800">Smart Match</h4>
                                <p className="text-xs text-gray-500 mb-2">Select a plan to top up Smart Matching coins</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="smart_plan" value="5|400" onChange={() => setSelectedSmartPlan({ coins: 5, amount: 4 })} checked={selectedSmartPlan?.coins === 5} />
                                        <span className="text-sm">5 coins — £4 (&pound;0.80/coin)</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="smart_plan" value="10|700" onChange={() => setSelectedSmartPlan({ coins: 10, amount: 7 })} checked={selectedSmartPlan?.coins === 10} />
                                        <span className="text-sm">10 coins — £7 (&pound;0.70/coin)</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="smart_plan" value="15|900" onChange={() => setSelectedSmartPlan({ coins: 15, amount: 9 })} checked={selectedSmartPlan?.coins === 15} />
                                        <span className="text-sm">15 coins — £9 (&pound;0.60/coin)</span>
                                    </label>
                                    <div className="mt-2">
                                        <label className="inline-flex items-center text-xs text-gray-600">
                                            <input type="checkbox" checked={enableSmart} onChange={(e) => setEnableSmart(e.target.checked)} className="mr-2" /> Enable
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Directory Plans */}
                            <div className="rounded-md border p-3">
                                <h4 className="text-sm font-medium text-gray-800">Directory</h4>
                                <p className="text-xs text-gray-500 mb-2">Select a plan to top up Directory coins</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="directory_plan" value="15|900" onChange={() => setSelectedDirectoryPlan({ coins: 15, amount: 9 })} checked={selectedDirectoryPlan?.coins === 15} />
                                        <span className="text-sm">15 coins — £9 (&pound;0.60/coin)</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="directory_plan" value="30|1500" onChange={() => setSelectedDirectoryPlan({ coins: 30, amount: 15 })} checked={selectedDirectoryPlan?.coins === 30} />
                                        <span className="text-sm">30 coins — £15 (&pound;0.50/coin)</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="directory_plan" value="45|2000" onChange={() => setSelectedDirectoryPlan({ coins: 45, amount: 20 })} checked={selectedDirectoryPlan?.coins === 45} />
                                        <span className="text-sm">45 coins — £20 (&pound;0.44/coin)</span>
                                    </label>
                                    <div className="mt-2">
                                        <label className="inline-flex items-center text-xs text-gray-600">
                                            <input type="checkbox" checked={enableDirectory} onChange={(e) => setEnableDirectory(e.target.checked)} className="mr-2" /> Enable
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Leads Plans */}
                            <div className="rounded-md border p-3">
                                <h4 className="text-sm font-medium text-gray-800">Leads</h4>
                                <p className="text-xs text-gray-500 mb-2">Select a plan to top up Leads coins</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="lead_plan" value="15|1000" onChange={() => setSelectedLeadPlan({ coins: 15, amount: 10 })} checked={selectedLeadPlan?.coins === 15} />
                                        <span className="text-sm">15 coins — £10 (&pound;0.67/coin)</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="lead_plan" value="30|1800" onChange={() => setSelectedLeadPlan({ coins: 30, amount: 18 })} checked={selectedLeadPlan?.coins === 30} />
                                        <span className="text-sm">30 coins — £18 (&pound;0.60/coin)</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="radio" name="lead_plan" value="45|2400" onChange={() => setSelectedLeadPlan({ coins: 45, amount: 24 })} checked={selectedLeadPlan?.coins === 45} />
                                        <span className="text-sm">45 coins — £24 (&pound;0.53/coin)</span>
                                    </label>
                                    <div className="mt-2">
                                        <label className="inline-flex items-center text-xs text-gray-600">
                                            <input type="checkbox" checked={enableLead} onChange={(e) => setEnableLead(e.target.checked)} className="mr-2" /> Enable
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total and card selection */}
                        <div className="mt-4 border-t pt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">Total:</p>
                                <p className="text-2xl font-bold text-gray-900">£{computeTotal().toFixed(2)}</p>
                                {hasInvalidTopupSelection && (
                                    <p className="mt-1 text-xs text-red-600">Select a plan for every enabled coin type before paying.</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div>
                                    <label className="block text-xs text-gray-600">Pay with</label>
                                    <select value={selectedCardId ?? ''} onChange={(e) => setSelectedCardId(Number(e.target.value) || null)} className="rounded-md border px-3 py-2 text-sm">
                                        {cards.length === 0 && <option value="">No cards - add a card</option>}
                                        {cards.map((c) => (
                                            <option key={c.id} value={c.id}>{c.display_brand} **** {c.last_four}{c.is_primary ? ' (Primary)' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <Button onClick={handleTopup} disabled={topupProcessing || hasInvalidTopupSelection || computeTotal() <= 0 || (cards.length > 0 && !selectedCardId)} className="bg-indigo-600 text-white">
                                    {topupProcessing ? (<span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>) : 'Top up & Pay'}
                                </Button>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            Top-up pricing and coin credits are validated server-side to protect against duplicate or partial processing.
                        </p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                        PAYMENT CARDS TABLE
                       ═══════════════════════════════════════════ */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-lg bg-emerald-100 p-2">
                                <CreditCard className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                                <p className="text-sm text-gray-600">Manage your payment cards on file</p>
                            </div>
                        </div>
                        {!showAddCard && (
                            <Button variant="outline" size="sm" onClick={handleShowAddCard} className="flex items-center gap-1.5">
                                <Plus className="h-4 w-4" /> Add Card
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Add Card Form */}
                    {showAddCard && stripePromise && (
                        <Elements stripe={stripePromise}>
                            <AddCardForm
                                onSuccess={() => { setShowAddCard(false); fetchData(); }}
                                onCancel={() => setShowAddCard(false)}
                            />
                        </Elements>
                    )}
                    {showAddCard && !stripePromise && (
                        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-8">
                            {stripeLoading ? (
                                <><Loader2 className="h-5 w-5 animate-spin text-gray-400" /><span className="ml-2 text-sm text-gray-500">Loading payment form...</span></>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <p className="text-sm text-red-600">Failed to load payment form</p>
                                    <Button variant="outline" size="sm" onClick={loadStripeKey}>Retry</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Card List */}
                    {cards.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="pb-3 pr-6 font-semibold text-gray-700">Card</th>
                                        <th className="pb-3 pr-6 font-semibold text-gray-700">Expires</th>
                                        <th className="pb-3 pr-6 font-semibold text-gray-700">Status</th>
                                        <th className="pb-3 text-right font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cards.map((card) => (
                                        <tr key={card.id}>
                                            <td className="py-3.5 pr-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100">
                                                        <CreditCard className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {card.display_brand} **** {card.last_four}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 pr-6 text-gray-600">
                                                {String(card.exp_month).padStart(2, '0')}/{card.exp_year}
                                            </td>
                                            <td className="py-3.5 pr-6">
                                                {card.is_primary ? (
                                                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">Primary</span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Secondary</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!card.is_primary && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSetPrimary(card.id)}
                                                            disabled={settingPrimaryId === card.id}
                                                            className="text-xs"
                                                        >
                                                            {settingPrimaryId === card.id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                'Set Primary'
                                                            )}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteCard(card.id)}
                                                        disabled={deletingCardId === card.id}
                                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        {deletingCardId === card.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : !showAddCard ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <CreditCard className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">No payment methods</h3>
                            <p className="mt-1 text-xs text-gray-500">You have not added any payment cards yet.</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={handleShowAddCard}>
                                <Plus className="mr-1 h-3.5 w-3.5" /> Add Your First Card
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
