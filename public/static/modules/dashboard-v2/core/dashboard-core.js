/**
 * Dashboard Core Module
 * 🎯 TITAN Platform - Professional Dashboard v2.0
 * Version: 2.0.0
 * Last Updated: 2024-11-15
 * 
 * Main dashboard orchestrator that manages:
 * - Data loading and refreshing
 * - Widget rendering
 * - AI Agents section
 * - Auto-refresh mechanism
 * - Error handling
 * - State management
 */

import { DASHBOARD_CONFIG, DOM_IDS } from './constants.js';
import dashboardAPI from '../api/dashboard-api.js';
import { formatPersianDate, debounce } from '../utils/formatters.js';

// Widget renderers
import { renderPortfolioWidget, renderPortfolioLoading } from '../widgets/portfolio-widget.js';
import { renderMarketWidget, renderMarketLoading } from '../widgets/market-widget.js';
import { renderSystemWidget, renderSystemLoading } from '../widgets/system-widget.js';
import { renderChartWidget, renderChartLoading, initializeChart, updateChart } from '../widgets/chart-widget.js';

// AI Agents renderer
import { renderAIAgentsSection, renderAIAgentsLoading, initAIAgentsEvents } from '../ai-agents/ai-agents-section.js';

/**
 * Dashboard Core Class
 */
class DashboardCore {
    constructor() {
        // State management
        this.state = {
            data: null,
            loading: false,
            error: null,
            lastUpdate: null,
            initialized: false
        };
        
        // Configuration
        this.config = {
            autoRefresh: true,
            refreshInterval: DASHBOARD_CONFIG.REFRESH.INTERVAL,
            currentTimeframe: DASHBOARD_CONFIG.CHART.DEFAULT_TIMEFRAME
        };
        
        // Timers
        this.refreshTimer = null;
        this.lastManualRefresh = 0;
        
        // Chart instance
        this.chartInstance = null;
        
        console.log('🎯 [DashboardCore] Instance created');
    }

    /**
     * Initialize dashboard
     * @public
     */
    async initialize() {
        if (this.state.initialized) {
            console.warn('⚠️ [DashboardCore] Already initialized');
            return;
        }
        
        console.log('🚀 [DashboardCore] Initializing...');
        
        try {
            // Set global reference for onclick handlers
            window.dashboardModule = this;
            
            // Show loading state
            this.renderLoadingState();
            
            // Load initial data
            await this.loadData();
            
            // Setup auto-refresh if enabled
            if (this.config.autoRefresh) {
                this.startAutoRefresh();
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.state.initialized = true;
            
            console.log('✅ [DashboardCore] Initialization complete');
            
        } catch (error) {
            console.error('❌ [DashboardCore] Initialization failed:', error);
            this.handleError(error);
        }
    }

    /**
     * Load dashboard data from API
     * @public
     */
    async loadData() {
        if (this.state.loading) {
            console.warn('⚠️ [DashboardCore] Already loading data');
            return;
        }
        
        console.log('📊 [DashboardCore] Loading data...');
        
        this.state.loading = true;
        this.state.error = null;
        
        try {
            // Fetch data from API
            const response = await dashboardAPI.getComprehensiveData();
            
            // Validate response
            if (!response || !response.success || !response.data) {
                throw new Error('Invalid API response structure');
            }
            
            // Store data
            this.state.data = response.data;
            this.state.lastUpdate = new Date();
            
            // Render dashboard
            this.render();
            
            // Initialize chart if Chart.js is loaded
            if (typeof Chart !== 'undefined' && this.state.data.chartData) {
                this.initChart();
            }
            
            // Update last update time
            this.updateLastUpdateTime();
            
            console.log('✅ [DashboardCore] Data loaded successfully');
            
        } catch (error) {
            console.error('❌ [DashboardCore] Failed to load data:', error);
            this.state.error = error.message;
            this.handleError(error);
            
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Render complete dashboard
     * @private
     */
    render() {
        const container = document.getElementById(DOM_IDS.DASHBOARD_CONTAINER);
        
        if (!container) {
            console.error('❌ [DashboardCore] Dashboard container not found');
            return;
        }
        
        if (!this.state.data) {
            console.warn('⚠️ [DashboardCore] No data to render');
            return;
        }
        
        const { portfolio, market, system, chartData, aiAgents } = this.state.data;
        
        container.innerHTML = `
            <div class="dashboard-wrapper">
                <!-- Dashboard Header -->
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>داشبورد TITAN</h1>
                        <p class="dashboard-subtitle">پلتفرم معاملاتی خودکار با هوش مصنوعی</p>
                    </div>
                    <div class="dashboard-actions">
                        <div class="last-update" id="${DOM_IDS.LAST_UPDATE}">
                            <span class="update-icon">🕒</span>
                            <span class="update-text">آخرین به‌روزرسانی: ${formatPersianDate(this.state.lastUpdate)}</span>
                        </div>
                        <button 
                            class="refresh-btn" 
                            id="${DOM_IDS.REFRESH_BUTTON}"
                            onclick="window.dashboardModule?.manualRefresh()"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                            </svg>
                            <span>به‌روزرسانی</span>
                        </button>
                    </div>
                </div>
                
                <!-- Widgets Grid (4 Core Widgets) -->
                <div class="widgets-grid" id="${DOM_IDS.WIDGETS_GRID}">
                    ${renderPortfolioWidget(portfolio)}
                    ${renderMarketWidget(market)}
                    ${renderSystemWidget(system)}
                    ${renderChartWidget(chartData, this.config.currentTimeframe)}
                </div>
                
                <!-- AI Agents Section -->
                ${renderAIAgentsSection(aiAgents)}
            </div>
        `;
        
        // Initialize AI Agents event listeners after DOM is ready
        setTimeout(() => {
            initAIAgentsEvents();
            console.log('✅ [DashboardCore] AI Agents events initialized');
        }, 100);
        
        console.log('✅ [DashboardCore] Render complete');
    }

    /**
     * Render loading state
     * @private
     */
    renderLoadingState() {
        const container = document.getElementById(DOM_IDS.DASHBOARD_CONTAINER);
        
        if (!container) return;
        
        container.innerHTML = `
            <div class="dashboard-wrapper">
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>داشبورد TITAN</h1>
                    </div>
                </div>
                
                <div class="widgets-grid">
                    ${renderPortfolioLoading()}
                    ${renderMarketLoading()}
                    ${renderSystemLoading()}
                    ${renderChartLoading()}
                </div>
                
                ${renderAIAgentsLoading()}
            </div>
        `;
    }

    /**
     * Initialize chart
     * @private
     */
    initChart() {
        if (!this.state.data || !this.state.data.chartData) {
            console.warn('⚠️ [DashboardCore] No chart data available');
            return;
        }
        
        // Wait for DOM to be ready
        setTimeout(() => {
            this.chartInstance = initializeChart(this.state.data.chartData);
            
            if (this.chartInstance) {
                console.log('✅ [DashboardCore] Chart initialized');
            } else {
                console.warn('⚠️ [DashboardCore] Chart initialization failed');
            }
        }, 100);
    }

    /**
     * Manual refresh triggered by user
     * @public
     */
    async manualRefresh() {
        // Cooldown check
        const now = Date.now();
        const timeSinceLastRefresh = now - this.lastManualRefresh;
        
        if (timeSinceLastRefresh < DASHBOARD_CONFIG.REFRESH.MANUAL_COOLDOWN) {
            const remainingTime = Math.ceil((DASHBOARD_CONFIG.REFRESH.MANUAL_COOLDOWN - timeSinceLastRefresh) / 1000);
            console.warn(`⚠️ [DashboardCore] Refresh cooldown: ${remainingTime}s remaining`);
            return;
        }
        
        this.lastManualRefresh = now;
        
        console.log('🔄 [DashboardCore] Manual refresh triggered');
        
        // Add visual feedback
        const refreshBtn = document.getElementById(DOM_IDS.REFRESH_BUTTON);
        if (refreshBtn) {
            refreshBtn.classList.add('refreshing');
        }
        
        await this.loadData();
        
        // Remove visual feedback
        if (refreshBtn) {
            refreshBtn.classList.remove('refreshing');
        }
    }

    /**
     * Refresh specific widget
     * @public
     * @param {string} widgetName - Widget name to refresh
     */
    async refreshWidget(widgetName) {
        console.log(`🔄 [DashboardCore] Refreshing widget: ${widgetName}`);
        
        // For now, refresh all data
        // In future, we can add widget-specific refresh
        await this.loadData();
    }

    /**
     * Change chart timeframe
     * @public
     * @param {string} timeframe - New timeframe
     */
    async changeTimeframe(timeframe) {
        console.log(`📊 [DashboardCore] Changing timeframe to: ${timeframe}`);
        
        this.config.currentTimeframe = timeframe;
        
        // TODO: Fetch new chart data for selected timeframe
        // For now, just re-render with existing data
        this.render();
        
        if (this.chartInstance && this.state.data.chartData) {
            updateChart(this.chartInstance, this.state.data.chartData);
        }
    }

    /**
     * Start auto-refresh timer
     * @private
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        console.log(`⏰ [DashboardCore] Auto-refresh started (${this.config.refreshInterval / 1000}s)`);
        
        this.refreshTimer = setInterval(() => {
            console.log('🔄 [DashboardCore] Auto-refresh triggered');
            this.loadData();
        }, this.config.refreshInterval);
    }

    /**
     * Stop auto-refresh timer
     * @public
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('⏸️ [DashboardCore] Auto-refresh stopped');
        }
    }

    /**
     * Update last update time display
     * @private
     */
    updateLastUpdateTime() {
        const element = document.getElementById(DOM_IDS.LAST_UPDATE);
        
        if (element && this.state.lastUpdate) {
            element.innerHTML = `
                <span class="update-icon">🕒</span>
                <span class="update-text">آخرین به‌روزرسانی: ${formatPersianDate(this.state.lastUpdate)}</span>
            `;
        }
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Page visibility change (pause refresh when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('👁️ [DashboardCore] Page hidden, pausing refresh');
                this.stopAutoRefresh();
            } else {
                console.log('👁️ [DashboardCore] Page visible, resuming refresh');
                this.startAutoRefresh();
                // Refresh immediately when page becomes visible
                this.loadData();
            }
        });
        
        console.log('✅ [DashboardCore] Event listeners setup');
    }

    /**
     * Handle errors
     * @private
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('❌ [DashboardCore] Error:', error);
        
        const container = document.getElementById(DOM_IDS.DASHBOARD_CONTAINER);
        
        if (!container) return;
        
        container.innerHTML = `
            <div class="dashboard-wrapper">
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>داشبورد TITAN</h1>
                    </div>
                </div>
                
                <div class="dashboard-error">
                    <div class="error-icon">⚠️</div>
                    <h2>خطا در بارگذاری داشبورد</h2>
                    <p class="error-message">${error.message}</p>
                    <button class="retry-btn" onclick="window.dashboardModule?.loadData()">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Destroy dashboard instance
     * @public
     */
    destroy() {
        console.log('🗑️ [DashboardCore] Destroying instance...');
        
        // Stop auto-refresh
        this.stopAutoRefresh();
        
        // Destroy chart
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        
        // Clear state
        this.state = {
            data: null,
            loading: false,
            error: null,
            lastUpdate: null,
            initialized: false
        };
        
        // Remove global reference
        if (window.dashboardModule === this) {
            window.dashboardModule = null;
        }
        
        console.log('✅ [DashboardCore] Instance destroyed');
    }
}

// Export
export { DashboardCore };
export default DashboardCore;
