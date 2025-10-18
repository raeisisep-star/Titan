/**
 * 🔐 Robust Token Manager for TITAN Trading System
 * 
 * سیستم سه‌لایه برای مدیریت مطمئن token:
 * 1. Memory (in-memory cache) - سریع‌ترین
 * 2. localStorage - Persistent
 * 3. sessionStorage - Backup layer
 */

class TokenManager {
    constructor() {
        // In-memory cache for fastest access
        this._token = null;
        this._user = null;
        
        // Token key
        this.TOKEN_KEY = 'titan_auth_token';
        this.USER_KEY = 'titan_user_data';
        
        // Load existing token on init
        this._loadFromStorage();
        
        console.log('🔐 [TokenManager] Initialized');
    }
    
    /**
     * Load token from storage layers
     */
    _loadFromStorage() {
        try {
            // Try localStorage first (most reliable)
            let token = localStorage.getItem(this.TOKEN_KEY);
            let userData = localStorage.getItem(this.USER_KEY);
            
            // Fallback to sessionStorage
            if (!token) {
                token = sessionStorage.getItem(this.TOKEN_KEY);
                userData = sessionStorage.getItem(this.USER_KEY);
                console.log('🔐 [TokenManager] Loaded from sessionStorage (localStorage was empty)');
            }
            
            if (token) {
                this._token = token;
                this._user = userData ? JSON.parse(userData) : null;
                console.log('🔐 [TokenManager] Token loaded from storage:', token.substring(0, 20) + '...');
            } else {
                console.log('🔐 [TokenManager] No token found in any storage');
            }
        } catch (error) {
            console.error('🔐 [TokenManager] Error loading from storage:', error);
        }
    }
    
    /**
     * Save token to all storage layers (triple redundancy)
     */
    setToken(token, userData = null) {
        if (!token) {
            console.error('🔐 [TokenManager] Cannot set empty token');
            return false;
        }
        
        try {
            console.log('🔐 [TokenManager] Saving token to all layers...');
            
            // Layer 1: Memory (instant access)
            this._token = token;
            this._user = userData;
            
            // Layer 2: localStorage (persistent across sessions)
            localStorage.setItem(this.TOKEN_KEY, token);
            if (userData) {
                localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
            }
            
            // Layer 3: sessionStorage (backup for localStorage failures)
            sessionStorage.setItem(this.TOKEN_KEY, token);
            if (userData) {
                sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
            }
            
            // Verify storage
            const verifyLocal = localStorage.getItem(this.TOKEN_KEY);
            const verifySession = sessionStorage.getItem(this.TOKEN_KEY);
            
            if (verifyLocal === token && verifySession === token) {
                console.log('✅ [TokenManager] Token saved successfully to all layers');
                console.log('   Memory:', !!this._token);
                console.log('   localStorage:', !!verifyLocal);
                console.log('   sessionStorage:', !!verifySession);
                return true;
            } else {
                console.error('❌ [TokenManager] Storage verification failed!');
                console.error('   Expected:', token.substring(0, 20));
                console.error('   localStorage:', verifyLocal?.substring(0, 20));
                console.error('   sessionStorage:', verifySession?.substring(0, 20));
                return false;
            }
        } catch (error) {
            console.error('❌ [TokenManager] Error saving token:', error);
            return false;
        }
    }
    
    /**
     * Get token from fastest available layer
     */
    getToken() {
        // Try memory first (fastest)
        if (this._token) {
            return this._token;
        }
        
        // Reload from storage if memory is empty
        this._loadFromStorage();
        return this._token;
    }
    
    /**
     * Get user data
     */
    getUser() {
        if (this._user) {
            return this._user;
        }
        
        // Try loading from storage
        try {
            const userData = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
            if (userData) {
                this._user = JSON.parse(userData);
                return this._user;
            }
        } catch (error) {
            console.error('🔐 [TokenManager] Error loading user data:', error);
        }
        
        return null;
    }
    
    /**
     * Check if token exists
     */
    hasToken() {
        return !!this.getToken();
    }
    
    /**
     * Clear token from all layers
     */
    clearToken() {
        console.log('🔐 [TokenManager] Clearing token from all layers...');
        
        // Clear memory
        this._token = null;
        this._user = null;
        
        // Clear localStorage
        try {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        } catch (error) {
            console.error('🔐 [TokenManager] Error clearing localStorage:', error);
        }
        
        // Clear sessionStorage
        try {
            sessionStorage.removeItem(this.TOKEN_KEY);
            sessionStorage.removeItem(this.USER_KEY);
        } catch (error) {
            console.error('🔐 [TokenManager] Error clearing sessionStorage:', error);
        }
        
        console.log('✅ [TokenManager] Token cleared from all layers');
    }
    
    /**
     * Get authorization header value
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? `Bearer ${token}` : null;
    }
    
    /**
     * Debug: Print current state
     */
    debug() {
        console.log('🔐 [TokenManager] Debug Info:');
        console.log('   Memory token:', this._token?.substring(0, 30) + '...' || 'null');
        console.log('   localStorage token:', localStorage.getItem(this.TOKEN_KEY)?.substring(0, 30) + '...' || 'null');
        console.log('   sessionStorage token:', sessionStorage.getItem(this.TOKEN_KEY)?.substring(0, 30) + '...' || 'null');
        console.log('   User data:', this._user);
    }
}

// Create singleton instance
const tokenManager = new TokenManager();

// Make available globally
window.TokenManager = tokenManager;

// Export for modules
export default tokenManager;

console.log('✅ Token Manager module loaded');
