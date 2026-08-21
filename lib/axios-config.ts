'use client';

import axios from 'axios';

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
        if (typeof window !== 'undefined' && response.config.url === '/logout') {
            document.cookie = 'noel_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        return response;
    },
    (error) => {
        if (typeof window !== 'undefined' && error.response) {
            const status = error.response.status;
            if (status === 401 || status === 419) {
                // Clear Edge authentication helper cookie on authorization failure
                document.cookie = 'noel_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                
                const path = window.location.pathname;
                const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/confirm-password'].includes(path);
                if (!isAuthPage) {
                    window.location.href = '/login?session_expired=true';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

