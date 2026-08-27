'use client';

import axios from 'axios';

const getCookie = (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

const isBypassActive = (): boolean => {
    const isAllowed =
        process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
        process.env.NODE_ENV === "development";

    if (!isAllowed) return false;

    if (typeof window !== "undefined") {
        const override = getCookie("base23_bypass_auth_override");
        if (override === "enforced") return false;
    }
    return true;
};

const apiClient = axios.create({
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    }
});

// Fetch CSRF cookie before mutating requests (Laravel Sanctum)
let csrfFetched = false;
apiClient.interceptors.request.use(async (config) => {
    const mutating = ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase());
    if (mutating && !csrfFetched && typeof window !== 'undefined') {
        try {
            // Use standard axios to avoid interceptors or custom headers on the csrf call
            await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
            csrfFetched = true;
        } catch (err) {
            console.error('Failed to fetch CSRF cookie:', err);
        }
    }
    return config;
});

// Handle global response interceptors
apiClient.interceptors.response.use(
    (response) => {
        // Clear the auth cookie on successful logout
        if (typeof window !== 'undefined' && (
            response.config.url === '/logout' ||
            response.config.url === '/api/auth/logout'
        )) {
            document.cookie = 'base23_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        return response;
    },
    (error) => {
        if (typeof window !== 'undefined' && error.response) {
            const status = error.response.status;
            if (status === 401 || status === 419) {
                if (isBypassActive()) {
                    console.warn(`Auth bypass active: Ignored 401/419 error for endpoint ${error.config?.url}`);
                } else {
                    // Clear Edge authentication helper cookie on authorization failure
                    document.cookie = 'base23_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    
                    const path = window.location.pathname;
                    const isAuthPage =
                        path === '/login' ||
                        path.startsWith('/login/') ||
                        ['/register', '/forgot-password', '/reset-password', '/verify-email', '/confirm-password'].some(
                            (p) => path === p || path.startsWith(p + '/')
                        );
                    if (!isAuthPage) {
                        window.location.href = '/login?session_expired=true';
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

