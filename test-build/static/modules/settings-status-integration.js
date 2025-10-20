// ==================== SETTINGS STATUS INTEGRATION MODULE ====================
// Bridges system status monitoring with settings tabs
// Provides real-time status widgets and integration points for all settings modules

class SettingsStatusIntegration {
    constructor() {
        this.systemStatus = null;
        this.settingsCore = null;
        this.statusWidgets = new Map();
        this.updateSubscriptions = new Set();
        this.isInitialized = false;
        
        // Widget types for different settings tabs
        this.widgetTypes = {
            // General tab widgets
            general: {
                systemOverview: 'نمای کلی سیستم',
                connectionStatus: 'وضعیت اتصالات',
                lastUpdate: 'آخرین بروزرسانی'
            },
            // System tab widgets  
            system: {
                performanceMetrics: 'متریک‌های عملکرد',
                serviceHealth: 'سلامت سرویس‌ها',
                systemLogs: 'لاگ‌های سیستم',
                resourceUsage: 'استفاده از منابع'
            },
            // Trading tab widgets
            trading: {
                tradingEngine: 'موتور معاملات',
                exchangeConnections: 'اتصالات صرافی',
                orderStatus: 'وضعیت سفارشات',
                apiHealth: 'سلامت API'
            },
            // AI tab widgets
            ai: {
                aiServices: 'سرویس‌های هوش مصنوعی',
                geminiStatus: 'وضعیت Gemini',
                chatbotHealth: 'سلامت چت‌بات',
                voiceServices: 'سرویس‌های صوتی'
            },
            // Security tab widgets
            security: {
                authStatus: 'وضعیت احراز هویت',
                encryptionHealth: 'سلامت رمزنگاری',
                securityLogs: 'لاگ‌های امنیتی',
                tokenStatus: 'وضعیت توکن‌ها'
            }
        };

        this.init();
    }

    async init() {
        try {
            console.log('🔗 Initializing Settings Status Integration...');
            
            // Initialize system status manager if not already done
            await this.initializeSystemStatus();
            
            // Wait for settings system to be available
            await this.waitForSettingsSystem();
            
            // Setup status subscriptions
            this.setupStatusSubscriptions();
            
            // Create status widgets
            this.createStatusWidgets();
            
            this.isInitialized = true;
            console.log('✅ Settings Status Integration initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Settings Status Integration:', error);
        }
    }

    // =============================================================================
    // CORE INTEGRATION METHODS
    // =============================================================================

    async initializeSystemStatus() {
        // Get or create system status manager
        if (window.systemStatusManager && window.systemStatusManager.isInitialized) {
            this.systemStatus = window.systemStatusManager;
            console.log('✅ Using existing SystemStatusManager');
        } else {
            // Create new system status manager
            this.systemStatus = new SystemStatusManager();
            await this.systemStatus.init();
            window.systemStatusManager = this.systemStatus;
            console.log('✅ Created new SystemStatusManager');
        }
    }

    async waitForSettingsSystem() {
        // Wait for settings system to be available
        let attempts = 0;
        const maxAttempts = 30; // 15 seconds max wait
        
        while (attempts < maxAttempts) {
            if (window.settingsLoader && window.settingsLoader.settingsCore) {
                this.settingsCore = window.settingsLoader.settingsCore;
                console.log('✅ Settings system found');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        console.warn('⚠️ Settings system not found, will create widgets independently');
    }

    setupStatusSubscriptions() {
        // Subscribe to system status updates
        if (this.systemStatus) {
            const unsubscribe = this.systemStatus.subscribe((statusData) => {
                this.updateAllWidgets(statusData);
            });
            
            this.updateSubscriptions.add(unsubscribe);
        }
    }

    // =============================================================================
    // WIDGET CREATION AND MANAGEMENT
    // =============================================================================

    createStatusWidgets() {
        // Create widgets for each tab type
        Object.keys(this.widgetTypes).forEach(tabName => {
            this.createTabWidgets(tabName);
        });
        
        console.log(`✅ Created ${this.statusWidgets.size} status widgets`);
    }

    createTabWidgets(tabName) {
        const widgets = this.widgetTypes[tabName];
        
        Object.entries(widgets).forEach(([widgetId, widgetTitle]) => {
            const widget = this.createWidget(tabName, widgetId, widgetTitle);
            this.statusWidgets.set(`${tabName}-${widgetId}`, widget);
        });
    }

    createWidget(tabName, widgetId, widgetTitle) {
        const widgetConfig = {
            id: `${tabName}-${widgetId}`,
            tabName,
            widgetId,
            title: widgetTitle,
            element: null,
            lastUpdate: null,
            isVisible: false
        };

        return widgetConfig;
    }

    // =============================================================================
    // WIDGET RENDERING METHODS
    // =============================================================================

    renderSystemOverviewWidget(data) {
        if (!data) return this.renderLoadingWidget();
        
        const overall = data.overall || 'loading';
        const config = this.systemStatus?.statusConfig[overall] || { icon: 'fas fa-question', color: '#6B7280', text: 'نامشخص' };
        
        return `
            <div class="bg-gray-800 rounded-lg p-4 border-l-4" style="border-left-color: ${config.color}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <i class="${config.icon} text-2xl mr-3" style="color: ${config.color}"></i>
                        <div>
                            <h4 class="text-white font-semibold">وضعیت کلی سیستم</h4>
                            <p class="text-sm" style="color: ${config.color}">${config.text}</p>
                        </div>
                    </div>
                    <div class="text-right text-xs text-gray-400">
                        <div>آخرین بروزرسانی</div>
                        <div>${data.lastUpdate || 'نامشخص'}</div>
                    </div>
                </div>
                
                ${data.integration?.data?.metrics ? `
                    <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div class="text-center">
                            <div class="text-green-400 font-bold">${data.integration.data.metrics.onlineServices}</div>
                            <div class="text-gray-400">سرویس آنلاین</div>
                        </div>
                        <div class="text-center">
                            <div class="text-yellow-400 font-bold">${data.integration.data.metrics.warningServices}</div>
                            <div class="text-gray-400">هشدار</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderPerformanceMetricsWidget(data) {
        if (!data?.performance?.data) return this.renderLoadingWidget();
        
        const perf = data.performance.data;
        
        return `
            <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-4 flex items-center">
                    <i class="fas fa-chart-line text-blue-400 mr-2"></i>
                    متریک‌های عملکرد
                </h4>
                
                <div class="space-y-3">
                    <!-- CPU Usage -->
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">پردازنده (CPU)</span>
                        <div class="flex items-center">
                            <div class="w-20 h-2 bg-gray-600 rounded-full mr-2">
                                <div class="h-2 bg-blue-500 rounded-full" style="width: ${perf.system?.cpu || 0}%"></div>
                            </div>
                            <span class="text-white text-sm w-12">${perf.system?.cpu || 0}%</span>
                        </div>
                    </div>
                    
                    <!-- Memory Usage -->
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">حافظه (RAM)</span>
                        <div class="flex items-center">
                            <div class="w-20 h-2 bg-gray-600 rounded-full mr-2">
                                <div class="h-2 bg-green-500 rounded-full" style="width: ${perf.system?.memory || 0}%"></div>
                            </div>
                            <span class="text-white text-sm w-12">${perf.system?.memory || 0}%</span>
                        </div>
                    </div>
                    
                    <!-- API Performance -->
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">زمان پاسخ API</span>
                        <div class="flex items-center">
                            <span class="text-white text-sm">${perf.api?.avgResponseTime || 0}ms</span>
                        </div>
                    </div>
                    
                    <!-- Requests per minute -->
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">درخواست/دقیقه</span>
                        <div class="flex items-center">
                            <span class="text-white text-sm">${perf.api?.requestsPerMinute || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderServiceHealthWidget(data) {
        if (!data?.integration?.data?.services) return this.renderLoadingWidget();
        
        const services = data.integration.data.services.slice(0, 6); // Show first 6 services
        
        return `
            <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-4 flex items-center">
                    <i class="fas fa-heartbeat text-red-400 mr-2"></i>
                    سلامت سرویس‌ها
                </h4>
                
                <div class="space-y-2">
                    ${services.map(service => {
                        const statusConfig = this.systemStatus?.statusConfig[service.status] || { icon: 'fas fa-question', color: '#6B7280' };
                        return `
                            <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                                <div class="flex items-center">
                                    <i class="${statusConfig.icon} text-sm mr-2" style="color: ${statusConfig.color}"></i>
                                    <span class="text-white text-sm">${service.name}</span>
                                </div>
                                <div class="text-xs text-gray-400">
                                    ${service.uptime || 'N/A'} | ${service.responseTime || 'N/A'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="mt-3 text-center">
                    <button onclick="settingsStatusIntegration.showFullServiceStatus()" 
                            class="text-blue-400 hover:text-blue-300 text-sm">
                        مشاهده همه سرویس‌ها
                    </button>
                </div>
            </div>
        `;
    }

    renderTradingEngineWidget(data) {
        if (!data?.integration?.data?.services) return this.renderLoadingWidget();
        
        const tradingServices = data.integration.data.services.filter(s => 
            s.name.includes('معامله') || s.name.includes('موتور') || s.description.includes('trading')
        );
        
        return `
            <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-4 flex items-center">
                    <i class="fas fa-exchange-alt text-yellow-400 mr-2"></i>
                    موتور معاملات
                </h4>
                
                <div class="space-y-3">
                    ${tradingServices.length > 0 ? tradingServices.map(service => {
                        const statusConfig = this.systemStatus?.statusConfig[service.status] || { icon: 'fas fa-question', color: '#6B7280' };
                        return `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <i class="${statusConfig.icon} mr-2" style="color: ${statusConfig.color}"></i>
                                    <span class="text-white text-sm">${service.name}</span>
                                </div>
                                <span class="text-xs text-gray-400">${service.responseTime || 'N/A'}</span>
                            </div>
                        `;
                    }).join('') : `
                        <div class="text-center text-gray-400 py-4">
                            <i class="fas fa-info-circle mb-2"></i>
                            <p class="text-sm">اطلاعات موتور معاملات در حال بارگذاری...</p>
                        </div>
                    `}
                    
                    ${data.performance?.data?.services?.trading ? `
                        <div class="mt-4 pt-3 border-t border-gray-600">
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div class="text-center">
                                    <div class="text-green-400 font-bold">${data.performance.data.services.trading.activeOrders || 0}</div>
                                    <div class="text-gray-400">سفارش فعال</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-blue-400 font-bold">${data.performance.data.services.trading.executedOrders || 0}</div>
                                    <div class="text-gray-400">اجرا شده/ساعت</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderAIServicesWidget(data) {
        if (!data?.integration?.data?.services) return this.renderLoadingWidget();
        
        const aiServices = data.integration.data.services.filter(s => 
            s.name.includes('مصنوعی') || s.name.includes('AI') || s.name.includes('Gemini') || s.name.includes('صوتی')
        );
        
        return `
            <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-4 flex items-center">
                    <i class="fas fa-robot text-purple-400 mr-2"></i>
                    سرویس‌های هوش مصنوعی
                </h4>
                
                <div class="space-y-2">
                    ${aiServices.length > 0 ? aiServices.map(service => {
                        const statusConfig = this.systemStatus?.statusConfig[service.status] || { icon: 'fas fa-question', color: '#6B7280' };
                        return `
                            <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                                <div class="flex items-center">
                                    <i class="${statusConfig.icon} text-sm mr-2" style="color: ${statusConfig.color}"></i>
                                    <span class="text-white text-sm">${service.name}</span>
                                </div>
                                <div class="text-xs text-gray-400">${service.responseTime || 'N/A'}</div>
                            </div>
                        `;
                    }).join('') : `
                        <div class="text-center text-gray-400 py-4">
                            <i class="fas fa-info-circle mb-2"></i>
                            <p class="text-sm">سرویس‌های AI در حال بررسی...</p>
                        </div>
                    `}
                    
                    ${data.performance?.data?.services?.ai ? `
                        <div class="mt-3 pt-3 border-t border-gray-600">
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div class="text-center">
                                    <div class="text-purple-400 font-bold">${data.performance.data.services.ai.geminiRequests || 0}</div>
                                    <div class="text-gray-400">Gemini/دقیقه</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-blue-400 font-bold">${Math.round(data.performance.data.services.ai.avgAiResponseTime / 1000) || 0}s</div>
                                    <div class="text-gray-400">میانگین پاسخ</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderConnectionStatusWidget(data) {
        return `
            <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-4 flex items-center">
                    <i class="fas fa-wifi text-green-400 mr-2"></i>
                    وضعیت اتصالات
                </h4>
                
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">اتصال اینترنت</span>
                        <div class="flex items-center">
                            <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span class="text-green-400 text-sm">متصل</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">WebSocket</span>
                        <div class="flex items-center">
                            <div class="w-2 h-2 ${this.systemStatus?.wsConnection ? 'bg-green-400' : 'bg-yellow-400'} rounded-full mr-2"></div>
                            <span class="text-${this.systemStatus?.wsConnection ? 'green' : 'yellow'}-400 text-sm">
                                ${this.systemStatus?.wsConnection ? 'فعال' : 'غیرفعال'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-gray-300 text-sm">API Endpoints</span>
                        <div class="flex items-center">
                            <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span class="text-green-400 text-sm">پاسخگو</span>
                        </div>
                    </div>
                    
                    ${data?.performance?.data?.api ? `
                        <div class="mt-3 pt-3 border-t border-gray-600">
                            <div class="text-center text-sm">
                                <div class="text-white font-bold">${data.performance.data.api.activeConnections || 0}</div>
                                <div class="text-gray-400">اتصال فعال</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderLoadingWidget() {
        return `
            <div class="bg-gray-800 rounded-lg p-4 animate-pulse">
                <div class="flex items-center justify-center py-8">
                    <i class="fas fa-spinner fa-spin text-blue-400 text-2xl mr-3"></i>
                    <span class="text-gray-400">در حال بارگذاری...</span>
                </div>
            </div>
        `;
    }

    // =============================================================================
    // PUBLIC API METHODS
    // =============================================================================

    // Get status widget for specific tab and widget type
    getStatusWidget(tabName, widgetId) {
        const widgetKey = `${tabName}-${widgetId}`;
        const widget = this.statusWidgets.get(widgetKey);
        
        if (!widget) {
            console.warn(`⚠️ Widget not found: ${widgetKey}`);
            return this.renderLoadingWidget();
        }
        
        // Get current status data
        const statusData = this.systemStatus?.statusData;
        
        // Render specific widget type
        switch (widgetId) {
            case 'systemOverview':
                return this.renderSystemOverviewWidget(statusData);
            case 'performanceMetrics':
                return this.renderPerformanceMetricsWidget(statusData);
            case 'serviceHealth':
                return this.renderServiceHealthWidget(statusData);
            case 'tradingEngine':
                return this.renderTradingEngineWidget(statusData);
            case 'aiServices':
                return this.renderAIServicesWidget(statusData);
            case 'connectionStatus':
                return this.renderConnectionStatusWidget(statusData);
            default:
                return this.renderLoadingWidget();
        }
    }

    // Get all widgets for a specific tab
    getTabWidgets(tabName) {
        const widgets = {};
        const tabWidgets = this.widgetTypes[tabName];
        
        if (tabWidgets) {
            Object.keys(tabWidgets).forEach(widgetId => {
                widgets[widgetId] = this.getStatusWidget(tabName, widgetId);
            });
        }
        
        return widgets;
    }

    // Update all widgets with new status data
    updateAllWidgets(statusData) {
        if (!statusData) return;
        
        // Trigger widget updates in settings tabs if they're currently visible
        this.notifyWidgetUpdates(statusData);
    }

    notifyWidgetUpdates(statusData) {
        // Emit custom event for widget updates
        const event = new CustomEvent('statusWidgetUpdate', {
            detail: { 
                statusData,
                timestamp: new Date().toISOString()
            }
        });
        
        window.dispatchEvent(event);
    }

    // Show full service status modal
    showFullServiceStatus() {
        if (!this.systemStatus?.statusData) {
            console.warn('⚠️ No status data available');
            return;
        }
        
        // This would typically open the system status modal
        if (this.systemStatus.showModal) {
            this.systemStatus.showModal();
        } else if (window.systemStatusManager && window.systemStatusManager.showModal) {
            window.systemStatusManager.showModal();
        }
    }

    // Manual refresh of status data
    async refreshStatus() {
        if (this.systemStatus) {
            await this.systemStatus.fetchInitialStatus();
        }
    }

    // Get integration status for debugging
    getIntegrationStatus() {
        return {
            isInitialized: this.isInitialized,
            systemStatusConnected: !!this.systemStatus,
            settingsCoreConnected: !!this.settingsCore,
            widgetCount: this.statusWidgets.size,
            subscriptionCount: this.updateSubscriptions.size,
            availableWidgets: Object.fromEntries(
                Object.entries(this.widgetTypes).map(([tab, widgets]) => [
                    tab, 
                    Object.keys(widgets)
                ])
            )
        };
    }

    // Cleanup method
    cleanup() {
        console.log('🧹 Cleaning up Settings Status Integration...');
        
        // Unsubscribe from all status updates
        this.updateSubscriptions.forEach(unsubscribe => unsubscribe());
        this.updateSubscriptions.clear();
        
        // Clear widgets
        this.statusWidgets.clear();
        
        this.isInitialized = false;
    }
}

// =============================================================================
// GLOBAL INITIALIZATION AND EXPORTS
// =============================================================================

// Auto-initialize when script loads
let settingsStatusIntegration = null;

// Initialize integration when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIntegration);
} else {
    initializeIntegration();
}

async function initializeIntegration() {
    try {
        // Wait a bit for other modules to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create integration instance
        settingsStatusIntegration = new SettingsStatusIntegration();
        
        // Make globally available
        window.settingsStatusIntegration = settingsStatusIntegration;
        
        console.log('✅ Settings Status Integration ready globally');
        
    } catch (error) {
        console.error('❌ Failed to initialize Settings Status Integration:', error);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsStatusIntegration;
}

// Add to TitanModules namespace if available
if (typeof window !== 'undefined') {
    window.TitanModules = window.TitanModules || {};
    window.TitanModules.SettingsStatusIntegration = SettingsStatusIntegration;
    
    console.log('🔗 SettingsStatusIntegration available as:');
    console.log('   - window.settingsStatusIntegration');
    console.log('   - window.TitanModules.SettingsStatusIntegration');
}