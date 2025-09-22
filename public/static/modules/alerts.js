/**
 * Alerts Module - Market Alerts and Notifications System
 * Handles alert management, templates, and notifications
 */

class AlertsManager {
    constructor() {
        this.alerts = [];
        this.templates = [];
        this.settings = {};
        this.statistics = {};
        this.marketPrices = {};
        this.refreshInterval = null;
    }

    // Get authentication headers for API calls
    getAuthHeaders() {
        const token = localStorage.getItem('titan_auth_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Initialize alerts system
    async init() {
        try {
            await this.loadDashboardData();
            this.startPriceMonitoring();
            console.log('✅ Alerts system initialized');
        } catch (error) {
            console.error('❌ Alerts system initialization failed:', error);
        }
    }

    // Load comprehensive dashboard data
    async loadDashboardData() {
        try {
            const response = await axios.get('/api/alerts/dashboard', {
                headers: this.getAuthHeaders()
            });
            if (response.data.success) {
                const data = response.data.data;
                this.alerts = data.alerts;
                this.statistics = data.statistics;
                this.settings = data.settings;
                this.marketPrices = data.marketPrices;
                return data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }

    // Load alert templates
    async loadTemplates() {
        try {
            const response = await axios.get('/api/alerts/templates', {
                headers: this.getAuthHeaders()
            });
            if (response.data.success) {
                this.templates = response.data.data;
                return this.templates;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
            throw error;
        }
    }

    // Create new alert
    async createAlert(alertData) {
        try {
            const response = await axios.post('/api/alerts', alertData, {
                headers: this.getAuthHeaders()
            });
            if (response.data.success) {
                this.alerts.push(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    }

    // Create alert from template
    async createAlertFromTemplate(templateId, params) {
        try {
            const response = await axios.post('/api/alerts/from-template', {
                templateId,
                ...params
            }, {
                headers: this.getAuthHeaders()
            });
            if (response.data.success) {
                this.alerts.push(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error creating alert from template:', error);
            throw error;
        }
    }

    // Update existing alert
    async updateAlert(alertId, updateData) {
        try {
            const response = await axios.put(`/api/alerts/${alertId}`, updateData, { headers: this.getAuthHeaders() });
            if (response.data.success) {
                const index = this.alerts.findIndex(a => a.id === alertId);
                if (index !== -1) {
                    this.alerts[index] = { ...this.alerts[index], ...response.data.data };
                }
                return response.data.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error updating alert:', error);
            throw error;
        }
    }

    // Delete alert
    async deleteAlert(alertId) {
        try {
            const response = await axios.delete(`/api/alerts/${alertId}`, { headers: this.getAuthHeaders() });
            if (response.data.success) {
                this.alerts = this.alerts.filter(a => a.id !== alertId);
                return true;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error deleting alert:', error);
            throw error;
        }
    }

    // Toggle alert status
    async toggleAlert(alertId, enabled) {
        try {
            const response = await axios.patch(`/api/alerts/${alertId}/toggle`, { enabled }, { headers: this.getAuthHeaders() });
            if (response.data.success) {
                const index = this.alerts.findIndex(a => a.id === alertId);
                if (index !== -1) {
                    this.alerts[index].isActive = enabled;
                }
                return response.data.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error toggling alert:', error);
            throw error;
        }
    }

    // Bulk operations
    async performBulkOperation(operation, alertIds) {
        try {
            const response = await axios.post('/api/alerts/bulk', {
                operation,
                alertIds
            }, { headers: this.getAuthHeaders() });
            if (response.data.success) {
                // Refresh alerts data
                await this.loadDashboardData();
                return response.data.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error performing bulk operation:', error);
            throw error;
        }
    }

    // Update notification settings
    async updateSettings(settingsData) {
        try {
            const response = await axios.put('/api/alerts/settings', settingsData, { headers: this.getAuthHeaders() });
            if (response.data.success) {
                this.settings = { ...this.settings, ...response.data.data };
                return response.data.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    // Start monitoring prices for alerts
    startPriceMonitoring() {
        // Update prices every 30 seconds
        this.refreshInterval = setInterval(async () => {
            try {
                const symbols = [...new Set(this.alerts.map(a => a.symbol))];
                if (symbols.length > 0) {
                    const response = await axios.get(`/api/alerts/market-prices?symbols=${symbols.join(',')}`, {
                        headers: this.getAuthHeaders()
                    });
                    if (response.data.success) {
                        this.marketPrices = { ...this.marketPrices, ...response.data.data.prices };
                        this.checkAlertConditions();
                    }
                }
            } catch (error) {
                console.warn('Price monitoring error:', error);
            }
        }, 30000);
    }

    // Stop price monitoring
    stopPriceMonitoring() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Check alert conditions locally (for UI feedback)
    checkAlertConditions() {
        this.alerts.forEach(alert => {
            if (!alert.isActive) return;

            const currentPrice = this.marketPrices[alert.symbol];
            if (!currentPrice) return;

            let triggered = false;

            switch (alert.alertType) {
                case 'price_above':
                    triggered = currentPrice > alert.targetPrice;
                    break;
                case 'price_below':
                    triggered = currentPrice < alert.targetPrice;
                    break;
                // Add more alert type checks as needed
            }

            // Update UI to show alert status
            if (triggered) {
                this.showAlertTriggeredIndicator(alert, currentPrice);
            }
        });
    }

    // Show alert triggered indicator
    showAlertTriggeredIndicator(alert, currentPrice) {
        // This would update the UI to show that an alert was triggered
        console.log(`🚨 Alert triggered: ${alert.alertName} at ${currentPrice}`);
        
        // You could show a notification or update the alert row
        this.showNotification(`هشدار فعال شد: ${alert.alertName}`, 'success');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Test alert notification
    async testNotification(alertId, notificationType) {
        try {
            const response = await axios.post('/api/alerts/test-notification', {
                alertId,
                notificationType
            }, {
                headers: this.getAuthHeaders()
            });
            if (response.data.success) {
                this.showNotification('اطلاع‌رسانی آزمایشی ارسال شد', 'success');
                return response.data.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error testing notification:', error);
            throw error;
        }
    }

    // Get alert history
    async getAlertHistory(limit = 20) {
        try {
            const response = await axios.get(`/api/alerts/history?limit=${limit}`, { headers: this.getAuthHeaders() });
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error getting alert history:', error);
            throw error;
        }
    }

    // Cleanup
    destroy() {
        this.stopPriceMonitoring();
    }
}

// Global instance
window.alertsManager = new AlertsManager();

// Alert rendering functions
function renderAlertsPage() {
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2">
                        <i class="fas fa-bell text-yellow-400 mr-3"></i>
                        سیستم هشدارها و اعلان‌ها
                    </h1>
                    <p class="text-gray-400">مدیریت هشدارهای بازار و اطلاع‌رسانی‌های قیمتی</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="showCreateAlertModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>
                        هشدار جدید
                    </button>
                    <button onclick="loadAlertTemplates()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-template mr-2"></i>
                        قالب‌ها
                    </button>
                    <button onclick="showSettingsModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-cog mr-2"></i>
                        تنظیمات
                    </button>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div id="alertsStatistics" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center">
                        <i class="fas fa-bell text-blue-400 text-2xl mr-4"></i>
                        <div>
                            <p class="text-gray-400 text-sm">کل هشدارها</p>
                            <p class="text-2xl font-bold text-white">-</p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-400 text-2xl mr-4"></i>
                        <div>
                            <p class="text-gray-400 text-sm">هشدارهای فعال</p>
                            <p class="text-2xl font-bold text-white">-</p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center">
                        <i class="fas fa-fire text-orange-400 text-2xl mr-4"></i>
                        <div>
                            <p class="text-gray-400 text-sm">فعال شده امروز</p>
                            <p class="text-2xl font-bold text-white">-</p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center">
                        <i class="fas fa-chart-line text-purple-400 text-2xl mr-4"></i>
                        <div>
                            <p class="text-gray-400 text-sm">نماد پربازده</p>
                            <p class="text-2xl font-bold text-white">-</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Tabs -->
            <div class="bg-gray-800 rounded-lg">
                <!-- Tab Headers -->
                <div class="border-b border-gray-700">
                    <nav class="flex space-x-8 space-x-reverse px-6">
                        <button onclick="switchAlertsTab('active')" id="tab-active" class="alert-tab py-4 px-2 border-b-2 border-blue-500 text-blue-500 font-medium">
                            هشدارهای فعال
                        </button>
                        <button onclick="switchAlertsTab('history')" id="tab-history" class="alert-tab py-4 px-2 border-b-2 border-transparent text-gray-400 hover:text-gray-300 font-medium">
                            تاریخچه
                        </button>
                        <button onclick="switchAlertsTab('templates')" id="tab-templates" class="alert-tab py-4 px-2 border-b-2 border-transparent text-gray-400 hover:text-gray-300 font-medium">
                            قالب‌ها
                        </button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div id="alertsTabContent" class="p-6">
                    <div class="text-center py-8">
                        <div class="loading-spinner mx-auto mb-4"></div>
                        <p class="text-gray-400">در حال بارگذاری هشدارها...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create Alert Modal -->
        <div id="createAlertModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">ایجاد هشدار جدید</h3>
                    <button onclick="closeCreateAlertModal()" class="text-gray-400 hover:text-gray-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="createAlertForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نام هشدار</label>
                        <input type="text" id="alertName" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نماد ارز</label>
                        <select id="alertSymbol" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" required>
                            <option value="">انتخاب کنید</option>
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="ADA">Cardano (ADA)</option>
                            <option value="SOL">Solana (SOL)</option>
                            <option value="DOT">Polkadot (DOT)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نوع هشدار</label>
                        <select id="alertType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" onchange="updateAlertFields()" required>
                            <option value="">انتخاب کنید</option>
                            <option value="price_above">قیمت بالای مقدار</option>
                            <option value="price_below">قیمت پایین مقدار</option>
                            <option value="percentage_change_up">افزایش درصدی</option>
                            <option value="percentage_change_down">کاهش درصدی</option>
                            <option value="volume_surge">افزایش حجم</option>
                        </select>
                    </div>
                    
                    <div id="priceFields" class="hidden">
                        <label class="block text-sm font-medium text-gray-300 mb-2">قیمت هدف (دلار)</label>
                        <input type="number" id="targetPrice" step="0.01" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    </div>
                    
                    <div id="percentageFields" class="hidden">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">درصد تغییر</label>
                                <input type="number" id="percentageChange" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">بازه زمانی</label>
                                <select id="timePeriod" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                                    <option value="1h">1 ساعت</option>
                                    <option value="4h">4 ساعت</option>
                                    <option value="24h">24 ساعت</option>
                                    <option value="7d">7 روز</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">روش‌های اطلاع‌رسانی</label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="notifyPush" class="mr-2" checked>
                                <span class="text-gray-300">اعلان Push</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="notifyEmail" class="mr-2">
                                <span class="text-gray-300">ایمیل</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                            ایجاد هشدار
                        </button>
                        <button type="button" onclick="closeCreateAlertModal()" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg">
                            انصراف
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Settings Modal -->
        <div id="settingsModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">تنظیمات اطلاع‌رسانی</h3>
                    <button onclick="closeSettingsModal()" class="text-gray-400 hover:text-gray-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="settingsForm" class="space-y-4">
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="enablePushNotifications" class="mr-2">
                            <span class="text-gray-300">فعال‌سازی اعلان‌های Push</span>
                        </label>
                    </div>
                    
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="enableEmailNotifications" class="mr-2">
                            <span class="text-gray-300">فعال‌سازی اعلان‌های ایمیل</span>
                        </label>
                    </div>
                    
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="enableTelegramNotifications" class="mr-2">
                            <span class="text-gray-300">فعال‌سازی اعلان‌های تلگرام</span>
                        </label>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Chat ID تلگرام</label>
                        <input type="text" id="telegramChatId" placeholder="123456789 یا @username" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">ساعات سکوت</label>
                        <div class="grid grid-cols-2 gap-3">
                            <input type="time" id="quietHoursStart" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                            <input type="time" id="quietHoursEnd" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر هشدار در روز</label>
                        <input type="number" id="maxAlertsPerDay" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    </div>
                    
                    <!-- Test Notifications -->
                    <div class="border-t border-gray-600 pt-4 mt-4">
                        <label class="block text-sm font-medium text-gray-300 mb-3">تست اطلاع‌رسانی‌ها</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" onclick="testNotification('telegram')" class="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm">
                                تست تلگرام
                            </button>
                            <button type="button" onclick="testNotification('email')" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm">
                                تست ایمیل
                            </button>
                        </div>
                        <button type="button" onclick="checkNotificationStatus()" class="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm">
                            بررسی وضعیت سرویس‌ها
                        </button>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                            ذخیره تنظیمات
                        </button>
                        <button type="button" onclick="closeSettingsModal()" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg">
                            انصراف
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Tab switching function
function switchAlertsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.alert-tab').forEach(tab => {
        tab.classList.remove('border-blue-500', 'text-blue-500');
        tab.classList.add('border-transparent', 'text-gray-400');
    });
    
    document.getElementById(`tab-${tabName}`).classList.remove('border-transparent', 'text-gray-400');
    document.getElementById(`tab-${tabName}`).classList.add('border-blue-500', 'text-blue-500');
    
    // Load content based on tab
    switch (tabName) {
        case 'active':
            loadActiveAlerts();
            break;
        case 'history':
            loadAlertHistory();
            break;
        case 'templates':
            loadAlertTemplates();
            break;
    }
}

// Load active alerts
async function loadActiveAlerts() {
    const content = document.getElementById('alertsTabContent');
    content.innerHTML = `
        <div class="text-center py-4">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-gray-400">در حال بارگذاری هشدارهای فعال...</p>
        </div>
    `;
    
    try {
        await window.alertsManager.loadDashboardData();
        const alerts = window.alertsManager.alerts;
        
        if (alerts.length === 0) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-bell-slash text-gray-500 text-4xl mb-4"></i>
                    <p class="text-gray-400">هشداری ایجاد نشده است</p>
                    <button onclick="showCreateAlertModal()" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>
                        ایجاد اولین هشدار
                    </button>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div class="space-y-4">
                ${alerts.map(alert => `
                    <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4 space-x-reverse">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-bell ${alert.isActive ? 'text-green-400' : 'text-gray-500'} text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-white font-medium">${alert.alertName}</h3>
                                    <p class="text-gray-400 text-sm">${alert.symbol} - ${getAlertTypeLabel(alert.alertType)}</p>
                                    <div class="flex items-center mt-1 text-xs text-gray-500">
                                        <span>ایجاد شده: ${new Date(alert.createdAt).toLocaleDateString('fa-IR')}</span>
                                        ${alert.lastTriggered ? `<span class="mr-4">آخرین فعال‌سازی: ${new Date(alert.lastTriggered).toLocaleDateString('fa-IR')}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-2 space-x-reverse">
                                <div class="text-right mr-4">
                                    ${alert.targetPrice ? `<div class="text-white font-bold">$${alert.targetPrice}</div>` : ''}
                                    ${alert.percentageChange ? `<div class="text-white font-bold">${alert.percentageChange}%</div>` : ''}
                                    <div class="text-xs text-gray-400">فعال‌سازی: ${alert.triggeredCount} بار</div>
                                </div>
                                
                                <button onclick="toggleAlert('${alert.id}', ${!alert.isActive})" class="px-3 py-1 rounded text-sm ${alert.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white">
                                    ${alert.isActive ? 'غیرفعال' : 'فعال'}
                                </button>
                                
                                <button onclick="editAlert('${alert.id}')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                                    ویرایش
                                </button>
                                
                                <button onclick="deleteAlert('${alert.id}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-6 flex justify-between items-center">
                <div class="text-sm text-gray-400">
                    مجموع: ${alerts.length} هشدار (${alerts.filter(a => a.isActive).length} فعال)
                </div>
                <div class="flex gap-2">
                    <button onclick="performBulkOperation('enable')" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                        فعال‌سازی همه
                    </button>
                    <button onclick="performBulkOperation('disable')" class="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm">
                        غیرفعال‌سازی همه
                    </button>
                </div>
            </div>
        `;
        
    } catch (error) {
        content.innerHTML = `
            <div class="bg-red-900 rounded-lg p-4 text-center">
                <i class="fas fa-exclamation-triangle text-red-400 text-2xl mb-4"></i>
                <p class="text-red-400">خطا در بارگذاری هشدارها</p>
                <p class="text-gray-300 text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}

// Load alert history
async function loadAlertHistory() {
    const content = document.getElementById('alertsTabContent');
    content.innerHTML = `
        <div class="text-center py-4">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-gray-400">در حال بارگذاری تاریخچه...</p>
        </div>
    `;
    
    try {
        const history = await window.alertsManager.getAlertHistory(50);
        
        if (history.length === 0) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-history text-gray-500 text-4xl mb-4"></i>
                    <p class="text-gray-400">تاریخچه‌ای موجود نیست</p>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div class="space-y-3">
                ${history.map(item => `
                    <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3 space-x-reverse">
                                <i class="fas fa-bell text-orange-400"></i>
                                <div>
                                    <div class="text-white font-medium">${item.marketData?.symbol || 'نامعلوم'}</div>
                                    <div class="text-gray-400 text-sm">قیمت فعال‌سازی: $${item.triggerPrice}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-gray-300 text-sm">${new Date(item.triggeredAt).toLocaleDateString('fa-IR')}</div>
                                <div class="text-gray-400 text-xs">${new Date(item.triggeredAt).toLocaleTimeString('fa-IR')}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        content.innerHTML = `
            <div class="bg-red-900 rounded-lg p-4 text-center">
                <p class="text-red-400">خطا در بارگذاری تاریخچه</p>
            </div>
        `;
    }
}

// Load alert templates
async function loadAlertTemplates() {
    const content = document.getElementById('alertsTabContent');
    content.innerHTML = `
        <div class="text-center py-4">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-gray-400">در حال بارگذاری قالب‌ها...</p>
        </div>
    `;
    
    try {
        const templates = await window.alertsManager.loadTemplates();
        
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${templates.map(template => `
                    <div class="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-white font-bold">${template.templateName}</h3>
                            <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded">${template.category}</span>
                        </div>
                        <p class="text-gray-300 text-sm mb-4">${template.description}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-400 text-xs">استفاده شده: ${template.usageCount} بار</span>
                            <button onclick="useTemplate('${template.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">
                                استفاده از قالب
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        content.innerHTML = `
            <div class="bg-red-900 rounded-lg p-4 text-center">
                <p class="text-red-400">خطا در بارگذاری قالب‌ها</p>
            </div>
        `;
    }
}

// Helper functions
function getAlertTypeLabel(alertType) {
    const labels = {
        'price_above': 'قیمت بالای مقدار',
        'price_below': 'قیمت پایین مقدار',
        'percentage_change_up': 'افزایش درصدی',
        'percentage_change_down': 'کاهش درصدی',
        'volume_surge': 'افزایش حجم',
        'rsi_oversold': 'RSI فروش بیش از حد',
        'rsi_overbought': 'RSI خرید بیش از حد'
    };
    return labels[alertType] || alertType;
}

// Modal functions
function showCreateAlertModal() {
    document.getElementById('createAlertModal').classList.remove('hidden');
}

function closeCreateAlertModal() {
    const modal = document.getElementById('createAlertModal');
    modal.classList.add('hidden');
    document.getElementById('createAlertForm').reset();
    updateAlertFields();
    
    // Reset modal to create mode
    const title = modal.querySelector('h3');
    const button = modal.querySelector('button[type="submit"]');
    title.textContent = 'ایجاد هشدار جدید';
    button.textContent = 'ایجاد هشدار';
    
    // Remove editing flag
    delete modal.dataset.editingAlertId;
}

function showSettingsModal() {
    const settings = window.alertsManager.settings;
    if (settings) {
        document.getElementById('enablePushNotifications').checked = settings.pushNotifications;
        document.getElementById('enableEmailNotifications').checked = settings.emailNotifications;
        document.getElementById('enableTelegramNotifications').checked = settings.telegramNotifications;
        document.getElementById('quietHoursStart').value = settings.quietHoursStart || '22:00';
        document.getElementById('quietHoursEnd').value = settings.quietHoursEnd || '08:00';
        document.getElementById('maxAlertsPerDay').value = settings.maxAlertsPerDay || 20;
        document.getElementById('telegramChatId').value = settings.telegramChatId || '';
    }
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function updateAlertFields() {
    const alertType = document.getElementById('alertType').value;
    const priceFields = document.getElementById('priceFields');
    const percentageFields = document.getElementById('percentageFields');
    
    priceFields.classList.add('hidden');
    percentageFields.classList.add('hidden');
    
    if (alertType === 'price_above' || alertType === 'price_below') {
        priceFields.classList.remove('hidden');
    } else if (alertType === 'percentage_change_up' || alertType === 'percentage_change_down') {
        percentageFields.classList.remove('hidden');
    }
}

// Action functions
async function toggleAlert(alertId, enabled) {
    try {
        await window.alertsManager.toggleAlert(alertId, enabled);
        window.alertsManager.showNotification(`هشدار با موفقیت ${enabled ? 'فعال' : 'غیرفعال'} شد`, 'success');
        loadActiveAlerts(); // Refresh
    } catch (error) {
        window.alertsManager.showNotification('خطا در تغییر وضعیت هشدار: ' + error.message, 'error');
    }
}

async function deleteAlert(alertId) {
    if (!confirm('آیا از حذف این هشدار اطمینان دارید؟')) return;
    
    try {
        await window.alertsManager.deleteAlert(alertId);
        window.alertsManager.showNotification('هشدار با موفقیت حذف شد', 'success');
        loadActiveAlerts(); // Refresh
    } catch (error) {
        window.alertsManager.showNotification('خطا در حذف هشدار: ' + error.message, 'error');
    }
}

async function editAlert(alertId) {
    try {
        // Get alert data
        const alert = window.alertsManager.alerts.find(a => a.id === alertId);
        if (!alert) {
            window.alertsManager.showNotification('هشدار یافت نشد', 'error');
            return;
        }
        
        // Pre-fill the create modal with existing data
        document.getElementById('alertName').value = alert.alertName;
        document.getElementById('alertSymbol').value = alert.symbol;
        document.getElementById('alertType').value = alert.alertType;
        
        if (alert.targetPrice) {
            document.getElementById('targetPrice').value = alert.targetPrice;
        }
        if (alert.percentageChange) {
            document.getElementById('percentageChange').value = alert.percentageChange;
        }
        if (alert.timePeriod) {
            document.getElementById('timePeriod').value = alert.timePeriod;
        }
        
        // Set notification methods
        document.getElementById('notifyPush').checked = alert.notificationMethods.includes('push') || alert.notificationMethods.includes('web');
        document.getElementById('notifyEmail').checked = alert.notificationMethods.includes('email');
        
        updateAlertFields();
        
        // Change modal title and button to indicate editing
        const modal = document.getElementById('createAlertModal');
        const title = modal.querySelector('h3');
        const button = modal.querySelector('button[type="submit"]');
        
        title.textContent = 'ویرایش هشدار';
        button.textContent = 'بروزرسانی هشدار';
        
        // Store the alert ID for update
        modal.dataset.editingAlertId = alertId;
        
        // Show modal
        modal.classList.remove('hidden');
        
    } catch (error) {
        window.alertsManager.showNotification('خطا در بارگذاری اطلاعات هشدار: ' + error.message, 'error');
    }
}

async function useTemplate(templateId) {
    try {
        // Get template data
        const template = window.alertsManager.templates.find(t => t.id === templateId);
        if (!template) {
            window.alertsManager.showNotification('قالب یافت نشد', 'error');
            return;
        }
        
        // Pre-fill the create modal with template data
        document.getElementById('alertName').value = template.templateName;
        document.getElementById('alertType').value = template.alertType;
        
        // Apply default configuration from template
        if (template.defaultConfig) {
            if (template.defaultConfig.notificationMethods) {
                document.getElementById('notifyPush').checked = template.defaultConfig.notificationMethods.includes('push') || template.defaultConfig.notificationMethods.includes('web');
                document.getElementById('notifyEmail').checked = template.defaultConfig.notificationMethods.includes('email');
            }
            
            if (template.defaultConfig.timePeriod) {
                document.getElementById('timePeriod').value = template.defaultConfig.timePeriod;
            }
        }
        
        updateAlertFields();
        
        // Show create modal
        showCreateAlertModal();
        
        // Show success message
        window.alertsManager.showNotification(`قالب "${template.templateName}" بارگذاری شد`, 'success');
        
    } catch (error) {
        window.alertsManager.showNotification('خطا در بارگذاری قالب: ' + error.message, 'error');
    }
}

async function performBulkOperation(operation) {
    const alertIds = window.alertsManager.alerts.map(a => a.id);
    if (alertIds.length === 0) return;
    
    try {
        const result = await window.alertsManager.performBulkOperation(operation, alertIds);
        window.alertsManager.showNotification(`عملیات ${operation} روی ${result.successCount} هشدار انجام شد`, 'success');
        loadActiveAlerts(); // Refresh
    } catch (error) {
        window.alertsManager.showNotification('خطا در انجام عملیات گروهی: ' + error.message, 'error');
    }
}

// Test notification function
async function testNotification(type) {
    try {
        const token = localStorage.getItem('titan_auth_token');
        const response = await axios.post('/api/alerts/test-notification', {
            notificationType: type
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            window.alertsManager.showNotification(`تست ${type} با موفقیت ارسال شد!`, 'success');
        } else {
            window.alertsManager.showNotification(`خطا در تست ${type}: ${response.data.error}`, 'error');
        }
    } catch (error) {
        window.alertsManager.showNotification(`خطا در ارسال تست ${type}: ${error.message}`, 'error');
    }
}

// Check notification service status
async function checkNotificationStatus() {
    try {
        const token = localStorage.getItem('titan_auth_token');
        const response = await axios.get('/api/alerts/notification-status', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            const status = response.data.data;
            let message = 'وضعیت سرویس‌های اطلاع‌رسانی:\n\n';
            message += `تلگرام: ${status.telegram ? '✅ فعال' : '❌ غیرفعال'}\n`;
            message += `ایمیل: ${status.email ? '✅ فعال' : '❌ غیرفعال'}\n`;
            message += `SMS: ${status.sms ? '✅ فعال' : '❌ غیرفعال'}\n\n`;
            
            if (status.configurations.telegram.configured) {
                message += `تلگرام بات: پیکربندی شده ✅\n`;
            } else {
                message += `تلگرام بات: نیاز به پیکربندی ❌\n`;
            }
            
            alert(message);
        } else {
            window.alertsManager.showNotification('خطا در دریافت وضعیت سرویس‌ها', 'error');
        }
    } catch (error) {
        window.alertsManager.showNotification('خطا در بررسی وضعیت: ' + error.message, 'error');
    }
}

// Manual trigger alert check
async function manualAlertCheck() {
    try {
        const token = localStorage.getItem('titan_auth_token');
        const response = await axios.post('/api/alerts/trigger-check', {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            window.alertsManager.showNotification('بررسی هشدارها با موفقیت انجام شد', 'success');
        } else {
            window.alertsManager.showNotification('خطا در بررسی هشدارها: ' + response.data.error, 'error');
        }
    } catch (error) {
        window.alertsManager.showNotification('خطا در بررسی هشدارها: ' + error.message, 'error');
    }
}

// Form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Create Alert Form
    const createForm = document.getElementById('createAlertForm');
    if (createForm) {
        createForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const alertData = {
                alertName: document.getElementById('alertName').value,
                symbol: document.getElementById('alertSymbol').value,
                alertType: document.getElementById('alertType').value,
                targetPrice: document.getElementById('targetPrice').value ? parseFloat(document.getElementById('targetPrice').value) : undefined,
                percentageChange: document.getElementById('percentageChange').value ? parseFloat(document.getElementById('percentageChange').value) : undefined,
                timePeriod: document.getElementById('timePeriod').value,
                isActive: true,
                isRecurring: false,
                notificationMethods: []
            };
            
            if (document.getElementById('notifyPush').checked) {
                alertData.notificationMethods.push('push');
            }
            if (document.getElementById('notifyEmail').checked) {
                alertData.notificationMethods.push('email');
            }
            
            try {
                const modal = document.getElementById('createAlertModal');
                const editingAlertId = modal.dataset.editingAlertId;
                
                if (editingAlertId) {
                    // Update existing alert
                    await window.alertsManager.updateAlert(editingAlertId, alertData);
                    window.alertsManager.showNotification('هشدار با موفقیت بروزرسانی شد', 'success');
                    delete modal.dataset.editingAlertId;
                } else {
                    // Create new alert
                    await window.alertsManager.createAlert(alertData);
                    window.alertsManager.showNotification('هشدار با موفقیت ایجاد شد', 'success');
                }
                
                closeCreateAlertModal();
                loadActiveAlerts(); // Refresh
            } catch (error) {
                window.alertsManager.showNotification('خطا در ذخیره هشدار: ' + error.message, 'error');
            }
        });
    }
    
    // Settings Form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const settingsData = {
                pushNotifications: document.getElementById('enablePushNotifications').checked,
                emailNotifications: document.getElementById('enableEmailNotifications').checked,
                telegramNotifications: document.getElementById('enableTelegramNotifications').checked,
                quietHoursStart: document.getElementById('quietHoursStart').value,
                quietHoursEnd: document.getElementById('quietHoursEnd').value,
                maxAlertsPerDay: parseInt(document.getElementById('maxAlertsPerDay').value),
                telegramChatId: document.getElementById('telegramChatId').value
            };
            
            try {
                await window.alertsManager.updateSettings(settingsData);
                window.alertsManager.showNotification('تنظیمات با موفقیت ذخیره شد', 'success');
                closeSettingsModal();
            } catch (error) {
                window.alertsManager.showNotification('خطا در ذخیره تنظیمات: ' + error.message, 'error');
            }
        });
    }
});

// Update statistics display
async function updateAlertsStatistics() {
    try {
        const stats = window.alertsManager.statistics;
        if (!stats) return;
        
        const cards = document.querySelectorAll('#alertsStatistics .bg-gray-800 p-6');
        if (cards.length >= 4) {
            cards[0].querySelector('.text-2xl').textContent = stats.totalAlerts || 0;
            cards[1].querySelector('.text-2xl').textContent = stats.activeAlerts || 0;
            cards[2].querySelector('.text-2xl').textContent = stats.triggeredToday || 0;
            cards[3].querySelector('.text-2xl').textContent = stats.mostTriggeredSymbol || 'N/A';
        }
    } catch (error) {
        console.warn('Error updating statistics:', error);
    }
}

// Initialize when page loads
async function initializeAlertsPage() {
    try {
        await window.alertsManager.init();
        await updateAlertsStatistics();
        loadActiveAlerts(); // Load default tab
    } catch (error) {
        console.error('Failed to initialize alerts page:', error);
    }
}

// Create AlertsModule wrapper class for compatibility
class AlertsModule {
    constructor() {
        this.manager = new AlertsManager();
        this.isInitialized = false;
        this.data = null;
    }

    async initialize() {
        if (!this.isInitialized) {
            try {
                console.log('📊 Loading real alerts data from API...');
                // Load real data from backend APIs
                await this.manager.init();
                this.data = await this.manager.loadDashboardData();
                this.isInitialized = true;
                console.log('✅ Alerts real data loaded:', this.data);
            } catch (error) {
                console.warn('⚠️ Alerts API failed, using fallback data:', error);
                // Provide fallback data instead of failing
                this.data = {
                    alerts: [],
                    statistics: { totalAlerts: 0, activeAlerts: 0, triggeredToday: 0, triggeredThisWeek: 0 },
                    settings: {},
                    marketPrices: {}
                };
                this.isInitialized = true;
            }
        }
    }

    async getContent() {
        // Always try to initialize
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        // Generate content with real data or fallback
        return this.generateRealAlertsContent();
    }

    generateRealAlertsContent() {
        const alerts = this.data?.alerts || [];
        const stats = this.data?.statistics || {};
        
        return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2">
                        <i class="fas fa-bell text-yellow-400 mr-3"></i>
                        سیستم هشدارها و اعلان‌ها
                    </h1>
                    <p class="text-gray-400">مدیریت هشدارهای بازار و اطلاع‌رسانی‌های قیمتی</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="window.alertsModule.showCreateAlertModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>
                        هشدار جدید
                    </button>
                    <button onclick="window.alertsModule.loadAlertTemplates()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-template mr-2"></i>
                        قالب‌ها
                    </button>
                </div>
            </div>

            <!-- Stats Cards with Real Data -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">کل هشدارها</h3>
                            <p class="text-2xl font-bold text-white">${stats.totalAlerts || 0}</p>
                        </div>
                        <i class="fas fa-bell text-blue-400 text-2xl"></i>
                    </div>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">هشدارهای فعال</h3>
                            <p class="text-2xl font-bold text-green-400">${stats.activeAlerts || 0}</p>
                        </div>
                        <i class="fas fa-check-circle text-green-400 text-2xl"></i>
                    </div>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">فعال‌شده امروز</h3>
                            <p class="text-2xl font-bold text-yellow-400">${stats.triggeredToday || 0}</p>
                        </div>
                        <i class="fas fa-calendar-day text-yellow-400 text-2xl"></i>
                    </div>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">این هفته</h3>
                            <p class="text-2xl font-bold text-purple-400">${stats.triggeredThisWeek || 0}</p>
                        </div>
                        <i class="fas fa-calendar-week text-purple-400 text-2xl"></i>
                    </div>
                </div>
            </div>

            <!-- Active Alerts List with Real Data -->
            <div class="bg-gray-800 rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">
                        <i class="fas fa-list-alt text-blue-400 mr-2"></i>
                        هشدارهای فعال
                    </h2>
                    <div class="flex gap-2">
                        <button onclick="window.alertsModule.refreshAlerts()" class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">
                            <i class="fas fa-sync-alt mr-1"></i>
                            بروزرسانی
                        </button>
                    </div>
                </div>
                
                <div id="alerts-container">
                    ${this.generateAlertsListHTML(alerts)}
                </div>
            </div>
        </div>
        `;
    }

    generateAlertsListHTML(alerts) {
        if (!alerts || alerts.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-bell-slash text-gray-500 text-4xl mb-4"></i>
                    <p class="text-gray-400">هیچ هشدار فعالی وجود ندارد</p>
                    <button onclick="window.alertsModule.showCreateAlertModal()" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        اولین هشدار را ایجاد کنید
                    </button>
                </div>
            `;
        }

        return alerts.map(alert => `
            <div class="border border-gray-700 rounded-lg p-4 mb-4 hover:border-gray-600 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-3 h-3 rounded-full ${alert.isActive ? 'bg-green-400' : 'bg-gray-500'} mr-3"></div>
                        <div>
                            <h3 class="text-white font-medium">${alert.alertName || alert.symbol}</h3>
                            <p class="text-gray-400 text-sm">${alert.symbol} - ${alert.alertType}</p>
                            ${alert.description ? `<p class="text-gray-500 text-xs mt-1">${alert.description}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <div class="text-right">
                            ${alert.targetPrice ? `<div class="text-white font-bold">$${alert.targetPrice}</div>` : ''}
                            ${alert.percentageChange ? `<div class="text-white font-bold">${alert.percentageChange}%</div>` : ''}
                            <div class="text-xs text-gray-400">فعال‌شده: ${alert.triggeredCount || 0} بار</div>
                        </div>
                        
                        <div class="flex gap-2">
                            <button onclick="window.alertsModule.toggleAlert('${alert.id}', ${!alert.isActive})" 
                                    class="px-3 py-1 rounded text-sm ${alert.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white">
                                ${alert.isActive ? 'غیرفعال' : 'فعال'}
                            </button>
                            <button onclick="window.alertsModule.editAlert('${alert.id}')" 
                                    class="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="window.alertsModule.deleteAlert('${alert.id}')" 
                                    class="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Real API integration methods
    async refreshAlerts() {
        console.log('🔄 Refreshing alerts data...');
        this.data = await this.manager.loadDashboardData();
        const container = document.getElementById('alerts-container');
        if (container) {
            container.innerHTML = this.generateAlertsListHTML(this.data.alerts || []);
        }
        console.log('✅ Alerts data refreshed');
    }

    async toggleAlert(alertId, enabled) {
        try {
            const token = localStorage.getItem('titan_auth_token');
            const response = await axios.patch(`/api/alerts/${alertId}/toggle`, {
                enabled: enabled
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                await this.refreshAlerts();
                this.showNotification(`هشدار با موفقیت ${enabled ? 'فعال' : 'غیرفعال'} شد`, 'success');
            }
        } catch (error) {
            console.error('Error toggling alert:', error);
            this.showNotification('خطا در تغییر وضعیت هشدار', 'error');
        }
    }

    async deleteAlert(alertId) {
        if (!confirm('آیا مطمئن هستید که می‌خواهید این هشدار را حذف کنید؟')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/alerts/${alertId}`, { headers: this.getAuthHeaders() });
            
            if (response.data.success) {
                await this.refreshAlerts();
                this.showNotification('هشدار با موفقیت حذف شد', 'success');
            }
        } catch (error) {
            console.error('Error deleting alert:', error);
            this.showNotification('خطا در حذف هشدار', 'error');
        }
    }

    showCreateAlertModal() {
        // Show create alert modal
        showCreateAlertModal();
    }

    async editAlert(alertId) {
        // Use the global editAlert function
        await editAlert(alertId);
    }

    loadAlertTemplates() {
        // Load and show alert templates
        this.showNotification('بارگذاری قالب‌ها...', 'info');
        switchAlertsTab('templates');
    }

    getAuthHeaders() {
        const token = localStorage.getItem('titan_auth_token') || localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600', 
            info: 'bg-blue-600',
            warning: 'bg-yellow-600'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-transform duration-300`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    destroy() {
        if (this.manager.refreshInterval) {
            clearInterval(this.manager.refreshInterval);
        }
        this.isInitialized = false;
    }
}

// Register in TitanModules namespace for ModuleLoader
if (typeof window !== 'undefined') {
    window.TitanModules = window.TitanModules || {};
    window.TitanModules.AlertsModule = AlertsModule;
    
    // Global instance for direct access from HTML buttons
    window.alertsModule = null;
    
    console.log('📦 Alerts Module registered in TitanModules');
}

// Export functions for global use
window.AlertsManager = AlertsManager;
window.renderAlertsPage = renderAlertsPage;
window.switchAlertsTab = switchAlertsTab;
window.loadActiveAlerts = loadActiveAlerts;
window.initializeAlertsPage = initializeAlertsPage;
window.showCreateAlertModal = showCreateAlertModal;
window.closeCreateAlertModal = closeCreateAlertModal;
window.showSettingsModal = showSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.updateAlertFields = updateAlertFields;
window.toggleAlert = toggleAlert;
window.deleteAlert = deleteAlert;
window.editAlert = editAlert;
window.useTemplate = useTemplate;
window.performBulkOperation = performBulkOperation;
window.testNotification = testNotification;
window.checkNotificationStatus = checkNotificationStatus;
window.manualAlertCheck = manualAlertCheck;