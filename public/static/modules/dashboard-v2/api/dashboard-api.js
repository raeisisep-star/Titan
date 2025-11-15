/**
 * Dashboard API Client
 * 🎯 TITAN Platform - API Integration
 * Version: 2.0.0
 * 
 * Handles all API calls for dashboard data
 * Features:
 * - Retry logic with exponential backoff
 * - Timeout handling
 * - Error normalization
 * - Response validation
 */

import { DASHBOARD_CONFIG, API_STRUCTURE } from '../core/constants.js';

/**
 * API Client for Dashboard
 */
class DashboardAPIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.endpoint = DASHBOARD_CONFIG.API.ENDPOINT;
        this.timeout = DASHBOARD_CONFIG.API.TIMEOUT;
        this.retryAttempts = DASHBOARD_CONFIG.API.RETRY_ATTEMPTS;
        this.retryDelay = DASHBOARD_CONFIG.API.RETRY_DELAY;
    }

    /**
     * Fetch comprehensive dashboard data
     * @returns {Promise<Object>} Dashboard data
     * @throws {Error} API error
     */
    async getComprehensiveData() {
        console.log('🌐 [DashboardAPI] Fetching comprehensive data...');
        
        try {
            const response = await this.fetchWithRetry(this.endpoint);
            
            // Validate response structure
            this.validateResponse(response);
            
            console.log('✅ [DashboardAPI] Data fetched successfully');
            return response;
            
        } catch (error) {
            console.error('❌ [DashboardAPI] Failed to fetch data:', error);
            throw this.normalizeError(error);
        }
    }

    /**
     * Fetch with retry logic
     * @private
     * @param {string} endpoint - API endpoint
     * @param {number} attempt - Current attempt number
     * @returns {Promise<Object>} API response
     */
    async fetchWithRetry(endpoint, attempt = 1) {
        try {
            const response = await this.fetchWithTimeout(endpoint);
            return response;
            
        } catch (error) {
            // If max retries reached, throw error
            if (attempt >= this.retryAttempts) {
                throw error;
            }
            
            // Calculate delay with exponential backoff
            const delay = this.retryDelay * Math.pow(2, attempt - 1);
            
            console.warn(`⚠️ [DashboardAPI] Attempt ${attempt} failed, retrying in ${delay}ms...`);
            
            // Wait before retry
            await this.sleep(delay);
            
            // Retry
            return this.fetchWithRetry(endpoint, attempt + 1);
        }
    }

    /**
     * Fetch with timeout
     * @private
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} API response
     */
    async fetchWithTimeout(endpoint) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const url = `${this.baseURL}${endpoint}`;
            
            console.log(`📡 [DashboardAPI] GET ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal,
                credentials: 'same-origin'
            });
            
            clearTimeout(timeoutId);
            
            // Check HTTP status
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Parse JSON
            const data = await response.json();
            
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Handle abort (timeout)
            if (error.name === 'AbortError') {
                throw new Error(DASHBOARD_CONFIG.ERRORS.API_TIMEOUT);
            }
            
            throw error;
        }
    }

    /**
     * Validate API response structure
     * @private
     * @param {Object} response - API response
     * @throws {Error} Validation error
     */
    validateResponse(response) {
        // Check response exists
        if (!response) {
            throw new Error('Response is null or undefined');
        }
        
        // Check success flag
        if (response.success === false) {
            throw new Error(response.error || 'API returned success: false');
        }
        
        // Check data object exists
        if (!response.data) {
            throw new Error('Response missing data object');
        }
        
        const { data } = response;
        
        // Check required top-level fields
        const missingFields = API_STRUCTURE.REQUIRED_FIELDS.filter(
            field => !(field in data)
        );
        
        if (missingFields.length > 0) {
            console.warn('⚠️ [DashboardAPI] Missing fields:', missingFields);
            // Don't throw - allow partial data
        }
        
        // Validate portfolio data
        if (data.portfolio) {
            const missingPortfolioFields = API_STRUCTURE.PORTFOLIO_FIELDS.filter(
                field => !(field in data.portfolio)
            );
            
            if (missingPortfolioFields.length > 0) {
                console.warn('⚠️ [DashboardAPI] Missing portfolio fields:', missingPortfolioFields);
            }
        }
        
        // Validate market data
        if (data.market) {
            const missingMarketFields = API_STRUCTURE.MARKET_FIELDS.filter(
                field => !(field in data.market)
            );
            
            if (missingMarketFields.length > 0) {
                console.warn('⚠️ [DashboardAPI] Missing market fields:', missingMarketFields);
            }
        }
        
        // Validate AI agents array
        if (data.aiAgents && Array.isArray(data.aiAgents)) {
            data.aiAgents.forEach((agent, index) => {
                const missingAgentFields = API_STRUCTURE.AI_AGENT_FIELDS.filter(
                    field => !(field in agent)
                );
                
                if (missingAgentFields.length > 0) {
                    console.warn(`⚠️ [DashboardAPI] Agent ${index} missing fields:`, missingAgentFields);
                }
            });
        }
        
        console.log('✅ [DashboardAPI] Response validation passed');
    }

    /**
     * Normalize error to consistent format
     * @private
     * @param {Error} error - Original error
     * @returns {Error} Normalized error
     */
    normalizeError(error) {
        // Network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return new Error(DASHBOARD_CONFIG.ERRORS.NETWORK_ERROR);
        }
        
        // Timeout errors
        if (error.message.includes('timeout') || error.message.includes('تایم')) {
            return new Error(DASHBOARD_CONFIG.ERRORS.API_TIMEOUT);
        }
        
        // HTTP errors
        if (error.message.includes('HTTP')) {
            return new Error(`${DASHBOARD_CONFIG.ERRORS.LOAD_FAILED}: ${error.message}`);
        }
        
        // Validation errors
        if (error.message.includes('missing') || error.message.includes('invalid')) {
            return new Error(`${DASHBOARD_CONFIG.ERRORS.INVALID_DATA}: ${error.message}`);
        }
        
        // Generic error
        return new Error(`${DASHBOARD_CONFIG.ERRORS.LOAD_FAILED}: ${error.message}`);
    }

    /**
     * Sleep utility for retry delays
     * @private
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test API connectivity
     * @returns {Promise<boolean>} True if API is reachable
     */
    async testConnection() {
        try {
            await this.fetchWithTimeout(this.endpoint);
            return true;
        } catch (error) {
            console.error('❌ [DashboardAPI] Connection test failed:', error);
            return false;
        }
    }

    /**
     * Get API health status
     * @returns {Promise<Object>} Health status
     */
    async getHealth() {
        try {
            const response = await this.fetchWithTimeout('/api/health');
            return {
                healthy: true,
                ...response
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }
}

// Create singleton instance
const dashboardAPI = new DashboardAPIClient();

// Export instance and class
export { dashboardAPI, DashboardAPIClient };
export default dashboardAPI;
