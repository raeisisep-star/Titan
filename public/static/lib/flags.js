/**
 * 🚩 Feature Flags for Titan Trading System - Production Safety Edition
 * 
 * این ماژول فلگ‌های قابلیت‌ها را با امنیت production مدیریت می‌کند
 * 🔴 FORCE_REAL prevents mock data from leaking into production
 */

// 🔴 FORCE_REAL - Production safety override
// When true, ALWAYS disables mock data regardless of USE_MOCK setting
export const FORCE_REAL = (window.ENV?.FORCE_REAL ?? 'true').toLowerCase() === 'true';

// USE_MOCK - Development mock data flag (overridden by FORCE_REAL)
export const USE_MOCK = FORCE_REAL ? false : ((window.ENV?.USE_MOCK ?? 'false').toLowerCase() === 'true');

// Debug mode
export const DEBUG_MODE = (window.ENV?.DEBUG ?? 'false').toLowerCase() === 'true';

// API timeout in milliseconds
export const API_TIMEOUT = parseInt(window.ENV?.API_TIMEOUT ?? '8000', 10);

// Enable retry on 502/503
export const ENABLE_RETRY = (window.ENV?.ENABLE_RETRY ?? 'true').toLowerCase() === 'true';

// Max retries for network errors
export const MAX_RETRIES = parseInt(window.ENV?.MAX_RETRIES ?? '1', 10);

// Default TTL for data freshness (30 seconds)
export const DEFAULT_TTL_MS = 30000;

/**
 * 🔒 Production Safety Check - Alerts if conflicting flags detected
 */
if (FORCE_REAL && window.ENV?.USE_MOCK === 'true') {
    console.warn('🚨 SECURITY WARNING: USE_MOCK=true is OVERRIDDEN by FORCE_REAL=true');
    console.warn('   Mock data is DISABLED in production mode');
}

/**
 * ✅ Validate data source is acceptable
 * @param {string} source - Data source ('real', 'bff', 'mock', 'none')
 * @returns {boolean} True if source is valid for current environment
 */
export function isValidSource(source) {
    if (FORCE_REAL) {
        // In production, only accept 'real' or 'bff' (backend-for-frontend)
        return source === 'real' || source === 'bff';
    }
    // In development with mock enabled, also accept 'mock'
    return source === 'real' || source === 'bff' || (USE_MOCK && source === 'mock');
}

/**
 * 🕐 Check if data is stale based on timestamp and TTL
 * @param {number} timestamp - Data timestamp in milliseconds
 * @param {number} ttlMs - Time-to-live in milliseconds (default: 30000)
 * @returns {boolean} True if data is stale (too old)
 */
export function isStaleData(timestamp, ttlMs = DEFAULT_TTL_MS) {
    if (!timestamp || typeof timestamp !== 'number') {
        return true; // Missing/invalid timestamp = stale
    }
    const age = Date.now() - timestamp;
    return age > ttlMs;
}

/**
 * 🔍 Validate metadata signature
 * @param {Object} meta - Metadata object to validate
 * @returns {boolean} True if metadata is valid and fresh
 */
export function isValidMetadata(meta) {
    // Check basic structure
    if (!meta || typeof meta !== 'object') {
        return false;
    }
    
    // Check required fields
    if (!meta.source || typeof meta.ts !== 'number') {
        return false;
    }
    
    // Validate source is acceptable
    if (!isValidSource(meta.source)) {
        return false;
    }
    
    // Check data freshness
    if (isStaleData(meta.ts, meta.ttlMs || DEFAULT_TTL_MS)) {
        return false;
    }
    
    // Check explicit stale flag
    if (meta.stale === true) {
        return false;
    }
    
    return true;
}

/**
 * 🏗️ Create metadata signature for responses
 * @param {string} source - Data source ('real', 'bff', 'mock')
 * @param {number} ttlMs - TTL in milliseconds (default: 30000)
 * @returns {Object} Metadata object with signature
 */
export function createMetadata(source, ttlMs = DEFAULT_TTL_MS) {
    return {
        source,
        ts: Date.now(),
        ttlMs,
        stale: false
    };
}

/**
 * ❌ Create No-Data response when data is unavailable/invalid
 * @param {string} reason - Reason for no data
 * @returns {Object} No-Data response object
 */
export function createNoDataResponse(reason = 'No valid data available') {
    return {
        noData: true,
        meta: {
            source: 'none',
            ts: Date.now(),
            stale: true,
            reason
        }
    };
}

/**
 * 🎨 Get source badge color for UI display
 * @param {string} source - Data source
 * @returns {string} Tailwind CSS color classes
 */
export function getSourceBadgeColor(source) {
    switch (source) {
        case 'real':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'bff':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'mock':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'none':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
}

/**
 * 🏷️ Get source display name
 * @param {string} source - Data source
 * @returns {string} User-friendly source name
 */
export function getSourceDisplayName(source) {
    switch (source) {
        case 'real':
            return 'Real API';
        case 'bff':
            return 'BFF Cache';
        case 'mock':
            return 'Mock Data';
        case 'none':
            return 'No Data';
        default:
            return 'Unknown';
    }
}

// Log flag status on load
if (DEBUG_MODE) {
    console.log('🚩 Feature Flags (Production Safety):');
    console.log('   🔴 FORCE_REAL:', FORCE_REAL, '(production override)');
    console.log('   USE_MOCK:', USE_MOCK);
    console.log('   DEBUG_MODE:', DEBUG_MODE);
    console.log('   API_TIMEOUT:', API_TIMEOUT, 'ms');
    console.log('   ENABLE_RETRY:', ENABLE_RETRY);
    console.log('   MAX_RETRIES:', MAX_RETRIES);
    console.log('   DEFAULT_TTL:', DEFAULT_TTL_MS, 'ms');
}

// Make available globally for easy debugging
window.TITAN_FLAGS = {
    FORCE_REAL,
    USE_MOCK,
    DEBUG_MODE,
    API_TIMEOUT,
    ENABLE_RETRY,
    MAX_RETRIES,
    DEFAULT_TTL_MS,
    // Utility functions
    isValidSource,
    isStaleData,
    isValidMetadata,
    createMetadata,
    createNoDataResponse,
    getSourceBadgeColor,
    getSourceDisplayName
};
