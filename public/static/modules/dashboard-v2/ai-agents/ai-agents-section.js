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
    
    // Log if we have data from backend
    if (agentsData.length > 0) {
        console.log(`✅ [AIAgents] Loaded ${agentsData.length} agents from backend`);
    } else {
        console.warn('⚠️ [AIAgents] No agents data received from backend');
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
                <button class="view-all-btn" type="button">
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
                <button class="agent-detail-btn" data-agent-id="${id}" data-agent-name="${name}" data-agent-status="${statusConfig.label}" data-agent-accuracy="${accuracy}" data-agent-trades="${totalTrades}" data-agent-success="${successRate}" data-agent-desc="${description}">
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

/**
 * Initialize AI Agents event listeners
 * Must be called after DOM is rendered
 */
export function initAIAgentsEvents() {
    // Add click handlers to all agent detail buttons
    document.addEventListener('click', (e) => {
        // Check if clicked element is an agent detail button
        const btn = e.target.closest('.agent-detail-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get agent data from button attributes
            const name = btn.dataset.agentName;
            const status = btn.dataset.agentStatus;
            const accuracy = btn.dataset.agentAccuracy;
            const trades = btn.dataset.agentTrades;
            const success = btn.dataset.agentSuccess;
            const desc = btn.dataset.agentDesc;
            
            // Show agent details in alert
            alert(`جزئیات کامل عامل ${name}:

نام: ${name}
وضعیت: ${status}
دقت: ${accuracy}%
تعداد معاملات: ${trades}
نرخ موفقیت: ${success}%

توضیحات: ${desc}

💡 نکته: صفحه جزئیات کامل در حال توسعه است.`);
            
            return false;
        }
        
        // Check if clicked element is view-all button
        const viewAllBtn = e.target.closest('.view-all-btn');
        if (viewAllBtn && viewAllBtn.textContent.includes('مشاهده جزئیات')) {
            e.preventDefault();
            e.stopPropagation();
            
            alert(`📋 صفحه مدیریت عوامل هوشمند

این صفحه هنوز در دست توسعه است.

برای مدیریت کامل عوامل، به مسیر زیر مراجعه کنید:
تنظیمات > هوش مصنوعی

🚧 به زودی: صفحه اختصاصی مدیریت عوامل`);
            
            return false;
        }
    });
}

export default {
    renderAIAgentsSection,
    renderAIAgentsLoading,
    initAIAgentsEvents
};
