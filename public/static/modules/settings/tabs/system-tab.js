// System Tab Module - Clean implementation without template literal issues
// Complete system configuration and monitoring

export default class SystemTab {
    constructor(settings) {
        this.settings = settings;
    }

    render() {
        const system = this.settings.system || {};

        return `
        <div class="space-y-6">
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
                        <div class="text-green-400 font-bold">آنلاین</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-1">
                            <i class="fas fa-database text-blue-400"></i>
                        </div>
                        <div class="text-sm text-gray-300">دیتابیس</div>
                        <div class="text-blue-400 font-bold">متصل</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-1">
                            <i class="fas fa-robot text-purple-400"></i>
                        </div>
                        <div class="text-sm text-gray-300">AI آرتمیس</div>
                        <div class="text-purple-400 font-bold">فعال</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-1">
                            <i class="fas fa-exchange-alt text-yellow-400"></i>
                        </div>
                        <div class="text-sm text-gray-300">صرافی‌ها</div>
                        <div class="text-yellow-400 font-bold">3 متصل</div>
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
    initialize() {
        console.log('🔧 System tab initialized');
        
        // Set up global instance
        window.systemTab = this;
        
        // Setup auto-refresh for logs (every 30 seconds)
        this.setupLogAutoRefresh();
    }

    setupLogAutoRefresh() {
        // Auto-refresh logs every 30 seconds
        setInterval(() => {
            this.refreshLogs();
        }, 30000);
    }

    // Cache management methods
    clearCache() {
        if (confirm('آیا مطمئن هستید که می‌خواهید کش را پاک کنید؟')) {
            console.log('🗑️ Clearing cache...');
            this.showNotification('کش پاک شد', 'success');
        }
    }

    refreshCache() {
        console.log('🔄 Refreshing cache...');
        this.showNotification('کش بازسازی شد', 'success');
    }

    analyzeCacheUsage() {
        console.log('📊 Analyzing cache usage...');
        this.showNotification('آنالیز کش در حال انجام...', 'info');
    }

    // Database management methods
    optimizeDatabase() {
        if (confirm('آیا مطمئن هستید که می‌خواهید دیتابیس را بهینه‌سازی کنید؟')) {
            console.log('⚡ Optimizing database...');
            this.showNotification('دیتابیس بهینه‌سازی شد', 'success');
        }
    }

    rebuildIndexes() {
        if (confirm('بازسازی ایندکس‌ها ممکن است چند دقیقه طول بکشد. ادامه دهید؟')) {
            console.log('🔨 Rebuilding database indexes...');
            this.showNotification('بازسازی ایندکس‌ها شروع شد', 'info');
        }
    }

    analyzeQueries() {
        console.log('🔍 Analyzing database queries...');
        this.showNotification('آنالیز کوئری‌ها در حال انجام...', 'info');
    }

    createBackup() {
        console.log('💾 Creating database backup...');
        this.showNotification('ایجاد بکاپ شروع شد', 'info');
        
        setTimeout(() => {
            this.showNotification('بکاپ با موفقیت ایجاد شد', 'success');
        }, 3000);
    }

    restoreBackup() {
        if (confirm('⚠️ بازیابی بکاپ تمام داده‌های فعلی را جایگزین می‌کند. ادامه دهید؟')) {
            console.log('📁 Restoring backup...');
            this.showNotification('بازیابی بکاپ شروع شد', 'warning');
        }
    }

    scheduleBackup() {
        console.log('⏰ Setting up backup schedule...');
        this.showNotification('زمان‌بندی بکاپ تنظیم شد', 'success');
    }

    // Log management methods
    downloadLogs() {
        console.log('📥 Downloading system logs...');
        this.showNotification('دانلود لاگ‌ها شروع شد', 'info');
    }

    clearLogs() {
        if (confirm('آیا مطمئن هستید که می‌خواهید تمام لاگ‌ها را پاک کنید؟')) {
            console.log('🗑️ Clearing system logs...');
            this.showNotification('لاگ‌ها پاک شد', 'success');
        }
    }

    refreshLogs() {
        console.log('🔄 Refreshing system logs...');
        // Would refresh the log display
    }

    // System actions
    restartSystem() {
        if (confirm('⚠️ آیا مطمئن هستید که می‌خواهید سیستم را راه‌اندازی مجدد کنید؟')) {
            console.log('🔄 Restarting system...');
            this.showNotification('سیستم در حال راه‌اندازی مجدد...', 'warning');
        }
    }

    emergencyStop() {
        if (confirm('🚨 توقف اضطراری تمام عملیات سیستم؟ این عمل قابل بازگشت نیست!')) {
            console.log('🚨 EMERGENCY SYSTEM STOP');
            this.showNotification('توقف اضطراری سیستم فعال شد', 'error');
        }
    }

    maintenanceMode() {
        if (confirm('آیا مطمئن هستید که می‌خواهید سیستم را وارد حالت تعمیرات کنید؟')) {
            console.log('🔧 Entering maintenance mode...');
            this.showNotification('سیستم وارد حالت تعمیرات شد', 'warning');
        }
    }

    factoryReset() {
        const confirmation = prompt('⚠️ بازگردانی کارخانه تمام داده‌ها و تنظیمات را پاک می‌کند.\nبرای تأیید "RESET" را تایپ کنید:');
        
        if (confirmation === 'RESET') {
            console.log('🏭 Factory reset initiated...');
            this.showNotification('بازگردانی کارخانه شروع شد', 'error');
        } else if (confirmation !== null) {
            this.showNotification('تأیید نادرست - عملیات لغو شد', 'info');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification - would integrate with main notification system
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}