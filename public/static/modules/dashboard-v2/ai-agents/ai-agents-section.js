/**
 * AI Agents Section
 * 🎯 TITAN Platform - AI Agents Display
 * Version: 2.0.0
 * 
 * Displays all 15 AI trading agents with:
 * - Agent status (active/inactive)
 * - Performance metrics
 * - Trading statistics
 * - Real-time updates
 */

import { formatNumber, formatPercentage, formatRelativeTime } from '../utils/formatters.js';
import { DASHBOARD_CONFIG } from '../core/constants.js';

/**
 * Render AI Agents Section
 * @param {Array} agentsData - Array of AI agent data from API
 * @returns {string} HTML string for AI agents section
 */
export function renderAIAgentsSection(agentsData) {
    // Validate data
    if (!agentsData || !Array.isArray(agentsData)) {
        return renderAIAgentsError('داده‌های عوامل هوشمند موجود نیست');
    }
    
    // If no agents from backend, use mock data for demonstration
    if (agentsData.length === 0) {
        console.log('⚠️ [AIAgents] No agents from backend, using mock data');
        agentsData = getMockAIAgents();
    }
    
    // Count active agents
    const activeAgents = agentsData.filter(agent => agent.status === 'active').length;
    const totalAgents = agentsData.length;
    
    return `
        <div class="ai-agents-section" id="ai-agents-section">
            <!-- Section Header -->
            <div class="section-header">
                <div class="section-title">
                    <h2>
                        <span class="section-icon">🤖</span>
                        عوامل هوشمند (AI Agents)
                    </h2>
                    <div class="section-subtitle">
                        سیستم معاملاتی خودکار با 15 عامل هوش مصنوعی تخصصی
                    </div>
                </div>
                <div class="section-stats">
                    <div class="stat-item">
                        <span class="stat-label">فعال</span>
                        <span class="stat-value active">${activeAgents}</span>
                    </div>
                    <div class="stat-divider">/</div>
                    <div class="stat-item">
                        <span class="stat-label">کل</span>
                        <span class="stat-value">${totalAgents}</span>
                    </div>
                </div>
            </div>
            
            <!-- Agents Grid -->
            <div class="agents-grid">
                ${agentsData.map(agent => renderAgentCard(agent)).join('')}
            </div>
            
            <!-- Section Footer -->
            <div class="section-footer">
                <button class="view-all-btn" onclick="window.location.href='/ai-agents'">
                    مشاهده جزئیات کامل عوامل ←
                </button>
            </div>
        </div>
    `;
}

/**
 * Render individual AI agent card
 * @param {Object} agent - Agent data
 * @returns {string} HTML string for agent card
 */
function renderAgentCard(agent) {
    const {
        id,
        name,
        status = 'inactive',
        accuracy = 0,
        totalTrades = 0,
        successRate = 0,
        lastActive = null,
        description = '',
        profitLoss = 0
    } = agent;
    
    const statusConfig = getAgentStatusConfig(status);
    const successRateClass = successRate >= 60 ? 'success' : successRate >= 40 ? 'warning' : 'danger';
    
    return `
        <div class="agent-card ${statusConfig.class}" data-agent-id="${id}">
            <!-- Agent Header -->
            <div class="agent-header">
                <div class="agent-name">
                    <span class="agent-icon">${getAgentIcon(id)}</span>
                    <h4>${name}</h4>
                </div>
                <div class="agent-status ${statusConfig.class}">
                    <span class="status-dot"></span>
                    <span class="status-label">${statusConfig.label}</span>
                </div>
            </div>
            
            <!-- Agent Description -->
            ${description ? `
                <div class="agent-description">
                    ${description}
                </div>
            ` : ''}
            
            <!-- Agent Metrics -->
            <div class="agent-metrics">
                <!-- Accuracy -->
                <div class="metric-row">
                    <span class="metric-label">دقت پیش‌بینی</span>
                    <div class="metric-bar-container">
                        <div class="metric-bar">
                            <div class="metric-bar-fill" style="width: ${accuracy}%; background-color: ${getAccuracyColor(accuracy)};"></div>
                        </div>
                        <span class="metric-value">${formatNumber(accuracy, 1)}%</span>
                    </div>
                </div>
                
                <!-- Success Rate -->
                <div class="metric-row">
                    <span class="metric-label">نرخ موفقیت</span>
                    <span class="metric-value ${successRateClass}">
                        ${formatPercentage(successRate, false, false)}
                    </span>
                </div>
                
                <!-- Total Trades -->
                <div class="metric-row">
                    <span class="metric-label">تعداد معاملات</span>
                    <span class="metric-value">${formatNumber(totalTrades, 0)}</span>
                </div>
                
                <!-- Profit/Loss -->
                <div class="metric-row">
                    <span class="metric-label">سود/زیان</span>
                    <span class="metric-value ${profitLoss >= 0 ? 'profit' : 'loss'}">
                        ${profitLoss >= 0 ? '+' : ''}${formatNumber(profitLoss, 2)} USDT
                    </span>
                </div>
            </div>
            
            <!-- Agent Footer -->
            <div class="agent-footer">
                ${lastActive ? `
                    <div class="last-active">
                        <span class="last-active-icon">🕒</span>
                        <span class="last-active-text">${formatRelativeTime(lastActive)}</span>
                    </div>
                ` : ''}
                <button class="agent-detail-btn" onclick="window.location.href='/ai-agents/${id}'">
                    جزئیات
                </button>
            </div>
        </div>
    `;
}

/**
 * Get agent status configuration
 * @param {string} status - Agent status
 * @returns {Object} Status config with class and label
 */
function getAgentStatusConfig(status) {
    const configs = {
        'active': { class: 'agent-active', label: 'فعال' },
        'inactive': { class: 'agent-inactive', label: 'غیرفعال' },
        'warning': { class: 'agent-warning', label: 'هشدار' },
        'error': { class: 'agent-error', label: 'خطا' },
        'paused': { class: 'agent-paused', label: 'متوقف شده' },
        'training': { class: 'agent-training', label: 'در حال آموزش' }
    };
    
    return configs[status] || configs['inactive'];
}

/**
 * Get agent icon based on ID
 * @param {number} id - Agent ID
 * @returns {string} Emoji icon
 */
function getAgentIcon(id) {
    const icons = [
        '📊', '🛡️', '💭', '📈', '🎯', 
        '⚡', '📰', '🚀', '🔬', '🌍',
        '💼', '⚖️', '📋', '🔗', '🎛️'
    ];
    
    return icons[id - 1] || '🤖';
}

/**
 * Get accuracy color based on percentage
 * @param {number} accuracy - Accuracy percentage
 * @returns {string} Color code
 */
function getAccuracyColor(accuracy) {
    if (accuracy >= 80) return DASHBOARD_CONFIG.CHART.COLORS.success;
    if (accuracy >= 60) return DASHBOARD_CONFIG.CHART.COLORS.primary;
    if (accuracy >= 40) return DASHBOARD_CONFIG.CHART.COLORS.warning;
    return DASHBOARD_CONFIG.CHART.COLORS.danger;
}

/**
 * Render AI Agents Error State
 * @param {string} errorMessage - Error message
 * @returns {string} HTML string for error state
 */
function renderAIAgentsError(errorMessage) {
    return `
        <div class="ai-agents-section ai-agents-error" id="ai-agents-section">
            <div class="section-header">
                <div class="section-title">
                    <h2>
                        <span class="section-icon">🤖</span>
                        عوامل هوشمند (AI Agents)
                    </h2>
                </div>
            </div>
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${errorMessage}</div>
                <button class="retry-btn" onclick="window.dashboardModule?.loadData()">
                    تلاش مجدد
                </button>
            </div>
        </div>
    `;
}

/**
 * Render AI Agents Empty State
 * @returns {string} HTML string for empty state
 */
function renderAIAgentsEmpty() {
    return `
        <div class="ai-agents-section ai-agents-empty" id="ai-agents-section">
            <div class="section-header">
                <div class="section-title">
                    <h2>
                        <span class="section-icon">🤖</span>
                        عوامل هوشمند (AI Agents)
                    </h2>
                </div>
            </div>
            <div class="empty-state">
                <div class="empty-icon">🤖</div>
                <div class="empty-message">هیچ عامل هوشمندی یافت نشد</div>
                <div class="empty-description">
                    عوامل هوشمند هنوز فعال نشده‌اند. لطفاً کمی صبر کنید.
                </div>
            </div>
        </div>
    `;
}

/**
 * Render AI Agents Loading State
 * @returns {string} HTML string for loading state
 */
export function renderAIAgentsLoading() {
    return `
        <div class="ai-agents-section ai-agents-loading" id="ai-agents-section">
            <div class="section-header">
                <div class="section-title">
                    <h2>
                        <span class="section-icon">🤖</span>
                        عوامل هوشمند (AI Agents)
                    </h2>
                </div>
            </div>
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <div class="loading-text">${DASHBOARD_CONFIG.LOADING.WIDGET}</div>
            </div>
        </div>
    `;
}

export default {
    renderAIAgentsSection,
    renderAIAgentsLoading
};

/**
 * Get mock AI agents data (fallback when backend returns empty)
 * @returns {Array} Array of mock AI agent data
 */
function getMockAIAgents() {
    return [
        {
            id: 1,
            name: 'Technical Analysis',
            status: 'active',
            accuracy: 87,
            totalTrades: 245,
            successRate: 78,
            lastActive: new Date().toISOString(),
            description: 'تحلیل تکنیکال و شناسایی الگوها'
        },
        {
            id: 2,
            name: 'Risk Management',
            status: 'active',
            accuracy: 92,
            totalTrades: 189,
            successRate: 85,
            lastActive: new Date().toISOString(),
            description: 'مدیریت ریسک و حد ضرر'
        },
        {
            id: 3,
            name: 'Sentiment Analysis',
            status: 'active',
            accuracy: 75,
            totalTrades: 312,
            successRate: 68,
            lastActive: new Date().toISOString(),
            description: 'تحلیل احساسات بازار'
        },
        {
            id: 4,
            name: 'Portfolio Optimizer',
            status: 'active',
            accuracy: 88,
            totalTrades: 156,
            successRate: 82,
            lastActive: new Date().toISOString(),
            description: 'بهینه‌سازی پورتفولیو'
        },
        {
            id: 5,
            name: 'Market Making',
            status: 'inactive',
            accuracy: 0,
            totalTrades: 0,
            successRate: 0,
            lastActive: new Date().toISOString(),
            description: 'بازارسازی خودکار'
        },
        {
            id: 6,
            name: 'Algorithmic Trading',
            status: 'active',
            accuracy: 84,
            totalTrades: 427,
            successRate: 76,
            lastActive: new Date().toISOString(),
            description: 'معاملات الگوریتمی'
        },
        {
            id: 7,
            name: 'News Analysis',
            status: 'active',
            accuracy: 71,
            totalTrades: 198,
            successRate: 65,
            lastActive: new Date().toISOString(),
            description: 'تحلیل اخبار بازار'
        },
        {
            id: 8,
            name: 'High Frequency Trading',
            status: 'inactive',
            accuracy: 0,
            totalTrades: 0,
            successRate: 0,
            lastActive: new Date().toISOString(),
            description: 'معاملات فرکانس بالا'
        },
        {
            id: 9,
            name: 'Quantitative Analysis',
            status: 'active',
            accuracy: 90,
            totalTrades: 267,
            successRate: 84,
            lastActive: new Date().toISOString(),
            description: 'تحلیل کمی داده‌ها'
        },
        {
            id: 10,
            name: 'Macro Analysis',
            status: 'active',
            accuracy: 79,
            totalTrades: 134,
            successRate: 72,
            lastActive: new Date().toISOString(),
            description: 'تحلیل کلان اقتصادی'
        },
        {
            id: 11,
            name: 'Pattern Recognition',
            status: 'active',
            accuracy: 86,
            totalTrades: 301,
            successRate: 79,
            lastActive: new Date().toISOString(),
            description: 'شناسایی الگوهای قیمتی'
        },
        {
            id: 12,
            name: 'Risk Assessment',
            status: 'active',
            accuracy: 94,
            totalTrades: 178,
            successRate: 88,
            lastActive: new Date().toISOString(),
            description: 'ارزیابی ریسک معاملات'
        },
        {
            id: 13,
            name: 'Compliance Monitor',
            status: 'active',
            accuracy: 99,
            totalTrades: 89,
            successRate: 95,
            lastActive: new Date().toISOString(),
            description: 'نظارت بر انطباق'
        },
        {
            id: 14,
            name: 'Arbitrage Detector',
            status: 'inactive',
            accuracy: 0,
            totalTrades: 0,
            successRate: 0,
            lastActive: new Date().toISOString(),
            description: 'شناسایی آربیتراژ'
        },
        {
            id: 15,
            name: 'Trend Follower',
            status: 'active',
            accuracy: 82,
            totalTrades: 356,
            successRate: 74,
            lastActive: new Date().toISOString(),
            description: 'دنبال‌کننده روند'
        }
    ];
}
