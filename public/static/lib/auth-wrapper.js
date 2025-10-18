/**
 * 🔐 Authentication Wrapper
 * 
 * Wrapper حول app.js برای استفاده از TokenManager
 * این فایل قبل از app.js لود می‌شود و authentication را handle می‌کند
 */

import tokenManager from './token-manager.js';

// Intercept localStorage calls for titan_auth_token
const originalSetItem = localStorage.setItem.bind(localStorage);
const originalGetItem = localStorage.getItem.bind(localStorage);
const originalRemoveItem = localStorage.removeItem.bind(localStorage);

// Override localStorage.setItem for titan_auth_token
localStorage.setItem = function(key, value) {
    if (key === 'titan_auth_token') {
        console.log('🔐 [AuthWrapper] Intercepted localStorage.setItem for token');
        tokenManager.setToken(value);
        return originalSetItem(key, value);
    }
    return originalSetItem(key, value);
};

// Override localStorage.getItem for titan_auth_token
localStorage.getItem = function(key) {
    if (key === 'titan_auth_token') {
        const token = tokenManager.getToken();
        if (token) {
            console.log('🔐 [AuthWrapper] Serving token from TokenManager');
            return token;
        }
    }
    return originalGetItem(key);
};

// Override localStorage.removeItem for titan_auth_token
localStorage.removeItem = function(key) {
    if (key === 'titan_auth_token') {
        console.log('🔐 [AuthWrapper] Intercepted localStorage.removeItem for token');
        tokenManager.clearToken();
    }
    return originalRemoveItem(key);
};

// Enhance axios to always use TokenManager
if (window.axios) {
    // Add request interceptor
    axios.interceptors.request.use(
        (config) => {
            const authHeader = tokenManager.getAuthHeader();
            if (authHeader && !config.headers['Authorization']) {
                config.headers['Authorization'] = authHeader;
                console.log('🔐 [AuthWrapper] Added token to axios request via interceptor');
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    
    console.log('✅ [AuthWrapper] Axios interceptor installed');
}

// Make TokenManager available globally
window.TokenManager = tokenManager;

console.log('✅ Auth Wrapper loaded - localStorage and axios enhanced');
