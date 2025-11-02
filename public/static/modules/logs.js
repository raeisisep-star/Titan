// Logs Module for Titan Trading System
// Real-time system logs monitoring and analysis
// Phase 3.4: FE Integration (No UI Rewrite)

class LogsModule {
    constructor() {
        this.logs = [];
        this.errors = [];
        this.stats = null;
        this.filters = {
            level: 'all',
            search: '',
            limit: 100
        };
        this.isLoading = false;
        this.autoRefreshInterval = null;
        this.isAutoRefreshEnabled = true;
        this.refreshIntervalMs = 10000; // 10 seconds
        
        // Log level configuration
        this.levelConfig = {
            60: { name: 'fatal', icon: '💀', color: '#DC2626', bgColor: '#7F1D1D' },
            50: { name: 'error', icon: '❌', color: '#EF4444', bgColor: '#991B1B' },
            40: { name: 'warn', icon: '⚠️', color: '#F59E0B', bgColor: '#92400E' },
            30: { name: 'info', icon: 'ℹ️', color: '#3B82F6', bgColor: '#1E40AF' },
            20: { name: 'debug', icon: '🐛', color: '#8B5CF6', bgColor: '#5B21B6' },
            10: { name: 'trace', icon: '🔍', color: '#6B7280', bgColor: '#374151' }
        };
    }

    async initialize() {
        console.log('📊 Initializing Logs module...');
        
        try {
            // Load initial data
            await this.fetchAllData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start auto-refresh
            if (this.isAutoRefreshEnabled) {
                this.startAutoRefresh();
            }
            
            console.log('✅ Logs module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing logs module:', error);
            throw error;
        }
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Logs Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-list-alt ml-3"></i>
                        لاگ‌های سیستم
                    </h2>
                    <p class="text-gray-400 mt-1">مشاهده و تحلیل لاگ‌های real-time سیستم TITAN</p>
                </div>
                <div class="flex items-center space-x-3 space-x-reverse">
                    <button id="logs-refresh-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition">
                        <i class="fas fa-sync-alt ml-2"></i>
                        بروزرسانی
                    </button>
                    <button id="logs-auto-refresh-btn" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition">
                        <i class="fas fa-pause ml-2"></i>
                        <span id="auto-refresh-text">توقف خودکار</span>
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="logs-stats-cards">
                <!-- Stats will be rendered here -->
            </div>

            <!-- Filters -->
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            <i class="fas fa-filter ml-2"></i>
                            سطح لاگ
                        </label>
                        <select id="logs-level-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
                            <option value="all">همه</option>
                            <option value="fatal">Fatal</option>
                            <option value="error">Error</option>
                            <option value="warn">Warning</option>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                            <option value="trace">Trace</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            <i class="fas fa-search ml-2"></i>
                            جست‌وجو
                        </label>
                        <input type="text" id="logs-search-input" placeholder="جست‌وجو در پیام‌ها..." 
                               class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            <i class="fas fa-list-ol ml-2"></i>
                            تعداد نمایش
                        </label>
                        <select id="logs-limit-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
                            <option value="50">50</option>
                            <option value="100" selected>100</option>
                            <option value="200">200</option>
                            <option value="500">500</option>
                        </select>
                    </div>
                </div>
                <div class="mt-3 text-sm text-gray-400 flex items-center">
                    <i class="fas fa-clock ml-2"></i>
                    آخرین بروزرسانی: <span id="logs-last-refresh" class="mr-2 font-mono">-</span>
                </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-700">
                <div class="flex space-x-4 space-x-reverse">
                    <button class="logs-tab-button px-4 py-2 text-white border-b-2 border-blue-500 transition" data-tab="logs">
                        <i class="fas fa-file-alt ml-2"></i>
                        لاگ‌های اخیر
                    </button>
                    <button class="logs-tab-button px-4 py-2 text-gray-400 border-b-2 border-transparent hover:text-white transition" data-tab="errors">
                        <i class="fas fa-exclamation-circle ml-2"></i>
                        خطاها
                        <span id="logs-error-count" class="mr-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">0</span>
                    </button>
                </div>
            </div>

            <!-- Logs Tab -->
            <div id="logs-tab-content" class="logs-tab-panel">
                <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div id="logs-container" class="space-y-2 max-h-screen overflow-y-auto">
                        <div class="text-center text-gray-400 py-8">
                            <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
                            <p>در حال بارگذاری لاگ‌ها...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Errors Tab -->
            <div id="errors-tab-content" class="logs-tab-panel hidden">
                <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div id="errors-container" class="space-y-2 max-h-screen overflow-y-auto">
                        <!-- Errors will be rendered here -->
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('logs-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefresh());
        }

        // Auto-refresh toggle
        const autoRefreshBtn = document.getElementById('logs-auto-refresh-btn');
        if (autoRefreshBtn) {
            autoRefreshBtn.addEventListener('click', () => this.toggleAutoRefresh());
        }

        // Level filter
        const levelFilter = document.getElementById('logs-level-filter');
        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                this.filters.level = e.target.value;
                this.handleRefresh();
            });
        }

        // Search input with debounce
        const searchInput = document.getElementById('logs-search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.handleRefresh();
                }, 500);
            });
        }

        // Limit filter
        const limitFilter = document.getElementById('logs-limit-filter');
        if (limitFilter) {
            limitFilter.addEventListener('change', (e) => {
                this.filters.limit = parseInt(e.target.value);
                this.handleRefresh();
            });
        }

        // Tab switching
        document.querySelectorAll('.logs-tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    async fetchAllData() {
        this.isLoading = true;
        try {
            await Promise.all([
                this.fetchRecentLogs(),
                this.fetchErrors(),
                this.fetchStats()
            ]);
            this.renderAll();
        } catch (error) {
            console.error('Error fetching logs data:', error);
            this.showError('خطا در دریافت داده‌ها');
        } finally {
            this.isLoading = false;
        }
    }

    async fetchRecentLogs() {
        try {
            const params = new URLSearchParams({
                limit: this.filters.limit,
                level: this.filters.level,
                search: this.filters.search
            });
            
            const response = await axios.get(`/api/logs/recent?${params}`, {
                headers: this.getAuthHeaders()
            });
            
            if (response.data.success) {
                this.logs = response.data.data.logs || [];
                this.updateLastRefreshTime();
            }
        } catch (error) {
            console.error('Error fetching recent logs:', error);
            this.logs = [];
        }
    }

    async fetchErrors() {
        try {
            const response = await axios.get('/api/logs/errors?limit=50', {
                headers: this.getAuthHeaders()
            });
            
            if (response.data.success) {
                this.errors = response.data.data.errors || [];
            }
        } catch (error) {
            console.error('Error fetching errors:', error);
            this.errors = [];
        }
    }

    async fetchStats() {
        try {
            const response = await axios.get('/api/logs/stats', {
                headers: this.getAuthHeaders()
            });
            
            if (response.data.success) {
                this.stats = response.data.data;
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            this.stats = null;
        }
    }

    renderAll() {
        this.renderStats();
        this.renderLogs();
        this.renderErrors();
    }

    renderStats() {
        const container = document.getElementById('logs-stats-cards');
        if (!container || !this.stats) return;
        
        const totalErrors = (this.stats.byLevel?.error || 0) + (this.stats.byLevel?.fatal || 0);
        const totalWarnings = this.stats.byLevel?.warn || 0;
        const totalInfo = this.stats.byLevel?.info || 0;
        
        container.innerHTML = `
            <div class="bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-lg text-white border border-red-500/30">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm opacity-80">خطاها</p>
                        <p class="text-3xl font-bold mt-1">${totalErrors}</p>
                    </div>
                    <i class="fas fa-times-circle text-4xl opacity-50"></i>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-yellow-600 to-yellow-800 p-4 rounded-lg text-white border border-yellow-500/30">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm opacity-80">هشدارها</p>
                        <p class="text-3xl font-bold mt-1">${totalWarnings}</p>
                    </div>
                    <i class="fas fa-exclamation-triangle text-4xl opacity-50"></i>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-lg text-white border border-blue-500/30">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm opacity-80">اطلاعات</p>
                        <p class="text-3xl font-bold mt-1">${totalInfo}</p>
                    </div>
                    <i class="fas fa-info-circle text-4xl opacity-50"></i>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-lg text-white border border-green-500/30">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm opacity-80">حجم فایل</p>
                        <p class="text-2xl font-bold mt-1">${this.stats.files?.main?.size || '0 B'}</p>
                    </div>
                    <i class="fas fa-database text-4xl opacity-50"></i>
                </div>
            </div>
        `;
        
        // Update error count badge
        const errorCountBadge = document.getElementById('logs-error-count');
        if (errorCountBadge) {
            errorCountBadge.textContent = this.errors.length;
        }
    }

    renderLogs() {
        const container = document.getElementById('logs-container');
        if (!container) return;
        
        if (this.logs.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-inbox text-3xl mb-3"></i>
                    <p>لاگی برای نمایش وجود ندارد</p>
                </div>
            `;
            return;
        }
        
        const logsHTML = this.logs.map(log => this.renderLogItem(log)).join('');
        container.innerHTML = logsHTML;
    }

    renderLogItem(log) {
        const level = typeof log.level === 'number' ? log.level : 30;
        const config = this.levelConfig[level] || this.levelConfig[30];
        const time = new Date(log.time).toLocaleString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        return `
            <div class="log-item bg-gray-900 p-3 rounded-lg border-r-4 hover:bg-gray-800 transition" style="border-color: ${config.color}">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 space-x-reverse flex-1">
                        <span class="text-2xl" title="${config.name}">${config.icon}</span>
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 space-x-reverse mb-1">
                                <span class="px-2 py-1 rounded text-xs font-mono" style="background-color: ${config.bgColor}; color: ${config.color}">
                                    ${config.name.toUpperCase()}
                                </span>
                                <span class="text-gray-500 text-sm">${log.service || 'titan-backend'}</span>
                                <span class="text-gray-600 text-xs font-mono">${time}</span>
                            </div>
                            <p class="text-white">${this.escapeHtml(log.msg || 'No message')}</p>
                            ${log.err ? `<p class="text-red-400 text-sm mt-1">⚠️ ${this.escapeHtml(log.err.message)}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderErrors() {
        const container = document.getElementById('errors-container');
        if (!container) return;
        
        if (this.errors.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-check-circle text-3xl mb-3 text-green-400"></i>
                    <p>خطایی ثبت نشده است</p>
                </div>
            `;
            return;
        }
        
        const errorsHTML = this.errors.map(error => `
            <div class="error-item bg-red-900/20 p-3 rounded-lg border border-red-500/30 hover:bg-red-900/30 transition">
                <div class="flex items-start space-x-3 space-x-reverse">
                    <i class="fas fa-exclamation-circle text-red-500 mt-1"></i>
                    <div class="flex-1">
                        <p class="text-white">${this.escapeHtml(error.message)}</p>
                        <p class="text-gray-500 text-xs mt-1">${error.timestamp}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = errorsHTML;
    }

    async handleRefresh() {
        const refreshBtn = document.getElementById('logs-refresh-btn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>در حال بروزرسانی...';
            refreshBtn.disabled = true;
        }
        
        try {
            await this.fetchAllData();
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt ml-2"></i>بروزرسانی';
                refreshBtn.disabled = false;
            }
        }
    }

    toggleAutoRefresh() {
        this.isAutoRefreshEnabled = !this.isAutoRefreshEnabled;
        
        const btn = document.getElementById('logs-auto-refresh-btn');
        const text = document.getElementById('auto-refresh-text');
        
        if (this.isAutoRefreshEnabled) {
            this.startAutoRefresh();
            if (btn) btn.innerHTML = '<i class="fas fa-pause ml-2"></i><span>توقف خودکار</span>';
        } else {
            this.stopAutoRefresh();
            if (btn) btn.innerHTML = '<i class="fas fa-play ml-2"></i><span>شروع خودکار</span>';
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.logs-tab-button').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('text-white', 'border-blue-500');
                btn.classList.remove('text-gray-400', 'border-transparent');
            } else {
                btn.classList.remove('text-white', 'border-blue-500');
                btn.classList.add('text-gray-400', 'border-transparent');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.logs-tab-panel').forEach(content => {
            content.classList.add('hidden');
        });
        
        const activeTab = document.getElementById(`${tabName}-tab-content`);
        if (activeTab) {
            activeTab.classList.remove('hidden');
        }
    }

    startAutoRefresh() {
        if (this.autoRefreshInterval) return;
        
        this.autoRefreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing logs...');
            this.fetchAllData();
        }, this.refreshIntervalMs);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    getAuthHeaders() {
        const token = localStorage.getItem('titan_auth_token') || 
                     localStorage.getItem('auth_token') ||
                     'demo_token_123';
        
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    updateLastRefreshTime() {
        const timeEl = document.getElementById('logs-last-refresh');
        if (timeEl) {
            timeEl.textContent = new Date().toLocaleTimeString('fa-IR');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        console.error(message);
        // Using browser alert for simplicity
        alert(message);
    }

    destroy() {
        this.stopAutoRefresh();
        console.log('🗑️ Logs module destroyed');
    }
}

// Export to TitanModules namespace
if (typeof window.TitanModules === 'undefined') {
    window.TitanModules = {};
}

window.TitanModules.LogsModule = LogsModule;

// Set global instance for onclick handlers
window.logsModule = null;

console.log('✅ LogsModule registered in TitanModules namespace');
