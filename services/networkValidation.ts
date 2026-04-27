/**
 * Network Validation Service
 * Ensures reliable network communication during registration with retry logic,
 * timeout handling, and offline detection.
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Configuration
const CONFIG = {
    maxRetries: 3,
    retryDelay: 1000, // ms
    requestTimeout: 15000, // 15 seconds
    connectionCheckUrl: '/api/health', // Endpoint to check server connectivity
};

// Types
export interface NetworkValidationResult<T = any> {
    success: boolean;
    data?: T;
    error?: {
        type: 'network' | 'timeout' | 'offline' | 'server' | 'validation' | 'unknown';
        message: string;
        details?: any;
        retryable: boolean;
    };
}

export interface StepValidationResponse {
    success: boolean;
    message?: string;
    error?: string;
    error_type?: string;
    errors?: Record<string, string[]>;
    redirect?: {
        type: string;
        message: string;
        buttonText: string;
        buttonLink: string;
    };
}

// Network Status
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 5000; // 5 seconds

// Initialize network status listeners
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        isOnline = true;
        console.log('[NetworkValidation] Online');
    });
    window.addEventListener('offline', () => {
        isOnline = false;
        console.log('[NetworkValidation] Offline');
    });
}

/**
 * Check if the browser is online
 */
export function checkOnlineStatus(): boolean {
    return isOnline && (typeof navigator === 'undefined' || navigator.onLine);
}

/**
 * Verify actual server connectivity (not just browser online status)
 */
export async function verifyServerConnection(): Promise<boolean> {
    const now = Date.now();
    
    // Don't check too frequently
    if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
        return isOnline;
    }
    
    try {
        // Use a lightweight endpoint or HEAD request
        await axios.head('/', { 
            timeout: 5000,
            validateStatus: () => true // Accept any status
        });
        lastConnectionCheck = now;
        isOnline = true;
        return true;
    } catch {
        isOnline = false;
        return false;
    }
}

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make a network request with retry logic and comprehensive error handling
 */
export async function makeRequestWithRetry<T>(
    requestFn: () => Promise<T>,
    options: {
        maxRetries?: number;
        retryDelay?: number;
        onRetry?: (attempt: number, error: any) => void;
    } = {}
): Promise<NetworkValidationResult<T>> {
    const maxRetries = options.maxRetries ?? CONFIG.maxRetries;
    const retryDelay = options.retryDelay ?? CONFIG.retryDelay;
    
    // Check if online first
    if (!checkOnlineStatus()) {
        return {
            success: false,
            error: {
                type: 'offline',
                message: 'You appear to be offline. Please check your internet connection.',
                retryable: true,
            },
        };
    }
    
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await requestFn();
            return {
                success: true,
                data: result,
            };
        } catch (error: any) {
            lastError = error;
            
            // Determine if error is retryable
            const isRetryable = isRetryableError(error);
            
            if (!isRetryable || attempt === maxRetries) {
                break;
            }
            
            // Call retry callback
            if (options.onRetry) {
                options.onRetry(attempt, error);
            }
            
            // Exponential backoff
            const delay = retryDelay * Math.pow(2, attempt - 1);
            console.log(`[NetworkValidation] Retry ${attempt}/${maxRetries} after ${delay}ms`);
            await sleep(delay);
        }
    }
    
    return parseError(lastError);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // Network errors are retryable
        if (!axiosError.response) {
            return true;
        }
        
        // Server errors (5xx) are retryable
        const status = axiosError.response.status;
        if (status >= 500 && status < 600) {
            return true;
        }
        
        // Request timeout
        if (axiosError.code === 'ECONNABORTED') {
            return true;
        }
    }
    
    return false;
}

/**
 * Parse error into standardized format
 */
function parseError(error: any): NetworkValidationResult {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        // No response - network error
        if (!axiosError.response) {
            if (axiosError.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: {
                        type: 'timeout',
                        message: 'Request timed out. Please check your connection and try again.',
                        retryable: true,
                    },
                };
            }
            
            return {
                success: false,
                error: {
                    type: 'network',
                    message: 'Unable to connect to the server. Please check your internet connection.',
                    retryable: true,
                },
            };
        }
        
        const { status, data } = axiosError.response;
        
        // Validation errors (422)
        if (status === 422) {
            return {
                success: false,
                error: {
                    type: 'validation',
                    message: data?.error || 'Please check your input and try again.',
                    details: data,
                    retryable: false,
                },
            };
        }
        
        // Conflict (409) - e.g., email exists
        if (status === 409) {
            return {
                success: false,
                error: {
                    type: 'validation',
                    message: data?.error || 'A conflict occurred.',
                    details: data,
                    retryable: false,
                },
            };
        }
        
        // CSRF/Session errors (419)
        if (status === 419) {
            return {
                success: false,
                error: {
                    type: 'server',
                    message: 'Your session has expired. Please refresh the page.',
                    retryable: false,
                },
            };
        }
        
        // Server errors (5xx)
        if (status >= 500) {
            return {
                success: false,
                error: {
                    type: 'server',
                    message: 'Server error. Please try again in a moment.',
                    retryable: true,
                },
            };
        }
        
        // Other client errors
        return {
            success: false,
            error: {
                type: 'server',
                message: data?.error || data?.message || 'An error occurred.',
                details: data,
                retryable: false,
            },
        };
    }
    
    // Unknown error
    return {
        success: false,
        error: {
            type: 'unknown',
            message: error?.message || 'An unexpected error occurred.',
            retryable: false,
        },
    };
}

/**
 * Validate registration step with full network handling
 */
export async function validateRegistrationStep(
    step: number,
    data: Record<string, any>,
    options: {
        onRetry?: (attempt: number) => void;
        timeout?: number;
    } = {}
): Promise<NetworkValidationResult<StepValidationResponse>> {
    console.log(`[NetworkValidation] Validating step ${step}`, { fields: Object.keys(data) });
    
    return makeRequestWithRetry(
        async () => {
            const response = await axios.post<StepValidationResponse>(
                '/registration/validate-step',
                { step, ...data },
                {
                    timeout: options.timeout ?? CONFIG.requestTimeout,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            console.log(`[NetworkValidation] Step ${step} validation response:`, response.data);
            return response.data;
        },
        {
            onRetry: (attempt, error) => {
                console.log(`[NetworkValidation] Step ${step} retry ${attempt}`, error?.message);
                options.onRetry?.(attempt);
            },
        }
    );
}

/**
 * Submit final registration with network handling
 */
export async function submitRegistration(
    formData: FormData,
    options: {
        onProgress?: (progress: number) => void;
        onRetry?: (attempt: number) => void;
        timeout?: number;
    } = {}
): Promise<NetworkValidationResult<any>> {
    console.log('[NetworkValidation] Submitting registration');
    
    return makeRequestWithRetry(
        async () => {
            const response = await axios.post('/register', formData, {
                timeout: options.timeout ?? 60000, // 60 seconds for file upload
                headers: {
                    'Accept': 'application/json',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        options.onProgress?.(progress);
                    }
                },
            });
            return response.data;
        },
        {
            maxRetries: 2, // Fewer retries for large uploads
            onRetry: options.onRetry,
        }
    );
}

/**
 * Log registration event (for debugging)
 */
export async function logRegistrationEvent(
    event: string,
    data: Record<string, any>
): Promise<void> {
    try {
        await axios.post('/api/registration/log', {
            event,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            online: navigator.onLine,
            ...data,
        }, {
            timeout: 5000,
        });
    } catch (error) {
        // Silently fail - logging shouldn't block registration
        console.warn('[NetworkValidation] Failed to log event:', event, error);
    }
}

export default {
    checkOnlineStatus,
    verifyServerConnection,
    validateRegistrationStep,
    submitRegistration,
    logRegistrationEvent,
    makeRequestWithRetry,
};
