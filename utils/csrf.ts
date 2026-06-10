import axios from 'axios';

// Track CSRF readiness state
let csrfReady = false;
let csrfReadyPromise: Promise<boolean> | null = null;
let csrfReadyResolvers: Array<() => void> = [];

/**
 * Get the current CSRF token from the meta tag
 */
export const getCSRFToken = (): string | null => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : null;
};

/**
 * Refresh the CSRF token by hitting the sanctum endpoint
 */
export const refreshCSRFToken = async (): Promise<boolean> => {
    try {
        await axios.get('/sanctum/csrf-cookie');
        const newToken = getCSRFToken();
        if (newToken) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
        return false;
    }
};

/**
 * Mark CSRF as ready (called after page load or successful auth)
 */
export const markCSRFReady = (): void => {
    csrfReady = true;
    // Resolve all waiting promises
    csrfReadyResolvers.forEach((resolve) => resolve());
    csrfReadyResolvers = [];
};

/**
 * Wait for CSRF to be ready before proceeding
 * This helps prevent 419 errors right after login
 */
export const waitForCSRF = (timeout = 1000): Promise<boolean> => {
    if (csrfReady) {
        return Promise.resolve(true);
    }

    if (csrfReadyPromise) {
        return csrfReadyPromise;
    }

    csrfReadyPromise = new Promise((resolve) => {
        // Add to resolvers list
        csrfReadyResolvers.push(() => resolve(true));

        // Timeout fallback - don't wait forever
        setTimeout(() => {
            if (!csrfReady) {
                csrfReady = true; // Assume ready after timeout
                resolve(true);
            }
        }, timeout);
    });

    return csrfReadyPromise;
};

/**
 * Initialize CSRF handling - call this early in app lifecycle
 */
export const initializeCSRF = (): void => {
    const token = getCSRFToken();
    if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }

    // Mark CSRF ready after a short delay to allow session to settle
    // This is especially important after login redirect
    setTimeout(() => {
        markCSRFReady();
    }, 300);
};

/**
 * Check if we're in a post-login state (recently navigated from login)
 */
export const isPostLoginState = (): boolean => {
    const referrer = document.referrer;
    const isFromLogin = referrer.includes('/login') || referrer.includes('/register');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageLoadTime = (window as any).__pageLoadTime || Date.now();
    const timeSinceLoad = Date.now() - pageLoadTime;

    // Consider post-login if from login page and within 5 seconds
    return isFromLogin && timeSinceLoad < 5000;
};

/**
 * Get recommended delay for API calls based on navigation context
 */
export const getAPICallDelay = (): number => {
    if (isPostLoginState()) {
        return 800; // Longer delay after login
    }
    return 100; // Short delay for normal navigation
};
