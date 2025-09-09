// Create a minimal working version of SettingsModule with just getTradingTab and getSystemTab
const minimalSettings = `
class SettingsModule {
    constructor() {
        this.currentTab = 'general';
        this.settings = {
            general: { theme: 'dark', language: 'fa' },
            trading: {},
            system: {}
        };
    }
    
    getTradingTab() {
        return '<div class="space-y-6"><h3 class="text-lg font-bold text-white">تب معاملات</h3><p class="text-gray-400">تنظیمات معاملات اینجا قرار می‌گیرد...</p></div>';
    }
    
    getSystemTab() {
        return '<div class="space-y-6"><h3 class="text-lg font-bold text-white">تب سیستم</h3><p class="text-gray-400">تنظیمات سیستم اینجا قرار می‌گیرد...</p></div>';
    }
    
    switchTab(tabName) {
        this.currentTab = tabName;
        console.log('Tab switched to:', tabName);
    }
    
    async getContent() {
        return '<div><h2>Settings Content</h2></div>';
    }
}

// Export to global
window.SettingsModule = SettingsModule;
console.log('✅ Minimal SettingsModule loaded');
`;

require('fs').writeFileSync('./public/static/modules/settings-minimal.js', minimalSettings);
console.log('✅ Created minimal settings module');

// Test this minimal version
try {
    eval(minimalSettings);
    const settings = new SettingsModule();
    console.log('✅ Minimal SettingsModule works');
    console.log('Trading tab content length:', settings.getTradingTab().length);
    console.log('System tab content length:', settings.getSystemTab().length);
} catch (e) {
    console.error('❌ Minimal version failed:', e.message);
}