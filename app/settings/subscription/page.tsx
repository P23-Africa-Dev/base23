'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import axios from 'axios';
import { CreditCard, Trash2, Zap, BookOpen, Target, Star } from 'lucide-react';

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

export default function Subscription() {
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [coins, setCoins] = useState<CoinBalance>({ smart_matching: 0, directory: 0, leads: 0 });
    const [cards, setCards] = useState<PaymentCardInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subRes, coinsRes, cardsRes] = await Promise.all([
                axios.get('/api/subscription/status'),
                axios.get('/api/subscription/coins'),
                axios.get('/api/payment-cards'),
            ]);
            setHasSubscription(subRes.data.hasSubscription);
            setSubscription(subRes.data.subscription);
            setCoins(coinsRes.data.coins);
            setCards(cardsRes.data.cards || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPrimary = async (cardId: number) => {
        try {
            await axios.post(`/api/payment-cards/${cardId}/primary`);
            await fetchData();
        } catch (err) {
            console.error('Error setting primary card:', err);
        }
    };

    const handleDeleteCard = async (cardId: number) => {
        if (!confirm('Are you sure you want to remove this card?')) return;
        try {
            await axios.delete(`/api/payment-cards/${cardId}`);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete card');
        }
    };

    const handleRenew = async () => {
        try {
            await axios.post('/api/subscription/renew');
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to renew subscription');
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="relative z-0">
                    
                    <SettingsLayout>
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    </SettingsLayout>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="relative z-0">
                
                <SettingsLayout>
                    <div className="space-y-8">
                        {/* Subscription Status */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Subscription</h3>
                            <p className="text-sm text-muted-foreground">Manage your subscription plan</p>

                            <div className="rounded-lg border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        <span className="font-semibold text-lg">Your Plan</span>
                                    </div>
                                    {subscription && (
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            subscription.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : subscription.status === 'trial'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                            {subscription.status === 'trial' ? 'Trial' : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                        </span>
                                    )}
                                </div>

                                {hasSubscription && subscription ? (
                                    <div className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Monthly Price</p>
                                                <p className="text-2xl font-bold">{subscription.price_formatted}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    {subscription.is_trial ? 'Trial Ends' : 'Next Billing Date'}
                                                </p>
                                                <p className="font-medium">{formatDate(subscription.is_trial ? subscription.trial_ends_at : subscription.ends_at)}</p>
                                                {subscription.days_remaining !== null && (
                                                    <p className="text-xs text-muted-foreground">{subscription.days_remaining} days remaining</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Auto-renew:</span>
                                            <span className={subscription.auto_renew ? 'text-green-600' : 'text-red-600'}>
                                                {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        {subscription.status === 'expired' && (
                                            <button onClick={handleRenew} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                                                Renew Subscription
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-center py-4 text-muted-foreground">No active subscription</p>
                                )}
                            </div>
                        </div>

                        {/* Coin Balance */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Coin Balance</h3>
                            <p className="text-sm text-muted-foreground">Your available coins for platform features</p>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-medium">Smart Matching</span>
                                    </div>
                                    <p className="text-3xl font-bold">{coins.smart_matching ?? 0}</p>
                                    <p className="text-xs text-muted-foreground">coins available</p>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium">Directory</span>
                                    </div>
                                    <p className="text-3xl font-bold">{coins.directory ?? 0}</p>
                                    <p className="text-xs text-muted-foreground">coins available</p>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium">Leads</span>
                                    </div>
                                    <p className="text-3xl font-bold">{coins.leads === null ? '\u221E' : coins.leads ?? 0}</p>
                                    <p className="text-xs text-muted-foreground">{coins.leads === null ? 'unlimited' : 'coins available'}</p>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Coins are allocated at the start of each subscription period and reset upon renewal.
                            </p>
                        </div>

                        {/* Payment Cards */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Payment Methods</h3>
                            <p className="text-sm text-muted-foreground">Manage your payment cards</p>

                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                    <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
                                </div>
                            )}

                            <div className="space-y-3">
                                {cards.length > 0 ? cards.map((card) => (
                                    <div key={card.id} className={`flex items-center justify-between rounded-lg border p-4 ${card.is_primary ? 'border-primary' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {card.display_brand} &bull;&bull;&bull;&bull; {card.last_four}
                                                    {card.is_primary && (
                                                        <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Primary</span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Expires {String(card.exp_month).padStart(2, '0')}/{card.exp_year}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!card.is_primary && (
                                                <button onClick={() => handleSetPrimary(card.id)} className="rounded-md border px-3 py-1 text-xs hover:bg-muted">
                                                    Set Primary
                                                </button>
                                            )}
                                            <button onClick={() => handleDeleteCard(card.id)} className="rounded-md p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border py-8">
                                        <CreditCard className="mb-2 h-8 w-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">No payment methods added</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </SettingsLayout>
            </div>
        </AppLayout>
    );
}
