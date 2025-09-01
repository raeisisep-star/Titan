// Final Settings Module - Working Version
class FinalSettingsModule {
    constructor() {
        this.currentTab = 'general';
        console.log('✅ Final Settings Module constructor called');
    }

    async initialize() {
        console.log('✅ Final Settings initialized');
        return true;
    }

    async getContent() {
        console.log('✅ Final Settings getContent called, currentTab:', this.currentTab);
        
        return this.buildHTML();
    }

    buildHTML() {
        const tabs = this.buildTabs();
        const content = this.getTabContent();
        
        return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">⚙️ تنظیمات سیستم TITAN</h2>
                    <p class="text-gray-400 mt-1">پیکربندی کامل سیستم معاملاتی</p>
                </div>
            </div>

            <!-- Settings Tabs -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <!-- Tab Navigation -->
                <div class="flex border-b border-gray-700 overflow-x-auto">
                    ${tabs}
                </div>

                <!-- Tab Content -->
                <div class="p-6" id="settings-tab-content">
                    ${content}
                </div>
            </div>
        </div>`;
    }

    buildTabs() {
        const tabsData = [
            { id: 'general', icon: 'fa-cog', title: 'عمومی' },
            { id: 'ai', icon: 'fa-robot', title: 'هوش مصنوعی' },
            { id: 'trading', icon: 'fa-chart-line', title: 'معاملات' },
            { id: 'system', icon: 'fa-cogs', title: 'سیستم' }
        ];

        return tabsData.map(tab => {
            const isActive = this.currentTab === tab.id;
            const cssClass = isActive 
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white';
                
            return `
                <button onclick="window.settingsModule.switchTab('${tab.id}')" 
                        class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${cssClass}">
                    <i class="fas ${tab.icon}"></i>${tab.title}
                </button>`;
        }).join('');
    }

    getTabContent() {
        console.log('✅ Getting content for tab:', this.currentTab);
        
        switch (this.currentTab) {
            case 'general':
                return this.getGeneralTab();
            case 'ai':
                return this.getAITab();
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
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-cog text-blue-400 mr-3"></i>
                    تنظیمات عمومی
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-800 p-4 rounded">
                        <h5 class="text-white font-semibold mb-2">🌐 زبان سیستم</h5>
                        <p class="text-gray-300 text-sm">فارسی (Persian)</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded">
                        <h5 class="text-white font-semibold mb-2">🎨 تم رنگی</h5>
                        <p class="text-gray-300 text-sm">تاریک (Dark Mode)</p>
                    </div>
                </div>
                <div class="bg-blue-900 p-4 rounded mt-4">
                    <p class="text-blue-200">✅ تنظیمات عمومی کاملاً عملیاتی است</p>
                </div>
            </div>
        </div>`;
    }

    getAITab() {
        return `
        <div class="space-y-6">
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-robot text-purple-400 mr-3"></i>
                    تنظیمات هوش مصنوعی
                </h4>
                <div class="space-y-4">
                    <div class="bg-purple-800 p-4 rounded">
                        <h5 class="text-white font-semibold mb-2">🎯 Feature 1: Advanced Artemis & AI Management</h5>
                        <p class="text-purple-200 text-sm mb-2">مدیریت پیشرفته آرتمیس و سیستم‌های هوش مصنوعی</p>
                        <div class="bg-purple-900 p-2 rounded text-xs text-purple-100">
                            Status: ✅ Implemented & Active
                        </div>
                    </div>
                    <div class="bg-blue-800 p-4 rounded">
                        <h5 class="text-white font-semibold mb-2">📊 Feature 2: Performance Monitoring & Analytics</h5>
                        <p class="text-blue-200 text-sm mb-2">نظارت عملکرد و تحلیل‌های سیستم</p>
                        <div class="bg-blue-900 p-2 rounded text-xs text-blue-100">
                            Status: ✅ Implemented & Active
                        </div>
                    </div>
                </div>
                <div class="bg-green-900 p-4 rounded mt-4">
                    <p class="text-green-200">✅ تنظیمات AI کاملاً عملیاتی است</p>
                </div>
            </div>
        </div>`;
    }

    getTradingTab() {
        return `
        <div class="space-y-6">
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-chart-line text-green-400 mr-3"></i>
                    تنظیمات معاملات
                </h4>
                <div class="space-y-4">
                    <div class="bg-green-800 p-4 rounded">
                        <h5 class="text-white font-semibold mb-2">⚡ Feature 4: Advanced Trading Rules</h5>
                        <p class="text-green-200 text-sm mb-2">قوانین پیشرفته معاملاتی و مدیریت ریسک</p>
                        <div class="bg-green-900 p-2 rounded text-xs text-green-100">
                            Status: 🔄 Ready for Implementation
                        </div>
                    </div>
                </div>
                <div class="bg-yellow-900 p-4 rounded mt-4">
                    <p class="text-yellow-200">🔄 آماده برای پیاده‌سازی Feature 4</p>
                </div>
            </div>
        </div>`;
    }

    getSystemTab() {
        return `
        <div class="space-y-6">
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-xl font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-cogs text-orange-400 mr-3"></i>
                    تنظیمات سیستم
                </h4>
                <div class="space-y-4">
                    <div class="bg-orange-800 p-4 rounded">
                        <h5 class="text-white font-semibold mb-2">🚨 Feature 6: Alert Rules Management</h5>
                        <p class="text-orange-200 text-sm mb-2">مدیریت قوانین هشدار و اطلاع‌رسانی هوشمند</p>
                        <div class="bg-orange-900 p-2 rounded text-xs text-orange-100">
                            Status: 🔄 Ready for Implementation
                        </div>
                    </div>
                </div>
                <div class="bg-red-900 p-4 rounded mt-4">
                    <p class="text-red-200">🔧 آماده برای پیاده‌سازی Feature 6</p>
                </div>
            </div>
        </div>`;
    }

    switchTab(tabName) {
        console.log('🔄 Final Settings switching to tab:', tabName);
        
        if (!tabName) {
            console.error('❌ No tab name provided');
            return;
        }
        
        try {
            this.currentTab = tabName;
            
            // Update content
            const content = document.getElementById('settings-tab-content');
            if (content) {
                content.innerHTML = this.getTabContent();
                console.log('✅ Tab content updated successfully');
            } else {
                console.error('❌ settings-tab-content element not found');
                return;
            }
            
            // Update tab styles
            this.updateTabStyles(tabName);
            
        } catch (error) {
            console.error('❌ Error in switchTab:', error);
        }
    }

    updateTabStyles(activeTabName) {
        try {
            // Remove active styles from all tabs
            document.querySelectorAll('.settings-tab').forEach(tab => {
                tab.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
                tab.classList.add('text-gray-400');
            });
            
            // Find and activate the correct tab
            const tabs = document.querySelectorAll('.settings-tab');
            tabs.forEach(tab => {
                const onclick = tab.getAttribute('onclick');
                if (onclick && onclick.includes(`'${activeTabName}'`)) {
                    tab.classList.remove('text-gray-400');
                    tab.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
                }
            });
            
            console.log('✅ Tab styles updated for:', activeTabName);
            
        } catch (error) {
            console.error('❌ Error updating tab styles:', error);
        }
    }
}

// Register module in global namespace  
window.TitanModules = window.TitanModules || {};
window.TitanModules.SettingsModule = FinalSettingsModule;

// Initialize global instance
window.settingsModule = null;

console.log('✅ Final Settings Module registered successfully');