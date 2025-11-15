/**
 * Formatters & Utilities
 * 🎯 TITAN Platform - Dashboard Utilities
 * Version: 2.0.0
 */

import { DASHBOARD_CONFIG } from '../core/constants.js';

/**
 * Format currency amount (USDT)
 * @param {number} amount - Amount to format
 * @param {boolean} includeSymbol - Include $ symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, includeSymbol = true) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return includeSymbol ? '$0.00' : '0.00';
    }
    
    const formatted = new Intl.NumberFormat(
        DASHBOARD_CONFIG.FORMAT.CURRENCY.locale,
        {
            minimumFractionDigits: DASHBOARD_CONFIG.FORMAT.CURRENCY.minimumFractionDigits,
            maximumFractionDigits: DASHBOARD_CONFIG.FORMAT.CURRENCY.maximumFractionDigits
        }
    ).format(amount);
    
    return includeSymbol ? `$${formatted}` : formatted;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    
    return new Intl.NumberFormat(
        DASHBOARD_CONFIG.FORMAT.NUMBER.locale,
        {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }
    ).format(num);
}

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100 or 0-1)
 * @param {boolean} isDecimal - If true, value is 0-1, otherwise 0-100
 * @param {boolean} includeSign - Include + sign for positive values
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, isDecimal = false, includeSign = true) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00%';
    }
    
    const actualValue = isDecimal ? value * 100 : value;
    const sign = includeSign && actualValue > 0 ? '+' : '';
    const formatted = formatNumber(Math.abs(actualValue), 2);
    
    return `${sign}${actualValue < 0 ? '-' : ''}${formatted}%`;
}

/**
 * Format price with appropriate decimal places
 * @param {number} price - Price to format
 * @param {string} symbol - Trading pair symbol (e.g., 'BTC/USDT')
 * @returns {string} Formatted price string
 */
export function formatPrice(price, symbol = '') {
    if (price === null || price === undefined || isNaN(price)) {
        return '$0.00';
    }
    
    // BTC: 2 decimals, ETH: 2 decimals, others: 4 decimals
    let decimals = 2;
    if (symbol.includes('BTC') || symbol.includes('ETH')) {
        decimals = 2;
    } else if (price < 1) {
        decimals = 6;
    } else if (price < 100) {
        decimals = 4;
    }
    
    return `$${formatNumber(price, decimals)}`;
}

/**
 * Format Persian date and time
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted Persian date string
 */
export function formatPersianDate(date) {
    if (!date) {
        return '';
    }
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    return new Intl.DateTimeFormat(
        DASHBOARD_CONFIG.FORMAT.DATE.locale,
        DASHBOARD_CONFIG.FORMAT.DATE
    ).format(dateObj);
}

/**
 * Format relative time (e.g., "2 minutes ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string in Persian
 */
export function formatRelativeTime(date) {
    if (!date) {
        return '';
    }
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
        return 'هم‌اکنون';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} دقیقه پیش`;
    } else if (diffHours < 24) {
        return `${diffHours} ساعت پیش`;
    } else if (diffDays < 7) {
        return `${diffDays} روز پیش`;
    } else {
        return formatPersianDate(dateObj);
    }
}

/**
 * Format uptime (seconds to human readable)
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime string in Persian
 */
export function formatUptime(seconds) {
    if (!seconds || isNaN(seconds)) {
        return '0 ثانیه';
    }
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days} روز`);
    if (hours > 0) parts.push(`${hours} ساعت`);
    if (minutes > 0) parts.push(`${minutes} دقیقه`);
    if (secs > 0 && days === 0 && hours === 0) parts.push(`${secs} ثانیه`);
    
    return parts.join(' و ') || '0 ثانیه';
}

/**
 * Get change direction indicator
 * @param {number} value - Change value
 * @returns {string} Arrow indicator (↑ or ↓)
 */
export function getChangeIndicator(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '';
    }
    return value >= 0 ? '↑' : '↓';
}

/**
 * Get change CSS class
 * @param {number} value - Change value
 * @returns {string} CSS class name
 */
export function getChangeClass(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '';
    }
    return value >= 0 ? 'change-positive' : 'change-negative';
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Safe number parsing
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number
 */
export function parseNumber(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if value is valid number
 * @param {any} value - Value to check
 * @returns {boolean} True if valid number
 */
export function isValidNumber(value) {
    return value !== null && value !== undefined && !isNaN(value) && isFinite(value);
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatPrice,
    formatPersianDate,
    formatRelativeTime,
    formatUptime,
    getChangeIndicator,
    getChangeClass,
    truncateText,
    parseNumber,
    debounce,
    throttle,
    isValidNumber,
    generateId
};
