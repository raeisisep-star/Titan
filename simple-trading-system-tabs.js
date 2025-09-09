// Simple and working Trading and System tabs without template literal issues

function createSimpleTradingTab() {
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
            
            <!-- Save Button -->
            <div class="flex justify-end">
                <button onclick="settingsModule.saveTradingSettings()" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium">
                    <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                </button>
            </div>
        </div>
    `;
}

function createSimpleSystemTab() {
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
            
            <!-- System Monitoring -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">📊 نظارت بر سیستم</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
                
                <div class="mt-4 space-y-2">
                    <button onclick="settingsModule.runSystemDiagnostics()" class="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-stethoscope mr-2"></i>اجرای تشخیص سیستم
                    </button>
                    <button onclick="settingsModule.viewSystemLogs()" class="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-list mr-2"></i>مشاهده لاگ‌ها
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

console.log('✅ Simple Trading and System tabs created successfully');
console.log('Trading tab length:', createSimpleTradingTab().length);
console.log('System tab length:', createSimpleSystemTab().length);