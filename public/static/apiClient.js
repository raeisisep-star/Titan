/**
 * TITAN Trading System - Axios API Client Singleton
 * 
 * Centralized axios instance with proper baseURL configuration
 * to prevent 404 errors and ensure consistent API calls.
 * 
 * @version 1.0.0
 */

(function(window) {
    'use strict';
    
    // Wait for config to be loaded
    function initApiClient() {
        if (!window.TITAN_CONFIG || !window.TITAN_CONFIG.API_BASE_URL) {
            console.warn('⚠️ TITAN_CONFIG not loaded yet, retrying apiClient init...');
            setTimeout(initApiClient, 100);
            return;
        }
        
        // Create axios instance with proper configuration
        const apiClient = axios.create({
            baseURL: window.TITAN_CONFIG.API_BASE_URL || '/api',
            timeout: window.TITAN_CONFIG.TIMEOUTS?.API_REQUEST || 30000,
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: false
        });
        
        // Request interceptor for adding auth token
        apiClient.interceptors.request.use(
            function(config) {
                const token = localStorage.getItem('titan_auth_token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                
                // Log request in development
                if (window.ENV?.DEBUG === 'true' || window.TITAN_CONFIG?.ENV !== 'production') {
                    console.log(`🌐 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
                }
                
                return config;
            },
            function(error) {
                console.error('❌ Request interceptor error:', error);
                return Promise.reject(error);
            }
        );
        
        // Response interceptor for handling errors
        apiClient.interceptors.response.use(
            function(response) {
                // Log response in development
                if (window.ENV?.DEBUG === 'true' || window.TITAN_CONFIG?.ENV !== 'production') {
                    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
                }
                return response;
            },
            function(error) {
                // Handle common errors
                if (error.response) {
                    const status = error.response.status;
                    const url = error.config?.url || 'unknown';
                    
                    console.error(`❌ API Error ${status} on ${url}:`, error.response.data);
                    
                    // Handle 401 Unauthorized - redirect to login
                    if (status === 401) {
                        console.warn('🔐 Unauthorized - clearing token and redirecting to login');
                        localStorage.removeItem('titan_auth_token');
                        if (window.app && typeof window.app.showLoginScreen === 'function') {
                            window.app.showLoginScreen();
                        }
                    }
                    
                    // Handle 404 Not Found
                    if (status === 404) {
                        console.error(`🔍 Endpoint not found: ${error.config.baseURL}${url}`);
                    }
                } else if (error.request) {
                    console.error('❌ No response received from API:', error.request);
                } else {
                    console.error('❌ API request setup error:', error.message);
                }
                
                return Promise.reject(error);
            }
        );
        
        // Expose as global
        window.apiClient = apiClient;
        
        console.log('✅ API Client initialized with baseURL:', apiClient.defaults.baseURL);
        console.log('📊 API Client configuration:', {
            baseURL: apiClient.defaults.baseURL,
            timeout: apiClient.defaults.timeout,
            withCredentials: apiClient.defaults.withCredentials
        });
        
        // Also configure the global axios instance as fallback
        axios.defaults.baseURL = apiClient.defaults.baseURL;
        axios.defaults.timeout = apiClient.defaults.timeout;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        
        console.log('✅ Global axios also configured with same baseURL');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApiClient);
    } else {
        initApiClient();
    }
    
})(window);
