/**
 * System Monitor Widget
 * 🎯 TITAN Platform - Dashboard Widget
 * Version: 2.0.0
 * 
 * Displays system health and status:
 * - Overall system status
 * - Uptime
 * - Active connections
 * - Service health (API, Redis, Database)
 */

import { formatUptime, formatNumber } from '../utils/formatters.js';
import { DASHBOARD_CONFIG } from '../core/constants.js';

/**
 * Render System Monitor Widget
 * @param {Object} systemData - System data from API
 * @returns {string} HTML string for system widget
 */
export function renderSystemWidget(systemData) {
    // Validate data
    if (!systemData) {
        return renderSystemError('داده‌های سیستم موجود نیست');
    }
    
    const {
        status = 'unknown',
        uptime = 0,
        activeConnections = 0,
        apiHealth = false,
        redisHealth = false,
        dbHealth = false
    } = systemData;
    
    const statusConfig = getStatusConfig(status);
    
    return `
        <div class="dashboard-widget system-widget" id="system-widget">
            <!-- Widget Header -->
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">🖥️</span>
                    <h3>وضعیت سیستم</h3>
                </div>
                <div class="widget-actions">
                    <button class="widget-action-btn" onclick="window.dashboardModule?.refreshWidget('system')" title="به‌روزرسانی">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Widget Content -->
            <div class="widget-content">
                <!-- System Status -->
                <div class="system-status">
                    <div class="status-indicator ${statusConfig.class}">
                        <span class="status-dot"></span>
                        <span class="status-label">${statusConfig.label}</span>
                    </div>
                </div>
                
                <!-- System Metrics -->
                <div class="system-metrics">
                    <!-- Uptime -->
                    <div class="metric-item">
                        <div class="metric-icon">⏱️</div>
                        <div class="metric-content">
                            <div class="metric-label">زمان فعالیت</div>
                            <div class="metric-value">${formatUptime(uptime)}</div>
                        </div>
                    </div>
                    
                    <!-- Active Connections -->
                    <div class="metric-item">
                        <div class="metric-icon">🔌</div>
                        <div class="metric-content">
                            <div class="metric-label">اتصالات فعال</div>
                            <div class="metric-value">${formatNumber(activeConnections, 0)}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Service Health -->
                <div class="service-health">
                    <div class="health-header">
                        <span class="health-title">وضعیت سرویس‌ها</span>
                    </div>
                    <div class="health-items">
                        <!-- API Health -->
                        <div class="health-item">
                            <div class="health-label">API</div>
                            <div class="health-status ${apiHealth ? 'healthy' : 'unhealthy'}">
                                <span class="health-dot"></span>
                                <span class="health-text">${apiHealth ? 'سالم' : 'خطا'}</span>
                            </div>
                        </div>
                        
                        <!-- Redis Health -->
                        <div class="health-item">
                            <div class="health-label">Redis</div>
                            <div class="health-status ${redisHealth ? 'healthy' : 'unhealthy'}">
                                <span class="health-dot"></span>
                                <span class="health-text">${redisHealth ? 'سالم' : 'خطا'}</span>
                            </div>
                        </div>
                        
                        <!-- Database Health -->
                        <div class="health-item">
                            <div class="health-label">Database</div>
                            <div class="health-status ${dbHealth ? 'healthy' : 'unhealthy'}">
                                <span class="health-dot"></span>
                                <span class="health-text">${dbHealth ? 'سالم' : 'خطا'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Widget Footer -->
            <div class="widget-footer">
                <a href="/system-logs" class="widget-link">مشاهده لاگ‌های سیستم ←</a>
            </div>
        </div>
    `;
}

/**
 * Get status configuration
 * @param {string} status - System status
 * @returns {Object} Status config with class and label
 */
function getStatusConfig(status) {
    const configs = {
        'operational': { class: 'status-operational', label: 'عملیاتی' },
        'healthy': { class: 'status-healthy', label: 'سالم' },
        'warning': { class: 'status-warning', label: 'هشدار' },
        'degraded': { class: 'status-degraded', label: 'کاهش عملکرد' },
        'error': { class: 'status-error', label: 'خطا' },
        'down': { class: 'status-down', label: 'خاموش' },
        'unknown': { class: 'status-unknown', label: 'نامشخص' }
    };
    
    return configs[status] || configs['unknown'];
}

/**
 * Render System Widget Error State
 * @param {string} errorMessage - Error message to display
 * @returns {string} HTML string for error state
 */
function renderSystemError(errorMessage) {
    return `
        <div class="dashboard-widget system-widget widget-error" id="system-widget">
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">🖥️</span>
                    <h3>وضعیت سیستم</h3>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${errorMessage}</div>
                    <button class="retry-btn" onclick="window.dashboardModule?.refreshWidget('system')">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render System Widget Loading State
 * @returns {string} HTML string for loading state
 */
export function renderSystemLoading() {
    return `
        <div class="dashboard-widget system-widget widget-loading" id="system-widget">
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">🖥️</span>
                    <h3>وضعیت سیستم</h3>
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
    renderSystemWidget,
    renderSystemLoading
};
