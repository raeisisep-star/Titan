/**
 * Portfolio Widget
 * 🎯 TITAN Platform - Dashboard Widget
 * Version: 2.0.0
 * 
 * Displays user's portfolio information:
 * - Total balance
 * - Available & locked balance
 * - Daily/weekly/monthly changes
 */

import { formatCurrency, formatPercentage, getChangeIndicator, getChangeClass } from '../utils/formatters.js';
import { DASHBOARD_CONFIG } from '../core/constants.js';

/**
 * Render Portfolio Widget
 * @param {Object} portfolioData - Portfolio data from API
 * @returns {string} HTML string for portfolio widget
 */
export function renderPortfolioWidget(portfolioData) {
    // Validate data
    if (!portfolioData) {
        return renderPortfolioError('داده‌های پورتفولیو موجود نیست');
    }
    
    const {
        totalBalance = 0,
        availableBalance = 0,
        lockedBalance = 0,
        dailyChange = 0,
        dailyChangePercent = 0,
        weeklyChange = 0,
        monthlyChange = 0
    } = portfolioData;
    
    const changeClass = getChangeClass(dailyChange);
    const changeIndicator = getChangeIndicator(dailyChange);
    
    return `
        <div class="dashboard-widget portfolio-widget" id="portfolio-widget">
            <!-- Widget Header -->
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">💼</span>
                    <h3>پورتفولیو</h3>
                </div>
                <div class="widget-actions">
                    <button class="widget-action-btn" onclick="window.dashboardModule?.refreshWidget('portfolio')" title="به‌روزرسانی">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Widget Content -->
            <div class="widget-content">
                <!-- Total Balance Display -->
                <div class="balance-section">
                    <div class="balance-label">موجودی کل</div>
                    <div class="balance-amount">
                        <span class="amount-value">${formatCurrency(totalBalance, false)}</span>
                        <span class="amount-currency">USDT</span>
                    </div>
                </div>
                
                <!-- Daily Change -->
                <div class="change-section ${changeClass}">
                    <span class="change-indicator">${changeIndicator}</span>
                    <span class="change-value">${formatCurrency(Math.abs(dailyChange))}</span>
                    <span class="change-percentage">(${formatPercentage(dailyChangePercent, false, true)})</span>
                    <span class="change-period">امروز</span>
                </div>
                
                <!-- Balance Breakdown -->
                <div class="balance-breakdown">
                    <div class="breakdown-item">
                        <span class="breakdown-label">موجودی آزاد</span>
                        <span class="breakdown-value">${formatCurrency(availableBalance)}</span>
                    </div>
                    <div class="breakdown-divider"></div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">موجودی قفل‌شده</span>
                        <span class="breakdown-value">${formatCurrency(lockedBalance)}</span>
                    </div>
                </div>
                
                <!-- Additional Changes -->
                <div class="additional-changes">
                    <div class="change-item">
                        <span class="change-period-label">تغییرات هفتگی:</span>
                        <span class="change-value ${getChangeClass(weeklyChange)}">
                            ${getChangeIndicator(weeklyChange)} ${formatCurrency(Math.abs(weeklyChange))}
                        </span>
                    </div>
                    <div class="change-item">
                        <span class="change-period-label">تغییرات ماهانه:</span>
                        <span class="change-value ${getChangeClass(monthlyChange)}">
                            ${getChangeIndicator(monthlyChange)} ${formatCurrency(Math.abs(monthlyChange))}
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Widget Footer -->
            <div class="widget-footer">
                <a href="/portfolio" class="widget-link">مشاهده جزئیات پورتفولیو ←</a>
            </div>
        </div>
    `;
}

/**
 * Render Portfolio Widget Error State
 * @param {string} errorMessage - Error message to display
 * @returns {string} HTML string for error state
 */
function renderPortfolioError(errorMessage) {
    return `
        <div class="dashboard-widget portfolio-widget widget-error" id="portfolio-widget">
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">💼</span>
                    <h3>پورتفولیو</h3>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${errorMessage}</div>
                    <button class="retry-btn" onclick="window.dashboardModule?.refreshWidget('portfolio')">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Portfolio Widget Loading State
 * @returns {string} HTML string for loading state
 */
export function renderPortfolioLoading() {
    return `
        <div class="dashboard-widget portfolio-widget widget-loading" id="portfolio-widget">
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">💼</span>
                    <h3>پورتفولیو</h3>
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
    renderPortfolioWidget,
    renderPortfolioLoading
};
