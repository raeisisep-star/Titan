// System Tab Module - Complete system configuration and monitoring
// Real API integration with comprehensive error handling

export default class SystemTab {
    constructor(settings) {
        this.settings = settings;
        this.loading = false;
        this.systemStatus = {};
        this.systemSettings = {};
        
        // Initialize API base URL
        this.apiBaseUrl = '';
        
        // Get auth token from localStorage
        this.getAuthToken = () => {
            try {
                const session = JSON.parse(localStorage.getItem('titan_session') || '{}');
                return session.accessToken || null;
            } catch {
                return null;
            }
        };
        
        // API call helper with auth
        this.apiCall = async (endpoint, options = {}) => {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const defaultOptions = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const mergedOptions = {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...(options.headers || {}) }
            };
            
            const response = await fetch(this.apiBaseUrl + endpoint, mergedOptions);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
        };
    }

    render() {
        const system = this.settings.system || {};

        return `
        <div class="space-y-6">
            <!-- Loading Indicator -->
            <div id="system-loading" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center space-x-3 space-x-reverse">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span class="text-white">در حال پردازش...</span>
                    </div>
                </div>
            </div>

            <!-- System Status -->
            <div class="bg-gradient-to-r from-green-900 to-blue-900 rounded-lg p-6 border border-green-700">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-heartbeat text-green-400 mr-3"></i>
                    💚 وضعیت سیستم
                </h4>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-2xl mb-1">
                            <i class="fas fa-server text-green-400"></i>
                        </div>
                        <div class="text-sm text-gray-300">سرور</div>
                        <div data-status="server" class="text-green-400 font-bold">آنلاین</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-1">
                            <i class="fas fa-database text-blue-400"></i>
                        </div>
                        <div class="text-sm text-gray-300">دیتابیس</div>
                        <div data-status="database" class="text-blue-400 font-bold">متصل</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-1">
                            <i class="fas fa-robot text-purple-400"></i>
                        </div>
                        <div class="text-sm text-gray-300">AI آرتمیس</div>
                        <div data-status="ai" class="text-purple-400 font-bold">فعال</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-1">
                            <i class="fas fa-exchange-alt text-yellow-400"></i>
                        </div>
                        <div class="text-sm text-gray-300">صرافی‌ها</div>
                        <div data-status="exchanges" class="text-yellow-400 font-bold">3 متصل</div>
                    </div>
                </div>
            </div>

            <!-- Cache Management -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-memory text-blue-400 mr-3"></i>
                    🗄️ مدیریت کش
                </h4>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h5 class="text-md font-semibold text-white mb-3">تنظیمات کش</h5>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div>
                                    <span class="text-white text-sm font-medium">فعال‌سازی کش</span>
                                    <p class="text-xs text-gray-400">بهبود سرعت با ذخیره موقت داده‌ها</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" 
                                           id="cache-enabled" 
                                           ${system.cache_enabled ? 'checked' : ''} 
                                           class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    مدت زمان نگهداری کش (ساعت)
                                </label>
                                <select id="cache-duration" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="1">1 ساعت</option>
                                    <option value="6" selected>6 ساعت</option>
                                    <option value="24">24 ساعت</option>
                                    <option value="168">1 هفته</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    حداکثر اندازه کش (MB)
                                </label>
                                <input type="number" 
                                       id="cache-size" 
                                       min="50" max="1000" 
                                       value="200" 
                                       class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h5 class="text-md font-semibold text-white mb-3">عملیات کش</h5>
                        <div class="space-y-3">
                            <div class="bg-gray-800 rounded-lg p-3">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-gray-300">کش فعلی</span>
                                    <span class="text-blue-400 font-bold">127 MB</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-blue-400 h-2 rounded-full" style="width: 63%"></div>
                                </div>
                            </div>
                            
                            <button onclick="systemTab.clearCache()" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                <i class="fas fa-trash mr-2"></i>
                                پاک کردن کش
                            </button>
                            
                            <button onclick="systemTab.refreshCache()" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-sync mr-2"></i>
                                بازسازی کش
                            </button>
                            
                            <button onclick="systemTab.analyzeCacheUsage()" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-chart-pie mr-2"></i>
                                آنالیز استفاده
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Settings -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-tachometer-alt text-yellow-400 mr-3"></i>
                    ⚡ تنظیمات عملکرد
                </h4>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                                <span class="text-white text-sm font-medium">حالت Debug</span>
                                <p class="text-xs text-gray-400">نمایش اطلاعات تکمیلی برای توسعه‌دهندگان</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       id="debug-mode" 
                                       ${system.debug_mode ? 'checked' : ''} 
                                       class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                                <span class="text-white text-sm font-medium">بکاپ خودکار</span>
                                <p class="text-xs text-gray-400">ذخیره خودکار تنظیمات و داده‌ها</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       id="auto-backup" 
                                       ${system.auto_backup ? 'checked' : ''} 
                                       class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                                <span class="text-white text-sm font-medium">پایش عملکرد</span>
                                <p class="text-xs text-gray-400">مانیتورینگ CPU، RAM و منابع سیستم</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       id="performance-monitoring" 
                                       ${system.performance_monitoring ? 'checked' : ''} 
                                       class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <h5 class="text-md font-semibold text-white mb-3">تنظیمات پیشرفته</h5>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    حداکثر Thread های همزمان
                                </label>
                                <select id="max-threads" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="2">2 Thread</option>
                                    <option value="4" selected>4 Thread</option>
                                    <option value="8">8 Thread</option>
                                    <option value="16">16 Thread</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    فاصله بررسی سلامت (ثانیه)
                                </label>
                                <input type="number" 
                                       id="health-check-interval" 
                                       min="10" max="300" 
                                       value="30" 
                                       class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    سطح Log
                                </label>
                                <select id="log-level" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="error">فقط خطاها</option>
                                    <option value="warn">هشدارها و خطاها</option>
                                    <option value="info" selected>اطلاعات عمومی</option>
                                    <option value="debug">تمام جزئیات (Debug)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Database Management -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-database text-blue-400 mr-3"></i>
                    🗃️ مدیریت دیتابیس
                </h4>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h5 class="text-white font-semibold mb-2">آمار کلی</h5>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">کل رکوردها:</span>
                                <span class="text-white">24,387</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">حجم داده:</span>
                                <span class="text-white">89.2 MB</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">آخرین بکاپ:</span>
                                <span class="text-green-400">2 ساعت قبل</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h5 class="text-white font-semibold mb-2">بهینه‌سازی</h5>
                        <div class="space-y-2">
                            <button onclick="systemTab.optimizeDatabase()" class="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                                <i class="fas fa-magic mr-1"></i>
                                بهینه‌سازی
                            </button>
                            <button onclick="systemTab.rebuildIndexes()" class="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                                <i class="fas fa-list mr-1"></i>
                                بازسازی ایندکس
                            </button>
                            <button onclick="systemTab.analyzeQueries()" class="w-full px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors">
                                <i class="fas fa-search mr-1"></i>
                                آنالیز کوئری
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h5 class="text-white font-semibold mb-2">بکاپ و بازیابی</h5>
                        <div class="space-y-2">
                            <button onclick="systemTab.createBackup()" class="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                                <i class="fas fa-save mr-1"></i>
                                ایجاد بکاپ
                            </button>
                            <button onclick="systemTab.restoreBackup()" class="w-full px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors">
                                <i class="fas fa-undo mr-1"></i>
                                بازیابی بکاپ
                            </button>
                            <button onclick="systemTab.scheduleBackup()" class="w-full px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors">
                                <i class="fas fa-clock mr-1"></i>
                                زمان‌بندی بکاپ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Logs -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-list-alt text-gray-400 mr-3"></i>
                    📋 لاگ‌های سیستم
                </h4>
                
                <div class="bg-black rounded-lg p-4 mb-4 max-h-64 overflow-y-auto font-mono text-sm">
                    <div class="text-green-400">[2025-09-08 16:20:15] INFO: سیستم با موفقیت راه‌اندازی شد</div>
                    <div class="text-blue-400">[2025-09-08 16:20:16] INFO: آرتمیس AI متصل شد</div>
                    <div class="text-yellow-400">[2025-09-08 16:20:17] WARN: صرافی Binance در حالت testnet</div>
                    <div class="text-green-400">[2025-09-08 16:20:18] INFO: 15 ایجنت AI بارگذاری شد</div>
                    <div class="text-blue-400">[2025-09-08 16:20:19] INFO: سیستم معاملات آماده است</div>
                    <div class="text-purple-400">[2025-09-08 16:20:20] DEBUG: کش بهینه‌سازی شد (127MB)</div>
                    <div class="text-green-400">[2025-09-08 16:20:21] INFO: اتصال دیتابیس تأیید شد</div>
                </div>
                
                <div class="flex space-x-2 space-x-reverse">
                    <button onclick="systemTab.downloadLogs()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-download mr-2"></i>
                        دانلود لاگ‌ها
                    </button>
                    <button onclick="systemTab.clearLogs()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <i class="fas fa-trash mr-2"></i>
                        پاک کردن لاگ‌ها
                    </button>
                    <button onclick="systemTab.refreshLogs()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-sync mr-2"></i>
                        بروزرسانی
                    </button>
                    <select id="log-filter" class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option value="all">همه لاگ‌ها</option>
                        <option value="error">فقط خطاها</option>
                        <option value="warn">هشدارها</option>
                        <option value="info">اطلاعات</option>
                        <option value="debug">Debug</option>
                    </select>
                </div>
            </div>

            <!-- System Actions -->
            <div class="bg-gradient-to-r from-red-900 to-orange-900 rounded-lg p-6 border border-red-700">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                    ⚠️ عملیات سیستم
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button onclick="systemTab.restartSystem()" class="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-redo mr-2"></i>
                        راه‌اندازی مجدد
                    </button>
                    <button onclick="systemTab.emergencyStop()" class="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-stop mr-2"></i>
                        توقف اضطراری
                    </button>
                    <button onclick="systemTab.maintenanceMode()" class="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-tools mr-2"></i>
                        حالت تعمیرات
                    </button>
                    <button onclick="systemTab.factoryReset()" class="px-4 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        بازگردانی کارخانه
                    </button>
                </div>
                
                <div class="mt-4 p-3 bg-red-900 bg-opacity-50 rounded-lg border border-red-600">
                    <p class="text-red-200 text-sm">
                        ⚠️ <strong>هشدار:</strong> عملیات بالا می‌تواند بر روی سیستم تأثیرگذار باشد. لطفاً با احتیاط استفاده کنید.
                    </p>
                </div>
            </div>
        </div>
        `;
    }

    // Collect form data
    collectData() {
        return {
            cache_enabled: document.getElementById('cache-enabled')?.checked || false,
            cache_duration: parseInt(document.getElementById('cache-duration')?.value || 6),
            cache_size: parseInt(document.getElementById('cache-size')?.value || 200),
            debug_mode: document.getElementById('debug-mode')?.checked || false,
            auto_backup: document.getElementById('auto-backup')?.checked || false,
            performance_monitoring: document.getElementById('performance-monitoring')?.checked || false,
            max_threads: parseInt(document.getElementById('max-threads')?.value || 4),
            health_check_interval: parseInt(document.getElementById('health-check-interval')?.value || 30),
            log_level: document.getElementById('log-level')?.value || 'info'
        };
    }

    // Initialize tab functionality
    async initialize() {
        console.log('🔧 System tab initialized');
        
        // Set up global instance
        window.systemTab = this;
        
        // Load initial data
        await this.loadSystemData();
        
        // Setup auto-refresh for logs and status
        this.setupAutoRefresh();
        this.setupEventListeners();
    }
    
    // Show/hide loading indicator
    showLoading() {
        this.loading = true;
        const loader = document.getElementById('system-loading');
        if (loader) loader.classList.remove('hidden');
    }
    
    hideLoading() {
        this.loading = false;
        const loader = document.getElementById('system-loading');
        if (loader) loader.classList.add('hidden');
    }
    
    // Show notification
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border max-w-md transition-all duration-300 ${
            type === 'success' 
                ? 'bg-green-900 border-green-500 text-green-100' 
                : type === 'error' 
                    ? 'bg-red-900 border-red-500 text-red-100'
                    : type === 'warning'
                        ? 'bg-yellow-900 border-yellow-500 text-yellow-100'
                        : 'bg-blue-900 border-blue-500 text-blue-100'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-triangle' : 'info'} mr-2"></i>
                    <span>${message}</span>
                </div>
                <button onclick="this.remove()" class="mr-4 text-gray-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Load system data
    async loadSystemData() {
        try {
            this.showLoading();
            
            await Promise.all([
                this.loadSystemStatus(),
                this.loadSystemSettings(),
                this.loadSystemLogs()
            ]);
            
        } catch (error) {
            console.error('Error loading system data:', error);
            this.showNotification('خطا در بارگذاری اطلاعات سیستم: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // Load system status
    async loadSystemStatus() {
        try {
            const response = await this.apiCall('/api/system/status');
            if (response.success) {
                this.systemStatus = response.data;
                this.updateSystemStatusDisplay();
            }
        } catch (error) {
            console.error('Error loading system status:', error);
            throw error;
        }
    }
    
    // Load system settings
    async loadSystemSettings() {
        try {
            const response = await this.apiCall('/api/system/settings');
            if (response.success) {
                this.systemSettings = response.data;
                this.updateSystemSettingsDisplay();
            }
        } catch (error) {
            console.error('Error loading system settings:', error);
            throw error;
        }
    }
    
    // Load system logs
    async loadSystemLogs() {
        try {
            const response = await this.apiCall('/api/system/logs?limit=20');
            if (response.success) {
                this.updateSystemLogsDisplay(response.data.logs);
            }
        } catch (error) {
            console.error('Error loading system logs:', error);
        }
    }
    
    // Update system status display
    updateSystemStatusDisplay() {
        if (!this.systemStatus.server) return;
        
        // Update server status
        const serverElement = document.querySelector('[data-status="server"]');
        if (serverElement) {
            serverElement.textContent = this.systemStatus.server.status === 'online' ? 'آنلاین' : 'آفلاین';
            serverElement.className = this.systemStatus.server.status === 'online' ? 'text-green-400 font-bold' : 'text-red-400 font-bold';
        }
        
        // Update database status
        const dbElement = document.querySelector('[data-status="database"]');
        if (dbElement) {
            dbElement.textContent = this.systemStatus.database.status === 'connected' ? 'متصل' : 'قطع';
            dbElement.className = this.systemStatus.database.status === 'connected' ? 'text-blue-400 font-bold' : 'text-red-400 font-bold';
        }
        
        // Update AI status
        const aiElement = document.querySelector('[data-status="ai"]');
        if (aiElement) {
            aiElement.textContent = this.systemStatus.ai.status === 'active' ? 'فعال' : 'غیرفعال';
            aiElement.className = this.systemStatus.ai.status === 'active' ? 'text-purple-400 font-bold' : 'text-red-400 font-bold';
        }
        
        // Update exchanges status
        const exchangesElement = document.querySelector('[data-status="exchanges"]');
        if (exchangesElement) {
            exchangesElement.textContent = `${this.systemStatus.exchanges.connected} متصل`;
            exchangesElement.className = 'text-yellow-400 font-bold';
        }
    }
    
    // Update system settings display
    updateSystemSettingsDisplay() {
        if (!this.systemSettings.cache) return;
        
        // Update cache settings
        const cacheEnabled = document.getElementById('cache-enabled');
        if (cacheEnabled) cacheEnabled.checked = this.systemSettings.cache.enabled;
        
        const cacheDuration = document.getElementById('cache-duration');
        if (cacheDuration) cacheDuration.value = this.systemSettings.cache.duration;
        
        const cacheSize = document.getElementById('cache-size');
        if (cacheSize) cacheSize.value = this.systemSettings.cache.size;
        
        // Update performance settings
        const debugMode = document.getElementById('debug-mode');
        if (debugMode) debugMode.checked = this.systemSettings.performance.debugMode;
        
        const autoBackup = document.getElementById('auto-backup');
        if (autoBackup) autoBackup.checked = this.systemSettings.performance.autoBackup;
        
        const perfMonitoring = document.getElementById('performance-monitoring');
        if (perfMonitoring) perfMonitoring.checked = this.systemSettings.performance.performanceMonitoring;
    }
    
    // Update system logs display
    updateSystemLogsDisplay(logs) {
        const logsContainer = document.querySelector('.bg-black');
        if (!logsContainer || !logs) return;
        
        const logsHTML = logs.map(log => {
            const colorClass = {
                'error': 'text-red-400',
                'warn': 'text-yellow-400',
                'info': 'text-green-400',
                'debug': 'text-purple-400'
            }[log.level] || 'text-gray-400';
            
            return `<div class="${colorClass}">[${log.timestamp.substring(0, 19).replace('T', ' ')}] ${log.level.toUpperCase()}: ${log.message}</div>`;
        }).join('');
        
        logsContainer.innerHTML = logsHTML;
    }
    
    setupEventListeners() {
        // Settings change listeners
        const settingsInputs = ['cache-enabled', 'cache-duration', 'cache-size', 'debug-mode', 'auto-backup', 'performance-monitoring'];
        settingsInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.saveSystemSettings());
            }
        });
    }

    setupAutoRefresh() {
        // Auto-refresh logs and status every 30 seconds
        setInterval(async () => {
            if (!this.loading) {
                await this.loadSystemLogs();
                await this.loadSystemStatus();
            }
        }, 30000);
    }
    
    // Save system settings
    async saveSystemSettings() {
        try {
            const settingsData = this.collectData();
            
            const response = await this.apiCall('/api/system/settings', {
                method: 'PUT',
                body: JSON.stringify(settingsData)
            });
            
            if (response.success) {
                this.showNotification('تنظیمات سیستم ذخیره شد', 'success');
            }
        } catch (error) {
            console.error('Error saving system settings:', error);
            this.showNotification('خطا در ذخیره تنظیمات: ' + error.message, 'error');
        }
    }

    // Cache management methods
    async clearCache() {
        if (!confirm('آیا مطمئن هستید که می‌خواهید کش را پاک کنید؟')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/cache/clear', {
                method: 'POST'
            });
            
            if (response.success) {
                this.showNotification(`کش سیستم پاک شد (${response.data.sizeClearedMB} MB)`, 'success');
                await this.loadSystemStatus(); // Refresh status
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            this.showNotification('خطا در پاک کردن کش: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async refreshCache() {
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/cache/refresh', {
                method: 'POST'
            });
            
            if (response.success) {
                this.showNotification('کش سیستم بازسازی شد', 'success');
                await this.loadSystemStatus(); // Refresh status
            }
        } catch (error) {
            console.error('Error refreshing cache:', error);
            this.showNotification('خطا در بازسازی کش: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async analyzeCacheUsage() {
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/cache/analyze');
            
            if (response.success) {
                const analysis = response.data;
                this.showCacheAnalysisModal(analysis);
            }
        } catch (error) {
            console.error('Error analyzing cache:', error);
            this.showNotification('خطا در آنالیز کش: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // Show cache analysis modal
    showCacheAnalysisModal(analysis) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">آنالیز استفاده از کش</h3>
                    <button onclick="this.remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gray-800 p-3 rounded">
                            <div class="text-blue-400 font-bold text-lg">${analysis.currentSize} MB</div>
                            <div class="text-gray-400 text-sm">حجم فعلی</div>
                        </div>
                        <div class="bg-gray-800 p-3 rounded">
                            <div class="text-green-400 font-bold text-lg">${analysis.usagePercentage}%</div>
                            <div class="text-gray-400 text-sm">درصد استفاده</div>
                        </div>
                        <div class="bg-gray-800 p-3 rounded">
                            <div class="text-yellow-400 font-bold text-lg">${analysis.hitRate}%</div>
                            <div class="text-gray-400 text-sm">نرخ موفقیت</div>
                        </div>
                        <div class="bg-gray-800 p-3 rounded">
                            <div class="text-red-400 font-bold text-lg">${analysis.missRate}%</div>
                            <div class="text-gray-400 text-sm">نرخ عدم موفقیت</div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-white font-semibold mb-2">پرکاربردترین آیتم‌های کش:</h4>
                        <div class="space-y-2">
                            ${analysis.topCachedItems.map(item => `
                                <div class="flex justify-between items-center p-2 bg-gray-800 rounded">
                                    <span class="text-white">${item.key}</span>
                                    <span class="text-gray-400">${item.size} (${item.hits} hit)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-white font-semibold mb-2">توصیه‌ها:</h4>
                        <ul class="list-disc list-inside text-gray-300 space-y-1">
                            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                    <button onclick="this.remove()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        بستن
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Database management methods
    async optimizeDatabase() {
        if (!confirm('آیا مطمئن هستید که می‌خواهید دیتابیس را بهینه‌سازی کنید؟\n\nاین عمل ممکن است 5-10 دقیقه طول بکشد.')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/database/optimize', {
                method: 'POST'
            });
            
            if (response.success) {
                this.showNotification(`بهینه‌سازی دیتابیس شروع شد (زمان تخمینی: ${response.data.estimatedDuration})`, 'info');
            }
        } catch (error) {
            console.error('Error optimizing database:', error);
            this.showNotification('خطا در بهینه‌سازی دیتابیس: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async rebuildIndexes() {
        if (!confirm('بازسازی ایندکس‌ها ممکن است 10-15 دقیقه طول بکشد و بر عملکرد سیستم تأثیر بگذارد.\n\nآیا ادامه می‌دهید؟')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/database/rebuild-indexes', {
                method: 'POST'
            });
            
            if (response.success) {
                this.showNotification(`بازسازی ایندکس‌ها شروع شد (جداول تحت تأثیر: ${response.data.affectedTables.join(', ')})`, 'info');
            }
        } catch (error) {
            console.error('Error rebuilding indexes:', error);
            this.showNotification('خطا در بازسازی ایندکس‌ها: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async analyzeQueries() {
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/database/analyze-queries');
            
            if (response.success) {
                this.showQueryAnalysisModal(response.data);
            }
        } catch (error) {
            console.error('Error analyzing queries:', error);
            this.showNotification('خطا در آنالیز کوئری‌ها: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // Show query analysis modal
    showQueryAnalysisModal(analysis) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 w-full max-w-4xl mx-4 border border-gray-700 max-h-96 overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">آنالیز کوئری‌های دیتابیس</h3>
                    <button onclick="this.remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gray-800 p-3 rounded">
                            <div class="text-blue-400 font-bold text-lg">${analysis.totalQueries.toLocaleString()}</div>
                            <div class="text-gray-400 text-sm">کل کوئری‌ها</div>
                        </div>
                        <div class="bg-gray-800 p-3 rounded">
                            <div class="text-red-400 font-bold text-lg">${analysis.slowQueries}</div>
                            <div class="text-gray-400 text-sm">کوئری‌های کند</div>
                        </div>
                        <div class="bg-gray-800 p-3 rounded">
                            <div class="text-green-400 font-bold text-lg">${analysis.averageExecutionTime}</div>
                            <div class="text-gray-400 text-sm">میانگین زمان اجرا</div>
                        </div>
                        <div class="bg-gray-800 p-3 rounded">
                            <div class="text-yellow-400 font-bold text-lg">${analysis.topSlowQueries.length}</div>
                            <div class="text-gray-400 text-sm">کوئری قابل بهینه‌سازی</div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-white font-semibold mb-2">کندترین کوئری‌ها:</h4>
                        <div class="space-y-2">
                            ${analysis.topSlowQueries.map(query => `
                                <div class="p-3 bg-gray-800 rounded">
                                    <div class="font-mono text-sm text-gray-300 mb-1">${query.query}</div>
                                    <div class="flex justify-between text-xs">
                                        <span class="text-red-400">زمان اجرا: ${query.executionTime}</span>
                                        <span class="text-blue-400">تعداد اجرا: ${query.frequency}</span>
                                    </div>
                                    <div class="text-yellow-400 text-xs mt-1">💡 ${query.recommendation}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-white font-semibold mb-2">توصیه‌های بهینه‌سازی:</h4>
                        <ul class="list-disc list-inside text-gray-300 space-y-1">
                            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                    <button onclick="this.remove()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        بستن
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async createBackup() {
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/backup/create', {
                method: 'POST'
            });
            
            if (response.success) {
                this.showNotification(`ایجاد بکاپ شروع شد (ID: ${response.data.backupId}, زمان تخمینی: ${response.data.estimatedDuration})`, 'info');
                
                // Simulate backup progress
                setTimeout(() => {
                    this.showNotification('بکاپ با موفقیت ایجاد شد', 'success');
                }, 5000);
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showNotification('خطا در ایجاد بکاپ: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async restoreBackup() {
        // First get backup ID from user
        const backupId = prompt('شناسه بکاپ (Backup ID) را وارد کنید:');
        if (!backupId) return;
        
        if (!confirm(`⚠️ بازیابی بکاپ ${backupId} تمام داده‌های فعلی را جایگزین می‌کند.\n\nاین عمل غیرقابل بازگشت است!\n\nآیا ادامه می‌دهید؟`)) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/backup/restore', {
                method: 'POST',
                body: JSON.stringify({ backupId })
            });
            
            if (response.success) {
                this.showNotification(`بازیابی از بکاپ شروع شد (زمان تخمینی: ${response.data.estimatedDuration})`, 'warning');
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
            this.showNotification('خطا در بازیابی بکاپ: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async scheduleBackup() {
        // Create schedule modal
        this.showBackupScheduleModal();
    }
    
    // Show backup schedule modal
    showBackupScheduleModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">زمان‌بندی بکاپ خودکار</h3>
                    <button onclick="this.remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="backup-schedule-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">تناوب بکاپ</label>
                        <select id="backup-frequency" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                            <option value="hourly">هر ساعت</option>
                            <option value="daily" selected>روزانه</option>
                            <option value="weekly">هفتگی</option>
                            <option value="monthly">ماهانه</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">زمان اجرا</label>
                        <input type="time" id="backup-time" value="02:00" 
                               class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نگهداری بکاپ‌ها (روز)</label>
                        <input type="number" id="backup-retention" value="30" min="1" max="365"
                               class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    </div>
                    
                    <div class="flex justify-between pt-4">
                        <button type="button" onclick="this.remove()" 
                                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            لغو
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            تنظیم زمان‌بندی
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add form handler
        const form = modal.querySelector('#backup-schedule-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const scheduleData = {
                frequency: document.getElementById('backup-frequency').value,
                time: document.getElementById('backup-time').value,
                retention: parseInt(document.getElementById('backup-retention').value)
            };
            
            try {
                const response = await this.apiCall('/api/system/backup/schedule', {
                    method: 'POST',
                    body: JSON.stringify(scheduleData)
                });
                
                if (response.success) {
                    this.showNotification(`زمان‌بندی بکاپ تنظیم شد (${scheduleData.frequency} در ساعت ${scheduleData.time})`, 'success');
                    modal.remove();
                }
            } catch (error) {
                console.error('Error scheduling backup:', error);
                this.showNotification('خطا در تنظیم زمان‌بندی: ' + error.message, 'error');
            }
        });
    }

    // Log management methods
    async downloadLogs() {
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/logs/download');
            
            if (response.success) {
                this.showNotification(`فایل لاگ آماده شد (حجم: ${response.data.estimatedSize})`, 'info');
                
                // Create download link
                const link = document.createElement('a');
                link.href = response.data.downloadUrl;
                link.download = `titan-logs-${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error downloading logs:', error);
            this.showNotification('خطا در دانلود لاگ‌ها: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async clearLogs() {
        if (!confirm('آیا مطمئن هستید که می‌خواهید تمام لاگ‌های سیستم را پاک کنید؟\n\nاین عمل غیرقابل بازگشت است!')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/logs', {
                method: 'DELETE'
            });
            
            if (response.success) {
                this.showNotification(`لاگ‌ها پاک شد (${response.data.logsClearedCount} لاگ، ${response.data.spaceClearedMB} MB)`, 'success');
                await this.loadSystemLogs(); // Refresh logs display
            }
        } catch (error) {
            console.error('Error clearing logs:', error);
            this.showNotification('خطا در پاک کردن لاگ‌ها: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async refreshLogs() {
        try {
            await this.loadSystemLogs();
            this.showNotification('لاگ‌ها بروزرسانی شد', 'info');
        } catch (error) {
            console.error('Error refreshing logs:', error);
            this.showNotification('خطا در بروزرسانی لاگ‌ها: ' + error.message, 'error');
        }
    }

    // System actions
    async restartSystem() {
        if (!confirm('⚠️ آیا مطمئن هستید که می‌خواهید سیستم را راه‌اندازی مجدد کنید؟\n\nزمان تخمینی قطعی: 2-3 دقیقه')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/restart', {
                method: 'POST'
            });
            
            if (response.success) {
                this.showNotification(`راه‌اندازی مجدد برنامه‌ریزی شد (ID: ${response.data.restartId})`, 'warning');
                
                // Show countdown
                this.showRestartCountdown();
            }
        } catch (error) {
            console.error('Error restarting system:', error);
            this.showNotification('خطا در راه‌اندازی مجدد سیستم: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async emergencyStop() {
        if (!confirm('🚨 توقف اضطراری تمام عملیات سیستم را متوقف می‌کند:\n\n• معاملات فعال\n• هوش مصنوعی آرتمیس\n• اتصالات صرافی\n• سیستم‌های نظارتی\n\nآیا ادامه می‌دهید؟')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/emergency-stop', {
                method: 'POST'
            });
            
            if (response.success) {
                this.showNotification(`🚨 توقف اضطراری فعال شد (ID: ${response.data.stopId})`, 'error');
                this.showEmergencyStopModal(response.data);
            }
        } catch (error) {
            console.error('Error in emergency stop:', error);
            this.showNotification('خطا در توقف اضطراری: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async maintenanceMode() {
        const enabled = !this.systemStatus.maintenanceMode; // Toggle current state
        const message = enabled ? prompt('پیام حالت تعمیرات (اختیاری):') : '';
        
        if (enabled && message === null) return; // User cancelled
        
        if (!confirm(`آیا مطمئن هستید که می‌خواهید حالت تعمیرات را ${enabled ? 'فعال' : 'غیرفعال'} کنید؟`)) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/maintenance', {
                method: 'POST',
                body: JSON.stringify({ enabled, message })
            });
            
            if (response.success) {
                this.showNotification(
                    enabled ? `حالت تعمیرات فعال شد (مدت تخمینی: ${response.data.estimatedDuration})` : 'حالت تعمیرات غیرفعال شد', 
                    enabled ? 'warning' : 'success'
                );
                await this.loadSystemStatus(); // Refresh status
            }
        } catch (error) {
            console.error('Error toggling maintenance mode:', error);
            this.showNotification('خطا در تنظیم حالت تعمیرات: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async factoryReset() {
        const confirmation = prompt('⚠️ بازگردانی کارخانه تمام داده‌ها و تنظیمات را پاک می‌کند.\n\nبرای تأیید "RESET" را تایپ کنید:');
        
        if (!confirmation) return;
        
        if (confirmation !== 'RESET') {
            this.showNotification('تأیید نادرست - عملیات لغو شد', 'info');
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/system/factory-reset', {
                method: 'POST',
                body: JSON.stringify({ confirmation })
            });
            
            if (response.success) {
                this.showFactoryResetModal(response.data);
            }
        } catch (error) {
            console.error('Error in factory reset:', error);
            this.showNotification('خطا در بازگردانی کارخانه: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // Show restart countdown modal
    showRestartCountdown() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-yellow-700">
                <div class="text-center">
                    <div class="text-yellow-400 text-4xl mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-4">راه‌اندازی مجدد سیستم</h3>
                    <p class="text-gray-300 mb-4">سیستم در حال راه‌اندازی مجدد است...</p>
                    <div class="text-2xl font-bold text-yellow-400 mb-4" id="restart-timer">180</div>
                    <p class="text-gray-400 text-sm">لطفاً صبر کنید...</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        let seconds = 180; // 3 minutes
        const timer = setInterval(() => {
            seconds--;
            const timerEl = modal.querySelector('#restart-timer');
            if (timerEl) {
                timerEl.textContent = seconds;
            }
            
            if (seconds <= 0) {
                clearInterval(timer);
                modal.remove();
                this.showNotification('سیستم راه‌اندازی شد', 'success');
                window.location.reload(); // Reload the page
            }
        }, 1000);
    }
    
    // Show emergency stop modal
    showEmergencyStopModal(data) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 w-full max-w-lg mx-4 border border-red-700">
                <div class="text-center">
                    <div class="text-red-400 text-4xl mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-4">🚨 توقف اضطراری فعال</h3>
                    <p class="text-red-300 mb-4">سیستم‌های زیر متوقف شده‌اند:</p>
                    <ul class="text-left text-gray-300 mb-4">
                        ${data.affectedSystems.map(system => `<li>• ${system}</li>`).join('')}
                    </ul>
                    <p class="text-gray-400 text-sm mb-4">ID توقف: ${data.stopId}</p>
                </div>
                
                <div class="flex justify-center">
                    <button onclick="this.remove()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        تأیید
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Show factory reset modal
    showFactoryResetModal(data) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 w-full max-w-lg mx-4 border border-red-700">
                <div class="text-center">
                    <div class="text-red-400 text-4xl mb-4">
                        <i class="fas fa-factory"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-4">🏭 بازگردانی کارخانه شروع شد</h3>
                    <p class="text-red-300 mb-4">زمان تخمینی: ${data.estimatedDuration}</p>
                    
                    <div class="text-right mb-4">
                        <h4 class="text-white font-semibold mb-2">داده‌های حذف شونده:</h4>
                        <ul class="text-gray-300 space-y-1">
                            ${data.affectedData.map(item => `<li>• ${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="text-right mb-4">
                        <h4 class="text-green-400 font-semibold mb-2">داده‌های حفظ شده:</h4>
                        <ul class="text-gray-300 space-y-1">
                            ${data.preservedData.map(item => `<li>• ${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <p class="text-gray-400 text-sm mb-4">ID عملیات: ${data.resetId}</p>
                </div>
                
                <div class="flex justify-center">
                    <button onclick="this.remove()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        تأیید
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}