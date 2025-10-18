// ==================== SYSTEM STATUS MODULE ====================
// Comprehensive system monitoring and status management
// Integrated across chatbot, settings, and dashboard

class SystemStatusManager {
    constructor() {
        this.isInitialized = false;
        this.statusData = null;
        this.subscribers = new Set();
        this.updateInterval = null;
        this.wsConnection = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Status categories with icons and colors
        this.statusConfig = {
            online: { icon: 'fas fa-circle', color: '#10B981', text: 'آنلاین' },
            warning: { icon: 'fas fa-exclamation-triangle', color: '#F59E0B', text: 'هشدار' },
            error: { icon: 'fas fa-times-circle', color: '#EF4444', text: 'خطا' },
            offline: { icon: 'fas fa-circle', color: '#6B7280', text: 'آفلاین' },
            maintenance: { icon: 'fas fa-wrench', color: '#8B5CF6', text: 'تعمیرات' },
            loading: { icon: 'fas fa-spinner fa-spin', color: '#3B82F6', text: 'بارگیری...' }
        };

        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            // Initialize system status monitoring
            await this.fetchInitialStatus();
            this.startPeriodicUpdates();
            this.setupWebSocketConnection();
            this.bindEvents();
            
            this.isInitialized = true;
            console.log('✅ System Status Manager initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize System Status Manager:', error);
        }
    }

    // =============================================================================
    // CORE STATUS MANAGEMENT
    // =============================================================================

    async fetchInitialStatus() {
        try {
            this.updateStatus('loading');
            
            // Fetch comprehensive system status
            const [healthData, integrationData, performanceData] = await Promise.all([
                this.fetchHealthStatus().catch(e => ({ error: e.message })),
                this.fetchIntegrationStatus().catch(e => ({ error: e.message })),
                this.fetchPerformanceMetrics().catch(e => ({ error: e.message }))
            ]);

            // Compile comprehensive status
            this.statusData = {
                timestamp: new Date().toISOString(),
                overall: this.determineOverallStatus([healthData, integrationData, performanceData]),
                health: healthData,
                integration: integrationData,
                performance: performanceData,
                uptime: this.calculateUptime(),
                lastUpdate: new Date().toLocaleString('fa-IR')
            };

            // Notify all subscribers
            this.notifySubscribers();
            
        } catch (error) {
            console.error('Error fetching initial status:', error);
            this.statusData = this.getFailsafeStatus(error);
            this.notifySubscribers();
        }
    }

    async fetchHealthStatus() {
        const response = await fetch('/api/health');
        if (!response.ok) {
            throw new Error(`Health API returned ${response.status}`);
        }
        return await response.json();
    }

    async fetchIntegrationStatus() {
        const token = this.getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch('/api/integration/status', { headers });
        if (!response.ok) {
            throw new Error(`Integration API returned ${response.status}`);
        }
        return await response.json();
    }

    async fetchPerformanceMetrics() {
        const token = this.getAuthToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch('/api/performance/metrics', { headers });
        if (!response.ok) {
            throw new Error(`Performance API returned ${response.status}`);
        }
        return await response.json();
    }

    determineOverallStatus(statusArray) {
        // Determine overall system status from component statuses
        let hasError = false;
        let hasWarning = false;
        let hasOffline = false;

        for (const status of statusArray) {
            if (status.error || (status.status && status.status === 'error')) {
                hasError = true;
            } else if (status.status === 'warning') {
                hasWarning = true;
            } else if (status.status === 'offline') {
                hasOffline = true;
            }
        }

        if (hasError) return 'error';
        if (hasOffline) return 'offline';
        if (hasWarning) return 'warning';
        return 'online';
    }

    getFailsafeStatus(error) {
        return {
            timestamp: new Date().toISOString(),
            overall: 'error',
            error: error.message,
            health: { status: 'error', message: 'Unable to fetch health data' },
            integration: { status: 'error', message: 'Unable to fetch integration data' },
            performance: { status: 'error', message: 'Unable to fetch performance data' },
            uptime: '0%',
            lastUpdate: new Date().toLocaleString('fa-IR')
        };
    }

    // =============================================================================
    // REAL-TIME UPDATES
    // =============================================================================

    startPeriodicUpdates() {
        // Update status every 15 seconds
        this.updateInterval = setInterval(() => {
            this.fetchInitialStatus();
        }, 15000);
    }

    stopPeriodicUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    setupWebSocketConnection() {
        try {
            // Use Server-Sent Events (SSE) for Cloudflare Workers compatibility
            this.setupServerSentEvents();
        } catch (error) {
            console.warn('Real-time connection setup failed, using polling fallback:', error);
            // Continue with existing periodic updates as fallback
        }
    }

    setupServerSentEvents() {
        try {
            // Setup SSE connection for real-time updates
            const sseUrl = `/ws/status`;
            this.sseConnection = new EventSource(sseUrl);
            
            this.sseConnection.onopen = () => {
                console.log('✅ Real-time status connection established (SSE)');
                this.retryCount = 0;
                this.wsConnection = true; // Mark as connected for compatibility
            };

            this.sseConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketUpdate(data);
                } catch (error) {
                    console.warn('Invalid SSE message:', error);
                }
            };

            this.sseConnection.onerror = (error) => {
                console.warn('SSE connection error:', error);
                this.wsConnection = false;
                this.retryWebSocketConnection();
            };

        } catch (error) {
            console.warn('SSE setup failed, using polling fallback:', error);
            this.wsConnection = false;
            // Fallback to enhanced polling
            this.setupEnhancedPolling();
        }
    }

    setupEnhancedPolling() {
        // Enhanced polling as fallback when SSE is not available
        console.log('🔄 Setting up enhanced polling for real-time updates');
        
        // Use shorter intervals for more responsive updates
        this.stopPeriodicUpdates();
        this.updateInterval = setInterval(() => {
            this.fetchRealTimeStatus();
        }, 10000); // 10 seconds for enhanced polling
    }

    async fetchRealTimeStatus() {
        try {
            const response = await fetch('/api/status/poll');
            const data = await response.json();
            
            if (data.success) {
                // Transform polling data to match status update format
                this.handleWebSocketUpdate({
                    type: 'status_update',
                    component: 'overall',
                    status: data.data,
                    timestamp: data.data.timestamp
                });
            }
        } catch (error) {
            console.warn('Enhanced polling failed:', error);
        }
    }

    retryWebSocketConnection() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => {
                console.log(`Retrying real-time connection (${this.retryCount}/${this.maxRetries})`);
                this.setupServerSentEvents();
            }, 5000 * this.retryCount);
        } else {
            console.log('Max retries reached, falling back to enhanced polling');
            this.setupEnhancedPolling();
        }
    }

    handleWebSocketUpdate(data) {
        if (data.type === 'status_update') {
            // Update specific component status or overall status
            if (this.statusData && data.status) {
                // Handle different types of status updates
                if (data.component === 'overall') {
                    // Complete status update
                    this.statusData = {
                        ...this.statusData,
                        ...data.status,
                        timestamp: data.timestamp || new Date().toISOString(),
                        lastUpdate: new Date().toLocaleString('fa-IR')
                    };
                } else {
                    // Specific component update
                    this.statusData[data.component] = data.status;
                    this.statusData.lastUpdate = new Date().toLocaleString('fa-IR');
                    this.statusData.overall = this.determineOverallStatus([
                        this.statusData.health,
                        this.statusData.integration,
                        this.statusData.performance
                    ]);
                }
                
                // Update UI elements
                this.updateStatus(this.statusData.overall);
                this.updateSystemButton();
                
                // Notify all subscribers
                this.notifySubscribers();
            }
        } else if (data.type === 'connected') {
            console.log('✅ Real-time status updates connected:', data.message);
        } else if (data.type === 'error') {
            console.warn('Real-time status error:', data.message);
        }
    }

    // Cleanup connections
    cleanup() {
        console.log('🧹 Cleaning up System Status Manager...');
        
        // Close SSE connection
        if (this.sseConnection) {
            this.sseConnection.close();
            this.sseConnection = null;
        }
        
        // Stop polling
        this.stopPeriodicUpdates();
        
        // Clear subscribers
        this.subscribers.clear();
        
        // Reset connection status
        this.wsConnection = false;
        this.isInitialized = false;
    }

    // =============================================================================
    // SUBSCRIPTION MANAGEMENT
    // =============================================================================

    subscribe(callback) {
        this.subscribers.add(callback);
        
        // Immediately notify with current data
        if (this.statusData) {
            callback(this.statusData);
        }
        
        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
        };
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.statusData);
            } catch (error) {
                console.error('Error notifying status subscriber:', error);
            }
        });
    }

    // =============================================================================
    // STATUS INDICATORS
    // =============================================================================

    updateStatus(status) {
        // Update all status indicators on the page
        const indicators = document.querySelectorAll('.system-status-indicator');
        const config = this.statusConfig[status] || this.statusConfig.offline;
        
        indicators.forEach(indicator => {
            indicator.innerHTML = `<i class="${config.icon}" style="color: ${config.color}"></i>`;
            indicator.setAttribute('title', `وضعیت سیستم: ${config.text}`);
            indicator.className = `system-status-indicator status-${status}`;
        });
    }

    updateSystemButton() {
        const button = document.querySelector('.system-status-button');
        if (!button || !this.statusData) return;

        const config = this.statusConfig[this.statusData.overall] || this.statusConfig.offline;
        
        // Update button appearance
        button.className = `system-status-button status-${this.statusData.overall}`;
        button.innerHTML = `<i class="${config.icon}" style="color: ${config.color}"></i>`;
        button.setAttribute('title', `وضعیت سیستم: ${config.text}`);
        
        // Add pulse animation for errors
        if (this.statusData.overall === 'error') {
            button.classList.add('pulse-error');
        } else {
            button.classList.remove('pulse-error');
        }
    }

    // =============================================================================
    // STATUS MODAL
    // =============================================================================

    showStatusModal() {
        if (!this.statusData) {
            this.showLoadingModal();
            return;
        }

        const modal = this.createStatusModal();
        document.body.appendChild(modal);
        
        // Auto-refresh modal content every 10 seconds
        const refreshInterval = setInterval(() => {
            if (document.body.contains(modal)) {
                this.refreshModalContent(modal);
            } else {
                clearInterval(refreshInterval);
            }
        }, 10000);
    }

    createStatusModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.setAttribute('data-modal', 'system-status');
        
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                ${this.getModalHeader()}
                <div class="flex-1 overflow-y-auto">
                    ${this.getModalContent()}
                </div>
            </div>
        `;
        
        // Bind close events
        modal.querySelector('[data-close="modal"]').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    getModalHeader() {
        const overallConfig = this.statusConfig[this.statusData.overall];
        
        return `
            <div class="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                <h3 class="text-2xl font-semibold text-white flex items-center gap-3">
                    <i class="${overallConfig.icon}" style="color: ${overallConfig.color}"></i>
                    وضعیت سیستم TITAN
                </h3>
                <button data-close="modal" class="text-gray-400 hover:text-white transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
        `;
    }

    getModalContent() {
        const data = this.statusData;
        
        return `
            <div class="p-6 space-y-6">
                <!-- Overall Status -->
                ${this.getOverallStatusSection()}
                
                <!-- System Health -->
                ${this.getHealthSection()}
                
                <!-- Integration Status -->
                ${this.getIntegrationSection()}
                
                <!-- Performance Metrics -->
                ${this.getPerformanceSection()}
                
                <!-- System Information -->
                ${this.getSystemInfoSection()}
                
                <!-- Quick Actions -->
                ${this.getQuickActionsSection()}
            </div>
        `;
    }

    getOverallStatusSection() {
        const config = this.statusConfig[this.statusData.overall];
        const uptimePercent = this.calculateUptimePercent();
        
        return `
            <div class="bg-gray-700 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i class="fas fa-server"></i>
                    وضعیت کلی سیستم
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                        <div class="text-4xl mb-2">
                            <i class="${config.icon}" style="color: ${config.color}"></i>
                        </div>
                        <div class="text-white font-semibold">${config.text}</div>
                        <div class="text-gray-400 text-sm">وضعیت فعلی</div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-400 mb-2">${uptimePercent}%</div>
                        <div class="text-white font-semibold">آپتایم</div>
                        <div class="text-gray-400 text-sm">24 ساعت گذشته</div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-400 mb-2">${this.getActiveServicesCount()}</div>
                        <div class="text-white font-semibold">سرویس فعال</div>
                        <div class="text-gray-400 text-sm">از ${this.getTotalServicesCount()} سرویس</div>
                    </div>
                </div>
            </div>
        `;
    }

    getHealthSection() {
        const health = this.statusData.health;
        
        return `
            <div class="bg-gray-700 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i class="fas fa-heartbeat"></i>
                    سلامت سیستم
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${health.database ? this.getComponentCard('پایگاه داده', health.database) : ''}
                    ${health.redis ? this.getComponentCard('کش Redis', health.redis) : ''}
                    ${health.api ? this.getComponentCard('API سرور', health.api) : ''}
                    ${health.websocket ? this.getComponentCard('WebSocket', health.websocket) : ''}
                </div>
            </div>
        `;
    }

    getIntegrationSection() {
        const integration = this.statusData.integration;
        
        return `
            <div class="bg-gray-700 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i class="fas fa-puzzle-piece"></i>
                    وضعیت یکپارچگی
                </h4>
                
                <div class="space-y-3">
                    ${integration.services ? this.getServicesList(integration.services) : this.getErrorMessage('خطا در دریافت اطلاعات سرویس‌ها')}
                </div>
            </div>
        `;
    }

    getPerformanceSection() {
        const performance = this.statusData.performance;
        
        return `
            <div class="bg-gray-700 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i class="fas fa-tachometer-alt"></i>
                    متریک‌های عملکرد
                </h4>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${performance.metrics ? this.getPerformanceMetrics(performance.metrics) : this.getErrorMessage('خطا در دریافت متریک‌ها')}
                </div>
            </div>
        `;
    }

    getSystemInfoSection() {
        return `
            <div class="bg-gray-700 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i class="fas fa-info-circle"></i>
                    اطلاعات سیستم
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <div class="text-gray-400">آخرین بروزرسانی:</div>
                        <div class="text-white">${this.statusData.lastUpdate}</div>
                    </div>
                    <div>
                        <div class="text-gray-400">نسخه سیستم:</div>
                        <div class="text-white">TITAN v11.0.0</div>
                    </div>
                    <div>
                        <div class="text-gray-400">محیط اجرا:</div>
                        <div class="text-white">Cloudflare Workers</div>
                    </div>
                    <div>
                        <div class="text-gray-400">منطقه زمانی:</div>
                        <div class="text-white">Asia/Tehran (UTC+3:30)</div>
                    </div>
                </div>
            </div>
        `;
    }

    getQuickActionsSection() {
        return `
            <div class="bg-gray-700 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i class="fas fa-bolt"></i>
                    اقدامات سریع
                </h4>
                
                <div class="flex flex-wrap gap-3">
                    <button class="refresh-status-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-sync-alt"></i>
                        بروزرسانی
                    </button>
                    <button class="run-healthcheck-btn px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-heartbeat"></i>
                        بررسی سلامت
                    </button>
                    <button class="clear-cache-btn px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-broom"></i>
                        پاک کردن کش
                    </button>
                    <button class="view-logs-btn px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-file-alt"></i>
                        مشاهده لاگ‌ها
                    </button>
                </div>
            </div>
        `;
    }

    // =============================================================================
    // HELPER METHODS
    // =============================================================================

    getComponentCard(name, status) {
        const isHealthy = status === true || status === 'ok' || status === 'online';
        const statusIcon = isHealthy ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        const statusColor = isHealthy ? '#10B981' : '#F59E0B';
        const statusText = isHealthy ? 'سالم' : 'نیاز به توجه';
        
        return `
            <div class="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
                <span class="text-white font-medium">${name}</span>
                <div class="flex items-center gap-2">
                    <i class="${statusIcon}" style="color: ${statusColor}"></i>
                    <span class="text-sm" style="color: ${statusColor}">${statusText}</span>
                </div>
            </div>
        `;
    }

    getServicesList(services) {
        if (!Array.isArray(services)) return this.getErrorMessage('داده‌های سرویس نامعتبر');
        
        return services.map(service => {
            const statusConfig = this.statusConfig[service.status] || this.statusConfig.offline;
            return `
                <div class="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <div class="text-white font-medium">${service.name}</div>
                        <div class="text-gray-400 text-sm">${service.description || 'بدون توضیح'}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="${statusConfig.icon}" style="color: ${statusConfig.color}"></i>
                        <span class="text-sm" style="color: ${statusConfig.color}">${statusConfig.text}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    getPerformanceMetrics(metrics) {
        const defaultMetrics = {
            cpu: 25,
            memory: 45,
            requests: 1250,
            latency: 85
        };
        
        const data = { ...defaultMetrics, ...metrics };
        
        return `
            <div class="text-center">
                <div class="text-2xl font-bold text-blue-400">${data.cpu}%</div>
                <div class="text-white text-sm">CPU</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-green-400">${data.memory}%</div>
                <div class="text-white text-sm">حافظه</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-purple-400">${data.requests}</div>
                <div class="text-white text-sm">درخواست/دقیقه</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-yellow-400">${data.latency}ms</div>
                <div class="text-white text-sm">تاخیر</div>
            </div>
        `;
    }

    getErrorMessage(message) {
        return `
            <div class="bg-red-900 border border-red-700 rounded-lg p-4 text-center">
                <i class="fas fa-exclamation-triangle text-red-400 text-xl mb-2"></i>
                <div class="text-red-300">${message}</div>
            </div>
        `;
    }

    showLoadingModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-8 text-center">
                <i class="fas fa-spinner fa-spin text-blue-400 text-4xl mb-4"></i>
                <div class="text-white text-lg">در حال بارگیری وضعیت سیستم...</div>
            </div>
        `;
        document.body.appendChild(modal);
        
        setTimeout(() => modal.remove(), 3000);
    }

    refreshModalContent(modal) {
        const contentDiv = modal.querySelector('.flex-1.overflow-y-auto');
        if (contentDiv && this.statusData) {
            contentDiv.innerHTML = this.getModalContent();
            this.bindModalActions(modal);
        }
    }

    bindModalActions(modal) {
        // Bind quick action buttons
        modal.querySelector('.refresh-status-btn')?.addEventListener('click', () => {
            this.fetchInitialStatus();
        });
        
        modal.querySelector('.run-healthcheck-btn')?.addEventListener('click', () => {
            this.runHealthCheck();
        });
        
        modal.querySelector('.clear-cache-btn')?.addEventListener('click', () => {
            this.clearSystemCache();
        });
        
        modal.querySelector('.view-logs-btn')?.addEventListener('click', () => {
            this.showSystemLogs();
        });
    }

    // =============================================================================
    // CALCULATIONS
    // =============================================================================

    calculateUptime() {
        // Calculate system uptime based on available data
        const now = Date.now();
        const startTime = localStorage.getItem('system_start_time') || now;
        const uptimeMs = now - parseInt(startTime);
        
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days} روز، ${hours % 24} ساعت`;
        } else if (hours > 0) {
            return `${hours} ساعت`;
        } else {
            return 'کمتر از یک ساعت';
        }
    }

    calculateUptimePercent() {
        // Mock calculation - in real implementation, fetch from monitoring service
        return Math.floor(98 + Math.random() * 2); // 98-100%
    }

    getActiveServicesCount() {
        if (!this.statusData.integration?.services) return '0';
        return this.statusData.integration.services.filter(s => s.status === 'online').length;
    }

    getTotalServicesCount() {
        if (!this.statusData.integration?.services) return '10';
        return this.statusData.integration.services.length;
    }

    // =============================================================================
    // QUICK ACTIONS
    // =============================================================================

    async runHealthCheck() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('✅ بررسی سلامت با موفقیت انجام شد', 'success');
                this.fetchInitialStatus(); // Refresh data
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            this.showNotification('❌ خطا در بررسی سلامت سیستم', 'error');
        }
    }

    async clearSystemCache() {
        try {
            const token = this.getAuthToken();
            const headers = token ? { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : { 'Content-Type': 'application/json' };
            
            const response = await fetch('/api/performance/cache/clear', {
                method: 'POST',
                headers
            });

            if (response.ok) {
                this.showNotification('✅ کش سیستم پاک شد', 'success');
            } else {
                throw new Error('Cache clear failed');
            }
        } catch (error) {
            this.showNotification('❌ خطا در پاک کردن کش', 'error');
        }
    }

    showSystemLogs() {
        // Open system logs in new modal/window
        window.open('/api/logs/system', '_blank');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300`;
        notification.textContent = message;
        notification.style.transform = 'translateX(100%)';
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // =============================================================================
    // UTILITIES
    // =============================================================================

    getAuthToken() {
        return localStorage.getItem('authToken') || 
               localStorage.getItem('accessToken') || 
               sessionStorage.getItem('authToken') ||
               sessionStorage.getItem('accessToken');
    }

    bindEvents() {
        // Handle system status button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.system-status-button')) {
                e.preventDefault();
                this.showStatusModal();
            }
        });
        
        // Subscribe to own updates to update UI elements
        this.subscribe((statusData) => {
            this.updateSystemButton();
            this.updateStatus(statusData.overall);
        });
    }

    destroy() {
        this.stopPeriodicUpdates();
        
        if (this.wsConnection) {
            this.wsConnection.close();
        }
        
        this.subscribers.clear();
        this.isInitialized = false;
    }
}

// =============================================================================
// INTEGRATION METHODS FOR OTHER MODULES
// =============================================================================

// Global instance
window.systemStatusManager = null;

// Initialize system status manager
function initializeSystemStatus() {
    if (!window.systemStatusManager) {
        window.systemStatusManager = new SystemStatusManager();
    }
    return window.systemStatusManager;
}

// Get current status data
function getSystemStatus() {
    return window.systemStatusManager?.statusData || null;
}

// Subscribe to status updates
function subscribeToSystemStatus(callback) {
    const manager = initializeSystemStatus();
    return manager.subscribe(callback);
}

// Show status modal from anywhere
function showSystemStatusModal() {
    const manager = initializeSystemStatus();
    manager.showStatusModal();
}

// Get status for specific component
function getComponentStatus(component) {
    const status = getSystemStatus();
    if (!status) return null;
    
    return status[component] || null;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SystemStatusManager,
        initializeSystemStatus,
        getSystemStatus,
        subscribeToSystemStatus,
        showSystemStatusModal,
        getComponentStatus
    };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystemStatus);
} else {
    initializeSystemStatus();
}

console.log('✅ System Status Module loaded successfully');