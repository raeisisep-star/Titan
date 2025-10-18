// Unified Settings Module - یکپارچه‌سازی تنظیمات برای منوی اصلی
// محتوای مطابق با AI Dashboard اما مستقل از /ai-test

class UnifiedSettingsModule {
    constructor() {
        this.currentTab = 'general';
        this.settings = {};
        this.isLoading = false;
        this.moduleCache = {};
        this.tabModules = {};
    }

    async init() {
        console.log('🔄 راه‌اندازی سیستم تنظیمات یکپارچه...');
        
        try {
            // Load settings core and all tab modules
            await this.loadSettingsCore();
            await this.loadAllTabModules();
            
            console.log('✅ سیستم تنظیمات یکپارچه راه‌اندازی شد');
            return true;
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی تنظیمات:', error);
            throw error;
        }
    }

    async loadSettingsCore() {
        // Load the settings core module dynamically
        if (!window.SettingsCore) {
            const script = document.createElement('script');
            script.src = `/static/modules/settings/core/settings-core.js?v=${Date.now()}`;
            
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    if (window.SettingsCore) {
                        resolve();
                    } else {
                        reject(new Error('SettingsCore کلاس بارگذاری نشد'));
                    }
                };
                script.onerror = () => reject(new Error('خطا در بارگذاری Settings Core'));
                document.head.appendChild(script);
            });
        }
    }

    async loadAllTabModules() {
        const tabNames = [
            'general', 'notifications', 'exchanges', 'ai', 'trading',
            'security', 'users', 'system', 'monitoring', 'wallets'
        ];

        // Load all tab modules in parallel
        const loadPromises = tabNames.map(async (tabName) => {
            try {
                const module = await import(`/static/modules/settings/tabs/${tabName}-tab.js?v=${Date.now()}`);
                this.tabModules[tabName] = module.default;
                return { tabName, success: true };
            } catch (error) {
                console.warn(`⚠️ خطا در بارگذاری تب ${tabName}:`, error);
                return { tabName, success: false, error };
            }
        });

        const results = await Promise.all(loadPromises);
        const successful = results.filter(r => r.success);
        console.log(`✅ ${successful.length}/${tabNames.length} تب بارگذاری شد`);
    }

    async render() {
        if (this.isLoading) {
            return this.renderLoadingState();
        }

        try {
            // Create settings core instance
            const settingsCore = new window.SettingsCore();
            await settingsCore.initialize();
            this.settings = settingsCore.settings;

            return `
                <div class="space-y-6">
                    <!-- Settings Header -->
                    <div class="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 border border-blue-700">
                        <h2 class="text-2xl font-bold text-white mb-2 flex items-center">
                            <i class="fas fa-cog text-blue-400 mr-3"></i>
                            ⚙️ تنظیمات سیستم TITAN
                        </h2>
                        <p class="text-blue-100">پیکربندی و مدیریت تنظیمات سیستم معاملات خودکار</p>
                    </div>

                    <!-- Settings Navigation Tabs -->
                    <div class="bg-gray-800 rounded-lg border border-gray-700">
                        <div class="border-b border-gray-700">
                            <nav class="flex space-x-0 space-x-reverse overflow-x-auto">
                                ${this.renderTabNavigation()}
                            </nav>
                        </div>

                        <!-- Settings Content -->
                        <div id="unified-settings-content" class="p-6">
                            ${await this.renderTabContent(this.currentTab)}
                        </div>
                    </div>

                    <!-- Settings Actions -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-3 space-x-reverse">
                                <button onclick="unifiedSettings.saveAllSettings()" 
                                        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center">
                                    <i class="fas fa-save mr-2"></i>
                                    💾 ذخیره تنظیمات
                                </button>
                                <button onclick="unifiedSettings.resetSettings()" 
                                        class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center">
                                    <i class="fas fa-undo mr-2"></i>
                                    🔄 بازنشانی
                                </button>
                            </div>
                            <div class="flex items-center space-x-3 space-x-reverse">
                                <button onclick="unifiedSettings.exportSettings()" 
                                        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center">
                                    <i class="fas fa-download mr-2"></i>
                                    📥 Export
                                </button>
                                <button onclick="unifiedSettings.importSettings()" 
                                        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center">
                                    <i class="fas fa-upload mr-2"></i>
                                    📤 Import
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Settings Status Toast -->
                <div id="settings-toast" class="fixed top-4 right-4 z-50 hidden">
                    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg max-w-sm">
                        <div id="toast-content" class="flex items-center">
                            <!-- Toast content will be inserted here -->
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('خطا در رندر تنظیمات:', error);
            return this.renderErrorState(error);
        }
    }

    renderTabNavigation() {
        const tabs = [
            { id: 'general', name: '🏠 عمومی', icon: 'fas fa-home' },
            { id: 'notifications', name: '🔔 اطلاعیه‌ها', icon: 'fas fa-bell' },
            { id: 'exchanges', name: '🏦 صرافی‌ها', icon: 'fas fa-exchange-alt' },
            { id: 'ai', name: '🤖 هوش مصنوعی', icon: 'fas fa-brain' },
            { id: 'trading', name: '📈 معاملات', icon: 'fas fa-chart-line' },
            { id: 'security', name: '🔐 امنیت', icon: 'fas fa-shield-alt' },
            { id: 'users', name: '👥 کاربران', icon: 'fas fa-users' },
            { id: 'system', name: '⚙️ سیستم', icon: 'fas fa-cog' },
            { id: 'monitoring', name: '📊 نظارت', icon: 'fas fa-chart-bar' },
            { id: 'wallets', name: '💰 کیف پول', icon: 'fas fa-wallet' }
        ];

        return tabs.map(tab => `
            <button onclick="unifiedSettings.switchTab('${tab.id}')" 
                    class="tab-button ${this.currentTab === tab.id ? 'active' : ''} 
                           relative px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                           ${this.currentTab === tab.id 
                             ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/30' 
                             : 'text-gray-400 hover:text-white hover:bg-gray-700'}" 
                    data-tab="${tab.id}">
                <i class="${tab.icon} mr-2"></i>
                ${tab.name}
            </button>
        `).join('');
    }

    async renderTabContent(tabName) {
        try {
            if (!this.tabModules[tabName]) {
                return `
                    <div class="text-center py-12">
                        <i class="fas fa-exclamation-triangle text-yellow-400 text-4xl mb-4"></i>
                        <p class="text-gray-400 mb-4">تب ${tabName} در دسترس نیست</p>
                        <button onclick="unifiedSettings.switchTab('general')" 
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                            بازگشت به تب عمومی
                        </button>
                    </div>
                `;
            }

            const tabModule = new this.tabModules[tabName](this.settings);
            const content = tabModule.render();
            
            // Store instance globally for AI tab
            if (tabName === 'ai') {
                window.aiTabInstance = tabModule;
            }
            
            return content;

        } catch (error) {
            console.error(`خطا در رندر تب ${tabName}:`, error);
            return `
                <div class="bg-red-900/20 border border-red-600 rounded-lg p-6 text-center">
                    <i class="fas fa-exclamation-circle text-red-400 text-3xl mb-4"></i>
                    <h3 class="text-red-400 font-bold mb-2">خطا در بارگذاری تب</h3>
                    <p class="text-gray-400 mb-4">${error.message}</p>
                    <button onclick="unifiedSettings.switchTab('general')" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        بازگشت به تب عمومی
                    </button>
                </div>
            `;
        }
    }

    renderLoadingState() {
        return `
            <div class="space-y-6">
                <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
                    <div class="text-center">
                        <div class="animate-spin inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-6"></div>
                        <h3 class="text-xl font-semibold text-white mb-2">در حال بارگذاری تنظیمات...</h3>
                        <p class="text-gray-400">لطفاً صبر کنید تا سیستم تنظیمات راه‌اندازی شود</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderErrorState(error) {
        return `
            <div class="space-y-6">
                <div class="bg-red-900/20 border border-red-600 rounded-lg p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold text-red-400 mb-4">خطا در بارگذاری تنظیمات</h3>
                    <p class="text-gray-400 mb-6">${error.message}</p>
                    <div class="space-x-3 space-x-reverse">
                        <button onclick="unifiedSettings.retry()" 
                                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                            🔄 تلاش مجدد
                        </button>
                        <button onclick="app.showModule('dashboard')" 
                                class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium">
                            بازگشت به داشبورد
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async switchTab(tabName) {
        if (this.isLoading) return;
        
        this.currentTab = tabName;
        
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            btn.className = btn.className.replace(/active|text-blue-400|border-b-2|border-blue-400|bg-blue-900\/30/g, '');
            
            if (isActive) {
                btn.className += ' active text-blue-400 border-b-2 border-blue-400 bg-blue-900/30';
            } else {
                btn.className += ' text-gray-400 hover:text-white hover:bg-gray-700';
            }
        });

        // Update content
        const contentContainer = document.getElementById('unified-settings-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p class="text-gray-400">در حال بارگذاری...</p>
                </div>
            `;
            
            try {
                const newContent = await this.renderTabContent(tabName);
                contentContainer.innerHTML = newContent;
                
                // Initialize tab after content is rendered
                setTimeout(() => {
                    if (tabName === 'ai' && window.aiTabInstance && typeof window.aiTabInstance.initialize === 'function') {
                        console.log('🤖 Initializing AI Tab...');
                        window.aiTabInstance.initialize();
                    }
                }, 100);
                
            } catch (error) {
                console.error(`خطا در تغییر تب ${tabName}:`, error);
                contentContainer.innerHTML = this.renderErrorState(error);
            }
        }
    }

    async saveAllSettings() {
        this.showToast('در حال ذخیره تنظیمات...', 'info');
        
        try {
            // Save settings based on current active tab
            let result = null;
            
            switch (this.currentTab) {
                case 'general':
                    if (window.generalTab && typeof window.generalTab.saveSettings === 'function') {
                        result = await window.generalTab.saveSettings();
                    } else {
                        throw new Error('تب تنظیمات عمومی در دسترس نیست');
                    }
                    break;
                    
                case 'exchanges':
                    if (window.exchangesTab && typeof window.exchangesTab.saveSettings === 'function') {
                        result = await window.exchangesTab.saveSettings();
                    } else {
                        throw new Error('تب صرافی‌ها در دسترس نیست');
                    }
                    break;
                    
                case 'notifications':
                    if (window.notificationsTab && typeof window.notificationsTab.saveSettings === 'function') {
                        result = await window.notificationsTab.saveSettings();
                    } else {
                        throw new Error('تب اعلان‌ها در دسترس نیست');
                    }
                    break;
                    
                case 'security':
                    if (window.securityTab && typeof window.securityTab.saveSettings === 'function') {
                        result = await window.securityTab.saveSettings();
                    } else {
                        throw new Error('تب امنیت در دسترس نیست');
                    }
                    break;
                    
                case 'advanced':
                    if (window.advancedTab && typeof window.advancedTab.saveSettings === 'function') {
                        result = await window.advancedTab.saveSettings();
                    } else {
                        throw new Error('تب پیشرفته در دسترس نیست');
                    }
                    break;
                    
                case 'ai':
                    if (window.aiTabInstance && typeof window.aiTabInstance.saveSettings === 'function') {
                        result = await window.aiTabInstance.saveSettings();
                    } else {
                        throw new Error('تب هوش مصنوعی در دسترس نیست');
                    }
                    break;
                    
                default:
                    throw new Error(`تب ${this.currentTab} پشتیبانی نمی‌شود`);
            }
            
            // Check result from tab-specific save method
            if (result && result.success) {
                this.showToast('✅ تنظیمات با موفقیت ذخیره شد', 'success');
            } else {
                throw new Error(result?.error || 'خطا در ذخیره تنظیمات');
            }
        } catch (error) {
            console.error('خطا در ذخیره تنظیمات:', error);
            this.showToast('❌ خطا در ذخیره تنظیمات', 'error');
        }
    }

    async resetSettings() {
        if (!confirm('آیا از بازنشانی تمام تنظیمات اطمینان دارید؟')) {
            return;
        }

        this.showToast('در حال بازنشانی تنظیمات...', 'info');
        
        try {
            const response = await axios.post('/api/settings/reset');
            
            if (response.data.success) {
                this.showToast('✅ تنظیمات بازنشانی شد', 'success');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                throw new Error(response.data.message || 'خطا در بازنشانی');
            }
        } catch (error) {
            console.error('خطا در بازنشانی تنظیمات:', error);
            this.showToast('❌ خطا در بازنشانی تنظیمات', 'error');
        }
    }

    exportSettings() {
        try {
            const settingsData = JSON.stringify(this.settings, null, 2);
            const blob = new Blob([settingsData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `titan-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('✅ تنظیمات صادر شد', 'success');
        } catch (error) {
            console.error('خطا در صادر کردن تنظیمات:', error);
            this.showToast('❌ خطا در صادر کردن تنظیمات', 'error');
        }
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        this.settings = { ...this.settings, ...importedSettings };
                        this.showToast('✅ تنظیمات وارد شد', 'success');
                        // Refresh current tab
                        this.switchTab(this.currentTab);
                    } catch (error) {
                        console.error('خطا در وارد کردن تنظیمات:', error);
                        this.showToast('❌ فایل نامعتبر است', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('settings-toast');
        const content = document.getElementById('toast-content');
        
        const icons = {
            info: 'fas fa-info-circle text-blue-400',
            success: 'fas fa-check-circle text-green-400',
            error: 'fas fa-exclamation-circle text-red-400'
        };

        if (toast && content) {
            content.innerHTML = `
                <i class="${icons[type]} mr-2"></i>
                <span class="text-white">${message}</span>
            `;
            
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }

    async retry() {
        this.isLoading = true;
        const container = document.getElementById('content');
        if (container) {
            container.innerHTML = this.renderLoadingState();
        }
        
        try {
            await this.init();
            const newContent = await this.render();
            if (container) {
                container.innerHTML = newContent;
            }
            this.isLoading = false;
        } catch (error) {
            this.isLoading = false;
            if (container) {
                container.innerHTML = this.renderErrorState(error);
            }
        }
    }
}

// Global instance for easy access
window.unifiedSettings = null;

// Export module
window.UnifiedSettingsModule = UnifiedSettingsModule;