// Settings Loader - Module-Based Architecture Coordinator
// Replaces the original 8008-line settings.js with clean modular system

class SettingsLoader {
    constructor() {
        this.isLoaded = false;
        this.settingsCore = null;
        this.loadedTabs = new Set();
        
        console.log('🚀 SettingsLoader initialized');
    }

    // Main loading method
    async load() {
        if (this.isLoaded) {
            console.log('⚠️ Settings already loaded, skipping...');
            return this.settingsCore;
        }

        try {
            console.log('📦 Loading Settings Core System...');
            
            // Load core settings system
            await this.loadCoreSystem();
            
            // Initialize the core
            await this.settingsCore.initialize();
            
            this.isLoaded = true;
            console.log('✅ Settings system loaded successfully!');
            
            return this.settingsCore;
            
        } catch (error) {
            console.error('❌ Failed to load settings system:', error);
            throw error;
        }
    }

    // Load core settings system
    async loadCoreSystem() {
        try {
            // Load SettingsCore with cache busting
            const coreScript = document.createElement('script');
            coreScript.src = `/static/modules/settings/core/settings-core.js?v=${Date.now()}`;
            
            return new Promise((resolve, reject) => {
                coreScript.onload = () => {
                    console.log('✅ SettingsCore loaded');
                    
                    if (window.SettingsCore) {
                        this.settingsCore = new window.SettingsCore();
                        resolve();
                    } else {
                        reject(new Error('SettingsCore not found in global scope'));
                    }
                };
                
                coreScript.onerror = () => {
                    reject(new Error('Failed to load settings-core.js'));
                };
                
                document.head.appendChild(coreScript);
            });
            
        } catch (error) {
            console.error('❌ Error loading core system:', error);
            throw error;
        }
    }

    // Get settings content (for TitanModules compatibility)
    async getContent() {
        if (!this.settingsCore) {
            await this.load();
        }
        
        return this.settingsCore.render();
    }

    // Initialize method (for TitanModules compatibility)
    async initialize() {
        if (!this.settingsCore) {
            await this.load();
        }
        
        return this.settingsCore;
    }

    // Switch tab method (for compatibility)
    async switchTab(tabName) {
        if (!this.settingsCore) {
            await this.load();
        }
        
        return await this.settingsCore.switchTab(tabName);
    }

    // Show tab method (for backward compatibility)
    async showTab(tabName) {
        return await this.switchTab(tabName);
    }

    // Save settings method
    async saveAllSettings() {
        if (!this.settingsCore) {
            console.warn('⚠️ Settings core not loaded yet');
            return;
        }
        
        return await this.settingsCore.saveAllSettings();
    }

    // Export settings
    exportSettings() {
        if (!this.settingsCore) {
            console.warn('⚠️ Settings core not loaded yet');
            return;
        }
        
        return this.settingsCore.exportSettings();
    }

    // Import settings
    importSettings() {
        if (!this.settingsCore) {
            console.warn('⚠️ Settings core not loaded yet');
            return;
        }
        
        return this.settingsCore.importSettings();
    }

    // Reset to defaults
    resetToDefaults() {
        if (!this.settingsCore) {
            console.warn('⚠️ Settings core not loaded yet');
            return;
        }
        
        return this.settingsCore.resetToDefaults();
    }

    // Get current settings data
    getSettings() {
        if (!this.settingsCore) {
            console.warn('⚠️ Settings core not loaded yet');
            return {};
        }
        
        return this.settingsCore.settings;
    }

    // Update settings data
    updateSettings(newSettings) {
        if (!this.settingsCore) {
            console.warn('⚠️ Settings core not loaded yet');
            return;
        }
        
        this.settingsCore.settings = { ...this.settingsCore.settings, ...newSettings };
    }

    // Error recovery method
    handleError(error) {
        console.error('🚨 Settings system error:', error);
        
        // Return fallback HTML
        return `
            <div class="max-w-4xl mx-auto p-6">
                <div class="bg-red-900 rounded-lg p-6 text-center border border-red-700">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold text-white mb-2">خطا در سیستم تنظیمات</h3>
                    <p class="text-red-200 mb-4">${error.message}</p>
                    <div class="space-x-2 space-x-reverse">
                        <button onclick="window.location.reload()" 
                                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            <i class="fas fa-refresh mr-2"></i>
                            بارگذاری مجدد
                        </button>
                        <button onclick="settingsLoader.load()" 
                                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            <i class="fas fa-redo mr-2"></i>
                            تلاش مجدد
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Status check
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            coreLoaded: !!this.settingsCore,
            loadedTabs: Array.from(this.loadedTabs),
            tabCount: this.loadedTabs.size
        };
    }

    // Cleanup method
    cleanup() {
        console.log('🧹 Cleaning up settings system...');
        
        this.isLoaded = false;
        this.settingsCore = null;
        this.loadedTabs.clear();
        
        // Clean up global references
        if (window.settingsCore) {
            delete window.settingsCore;
        }
        if (window.settingsModule) {
            delete window.settingsModule;
        }
    }

    // Force reload
    async forceReload() {
        console.log('🔄 Force reloading settings system...');
        
        this.cleanup();
        return await this.load();
    }
}

// Create and setup SettingsModule for TitanModules compatibility
class SettingsModule {
    constructor() {
        this.loader = new SettingsLoader();
        console.log('📋 SettingsModule created with module loader');
    }

    async getContent() {
        try {
            return await this.loader.getContent();
        } catch (error) {
            return this.loader.handleError(error);
        }
    }

    async initialize() {
        try {
            return await this.loader.initialize();
        } catch (error) {
            console.error('❌ Settings initialization failed:', error);
        }
    }

    async switchTab(tabName) {
        return await this.loader.switchTab(tabName);
    }

    async showTab(tabName) {
        return await this.loader.showTab(tabName);
    }

    async getTradingTab() {
        // Redirect to module-based approach
        await this.loader.switchTab('trading');
        return 'Trading tab loaded via module system';
    }

    async getSystemTab() {
        // Redirect to module-based approach 
        await this.loader.switchTab('system');
        return 'System tab loaded via module system';
    }

    async getGeneralTab() {
        await this.loader.switchTab('general');
        return 'General tab loaded via module system';
    }

    async getExchangesTab() {
        await this.loader.switchTab('exchanges');
        return 'Exchanges tab loaded via module system';
    }

    // Additional compatibility methods
    saveAllSettings() { return this.loader.saveAllSettings(); }
    exportSettings() { return this.loader.exportSettings(); }
    importSettings() { return this.loader.importSettings(); }
    resetToDefaults() { return this.loader.resetToDefaults(); }
    getSettings() { return this.loader.getSettings(); }
}

// Export for TitanModules namespace
if (typeof window !== 'undefined') {
    // Ensure TitanModules namespace exists
    window.TitanModules = window.TitanModules || {};
    
    // Register the new SettingsModule
    window.TitanModules.SettingsModule = SettingsModule;
    
    // Create global instances for compatibility
    window.settingsLoader = new SettingsLoader();
    
    console.log('✅ Settings system registered in TitanModules namespace');
    console.log('🎯 Available: window.TitanModules.SettingsModule');
    console.log('🎯 Available: window.settingsLoader');
}

// Also support direct import
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsModule, SettingsLoader };
}