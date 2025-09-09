// Test template literal fix
console.log('🔧 Testing template literal fix...');

// Create a minimal SettingsModule class to test
class SettingsModule {
    constructor() {
        this.currentTab = 'general';
        this.settings = {
            general: { theme: 'dark', language: 'fa', timezone: 'Asia/Tehran' }
        };
    }
    
    getTabButtonClass(tabName) {
        return this.currentTab === tabName 
            ? 'text-blue-400 border-b-2 border-blue-400' 
            : 'text-gray-400 hover:text-white';
    }
    
    getSelectOption(value, currentValue, label) {
        const selected = currentValue === value ? 'selected' : '';
        return `<option value="${value}" ${selected}>${label}</option>`;
    }
    
    // Test the problematic template literal
    testTemplateContent() {
        return `
            <button onclick="settingsModule.switchTab('general')" 
                    class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.getTabButtonClass('general')}">
                <i class="fas fa-cog"></i>عمومی
            </button>
            
            <select class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                ${this.getSelectOption('dark', this.settings.general.theme, 'تیره')}
                ${this.getSelectOption('light', this.settings.general.theme, 'روشن')}
            </select>
        `;
    }
}

try {
    const settings = new SettingsModule();
    console.log('✅ SettingsModule created');
    
    const content = settings.testTemplateContent();
    console.log('✅ Template content generated');
    console.log('Content length:', content.length);
    
    // Check if it contains expected elements
    if (content.includes('text-blue-400') && content.includes('selected')) {
        console.log('✅ Template literals working correctly');
    } else {
        console.log('❌ Template literals not working');
    }
    
} catch (e) {
    console.error('❌ Test failed:', e.message);
}