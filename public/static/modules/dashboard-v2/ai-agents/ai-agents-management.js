/**
 * AI Agents Management Page
 * Complete management interface for all AI agents including:
 * - List view with filters
 * - Search functionality
 * - Status management (enable/disable)
 * - Bulk actions
 * - Agent configuration
 */

import { API_ENDPOINTS } from '../core/constants.js';

/**
 * Fetch all AI agents
 */
async function fetchAllAgents() {
    try {
        const response = await fetch(API_ENDPOINTS.AI_AGENTS);
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('[AIAgentsManagement] Error fetching agents:', error);
        return [];
    }
}

/**
 * Update agent status
 */
async function updateAgentStatus(agentId, newStatus) {
    try {
        const response = await fetch(`${API_ENDPOINTS.AI_AGENTS}/${agentId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('[AIAgentsManagement] Error updating status:', error);
        return false;
    }
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const badges = {
        'active': '<span class="agent-status-badge active"><i class="fas fa-check-circle"></i> فعال</span>',
        'inactive': '<span class="agent-status-badge inactive"><i class="fas fa-times-circle"></i> غیرفعال</span>',
        'maintenance': '<span class="agent-status-badge maintenance"><i class="fas fa-tools"></i> در حال تعمیر</span>'
    };
    return badges[status] || status;
}

/**
 * Get type badge HTML
 */
function getTypeBadge(type) {
    const badges = {
        'analysis': '<span class="agent-type-badge analysis"><i class="fas fa-chart-line"></i> تحلیل</span>',
        'trading': '<span class="agent-type-badge trading"><i class="fas fa-exchange-alt"></i> معامله</span>',
        'risk': '<span class="agent-type-badge risk"><i class="fas fa-shield-alt"></i> ریسک</span>',
        'sentiment': '<span class="agent-type-badge sentiment"><i class="fas fa-brain"></i> احساسات</span>',
        'portfolio': '<span class="agent-type-badge portfolio"><i class="fas fa-briefcase"></i> پرتفولیو</span>'
    };
    return badges[type] || `<span class="agent-type-badge">${type}</span>`;
}

/**
 * Render management page header
 */
function renderHeader(agents) {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const inactiveAgents = agents.filter(a => a.status === 'inactive').length;
    
    return `
        <div class="management-header">
            <div class="header-title">
                <h1><i class="fas fa-robot"></i> مدیریت عوامل هوشمند</h1>
                <p class="header-subtitle">مدیریت، پیکربندی و نظارت بر تمامی عوامل هوش مصنوعی</p>
            </div>
            
            <div class="header-stats">
                <div class="stat-item">
                    <div class="stat-icon total"><i class="fas fa-layer-group"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${totalAgents}</div>
                        <div class="stat-label">کل عوامل</div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon active"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${activeAgents}</div>
                        <div class="stat-label">فعال</div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon inactive"><i class="fas fa-times-circle"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${inactiveAgents}</div>
                        <div class="stat-label">غیرفعال</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render filters and search
 */
function renderFilters() {
    return `
        <div class="management-filters">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="agent-search" placeholder="جستجو بر اساس نام، نوع یا توضیحات...">
            </div>
            
            <div class="filter-group">
                <label>وضعیت:</label>
                <select id="filter-status">
                    <option value="all">همه</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                    <option value="maintenance">در حال تعمیر</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label>نوع:</label>
                <select id="filter-type">
                    <option value="all">همه</option>
                    <option value="analysis">تحلیل</option>
                    <option value="trading">معامله</option>
                    <option value="risk">ریسک</option>
                    <option value="sentiment">احساسات</option>
                    <option value="portfolio">پرتفولیو</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label>مرتب‌سازی:</label>
                <select id="filter-sort">
                    <option value="name">نام</option>
                    <option value="status">وضعیت</option>
                    <option value="accuracy">دقت</option>
                    <option value="trades">تعداد معاملات</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Render agent card
 */
function renderAgentCard(agent) {
    const accuracy = agent.accuracy || 0;
    const totalTrades = agent.totalTrades || 0;
    const successRate = agent.successRate || 0;
    const profitLoss = agent.profitLoss || 0;
    
    const plClass = profitLoss >= 0 ? 'positive' : 'negative';
    const plSign = profitLoss >= 0 ? '+' : '';
    
    return `
        <div class="agent-card" data-agent-id="${agent.agentId}" data-status="${agent.status}" data-type="${agent.type}">
            <div class="agent-card-header">
                <div class="agent-card-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="agent-card-info">
                    <h3 class="agent-card-title">${agent.name}</h3>
                    <p class="agent-card-id">${agent.agentId}</p>
                </div>
                <div class="agent-card-actions">
                    <button class="btn-icon" title="جزئیات" onclick="window.location.hash = '/ai-agents/${agent.agentId}'">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon toggle-status-btn" data-agent-id="${agent.agentId}" data-current-status="${agent.status}" title="تغییر وضعیت">
                        <i class="fas fa-power-off"></i>
                    </button>
                </div>
            </div>
            
            <div class="agent-card-body">
                <div class="agent-badges">
                    ${getStatusBadge(agent.status)}
                    ${getTypeBadge(agent.type)}
                </div>
                
                <p class="agent-description">${agent.description || 'بدون توضیحات'}</p>
                
                <div class="agent-metrics">
                    <div class="metric">
                        <span class="metric-label">دقت:</span>
                        <span class="metric-value">${accuracy.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">معاملات:</span>
                        <span class="metric-value">${totalTrades}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">موفقیت:</span>
                        <span class="metric-value">${successRate.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">سود/زیان:</span>
                        <span class="metric-value ${plClass}">${plSign}$${profitLoss.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="agent-tech-info">
                    <span class="tech-badge"><i class="fas fa-microchip"></i> ${agent.modelProvider}</span>
                    <span class="tech-badge"><i class="fas fa-cog"></i> ${agent.modelName}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render agents grid
 */
function renderAgentsGrid(agents, filters = {}) {
    let filteredAgents = [...agents];
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
        filteredAgents = filteredAgents.filter(a => a.status === filters.status);
    }
    
    // Apply type filter
    if (filters.type && filters.type !== 'all') {
        filteredAgents = filteredAgents.filter(a => a.type === filters.type);
    }
    
    // Apply search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAgents = filteredAgents.filter(a => 
            a.name.toLowerCase().includes(searchLower) ||
            a.agentId.toLowerCase().includes(searchLower) ||
            (a.description && a.description.toLowerCase().includes(searchLower))
        );
    }
    
    // Apply sorting
    if (filters.sort) {
        switch (filters.sort) {
            case 'name':
                filteredAgents.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
                break;
            case 'status':
                filteredAgents.sort((a, b) => {
                    const order = { active: 0, inactive: 1, maintenance: 2 };
                    return order[a.status] - order[b.status];
                });
                break;
            case 'accuracy':
                filteredAgents.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
                break;
            case 'trades':
                filteredAgents.sort((a, b) => (b.totalTrades || 0) - (a.totalTrades || 0));
                break;
        }
    }
    
    if (filteredAgents.length === 0) {
        return `
            <div class="no-agents">
                <i class="fas fa-search"></i>
                <h3>هیچ عامل هوشمندی یافت نشد</h3>
                <p>فیلترها را تغییر دهید یا جستجوی دیگری امتحان کنید</p>
            </div>
        `;
    }
    
    const cardsHTML = filteredAgents.map(agent => renderAgentCard(agent)).join('');
    
    return `
        <div class="agents-grid-container">
            <div class="agents-count">
                <i class="fas fa-layer-group"></i>
                ${filteredAgents.length} عامل یافت شد
            </div>
            <div class="agents-grid">
                ${cardsHTML}
            </div>
        </div>
    `;
}

/**
 * Initialize event handlers
 */
function initEventHandlers(agents) {
    // Search handler
    const searchInput = document.getElementById('agent-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            applyFilters(agents);
        }, 300));
    }
    
    // Filter handlers
    ['filter-status', 'filter-type', 'filter-sort'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                applyFilters(agents);
            });
        }
    });
    
    // Toggle status buttons
    document.addEventListener('click', async (e) => {
        const toggleBtn = e.target.closest('.toggle-status-btn');
        if (toggleBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const agentId = toggleBtn.dataset.agentId;
            const currentStatus = toggleBtn.dataset.currentStatus;
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            
            // Show loading state
            toggleBtn.disabled = true;
            toggleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Update status
            const success = await updateAgentStatus(agentId, newStatus);
            
            if (success) {
                // Refresh the page
                renderAgentsManagementPage();
            } else {
                alert('خطا در تغییر وضعیت عامل');
                toggleBtn.disabled = false;
                toggleBtn.innerHTML = '<i class="fas fa-power-off"></i>';
            }
        }
    });
}

/**
 * Apply filters
 */
function applyFilters(agents) {
    const filters = {
        search: document.getElementById('agent-search')?.value || '',
        status: document.getElementById('filter-status')?.value || 'all',
        type: document.getElementById('filter-type')?.value || 'all',
        sort: document.getElementById('filter-sort')?.value || 'name'
    };
    
    const gridContainer = document.querySelector('.management-content');
    if (gridContainer) {
        const filtersHTML = renderFilters();
        const gridHTML = renderAgentsGrid(agents, filters);
        gridContainer.innerHTML = filtersHTML + gridHTML;
        initEventHandlers(agents);
    }
}

/**
 * Debounce utility
 */
function debounce(func, wait) {
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
 * Render complete management page
 */
export async function renderAgentsManagementPage() {
    console.log('[AIAgentsManagement] Rendering management page');
    
    const container = document.querySelector('.dashboard-content');
    if (!container) {
        console.error('[AIAgentsManagement] Container not found');
        return;
    }
    
    // Show loading
    container.innerHTML = `
        <div class="management-loading">
            <div class="loading-spinner"></div>
            <p>در حال بارگذاری عوامل هوشمند...</p>
        </div>
    `;
    
    try {
        // Fetch agents
        const agents = await fetchAllAgents();
        
        if (!agents || agents.length === 0) {
            container.innerHTML = `
                <div class="management-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>هیچ عامل هوشمندی یافت نشد</h2>
                    <p>لطفاً بعداً دوباره تلاش کنید</p>
                    <button class="btn-primary" onclick="window.location.hash = ''">بازگشت به داشبورد</button>
                </div>
            `;
            return;
        }
        
        // Render page
        container.innerHTML = `
            <div class="agents-management-page">
                <div class="management-nav">
                    <button class="back-button" onclick="window.location.hash = ''">
                        <i class="fas fa-arrow-right"></i>
                        بازگشت به داشبورد
                    </button>
                </div>
                
                ${renderHeader(agents)}
                
                <div class="management-content">
                    ${renderFilters()}
                    ${renderAgentsGrid(agents)}
                </div>
            </div>
        `;
        
        // Initialize event handlers
        initEventHandlers(agents);
        
        console.log('[AIAgentsManagement] Page rendered successfully');
    } catch (error) {
        console.error('[AIAgentsManagement] Error rendering page:', error);
        container.innerHTML = `
            <div class="management-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>خطا در بارگذاری اطلاعات</h2>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="window.location.hash = ''">بازگشت به داشبورد</button>
            </div>
        `;
    }
}

/**
 * Initialize management routing
 */
export function initManagementRouting() {
    window.addEventListener('popstate', () => {
        const hash = window.location.hash;
        if (hash === '#/ai-agents' || hash === '#/ai-agents/manage') {
            renderAgentsManagementPage();
        }
    });
    
    // Check current URL
    const hash = window.location.hash;
    if (hash === '#/ai-agents' || hash === '#/ai-agents/manage') {
        renderAgentsManagementPage();
    }
}
