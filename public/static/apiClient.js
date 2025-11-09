/**
 * TITAN Trading System - API Client Singleton
 * 
 * Centralized axios instance with proper baseURL configuration.
 * Prevents issues where baseURL is not set or gets overridden.
 * 
 * @author TITAN Trading System
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // Wait for TITAN_CONFIG to be available
    function createApiClient() {
        const config = window.TITAN_CONFIG || {};
        const baseURL = config.API_BASE_URL || config.API_BASE || '/api';
        
        // Create axios instance with proper configuration
        const apiClient = axios.create({
            baseURL: baseURL,
            timeout: config.TIMEOUTS?.API_REQUEST || 30000,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: false, // CORS: don't send cookies in cross-origin requests
        });
        
        // Request interceptor - add auth token if available
        apiClient.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('titan_auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                
                console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Request interceptor error:', error);
                return Promise.reject(error);
            }
        );
        
        // Response interceptor - handle common errors
        apiClient.interceptors.response.use(
            (response) => {
                console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
                return response;
            },
            (error) => {
                if (error.response) {
                    const { status, config } = error.response;
                    console.error(`❌ API Error: ${config.method.toUpperCase()} ${config.url} - ${status}`);
                    
                    // Handle 401 Unauthorized - token expired or invalid
                    if (status === 401) {
                        console.warn('⚠️ Unauthorized - token may be invalid');
                        // Optionally: clear token and redirect to login
                        // localStorage.removeItem('titan_auth_token');
                        // window.location.href = '/';
                    }
                    
                    // Handle 404 Not Found
                    if (status === 404) {
                        console.error(`❌ 404 Not Found: ${config.url}`);
                        console.error('Full URL attempted:', config.baseURL + config.url);
                    }
                } else if (error.request) {
                    console.error('❌ No response received:', error.request);
                } else {
                    console.error('❌ Request setup error:', error.message);
                }
                
                return Promise.reject(error);
            }
        );
        
        // Expose globally
        window.apiClient = apiClient;
        
        console.log('✅ API Client initialized with baseURL:', baseURL);
        console.log('📊 API Client config:', {
            baseURL: apiClient.defaults.baseURL,
            timeout: apiClient.defaults.timeout,
            headers: apiClient.defaults.headers
        });
        
        return apiClient;
    }
    
    // Initialize when TITAN_CONFIG is ready
    if (window.TITAN_CONFIG) {
        createApiClient();
    } else {
        // Wait for TITAN_CONFIG to load
        console.log('⏳ Waiting for TITAN_CONFIG...');
        const checkInterval = setInterval(() => {
            if (window.TITAN_CONFIG) {
                clearInterval(checkInterval);
                createApiClient();
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.apiClient) {
                console.error('❌ TITAN_CONFIG not loaded after 5 seconds, creating apiClient with default baseURL');
                createApiClient();
            }
        }, 5000);
    }
    
    // Convenience methods for common operations
    window.apiClient = window.apiClient || {};
    
    // Helper: Login
    window.apiClient.login = async function(credentials) {
        return this.post('/auth/login', credentials);
    };
    
    // Helper: Logout
    window.apiClient.logout = async function() {
        return this.post('/auth/logout');
    };
    
    // Helper: Verify token
    window.apiClient.verifyToken = async function(token) {
        return this.post('/auth/verify', { token });
    };
    
})();
