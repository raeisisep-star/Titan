/**
 * AI Agent Detail Page
 * Displays comprehensive information about a specific AI agent including:
 * - Agent overview and status
 * - Performance metrics and charts
 * - Trade history
 * - Recent decisions
 */

import { API_ENDPOINTS } from '../core/constants.js';

/**
 * Fetch agent details from API
 */
async function fetchAgentDetails(agentId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.AI_AGENTS}/${agentId}`);
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error('[AIAgentDetail] Error fetching agent:', error);
        return null;
    }
}

/**
 * Fetch agent statistics
 */
async function fetchAgentStats(agentId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.AI_AGENTS}/${agentId}/stats`);
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error('[AIAgentDetail] Error fetching stats:', error);
        return null;
    }
}

/**
 * Fetch agent trades
 */
async function fetchAgentTrades(agentId, limit = 20, offset = 0, status = 'all') {
    try {
        const params = new URLSearchParams({ limit, offset, status });
        const response = await fetch(`${API_ENDPOINTS.AI_AGENTS}/${agentId}/trades?${params}`);
        const result = await response.json();
        return result.success ? result : null;
    } catch (error) {
        console.error('[AIAgentDetail] Error fetching trades:', error);
        return null;
    }
}

/**
 * Fetch agent performance history
 */
async function fetchAgentPerformance(agentId, period = 'daily', days = 7) {
    try {
        const params = new URLSearchParams({ period, days });
        const response = await fetch(`${API_ENDPOINTS.AI_AGENTS}/${agentId}/performance?${params}`);
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error('[AIAgentDetail] Error fetching performance:', error);
        return null;
    }
}

/**
 * Render agent header section
 */
function renderAgentHeader(agent, stats) {
    const statusBadge = agent.status === 'active' 
        ? '<span class="status-badge status-active">فعال</span>'
        : '<span class="status-badge status-inactive">غیرفعال</span>';
    
    const winRate = stats?.trades?.winRate || 0;
    const totalProfitLoss = stats?.trades?.totalProfitLoss || 0;
    const plClass = totalProfitLoss >= 0 ? 'positive' : 'negative';
    const plSign = totalProfitLoss >= 0 ? '+' : '';
    
    return `
        <div class="agent-detail-header">
            <div class="agent-header-top">
                <button class="back-button" onclick="window.history.back()">
                    <i class="fas fa-arrow-right"></i>
                    بازگشت
                </button>
            </div>
            
            <div class="agent-header-main">
                <div class="agent-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="agent-info">
                    <h1>${agent.name}</h1>
                    <p class="agent-id">${agent.agentId} • ${agent.type}</p>
                    <p class="agent-description">${agent.description || 'بدون توضیحات'}</p>
                    <div class="agent-meta">
                        ${statusBadge}
                        <span class="meta-item">
                            <i class="fas fa-microchip"></i>
                            ${agent.modelProvider} / ${agent.modelName}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-clock"></i>
                            آخرین فعالیت: ${agent.lastActive ? new Date(agent.lastActive).toLocaleDateString('fa-IR') : 'نامشخص'}
                        </span>
                    </div>
                </div>
                <div class="agent-quick-stats">
                    <div class="quick-stat">
                        <div class="quick-stat-label">نرخ موفقیت</div>
                        <div class="quick-stat-value ${winRate >= 60 ? 'positive' : 'neutral'}">${winRate.toFixed(1)}%</div>
                    </div>
                    <div class="quick-stat">
                        <div class="quick-stat-label">کل سود/زیان</div>
                        <div class="quick-stat-value ${plClass}">${plSign}$${totalProfitLoss.toLocaleString()}</div>
                    </div>
                    <div class="quick-stat">
                        <div class="quick-stat-label">تعداد معاملات</div>
                        <div class="quick-stat-value">${stats?.trades?.total || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render performance statistics cards
 */
function renderStatsCards(stats) {
    if (!stats) return '<p>در حال بارگذاری آمار...</p>';
    
    const { trades, decisions, recentPerformance } = stats;
    
    return `
        <div class="stats-grid">
            <!-- Trading Statistics -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3><i class="fas fa-chart-line"></i> آمار معاملات</h3>
                </div>
                <div class="stat-card-body">
                    <div class="stat-row">
                        <span>کل معاملات:</span>
                        <strong>${trades.total}</strong>
                    </div>
                    <div class="stat-row">
                        <span>معاملات موفق:</span>
                        <strong class="positive">${trades.winning}</strong>
                    </div>
                    <div class="stat-row">
                        <span>معاملات ناموفق:</span>
                        <strong class="negative">${trades.losing}</strong>
                    </div>
                    <div class="stat-row">
                        <span>معاملات باز:</span>
                        <strong class="neutral">${trades.open}</strong>
                    </div>
                    <div class="stat-row highlight">
                        <span>نرخ موفقیت:</span>
                        <strong class="${trades.winRate >= 60 ? 'positive' : 'neutral'}">${trades.winRate.toFixed(2)}%</strong>
                    </div>
                </div>
            </div>
            
            <!-- Financial Statistics -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3><i class="fas fa-dollar-sign"></i> آمار مالی</h3>
                </div>
                <div class="stat-card-body">
                    <div class="stat-row">
                        <span>کل سود/زیان:</span>
                        <strong class="${trades.totalProfitLoss >= 0 ? 'positive' : 'negative'}">
                            ${trades.totalProfitLoss >= 0 ? '+' : ''}$${trades.totalProfitLoss.toLocaleString()}
                        </strong>
                    </div>
                    <div class="stat-row">
                        <span>میانگین سود:</span>
                        <strong>${trades.avgProfitLoss >= 0 ? '+' : ''}$${trades.avgProfitLoss.toLocaleString()}</strong>
                    </div>
                    <div class="stat-row">
                        <span>بیشترین سود:</span>
                        <strong class="positive">+$${trades.maxProfit.toLocaleString()}</strong>
                    </div>
                    <div class="stat-row">
                        <span>بیشترین ضرر:</span>
                        <strong class="negative">$${trades.maxLoss.toLocaleString()}</strong>
                    </div>
                    <div class="stat-row">
                        <span>حجم کل:</span>
                        <strong>$${trades.totalVolume.toLocaleString()}</strong>
                    </div>
                </div>
            </div>
            
            <!-- Decision Statistics -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3><i class="fas fa-brain"></i> تصمیمات (30 روز)</h3>
                </div>
                <div class="stat-card-body">
                    <div class="stat-row">
                        <span>کل تصمیمات:</span>
                        <strong>${decisions.total}</strong>
                    </div>
                    <div class="stat-row">
                        <span>اجرا شده:</span>
                        <strong class="positive">${decisions.executed}</strong>
                    </div>
                    <div class="stat-row">
                        <span>میانگین اطمینان:</span>
                        <strong>${(decisions.avgConfidence * 100).toFixed(1)}%</strong>
                    </div>
                    <div class="stat-row">
                        <span>نرخ اجرا:</span>
                        <strong>
                            ${decisions.total > 0 ? ((decisions.executed / decisions.total) * 100).toFixed(1) : 0}%
                        </strong>
                    </div>
                </div>
            </div>
            
            <!-- Confidence Statistics -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3><i class="fas fa-percentage"></i> میزان اطمینان</h3>
                </div>
                <div class="stat-card-body">
                    <div class="stat-row">
                        <span>میانگین اطمینان معاملات:</span>
                        <strong>${(trades.avgConfidence * 100).toFixed(1)}%</strong>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${trades.avgConfidence * 100}%"></div>
                    </div>
                    <div class="confidence-legend">
                        <span class="legend-item">
                            <span class="legend-color low"></span>
                            <span>کم (&lt;60%)</span>
                        </span>
                        <span class="legend-item">
                            <span class="legend-color medium"></span>
                            <span>متوسط (60-80%)</span>
                        </span>
                        <span class="legend-item">
                            <span class="legend-color high"></span>
                            <span>بالا (&gt;80%)</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render recent performance chart
 */
function renderPerformanceChart(recentPerformance) {
    if (!recentPerformance || recentPerformance.length === 0) {
        return '<p class="no-data">داده‌ای برای نمایش وجود ندارد</p>';
    }
    
    const maxProfit = Math.max(...recentPerformance.map(p => p.profitLoss));
    const minProfit = Math.min(...recentPerformance.map(p => p.profitLoss));
    const range = maxProfit - minProfit || 1;
    
    const bars = recentPerformance.reverse().map(perf => {
        const height = Math.abs(perf.profitLoss) / range * 100;
        const isPositive = perf.profitLoss >= 0;
        const color = isPositive ? '#10b981' : '#ef4444';
        
        return `
            <div class="chart-bar-container" title="تاریخ: ${new Date(perf.date).toLocaleDateString('fa-IR')}">
                <div class="chart-bar ${isPositive ? 'positive' : 'negative'}" 
                     style="height: ${height}%; background-color: ${color}">
                    <span class="bar-value">${isPositive ? '+' : ''}$${perf.profitLoss.toFixed(0)}</span>
                </div>
                <div class="chart-label">${new Date(perf.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="performance-chart">
            <div class="chart-header">
                <h3><i class="fas fa-chart-bar"></i> عملکرد 7 روز اخیر</h3>
            </div>
            <div class="chart-body">
                ${bars}
            </div>
        </div>
    `;
}

/**
 * Render trades table
 */
function renderTradesTable(tradesResult) {
    if (!tradesResult || !tradesResult.data || tradesResult.data.length === 0) {
        return `
            <div class="trades-section">
                <div class="section-header">
                    <h3><i class="fas fa-exchange-alt"></i> تاریخچه معاملات</h3>
                </div>
                <p class="no-data">هیچ معامله‌ای یافت نشد</p>
            </div>
        `;
    }
    
    const trades = tradesResult.data;
    
    const tradesRows = trades.map(trade => {
        const statusBadge = {
            'open': '<span class="trade-status open">باز</span>',
            'closed': '<span class="trade-status closed">بسته</span>',
            'cancelled': '<span class="trade-status cancelled">لغو شده</span>',
            'failed': '<span class="trade-status failed">ناموفق</span>'
        }[trade.status] || trade.status;
        
        const sideBadge = trade.side === 'buy' 
            ? '<span class="trade-side buy">خرید</span>'
            : '<span class="trade-side sell">فروش</span>';
        
        const plDisplay = trade.profitLoss !== null
            ? `<span class="trade-pl ${trade.profitLoss >= 0 ? 'positive' : 'negative'}">
                ${trade.profitLoss >= 0 ? '+' : ''}$${trade.profitLoss.toFixed(2)} 
                (${trade.profitLossPercent >= 0 ? '+' : ''}${trade.profitLossPercent.toFixed(2)}%)
               </span>`
            : '<span class="trade-pl neutral">-</span>';
        
        return `
            <tr>
                <td>${new Date(trade.openedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td><strong>${trade.symbol}</strong></td>
                <td>${sideBadge}</td>
                <td>${trade.quantity.toFixed(4)}</td>
                <td>$${trade.entryPrice.toFixed(2)}</td>
                <td>${trade.exitPrice ? '$' + trade.exitPrice.toFixed(2) : '-'}</td>
                <td>${plDisplay}</td>
                <td>${statusBadge}</td>
                <td><span class="confidence-badge" style="background-color: ${getConfidenceColor(trade.confidence)}">${(trade.confidence * 100).toFixed(0)}%</span></td>
                <td class="trade-strategy">${trade.strategy || '-'}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <div class="trades-section">
            <div class="section-header">
                <h3><i class="fas fa-exchange-alt"></i> تاریخچه معاملات</h3>
                <span class="trades-count">${tradesResult.meta.total} معامله</span>
            </div>
            <div class="table-responsive">
                <table class="trades-table">
                    <thead>
                        <tr>
                            <th>تاریخ</th>
                            <th>نماد</th>
                            <th>نوع</th>
                            <th>مقدار</th>
                            <th>قیمت ورود</th>
                            <th>قیمت خروج</th>
                            <th>سود/زیان</th>
                            <th>وضعیت</th>
                            <th>اطمینان</th>
                            <th>استراتژی</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tradesRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Get confidence color based on value
 */
function getConfidenceColor(confidence) {
    if (confidence >= 0.8) return '#10b981'; // green
    if (confidence >= 0.6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
}

/**
 * Render complete agent detail page
 */
export async function renderAgentDetailPage(agentId) {
    console.log('[AIAgentDetail] Rendering page for agent:', agentId);
    
    // Show loading state
    const container = document.querySelector('.dashboard-content');
    if (!container) {
        console.error('[AIAgentDetail] Container not found');
        return;
    }
    
    container.innerHTML = `
        <div class="agent-detail-loading">
            <div class="loading-spinner"></div>
            <p>در حال بارگذاری اطلاعات عامل هوشمند...</p>
        </div>
    `;
    
    try {
        // Fetch all data concurrently
        const [agent, stats, tradesResult, performance] = await Promise.all([
            fetchAgentDetails(agentId),
            fetchAgentStats(agentId),
            fetchAgentTrades(agentId, 20, 0, 'all'),
            fetchAgentPerformance(agentId, 'daily', 7)
        ]);
        
        if (!agent) {
            container.innerHTML = `
                <div class="agent-detail-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>عامل هوشمند یافت نشد</h2>
                    <p>شناسه عامل: ${agentId}</p>
                    <button class="btn-primary" onclick="window.history.back()">بازگشت</button>
                </div>
            `;
            return;
        }
        
        // Render complete page
        container.innerHTML = `
            <div class="agent-detail-page">
                ${renderAgentHeader(agent, stats)}
                
                <div class="agent-detail-content">
                    ${renderStatsCards(stats)}
                    
                    ${stats && stats.recentPerformance ? renderPerformanceChart(stats.recentPerformance) : ''}
                    
                    ${renderTradesTable(tradesResult)}
                </div>
            </div>
        `;
        
        console.log('[AIAgentDetail] Page rendered successfully');
    } catch (error) {
        console.error('[AIAgentDetail] Error rendering page:', error);
        container.innerHTML = `
            <div class="agent-detail-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>خطا در بارگذاری اطلاعات</h2>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="window.history.back()">بازگشت</button>
            </div>
        `;
    }
}

/**
 * Initialize agent detail page routing
 */
export function initAgentDetailRouting() {
    // Listen for URL changes
    window.addEventListener('popstate', () => {
        const hash = window.location.hash;
        if (hash.startsWith('#/ai-agents/')) {
            const agentId = hash.replace('#/ai-agents/', '');
            renderAgentDetailPage(agentId);
        }
    });
    
    // Check current URL
    const hash = window.location.hash;
    if (hash.startsWith('#/ai-agents/')) {
        const agentId = hash.replace('#/ai-agents/', '');
        renderAgentDetailPage(agentId);
    }
}
