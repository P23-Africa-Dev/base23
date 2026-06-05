/**
 * Network Status Banner Component
 * Displays offline/reconnecting status to users during registration
 */

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { checkOnlineStatus, verifyServerConnection } from '@/services/networkValidation';

interface NetworkStatusBannerProps {
    onStatusChange?: (online: boolean) => void;
}

export default function NetworkStatusBanner({ onStatusChange }: NetworkStatusBannerProps) {
    const [isOnline, setIsOnline] = useState(true);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleOnline = async () => {
            setIsReconnecting(true);

            // Verify actual server connection
            const serverReachable = await verifyServerConnection();

            if (serverReachable) {
                setIsOnline(true);
                setIsReconnecting(false);
                onStatusChange?.(true);

                // Hide banner after a short delay
                setTimeout(() => setShowBanner(false), 2000);
            } else {
                setIsReconnecting(false);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
            onStatusChange?.(false);
        };

        // Initial check
        setIsOnline(checkOnlineStatus());

        // Listen for network changes
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [onStatusChange]);

    const handleRetry = async () => {
        setIsReconnecting(true);
        const serverReachable = await verifyServerConnection();
        setIsReconnecting(false);

        if (serverReachable) {
            setIsOnline(true);
            onStatusChange?.(true);
            setTimeout(() => setShowBanner(false), 2000);
        }
    };

    if (!showBanner && isOnline) {
        return null;
    }

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300 ${isOnline
                    ? 'bg-green-500 text-white'
                    : isReconnecting
                        ? 'bg-yellow-500 text-black'
                        : 'bg-red-500 text-white'
                }`}
        >
            <div className="flex items-center justify-center gap-3">
                {isOnline ? (
                    <>
                        <Wifi className="h-5 w-5" />
                        <span className="font-medium">Connection restored!</span>
                    </>
                ) : isReconnecting ? (
                    <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="font-medium">Reconnecting...</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="h-5 w-5" />
                        <span className="font-medium">You're offline. Please check your internet connection.</span>
                        <button
                            onClick={handleRetry}
                            className="ml-3 rounded-lg bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30 transition-colors"
                        >
                            Retry
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Validation Error Display Component
 */
interface ValidationErrorProps {
    error: {
        type: string;
        message: string;
        retryable: boolean;
    };
    onRetry?: () => void;
}

export function ValidationError({ error, onRetry }: ValidationErrorProps) {
    const isNetworkError = ['network', 'timeout', 'offline'].includes(error.type);

    return (
        <div className={`rounded-xl p-4 mb-4 ${isNetworkError ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
            }`}>
            <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${isNetworkError ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                <div className="flex-1">
                    <p className={`font-medium ${isNetworkError ? 'text-yellow-800' : 'text-red-800'
                        }`}>
                        {isNetworkError ? 'Connection Issue' : 'Validation Error'}
                    </p>
                    <p className={`text-sm mt-1 ${isNetworkError ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                        {error.message}
                    </p>
                    {error.retryable && onRetry && (
                        <button
                            onClick={onRetry}
                            className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isNetworkError
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Loading Overlay Component for form submissions
 */
interface LoadingOverlayProps {
    message?: string;
    subMessage?: string;
}

export function LoadingOverlay({ message = 'Processing...', subMessage }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
                <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-pinkLight border-t-transparent animate-spin"></div>
                </div>
                <p className="text-lg font-semibold text-gray-800">{message}</p>
                {subMessage && (
                    <p className="text-sm text-gray-500 mt-2">{subMessage}</p>
                )}
            </div>
        </div>
    );
}
