'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import axios from 'axios';
import { AlertTriangle, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface SubscriptionRenewalModalProps {
    open: boolean;
    onClose: () => void;
    onRenewed: () => void;
}

export function SubscriptionRenewalModal({ open, onClose, onRenewed }: SubscriptionRenewalModalProps) {
    const [renewLoading, setRenewLoading] = useState(false);
    const [priceFormatted, setPriceFormatted] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            axios.get('/api/subscription/price').then(({ data }) => {
                if (data.success) {
                    setPriceFormatted(data.price_formatted);
                }
            }).catch(() => { });
        }
    }, [open]);

    const handleRenew = async () => {
        setRenewLoading(true);
        try {
            await axios.post('/api/subscription/renew');
            toast.success('Subscription renewed successfully!');
            onRenewed();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to renew subscription';
            if (errorMsg.includes('No payment method')) {
                toast.error('No payment card on file. Please add a card in your profile settings first.');
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setRenewLoading(false);
        }
    };

    const handleGoToProfile = () => {
        onClose();
        window.location.href = '/profile?tab=subscription';
    };

    return (
        <Dialog open={open} onOpenChange={() => { /* prevent closing — user must renew */ }}>
            <DialogContent
                className="max-w-md rounded-2xl border-0 p-0 shadow-2xl overflow-hidden [&>button.absolute.right-4.top-4]:hidden"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogHeader className="p-0 border-0">
                                <DialogTitle className="text-xl font-bold text-white">Subscription Expired</DialogTitle>
                                <DialogDescription className="text-sm text-white/80">
                                    Your subscription has ended and auto-renewal failed.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-gray-700">
                        Your subscription has expired. To continue enjoying full access to NOEL features including Smart Matching, Directory, and Leads, please renew your subscription.
                    </p>

                    {priceFormatted && (
                        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Monthly Subscription</span>
                                <span className="text-lg font-bold text-gray-900">{priceFormatted}/month</span>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                        <p className="text-xs text-amber-800">
                            <strong>Note:</strong> Your coin balance will be refreshed upon renewal. Make sure you have a valid payment card on file.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 pb-6 pt-0 flex-col gap-2 sm:flex-col">
                    <Button
                        onClick={handleRenew}
                        disabled={renewLoading}
                        className="w-full bg-[#024E44] text-white hover:bg-[#024E44]/90 py-5"
                    >
                        {renewLoading ? (
                            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Renewing...</span>
                        ) : (
                            <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Renew Subscription</span>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleGoToProfile}
                        className="w-full"
                    >
                        <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Manage Payment Cards</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
