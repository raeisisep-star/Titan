/**
 * TITAN Trading System - Idempotent Guards
 * 
 * Prevents double initialization of modules and functions.
 * Wraps initialization functions with one-time execution guards.
 * 
 * @author TITAN Trading System
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // Global initialization flags
    window.__TITAN_INIT_FLAGS__ = {
        notifications: false,
        alertsRefresh: false,
        dashboardMounted: false,
        modulesLoaded: false
    };
    
    /**
     * Create an idempotent wrapper for a function
     * @param {string} key - Unique key for this initialization
     * @param {Function} fn - Function to wrap
     * @param {string} name - Human-readable name for logging
     * @returns {Function} Wrapped function that only executes once
     */
    function createIdempotentWrapper(key, fn, name = key) {
        return function(...args) {
            if (window.__TITAN_INIT_FLAGS__[key]) {
                console.log(`⏭️  ${name} already initialized, skipping...`);
                return Promise.resolve();
            }
            
            window.__TITAN_INIT_FLAGS__[key] = true;
            console.log(`🔧 Initializing ${name}...`);
            
            return fn.apply(this, args);
        };
    }
    
    /**
     * Reset a specific initialization flag (for testing/debugging)
     */
    function resetFlag(key) {
        if (window.__TITAN_INIT_FLAGS__.hasOwnProperty(key)) {
            window.__TITAN_INIT_FLAGS__[key] = false;
            console.log(`🔄 Reset initialization flag: ${key}`);
        }
    }
    
    /**
     * Reset all initialization flags (for testing/debugging)
     */
    function resetAllFlags() {
        Object.keys(window.__TITAN_INIT_FLAGS__).forEach(key => {
            window.__TITAN_INIT_FLAGS__[key] = false;
        });
        console.log('🔄 Reset all initialization flags');
    }
    
    /**
     * Wait for DOM element to appear
     * @param {string} selector - CSS selector
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Element>} The found element
     */
    async function waitForElement(selector, timeout = 3000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`✅ Found element: ${selector}`);
                return element;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        throw new Error(`❌ Element not found after ${timeout}ms: ${selector}`);
    }
    
    /**
     * Wait for window property to be available
     * @param {string} property - Property name (e.g., 'TITAN_CONFIG')
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<any>} The property value
     */
    async function waitForProperty(property, timeout = 3000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (window.hasOwnProperty(property) && window[property] !== undefined) {
                console.log(`✅ Property available: ${property}`);
                return window[property];
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        throw new Error(`❌ Property not available after ${timeout}ms: ${property}`);
    }
    
    // Export utilities
    window.TITAN_IDEMPOTENT = {
        createWrapper: createIdempotentWrapper,
        resetFlag,
        resetAllFlags,
        waitForElement,
        waitForProperty,
        flags: window.__TITAN_INIT_FLAGS__
    };
    
    console.log('✅ Idempotent guards module loaded');
    console.log('📋 Available commands:');
    console.log('   - TITAN_IDEMPOTENT.resetFlag(key)');
    console.log('   - TITAN_IDEMPOTENT.resetAllFlags()');
    console.log('   - TITAN_IDEMPOTENT.waitForElement(selector)');
    console.log('   - TITAN_IDEMPOTENT.waitForProperty(property)');
    
})();
