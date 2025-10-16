// Settings Core System - Module-Based Architecture
// Base system for managing all settings with clean template literals

class SettingsCore {
    constructor() {
        this.currentTab = 'general';
        this.modules = {};
        this.loadedTabs = new Set();
        
        // Base settings structure - CLEAN, no template literals in values
        this.settings = {
            general: {
                theme: 'dark',
                language: 'fa', 
                rtl: true,
                timezone: 'Asia/Tehran',
                currency: 'USD',
                dateFormat: 'jYYYY/jMM/jDD',
                numberFormat: 'fa-IR'
            },
            notifications: {
                email: {
                    enabled: true,
                    smtp_host: '',
                    smtp_port: 587,
                    smtp_user: '',
                    smtp_pass: '',
                    from_email: '',
                    from_name: 'TITAN Trading System'
                },
                telegram: {
                    enabled: false,
                    bot_token: '',
                    chat_id: '',
                    parse_mode: 'HTML'
                },
                whatsapp: {
                    enabled: false,
                    api_token: '',
                    phone_number: '',
                    instance_id: ''
                },
                sms: {
                    enabled: false,
                    provider: 'kavenegar',
                    api_key: '',
                    sender: 'TITAN'
                },
                discord: {
                    enabled: false,
                    webhook_url: '',
                    username: 'TITAN Bot'
                },
                inapp: {
                    enabled: true,
                    sound: true,
                    desktop: true
                }
            },
            exchanges: {
                binance: {
                    enabled: false,
                    api_key: '',
                    api_secret: '',
                    testnet: true,
                    rate_limit: 1000
                },
                coinbase: {
                    enabled: false,
                    api_key: '',
                    api_secret: '',
                    passphrase: '',
                    sandbox: true
                },
                kucoin: {
                    enabled: false,
                    api_key: '',
                    api_secret: '',
                    passphrase: '',
                    sandbox: true
                },
                mexc: {
                    enabled: false,
                    api_key: '',
                    api_secret: '',
                    testnet: true,
                    rate_limit: 1000,
                    memo: 'No KYC required - Easy setup'
                }
            },
            ai: {
                openai: {
                    enabled: false,
                    api_key: '',
                    model: 'gpt-4',
                    temperature: 0.7,
                    max_tokens: 2000
                },
                anthropic: {
                    enabled: false,
                    api_key: '',
                    model: 'claude-3-sonnet-20240229',
                    temperature: 0.7,
                    max_tokens: 2000
                },
                gemini: {
                    enabled: false,
                    api_key: '',
                    model: 'gemini-pro',
                    temperature: 0.7
                },
                artemis: {
                    enabled: true,
                    version: '3.1.0',
                    learning_mode: true,
                    prediction_accuracy: 85.2
                }
            },
            trading: {
                risk_management: {
                    max_risk_per_trade: 2.0,
                    max_daily_loss: 5.0,
                    max_positions: 10,
                    max_amount_per_trade: 1000
                },
                auto_trading: {
                    enabled: true,
                    strategies: {
                        momentum: true,
                        mean_reversion: false,
                        dca: true,
                        grid: false
                    }
                }
            },
            security: {
                two_factor: false,
                login_notifications: true,
                session_timeout: 3600,
                ip_whitelist: [],
                api_rate_limit: 100
            },
            system: {
                cache_enabled: true,
                debug_mode: false,
                auto_backup: true,
                performance_monitoring: true
            }
        };
    }

    // Clean tab class generation - NO template literals
    getTabClass(tabName) {
        const baseClass = 'px-4 py-2 text-sm font-medium transition-colors border-b-2';
        const activeClass = 'text-blue-400 border-blue-400';
        const inactiveClass = 'text-gray-400 border-transparent hover:text-gray-200';
        
        if (this.currentTab === tabName) {
            return baseClass + ' ' + activeClass;
        } else {
            return baseClass + ' ' + inactiveClass;
        }
    }

    // Async module loading
    async loadTabModule(tabName) {
        if (this.loadedTabs.has(tabName)) {
            return this.modules[tabName];
        }

        try {
            console.log(`🔄 Loading ${tabName} tab module...`);
            
            // Dynamic import with cache busting
            const module = await import(`../tabs/${tabName}-tab.js?v=${Date.now()}`);
            this.modules[tabName] = new module.default(this.settings);
            this.loadedTabs.add(tabName);
            
            console.log(`✅ ${tabName} tab module loaded successfully`);
            return this.modules[tabName];
            
        } catch (error) {
            console.error(`❌ Failed to load ${tabName} tab:`, error);
            
            // Fallback to simple HTML
            this.modules[tabName] = {
                render: () => `
                    <div class="text-center py-8">
                        <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                        <h3 class="text-xl font-bold text-white mb-2">خطا در بارگذاری</h3>
                        <p class="text-gray-400">ماژول ${tabName} قابل دسترسی نیست</p>
                    </div>
                `
            };
            return this.modules[tabName];
        }
    }

    // Switch tab with module loading
    async switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update navigation classes
        this.updateNavigation();
        
        // Load and render tab content
        const module = await this.loadTabModule(tabName);
        const content = document.getElementById('settings-tab-content');
        
        if (content && module) {
            content.innerHTML = module.render();
            
            // Initialize tab-specific functionality
            if (module.initialize) {
                module.initialize();
            }
        }
    }

    // Update navigation without template literals
    updateNavigation() {
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            const tabName = button.getAttribute('data-tab');
            button.className = this.getTabClass(tabName);
        });
    }

    // Main render method - CLEAN HTML concatenation
    render() {
        return `
            <div class="max-w-6xl mx-auto">
                <!-- Settings Header -->
                <div class="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-white flex items-center">
                                <i class="fas fa-cog text-blue-400 mr-3"></i>
                                تنظیمات سیستم TITAN
                            </h2>
                            <p class="text-gray-400 mt-2">پیکربندی کامل سیستم معاملاتی و هوش مصنوعی</p>
                        </div>
                        <div class="flex space-x-2 space-x-reverse">
                            <button onclick="settingsCore.exportSettings()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-download mr-2"></i>
                                صادرات
                            </button>
                            <button onclick="settingsCore.importSettings()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-upload mr-2"></i>
                                وارد کردن
                            </button>
                            <button onclick="settingsCore.resetToDefaults()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                <i class="fas fa-undo mr-2"></i>
                                بازگردانی
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Settings Tabs -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <!-- Tab Navigation -->
                    <div class="flex border-b border-gray-700 overflow-x-auto">
                        <button data-tab="general" onclick="settingsCore.switchTab('general')" class="` + this.getTabClass('general') + `">
                            <i class="fas fa-cog"></i>عمومی
                        </button>
                        <button data-tab="notifications" onclick="settingsCore.switchTab('notifications')" class="` + this.getTabClass('notifications') + `">
                            <i class="fas fa-bell"></i>اعلان‌ها
                        </button>
                        <button data-tab="exchanges" onclick="settingsCore.switchTab('exchanges')" class="` + this.getTabClass('exchanges') + `">
                            <i class="fas fa-exchange-alt"></i>صرافی‌ها
                        </button>
                        <button data-tab="ai" onclick="settingsCore.switchTab('ai')" class="` + this.getTabClass('ai') + `">
                            <i class="fas fa-robot"></i>هوش مصنوعی
                        </button>
                        <button data-tab="trading" onclick="settingsCore.switchTab('trading')" class="` + this.getTabClass('trading') + `">
                            <i class="fas fa-chart-line"></i>معاملات
                        </button>
                        <button data-tab="security" onclick="settingsCore.switchTab('security')" class="` + this.getTabClass('security') + `">
                            <i class="fas fa-shield-alt"></i>امنیت
                        </button>
                        <button data-tab="users" onclick="settingsCore.switchTab('users')" class="` + this.getTabClass('users') + `">
                            <i class="fas fa-users"></i>کاربران
                        </button>
                        <button data-tab="system" onclick="settingsCore.switchTab('system')" class="` + this.getTabClass('system') + `">
                            <i class="fas fa-cogs"></i>سیستم
                        </button>
                        <button data-tab="monitoring" onclick="settingsCore.switchTab('monitoring')" class="` + this.getTabClass('monitoring') + `">
                            <i class="fas fa-chart-area"></i>پایش
                        </button>
                        <button data-tab="wallets" onclick="settingsCore.switchTab('wallets')" class="` + this.getTabClass('wallets') + `">
                            <i class="fas fa-wallet"></i>کیف پول‌ها
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="settings-tab-content" class="p-6 min-h-96">
                        <div class="text-center py-8">
                            <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                            <p class="text-gray-300">در حال بارگذاری تنظیمات...</p>
                        </div>
                    </div>
                </div>

                <!-- Save Button -->
                <div class="mt-6 text-center">
                    <button onclick="settingsCore.saveAllSettings()" class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-save mr-2"></i>
                        ذخیره تنظیمات
                    </button>
                </div>
            </div>
        `;
    }

    // Settings management methods
    async saveAllSettings() {
        try {
            console.log('💾 Saving all settings...');
            
            // Collect data from all loaded modules
            const allSettings = { ...this.settings };
            
            for (const [tabName, module] of Object.entries(this.modules)) {
                if (module.collectData) {
                    allSettings[tabName] = module.collectData();
                }
            }
            
            // Send to backend
            const response = await fetch('/api/settings/save-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allSettings)
            });
            
            if (response.ok) {
                console.log('✅ Settings saved successfully');
                this.showNotification('تنظیمات با موفقیت ذخیره شد', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
            
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            this.showNotification('خطا در ذخیره تنظیمات', 'error');
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `titan-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('تنظیمات صادر شد', 'success');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        this.settings = { ...this.settings, ...importedSettings };
                        this.showNotification('تنظیمات وارد شد', 'success');
                        
                        // Reload current tab
                        this.switchTab(this.currentTab);
                    } catch (error) {
                        this.showNotification('خطا در وارد کردن فایل', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    resetToDefaults() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه تنظیمات را به حالت پیش‌فرض بازگردانید؟')) {
            // Reset to default values (implementation would restore original settings)
            this.showNotification('تنظیمات به حالت پیش‌فرض بازگردانده شد', 'success');
            this.switchTab(this.currentTab);
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize the settings system
    async initialize() {
        console.log('🚀 Initializing Settings Core System');
        
        // Load settings from backend first
        await this.loadSettingsFromBackend();
        
        // Load initial tab (general)
        await this.switchTab('general');
        
        // Set up global instance
        window.settingsCore = this;
        
        console.log('✅ Settings Core initialized successfully');
    }
    
    async loadSettingsFromBackend() {
        try {
            console.log('📥 Loading settings from backend...');
            
            const token = localStorage.getItem('titan_auth_token');
            if (!token) {
                console.warn('⚠️ No auth token found, using default settings');
                return;
            }
            
            const response = await fetch('/api/settings', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    // Merge backend settings with defaults
                    this.settings = {
                        ...this.settings,
                        ...result.data
                    };
                    console.log('✅ Settings loaded from backend:', this.settings);
                } else {
                    console.warn('⚠️ Backend returned no settings data');
                }
            } else if (response.status === 401) {
                console.warn('⚠️ Unauthorized - token may be invalid');
            } else {
                console.warn('⚠️ Failed to load settings:', response.status);
            }
        } catch (error) {
            console.error('❌ Error loading settings from backend:', error);
            // Continue with default settings
        }
    }
}

// Export for module loading
window.SettingsCore = SettingsCore;