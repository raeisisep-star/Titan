/**
 * Market Widget
 * 🎯 TITAN Platform - Dashboard Widget
 * Version: 2.0.0
 * 
 * Displays market information:
 * - BTC/USDT price and 24h change
 * - ETH/USDT price and 24h change
 * - Fear & Greed Index
 * - BTC Dominance
 */

import { formatPrice, formatPercentage, getChangeIndicator, getChangeClass, formatNumber } from '../utils/formatters.js';
import { DASHBOARD_CONFIG } from '../core/constants.js';

/**
 * Render Market Widget
 * @param {Object} marketData - Market data from API
 * @returns {string} HTML string for market widget
 */
export function renderMarketWidget(marketData) {
    // Validate data
    if (!marketData) {
        return renderMarketError('داده‌های بازار موجود نیست');
    }
    
    const {
        btcPrice = 0,
        btcChange24h = 0,
        ethPrice = 0,
        ethChange24h = 0,
        fearGreedIndex = 50,
        fearGreedLabel = 'خنثی',
        btcDominance = 0
    } = marketData;
    
    const btcChangeClass = getChangeClass(btcChange24h);
    const ethChangeClass = getChangeClass(ethChange24h);
    const fearGreedColor = getFearGreedColor(fearGreedIndex);
    
    return `
        <div class="dashboard-widget market-widget" id="market-widget">
            <!-- Widget Header -->
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">📊</span>
                    <h3>بازار</h3>
                </div>
                <div class="widget-actions">
                    <button class="widget-action-btn" onclick="window.dashboardModule?.refreshWidget('market')" title="به‌روزرسانی">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Widget Content -->
            <div class="widget-content">
                <!-- Crypto Prices -->
                <div class="crypto-prices">
                    <!-- BTC Price -->
                    <div class="price-item">
                        <div class="price-header">
                            <span class="crypto-symbol">BTC/USDT</span>
                            <span class="crypto-icon">₿</span>
                        </div>
                        <div class="price-value">
                            ${formatPrice(btcPrice, 'BTC')}
                        </div>
                        <div class="price-change ${btcChangeClass}">
                            <span class="change-indicator">${getChangeIndicator(btcChange24h)}</span>
                            <span class="change-value">${formatPercentage(btcChange24h, false, false)}</span>
                            <span class="change-period">24h</span>
                        </div>
                    </div>
                    
                    <!-- Divider -->
                    <div class="price-divider"></div>
                    
                    <!-- ETH Price -->
                    <div class="price-item">
                        <div class="price-header">
                            <span class="crypto-symbol">ETH/USDT</span>
                            <span class="crypto-icon">Ξ</span>
                        </div>
                        <div class="price-value">
                            ${formatPrice(ethPrice, 'ETH')}
                        </div>
                        <div class="price-change ${ethChangeClass}">
                            <span class="change-indicator">${getChangeIndicator(ethChange24h)}</span>
                            <span class="change-value">${formatPercentage(ethChange24h, false, false)}</span>
                            <span class="change-period">24h</span>
                        </div>
                    </div>
                </div>
                
                <!-- Market Indicators -->
                <div class="market-indicators">
                    <!-- Fear & Greed Index -->
                    <div class="indicator-item">
                        <div class="indicator-header">
                            <span class="indicator-label">شاخص ترس و طمع</span>
                            <span class="indicator-info" title="Fear & Greed Index">ℹ️</span>
                        </div>
                        <div class="indicator-value">
                            <div class="fear-greed-gauge">
                                <div class="gauge-bar">
                                    <div class="gauge-fill" style="width: ${fearGreedIndex}%; background-color: ${fearGreedColor};"></div>
                                </div>
                                <div class="gauge-labels">
                                    <span class="gauge-value">${fearGreedIndex}</span>
                                    <span class="gauge-label" style="color: ${fearGreedColor};">${fearGreedLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- BTC Dominance -->
                    <div class="indicator-item">
                        <div class="indicator-header">
                            <span class="indicator-label">تسلط بیت‌کوین</span>
                            <span class="indicator-info" title="BTC Dominance">ℹ️</span>
                        </div>
                        <div class="indicator-value">
                            <div class="dominance-display">
                                <span class="dominance-percentage">${formatNumber(btcDominance, 2)}%</span>
                                <div class="dominance-bar">
                                    <div class="dominance-fill" style="width: ${btcDominance}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Widget Footer -->
            <div class="widget-footer">
                <a href="/market" class="widget-link">مشاهده بازار کامل ←</a>
            </div>
        </div>
    `;
}

/**
 * Get Fear & Greed color based on index
 * @param {number} index - Fear & Greed Index (0-100)
 * @returns {string} Color code
 */
function getFearGreedColor(index) {
    if (index <= 25) return '#ef4444'; // Extreme Fear - Red
    if (index <= 45) return '#f59e0b'; // Fear - Orange
    if (index <= 55) return '#6b7280'; // Neutral - Gray
    if (index <= 75) return '#84cc16'; // Greed - Light Green
    return '#10b981'; // Extreme Greed - Green
}

/**
 * Render Market Widget Error State
 * @param {string} errorMessage - Error message to display
 * @returns {string} HTML string for error state
 */
function renderMarketError(errorMessage) {
    return `
        <div class="dashboard-widget market-widget widget-error" id="market-widget">
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">📊</span>
                    <h3>بازار</h3>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${errorMessage}</div>
                    <button class="retry-btn" onclick="window.dashboardModule?.refreshWidget('market')">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Market Widget Loading State
 * @returns {string} HTML string for loading state
 */
export function renderMarketLoading() {
    return `
        <div class="dashboard-widget market-widget widget-loading" id="market-widget">
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">📊</span>
                    <h3>بازار</h3>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-loading-state">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${DASHBOARD_CONFIG.LOADING.WIDGET}</div>
                </div>
            </div>
        </div>
    `;
}

export default {
    renderMarketWidget,
    renderMarketLoading
};
