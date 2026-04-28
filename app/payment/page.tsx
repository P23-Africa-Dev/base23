'use client';

import axios from 'axios';
import React, { useState } from 'react';

export default function PaymentPage() {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            const res = await axios.post('/payment/initialize', { amount });
            if (res.data.redirect) window.location.href = res.data.redirect;
        } catch (err: any) {
            setError(err.response?.data?.errors?.amount || 'Payment failed.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="mx-auto max-w-md p-6">
            <h2 className="mb-4 text-xl font-bold">Make a Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded border p-2"
                    />
                    {error && <p className="text-red-500">{error}</p>}
                </div>
                <button type="submit" disabled={processing} className="rounded bg-blue-600 px-4 py-2 text-white">
                    {processing ? 'Processing...' : 'Pay Now'}
                </button>
            </form>
        </div>
    );
}
