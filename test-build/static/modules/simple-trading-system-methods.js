// Simple Trading and System tabs - Fixed template literal issues
// This file provides clean implementations of getTradingTab and getSystemTab without template literal problems

class SimpleSettingsTabs {
    static getTradingTab() {
        return `
        <div class="space-y-6">
            <!-- Risk Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">⚠️ مدیریت ریسک</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر ریسک هر معامله (%)</label>
                        <input type="number" id="max-risk-per-trade" min="0.1" max="10" step="0.1" value="2.0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر ضرر روزانه (%)</label>
                        <input type="number" id="max-daily-loss" min="1" max="20" step="0.5" value="5.0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر پوزیشن‌های همزمان</label>
                        <input type="number" id="max-positions" min="1" max="50" value="10" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر مبلغ هر معامله (USDT)</label>
                        <input type="number" id="max-amount-per-trade" min="10" max="10000" value="1000" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
            </div>

            <!-- Auto Trading -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">🤖 معاملات خودکار</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="auto-trading-enabled" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">استراتژی‌های فعال</label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-momentum" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Momentum Trading</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-mean-reversion" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Mean Reversion</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-dca" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Dollar Cost Averaging</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداقل درصد اطمینان AI (%)</label>
                        <input type="number" id="min-confidence" min="50" max="99" value="75" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
            </div>

            <!-- Alert Settings -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🔔 هشدارهای معاملاتی</h4>
                <div class="space-y-4">
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای قیمت</span>
                        <input type="checkbox" id="price-alerts" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای معاملات</span>
                        <input type="checkbox" id="trade-alerts" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">بینش‌های هوش مصنوعی</span>
                        <input type="checkbox" id="ai-insights" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای سیستم</span>
                        <input type="checkbox" id="system-alerts" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-green-900 to-blue-900 rounded-lg p-6 border border-green-500">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🚗</span>
                        <h3 class="text-xl font-bold text-white">Autopilot - معاملات خودکار</h3>
                        <div class="px-3 py-1 bg-green-600 text-white text-xs rounded-full">اتوماسیون کامل</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="autopilot-enabled" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="bg-blue-800 rounded-lg p-3 text-center cursor-pointer hover:bg-blue-700 transition-colors border-2 border-blue-500">
                        <div class="text-2xl mb-2">🛡️</div>
                        <div class="font-semibold text-blue-200">محافظه‌کارانه</div>
                        <div class="text-xs text-blue-300 mt-1">ریسک پایین، عایدی پایدار</div>
                    </div>
                    <div class="bg-green-800 rounded-lg p-3 text-center cursor-pointer hover:bg-green-700 transition-colors border-2 border-green-500">
                        <div class="text-2xl mb-2">⚖️</div>
                        <div class="font-semibold text-green-200">متعادل</div>
                        <div class="text-xs text-green-300 mt-1">ریسک متوسط، عایدی مطلوب</div>
                    </div>
                    <div class="bg-orange-800 rounded-lg p-3 text-center cursor-pointer hover:bg-orange-700 transition-colors">
                        <div class="text-2xl mb-2">🚀</div>
                        <div class="font-semibold text-orange-200">تهاجمی</div>
                        <div class="text-xs text-orange-300 mt-1">ریسک بالا، عایدی بالا</div>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button onclick="settingsModule.startAutopilot()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-play mr-2"></i>شروع Autopilot
                    </button>
                    <button onclick="settingsModule.stopAutopilot()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-stop mr-2"></i>توقف فوری
                    </button>
                    <button onclick="settingsModule.testAutopilot()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-vial mr-2"></i>تست حالت
                    </button>
                </div>
            </div>
            
            <!-- Save Button -->
            <div class="flex justify-end">
                <button onclick="settingsModule.saveTradingSettings()" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium">
                    <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                </button>
            </div>
        </div>
        `;
    }

    static getSystemTab() {
        return `
        <div class="space-y-6">
            <!-- Cache Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🧹 مدیریت کش</h4>
                <p class="text-gray-300 text-sm mb-4">
                    برای دیدن آخرین تغییرات و حل مشکلات بارگذاری، کش مرورگر را مدیریت کنید
                </p>
                <div class="space-y-3">
                    <button onclick="settingsModule.clearBrowserCache()" class="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-trash mr-2"></i>پاک کردن کش مرورگر
                    </button>
                    <button onclick="settingsModule.clearApplicationCache()" class="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-broom mr-2"></i>پاک کردن کش برنامه
                    </button>
                    <button onclick="settingsModule.hardRefresh()" class="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-sync-alt mr-2"></i>بارگذاری مجدد کامل
                    </button>
                </div>
            </div>
            
            <!-- Database Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🗄️ مدیریت دیتابیس</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-3">
                        <button onclick="settingsModule.backupDatabase()" class="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-download mr-2"></i>پشتیبان‌گیری
                        </button>
                        <button onclick="settingsModule.restoreDatabase()" class="w-full bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-upload mr-2"></i>بازیابی از بک‌آپ
                        </button>
                    </div>
                    <div class="space-y-3">
                        <button onclick="settingsModule.optimizeDatabase()" class="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-tools mr-2"></i>بهینه‌سازی
                        </button>
                        <button onclick="settingsModule.resetDatabase()" class="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-exclamation-triangle mr-2"></i>ریست کامل
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Performance Settings -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">⚡ تنظیمات عملکرد</h4>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">فاصله به‌روزرسانی (ثانیه)</label>
                        <select id="update-interval" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="1">1 ثانیه (زیاد)</option>
                            <option value="5" selected>5 ثانیه (متوسط)</option>
                            <option value="10">10 ثانیه (کم)</option>
                            <option value="30">30 ثانیه (خیلی کم)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر تاریخچه نگهداری (روز)</label>
                        <input type="number" id="max-history-days" min="1" max="365" value="30" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">فعال‌سازی حالت کارایی بالا</span>
                        <input type="checkbox" id="high-performance-mode" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">فشرده‌سازی داده‌ها</span>
                        <input type="checkbox" id="data-compression" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                </div>
            </div>
            
            <!-- System Configuration -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🔧 پیکربندی سیستم</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حالت اجرای سیستم</label>
                        <select id="system-mode" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="production" selected>تولید (Production)</option>
                            <option value="development">توسعه (Development)</option>
                            <option value="testing">تست (Testing)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">سطح لاگ</label>
                        <select id="log-level" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="error">فقط خطا</option>
                            <option value="warn">هشدار و خطا</option>
                            <option value="info" selected>اطلاعات عمومی</option>
                            <option value="debug">همه (Debug)</option>
                        </select>
                    </div>
                </div>
                
                <div class="mt-4 space-y-3">
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">فعال‌سازی حالت debug</span>
                        <input type="checkbox" id="debug-mode" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">نظارت بر کارایی</span>
                        <input type="checkbox" id="performance-monitoring" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">ذخیره‌سازی خودکار</span>
                        <input type="checkbox" id="auto-save" checked class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                </div>
            </div>
            
            <!-- System Monitoring -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">📊 نظارت بر سیستم</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                    <div class="bg-gray-800 rounded p-3">
                        <div class="text-2xl text-green-400 mb-1">99.8%</div>
                        <div class="text-xs text-gray-400">آپ‌تایم</div>
                    </div>
                    <div class="bg-gray-800 rounded p-3">
                        <div class="text-2xl text-blue-400 mb-1">45%</div>
                        <div class="text-xs text-gray-400">CPU</div>
                    </div>
                    <div class="bg-gray-800 rounded p-3">
                        <div class="text-2xl text-yellow-400 mb-1">68%</div>
                        <div class="text-xs text-gray-400">RAM</div>
                    </div>
                    <div class="bg-gray-800 rounded p-3">
                        <div class="text-2xl text-purple-400 mb-1">156</div>
                        <div class="text-xs text-gray-400">اتصالات</div>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <button onclick="settingsModule.runSystemDiagnostics()" class="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-stethoscope mr-2"></i>اجرای تشخیص سیستم
                    </button>
                    <button onclick="settingsModule.viewSystemLogs()" class="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-list mr-2"></i>مشاهده لاگ‌ها
                    </button>
                    <button onclick="settingsModule.exportSystemReport()" class="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-file-export mr-2"></i>صادرات گزارش سیستم
                    </button>
                </div>
            </div>
            
            <!-- Save Button -->
            <div class="flex justify-end">
                <button onclick="settingsModule.saveSystemSettings()" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium">
                    <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                </button>
            </div>
        </div>
        `;
    }
}

// Override SettingsModule methods with simple versions
if (window.SettingsModule) {
    console.log('🔄 Overriding SettingsModule methods with simple versions');
    
    // Override the problematic methods with simple versions
    window.SettingsModule.prototype.getTradingTab = function() {
        return SimpleSettingsTabs.getTradingTab();
    };
    
    window.SettingsModule.prototype.getSystemTab = function() {
        return SimpleSettingsTabs.getSystemTab();
    };
    
    console.log('✅ Simple Trading and System tabs methods overridden successfully');
} else {
    console.log('⚠️ SettingsModule not found yet, will override when available');
    
    // Wait for SettingsModule to be available
    const checkForSettingsModule = setInterval(() => {
        if (window.SettingsModule) {
            clearInterval(checkForSettingsModule);
            
            window.SettingsModule.prototype.getTradingTab = function() {
                return SimpleSettingsTabs.getTradingTab();
            };
            
            window.SettingsModule.prototype.getSystemTab = function() {
                return SimpleSettingsTabs.getSystemTab();
            };
            
            console.log('✅ Simple Trading and System tabs methods overridden successfully (delayed)');
        }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
        clearInterval(checkForSettingsModule);
    }, 10000);
}

// Also export the class for direct use
window.SimpleSettingsTabs = SimpleSettingsTabs;