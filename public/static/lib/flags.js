/**
 * 🚩 Feature Flags for Titan Trading System
 * 
 * این ماژول فلگ‌های قابلیت‌ها را مدیریت می‌کند
 * به راحتی می‌توان بین داده‌های واقعی و Mock سوئیچ کرد
 */

// Read from window.ENV or default to false
export const USE_MOCK = (window.ENV?.USE_MOCK ?? 'false').toLowerCase() === 'true';

// Debug mode
export const DEBUG_MODE = (window.ENV?.DEBUG ?? 'false').toLowerCase() === 'true';

// API timeout in milliseconds
export const API_TIMEOUT = parseInt(window.ENV?.API_TIMEOUT ?? '8000', 10);

// Enable retry on 502/503
export const ENABLE_RETRY = (window.ENV?.ENABLE_RETRY ?? 'true').toLowerCase() === 'true';

// Max retries for network errors
export const MAX_RETRIES = parseInt(window.ENV?.MAX_RETRIES ?? '1', 10);

// Log flag status on load
if (DEBUG_MODE) {
    console.log('🚩 Feature Flags:');
    console.log('   USE_MOCK:', USE_MOCK);
    console.log('   DEBUG_MODE:', DEBUG_MODE);
    console.log('   API_TIMEOUT:', API_TIMEOUT, 'ms');
    console.log('   ENABLE_RETRY:', ENABLE_RETRY);
    console.log('   MAX_RETRIES:', MAX_RETRIES);
}

// Make available globally for easy debugging
window.TITAN_FLAGS = {
    USE_MOCK,
    DEBUG_MODE,
    API_TIMEOUT,
    ENABLE_RETRY,
    MAX_RETRIES
};
