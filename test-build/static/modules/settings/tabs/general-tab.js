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
            rtlMode: document.getElementById('rtl-mode')?.checked || true,
            timezone: document.getElementById('timezone')?.value || 'Asia/Tehran',
            currency: document.getElementById('currency')?.value || 'USD',
            dateFormat: document.getElementById('date-format')?.value || 'jYYYY/jMM/jDD',
            timeFormat: '24h', // Add missing field
            numberFormat: document.getElementById('number-format')?.value || 'fa-IR',
            fullscreen: document.getElementById('fullscreen-mode')?.checked || false,
            animations: document.getElementById('animations')?.checked !== false,
            soundEnabled: document.getElementById('sound-enabled')?.checked !== false,
            notificationsEnabled: document.getElementById('notifications-enabled')?.checked !== false,
            autoSave: true, // Default to true
            sessionTimeout: 30, // Default session timeout
            advancedMode: document.getElementById('advanced-mode')?.checked || false
        };
    }

    // Initialize tab functionality
    async initialize() {
        console.log('🔧 General tab initialized');
        
        // Set up global instance
        window.generalTab = this;
        
        // Load settings from backend
        await this.loadSettings();
        
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

        // Setup file import for configuration
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        importInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importConfig(e.target.files[0]);
            }
        });
        document.body.appendChild(importInput);
        
        // Store reference for import function
        this.importInput = importInput;
    }

    // Trigger file import dialog
    triggerImport() {
        if (this.importInput) {
            this.importInput.click();
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

    // Save settings (called by settings-unified.js)
    async saveSettings() {
        try {
            console.log('💾 Saving general settings...');
            
            const settings = this.collectData();
            
            const response = await fetch('/api/general/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                return { success: true, data: result.data };
            } else {
                this.showNotification(result.error, 'error');
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Save general settings error:', error);
            this.showNotification('خطا در ذخیره تنظیمات عمومی', 'error');
            return { success: false, error: error.message };
        }
    }

    // Load settings from backend
    async loadSettings() {
        try {
            console.log('📋 Loading general settings...');
            
            const response = await fetch('/api/general/settings');
            const result = await response.json();
            
            if (result.success) {
                this.applySettingsToForm(result.data);
                return { success: true, data: result.data };
            } else {
                this.showNotification('خطا در بارگذاری تنظیمات', 'error');
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Load general settings error:', error);
            this.showNotification('خطا در بارگذاری تنظیمات عمومی', 'error');
            return { success: false, error: error.message };
        }
    }

    // Apply settings to form elements
    applySettingsToForm(settings) {
        if (settings.theme) document.getElementById('theme').value = settings.theme;
        if (settings.language) document.getElementById('language').value = settings.language;
        if (settings.rtlMode !== undefined) document.getElementById('rtl-mode').checked = settings.rtlMode;
        if (settings.timezone) document.getElementById('timezone').value = settings.timezone;
        if (settings.currency) document.getElementById('currency').value = settings.currency;
        if (settings.dateFormat) document.getElementById('date-format').value = settings.dateFormat;
        if (settings.numberFormat) document.getElementById('number-format').value = settings.numberFormat;
        
        // Handle optional checkboxes with safe checks
        const fullscreenEl = document.getElementById('fullscreen-mode');
        if (fullscreenEl && settings.fullscreen !== undefined) fullscreenEl.checked = settings.fullscreen;
        
        const animationsEl = document.getElementById('animations');
        if (animationsEl && settings.animations !== undefined) animationsEl.checked = settings.animations;
        
        const soundEl = document.getElementById('sound-enabled');
        if (soundEl && settings.soundEnabled !== undefined) soundEl.checked = settings.soundEnabled;
        
        const notificationsEl = document.getElementById('notifications-enabled');
        if (notificationsEl && settings.notificationsEnabled !== undefined) notificationsEl.checked = settings.notificationsEnabled;
        
        const advancedEl = document.getElementById('advanced-mode');
        if (advancedEl && settings.advancedMode !== undefined) advancedEl.checked = settings.advancedMode;
        
        console.log('✅ Applied settings to form');
    }

    // Reset to defaults
    async resetDefaults() {
        if (confirm('آیا مطمئن هستید که می‌خواهید تنظیمات عمومی را به حالت پیش‌فرض بازگردانید؟')) {
            try {
                const response = await fetch('/api/general/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.applySettingsToForm(result.data);
                    this.showNotification(result.message, 'success');
                } else {
                    this.showNotification(result.error, 'error');
                }
            } catch (error) {
                console.error('Reset settings error:', error);
                this.showNotification('خطا در بازنشانی تنظیمات', 'error');
            }
        }
    }

    // Export configuration
    async exportConfig() {
        try {
            console.log('📤 Exporting general settings...');
            
            const response = await fetch('/api/general/export');
            const result = await response.json();
            
            if (result.success) {
                const dataStr = JSON.stringify(result.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = result.filename;
                link.click();
                
                URL.revokeObjectURL(url);
                this.showNotification('تنظیمات عمومی صادر شد', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Export settings error:', error);
            this.showNotification('خطا در صادر کردن تنظیمات', 'error');
        }
    }

    // Import configuration
    async importConfig(file) {
        try {
            console.log('📥 Importing general settings...');
            
            const text = await file.text();
            const importData = JSON.parse(text);
            
            const response = await fetch('/api/general/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(importData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.applySettingsToForm(result.data.applied);
                this.showNotification(result.message, 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Import settings error:', error);
            this.showNotification('خطا در وارد کردن تنظیمات', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Console log for debugging
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create visual notification
        this.createToast(message, type);
        
        // Also try to integrate with global notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }

    createToast(message, type) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.general-settings-toast');
        existingToasts.forEach(toast => toast.remove());

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `general-settings-toast fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform`;
        
        // Style based on type
        const styles = {
            success: 'bg-green-600 text-white border-l-4 border-green-400',
            error: 'bg-red-600 text-white border-l-4 border-red-400', 
            info: 'bg-blue-600 text-white border-l-4 border-blue-400',
            warning: 'bg-yellow-600 text-white border-l-4 border-yellow-400'
        };
        
        toast.className += ` ${styles[type] || styles.info}`;
        
        // Add icon based on type
        const icons = {
            success: '✅',
            error: '❌', 
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-xl">${icons[type] || icons.info}</span>
                <span class="font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200 transition-colors">
                    ×
                </button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                toast.style.opacity = '0';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
    }
}