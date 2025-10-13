// Settings Module for Titan Trading System - Optimized Version
// Focused on core functionality with system updates

class SettingsModule {
    constructor() {
        this.currentTab = 'general';
        this.settings = {
            general: {
                theme: 'dark',
                language: 'fa',
                rtl: true,
                timezone: 'Asia/Tehran',
                currency: 'USD',
                auto_updates: true
            },
            trading: {
                auto_trading: {
                    enabled: false,
                    strategies: ['momentum', 'mean_reversion'],
                    min_confidence: 0.7
                },
                alerts: {
                    price_alerts: true,
                    trade_alerts: true,
                    ai_insights: true,
                    system_alerts: true
                }
            },
            system_monitoring: {
                enabled: true,
                performance_thresholds: {
                    cpu_warning: { value: 70, enabled: true },
                    memory_warning: { value: 80, enabled: true }
                }
            }
        };
    }

    init() {
        console.log('🎛️ Settings Module initialized');
        this.setupEventListeners();
        
        // Simulate update check on init
        setTimeout(() => {
            this.checkForUpdates();
        }, 1000);
    }

    render() {
        return `
        <div class="p-6">
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <span class="text-3xl">⚙️</span>
                    تنظیمات سیستم
                </h2>
                <p class="text-gray-400">مدیریت پیکربندی و تنظیمات سیستم TITAN</p>
            </div>

            <!-- Settings Tabs -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <!-- Tab Navigation -->
                <div class="flex border-b border-gray-700 overflow-x-auto">
                    ${this.buildTabButtons()}
                </div>

                <!-- Tab Content -->
                <div id="settings-tab-content" class="p-6">
                    ${this.getTabContent()}
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end gap-3 mt-6">
                <button onclick="settingsModule.resetSettings()" class="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg text-white">
                    <i class="fas fa-undo mr-2"></i>بازنشانی
                </button>
                <button onclick="settingsModule.saveSettings()" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white">
                    <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                </button>
            </div>
        </div>`;
    }

    buildTabButtons() {
        const tabs = [
            { id: 'general', icon: 'fa-cog', title: 'عمومی' },
            { id: 'trading', icon: 'fa-chart-line', title: 'معاملات' },
            { id: 'system', icon: 'fa-cogs', title: 'سیستم' }
        ];

        return tabs.map(tab => {
            const isActive = this.currentTab === tab.id;
            const activeClass = isActive ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white';
            
            return `
                <button onclick="settingsModule.switchTab('${tab.id}')" 
                        class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${activeClass}">
                    <i class="fas ${tab.icon}"></i>${tab.title}
                </button>`;
        }).join('');
    }

    getTabContent() {
        switch (this.currentTab) {
            case 'general':
                return this.getGeneralTab();
            case 'trading':
                return this.getTradingTab();
            case 'system':
                return this.getSystemTab();
            default:
                return this.getGeneralTab();
        }
    }

    getGeneralTab() {
        return `
        <div class="space-y-6">
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🎨 تنظیمات ظاهری</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">تم رنگی</label>
                        <select id="theme-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="dark" ${this.settings.general.theme === 'dark' ? 'selected' : ''}>تیره</option>
                            <option value="light" ${this.settings.general.theme === 'light' ? 'selected' : ''}>روشن</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">زبان سیستم</label>
                        <select id="language-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="fa" ${this.settings.general.language === 'fa' ? 'selected' : ''}>فارسی</option>
                            <option value="en" ${this.settings.general.language === 'en' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getTradingTab() {
        return `
        <div class="space-y-6">
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🤖 معاملات خودکار</h4>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-white font-medium">فعال‌سازی معاملات خودکار</div>
                            <div class="text-gray-400 text-sm">اجرای خودکار استراتژی‌های معاملاتی</div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="auto-trading-enabled" class="sr-only peer" ${this.settings.trading.auto_trading.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداقل اطمینان AI</label>
                        <input type="range" id="min-confidence" min="0.1" max="0.9" step="0.1" 
                               value="${this.settings.trading.auto_trading.min_confidence}"
                               class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                        <div class="flex justify-between text-xs text-gray-400 mt-1">
                            <span>10%</span>
                            <span id="confidence-value">${Math.round(this.settings.trading.auto_trading.min_confidence * 100)}%</span>
                            <span>90%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🔔 هشدارهای معاملاتی</h4>
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" id="price-alerts" ${this.settings.trading.alerts.price_alerts ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <label class="text-white text-sm">هشدارهای قیمت</label>
                    </div>
                    <div class="flex items-center gap-3">
                        <input type="checkbox" id="trade-alerts" ${this.settings.trading.alerts.trade_alerts ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <label class="text-white text-sm">هشدارهای معاملات</label>
                    </div>
                    <div class="flex items-center gap-3">
                        <input type="checkbox" id="ai-insights" ${this.settings.trading.alerts.ai_insights ? 'checked' : ''} class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <label class="text-white text-sm">بینش‌های هوش مصنوعی</label>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getSystemTab() {
        return `
        <div class="space-y-6">
            <!-- System Updates -->
            <div class="bg-gray-900 rounded-lg p-4 border-2 border-blue-500">
                <h4 class="text-lg font-semibold text-white mb-4">🚀 آپدیت‌های سیستم</h4>
                
                <!-- Current Version Info -->
                <div class="bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="text-2xl">🏷️</div>
                            <div>
                                <div class="text-white font-semibold">نسخه فعلی: TITAN v1.0.0</div>
                                <div class="text-gray-400 text-sm">تاریخ انتشار: ${new Date().toLocaleDateString('fa-IR')}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-green-400 text-sm font-medium">آخرین نسخه</span>
                        </div>
                    </div>
                    
                    <!-- Release Notes Preview -->
                    <div class="text-sm text-gray-300 mb-3">
                        <strong>ویژگی‌های اصلی:</strong>
                        <ul class="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li>✅ سیستم معاملات خودکار با هوش مصنوعی آرتمیس</li>
                            <li>✅ پنل مدیریت جامع با تب‌های تخصصی</li>
                            <li>✅ پایش لحظه‌ای بازار و تحلیل قیمت‌ها</li>
                            <li>✅ مدیریت پورتفولیو و ریسک پیشرفته</li>
                            <li>✅ سیستم اعلان‌های هوشمند چندکاناله</li>
                        </ul>
                    </div>
                </div>

                <!-- Update Check Status -->
                <div class="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 mb-4 border border-blue-400">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div id="update-status-icon" class="text-2xl">⏳</div>
                            <div>
                                <div class="text-white font-medium" id="update-status-text">در حال بررسی آپدیت‌ها...</div>
                                <div class="text-blue-300 text-sm" id="update-status-detail">آخرین بررسی: ${new Date().toLocaleTimeString('fa-IR')}</div>
                            </div>
                        </div>
                        <button onclick="settingsModule.checkForUpdates()" 
                                class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm transition-all">
                            <i class="fas fa-sync-alt mr-2"></i>بررسی آپدیت
                        </button>
                    </div>
                </div>

                <!-- Auto Update Settings -->
                <div class="bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <span class="text-xl">🤖</span>
                            <div>
                                <div class="text-white font-medium">آپدیت خودکار</div>
                                <div class="text-gray-400 text-sm">بررسی و نصب خودکار آپدیت‌ها</div>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="auto-update-enabled" class="sr-only peer" ${this.settings.general.auto_updates ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-3 mt-6">
                    <button onclick="settingsModule.checkForUpdates()" 
                            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all">
                        <i class="fas fa-sync-alt"></i>بررسی آپدیت‌ها
                    </button>
                    <button onclick="settingsModule.viewReleaseNotes()" 
                            class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all">
                        <i class="fas fa-clipboard-list"></i>یادداشت‌های انتشار
                    </button>
                    <button onclick="settingsModule.systemBackup()" 
                            class="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all">
                        <i class="fas fa-shield-alt"></i>پشتیبان‌گیری
                    </button>
                </div>
            </div>

            <!-- System Information -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">📊 اطلاعات سیستم</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-300">نسخه سیستم:</span>
                            <span class="text-white">TITAN v1.0.0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">هوش مصنوعی:</span>
                            <span class="text-green-400">ARTEMIS فعال</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">آخرین بروزرسانی:</span>
                            <span class="text-white">${new Date().toLocaleDateString('fa-IR')}</span>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-300">تعداد ماژول‌ها:</span>
                            <span class="text-white">9 ماژول</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">وضعیت اتصال:</span>
                            <span class="text-green-400">آنلاین</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    switchTab(tabName) {
        console.log('🔀 Switching to tab:', tabName);
        this.currentTab = tabName;
        
        // Update tab content
        const content = document.getElementById('settings-tab-content');
        if (content) {
            content.innerHTML = this.getTabContent();
        }
        
        // Update tab buttons
        const tabContainer = content?.parentElement?.querySelector('.flex.border-b');
        if (tabContainer) {
            tabContainer.innerHTML = this.buildTabButtons();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for form elements
        const confidenceSlider = document.getElementById('min-confidence');
        if (confidenceSlider) {
            confidenceSlider.addEventListener('input', (e) => {
                const valueDisplay = document.getElementById('confidence-value');
                if (valueDisplay) {
                    valueDisplay.textContent = Math.round(e.target.value * 100) + '%';
                }
            });
        }
    }

    async checkForUpdates() {
        const statusIcon = document.getElementById('update-status-icon');
        const statusText = document.getElementById('update-status-text');
        const statusDetail = document.getElementById('update-status-detail');
        
        // Set loading state
        if (statusIcon) statusIcon.textContent = '⏳';
        if (statusText) statusText.textContent = 'در حال بررسی آپدیت‌ها...';
        if (statusDetail) statusDetail.textContent = 'اتصال به سرور آپدیت...';
        
        try {
            // Simulate update check
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock response
            const hasUpdate = Math.random() > 0.7;
            
            if (hasUpdate) {
                if (statusIcon) statusIcon.textContent = '🎉';
                if (statusText) statusText.textContent = 'آپدیت جدید موجود: v1.1.0';
                if (statusDetail) statusDetail.textContent = 'حجم: 15.2 MB | تاریخ انتشار: فردا';
                this.showNotification('🎉 آپدیت جدید موجود است!', 'success');
            } else {
                if (statusIcon) statusIcon.textContent = '✅';
                if (statusText) statusText.textContent = 'سیستم به‌روز است';
                if (statusDetail) statusDetail.textContent = `آخرین بررسی: ${new Date().toLocaleTimeString('fa-IR')}`;
                this.showNotification('✅ سیستم در آخرین نسخه قرار دارد', 'success');
            }
            
        } catch (error) {
            console.error('خطا در بررسی آپدیت:', error);
            if (statusIcon) statusIcon.textContent = '❌';
            if (statusText) statusText.textContent = 'خطا در اتصال به سرور';
            this.showNotification('❌ خطا در بررسی آپدیت', 'error');
        }
    }

    viewReleaseNotes() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                <div class="p-6 border-b border-gray-700">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold text-white">یادداشت‌های انتشار TITAN v1.1.0</h3>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="text-gray-400 hover:text-white text-xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <h4 class="text-lg font-semibold text-white mb-4">✨ ویژگی‌های جدید</h4>
                    <ul class="space-y-2 mb-6 text-gray-300">
                        <li>• سیستم آپدیت خودکار پیشرفته</li>
                        <li>• بهبود عملکرد تا 40%</li>
                        <li>• رابط کاربری جدید و بهینه</li>
                        <li>• امکانات امنیتی پیشرفته</li>
                    </ul>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async systemBackup() {
        this.showNotification('📦 ایجاد پشتیبان سیستم آغاز شد...', 'info');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const backupData = {
                version: 'v1.0.0',
                timestamp: new Date().toISOString(),
                settings: this.settings
            };
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `titan-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('✅ پشتیبان سیستم با موفقیت ایجاد شد', 'success');
            
        } catch (error) {
            console.error('خطا در ایجاد پشتیبان:', error);
            this.showNotification('❌ خطا در ایجاد پشتیبان سیستم', 'error');
        }
    }

    saveSettings() {
        // Collect form data
        const themeSelect = document.getElementById('theme-select');
        const languageSelect = document.getElementById('language-select');
        const autoTradingEnabled = document.getElementById('auto-trading-enabled');
        const minConfidence = document.getElementById('min-confidence');
        const autoUpdateEnabled = document.getElementById('auto-update-enabled');

        // Update settings
        if (themeSelect) this.settings.general.theme = themeSelect.value;
        if (languageSelect) this.settings.general.language = languageSelect.value;
        if (autoTradingEnabled) this.settings.trading.auto_trading.enabled = autoTradingEnabled.checked;
        if (minConfidence) this.settings.trading.auto_trading.min_confidence = parseFloat(minConfidence.value);
        if (autoUpdateEnabled) this.settings.general.auto_updates = autoUpdateEnabled.checked;

        // Save to localStorage (simulation)
        try {
            localStorage.setItem('titan_settings', JSON.stringify(this.settings));
            this.showNotification('✅ تنظیمات با موفقیت ذخیره شد', 'success');
        } catch (error) {
            console.error('خطا در ذخیره تنظیمات:', error);
            this.showNotification('❌ خطا در ذخیره تنظیمات', 'error');
        }
    }

    resetSettings() {
        if (confirm('آیا از بازنشانی تمام تنظیمات اطمینان دارید؟')) {
            // Reset to defaults
            this.settings = {
                general: { theme: 'dark', language: 'fa', auto_updates: true },
                trading: { 
                    auto_trading: { enabled: false, min_confidence: 0.7 },
                    alerts: { price_alerts: true, trade_alerts: true, ai_insights: true }
                }
            };
            
            // Refresh current tab
            this.switchTab(this.currentTab);
            this.showNotification('🔄 تنظیمات بازنشانی شد', 'info');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600', 
            info: 'bg-blue-600',
            warning: 'bg-yellow-600'
        };
        
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.SettingsModule = SettingsModule;

// Create global instance for easy access
window.settingsModule = null;