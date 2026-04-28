'use client';

import axios from 'axios';

// No baseURL needed — next.config.ts rewrites proxy all backend routes
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Fetch CSRF cookie before mutating requests (Laravel Sanctum)
let csrfFetched = false;
axios.interceptors.request.use(async (config) => {
    const mutating = ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase());
    if (mutating && !csrfFetched && typeof window !== 'undefined') {
        try {
            await axios.get('/sanctum/csrf-cookie');
            csrfFetched = true;
        } catch {}
    }
    return config;
});

export default axios;
