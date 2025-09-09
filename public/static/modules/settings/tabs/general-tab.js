// General Tab Module - Clean implementation
// Basic system configuration and preferences

export default class GeneralTab {
    constructor(settings) {
        this.settings = settings;
    }

    render() {
        const general = this.settings.general || {};

        return `
        <div class="space-y-6">
            <!-- Theme Settings -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-palette text-blue-400 mr-3"></i>
                    🎨 تنظیمات ظاهری
                </h4>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            تم رنگی
                        </label>
                        <select id="theme" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                            <option value="dark" ${general.theme === 'dark' ? 'selected' : ''}>تیره</option>
                            <option value="light" ${general.theme === 'light' ? 'selected' : ''}>روشن</option>
                            <option value="auto" ${general.theme === 'auto' ? 'selected' : ''}>خودکار</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            زبان سیستم
                        </label>
                        <select id="language" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                            <option value="fa" ${general.language === 'fa' ? 'selected' : ''}>فارسی</option>
                            <option value="en" ${general.language === 'en' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Localization Settings -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-globe text-green-400 mr-3"></i>
                    🌍 تنظیمات محلی‌سازی
                </h4>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            منطقه زمانی
                        </label>
                        <select id="timezone" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                            <option value="Asia/Tehran" ${general.timezone === 'Asia/Tehran' ? 'selected' : ''}>تهران (UTC+3:30)</option>
                            <option value="UTC" ${general.timezone === 'UTC' ? 'selected' : ''}>UTC (UTC+0)</option>
                            <option value="America/New_York" ${general.timezone === 'America/New_York' ? 'selected' : ''}>نیویورک (UTC-5)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            واحد پول اصلی
                        </label>
                        <select id="currency" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                            <option value="USD" ${general.currency === 'USD' ? 'selected' : ''}>دلار آمریکا (USD)</option>
                            <option value="USDT" ${general.currency === 'USDT' ? 'selected' : ''}>تتر (USDT)</option>
                            <option value="BTC" ${general.currency === 'BTC' ? 'selected' : ''}>بیت‌کوین (BTC)</option>
                            <option value="ETH" ${general.currency === 'ETH' ? 'selected' : ''}>اتریوم (ETH)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            فرمت تاریخ
                        </label>
                        <select id="date-format" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                            <option value="jYYYY/jMM/jDD" ${general.dateFormat === 'jYYYY/jMM/jDD' ? 'selected' : ''}>فارسی (1403/06/18)</option>
                            <option value="YYYY-MM-DD" ${general.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>میلادی (2024-09-08)</option>
                            <option value="DD/MM/YYYY" ${general.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>اروپایی (08/09/2024)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            فرمت اعداد
                        </label>
                        <select id="number-format" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                            <option value="fa-IR" ${general.numberFormat === 'fa-IR' ? 'selected' : ''}>فارسی (۱۲۳٬۴۵۶٫۷۸)</option>
                            <option value="en-US" ${general.numberFormat === 'en-US' ? 'selected' : ''}>انگلیسی (123,456.78)</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Display Settings -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-desktop text-purple-400 mr-3"></i>
                    🖥️ تنظیمات نمایش
                </h4>
                
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                            <span class="text-white text-sm font-medium">راست چین (RTL)</span>
                            <p class="text-xs text-gray-400">تنظیم جهت متن از راست به چپ</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="rtl-mode" ${general.rtl ? 'checked' : ''} class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                            <span class="text-white text-sm font-medium">حالت فول‌اسکرین</span>
                            <p class="text-xs text-gray-400">نمایش برنامه در تمام صفحه</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="fullscreen-mode" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                            <span class="text-white text-sm font-medium">انیمیشن‌های UI</span>
                            <p class="text-xs text-gray-400">فعال‌سازی جلوه‌های بصری و انیمیشن</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="animations" checked class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- System Information -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-info-circle text-blue-400 mr-3"></i>
                    ℹ️ اطلاعات سیستم
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-gray-800 rounded-lg p-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">نسخه سیستم:</span>
                            <span class="text-white font-mono">TITAN v3.1.2</span>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 rounded-lg p-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">آرتمیس AI:</span>
                            <span class="text-green-400 font-mono">v3.1.0 - Active</span>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 rounded-lg p-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">پلتفرم:</span>
                            <span class="text-blue-400 font-mono">Cloudflare Workers</span>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 rounded-lg p-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">آخرین بروزرسانی:</span>
                            <span class="text-purple-400 font-mono">2025-09-08</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 border border-blue-700">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-bolt text-yellow-400 mr-3"></i>
                    ⚡ عملیات سریع
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button onclick="generalTab.applyTheme()" class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-paint-brush mr-2"></i>
                        اعمال تم
                    </button>
                    <button onclick="generalTab.resetDefaults()" class="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        <i class="fas fa-undo mr-2"></i>
                        بازگردانی پیش‌فرض
                    </button>
                    <button onclick="generalTab.exportConfig()" class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-download mr-2"></i>
                        صادرات تنظیمات
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    // Collect form data
    collectData() {
        return {
            theme: document.getElementById('theme')?.value || 'dark',
            language: document.getElementById('language')?.value || 'fa',
            rtl: document.getElementById('rtl-mode')?.checked || true,
            timezone: document.getElementById('timezone')?.value || 'Asia/Tehran',
            currency: document.getElementById('currency')?.value || 'USD',
            dateFormat: document.getElementById('date-format')?.value || 'jYYYY/jMM/jDD',
            numberFormat: document.getElementById('number-format')?.value || 'fa-IR'
        };
    }

    // Initialize tab functionality
    initialize() {
        console.log('🔧 General tab initialized');
        
        // Set up global instance
        window.generalTab = this;
        
        // Setup theme change listener
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.previewTheme(e.target.value);
            });
        }
        
        // Setup language change listener
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.previewLanguage(e.target.value);
            });
        }
    }

    // Theme preview
    previewTheme(theme) {
        console.log(`🎨 Previewing theme: ${theme}`);
        // Would apply theme preview
    }

    // Language preview
    previewLanguage(language) {
        console.log(`🌍 Previewing language: ${language}`);
        // Would apply language preview
    }

    // Apply theme
    applyTheme() {
        const theme = document.getElementById('theme')?.value;
        console.log(`🎨 Applying theme: ${theme}`);
        this.showNotification(`تم ${theme} اعمال شد`, 'success');
    }

    // Reset to defaults
    resetDefaults() {
        if (confirm('آیا مطمئن هستید که می‌خواهید تنظیمات عمومی را به حالت پیش‌فرض بازگردانید؟')) {
            // Reset form values to defaults
            document.getElementById('theme').value = 'dark';
            document.getElementById('language').value = 'fa';
            document.getElementById('rtl-mode').checked = true;
            document.getElementById('timezone').value = 'Asia/Tehran';
            document.getElementById('currency').value = 'USD';
            document.getElementById('date-format').value = 'jYYYY/jMM/jDD';
            document.getElementById('number-format').value = 'fa-IR';
            
            this.showNotification('تنظیمات عمومی به حالت پیش‌فرض بازگردانده شد', 'success');
        }
    }

    // Export configuration
    exportConfig() {
        const config = this.collectData();
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `titan-general-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('تنظیمات عمومی صادر شد', 'success');
    }

    showNotification(message, type = 'info') {
        // Simple notification - would integrate with main notification system
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}