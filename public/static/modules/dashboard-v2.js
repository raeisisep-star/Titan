/**
 * Dashboard Entry Point
 * 🎯 TITAN Platform - Professional Dashboard v2.0
 * Version: 2.0.0
 * Last Updated: 2024-11-15
 * 
 * Main entry point for the dashboard module.
 * This file is loaded by index.html and initializes the dashboard.
 * 
 * Architecture:
 * - Modular structure with clear separation of concerns
 * - Core logic in dashboard-core.js
 * - Widgets as separate modules
 * - API client isolated
 * - Utilities and formatters separated
 * 
 * Features:
 * - Real MEXC data integration
 * - PostgreSQL database views
 * - 15 AI Trading Agents display
 * - Auto-refresh every 30 seconds
 * - Persian date/time formatting
 * - Professional error handling
 */

import DashboardCore from './dashboard-v2/core/dashboard-core.js';

/**
 * Initialize dashboard when DOM is ready
 */
async function initDashboard() {
    console.log('🚀 [Dashboard] Starting initialization...');
    
    try {
        // Wait for container to exist in DOM
        const waitForContainer = () => {
            return new Promise((resolve) => {
                const checkContainer = () => {
                    const container = document.getElementById('dashboard-container');
                    if (container) {
                        console.log('✅ [Dashboard] Container found, proceeding');
                        resolve(container);
                    } else {
                        console.log('⏳ [Dashboard] Waiting for container...');
                        setTimeout(checkContainer, 100);
                    }
                };
                checkContainer();
            });
        };
        
        await waitForContainer();
        
        // Create dashboard instance
        const dashboard = new DashboardCore();
        
        // Initialize
        await dashboard.initialize();
        
        console.log('✅ [Dashboard] Initialization complete');
        
    } catch (error) {
        console.error('❌ [Dashboard] Initialization failed:', error);
        
        // Show error message to user
        const container = document.getElementById('dashboard-container');
        if (container) {
            container.innerHTML = `
                <div class="dashboard-init-error">
                    <div class="error-icon">❌</div>
                    <h2>خطا در راه‌اندازی داشبورد</h2>
                    <p class="error-message">${error.message}</p>
                    <button class="retry-btn" onclick="location.reload()">
                        بارگذاری مجدد صفحه
                    </button>
                </div>
            `;
        }
    }
}

/**
 * Wait for DOM to be ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initDashboard, 500);
    });
} else {
    // DOM is already ready, wait a bit for app.js to create container
    setTimeout(initDashboard, 500);
}

/**
 * Export for debugging (optional)
 */
if (typeof window !== 'undefined') {
    window.DashboardCore = DashboardCore;
    window.initDashboard = initDashboard;
}

console.log('📦 [Dashboard] Module loaded');
