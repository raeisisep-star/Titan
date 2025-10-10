/**
 * Module Loader
 * مسئول بارگذاری و مدیریت ماژول‌های داینامیک سیستم
 */

class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.moduleCache = new Map();
        this.loadingPromises = new Map();
        this.isEnabled = true; // Property needed by app.js
        this.moduleClassMap = {
            'dashboard': 'DashboardModule',
            'trading': 'TradingModule', 
            'autopilot-advanced': 'AutopilotAdvancedModule',
            'portfolio': 'PortfolioModule',
            'artemis': 'ArtemisModule',
            'watchlist': 'WatchlistModule',
            'analytics': 'AnalyticsModule',
            'news': 'NewsModule',
            'alerts': 'AlertsModule',
            'settings': 'SettingsModule'
        };
        
        // Cache busting timestamp
        this.cacheVersion = Date.now();
        
        console.log('✅ ModuleLoader initialized with', Object.keys(this.moduleClassMap).length, 'modules');
    }

    /**
     * بارگذاری ماژول با نام مشخص
     */
    async loadModule(moduleName, options = {}) {
        if (!moduleName) {
            throw new Error('Module name is required');
        }

        // اگر ماژول در حال بارگذاری است، منتظر بمان
        if (this.loadingPromises.has(moduleName)) {
            return await this.loadingPromises.get(moduleName);
        }

        // اگر ماژول قبلاً بارگذاری شده، آن را برگردان
        if (this.loadedModules.has(moduleName)) {
            const cachedModule = this.loadedModules.get(moduleName);
            console.log(`📦 Using cached module: ${moduleName}`);
            return cachedModule;
        }

        // شروع بارگذاری جدید
        const loadingPromise = this._loadModuleScript(moduleName);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const moduleInstance = await loadingPromise;
            this.loadedModules.set(moduleName, moduleInstance);
            return moduleInstance;
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw error;
        } finally {
            this.loadingPromises.delete(moduleName);
        }
    }

    /**
     * بارگذاری اسکریپت ماژول
     */
    async _loadModuleScript(moduleName) {
        const scriptPath = `/static/modules/${moduleName}.js?v=${this.cacheVersion}`;
        const expectedClassName = this.moduleClassMap[moduleName];

        if (!expectedClassName) {
            throw new Error(`Unknown module: ${moduleName}`);
        }

        console.log(`🔄 Loading module script: ${moduleName} (${expectedClassName})`);

        // بررسی اینکه آیا کلاس قبلاً موجود است
        if (window.TitanModules && window.TitanModules[expectedClassName]) {
            console.log(`✅ Module class ${expectedClassName} already available`);
            return new window.TitanModules[expectedClassName]();
        }

        // بارگذاری اسکریپت
        await this._loadScript(scriptPath);

        // بررسی موجودیت کلاس پس از بارگذاری
        if (!window.TitanModules || !window.TitanModules[expectedClassName]) {
            throw new Error(`Module class ${expectedClassName} not found after loading ${scriptPath}`);
        }

        // ایجاد نمونه از ماژول
        const ModuleClass = window.TitanModules[expectedClassName];
        const moduleInstance = new ModuleClass();
        
        console.log(`✅ Module ${moduleName} loaded successfully`);
        return moduleInstance;
    }

    /**
     * بارگذاری اسکریپت از مسیر مشخص
     */
    _loadScript(src) {
        return new Promise((resolve, reject) => {
            // بررسی اینکه آیا اسکریپت قبلاً بارگذاری شده
            const existingScript = document.querySelector(`script[src^="${src.split('?')[0]}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            
            script.onload = () => {
                console.log(`✅ Script loaded: ${src}`);
                resolve();
            };
            
            script.onerror = (error) => {
                console.error(`❌ Script load error: ${src}`, error);
                reject(new Error(`Failed to load script: ${src}`));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * حذف ماژول از cache
     */
    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            const module = this.loadedModules.get(moduleName);
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
            this.loadedModules.delete(moduleName);
            console.log(`🗑️ Module ${moduleName} unloaded`);
        }
    }

    /**
     * بارگذاری چندین ماژول به صورت موازی
     */
    async loadModules(moduleNames) {
        const promises = moduleNames.map(name => this.loadModule(name));
        return Promise.all(promises);
    }

    /**
     * دریافت لیست ماژول‌های بارگذاری شده
     */
    getLoadedModules() {
        return Array.from(this.loadedModules.keys());
    }

    /**
     * بررسی وضعیت بارگذاری ماژول
     */
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    /**
     * پاک کردن تمام cache
     */
    clearCache() {
        this.loadedModules.clear();
        this.moduleCache.clear();
        this.loadingPromises.clear();
        console.log('🧹 Module cache cleared');
    }

    /**
     * بروزرسانی cache version برای cache busting
     */
    updateCacheVersion() {
        this.cacheVersion = Date.now();
        console.log('🔄 Cache version updated:', this.cacheVersion);
    }

    /**
     * دریافت اطلاعات آماری
     */
    getStats() {
        return {
            totalModules: Object.keys(this.moduleClassMap).length,
            loadedModules: this.loadedModules.size,
            cacheVersion: this.cacheVersion,
            availableModules: Object.keys(this.moduleClassMap)
        };
    }
}

// Export کردن کلاس به صورت global
window.ModuleLoader = ModuleLoader;

// ایجاد namespace برای ماژول‌ها
if (typeof window.TitanModules === 'undefined') {
    window.TitanModules = {};
}

console.log('🚀 ModuleLoader class registered globally');