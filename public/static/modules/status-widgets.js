// ==================== STATUS WIDGETS MODULE ====================
// Reusable status widget components for settings tabs and other modules
// Provides consistent UI for system status across the entire application

class StatusWidgets {
    constructor() {
        this.widgetCache = new Map();
        this.refreshCallbacks = new Map();
        this.autoRefreshIntervals = new Map();
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Status Widgets initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Status Widgets:', error);
        }
    }

    async waitForDependencies() {
        // Wait for settings status integration
        let attempts = 0;
        while (attempts < 20 && !window.settingsStatusIntegration) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (!window.settingsStatusIntegration) {
            console.warn('⚠️ Settings Status Integration not available, widgets will work independently');
        }
    }

    setupEventListeners() {
        // Listen for status widget updates
        window.addEventListener('statusWidgetUpdate', (event) => {
            this.handleStatusUpdate(event.detail);
        });
        
        // Listen for page visibility changes for auto-refresh
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoRefresh();
            } else {
                this.resumeAutoRefresh();
            }
        });
    }

    // =============================================================================
    // CORE WIDGET CREATION METHODS
    // =============================================================================

    // Create a compact system overview widget
    createSystemOverviewWidget(containerId, options = {}) {
        const config = {
            showDetails: true,
            autoRefresh: true,
            refreshInterval: 30000, // 30 seconds
            ...options
        };

        const html = `
            <div id="${containerId}" class="status-widget system-overview">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-white font-semibold flex items-center">
                            <i class="fas fa-server text-blue-400 mr-2"></i>
                            نمای کلی سیستم
                        </h4>
                        <button onclick="statusWidgets.refreshWidget('${containerId}')" 
                                class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-refresh text-sm"></i>
                        </button>
                    </div>
                    
                    <div id="${containerId}-content" class="space-y-3">
                        ${this.renderLoadingContent()}
                    </div>
                </div>
            </div>
        `;

        this.widgetCache.set(containerId, { config, type: 'systemOverview' });
        
        if (config.autoRefresh) {
            this.startAutoRefresh(containerId, config.refreshInterval);
        }
        
        // Load initial data
        setTimeout(() => this.loadSystemOverviewData(containerId), 100);
        
        return html;
    }

    // Create a performance metrics widget
    createPerformanceWidget(containerId, options = {}) {
        const config = {
            showGraphs: true,
            autoRefresh: true,
            refreshInterval: 15000, // 15 seconds
            ...options
        };

        const html = `
            <div id="${containerId}" class="status-widget performance-metrics">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-white font-semibold flex items-center">
                            <i class="fas fa-chart-line text-green-400 mr-2"></i>
                            متریک‌های عملکرد
                        </h4>
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <button onclick="statusWidgets.toggleAutoRefresh('${containerId}')" 
                                    class="text-gray-400 hover:text-white transition-colors">
                                <i id="${containerId}-auto-refresh-icon" class="fas fa-pause text-sm"></i>
                            </button>
                            <button onclick="statusWidgets.refreshWidget('${containerId}')" 
                                    class="text-gray-400 hover:text-white transition-colors">
                                <i class="fas fa-refresh text-sm"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="${containerId}-content">
                        ${this.renderLoadingContent()}
                    </div>
                </div>
            </div>
        `;

        this.widgetCache.set(containerId, { config, type: 'performance' });
        
        if (config.autoRefresh) {
            this.startAutoRefresh(containerId, config.refreshInterval);
        }
        
        setTimeout(() => this.loadPerformanceData(containerId), 100);
        
        return html;
    }

    // Create a service health widget
    createServiceHealthWidget(containerId, options = {}) {
        const config = {
            maxServices: 8,
            showUptime: true,
            autoRefresh: true,
            refreshInterval: 20000, // 20 seconds
            ...options
        };

        const html = `
            <div id="${containerId}" class="status-widget service-health">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-white font-semibold flex items-center">
                            <i class="fas fa-heartbeat text-red-400 mr-2"></i>
                            سلامت سرویس‌ها
                        </h4>
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <button onclick="statusWidgets.showFullServiceList()" 
                                    class="text-blue-400 hover:text-blue-300 text-sm">
                                همه
                            </button>
                            <button onclick="statusWidgets.refreshWidget('${containerId}')" 
                                    class="text-gray-400 hover:text-white transition-colors">
                                <i class="fas fa-refresh text-sm"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="${containerId}-content">
                        ${this.renderLoadingContent()}
                    </div>
                </div>
            </div>
        `;

        this.widgetCache.set(containerId, { config, type: 'serviceHealth' });
        
        if (config.autoRefresh) {
            this.startAutoRefresh(containerId, config.refreshInterval);
        }
        
        setTimeout(() => this.loadServiceHealthData(containerId), 100);
        
        return html;
    }

    // Create a compact connection status widget
    createConnectionStatusWidget(containerId, options = {}) {
        const config = {
            showDetails: false,
            autoRefresh: true,
            refreshInterval: 10000, // 10 seconds
            ...options
        };

        const html = `
            <div id="${containerId}" class="status-widget connection-status">
                <div class="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <h5 class="text-white text-sm font-medium flex items-center">
                            <i class="fas fa-wifi text-green-400 mr-2 text-sm"></i>
                            اتصالات
                        </h5>
                        <button onclick="statusWidgets.refreshWidget('${containerId}')" 
                                class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-refresh text-xs"></i>
                        </button>
                    </div>
                    
                    <div id="${containerId}-content" class="mt-2">
                        ${this.renderLoadingContent()}
                    </div>
                </div>
            </div>
        `;

        this.widgetCache.set(containerId, { config, type: 'connectionStatus' });
        
        if (config.autoRefresh) {
            this.startAutoRefresh(containerId, config.refreshInterval);
        }
        
        setTimeout(() => this.loadConnectionStatusData(containerId), 100);
        
        return html;
    }

    // Create a trading-specific status widget
    createTradingStatusWidget(containerId, options = {}) {
        const config = {
            showOrders: true,
            showBalance: false, // Might be sensitive
            autoRefresh: true,
            refreshInterval: 5000, // 5 seconds for trading
            ...options
        };

        const html = `
            <div id="${containerId}" class="status-widget trading-status">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-white font-semibold flex items-center">
                            <i class="fas fa-exchange-alt text-yellow-400 mr-2"></i>
                            وضعیت معاملات
                        </h4>
                        <button onclick="statusWidgets.refreshWidget('${containerId}')" 
                                class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-refresh text-sm"></i>
                        </button>
                    </div>
                    
                    <div id="${containerId}-content">
                        ${this.renderLoadingContent()}
                    </div>
                </div>
            </div>
        `;

        this.widgetCache.set(containerId, { config, type: 'tradingStatus' });
        
        if (config.autoRefresh) {
            this.startAutoRefresh(containerId, config.refreshInterval);
        }
        
        setTimeout(() => this.loadTradingStatusData(containerId), 100);
        
        return html;
    }

    // =============================================================================
    // DATA LOADING METHODS
    // =============================================================================

    async loadSystemOverviewData(containerId) {
        const contentElement = document.getElementById(`${containerId}-content`);
        if (!contentElement) return;

        try {
            let statusData = null;
            
            // Try to get data from integration service
            if (window.settingsStatusIntegration) {
                const integration = window.settingsStatusIntegration;
                statusData = integration.systemStatus?.statusData;
            }
            
            // Fallback to direct API call
            if (!statusData) {
                statusData = await this.fetchStatusData();
            }
            
            const html = this.renderSystemOverviewContent(statusData);
            contentElement.innerHTML = html;
            
        } catch (error) {
            console.error('Error loading system overview data:', error);
            contentElement.innerHTML = this.renderErrorContent('خطا در دریافت اطلاعات سیستم');
        }
    }

    async loadPerformanceData(containerId) {
        const contentElement = document.getElementById(`${containerId}-content`);
        if (!contentElement) return;

        try {
            const response = await fetch('/api/performance/metrics');
            const data = await response.json();
            
            if (data.success) {
                const html = this.renderPerformanceContent(data.data);
                contentElement.innerHTML = html;
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Error loading performance data:', error);
            contentElement.innerHTML = this.renderErrorContent('خطا در دریافت متریک‌های عملکرد');
        }
    }

    async loadServiceHealthData(containerId) {
        const contentElement = document.getElementById(`${containerId}-content`);
        if (!contentElement) return;

        try {
            const response = await fetch('/api/integration/status');
            const data = await response.json();
            
            if (data.success && data.data.services) {
                const config = this.widgetCache.get(containerId)?.config || {};
                const html = this.renderServiceHealthContent(data.data.services, config);
                contentElement.innerHTML = html;
            } else {
                throw new Error(data.error || 'Invalid response');
            }
            
        } catch (error) {
            console.error('Error loading service health data:', error);
            contentElement.innerHTML = this.renderErrorContent('خطا در دریافت وضعیت سرویس‌ها');
        }
    }

    async loadConnectionStatusData(containerId) {
        const contentElement = document.getElementById(`${containerId}-content`);
        if (!contentElement) return;

        try {
            // Check multiple connection points
            const [health, integration] = await Promise.allSettled([
                fetch('/api/health').then(r => r.json()),
                fetch('/api/integration/status').then(r => r.json())
            ]);
            
            const html = this.renderConnectionStatusContent({
                health: health.status === 'fulfilled' ? health.value : null,
                integration: integration.status === 'fulfilled' ? integration.value : null
            });
            
            contentElement.innerHTML = html;
            
        } catch (error) {
            console.error('Error loading connection status:', error);
            contentElement.innerHTML = this.renderErrorContent('خطا در بررسی اتصالات');
        }
    }

    async loadTradingStatusData(containerId) {
        const contentElement = document.getElementById(`${containerId}-content`);
        if (!contentElement) return;

        try {
            // This would normally fetch from trading APIs
            // For now, we'll use integration status
            const response = await fetch('/api/integration/status');
            const data = await response.json();
            
            if (data.success) {
                const tradingServices = data.data.services.filter(s => 
                    s.name.includes('معامله') || s.description.includes('trading')
                );
                
                const html = this.renderTradingStatusContent(tradingServices);
                contentElement.innerHTML = html;
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Error loading trading status:', error);
            contentElement.innerHTML = this.renderErrorContent('خطا در دریافت وضعیت معاملات');
        }
    }

    // =============================================================================
    // CONTENT RENDERING METHODS
    // =============================================================================

    renderSystemOverviewContent(statusData) {
        if (!statusData) {
            return this.renderErrorContent('داده‌ای در دسترس نیست');
        }

        const overall = statusData.overall || 'loading';
        const statusConfig = this.getStatusConfig(overall);
        
        return `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                    <i class="${statusConfig.icon} text-lg mr-2" style="color: ${statusConfig.color}"></i>
                    <div>
                        <div class="text-white font-medium">وضعیت کلی</div>
                        <div class="text-sm" style="color: ${statusConfig.color}">${statusConfig.text}</div>
                    </div>
                </div>
                <div class="text-right text-xs text-gray-400">
                    <div>بروزرسانی</div>
                    <div>${statusData.lastUpdate || 'نامشخص'}</div>
                </div>
            </div>
            
            ${statusData.integration?.data?.metrics ? `
                <div class="grid grid-cols-3 gap-3 text-center text-sm">
                    <div class="bg-gray-700 rounded p-2">
                        <div class="text-green-400 font-bold">${statusData.integration.data.metrics.onlineServices || 0}</div>
                        <div class="text-gray-400 text-xs">آنلاین</div>
                    </div>
                    <div class="bg-gray-700 rounded p-2">
                        <div class="text-yellow-400 font-bold">${statusData.integration.data.metrics.warningServices || 0}</div>
                        <div class="text-gray-400 text-xs">هشدار</div>
                    </div>
                    <div class="bg-gray-700 rounded p-2">
                        <div class="text-red-400 font-bold">${statusData.integration.data.metrics.offlineServices || 0}</div>
                        <div class="text-gray-400 text-xs">آفلاین</div>
                    </div>
                </div>
            ` : ''}
            
            ${statusData.uptime ? `
                <div class="mt-3 text-center">
                    <div class="text-white font-medium">${statusData.uptime}</div>
                    <div class="text-gray-400 text-xs">زمان فعالیت سیستم</div>
                </div>
            ` : ''}
        `;
    }

    renderPerformanceContent(perfData) {
        if (!perfData) {
            return this.renderErrorContent('داده‌های عملکرد در دسترس نیست');
        }

        return `
            <div class="space-y-3">
                <!-- System Resources -->
                ${perfData.system ? `
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-300">پردازنده</span>
                            <span class="text-white">${perfData.system.cpu || 0}%</span>
                        </div>
                        <div class="w-full h-2 bg-gray-600 rounded-full">
                            <div class="h-2 bg-blue-500 rounded-full transition-all duration-300" style="width: ${perfData.system.cpu || 0}%"></div>
                        </div>
                        
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-300">حافظه</span>
                            <span class="text-white">${perfData.system.memory || 0}%</span>
                        </div>
                        <div class="w-full h-2 bg-gray-600 rounded-full">
                            <div class="h-2 bg-green-500 rounded-full transition-all duration-300" style="width: ${perfData.system.memory || 0}%"></div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- API Performance -->
                ${perfData.api ? `
                    <div class="border-t border-gray-600 pt-3">
                        <div class="grid grid-cols-2 gap-3 text-center text-sm">
                            <div>
                                <div class="text-white font-bold">${perfData.api.requestsPerMinute || 0}</div>
                                <div class="text-gray-400 text-xs">درخواست/دقیقه</div>
                            </div>
                            <div>
                                <div class="text-white font-bold">${perfData.api.avgResponseTime || 0}ms</div>
                                <div class="text-gray-400 text-xs">زمان پاسخ</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderServiceHealthContent(services, config = {}) {
        const maxServices = config.maxServices || 8;
        const displayServices = services.slice(0, maxServices);
        
        return `
            <div class="space-y-2">
                ${displayServices.map(service => {
                    const statusConfig = this.getStatusConfig(service.status);
                    return `
                        <div class="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                            <div class="flex items-center">
                                <i class="${statusConfig.icon} mr-2 text-xs" style="color: ${statusConfig.color}"></i>
                                <span class="text-white">${service.name}</span>
                            </div>
                            <div class="text-xs text-gray-400">
                                ${config.showUptime && service.uptime ? service.uptime : service.responseTime || 'N/A'}
                            </div>
                        </div>
                    `;
                }).join('')}
                
                ${services.length > maxServices ? `
                    <div class="text-center pt-2">
                        <button onclick="statusWidgets.showFullServiceList()" 
                                class="text-blue-400 hover:text-blue-300 text-sm">
                            مشاهده ${services.length - maxServices} سرویس دیگر
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderConnectionStatusContent(data) {
        const connections = [
            {
                name: 'اتصال اینترنت',
                status: 'online', // Assume online if we got response
                info: 'فعال'
            },
            {
                name: 'WebSocket',
                status: window.systemStatusManager?.wsConnection ? 'online' : 'warning',
                info: window.systemStatusManager?.wsConnection ? 'متصل' : 'قطع'
            },
            {
                name: 'پایگاه داده',
                status: data.health?.database?.postgres ? 'online' : 'error',
                info: data.health?.database?.postgres ? 'آماده' : 'خطا'
            },
            {
                name: 'API سرویس‌ها',
                status: data.integration?.success ? 'online' : 'warning',
                info: data.integration?.success ? 'پاسخگو' : 'مشکل'
            }
        ];

        return `
            <div class="space-y-2">
                ${connections.map(conn => {
                    const statusConfig = this.getStatusConfig(conn.status);
                    return `
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-300">${conn.name}</span>
                            <div class="flex items-center">
                                <div class="w-2 h-2 rounded-full mr-2" style="background-color: ${statusConfig.color}"></div>
                                <span class="text-white">${conn.info}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderTradingStatusContent(tradingServices) {
        if (!tradingServices || tradingServices.length === 0) {
            return `
                <div class="text-center text-gray-400 py-4">
                    <i class="fas fa-info-circle mb-2"></i>
                    <p class="text-sm">اطلاعات معاملات در حال بارگذاری...</p>
                </div>
            `;
        }

        return `
            <div class="space-y-3">
                ${tradingServices.map(service => {
                    const statusConfig = this.getStatusConfig(service.status);
                    return `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <i class="${statusConfig.icon} mr-2" style="color: ${statusConfig.color}"></i>
                                <span class="text-white text-sm">${service.name}</span>
                            </div>
                            <span class="text-xs text-gray-400">${service.responseTime || 'N/A'}</span>
                        </div>
                    `;
                }).join('')}
                
                <div class="border-t border-gray-600 pt-3">
                    <div class="text-center text-sm">
                        <div class="text-yellow-400 font-bold">0</div>
                        <div class="text-gray-400 text-xs">سفارش فعال</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLoadingContent() {
        return `
            <div class="flex items-center justify-center py-4">
                <i class="fas fa-spinner fa-spin text-blue-400 mr-2"></i>
                <span class="text-gray-400 text-sm">بارگذاری...</span>
            </div>
        `;
    }

    renderErrorContent(message) {
        return `
            <div class="text-center text-red-400 py-4">
                <i class="fas fa-exclamation-triangle mb-2"></i>
                <p class="text-sm">${message}</p>
            </div>
        `;
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    getStatusConfig(status) {
        const configs = {
            online: { icon: 'fas fa-circle', color: '#10B981', text: 'آنلاین' },
            warning: { icon: 'fas fa-exclamation-triangle', color: '#F59E0B', text: 'هشدار' },
            error: { icon: 'fas fa-times-circle', color: '#EF4444', text: 'خطا' },
            offline: { icon: 'fas fa-circle', color: '#6B7280', text: 'آفلاین' },
            maintenance: { icon: 'fas fa-wrench', color: '#8B5CF6', text: 'تعمیرات' },
            loading: { icon: 'fas fa-spinner fa-spin', color: '#3B82F6', text: 'بارگیری...' }
        };
        
        return configs[status] || configs.loading;
    }

    async fetchStatusData() {
        try {
            const [health, integration, performance] = await Promise.allSettled([
                fetch('/api/health').then(r => r.json()),
                fetch('/api/integration/status').then(r => r.json()),
                fetch('/api/performance/metrics').then(r => r.json())
            ]);
            
            return {
                timestamp: new Date().toISOString(),
                overall: 'online', // Simplified
                health: health.status === 'fulfilled' ? health.value : null,
                integration: integration.status === 'fulfilled' ? integration.value : null,
                performance: performance.status === 'fulfilled' ? performance.value : null,
                lastUpdate: new Date().toLocaleString('fa-IR')
            };
            
        } catch (error) {
            console.error('Error fetching status data:', error);
            return null;
        }
    }

    // =============================================================================
    // PUBLIC API METHODS
    // =============================================================================

    // Refresh a specific widget
    async refreshWidget(containerId) {
        const widget = this.widgetCache.get(containerId);
        if (!widget) return;

        const refreshIcon = document.querySelector(`#${containerId} .fa-refresh`);
        if (refreshIcon) {
            refreshIcon.classList.add('fa-spin');
        }

        try {
            switch (widget.type) {
                case 'systemOverview':
                    await this.loadSystemOverviewData(containerId);
                    break;
                case 'performance':
                    await this.loadPerformanceData(containerId);
                    break;
                case 'serviceHealth':
                    await this.loadServiceHealthData(containerId);
                    break;
                case 'connectionStatus':
                    await this.loadConnectionStatusData(containerId);
                    break;
                case 'tradingStatus':
                    await this.loadTradingStatusData(containerId);
                    break;
            }
        } finally {
            if (refreshIcon) {
                setTimeout(() => refreshIcon.classList.remove('fa-spin'), 500);
            }
        }
    }

    // Auto-refresh management
    startAutoRefresh(containerId, interval) {
        const existingInterval = this.autoRefreshIntervals.get(containerId);
        if (existingInterval) {
            clearInterval(existingInterval);
        }

        const intervalId = setInterval(() => {
            if (!document.hidden) {
                this.refreshWidget(containerId);
            }
        }, interval);

        this.autoRefreshIntervals.set(containerId, intervalId);
    }

    stopAutoRefresh(containerId) {
        const intervalId = this.autoRefreshIntervals.get(containerId);
        if (intervalId) {
            clearInterval(intervalId);
            this.autoRefreshIntervals.delete(containerId);
        }
    }

    toggleAutoRefresh(containerId) {
        const isActive = this.autoRefreshIntervals.has(containerId);
        const icon = document.getElementById(`${containerId}-auto-refresh-icon`);
        
        if (isActive) {
            this.stopAutoRefresh(containerId);
            if (icon) {
                icon.className = 'fas fa-play text-sm';
            }
        } else {
            const widget = this.widgetCache.get(containerId);
            if (widget) {
                this.startAutoRefresh(containerId, widget.config.refreshInterval || 30000);
                if (icon) {
                    icon.className = 'fas fa-pause text-sm';
                }
            }
        }
    }

    pauseAutoRefresh() {
        this.autoRefreshIntervals.forEach((_, containerId) => {
            this.stopAutoRefresh(containerId);
        });
    }

    resumeAutoRefresh() {
        this.widgetCache.forEach((widget, containerId) => {
            if (widget.config.autoRefresh) {
                this.startAutoRefresh(containerId, widget.config.refreshInterval || 30000);
            }
        });
    }

    // Handle status updates from system
    handleStatusUpdate(detail) {
        // Refresh all visible widgets
        this.widgetCache.forEach((widget, containerId) => {
            const element = document.getElementById(containerId);
            if (element && this.isElementVisible(element)) {
                this.refreshWidget(containerId);
            }
        });
    }

    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 && 
               rect.bottom <= window.innerHeight && 
               rect.right <= window.innerWidth;
    }

    // Show full service status (delegates to system status manager)
    showFullServiceList() {
        if (window.systemStatusManager && window.systemStatusManager.showModal) {
            window.systemStatusManager.showModal();
        } else if (window.settingsStatusIntegration) {
            window.settingsStatusIntegration.showFullServiceStatus();
        }
    }

    // Cleanup
    cleanup() {
        // Clear all intervals
        this.autoRefreshIntervals.forEach(intervalId => clearInterval(intervalId));
        this.autoRefreshIntervals.clear();
        
        // Clear cache
        this.widgetCache.clear();
        this.refreshCallbacks.clear();
    }
}

// =============================================================================
// GLOBAL INITIALIZATION
// =============================================================================

// Initialize when DOM is ready
let statusWidgets = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStatusWidgets);
} else {
    initializeStatusWidgets();
}

function initializeStatusWidgets() {
    statusWidgets = new StatusWidgets();
    window.statusWidgets = statusWidgets;
    
    // Add to TitanModules namespace
    window.TitanModules = window.TitanModules || {};
    window.TitanModules.StatusWidgets = StatusWidgets;
    
    console.log('✅ Status Widgets available globally');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatusWidgets;
}