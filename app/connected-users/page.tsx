'use client';

import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    profile_picture?: string | null;
    direction?: 'incoming' | 'outgoing'; // 'incoming' if request is to me, 'outgoing' if I sent
}

interface PageProps {
    connected: User[];
    pending: User[];
    [key: string]: unknown;
}

const ConnectedUsersPage: React.FC = () => {
    const { user } = useAuth();
    const myId = user?.id;
    const [connected, setConnected] = useState<User[]>([]);
    const [pending, setPending] = useState<User[]>([]);
    const [loadingId, setLoadingId] = React.useState<number | null>(null);

    useEffect(() => {
        axios.get('/api/connections').then((res) => {
            setConnected(res.data.connected || []);
            setPending(res.data.pending || []);
        }).catch(() => {});
    }, []);

    // Debug: log pending array to inspect structure
    React.useEffect(() => {
         
        console.log('Pending connections:', pending);
    }, [pending]);

    const handleAction = (userId: number, action: 'accept' | 'reject' | 'revoke') => {
        setLoadingId(userId);
        let url = '';
        if (action === 'accept') url = '/connections/accept';
        else if (action === 'reject') url = '/connections/reject';
        else url = '/connections/reject'; // revoke uses same endpoint as reject
        axios.post(url, { user_id: userId })
            .then(() => window.location.reload())
            .finally(() => setLoadingId(null));
    };

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h2 className="mb-4 text-2xl font-bold">Connected Users</h2>
            <div className="mb-8">
                {connected.length === 0 ? (
                    <p>No connections yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {connected.map((user) => (
                            <li key={user.id} className="flex items-center gap-3 rounded border p-2">
                                {user.profile_picture && <img src={user.profile_picture} alt={user.name} className="h-10 w-10 rounded-full" />}
                                <span>{user.name}</span>
                                <span className="text-xs text-gray-500">{user.email}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <h2 className="mb-4 text-2xl font-bold">Pending Requests</h2>
            <div>
                {pending.length === 0 ? (
                    <p>No pending requests.</p>
                ) : (
                    <ul className="space-y-2">
                        {pending.map((user) => {
                            // Fallback: if direction is missing, treat as incoming if user.id is not myId
                            const isIncoming = user.direction ? user.direction === 'incoming' : typeof myId === 'number' && user.id !== myId;
                            return (
                                <li key={user.id} className="flex items-center gap-3 rounded border p-2">
                                    {user.profile_picture && <img src={user.profile_picture} alt={user.name} className="h-10 w-10 rounded-full" />}
                                    <span>{user.name}</span>
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                    {isIncoming ? (
                                        <>
                                            <button
                                                className="mr-2 ml-auto rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600 disabled:opacity-50"
                                                onClick={() => handleAction(user.id, 'accept')}
                                                disabled={loadingId === user.id}
                                            >
                                                {loadingId === user.id ? 'Processing...' : 'Accept'}
                                            </button>
                                            <button
                                                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 disabled:opacity-50"
                                                onClick={() => handleAction(user.id, 'reject')}
                                                disabled={loadingId === user.id}
                                            >
                                                {loadingId === user.id ? 'Processing...' : 'Decline'}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="ml-auto rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600 disabled:opacity-50"
                                            onClick={() => handleAction(user.id, 'revoke')}
                                            disabled={loadingId === user.id}
                                        >
                                            {loadingId === user.id ? 'Processing...' : 'Revoke Connection'}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ConnectedUsersPage;
