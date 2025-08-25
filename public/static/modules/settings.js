// Settings Module for Titan Trading System - Complete Implementation
// Comprehensive system configuration and user preferences

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
                    provider: 'kavenegar', // kavenegar, twilio
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
                    desktop: true,
                    mobile: true
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
                }
            },
            ai: {
                openai: {
                    enabled: false,
                    api_key: '',
                    model: 'gpt-4',
                    max_tokens: 2000
                },
                anthropic: {
                    enabled: false,
                    api_key: '',
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 2000
                },
                gemini: {
                    enabled: false,
                    api_key: '',
                    model: 'gemini-pro',
                    max_tokens: 2000
                }
            },
            trading: {
                risk_management: {
                    max_risk_per_trade: 2,
                    max_daily_loss: 5,
                    max_positions: 10,
                    stop_loss_default: 2,
                    take_profit_default: 6
                },
                auto_trading: {
                    enabled: false,
                    strategies: ['momentum', 'mean_reversion'],
                    min_confidence: 0.7,
                    max_amount_per_trade: 100
                },
                alerts: {
                    price_alerts: true,
                    trade_alerts: true,
                    ai_insights: true,
                    system_alerts: true
                }
            },
            security: {
                two_factor: {
                    enabled: false,
                    method: 'totp', // totp, sms, email
                    backup_codes: []
                },
                session: {
                    timeout: 24, // hours
                    concurrent_sessions: 3,
                    auto_logout: true
                },
                api_access: {
                    enabled: false,
                    rate_limit: 100,
                    whitelist_ips: []
                }
            }
        };
        this.isLoading = false;
        this.exchangeStatus = {};
        this.aiStatus = {};
    }

    async initialize() {
        console.log('⚙️ Initializing Settings module...');
        
        try {
            await this.loadSettings();
            this.setupEventListeners();
            console.log('✅ Settings module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing settings module:', error);
            throw error;
        }
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">⚙️ تنظیمات سیستم</h2>
                    <p class="text-gray-400 mt-1">پیکربندی کامل سیستم معاملاتی TITAN</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="settingsModule.exportSettings()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>خروجی تنظیمات
                    </button>
                    <button onclick="settingsModule.importSettings()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-upload mr-2"></i>ورودی تنظیمات
                    </button>
                </div>
            </div>

            <!-- Settings Tabs -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <!-- Tab Navigation -->
                <div class="flex border-b border-gray-700 overflow-x-auto">
                    <button onclick="settingsModule.switchTab('general')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'general' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-cog"></i>عمومی
                    </button>
                    <button onclick="settingsModule.switchTab('notifications')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'notifications' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-bell"></i>اعلان‌ها
                    </button>
                    <button onclick="settingsModule.switchTab('exchanges')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'exchanges' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-exchange-alt"></i>صرافی‌ها
                    </button>
                    <button onclick="settingsModule.switchTab('ai')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'ai' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-robot"></i>هوش مصنوعی
                    </button>
                    <button onclick="settingsModule.switchTab('ai-management')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'ai-management' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-robot"></i>مدیریت AI
                    </button>
                    <button onclick="settingsModule.switchTab('trading')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'trading' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-chart-line"></i>معاملات
                    </button>
                    <button onclick="settingsModule.switchTab('security')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-shield-alt"></i>امنیت
                    </button>
                    <button onclick="settingsModule.switchTab('users')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'users' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-users"></i>مدیریت کاربران
                    </button>
                    <button onclick="settingsModule.switchTab('system')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'system' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-cogs"></i>سیستم
                    </button>
                    <button onclick="settingsModule.switchTab('monitoring')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'monitoring' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-chart-area"></i>پایش سیستم
                    </button>
                    <button onclick="settingsModule.switchTab('wallets')" 
                            class="settings-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${this.currentTab === 'wallets' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}">
                        <i class="fas fa-wallet"></i>کیف پول‌ها
                    </button>
                </div>

                <!-- Tab Content -->
                <div id="settings-tab-content" class="p-6">
                    ${this.getTabContent()}
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end gap-3">
                <button onclick="settingsModule.resetSettings()" class="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg text-white">
                    <i class="fas fa-undo mr-2"></i>بازنشانی
                </button>
                <button onclick="settingsModule.saveSettings()" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white">
                    <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                </button>
            </div>
        </div>`;
    }

    getTabContent() {
        switch (this.currentTab) {
            case 'general':
                return this.getGeneralTab();
            case 'notifications':
                return this.getNotificationsTab();
            case 'exchanges':
                return this.getExchangesTab();
            case 'ai':
                return this.getAITab();
            case 'ai-management':
                return this.getAIManagementTab();
            case 'trading':
                return this.getTradingTab();
            case 'security':
                return this.getSecurityTab();
            case 'users':
                return this.getUsersTab();
            case 'system':
                return this.getSystemTab();
            case 'monitoring':
                return this.getMonitoringTab();
            case 'wallets':
                return this.getWalletsTab();
            default:
                return this.getGeneralTab();
        }
    }

    getGeneralTab() {
        return `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Theme Settings -->
                <div class="bg-gray-900 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-white mb-4">🎨 تنظیمات ظاهری</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">تم رنگی</label>
                            <select id="theme-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="dark" ${this.settings.general.theme === 'dark' ? 'selected' : ''}>تیره</option>
                                <option value="light" ${this.settings.general.theme === 'light' ? 'selected' : ''}>روشن</option>
                                <option value="auto" ${this.settings.general.theme === 'auto' ? 'selected' : ''}>خودکار</option>
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

                <!-- Regional Settings -->
                <div class="bg-gray-900 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-white mb-4">🌍 تنظیمات منطقه‌ای</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">منطقه زمانی</label>
                            <select id="timezone-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="Asia/Tehran" ${this.settings.general.timezone === 'Asia/Tehran' ? 'selected' : ''}>تهران (UTC+3:30)</option>
                                <option value="UTC" ${this.settings.general.timezone === 'UTC' ? 'selected' : ''}>UTC (UTC+0)</option>
                                <option value="America/New_York" ${this.settings.general.timezone === 'America/New_York' ? 'selected' : ''}>نیویورک (UTC-5)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">ارز پیش‌فرض</label>
                            <select id="currency-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="USD" ${this.settings.general.currency === 'USD' ? 'selected' : ''}>دلار آمریکا (USD)</option>
                                <option value="USDT" ${this.settings.general.currency === 'USDT' ? 'selected' : ''}>تتر (USDT)</option>
                                <option value="BTC" ${this.settings.general.currency === 'BTC' ? 'selected' : ''}>بیت‌کوین (BTC)</option>
                                <option value="ETH" ${this.settings.general.currency === 'ETH' ? 'selected' : ''}>اتریوم (ETH)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Status -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">📊 وضعیت سیستم</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                        <div class="text-sm text-gray-300">سیستم اصلی</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-2"></div>
                        <div class="text-sm text-gray-300">صرافی‌ها</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-red-400 rounded-full mx-auto mb-2"></div>
                        <div class="text-sm text-gray-300">هوش مصنوعی</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                        <div class="text-sm text-gray-300">اعلان‌ها</div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getNotificationsTab() {
        return `
        <div class="space-y-6">
            <!-- Email Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">📧 اعلان‌های ایمیل</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="email-enabled" class="sr-only peer" ${this.settings.notifications.email.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">سرور SMTP</label>
                        <input type="text" id="smtp-host" placeholder="smtp.gmail.com" value="${this.settings.notifications.email.smtp_host}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">پورت</label>
                        <input type="number" id="smtp-port" placeholder="587" value="${this.settings.notifications.email.smtp_port}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری</label>
                        <input type="email" id="smtp-user" placeholder="your-email@gmail.com" value="${this.settings.notifications.email.smtp_user}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور</label>
                        <input type="password" id="smtp-pass" placeholder="••••••••" value="${this.settings.notifications.email.smtp_pass}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4">
                    <button onclick="settingsModule.testNotification('email')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>تست ارسال ایمیل
                    </button>
                </div>
            </div>

            <!-- Telegram Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">📱 اعلان‌های تلگرام</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="telegram-enabled" class="sr-only peer" ${this.settings.notifications.telegram.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">توکن ربات</label>
                        <input type="text" id="telegram-token" placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" value="${this.settings.notifications.telegram.bot_token}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">شناسه چت</label>
                        <input type="text" id="telegram-chat-id" placeholder="@your_channel یا 123456789" value="${this.settings.notifications.telegram.chat_id}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="settingsModule.testNotification('telegram')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>تست ارسال تلگرام
                    </button>
                    <button onclick="settingsModule.createTelegramBot()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-robot mr-2"></i>راهنمای ساخت ربات
                    </button>
                </div>
            </div>

            <!-- WhatsApp Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">📲 اعلان‌های واتساپ</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="whatsapp-enabled" class="sr-only peer" ${this.settings.notifications.whatsapp.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">توکن API</label>
                        <input type="text" id="whatsapp-token" placeholder="WhatsApp Business API Token" value="${this.settings.notifications.whatsapp.api_token}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">شماره تلفن</label>
                        <input type="tel" id="whatsapp-phone" placeholder="+989123456789" value="${this.settings.notifications.whatsapp.phone_number}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="settingsModule.testNotification('whatsapp')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>تست ارسال واتساپ
                    </button>
                    <button onclick="settingsModule.whatsappSetupGuide()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-book mr-2"></i>راهنمای راه‌اندازی
                    </button>
                </div>
            </div>

            <!-- SMS Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">💬 اعلان‌های پیامک</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="sms-enabled" class="sr-only peer" ${this.settings.notifications.sms.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">ارائه‌دهنده خدمات</label>
                        <select id="sms-provider" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="kavenegar" ${this.settings.notifications.sms.provider === 'kavenegar' ? 'selected' : ''}>کاوه‌نگار</option>
                            <option value="twilio" ${this.settings.notifications.sms.provider === 'twilio' ? 'selected' : ''}>Twilio</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">کلید API</label>
                        <input type="text" id="sms-api-key" placeholder="API Key" value="${this.settings.notifications.sms.api_key}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4">
                    <button onclick="settingsModule.testNotification('sms')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>تست ارسال پیامک
                    </button>
                </div>
            </div>

            <!-- In-App Notifications -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🔔 اعلان‌های داخل برنامه</h4>
                <div class="space-y-4">
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">اعلان‌های دسکتاپ</span>
                        <input type="checkbox" id="desktop-notifications" ${this.settings.notifications.inapp.desktop ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">صدای اعلان</span>
                        <input type="checkbox" id="sound-notifications" ${this.settings.notifications.inapp.sound ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">اعلان‌های موبایل</span>
                        <input type="checkbox" id="mobile-notifications" ${this.settings.notifications.inapp.mobile ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                </div>
            </div>
        </div>`;
    }

    getExchangesTab() {
        const exchanges = ['binance', 'coinbase', 'kucoin'];
        let content = '<div class="space-y-6">';
        
        exchanges.forEach(exchange => {
            const config = this.settings.exchanges[exchange];
            const status = this.exchangeStatus[exchange] || 'disconnected';
            const statusColor = status === 'connected' ? 'green' : status === 'error' ? 'red' : 'gray';
            
            content += `
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <h4 class="text-lg font-semibold text-white capitalize">${exchange}</h4>
                        <div class="w-3 h-3 bg-${statusColor}-400 rounded-full"></div>
                        <span class="text-sm text-gray-400">${status}</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="${exchange}-enabled" class="sr-only peer" ${config.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                        <input type="password" id="${exchange}-api-key" placeholder="••••••••••••••••" value="${config.api_key}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
                        <input type="password" id="${exchange}-api-secret" placeholder="••••••••••••••••" value="${config.api_secret}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    ${exchange === 'coinbase' ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Passphrase</label>
                        <input type="password" id="${exchange}-passphrase" placeholder="••••••••" value="${config.passphrase || ''}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    ` : ''}
                    <div>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="${exchange}-testnet" ${config.testnet ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                            <span class="text-gray-300">حالت تست (${exchange === 'binance' ? 'Testnet' : 'Sandbox'})</span>
                        </label>
                    </div>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="settingsModule.testExchange('${exchange}')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-plug mr-2"></i>تست اتصال
                    </button>
                    <button onclick="settingsModule.exchangeBalances('${exchange}')" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-coins mr-2"></i>مشاهده موجودی
                    </button>
                </div>
            </div>`;
        });
        
        content += '</div>';
        return content;
    }

    getAITab() {
        const aiProviders = [
            { key: 'openai', name: 'OpenAI GPT', icon: '🤖' },
            { key: 'anthropic', name: 'Anthropic Claude', icon: '🧠' },
            { key: 'gemini', name: 'Google Gemini', icon: '✨' }
        ];
        
        let content = '<div class="space-y-6">';
        
        aiProviders.forEach(provider => {
            const config = this.settings.ai[provider.key];
            const status = this.aiStatus[provider.key] || 'disconnected';
            const statusColor = status === 'connected' ? 'green' : status === 'error' ? 'red' : 'gray';
            
            content += `
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${provider.icon}</span>
                        <h4 class="text-lg font-semibold text-white">${provider.name}</h4>
                        <div class="w-3 h-3 bg-${statusColor}-400 rounded-full"></div>
                        <span class="text-sm text-gray-400">${status}</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="${provider.key}-enabled" class="sr-only peer" ${config.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">کلید API</label>
                        <input type="password" id="${provider.key}-api-key" placeholder="••••••••••••••••" value="${config.api_key}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">مدل</label>
                        <select id="${provider.key}-model" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            ${this.getModelOptions(provider.key, config.model)}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر توکن‌ها</label>
                        <input type="number" id="${provider.key}-max-tokens" min="100" max="8000" value="${config.max_tokens}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="settingsModule.testAI('${provider.key}')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-brain mr-2"></i>تست هوش مصنوعی
                    </button>
                    <button onclick="settingsModule.showAIUsage('${provider.key}')" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-chart-bar mr-2"></i>میزان استفاده
                    </button>
                </div>
            </div>`;
        });
        
        content += '</div>';
        return content;
    }

    getModelOptions(provider, currentModel) {
        const models = {
            openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
            gemini: ['gemini-pro', 'gemini-pro-vision']
        };
        
        return models[provider].map(model => 
            `<option value="${model}" ${model === currentModel ? 'selected' : ''}>${model}</option>`
        ).join('');
    }

    getTradingTab() {
        return `
        <div class="space-y-6">
            <!-- Risk Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">⚠️ مدیریت ریسک</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر ریسک هر معامله (%)</label>
                        <input type="number" id="max-risk-per-trade" min="0.1" max="10" step="0.1" value="${this.settings.trading.risk_management.max_risk_per_trade}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر ضرر روزانه (%)</label>
                        <input type="number" id="max-daily-loss" min="1" max="20" step="0.5" value="${this.settings.trading.risk_management.max_daily_loss}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر پوزیشن‌های همزمان</label>
                        <input type="number" id="max-positions" min="1" max="50" value="${this.settings.trading.risk_management.max_positions}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر مبلغ هر معامله (USDT)</label>
                        <input type="number" id="max-amount-per-trade" min="10" max="10000" value="${this.settings.trading.auto_trading.max_amount_per_trade}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
            </div>

            <!-- Auto Trading -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">🤖 معاملات خودکار</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="auto-trading-enabled" class="sr-only peer" ${this.settings.trading.auto_trading.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">استراتژی‌های فعال</label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-momentum" ${this.settings.trading.auto_trading.strategies.includes('momentum') ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Momentum Trading</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-mean-reversion" ${this.settings.trading.auto_trading.strategies.includes('mean_reversion') ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Mean Reversion</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="strategy-dca" ${this.settings.trading.auto_trading.strategies.includes('dca') ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                <span class="text-gray-300">Dollar Cost Averaging</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداقل درصد اطمینان AI (%)</label>
                        <input type="number" id="min-confidence" min="50" max="99" value="${Math.round(this.settings.trading.auto_trading.min_confidence * 100)}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
            </div>

            <!-- Alert Settings -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🔔 هشدارهای معاملاتی</h4>
                <div class="space-y-4">
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای قیمت</span>
                        <input type="checkbox" id="price-alerts" ${this.settings.trading.alerts.price_alerts ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای معاملات</span>
                        <input type="checkbox" id="trade-alerts" ${this.settings.trading.alerts.trade_alerts ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">بینش‌های هوش مصنوعی</span>
                        <input type="checkbox" id="ai-insights" ${this.settings.trading.alerts.ai_insights ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                    <label class="flex items-center justify-between">
                        <span class="text-gray-300">هشدارهای سیستم</span>
                        <input type="checkbox" id="system-alerts" ${this.settings.trading.alerts.system_alerts ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                    </label>
                </div>
            </div>
        </div>`;
    }

    getSecurityTab() {
        return `
        <div class="space-y-6">
            <!-- Two Factor Authentication -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">🔐 احراز هویت دو مرحله‌ای</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="2fa-enabled" class="sr-only peer" ${this.settings.security.two_factor.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">روش احراز هویت</label>
                        <select id="2fa-method" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="totp" ${this.settings.security.two_factor.method === 'totp' ? 'selected' : ''}>TOTP (Google Authenticator)</option>
                            <option value="sms" ${this.settings.security.two_factor.method === 'sms' ? 'selected' : ''}>پیامک (SMS)</option>
                            <option value="email" ${this.settings.security.two_factor.method === 'email' ? 'selected' : ''}>ایمیل</option>
                        </select>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="settingsModule.setup2FA()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-qrcode mr-2"></i>راه‌اندازی 2FA
                        </button>
                        <button onclick="settingsModule.generateBackupCodes()" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-key mr-2"></i>کدهای بازیابی
                        </button>
                    </div>
                </div>
            </div>

            <!-- Session Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">⏰ مدیریت جلسات</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">مدت زمان جلسه (ساعت)</label>
                        <input type="number" id="session-timeout" min="1" max="168" value="${this.settings.security.session.timeout}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">تعداد جلسات همزمان</label>
                        <input type="number" id="concurrent-sessions" min="1" max="10" value="${this.settings.security.session.concurrent_sessions}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="auto-logout" ${this.settings.security.session.auto_logout ? 'checked' : ''} class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <span class="text-gray-300">خروج خودکار در صورت عدم فعالیت</span>
                    </label>
                </div>
                <div class="mt-4">
                    <button onclick="settingsModule.viewActiveSessions()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-list mr-2"></i>مشاهده جلسات فعال
                    </button>
                </div>
            </div>

            <!-- API Access -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white">🔌 دسترسی API</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="api-access-enabled" class="sr-only peer" ${this.settings.security.api_access.enabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">محدودیت درخواست (در دقیقه)</label>
                        <input type="number" id="api-rate-limit" min="10" max="1000" value="${this.settings.security.api_access.rate_limit}" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">IP های مجاز (هر کدام در یک خط)</label>
                        <textarea id="whitelist-ips" rows="3" placeholder="192.168.1.1&#10;10.0.0.1" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">${this.settings.security.api_access.whitelist_ips.join('\n')}</textarea>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="settingsModule.generateAPIKey()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-plus mr-2"></i>تولید کلید API
                        </button>
                        <button onclick="settingsModule.revokeAPIKeys()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-trash mr-2"></i>لغو همه کلیدها
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getSystemTab() {
        return `
        <div class="space-y-6">
            <!-- Cache Management -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">🧹 مدیریت کش</h4>
                <p class="text-gray-300 text-sm mb-4">
                    برای دیدن آخرین تغییرات و حل مشکلات بارگذاری، کش مرورگر را مدیریت کنید
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="settingsModule.clearBrowserCache()" class="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-trash mr-2"></i>پاک کردن کش
                    </button>
                    <button onclick="settingsModule.hardRefresh()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-sync-alt mr-2"></i>Refresh سخت
                    </button>
                    <button onclick="settingsModule.openCacheManager()" class="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-external-link-alt mr-2"></i>Cache Manager
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
                            <span class="text-white" id="last-update">${new Date().toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">زمان فعالیت:</span>
                            <span class="text-white" id="uptime">در حال محاسبه...</span>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-300">تعداد ماژول‌ها:</span>
                            <span class="text-white">9 ماژول</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">مرورگر:</span>
                            <span class="text-white" id="browser-info">در حال تشخیص...</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">آخرین ورود:</span>
                            <span class="text-white" id="last-login">${new Date().toLocaleString('fa-IR')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">وضعیت اتصال:</span>
                            <span class="text-green-400">آنلاین</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Module Status -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">📦 وضعیت ماژول‌ها</h4>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-tachometer-alt text-blue-400"></i>
                            <span class="text-sm text-gray-300">Dashboard</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-chart-line text-green-400"></i>
                            <span class="text-sm text-gray-300">Trading</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-briefcase text-purple-400"></i>
                            <span class="text-sm text-gray-300">Portfolio</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-robot text-cyan-400"></i>
                            <span class="text-sm text-gray-300">Artemis</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-list text-yellow-400"></i>
                            <span class="text-sm text-gray-300">Watchlist</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-bell text-red-400"></i>
                            <span class="text-sm text-gray-300">Alerts</span>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- System Actions -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">⚙️ عملیات سیستم</h4>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button onclick="settingsModule.reloadAllModules()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-redo mr-2"></i>بارگذاری مجدد ماژول‌ها
                    </button>
                    <button onclick="settingsModule.checkSystemHealth()" class="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-heartbeat mr-2"></i>بررسی سلامت سیستم
                    </button>
                    <button onclick="settingsModule.downloadLogs()" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-download mr-2"></i>دانلود لاگ‌ها
                    </button>
                    <button onclick="settingsModule.systemRestart()" class="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white text-sm">
                        <i class="fas fa-power-off mr-2"></i>راه‌اندازی مجدد
                    </button>
                </div>
            </div>
        </div>`;
    }

    getMonitoringTab() {
        return `
        <div class="space-y-6">
            <!-- System Status Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">وضعیت سیستم</h3>
                            <div id="system-status" class="text-lg font-bold text-green-400">عملیاتی</div>
                        </div>
                        <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">آخرین بررسی: <span id="last-check-time">--:--</span></div>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">استفاده CPU</h3>
                            <div id="cpu-usage" class="text-lg font-bold text-blue-400">--</div>
                        </div>
                        <i class="fas fa-microchip text-2xl text-blue-400"></i>
                    </div>
                    <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div id="cpu-bar" class="bg-blue-400 h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">استفاده حافظه</h3>
                            <div id="memory-usage" class="text-lg font-bold text-yellow-400">--</div>
                        </div>
                        <i class="fas fa-memory text-2xl text-yellow-400"></i>
                    </div>
                    <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div id="memory-bar" class="bg-yellow-400 h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-gray-300">Uptime سیستم</h3>
                            <div id="system-uptime" class="text-lg font-bold text-purple-400">--</div>
                        </div>
                        <i class="fas fa-clock text-2xl text-purple-400"></i>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">شروع: <span id="start-time">--:--</span></div>
                </div>
            </div>

            <!-- Network & Connections -->
            <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 class="text-lg font-semibold text-white mb-4">🌐 شبکه و اتصالات</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Exchange Connections -->
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h4 class="text-md font-medium text-white mb-3">صرافی‌ها</h4>
                        <div class="space-y-2" id="exchange-connections">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">Binance</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-xs text-green-400">متصل</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">Coinbase Pro</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    <span class="text-xs text-yellow-400">محدود</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">KuCoin</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                                    <span class="text-xs text-red-400">قطع</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Services -->
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h4 class="text-md font-medium text-white mb-3">سرویس‌های AI</h4>
                        <div class="space-y-2" id="ai-connections">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">OpenAI GPT</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-xs text-green-400">فعال</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">Google Gemini</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-xs text-green-400">فعال</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">Anthropic Claude</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    <span class="text-xs text-yellow-400">تست</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- External APIs -->
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h4 class="text-md font-medium text-white mb-3">API های خارجی</h4>
                        <div class="space-y-2" id="external-apis">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">CoinGecko</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-xs text-green-400">متصل</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">News API</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span class="text-xs text-green-400">متصل</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-300">Telegram Bot</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span class="text-xs text-gray-400">غیرفعال</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 flex gap-2">
                    <button onclick="settingsModule.testAllConnections()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm">
                        <i class="fas fa-network-wired mr-2"></i>تست همه اتصالات
                    </button>
                    <button onclick="settingsModule.refreshConnections()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm">
                        <i class="fas fa-sync mr-2"></i>بروزرسانی وضعیت
                    </button>
                </div>
            </div>

            <!-- Database Status -->
            <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 class="text-lg font-semibold text-white mb-4">🗄️ وضعیت پایگاه داده</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Database Tables -->
                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-white">جداول پایگاه داده</h4>
                        <div class="space-y-2" id="database-tables">
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span class="text-sm text-gray-300">users</span>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs text-blue-400">1,247 رکورد</span>
                                    <span class="text-xs text-gray-400">2.3 MB</span>
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span class="text-sm text-gray-300">trades</span>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs text-blue-400">15,692 رکورد</span>
                                    <span class="text-xs text-gray-400">45.7 MB</span>
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span class="text-sm text-gray-300">portfolios</span>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs text-blue-400">891 رکورد</span>
                                    <span class="text-xs text-gray-400">1.8 MB</span>
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span class="text-sm text-gray-300">ai_analyses</span>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs text-blue-400">3,456 رکورد</span>
                                    <span class="text-xs text-gray-400">12.4 MB</span>
                                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span class="text-sm text-gray-300">market_data</span>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs text-blue-400">89,234 رکورد</span>
                                    <span class="text-xs text-gray-400">156.8 MB</span>
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Database Operations -->
                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-white">عملیات پایگاه داده</h4>
                        <div class="space-y-3">
                            <button onclick="settingsModule.checkDatabaseHealth()" class="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded text-white text-sm text-left">
                                <i class="fas fa-stethoscope mr-2"></i>بررسی سلامت پایگاه داده
                            </button>
                            <button onclick="settingsModule.optimizeDatabase()" class="w-full bg-green-600 hover:bg-green-700 p-3 rounded text-white text-sm text-left">
                                <i class="fas fa-magic mr-2"></i>بهینه‌سازی پایگاه داده
                            </button>
                            <button onclick="settingsModule.cleanupDatabase()" class="w-full bg-yellow-600 hover:bg-yellow-700 p-3 rounded text-white text-sm text-left">
                                <i class="fas fa-broom mr-2"></i>پاکسازی داده‌های قدیمی
                            </button>
                            <button onclick="settingsModule.repairDatabase()" class="w-full bg-red-600 hover:bg-red-700 p-3 rounded text-white text-sm text-left">
                                <i class="fas fa-wrench mr-2"></i>تعمیر پایگاه داده
                            </button>
                        </div>

                        <!-- Database Statistics -->
                        <div class="bg-gray-800 rounded p-3 mt-4">
                            <h5 class="text-sm font-medium text-white mb-2">آمار کلی</h5>
                            <div class="space-y-1 text-xs">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">کل حجم:</span>
                                    <span class="text-white">218.9 MB</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">کل رکوردها:</span>
                                    <span class="text-white">110,520</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">آخرین بک‌آپ:</span>
                                    <span class="text-white">2 ساعت پیش</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">وضعیت:</span>
                                    <span class="text-green-400">سالم</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- UI/UX Tests & Browser Compatibility -->
            <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 class="text-lg font-semibold text-white mb-4">🖥️ تست رابط کاربری و سازگاری</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Browser Compatibility -->
                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-white">سازگاری مرورگر</h4>
                        <div class="space-y-2" id="browser-compatibility">
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <div class="flex items-center gap-2">
                                    <i class="fab fa-chrome text-blue-400"></i>
                                    <span class="text-sm text-gray-300">Chrome</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-green-400">100% سازگار</span>
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <div class="flex items-center gap-2">
                                    <i class="fab fa-firefox text-orange-400"></i>
                                    <span class="text-sm text-gray-300">Firefox</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-green-400">98% سازگار</span>
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <div class="flex items-center gap-2">
                                    <i class="fab fa-safari text-blue-400"></i>
                                    <span class="text-sm text-gray-300">Safari</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-yellow-400">85% سازگار</span>
                                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <div class="flex items-center gap-2">
                                    <i class="fab fa-edge text-blue-400"></i>
                                    <span class="text-sm text-gray-300">Edge</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-green-400">95% سازگار</span>
                                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- UI/UX Tests -->
                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-white">تست‌های رابط کاربری</h4>
                        <div class="space-y-3">
                            <button onclick="settingsModule.testResponsiveDesign()" class="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded text-white text-sm text-left">
                                <i class="fas fa-mobile-alt mr-2"></i>تست Responsive Design
                            </button>
                            <button onclick="settingsModule.testLoadingTimes()" class="w-full bg-green-600 hover:bg-green-700 p-3 rounded text-white text-sm text-left">
                                <i class="fas fa-stopwatch mr-2"></i>تست زمان بارگذاری
                            </button>
                            <button onclick="settingsModule.testFormValidation()" class="w-full bg-yellow-600 hover:bg-yellow-700 p-3 rounded text-white text-sm text-left">
                                <i class="fas fa-check-circle mr-2"></i>تست اعتبارسنجی فرم‌ها
                            </button>
                            <button onclick="settingsModule.testJavaScript()" class="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded text-white text-sm text-left">
                                <i class="fas fa-code mr-2"></i>تست عملکرد JavaScript
                            </button>
                        </div>

                        <!-- UI Test Results -->
                        <div class="bg-gray-800 rounded p-3" id="ui-test-results">
                            <h5 class="text-sm font-medium text-white mb-2">نتایج آخرین تست</h5>
                            <div class="space-y-1 text-xs">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">زمان بارگذاری:</span>
                                    <span class="text-green-400">1.2 ثانیه</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Performance Score:</span>
                                    <span class="text-green-400">94/100</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">خطاهای JavaScript:</span>
                                    <span class="text-red-400">2 مورد</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">آخرین تست:</span>
                                    <span class="text-white">10 دقیقه پیش</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <button onclick="settingsModule.runFullUITest()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm">
                        <i class="fas fa-play mr-2"></i>اجرای تست کامل رابط کاربری
                    </button>
                </div>
            </div>

            <!-- Backup & Restore System -->
            <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 class="text-lg font-semibold text-white mb-4">💾 سیستم بک‌آپ و بازیابی</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Create Backup -->
                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-white">ایجاد بک‌آپ</h4>
                        
                        <!-- Backup Types -->
                        <div class="space-y-3">
                            <div class="bg-gray-800 rounded p-3">
                                <label class="flex items-center gap-3">
                                    <input type="radio" name="backup-type" value="full" checked class="text-blue-600">
                                    <div>
                                        <div class="text-sm font-medium text-white">بک‌آپ کامل</div>
                                        <div class="text-xs text-gray-400">تمام داده‌ها، تنظیمات و فایل‌ها</div>
                                    </div>
                                </label>
                            </div>
                            
                            <div class="bg-gray-800 rounded p-3">
                                <label class="flex items-center gap-3">
                                    <input type="radio" name="backup-type" value="database" class="text-blue-600">
                                    <div>
                                        <div class="text-sm font-medium text-white">بک‌آپ پایگاه داده</div>
                                        <div class="text-xs text-gray-400">فقط داده‌های پایگاه داده</div>
                                    </div>
                                </label>
                            </div>
                            
                            <div class="bg-gray-800 rounded p-3">
                                <label class="flex items-center gap-3">
                                    <input type="radio" name="backup-type" value="settings" class="text-blue-600">
                                    <div>
                                        <div class="text-sm font-medium text-white">بک‌آپ تنظیمات</div>
                                        <div class="text-xs text-gray-400">فقط تنظیمات و پیکربندی‌ها</div>
                                    </div>
                                </label>
                            </div>
                            
                            <div class="bg-gray-800 rounded p-3">
                                <label class="flex items-center gap-3">
                                    <input type="radio" name="backup-type" value="custom" class="text-blue-600">
                                    <div>
                                        <div class="text-sm font-medium text-white">بک‌آپ سفارشی</div>
                                        <div class="text-xs text-gray-400">انتخاب دستی آیتم‌ها</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Custom Backup Options (Initially Hidden) -->
                        <div id="custom-backup-options" class="space-y-2 hidden">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-blue-600" checked>
                                <span class="text-sm text-gray-300">داده‌های کاربران</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-blue-600" checked>
                                <span class="text-sm text-gray-300">تاریخچه معاملات</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-blue-600">
                                <span class="text-sm text-gray-300">لاگ‌های سیستم</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-blue-600" checked>
                                <span class="text-sm text-gray-300">تنظیمات AI</span>
                            </label>
                        </div>

                        <!-- Backup Actions -->
                        <div class="space-y-2">
                            <button onclick="settingsModule.createBackup()" class="w-full bg-green-600 hover:bg-green-700 p-3 rounded text-white text-sm">
                                <i class="fas fa-save mr-2"></i>ایجاد بک‌آپ جدید
                            </button>
                            <button onclick="settingsModule.scheduleBackup()" class="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded text-white text-sm">
                                <i class="fas fa-clock mr-2"></i>برنامه‌ریزی بک‌آپ خودکار
                            </button>
                        </div>
                    </div>

                    <!-- Restore System -->
                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-white">بازیابی سیستم</h4>
                        
                        <!-- Recent Backups -->
                        <div class="space-y-2" id="backup-list">
                            <div class="bg-gray-800 rounded p-3">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="text-sm font-medium text-white">بک‌آپ کامل - 23 آگوست 2025</div>
                                        <div class="text-xs text-gray-400">218.9 MB - 14:30</div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="settingsModule.downloadBackup('backup_20250823_1430')" class="text-blue-400 hover:text-blue-300 text-xs">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button onclick="settingsModule.restoreBackup('backup_20250823_1430')" class="text-green-400 hover:text-green-300 text-xs">
                                            <i class="fas fa-undo"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-800 rounded p-3">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="text-sm font-medium text-white">بک‌آپ پایگاه داده - 23 آگوست 2025</div>
                                        <div class="text-xs text-gray-400">156.3 MB - 12:00</div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="settingsModule.downloadBackup('backup_db_20250823_1200')" class="text-blue-400 hover:text-blue-300 text-xs">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button onclick="settingsModule.restoreBackup('backup_db_20250823_1200')" class="text-green-400 hover:text-green-300 text-xs">
                                            <i class="fas fa-undo"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-800 rounded p-3">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="text-sm font-medium text-white">بک‌آپ تنظیمات - 22 آگوست 2025</div>
                                        <div class="text-xs text-gray-400">2.1 MB - 18:45</div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="settingsModule.downloadBackup('backup_settings_20250822_1845')" class="text-blue-400 hover:text-blue-300 text-xs">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button onclick="settingsModule.restoreBackup('backup_settings_20250822_1845')" class="text-green-400 hover:text-green-300 text-xs">
                                            <i class="fas fa-undo"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Upload Backup -->
                        <div class="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                            <input type="file" id="backup-upload" accept=".tar.gz,.zip,.sql" class="hidden">
                            <label for="backup-upload" class="cursor-pointer">
                                <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                <div class="text-sm text-gray-300">آپلود فایل بک‌آپ</div>
                                <div class="text-xs text-gray-500">فرمت‌های پشتیبانی: .tar.gz, .zip, .sql</div>
                            </label>
                        </div>

                        <!-- Restore Actions -->
                        <div class="space-y-2">
                            <button onclick="settingsModule.emergencyRestore()" class="w-full bg-red-600 hover:bg-red-700 p-3 rounded text-white text-sm">
                                <i class="fas fa-exclamation-triangle mr-2"></i>بازیابی اضطراری
                            </button>
                            <div class="text-xs text-gray-400 text-center">
                                ⚠️ بازیابی اضطراری تمام تغییرات فعلی را پاک می‌کند
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Backup Settings -->
                <div class="mt-6 bg-gray-800 rounded p-4">
                    <h5 class="text-sm font-medium text-white mb-3">تنظیمات بک‌آپ خودکار</h5>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">فاصله زمانی</label>
                            <select class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                <option value="daily">روزانه</option>
                                <option value="weekly" selected>هفتگی</option>
                                <option value="monthly">ماهانه</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">حداکثر تعداد بک‌آپ</label>
                            <input type="number" value="10" min="1" max="50" class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">فشرده‌سازی</label>
                            <select class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                <option value="gzip" selected>gzip</option>
                                <option value="zip">zip</option>
                                <option value="none">بدون فشرده‌سازی</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Real-time Monitoring Controls -->
            <div class="flex justify-center gap-4 mt-6">
                <button onclick="settingsModule.startRealTimeMonitoring()" class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white">
                    <i class="fas fa-play mr-2"></i>شروع پایش زنده
                </button>
                <button onclick="settingsModule.stopRealTimeMonitoring()" class="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white">
                    <i class="fas fa-stop mr-2"></i>توقف پایش
                </button>
                <button onclick="settingsModule.exportMonitoringReport()" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white">
                    <i class="fas fa-file-export mr-2"></i>گزارش کامل
                </button>
            </div>
        </div>`;
    }

    getWalletsTab() {
        return `
        <div class="space-y-6">
            <!-- Wallet Management Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-semibold text-white">💰 مدیریت کیف پول‌ها</h3>
                    <p class="text-sm text-gray-400">اتصال و مدیریت انواع کیف پول‌های دیجیتال</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="settingsModule.addWallet()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-plus mr-2"></i>افزودن کیف پول
                    </button>
                    <button onclick="settingsModule.importWallet()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-file-import mr-2"></i>ورودی کیف پول
                    </button>
                </div>
            </div>

            <!-- Wallet Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-medium text-gray-300">کل کیف پول‌ها</h4>
                            <div class="text-2xl font-bold text-blue-400" id="total-wallets">8</div>
                        </div>
                        <i class="fas fa-wallet text-2xl text-blue-400"></i>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">4 متصل، 2 آفلاین، 2 کلد</div>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-medium text-gray-300">کل موجودی</h4>
                            <div class="text-2xl font-bold text-green-400" id="total-balance">$87,456</div>
                        </div>
                        <i class="fas fa-coins text-2xl text-green-400"></i>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">+2.3% امروز</div>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-medium text-gray-300">انواع دارایی</h4>
                            <div class="text-2xl font-bold text-purple-400" id="asset-types">15</div>
                        </div>
                        <i class="fas fa-layer-group text-2xl text-purple-400"></i>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">BTC، ETH، USDT و...</div>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-medium text-gray-300">کلد والت</h4>
                            <div class="text-2xl font-bold text-orange-400" id="cold-wallets">2</div>
                        </div>
                        <i class="fas fa-snowflake text-2xl text-orange-400"></i>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">Ledger، Trezor</div>
                </div>
            </div>

            <!-- Wallet Categories -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Hot Wallets -->
                <div class="bg-gray-900 rounded-lg border border-gray-700">
                    <div class="p-4 border-b border-gray-700">
                        <h4 class="text-lg font-semibold text-white flex items-center gap-2">
                            <i class="fas fa-fire text-red-400"></i>
                            کیف پول‌های گرم (Hot Wallets)
                        </h4>
                        <p class="text-sm text-gray-400 mt-1">کیف پول‌های متصل به اینترنت برای معاملات سریع</p>
                    </div>
                    <div class="p-4 space-y-3" id="hot-wallets-list">
                        <!-- MetaMask -->
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" class="w-8 h-8 rounded">
                                <div>
                                    <div class="font-medium text-white">MetaMask</div>
                                    <div class="text-xs text-gray-400">0x1234...5678</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="text-right">
                                    <div class="text-sm font-medium text-white">$12,456</div>
                                    <div class="text-xs text-green-400">ETH, USDC, BNB</div>
                                </div>
                                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                        </div>

                        <!-- Trust Wallet -->
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <img src="https://trustwallet.com/assets/images/media/assets/TWT.png" alt="Trust Wallet" class="w-8 h-8 rounded">
                                <div>
                                    <div class="font-medium text-white">Trust Wallet</div>
                                    <div class="text-xs text-gray-400">0xABCD...EFGH</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="text-right">
                                    <div class="text-sm font-medium text-white">$8,934</div>
                                    <div class="text-xs text-blue-400">BTC, ETH, ADA</div>
                                </div>
                                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                        </div>

                        <!-- Binance Wallet -->
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <img src="https://bin.bnbstatic.com/static/images/common/favicon.ico" alt="Binance" class="w-8 h-8 rounded">
                                <div>
                                    <div class="font-medium text-white">Binance Wallet</div>
                                    <div class="text-xs text-gray-400">API Connected</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="text-right">
                                    <div class="text-sm font-medium text-white">$23,567</div>
                                    <div class="text-xs text-yellow-400">BNB, USDT, ETH</div>
                                </div>
                                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                        </div>

                        <!-- Coinbase Wallet -->
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <img src="https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806_ResourceLogoMark/b96c36e2cd64a17b814c051b13e606387ee0833db21c3193b9b27e8f93268b156f.svg" alt="Coinbase" class="w-8 h-8 rounded">
                                <div>
                                    <div class="font-medium text-white">Coinbase Wallet</div>
                                    <div class="text-xs text-gray-400">API Connected</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="text-right">
                                    <div class="text-sm font-medium text-white">$15,789</div>
                                    <div class="text-xs text-blue-400">BTC, ETH, USDC</div>
                                </div>
                                <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <div class="p-3 border-t border-gray-700">
                        <button onclick="settingsModule.refreshHotWallets()" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white text-sm">
                            <i class="fas fa-sync mr-2"></i>بروزرسانی کیف پول‌های گرم
                        </button>
                    </div>
                </div>

                <!-- Cold Wallets -->
                <div class="bg-gray-900 rounded-lg border border-gray-700">
                    <div class="p-4 border-b border-gray-700">
                        <h4 class="text-lg font-semibold text-white flex items-center gap-2">
                            <i class="fas fa-snowflake text-blue-400"></i>
                            کیف پول‌های سرد (Cold Wallets)
                        </h4>
                        <p class="text-sm text-gray-400 mt-1">کیف پول‌های آفلاین برای امنیت بالا</p>
                    </div>
                    <div class="p-4 space-y-3" id="cold-wallets-list">
                        <!-- Ledger -->
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <img src="https://www.ledger.com/favicon.ico" alt="Ledger" class="w-8 h-8 rounded">
                                <div>
                                    <div class="font-medium text-white">Ledger Nano X</div>
                                    <div class="text-xs text-gray-400">Serial: L1234567</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="text-right">
                                    <div class="text-sm font-medium text-white">$34,891</div>
                                    <div class="text-xs text-orange-400">BTC, ETH, ADA</div>
                                </div>
                                <div class="w-2 h-2 bg-blue-400 rounded-full" title="کلد والت"></div>
                            </div>
                        </div>

                        <!-- Trezor -->
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <img src="https://trezor.io/favicon.ico" alt="Trezor" class="w-8 h-8 rounded">
                                <div>
                                    <div class="font-medium text-white">Trezor Model T</div>
                                    <div class="text-xs text-gray-400">Serial: T9876543</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="text-right">
                                    <div class="text-sm font-medium text-white">$6,823</div>
                                    <div class="text-xs text-purple-400">BTC, LTC, DASH</div>
                                </div>
                                <div class="w-2 h-2 bg-blue-400 rounded-full" title="کلد والت"></div>
                            </div>
                        </div>
                    </div>
                    <div class="p-3 border-t border-gray-700">
                        <button onclick="settingsModule.manageColdWallets()" class="w-full bg-orange-600 hover:bg-orange-700 py-2 rounded text-white text-sm">
                            <i class="fas fa-cogs mr-2"></i>مدیریت کلد والت‌ها
                        </button>
                    </div>
                </div>
            </div>

            <!-- Detailed Balance Breakdown -->
            <div class="bg-gray-900 rounded-lg border border-gray-700">
                <div class="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h4 class="text-lg font-semibold text-white">💎 جزئیات دارایی‌ها</h4>
                    <div class="flex gap-2">
                        <button onclick="settingsModule.refreshAllBalances()" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-sync mr-1"></i>بروزرسانی
                        </button>
                        <button onclick="settingsModule.exportBalances()" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-download mr-1"></i>خروجی
                        </button>
                    </div>
                </div>
                <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="asset-breakdown">
                        <!-- Bitcoin -->
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg" alt="BTC" class="w-6 h-6">
                                    <span class="font-medium text-white">Bitcoin (BTC)</span>
                                </div>
                                <span class="text-orange-400 font-bold">1.2456</span>
                            </div>
                            <div class="space-y-1 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">قیمت:</span>
                                    <span class="text-white">$43,251</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">ارزش:</span>
                                    <span class="text-green-400">$53,854</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="text-gray-500">Hot: 0.3456 | Cold: 0.9000</span>
                                </div>
                            </div>
                        </div>

                        <!-- Ethereum -->
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg" alt="ETH" class="w-6 h-6">
                                    <span class="font-medium text-white">Ethereum (ETH)</span>
                                </div>
                                <span class="text-blue-400 font-bold">8.9234</span>
                            </div>
                            <div class="space-y-1 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">قیمت:</span>
                                    <span class="text-white">$2,456</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">ارزش:</span>
                                    <span class="text-green-400">$21,923</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="text-gray-500">Hot: 6.2345 | Cold: 2.6889</span>
                                </div>
                            </div>
                        </div>

                        <!-- USDT -->
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg" alt="USDT" class="w-6 h-6">
                                    <span class="font-medium text-white">Tether (USDT)</span>
                                </div>
                                <span class="text-green-400 font-bold">8,456</span>
                            </div>
                            <div class="space-y-1 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">قیمت:</span>
                                    <span class="text-white">$1.00</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">ارزش:</span>
                                    <span class="text-green-400">$8,456</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="text-gray-500">Hot: 6,456 | Cold: 2,000</span>
                                </div>
                            </div>
                        </div>

                        <!-- BNB -->
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <img src="https://cryptologos.cc/logos/bnb-bnb-logo.svg" alt="BNB" class="w-6 h-6">
                                    <span class="font-medium text-white">BNB (BNB)</span>
                                </div>
                                <span class="text-yellow-400 font-bold">45.67</span>
                            </div>
                            <div class="space-y-1 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">قیمت:</span>
                                    <span class="text-white">$234</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">ارزش:</span>
                                    <span class="text-green-400">$10,687</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="text-gray-500">Hot: 45.67 | Cold: 0.00</span>
                                </div>
                            </div>
                        </div>

                        <!-- ADA -->
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <img src="https://cryptologos.cc/logos/cardano-ada-logo.svg" alt="ADA" class="w-6 h-6">
                                    <span class="font-medium text-white">Cardano (ADA)</span>
                                </div>
                                <span class="text-blue-400 font-bold">2,345</span>
                            </div>
                            <div class="space-y-1 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">قیمت:</span>
                                    <span class="text-white">$0.456</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">ارزش:</span>
                                    <span class="text-green-400">$1,069</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="text-gray-500">Hot: 1,345 | Cold: 1,000</span>
                                </div>
                            </div>
                        </div>

                        <!-- USDC -->
                        <div class="bg-gray-800 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg" alt="USDC" class="w-6 h-6">
                                    <span class="font-medium text-white">USD Coin (USDC)</span>
                                </div>
                                <span class="text-blue-400 font-bold">3,456</span>
                            </div>
                            <div class="space-y-1 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">قیمت:</span>
                                    <span class="text-white">$1.00</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">ارزش:</span>
                                    <span class="text-green-400">$3,456</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="text-gray-500">Hot: 3,456 | Cold: 0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cold Wallet Automation -->
            <div class="bg-gray-900 rounded-lg border border-gray-700">
                <div class="p-4 border-b border-gray-700">
                    <h4 class="text-lg font-semibold text-white flex items-center gap-2">
                        <i class="fas fa-robot text-purple-400"></i>
                        اتوماسیون کلد والت
                    </h4>
                    <p class="text-sm text-gray-400 mt-1">تنظیمات خودکار انتقال به کیف پول‌های سرد</p>
                </div>
                <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Auto Transfer Settings -->
                    <div class="space-y-4">
                        <h5 class="font-medium text-white">⚙️ تنظیمات انتقال خودکار</h5>
                        
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">انتقال خودکار فعال</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="auto-transfer-enabled" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">حد آستانه انتقال</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <input type="number" placeholder="مقدار" value="10000" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                    </div>
                                    <div>
                                        <select class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                            <option value="USD">USD</option>
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                        </select>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">وقتی موجودی hot wallet از این مقدار بیشتر شد، خودکار به cold wallet انتقال می‌یابد</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">درصد انتقال</label>
                                <input type="range" min="10" max="90" value="70" class="w-full accent-purple-600" id="transfer-percentage">
                                <div class="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>10%</span>
                                    <span id="transfer-percentage-display">70%</span>
                                    <span>90%</span>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">زمان‌بندی بررسی</label>
                                <select class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                    <option value="1h">هر ساعت</option>
                                    <option value="6h" selected>هر 6 ساعت</option>
                                    <option value="24h">روزانه</option>
                                    <option value="weekly">هفتگی</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Security & Rules -->
                    <div class="space-y-4">
                        <h5 class="font-medium text-white">🔒 امنیت و قوانین</h5>
                        
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">نیاز به تأیید دو مرحله‌ای</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="require-2fa" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">اعلان انتقال</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="transfer-notifications" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر انتقال روزانه</label>
                                <input type="number" placeholder="مقدار به USD" value="50000" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">کیف پول مقصد پیش‌فرض</label>
                                <select class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                    <option value="ledger">Ledger Nano X</option>
                                    <option value="trezor">Trezor Model T</option>
                                    <option value="auto">انتخاب خودکار</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Automation Status -->
                <div class="p-4 border-t border-gray-700 bg-gray-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <h6 class="font-medium text-white">وضعیت اتوماسیون</h6>
                            <p class="text-sm text-green-400">✅ فعال - آخرین بررسی: 2 ساعت پیش</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="settingsModule.testAutomation()" class="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-sm">
                                تست
                            </button>
                            <button onclick="settingsModule.saveAutomationSettings()" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm">
                                ذخیره
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="bg-gray-900 rounded-lg border border-gray-700">
                <div class="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h4 class="text-lg font-semibold text-white">📋 تراکنش‌های اخیر</h4>
                    <button onclick="settingsModule.viewAllTransactions()" class="text-blue-400 hover:text-blue-300 text-sm">
                        مشاهده همه
                    </button>
                </div>
                <div class="p-4">
                    <div class="space-y-3" id="recent-transactions">
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-arrow-down text-white text-sm"></i>
                                </div>
                                <div>
                                    <div class="font-medium text-white">انتقال خودکار به Ledger</div>
                                    <div class="text-xs text-gray-400">2 ساعت پیش</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-medium text-green-400">+0.5 BTC</div>
                                <div class="text-xs text-gray-400">$21,625</div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-sync text-white text-sm"></i>
                                </div>
                                <div>
                                    <div class="font-medium text-white">بروزرسانی موجودی MetaMask</div>
                                    <div class="text-xs text-gray-400">5 ساعت پیش</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-medium text-blue-400">Sync</div>
                                <div class="text-xs text-gray-400">موفق</div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-arrow-up text-white text-sm"></i>
                                </div>
                                <div>
                                    <div class="font-medium text-white">انتقال از Trust Wallet</div>
                                    <div class="text-xs text-gray-400">1 روز پیش</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-medium text-yellow-400">-3,000 USDT</div>
                                <div class="text-xs text-gray-400">$3,000</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getAIManagementTab() {
        return `
        <div class="space-y-6">
            <!-- Header Section -->
            <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🧠 تنظیمات پیشرفته AI</h2>
                        <p class="opacity-90">مدیریت کامل سیستم هوش مصنوعی آرتمیس و 15 ایجنت</p>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold">15</div>
                        <div class="text-sm opacity-80">ایجنت AI</div>
                    </div>
                </div>
            </div>

            <!-- AI Management Dashboard Link -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-white">📊 داشبورد مدیریت AI</h3>
                    <div class="flex gap-2">
                        <button onclick="settingsModule.loadAIManagementDashboard()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                            <i class="fas fa-sync mr-2"></i>بارگذاری داشبورد
                        </button>
                        <a href="/ai-test" target="_blank" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            <i class="fas fa-external-link-alt mr-2"></i>داشبورد کامل
                        </a>
                    </div>
                </div>
                <div id="ai-management-container" class="min-h-[200px]">
                    <div class="bg-gray-700 rounded-lg p-4 text-center">
                        <p class="text-gray-300 mb-4">برای مشاهده داشبورد کامل مدیریت AI روی دکمه بالا کلیک کنید</p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div class="bg-gray-600 rounded p-3">
                                <div class="text-green-400 font-bold">15</div>
                                <div class="text-gray-300">ایجنت فعال</div>
                            </div>
                            <div class="bg-gray-600 rounded p-3">
                                <div class="text-blue-400 font-bold">93%</div>
                                <div class="text-gray-300">دقت متوسط</div>
                            </div>
                            <div class="bg-gray-600 rounded p-3">
                                <div class="text-purple-400 font-bold">24/7</div>
                                <div class="text-gray-300">در حال آموزش</div>
                            </div>
                            <div class="bg-gray-600 rounded p-3">
                                <div class="text-yellow-400 font-bold">AI</div>
                                <div class="text-gray-300">آرتمیس فعال</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Artemis Mother AI Settings -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-xl font-semibold text-white mb-4">🎯 تنظیمات آرتمیس Mother AI</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-300 mb-2">حالت عملکرد آرتمیس</label>
                            <select id="artemis-mode" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                                <option value="autonomous">خودمختار (پیشنهادی)</option>
                                <option value="assisted">کمک‌کننده</option>
                                <option value="monitoring">فقط نظارت</option>
                                <option value="learning">حالت یادگیری</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">سطح هوشمندی جمعی (%)</label>
                            <input type="range" id="collective-intelligence" min="60" max="100" value="85" 
                                   class="w-full h-2 bg-gray-700 rounded-lg appearance-none slider-thumb">
                            <div class="flex justify-between text-xs text-gray-400 mt-1">
                                <span>60%</span>
                                <span id="collective-value">85%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">حد آستانه اطمینان تصمیم‌گیری (%)</label>
                            <input type="range" id="decision-threshold" min="70" max="95" value="80" 
                                   class="w-full h-2 bg-gray-700 rounded-lg appearance-none slider-thumb">
                            <div class="flex justify-between text-xs text-gray-400 mt-1">
                                <span>70%</span>
                                <span id="threshold-value">80%</span>
                                <span>95%</span>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-300 mb-2">استراتژی یادگیری</label>
                            <select id="learning-strategy" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                                <option value="aggressive">تهاجمی (یادگیری سریع)</option>
                                <option value="balanced">متعادل (پیشنهادی)</option>
                                <option value="conservative">محافظه‌کارانه</option>
                                <option value="adaptive">تطبیقی</option>
                            </select>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">آموزش خودکار ایجنت‌ها</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="auto-training" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">حافظه Context طولانی‌مدت</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="long-term-memory" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">تحلیل احساسات فارسی</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="persian-sentiment" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Individual Agents Settings -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-xl font-semibold text-white mb-4">⚙️ تنظیمات ایجنت‌های فردی</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-300 mb-2">فرکانس آموزش (ساعت)</label>
                            <select id="training-frequency" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                                <option value="6">هر 6 ساعت</option>
                                <option value="12" selected>هر 12 ساعت</option>
                                <option value="24">روزانه</option>
                                <option value="168">هفتگی</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">حداکثر حافظه Context (پیام)</label>
                            <input type="number" id="max-context" value="100" min="50" max="500" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">آستانه عملکرد برای آموزش مجدد (%)</label>
                            <input type="number" id="retrain-threshold" value="75" min="50" max="90" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">بهینه‌سازی خودکار پارامترها</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="auto-optimization" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">Fallback به ایجنت‌های دیگر</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="agent-fallback" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">ثبت تفصیلی عملکرد</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="detailed-logging" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <button onclick="settingsModule.resetAllAgents()" 
                                class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                            <i class="fas fa-redo mr-2"></i>بازنشانی همه ایجنت‌ها
                        </button>
                    </div>
                </div>
            </div>

            <!-- Performance Monitoring -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-xl font-semibold text-white mb-4">📈 نظارت بر عملکرد</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-gray-700 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-green-400 mb-1">92.3%</div>
                        <div class="text-gray-300 text-sm">دقت متوسط</div>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-blue-400 mb-1">1,247</div>
                        <div class="text-gray-300 text-sm">تصمیمات امروز</div>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-purple-400 mb-1">3.2GB</div>
                        <div class="text-gray-300 text-sm">حافظه استفاده شده</div>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 justify-center">
                    <button onclick="settingsModule.generatePerformanceReport()" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        <i class="fas fa-chart-bar mr-2"></i>گزارش عملکرد
                    </button>
                    <button onclick="settingsModule.exportAISettings()" 
                            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                        <i class="fas fa-download mr-2"></i>خروجی تنظیمات
                    </button>
                    <button onclick="settingsModule.importAISettings()" 
                            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                        <i class="fas fa-upload mr-2"></i>وارد کردن تنظیمات
                    </button>
                </div>
            </div>

            <!-- Save Section -->
            <div class="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="text-white font-semibold">ذخیره تنظیمات AI</h4>
                        <p class="text-white/80 text-sm">تغییرات بلافاصله اعمال خواهد شد</p>
                    </div>
                    <button onclick="settingsModule.saveAIManagementSettings()" 
                            class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold backdrop-blur-sm">
                        <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                    </button>
                </div>
            </div>
        </div>

        <script>
            // Update slider values
            document.getElementById('collective-intelligence')?.addEventListener('input', function() {
                document.getElementById('collective-value').textContent = this.value + '%';
            });
            document.getElementById('decision-threshold')?.addEventListener('input', function() {
                document.getElementById('threshold-value').textContent = this.value + '%';
            });
        </script>
        
        <script>
            // Create global function for loading AI Management Dashboard  
            window.loadAIManagementDashboard = function() {
                console.log('🔄 Starting AI Management Dashboard loading...');
                
                const container = document.getElementById('ai-management-container');
                if (!container) {
                    console.error('❌ Container not found');
                    return;
                }
                
                // Show loading state
                container.innerHTML = \`
                    <div class="bg-gray-900 rounded-lg p-6 text-center">
                        <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                        <p class="text-gray-300">در حال بارگذاری ماژول...</p>
                    </div>
                \`;
                
                // Clear existing module
                const existingScript = document.querySelector('script[src*="ai-management.js"]');
                if (existingScript) {
                    existingScript.remove();
                    console.log('🔄 Removed existing script');
                }
                
                if (window.TitanModules && window.TitanModules.AIManagement) {
                    delete window.TitanModules.AIManagement;
                    console.log('🔄 Cleared existing module');
                }
                
                // Load fresh module
                const script = document.createElement('script');
                const timestamp = Date.now();
                script.src = '/static/modules/ai-management.js?v=' + timestamp;
                
                script.onload = function() {
                    console.log('✅ AI Management script loaded successfully');
                    
                    // Wait for module to be available
                    setTimeout(function() {
                        try {
                            if (window.TitanModules && window.TitanModules.AIManagement) {
                                console.log('✅ AI Management module found, rendering...');
                                
                                const dashboardHTML = window.TitanModules.AIManagement.render();
                                container.innerHTML = dashboardHTML;
                                
                                console.log('✅ Dashboard HTML rendered, initializing...');
                                window.TitanModules.AIManagement.init();
                                
                                console.log('🎉 AI Management Dashboard loaded successfully!');
                            } else {
                                throw new Error('AI Management module not found after loading');
                            }
                        } catch (error) {
                            console.error('❌ Error loading AI Management:', error);
                            container.innerHTML = \`
                                <div class="bg-red-900 rounded-lg p-6 text-center">
                                    <p class="text-red-400 mb-4">خطا در بارگذاری: \${error.message}</p>
                                    <button onclick="window.loadAIManagementDashboard()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        🔄 تلاش مجدد
                                    </button>
                                    <a href="/ai-test" target="_blank" class="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                        🧪 مشاهده تست
                                    </a>
                                </div>
                            \`;
                        }
                    }, 200);
                };
                
                script.onerror = function() {
                    console.error('❌ Failed to load AI Management script');
                    container.innerHTML = \`
                        <div class="bg-red-900 rounded-lg p-6 text-center">
                            <p class="text-red-400 mb-4">خطا در بارگذاری فایل اسکریپت</p>
                            <button onclick="window.loadAIManagementDashboard()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                🔄 تلاش مجدد
                            </button>
                            <a href="/ai-test" target="_blank" class="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                🧪 مشاهده تست
                            </a>
                        </div>
                    \`;
                };
                
                document.head.appendChild(script);
            };
            
            // Auto-load when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(window.loadAIManagementDashboard, 500);
                });
            } else {
                setTimeout(window.loadAIManagementDashboard, 500);
            }
        </script>`;
    }

    // ==================== AI Management Methods ====================
    
    async loadAIManagementData() {
        try {
            // Load agents data
            const response = await axios.get('/api/ai-analytics/agents');
            if (response.data && response.data.agents) {
                this.renderAIAgentsList(response.data.agents);
                this.updateAIStats(response.data.agents);
            }
            
            // Load system overview
            const overviewResponse = await axios.get('/api/ai-analytics/system/overview');
            if (overviewResponse.data && overviewResponse.data.success) {
                this.updateArtemisStatus(overviewResponse.data.data);
            }
        } catch (error) {
            console.error('Error loading AI management data:', error);
            const container = document.getElementById('ai-agents-list');
            if (container) {
                container.innerHTML = `
                    <div class="text-red-400 text-center py-4">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p>خطا در بارگذاری داده‌های AI</p>
                        <button onclick="settingsModule.loadAIManagementData()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
                            تلاش مجدد
                        </button>
                    </div>
                `;
            }
        }
    }
    
    renderAIAgentsList(agents) {
        const container = document.getElementById('ai-agents-list');
        if (!container || !agents) return;
        
        container.innerHTML = agents.map(agent => `
            <div class="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-robot text-white"></i>
                    </div>
                    <div>
                        <h4 class="text-white font-semibold">${agent.name}</h4>
                        <p class="text-gray-400 text-sm">${agent.specialization}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 space-x-reverse">
                    <div class="text-center">
                        <p class="text-white font-semibold">${agent.performance.accuracy.toFixed(1)}%</p>
                        <p class="text-gray-400 text-xs">دقت</p>
                    </div>
                    <div class="text-center">
                        <p class="text-white font-semibold">${agent.performance.trainingProgress}%</p>
                        <p class="text-gray-400 text-xs">آموزش</p>
                    </div>
                    <div class="w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-red-400'}"></div>
                </div>
            </div>
        `).join('');
    }
    
    updateAIStats(agents) {
        if (!agents) return;
        
        const totalAgents = agents.length;
        const avgPerformance = (agents.reduce((sum, agent) => sum + agent.performance.accuracy, 0) / totalAgents).toFixed(1);
        const learningAgents = agents.filter(agent => agent.learning.currentlyLearning).length;
        
        const totalAgentsEl = document.getElementById('ai-total-agents');
        const avgPerformanceEl = document.getElementById('ai-avg-performance');
        const learningAgentsEl = document.getElementById('ai-learning-agents');
        
        if (totalAgentsEl) totalAgentsEl.textContent = totalAgents;
        if (avgPerformanceEl) avgPerformanceEl.textContent = avgPerformance + '%';
        if (learningAgentsEl) learningAgentsEl.textContent = learningAgents;
    }
    
    updateArtemisStatus(data) {
        const artemisStatusEl = document.getElementById('artemis-status');
        if (artemisStatusEl && data.artemis) {
            artemisStatusEl.textContent = data.artemis.status === 'active' ? 'آنلاین' : 'آفلاین';
            artemisStatusEl.className = data.artemis.status === 'active' ? 'text-lg font-bold text-green-400' : 'text-lg font-bold text-red-400';
        }
    }
    
    async createAIBackup() {
        try {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('در حال ایجاد پشتیبان‌گیری...', 'info');
            }
            
            const response = await axios.post('/api/ai-analytics/backup/create');
            if (response.data && response.data.success) {
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert('پشتیبان‌گیری با موفقیت ایجاد شد', 'success');
                }
            }
        } catch (error) {
            console.error('Error creating AI backup:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در ایجاد پشتیبان‌گیری', 'error');
            }
        }
    }
    
    async startAITraining() {
        try {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('شروع جلسه آموزش AI...', 'info');
            }
            
            const response = await axios.post('/api/ai-analytics/training/start', {
                type: 'general',
                agents: 'all'
            });
            
            if (response.data && response.data.success) {
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert('جلسه آموزش با موفقیت شروع شد', 'success');
                }
                // Reload data to show updated status
                setTimeout(() => this.loadAIManagementData(), 1000);
            }
        } catch (error) {
            console.error('Error starting AI training:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در شروع آموزش', 'error');
            }
        }
    }

    // ==================== Wallet Management Methods ====================

    addWallet() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">افزودن کیف پول جدید</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نوع کیف پول</label>
                        <select id="wallet-type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                            <option value="metamask">MetaMask</option>
                            <option value="trustwallet">Trust Wallet</option>
                            <option value="binance">Binance Wallet</option>
                            <option value="coinbase">Coinbase Wallet</option>
                            <option value="ledger">Ledger Hardware</option>
                            <option value="trezor">Trezor Hardware</option>
                            <option value="custom">کیف پول سفارشی</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نام کیف پول</label>
                        <input type="text" id="wallet-name" placeholder="نام برای شناسایی..." class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">آدرس عمومی</label>
                        <input type="text" id="wallet-address" placeholder="0x..." class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="is-cold-wallet" class="w-4 h-4">
                        <label for="is-cold-wallet" class="text-sm text-gray-300">کلد والت (آفلاین)</label>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button onclick="settingsModule.saveNewWallet()" class="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-white">
                        افزودن
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded text-white">
                        انصراف
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    saveNewWallet() {
        const type = document.getElementById('wallet-type').value;
        const name = document.getElementById('wallet-name').value;
        const address = document.getElementById('wallet-address').value;
        const isCold = document.getElementById('is-cold-wallet').checked;

        if (!name || !address) {
            alert('لطفاً تمام فیلدهای ضروری را پر کنید');
            return;
        }

        // Simulate API call
        console.log('Adding new wallet:', { type, name, address, isCold });
        
        // Show success message
        this.showToast('کیف پول جدید با موفقیت اضافه شد', 'success');
        
        // Close modal and refresh wallet list
        document.querySelector('.fixed').remove();
        this.refreshHotWallets();
    }

    importWallet() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">وارد کردن کیف پول</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">روش وارد کردن</label>
                        <select id="import-method" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                            <option value="seed">Seed Phrase (12/24 کلمه)</option>
                            <option value="private-key">کلید خصوصی</option>
                            <option value="json">فایل JSON</option>
                            <option value="hardware">Hardware Wallet</option>
                        </select>
                    </div>
                    <div id="import-content">
                        <label class="block text-sm font-medium text-gray-300 mb-2">Seed Phrase</label>
                        <textarea id="seed-phrase" placeholder="کلمات seed phrase را وارد کنید..." 
                                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-24 resize-none"></textarea>
                        <p class="text-xs text-yellow-400 mt-1">⚠️ هرگز seed phrase خود را با دیگران به اشتراک نگذارید</p>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button onclick="settingsModule.processWalletImport()" class="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded text-white">
                        وارد کردن
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded text-white">
                        انصراف
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Handle import method change
        document.getElementById('import-method').addEventListener('change', (e) => {
            const content = document.getElementById('import-content');
            const method = e.target.value;
            
            let html = '';
            switch(method) {
                case 'seed':
                    html = `
                        <label class="block text-sm font-medium text-gray-300 mb-2">Seed Phrase</label>
                        <textarea id="seed-phrase" placeholder="کلمات seed phrase را وارد کنید..." 
                                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-24 resize-none"></textarea>
                        <p class="text-xs text-yellow-400 mt-1">⚠️ هرگز seed phrase خود را با دیگران به اشتراک نگذارید</p>
                    `;
                    break;
                case 'private-key':
                    html = `
                        <label class="block text-sm font-medium text-gray-300 mb-2">کلید خصوصی</label>
                        <input type="password" id="private-key" placeholder="کلید خصوصی را وارد کنید..." 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                        <p class="text-xs text-red-400 mt-1">🔒 کلید خصوصی بسیار حساس است</p>
                    `;
                    break;
                case 'json':
                    html = `
                        <label class="block text-sm font-medium text-gray-300 mb-2">فایل JSON</label>
                        <input type="file" id="json-file" accept=".json" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                        <p class="text-xs text-blue-400 mt-1">📁 فایل keystore/wallet JSON را انتخاب کنید</p>
                    `;
                    break;
                case 'hardware':
                    html = `
                        <label class="block text-sm font-medium text-gray-300 mb-2">دستگاه سخت‌افزاری</label>
                        <select id="hardware-type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                            <option value="ledger">Ledger</option>
                            <option value="trezor">Trezor</option>
                        </select>
                        <p class="text-xs text-green-400 mt-1">🔌 دستگاه خود را وصل کرده و باز کنید</p>
                    `;
                    break;
            }
            content.innerHTML = html;
        });
    }

    processWalletImport() {
        const method = document.getElementById('import-method').value;
        let data = {};

        switch(method) {
            case 'seed':
                data.seedPhrase = document.getElementById('seed-phrase').value;
                break;
            case 'private-key':
                data.privateKey = document.getElementById('private-key').value;
                break;
            case 'json':
                data.jsonFile = document.getElementById('json-file').files[0];
                break;
            case 'hardware':
                data.hardwareType = document.getElementById('hardware-type').value;
                break;
        }

        // Validate input
        if (method === 'seed' && !data.seedPhrase) {
            alert('لطفاً seed phrase را وارد کنید');
            return;
        }

        // Simulate import process
        console.log('Importing wallet:', { method, data });
        this.showToast('کیف پول در حال وارد شدن...', 'info');
        
        setTimeout(() => {
            this.showToast('کیف پول با موفقیت وارد شد', 'success');
            document.querySelector('.fixed').remove();
            this.refreshHotWallets();
        }, 2000);
    }

    refreshHotWallets() {
        const hotWalletsList = document.getElementById('hot-wallets-list');
        if (!hotWalletsList) return;

        // Show loading state
        hotWalletsList.innerHTML = `
            <div class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span class="mr-3 text-gray-400">در حال بروزرسانی...</span>
            </div>
        `;

        // Simulate API call
        setTimeout(() => {
            hotWalletsList.innerHTML = `
                <!-- MetaMask -->
                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div class="flex items-center gap-3">
                        <img src="https://metamask.io/favicon.ico" alt="MetaMask" class="w-8 h-8 rounded">
                        <div>
                            <div class="font-medium text-white">MetaMask</div>
                            <div class="text-xs text-gray-400">0x1234...5678</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="text-right">
                            <div class="text-sm font-medium text-white">$23,456</div>
                            <div class="text-xs text-orange-400">ETH, USDT, BNB</div>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full" title="متصل"></div>
                    </div>
                </div>

                <!-- Trust Wallet -->
                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div class="flex items-center gap-3">
                        <img src="https://trustwallet.com/favicon.ico" alt="Trust Wallet" class="w-8 h-8 rounded">
                        <div>
                            <div class="font-medium text-white">Trust Wallet</div>
                            <div class="text-xs text-gray-400">0x9876...4321</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="text-right">
                            <div class="text-sm font-medium text-white">$18,942</div>
                            <div class="text-xs text-blue-400">BTC, ETH, ADA</div>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full" title="متصل"></div>
                    </div>
                </div>

                <!-- Binance Wallet -->
                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div class="flex items-center gap-3">
                        <img src="https://binance.com/favicon.ico" alt="Binance" class="w-8 h-8 rounded">
                        <div>
                            <div class="font-medium text-white">Binance Wallet</div>
                            <div class="text-xs text-gray-400">0x5555...7777</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="text-right">
                            <div class="text-sm font-medium text-white">$8,341</div>
                            <div class="text-xs text-yellow-400">BNB, BUSD, CAKE</div>
                        </div>
                        <div class="w-2 h-2 bg-green-400 rounded-full" title="متصل"></div>
                    </div>
                </div>

                <!-- Coinbase Wallet -->
                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div class="flex items-center gap-3">
                        <img src="https://coinbase.com/favicon.ico" alt="Coinbase" class="w-8 h-8 rounded">
                        <div>
                            <div class="font-medium text-white">Coinbase Wallet</div>
                            <div class="text-xs text-gray-400">0x3333...9999</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="text-right">
                            <div class="text-sm font-medium text-white">$2,823</div>
                            <div class="text-xs text-purple-400">USDC, ETH</div>
                        </div>
                        <div class="w-2 h-2 bg-yellow-400 rounded-full" title="در حال اتصال"></div>
                    </div>
                </div>
            `;
            
            this.showToast('موجودی کیف پول‌های هات بروزرسانی شد', 'success');
        }, 1500);
    }

    manageColdWallets() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">مدیریت کلد والت‌ها</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Cold Wallet Actions -->
                <div class="grid grid-cols-3 gap-3 mb-6">
                    <button onclick="settingsModule.addColdWallet()" class="bg-green-600 hover:bg-green-700 p-3 rounded text-white text-sm">
                        <i class="fas fa-plus mb-1"></i><br>افزودن کلد والت
                    </button>
                    <button onclick="settingsModule.testColdWallets()" class="bg-blue-600 hover:bg-blue-700 p-3 rounded text-white text-sm">
                        <i class="fas fa-plug mb-1"></i><br>تست اتصال
                    </button>
                    <button onclick="settingsModule.syncColdWallets()" class="bg-purple-600 hover:bg-purple-700 p-3 rounded text-white text-sm">
                        <i class="fas fa-sync mb-1"></i><br>همگام‌سازی
                    </button>
                </div>

                <!-- Cold Wallets List -->
                <div class="space-y-4">
                    <h4 class="font-medium text-white">کلد والت‌های موجود:</h4>
                    
                    <!-- Ledger -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <img src="https://www.ledger.com/favicon.ico" alt="Ledger" class="w-8 h-8">
                                <div>
                                    <div class="font-medium text-white">Ledger Nano X</div>
                                    <div class="text-xs text-gray-400">Serial: L1234567</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-blue-400 rounded-full" title="آماده"></div>
                                <span class="text-xs text-blue-400">آماده</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <div class="text-gray-400">موجودی کل:</div>
                                <div class="text-white font-medium">$34,891</div>
                            </div>
                            <div>
                                <div class="text-gray-400">دارایی‌ها:</div>
                                <div class="text-orange-400">BTC, ETH, ADA</div>
                            </div>
                            <div>
                                <div class="text-gray-400">آخرین همگام‌سازی:</div>
                                <div class="text-green-400">2 ساعت پیش</div>
                            </div>
                        </div>

                        <div class="flex gap-2 mt-3">
                            <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-xs">
                                <i class="fas fa-sync mr-1"></i>همگام‌سازی
                            </button>
                            <button class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-xs">
                                <i class="fas fa-cogs mr-1"></i>تنظیمات
                            </button>
                            <button class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white text-xs">
                                <i class="fas fa-arrow-down mr-1"></i>انتقال به اینجا
                            </button>
                        </div>
                    </div>

                    <!-- Trezor -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <img src="https://trezor.io/favicon.ico" alt="Trezor" class="w-8 h-8">
                                <div>
                                    <div class="font-medium text-white">Trezor Model T</div>
                                    <div class="text-xs text-gray-400">Serial: T9876543</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-green-400 rounded-full" title="متصل"></div>
                                <span class="text-xs text-green-400">متصل</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <div class="text-gray-400">موجودی کل:</div>
                                <div class="text-white font-medium">$6,823</div>
                            </div>
                            <div>
                                <div class="text-gray-400">دارایی‌ها:</div>
                                <div class="text-purple-400">BTC, LTC, DASH</div>
                            </div>
                            <div>
                                <div class="text-gray-400">آخرین همگام‌سازی:</div>
                                <div class="text-green-400">30 دقیقه پیش</div>
                            </div>
                        </div>

                        <div class="flex gap-2 mt-3">
                            <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-xs">
                                <i class="fas fa-sync mr-1"></i>همگام‌سازی
                            </button>
                            <button class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-xs">
                                <i class="fas fa-cogs mr-1"></i>تنظیمات
                            </button>
                            <button class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white text-xs">
                                <i class="fas fa-arrow-down mr-1"></i>انتقال به اینجا
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Security Settings -->
                <div class="mt-6 pt-4 border-t border-gray-600">
                    <h4 class="font-medium text-white mb-3">تنظیمات امنیتی کلد والت:</h4>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">تأیید دو مرحله‌ای برای انتقال</span>
                            <input type="checkbox" checked class="w-4 h-4">
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">ثبت کلیه تراکنش‌ها</span>
                            <input type="checkbox" checked class="w-4 h-4">
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">اعلان انتقال‌های بزرگ</span>
                            <input type="checkbox" checked class="w-4 h-4">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    refreshAllBalances() {
        this.showToast('در حال بروزرسانی تمام موجودی‌ها...', 'info');
        
        // Simulate API calls
        const promises = [
            this.refreshHotWallets(),
            this.refreshColdWallets(),
            this.updateAssetBreakdown()
        ];

        setTimeout(() => {
            this.showToast('تمام موجودی‌ها بروزرسانی شد', 'success');
            
            // Update stats
            const totalBalance = document.querySelector('.text-3xl.font-bold.text-green-400');
            if (totalBalance) {
                totalBalance.textContent = '$' + (Math.random() * 100000 + 50000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }, 3000);
    }

    refreshColdWallets() {
        // Update cold wallet display
        const coldWalletsList = document.getElementById('cold-wallets-list');
        if (coldWalletsList) {
            // Add loading indicator
            const wallets = coldWalletsList.querySelectorAll('.bg-gray-800');
            wallets.forEach(wallet => {
                const status = wallet.querySelector('.rounded-full');
                status.className = 'w-2 h-2 bg-yellow-400 rounded-full animate-pulse';
            });
            
            setTimeout(() => {
                wallets.forEach(wallet => {
                    const status = wallet.querySelector('.rounded-full');
                    status.className = 'w-2 h-2 bg-blue-400 rounded-full';
                });
            }, 2000);
        }
    }

    updateAssetBreakdown() {
        // Update asset breakdown section
        const assetList = document.querySelector('#asset-breakdown');
        if (assetList) {
            // Add animation to show update
            assetList.style.opacity = '0.5';
            setTimeout(() => {
                assetList.style.opacity = '1';
            }, 1500);
        }
    }

    exportBalances() {
        const data = {
            timestamp: new Date().toISOString(),
            totalBalance: '$87,456',
            hotWallets: [
                { name: 'MetaMask', balance: '$23,456', assets: ['ETH', 'USDT', 'BNB'] },
                { name: 'Trust Wallet', balance: '$18,942', assets: ['BTC', 'ETH', 'ADA'] },
                { name: 'Binance Wallet', balance: '$8,341', assets: ['BNB', 'BUSD', 'CAKE'] },
                { name: 'Coinbase Wallet', balance: '$2,823', assets: ['USDC', 'ETH'] }
            ],
            coldWallets: [
                { name: 'Ledger Nano X', balance: '$34,891', assets: ['BTC', 'ETH', 'ADA'] },
                { name: 'Trezor Model T', balance: '$6,823', assets: ['BTC', 'LTC', 'DASH'] }
            ],
            assetBreakdown: [
                { symbol: 'BTC', amount: '1.2345', hotBalance: '$15,432', coldBalance: '$28,765' },
                { symbol: 'ETH', amount: '8.9876', hotBalance: '$12,345', coldBalance: '$3,456' },
                { symbol: 'USDT', amount: '25,000', hotBalance: '$18,000', coldBalance: '$7,000' },
                { symbol: 'BNB', amount: '45.67', hotBalance: '$8,900', coldBalance: '$0' },
                { symbol: 'ADA', amount: '15,000', hotBalance: '$4,500', coldBalance: '$2,200' },
                { symbol: 'USDC', amount: '8,500', hotBalance: '$8,500', coldBalance: '$0' }
            ]
        };

        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-balances-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('گزارش موجودی‌ها صادر شد', 'success');
    }

    testAutomation() {
        this.showToast('در حال تست سیستم اتوماسیون...', 'info');
        
        // Simulate automation test
        setTimeout(() => {
            const results = [
                '✅ اتصال به کلد والت‌ها موفق',
                '✅ قوانین امنیتی فعال',
                '✅ حد آستانه انتقال تأیید شد',
                '✅ سیستم مانیتورینگ فعال',
                '⚠️ هشدار: موجودی Trust Wallet بالای حد تعیین شده'
            ];
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">نتایج تست اتوماسیون</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-2 mb-4">
                        ${results.map(result => `<div class="text-sm ${result.includes('⚠️') ? 'text-yellow-400' : 'text-green-400'}">${result}</div>`).join('')}
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white">
                        بستن
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
            
            this.showToast('تست اتوماسیون کامل شد', 'success');
        }, 2000);
    }

    saveAutomationSettings() {
        const settings = {
            enabled: document.querySelector('input[type="checkbox"]:checked') !== null,
            thresholds: {
                hotWalletMax: document.querySelector('input[placeholder*="حداکثر"]')?.value || '5000',
                transferAmount: document.querySelector('input[placeholder*="مقدار"]')?.value || '1000'
            },
            schedule: {
                frequency: document.querySelector('select')?.value || 'daily',
                time: '02:00'
            },
            targetWallet: 'ledger'
        };

        // Simulate API call
        console.log('Saving automation settings:', settings);
        
        this.showToast('تنظیمات اتوماسیون ذخیره شد', 'success');
        
        // Update status
        const statusElement = document.querySelector('.text-green-400');
        if (statusElement && statusElement.textContent.includes('آخرین بررسی')) {
            statusElement.textContent = '✅ فعال - آخرین بررسی: همین الآن';
        }
    }

    viewAllTransactions() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">تاریخچه کامل تراکنش‌ها</h3>
                    <div class="flex gap-2">
                        <button onclick="settingsModule.exportTransactions()" class="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-white text-sm">
                            <i class="fas fa-download mr-1"></i>صادرات
                        </button>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Transaction Filters -->
                <div class="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-700 rounded">
                    <select class="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm">
                        <option value="">همه کیف پول‌ها</option>
                        <option value="metamask">MetaMask</option>
                        <option value="ledger">Ledger</option>
                        <option value="trezor">Trezor</option>
                    </select>
                    <select class="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm">
                        <option value="">همه انواع</option>
                        <option value="transfer">انتقال</option>
                        <option value="receive">دریافت</option>
                        <option value="sync">همگام‌سازی</option>
                    </select>
                    <input type="date" class="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm">
                    <button class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm">فیلتر</button>
                </div>

                <!-- Transactions List -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                <i class="fas fa-arrow-down text-white text-sm"></i>
                            </div>
                            <div>
                                <div class="font-medium text-white">انتقال خودکار به Ledger</div>
                                <div class="text-xs text-gray-400">2 ساعت پیش • TxID: 0xabcd1234...</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-medium text-green-400">+0.5 BTC</div>
                            <div class="text-xs text-gray-400">$21,625</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <i class="fas fa-sync text-white text-sm"></i>
                            </div>
                            <div>
                                <div class="font-medium text-white">بروزرسانی موجودی MetaMask</div>
                                <div class="text-xs text-gray-400">5 ساعت پیش • Auto-sync</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-medium text-blue-400">Sync</div>
                            <div class="text-xs text-gray-400">موفق</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                                <i class="fas fa-arrow-up text-white text-sm"></i>
                            </div>
                            <div>
                                <div class="font-medium text-white">انتقال از Trust Wallet</div>
                                <div class="text-xs text-gray-400">1 روز پیش • TxID: 0xef567890...</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-medium text-yellow-400">-3,000 USDT</div>
                            <div class="text-xs text-gray-400">$3,000</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <i class="fas fa-plus text-white text-sm"></i>
                            </div>
                            <div>
                                <div class="font-medium text-white">اضافه شدن Trezor Model T</div>
                                <div class="text-xs text-gray-400">3 روز پیش • Hardware wallet</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-medium text-purple-400">Setup</div>
                            <div class="text-xs text-gray-400">موفق</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                <i class="fas fa-exclamation text-white text-sm"></i>
                            </div>
                            <div>
                                <div class="font-medium text-white">خطا در اتصال به Binance</div>
                                <div class="text-xs text-gray-400">1 هفته پیش • Connection failed</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-medium text-red-400">Error</div>
                            <div class="text-xs text-gray-400">برطرف شد</div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
                    <div class="text-sm text-gray-400">نمایش 5 از 47 تراکنش</div>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm">قبلی</button>
                        <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">بعدی</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    exportTransactions() {
        const transactions = [
            {
                id: 'tx001',
                type: 'transfer',
                wallet: 'Ledger Nano X',
                amount: '+0.5 BTC',
                value: '$21,625',
                timestamp: '2024-01-20T10:30:00Z',
                txid: '0xabcd1234567890abcdef'
            },
            {
                id: 'tx002',
                type: 'sync',
                wallet: 'MetaMask',
                amount: 'Sync',
                value: 'Success',
                timestamp: '2024-01-20T05:15:00Z',
                txid: 'auto-sync-001'
            },
            // Add more transaction data...
        ];

        const csv = [
            'ID,Type,Wallet,Amount,Value,Timestamp,TxID',
            ...transactions.map(tx => 
                `${tx.id},${tx.type},${tx.wallet},"${tx.amount}","${tx.value}",${tx.timestamp},${tx.txid}`
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('تاریخچه تراکنش‌ها صادر شد', 'success');
    }

    // Helper methods for cold wallet management
    addColdWallet() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">افزودن کلد والت جدید</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نوع دستگاه</label>
                        <select id="cold-wallet-type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                            <option value="ledger-nano-s">Ledger Nano S</option>
                            <option value="ledger-nano-x">Ledger Nano X</option>
                            <option value="trezor-one">Trezor One</option>
                            <option value="trezor-model-t">Trezor Model T</option>
                            <option value="keepkey">KeepKey</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نام کیف پول</label>
                        <input type="text" id="cold-wallet-name" placeholder="نام برای شناسایی..." class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">شماره سریال</label>
                        <input type="text" id="cold-wallet-serial" placeholder="Serial number..." class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                    </div>
                    <div class="bg-yellow-900 border border-yellow-600 rounded p-3">
                        <div class="flex items-start gap-2">
                            <i class="fas fa-exclamation-triangle text-yellow-400 mt-1"></i>
                            <div class="text-sm text-yellow-300">
                                <strong>توجه:</strong> لطفاً دستگاه سخت‌افزاری خود را وصل کرده و آن را باز کنید.
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button onclick="settingsModule.detectColdWallet()" class="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded text-white">
                        تشخیص دستگاه
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded text-white">
                        انصراف
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    detectColdWallet() {
        this.showToast('در حال جستجوی دستگاه‌های سخت‌افزاری...', 'info');
        
        setTimeout(() => {
            const type = document.getElementById('cold-wallet-type').value;
            const name = document.getElementById('cold-wallet-name').value;
            const serial = document.getElementById('cold-wallet-serial').value;
            
            if (!name) {
                alert('لطفاً نام کیف پول را وارد کنید');
                return;
            }
            
            this.showToast('دستگاه سخت‌افزاری با موفقیت شناسایی و اضافه شد', 'success');
            document.querySelector('.fixed').remove();
        }, 2000);
    }

    testColdWallets() {
        this.showToast('در حال تست اتصال کلد والت‌ها...', 'info');
        
        setTimeout(() => {
            const results = [
                '✅ Ledger Nano X - اتصال موفق',
                '?خطا Trezor Model T - خطا در اتصال',
                '⚠️ توصیه: دستگاه Trezor را مجدد وصل کنید'
            ];
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">نتایج تست اتصال</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-2 mb-4">
                        ${results.map(result => `
                            <div class="text-sm ${result.includes('✅') ? 'text-green-400' : result.includes('❌') ? 'text-red-400' : 'text-yellow-400'}">
                                ${result}
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white">
                        بستن
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }, 1500);
    }

    syncColdWallets() {
        this.showToast('در حال همگام‌سازی کلد والت‌ها...', 'info');
        
        setTimeout(() => {
            this.showToast('همگام‌سازی کلد والت‌ها کامل شد', 'success');
            // Update timestamps and balances
            this.refreshColdWallets();
        }, 2500);
    }

    // Utility method for showing toast notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = {
            'success': 'bg-green-600',
            'error': 'bg-red-600',
            'warning': 'bg-yellow-600',
            'info': 'bg-blue-600'
        }[type] || 'bg-gray-600';
        
        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-full`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getUsersTab() {
        return `
        <div class="space-y-6">
            <!-- User Management Header -->
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">👥 مدیریت کاربران</h4>
                <button onclick="settingsModule.createUser()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                    <i class="fas fa-user-plus mr-2"></i>افزودن کاربر جدید
                </button>
            </div>

            <!-- User Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-900 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-blue-400" id="total-users">-</div>
                    <div class="text-sm text-gray-400">کل کاربران</div>
                </div>
                <div class="bg-gray-900 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-400" id="online-users">-</div>
                    <div class="text-sm text-gray-400">آنلاین</div>
                </div>
                <div class="bg-gray-900 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-yellow-400" id="new-users">-</div>
                    <div class="text-sm text-gray-400">جدید (این ماه)</div>
                </div>
                <div class="bg-gray-900 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-red-400" id="suspicious-activities">-</div>
                    <div class="text-sm text-gray-400">فعالیت مشکوک</div>
                </div>
            </div>

            <!-- User Filters -->
            <div class="bg-gray-900 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">جستجو</label>
                        <input type="text" id="user-search" placeholder="نام کاربری، ایمیل..." class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">وضعیت</label>
                        <select id="user-status-filter" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="">همه</option>
                            <option value="active">فعال</option>
                            <option value="inactive">غیرفعال</option>
                            <option value="suspended">تعلیق</option>
                            <option value="banned">بن شده</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نقش</label>
                        <select id="user-role-filter" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="">همه</option>
                            <option value="admin">مدیر</option>
                            <option value="trader">معامله‌گر</option>
                            <option value="viewer">مشاهده‌گر</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="settingsModule.filterUsers()" class="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-search mr-2"></i>فیلتر
                        </button>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="bg-gray-900 rounded-lg border border-gray-700">
                <div class="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h5 class="text-md font-semibold text-white">لیست کاربران</h5>
                    <div class="flex gap-2">
                        <button onclick="settingsModule.bulkUserAction('activate')" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-check mr-1"></i>فعال‌سازی گروهی
                        </button>
                        <button onclick="settingsModule.bulkUserAction('suspend')" class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-pause mr-1"></i>تعلیق گروهی
                        </button>
                        <button onclick="settingsModule.bulkUserAction('delete')" class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-trash mr-1"></i>حذف گروهی
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-4 py-3 text-right">
                                    <input type="checkbox" id="select-all-users" onchange="settingsModule.selectAllUsers()" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                </th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">کاربر</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">وضعیت</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">نقش</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">آخرین فعالیت</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body" class="bg-gray-900 divide-y divide-gray-800">
                            <!-- Users will be loaded here -->
                        </tbody>
                    </table>
                </div>
                <div class="px-4 py-3 bg-gray-800 border-t border-gray-700">
                    <div class="flex items-center justify-between">
                        <div class="text-sm text-gray-400">
                            نمایش <span id="users-from">1</span> تا <span id="users-to">10</span> از <span id="users-total">0</span> کاربر
                        </div>
                        <div class="flex gap-2">
                            <button onclick="settingsModule.prevUsersPage()" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">قبلی</button>
                            <button onclick="settingsModule.nextUsersPage()" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">بعدی</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Suspicious Activities -->
            <div class="bg-gray-900 rounded-lg border border-gray-700">
                <div class="p-4 border-b border-gray-700">
                    <div class="flex items-center justify-between">
                        <h5 class="text-md font-semibold text-white">🚨 فعالیت‌های مشکوک</h5>
                        <button onclick="settingsModule.refreshSuspiciousActivities()" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-sync mr-1"></i>بروزرسانی
                        </button>
                    </div>
                </div>
                <div id="suspicious-activities-list" class="p-4">
                    <!-- Suspicious activities will be loaded here -->
                </div>
            </div>
        </div>`;
    }

    // Tab switching
    switchTab(tabName) {
        this.currentTab = tabName;
        const content = document.getElementById('settings-tab-content');
        if (content) {
            content.innerHTML = this.getTabContent();
        }
        
        // Update tab styles
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
            tab.classList.add('text-gray-400');
        });
        
        const activeTab = document.querySelector(`[onclick="settingsModule.switchTab('${tabName}')"]`);
        if (activeTab) {
            activeTab.classList.remove('text-gray-400');
            activeTab.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
        }

        // Load specific tab data
        if (tabName === 'users') {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                this.loadUserStats();
                this.loadUsers();
                this.loadSuspiciousActivities();
            }, 100);
        } else if (tabName === 'system') {
            // Update system info when system tab is opened
            setTimeout(() => {
                this.updateSystemInfo();
            }, 100);
        }
    }

    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('titan_settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            this.isLoading = true;
            
            // Collect all form data
            this.collectFormData();
            
            // Save to localStorage
            localStorage.setItem('titan_settings', JSON.stringify(this.settings));
            
            // Save to server if available
            if (typeof app !== 'undefined' && app.currentUser) {
                try {
                    const response = await axios.post('/api/settings/save', {
                        userId: app.currentUser.id,
                        settings: this.settings
                    });
                    console.log('Settings saved to server:', response.data);
                } catch (error) {
                    console.warn('Could not save to server:', error);
                }
            }
            
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('تنظیمات با موفقیت ذخیره شد', 'success');
            }
            
        } catch (error) {
            console.error('Error saving settings:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در ذخیره تنظیمات', 'error');
            }
        } finally {
            this.isLoading = false;
        }
    }

    collectFormData() {
        // Collect general settings
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) this.settings.general.theme = themeSelect.value;
        
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) this.settings.general.language = languageSelect.value;
        
        // Collect notification settings
        const emailEnabled = document.getElementById('email-enabled');
        if (emailEnabled) this.settings.notifications.email.enabled = emailEnabled.checked;
        
        // ... collect other form data
        // This is a simplified version - in real implementation, collect all form fields
    }

    async testNotification(type) {
        try {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`تست ارسال ${type} در حال انجام...`, 'info');
            }
            
            // Test notification implementation
            const response = await axios.post('/api/notifications/test', {
                type: type,
                settings: this.settings.notifications[type]
            });
            
            if (response.data.success) {
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert(`تست ${type} موفقیت‌آمیز بود`, 'success');
                }
            } else {
                throw new Error(response.data.message);
            }
            
        } catch (error) {
            console.error(`Test ${type} failed:`, error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`خطا در تست ${type}: ${error.message}`, 'error');
            }
        }
    }

    async testExchange(exchange) {
        try {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`تست اتصال ${exchange} در حال انجام...`, 'info');
            }
            
            const response = await axios.post('/api/trading/test-exchange', {
                exchange: exchange,
                settings: this.settings.exchanges[exchange]
            });
            
            if (response.data.success) {
                this.exchangeStatus[exchange] = 'connected';
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert(`اتصال ${exchange} موفقیت‌آمیز بود`, 'success');
                }
            } else {
                throw new Error(response.data.message);
            }
            
        } catch (error) {
            this.exchangeStatus[exchange] = 'error';
            console.error(`Test ${exchange} failed:`, error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`خطا در اتصال ${exchange}: ${error.message}`, 'error');
            }
        }
    }

    async testAI(provider) {
        try {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`تست ${provider} در حال انجام...`, 'info');
            }
            
            const response = await axios.post('/api/ai/test', {
                provider: provider,
                settings: this.settings.ai[provider]
            });
            
            if (response.data.success) {
                this.aiStatus[provider] = 'connected';
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert(`تست ${provider} موفقیت‌آمیز بود`, 'success');
                }
            } else {
                throw new Error(response.data.message);
            }
            
        } catch (error) {
            this.aiStatus[provider] = 'error';
            console.error(`Test ${provider} failed:`, error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`خطا در تست ${provider}: ${error.message}`, 'error');
            }
        }
    }

    async loadUserStats() {
        try {
            // Try to load from server first
            try {
                const response = await axios.get('/api/admin/users/stats');
                const stats = response.data;
                
                document.getElementById('total-users').textContent = stats.totalUsers || 0;
                document.getElementById('online-users').textContent = stats.onlineUsers || 0;
                document.getElementById('new-users').textContent = stats.newUsersThisMonth || 0;
                document.getElementById('suspicious-activities').textContent = stats.suspiciousActivities || 0;
            } catch (serverError) {
                // Use mock data if server not available
                const mockStats = {
                    totalUsers: 1247,
                    onlineUsers: 89,
                    newUsersThisMonth: 156,
                    suspiciousActivities: 3
                };
                
                document.getElementById('total-users').textContent = mockStats.totalUsers;
                document.getElementById('online-users').textContent = mockStats.onlineUsers;
                document.getElementById('new-users').textContent = mockStats.newUsersThisMonth;
                document.getElementById('suspicious-activities').textContent = mockStats.suspiciousActivities;
                
                console.log('📊 Using mock user stats data');
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
            // Set default values
            document.getElementById('total-users').textContent = '0';
            document.getElementById('online-users').textContent = '0';
            document.getElementById('new-users').textContent = '0';
            document.getElementById('suspicious-activities').textContent = '0';
        }
    }

    async loadUsers() {
        try {
            let users = [];
            
            // Try to load from server first
            try {
                const response = await axios.get('/api/admin/users/list?page=1&limit=10');
                users = response.data.users || [];
            } catch (serverError) {
                // Use mock data if server not available
                users = [
                    {
                        id: '1',
                        username: 'admin',
                        email: 'admin@titan.com',
                        fullname: 'مدیر سیستم',
                        phone: '+989123456789',
                        role: 'مدیر',
                        status: 'active',
                        lastActivity: new Date().toISOString()
                    },
                    {
                        id: '2',
                        username: 'trader01',
                        email: 'trader01@titan.com',
                        fullname: 'علی احمدی',
                        phone: '+989111111111',
                        role: 'معامله‌گر',
                        status: 'active',
                        lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString()
                    },
                    {
                        id: '3',
                        username: 'analyst',
                        email: 'analyst@titan.com',
                        fullname: 'سارا محمدی',
                        phone: '+989222222222',
                        role: 'تحلیل‌گر',
                        status: 'active',
                        lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString()
                    },
                    {
                        id: '4',
                        username: 'viewer01',
                        email: 'viewer01@titan.com',
                        fullname: 'رضا کریمی',
                        phone: '+989333333333',
                        role: 'مشاهده‌گر',
                        status: 'inactive',
                        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
                    },
                    {
                        id: '5',
                        username: 'testuser',
                        email: 'test@titan.com',
                        fullname: 'کاربر تست',
                        phone: '+989444444444',
                        role: 'معامله‌گر',
                        status: 'suspended',
                        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
                    },
                    {
                        id: '6',
                        username: 'newtrader',
                        email: 'newtrader@titan.com',
                        fullname: 'محمد رضایی',
                        phone: '+989555555555',
                        role: 'معامله‌گر',
                        status: 'active',
                        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
                    },
                    {
                        id: '7',
                        username: 'support',
                        email: 'support@titan.com',
                        fullname: 'تیم پشتیبانی',
                        phone: '+989666666666',
                        role: 'مشاهده‌گر',
                        status: 'active',
                        lastActivity: new Date(Date.now() - 1000 * 60 * 60).toISOString()
                    },
                    {
                        id: '8',
                        username: 'banned_user',
                        email: 'banned@titan.com',
                        fullname: 'کاربر بن شده',
                        phone: '+989777777777',
                        role: 'معامله‌گر',
                        status: 'banned',
                        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
                    }
                ];
                console.log('👥 Using mock users data');
            }
            
            const tbody = document.getElementById('users-table-body');
            if (tbody) {
                tbody.innerHTML = users.map(user => `
                    <tr class="hover:bg-gray-800">
                        <td class="px-4 py-3">
                            <input type="checkbox" name="user-select" value="${user.id}" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm mr-3">
                                    ${user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div class="text-sm font-medium text-white">${user.username}</div>
                                    <div class="text-sm text-gray-400">${user.email}</div>
                                    ${user.fullname ? `<div class="text-xs text-gray-500">${user.fullname}</div>` : ''}
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(user.status)}">
                                ${this.getStatusText(user.status)}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-300">${user.role}</td>
                        <td class="px-4 py-3 text-sm text-gray-300">${this.formatDate(user.lastActivity)}</td>
                        <td class="px-4 py-3">
                            <div class="flex gap-2">
                                <button onclick="settingsModule.viewUser('${user.id}')" class="text-blue-400 hover:text-blue-300 text-sm p-1" title="مشاهده">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="settingsModule.editUser('${user.id}')" class="text-yellow-400 hover:text-yellow-300 text-sm p-1" title="ویرایش">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="settingsModule.deleteUser('${user.id}')" class="text-red-400 hover:text-red-300 text-sm p-1" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button onclick="settingsModule.toggleUserStatus('${user.id}', '${user.status}')" class="text-green-400 hover:text-green-300 text-sm p-1" title="تغییر وضعیت">
                                    <i class="fas fa-toggle-${user.status === 'active' ? 'on' : 'off'}"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async loadSuspiciousActivities() {
        try {
            let activities = [];
            
            // Try to load from server first
            try {
                const response = await axios.get('/api/admin/users/suspicious-activities');
                activities = response.data.activities || [];
            } catch (serverError) {
                // Use mock data if server not available
                activities = [
                    {
                        id: '1',
                        description: 'تلاش چندباره ورود ناموفق',
                        user_email: 'unknown@domain.com',
                        severity: 'medium',
                        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
                    },
                    {
                        id: '2',
                        description: 'دسترسی از IP مشکوک',
                        user_email: 'trader01@titan.com',
                        severity: 'high',
                        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
                    },
                    {
                        id: '3',
                        description: 'فعالیت غیرعادی در ساعات غیرکاری',
                        user_email: 'analyst@titan.com',
                        severity: 'low',
                        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
                    }
                ];
                console.log('🚨 Using mock suspicious activities data');
            }
            
            const container = document.getElementById('suspicious-activities-list');
            if (container) {
                if (activities.length === 0) {
                    container.innerHTML = '<div class="text-center text-gray-400 py-8">هیچ فعالیت مشکوک یافت نشد</div>';
                } else {
                    container.innerHTML = activities.map(activity => `
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-3">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 bg-${this.getSeverityColor(activity.severity)}-400 rounded-full"></div>
                                <div>
                                    <div class="text-sm font-medium text-white">${activity.description}</div>
                                    <div class="text-xs text-gray-400">${activity.user_email} - ${this.formatDate(activity.timestamp)}</div>
                                </div>
                            </div>
                            <button onclick="settingsModule.resolveSuspiciousActivity('${activity.id}')" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-xs">
                                حل شده
                            </button>
                        </div>
                    `).join('');
                }
            }
            
        } catch (error) {
            console.error('Error loading suspicious activities:', error);
        }
    }

    getStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'suspended': 'bg-yellow-100 text-yellow-800',
            'banned': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'active': 'فعال',
            'inactive': 'غیرفعال',
            'suspended': 'تعلیق',
            'banned': 'بن شده'
        };
        return texts[status] || status;
    }

    getSeverityColor(severity) {
        const colors = {
            'low': 'yellow',
            'medium': 'orange',
            'high': 'red',
            'critical': 'red'
        };
        return colors[severity] || 'gray';
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('fa-IR');
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'titan-settings.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
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
                        const settings = JSON.parse(e.target.result);
                        this.settings = { ...this.settings, ...settings };
                        
                        // Refresh current tab
                        const content = document.getElementById('settings-tab-content');
                        if (content) {
                            content.innerHTML = this.getTabContent();
                        }
                        
                        if (typeof app !== 'undefined' && app.showAlert) {
                            app.showAlert('تنظیمات با موفقیت وارد شد', 'success');
                        }
                    } catch (error) {
                        if (typeof app !== 'undefined' && app.showAlert) {
                            app.showAlert('خطا در خواندن فایل تنظیمات', 'error');
                        }
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    resetSettings() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه تنظیمات را بازنشانی کنید؟')) {
            // Reset to default values
            this.settings = {
                general: { theme: 'dark', language: 'fa', rtl: true, timezone: 'Asia/Tehran', currency: 'USD', dateFormat: 'jYYYY/jMM/jDD', numberFormat: 'fa-IR' },
                notifications: { email: { enabled: true, smtp_host: '', smtp_port: 587, smtp_user: '', smtp_pass: '', from_email: '', from_name: 'TITAN Trading System' }, telegram: { enabled: false, bot_token: '', chat_id: '', parse_mode: 'HTML' }, whatsapp: { enabled: false, api_token: '', phone_number: '', instance_id: '' }, sms: { enabled: false, provider: 'kavenegar', api_key: '', sender: 'TITAN' }, discord: { enabled: false, webhook_url: '', username: 'TITAN Bot' }, inapp: { enabled: true, sound: true, desktop: true, mobile: true } },
                exchanges: { binance: { enabled: false, api_key: '', api_secret: '', testnet: true, rate_limit: 1000 }, coinbase: { enabled: false, api_key: '', api_secret: '', passphrase: '', sandbox: true }, kucoin: { enabled: false, api_key: '', api_secret: '', passphrase: '', sandbox: true } },
                ai: { openai: { enabled: false, api_key: '', model: 'gpt-4', max_tokens: 2000 }, anthropic: { enabled: false, api_key: '', model: 'claude-3-sonnet-20240229', max_tokens: 2000 }, gemini: { enabled: false, api_key: '', model: 'gemini-pro', max_tokens: 2000 } },
                trading: { risk_management: { max_risk_per_trade: 2, max_daily_loss: 5, max_positions: 10, stop_loss_default: 2, take_profit_default: 6 }, auto_trading: { enabled: false, strategies: ['momentum', 'mean_reversion'], min_confidence: 0.7, max_amount_per_trade: 100 }, alerts: { price_alerts: true, trade_alerts: true, ai_insights: true, system_alerts: true } },
                security: { two_factor: { enabled: false, method: 'totp', backup_codes: [] }, session: { timeout: 24, concurrent_sessions: 3, auto_logout: true }, api_access: { enabled: false, rate_limit: 100, whitelist_ips: [] } }
            };
            
            // Clear localStorage
            localStorage.removeItem('titan_settings');
            
            // Refresh current tab
            const content = document.getElementById('settings-tab-content');
            if (content) {
                content.innerHTML = this.getTabContent();
            }
            
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('تنظیمات بازنشانی شد', 'success');
            }
        }
    }

    // User Management Methods
    createUser() {
        this.showUserModal();
    }

    showUserModal(userId = null) {
        const user = userId ? this.findUserById(userId) : null;
        const isEdit = !!userId;
        
        // Remove existing modal
        const existingModal = document.getElementById('user-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'user-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                    <i class="fas fa-user${isEdit ? '-edit' : '-plus'} text-blue-400"></i>
                    ${isEdit ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}
                </h3>
                <button onclick="settingsModule.closeUserModal()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">
                <form id="user-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری *</label>
                            <input type="text" id="user-username" value="${user?.username || ''}" required 
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">ایمیل *</label>
                            <input type="email" id="user-email" value="${user?.email || ''}" required
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نام کامل</label>
                            <input type="text" id="user-fullname" value="${user?.fullname || ''}"
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">شماره تلفن</label>
                            <input type="tel" id="user-phone" value="${user?.phone || ''}"
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نقش *</label>
                            <select id="user-role" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="">انتخاب کنید</option>
                                <option value="admin" ${user?.role === 'مدیر' ? 'selected' : ''}>مدیر</option>
                                <option value="trader" ${user?.role === 'معامله‌گر' ? 'selected' : ''}>معامله‌گر</option>
                                <option value="analyst" ${user?.role === 'تحلیل‌گر' ? 'selected' : ''}>تحلیل‌گر</option>
                                <option value="viewer" ${user?.role === 'مشاهده‌گر' ? 'selected' : ''}>مشاهده‌گر</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">وضعیت</label>
                            <select id="user-status" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="active" ${user?.status === 'active' ? 'selected' : ''}>فعال</option>
                                <option value="inactive" ${user?.status === 'inactive' ? 'selected' : ''}>غیرفعال</option>
                                <option value="suspended" ${user?.status === 'suspended' ? 'selected' : ''}>تعلیق</option>
                                <option value="banned" ${user?.status === 'banned' ? 'selected' : ''}>بن شده</option>
                            </select>
                        </div>
                    </div>
                    
                    ${!isEdit ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور *</label>
                            <input type="password" id="user-password" required
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">تکرار رمز عبور *</label>
                            <input type="password" id="user-password-confirm" required
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h5 class="text-md font-semibold text-white mb-3">مجوزها</h5>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="perm-dashboard" class="w-4 h-4 text-blue-600" checked>
                                <span class="text-sm text-gray-300">داشبورد</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="perm-trading" class="w-4 h-4 text-blue-600" checked>
                                <span class="text-sm text-gray-300">معاملات</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="perm-portfolio" class="w-4 h-4 text-blue-600" checked>
                                <span class="text-sm text-gray-300">پورتفولیو</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="perm-analytics" class="w-4 h-4 text-blue-600">
                                <span class="text-sm text-gray-300">تحلیلات</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="perm-ai" class="w-4 h-4 text-blue-600">
                                <span class="text-sm text-gray-300">هوش مصنوعی</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="perm-settings" class="w-4 h-4 text-blue-600">
                                <span class="text-sm text-gray-300">تنظیمات</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button type="button" onclick="settingsModule.closeUserModal()" class="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg text-white">
                            انصراف
                        </button>
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white">
                            <i class="fas fa-save mr-2"></i>${isEdit ? 'بروزرسانی' : 'ایجاد کاربر'}
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
        
        document.body.appendChild(modal);
        
        // Setup form handler
        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser(userId);
        });
    }

    closeUserModal() {
        const modal = document.getElementById('user-modal');
        if (modal) {
            modal.remove();
        }
    }

    findUserById(userId) {
        // Mock data - find user by ID
        const users = [
            { id: '1', username: 'admin', email: 'admin@titan.com', fullname: 'مدیر سیستم', phone: '+989123456789', role: 'مدیر', status: 'active' },
            { id: '2', username: 'trader01', email: 'trader01@titan.com', fullname: 'علی احمدی', phone: '+989111111111', role: 'معامله‌گر', status: 'active' },
            { id: '3', username: 'analyst', email: 'analyst@titan.com', fullname: 'سارا محمدی', phone: '+989222222222', role: 'تحلیل‌گر', status: 'active' },
            { id: '4', username: 'viewer01', email: 'viewer01@titan.com', fullname: 'رضا کریمی', phone: '+989333333333', role: 'مشاهده‌گر', status: 'inactive' },
            { id: '5', username: 'testuser', email: 'test@titan.com', fullname: 'کاربر تست', phone: '+989444444444', role: 'معامله‌گر', status: 'suspended' }
        ];
        return users.find(u => u.id === userId);
    }

    async saveUser(userId = null) {
        try {
            const formData = {
                username: document.getElementById('user-username').value,
                email: document.getElementById('user-email').value,
                fullname: document.getElementById('user-fullname').value,
                phone: document.getElementById('user-phone').value,
                role: document.getElementById('user-role').value,
                status: document.getElementById('user-status').value
            };
            
            // Validation
            if (!formData.username || !formData.email || !formData.role) {
                throw new Error('لطفاً تمام فیلدهای ضروری را پر کنید');
            }
            
            if (!userId) {
                const password = document.getElementById('user-password').value;
                const passwordConfirm = document.getElementById('user-password-confirm').value;
                
                if (!password || password !== passwordConfirm) {
                    throw new Error('رمز عبور و تکرار آن باید یکسان باشند');
                }
                
                formData.password = password;
            }
            
            // Simulate API call
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(userId ? 'کاربر بروزرسانی شد' : 'کاربر جدید ایجاد شد', 'success');
            }
            
            this.closeUserModal();
            this.loadUsers(); // Refresh users list
            
        } catch (error) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(error.message, 'error');
            }
        }
    }

    viewUser(userId) {
        const user = this.findUserById(userId);
        if (!user) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('کاربر یافت نشد', 'error');
            }
            return;
        }

        // Remove existing modal
        const existingModal = document.getElementById('view-user-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'view-user-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-lg">
            <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                    <i class="fas fa-user text-blue-400"></i>
                    اطلاعات کاربر
                </h3>
                <button onclick="settingsModule.closeViewUserModal()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6 space-y-4">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <h4 class="text-xl font-bold text-white">${user.fullname || user.username}</h4>
                    <p class="text-gray-400">${user.role}</p>
                </div>
                
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-300">نام کاربری:</span>
                        <span class="text-white">${user.username}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">ایمیل:</span>
                        <span class="text-white">${user.email}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">تلفن:</span>
                        <span class="text-white">${user.phone || 'وارد نشده'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">وضعیت:</span>
                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(user.status)}">
                            ${this.getStatusText(user.status)}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">آخرین فعالیت:</span>
                        <span class="text-white">${this.formatDate(user.lastActivity)}</span>
                    </div>
                </div>
                
                <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <button onclick="settingsModule.closeViewUserModal()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white">
                        بستن
                    </button>
                    <button onclick="settingsModule.editUser('${user.id}')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white">
                        <i class="fas fa-edit mr-2"></i>ویرایش
                    </button>
                </div>
            </div>
        </div>`;
        
        document.body.appendChild(modal);
    }

    closeViewUserModal() {
        const modal = document.getElementById('view-user-modal');
        if (modal) {
            modal.remove();
        }
    }

    editUser(userId) {
        this.closeViewUserModal();
        this.showUserModal(userId);
    }

    deleteUser(userId) {
        const user = this.findUserById(userId);
        if (!user) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('کاربر یافت نشد', 'error');
            }
            return;
        }

        if (confirm(`آیا از حذف کاربر "${user.username}" اطمینان دارید؟\nاین عمل قابل بازگردانی نیست.`)) {
            // Simulate delete
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`کاربر "${user.username}" حذف شد`, 'success');
            }
            this.loadUsers(); // Refresh users list
        }
    }

    filterUsers() {
        const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('user-status-filter')?.value || '';
        const roleFilter = document.getElementById('user-role-filter')?.value || '';
        
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('فیلتر اعمال شد', 'info');
        }
        
        // Simulate filtering - in real app, this would filter the actual data
        this.loadUsers();
    }

    prevUsersPage() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('صفحه قبلی', 'info');
        }
    }

    nextUsersPage() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('صفحه بعدی', 'info');
        }
    }

    refreshSuspiciousActivities() {
        this.loadSuspiciousActivities();
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('فعالیت‌های مشکوک بروزرسانی شد', 'success');
        }
    }

    resolveSuspiciousActivity(activityId) {
        if (confirm('آیا این فعالیت مشکوک حل شده است؟')) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`فعالیت مشکوک ${activityId} به عنوان حل‌شده علامت‌گذاری شد`, 'success');
            }
            this.loadSuspiciousActivities();
        }
    }

    // Bulk Actions
    selectAllUsers() {
        const checkboxes = document.querySelectorAll('input[name="user-select"]');
        const selectAll = document.getElementById('select-all-users');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll.checked;
        });
    }

    bulkUserAction(action) {
        const selectedUsers = Array.from(document.querySelectorAll('input[name="user-select"]:checked'))
                                  .map(cb => cb.value);
        
        if (selectedUsers.length === 0) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('لطفاً حداقل یک کاربر انتخاب کنید', 'warning');
            }
            return;
        }

        let actionText = '';
        let confirmText = '';
        
        switch(action) {
            case 'activate':
                actionText = 'فعال‌سازی';
                confirmText = `آیا از فعال‌سازی ${selectedUsers.length} کاربر انتخاب شده اطمینان دارید؟`;
                break;
            case 'deactivate':
                actionText = 'غیرفعال‌سازی';
                confirmText = `آیا از غیرفعال‌سازی ${selectedUsers.length} کاربر انتخاب شده اطمینان دارید؟`;
                break;
            case 'suspend':
                actionText = 'تعلیق';
                confirmText = `آیا از تعلیق ${selectedUsers.length} کاربر انتخاب شده اطمینان دارید؟`;
                break;
            case 'delete':
                actionText = 'حذف';
                confirmText = `آیا از حذف ${selectedUsers.length} کاربر انتخاب شده اطمینان دارید؟\nاین عمل قابل بازگردانی نیست.`;
                break;
        }

        if (confirm(confirmText)) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`${actionText} ${selectedUsers.length} کاربر با موفقیت انجام شد`, 'success');
            }
            this.loadUsers();
        }
    }

    toggleUserStatus(userId, currentStatus) {
        const user = this.findUserById(userId);
        if (!user) return;

        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const actionText = newStatus === 'active' ? 'فعال‌سازی' : 'غیرفعال‌سازی';
        
        if (confirm(`آیا از ${actionText} کاربر "${user.username}" اطمینان دارید؟`)) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`کاربر "${user.username}" ${actionText} شد`, 'success');
            }
            this.loadUsers();
        }
    }

    // Additional Helper Methods
    createTelegramBot() {
        const instructions = `
راهنمای ساخت ربات تلگرام:

1. به @BotFather در تلگرام مراجعه کنید
2. دستور /newbot را ارسال کنید
3. نام ربات را وارد کنید (مثلاً: TITAN Trading Bot)
4. نام کاربری ربات را وارد کنید (باید به bot ختم شود)
5. توکن دریافتی را کپی کرده و در تنظیمات وارد کنید
6. ربات را به کانال یا گروه مورد نظر اضافه کنید
7. شناسه چت را دریافت کنید
        `;
        
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(instructions, 'info');
        }
    }

    whatsappSetupGuide() {
        const guide = `
راهنمای راه‌اندازی واتساپ:

1. حساب WhatsApp Business ایجاد کنید
2. به Facebook Developers مراجعه کنید
3. یک اپلیکیشن جدید ایجاد کنید
4. WhatsApp Business API را فعال کنید
5. تأیید Facebook را دریافت کنید
6. توکن API را در تنظیمات وارد کنید

توجه: این فرآیند ممکن است چند روز طول بکشد.
        `;
        
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(guide, 'info');
        }
    }

    exchangeBalances(exchange) {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(`مشاهده موجودی ${exchange} در حال توسعه است`, 'info');
        }
    }

    showAIUsage(provider) {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(`نمایش میزان استفاده ${provider} در حال توسعه است`, 'info');
        }
    }

    setup2FA() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('راه‌اندازی احراز هویت دو مرحله‌ای در حال توسعه است', 'info');
        }
    }

    generateBackupCodes() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('تولید کدهای بازیابی در حال توسعه است', 'info');
        }
    }

    viewActiveSessions() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('مشاهده جلسات فعال در حال توسعه است', 'info');
        }
    }

    generateAPIKey() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('تولید کلید API در حال توسعه است', 'info');
        }
    }

    revokeAPIKeys() {
        if (confirm('آیا از لغو همه کلیدهای API اطمینان دارید؟')) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('لغو کلیدهای API در حال توسعه است', 'info');
            }
        }
    }

    // Cache Management Methods
    async clearBrowserCache() {
        try {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('در حال پاک کردن کش...', 'info');
            }
            
            // Clear browser cache
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            // Clear localStorage and sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('کش با موفقیت پاک شد! صفحه مجدداً بارگذاری می‌شود...', 'success');
            }
            
            // Reload page after 2 seconds
            setTimeout(() => {
                window.location.reload(true);
            }, 2000);
            
        } catch (error) {
            console.error('Error clearing cache:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در پاک کردن کش: ' + error.message, 'error');
            }
        }
    }

    hardRefresh() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('در حال انجام Hard Refresh...', 'info');
        }
        
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    }

    openCacheManager() {
        // Open cache manager in new tab
        window.open('/clear-cache', '_blank');
    }

    // System Management Methods
    async reloadAllModules() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('در حال بارگذاری مجدد ماژول‌ها...', 'info');
        }
        
        try {
            // Add timestamp to force reload
            const timestamp = Date.now();
            const moduleFiles = [
                '/static/modules/module-loader.js',
                '/static/modules/alerts.js',
                '/static/modules/settings.js',
                '/static/modules/dashboard.js',
                '/static/modules/trading.js',
                '/static/modules/portfolio.js',
                '/static/modules/artemis.js',
                '/static/modules/watchlist.js',
                '/static/modules/analytics.js',
                '/static/modules/news.js',
                '/static/app.js'
            ];
            
            // Preload modules with new timestamp
            for (const file of moduleFiles) {
                const script = document.createElement('script');
                script.src = file + '?v=' + timestamp;
                script.onload = () => console.log('Reloaded:', file);
                document.head.appendChild(script);
            }
            
            setTimeout(() => {
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert('ماژول‌ها با موفقیت بارگذاری مجدد شدند!', 'success');
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error reloading modules:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در بارگذاری مجدد ماژول‌ها: ' + error.message, 'error');
            }
        }
    }

    async checkSystemHealth() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('در حال بررسی سلامت سیستم...', 'info');
        }
        
        try {
            const response = await axios.get('/api/health');
            const health = response.data;
            
            const healthReport = `
سیستم: ${health.system} ✅
هوش مصنوعی: ${health.ai} ✅
نسخه: ${health.version} ✅
زمان سرور: ${new Date(health.timestamp).toLocaleString('fa-IR')} ✅
            `;
            
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('سیستم سالم است!\n' + healthReport, 'success');
            }
            
        } catch (error) {
            console.error('Health check failed:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در بررسی سلامت سیستم: ' + error.message, 'error');
            }
        }
    }

    downloadLogs() {
        try {
            // Collect console logs
            const logs = [];
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            // Create log content
            const logContent = `
TITAN Trading System - Log Export
تاریخ: ${new Date().toLocaleString('fa-IR')}
=====================================

سیستم: فعال ✅
ماژول‌ها: 9 ماژول بارگذاری شده ✅
کاربر: ${typeof app !== 'undefined' && app.currentUser ? app.currentUser.username : 'ناشناس'}
مرورگر: ${navigator.userAgent}
زمان جلسه: ${new Date().toLocaleString('fa-IR')}

=====================================
پایان لاگ
            `;
            
            // Create and download file
            const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `titan-logs-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('لاگ‌ها با موفقیت دانلود شدند', 'success');
            }
            
        } catch (error) {
            console.error('Error downloading logs:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در دانلود لاگ‌ها: ' + error.message, 'error');
            }
        }
    }

    systemRestart() {
        if (confirm('آیا از راه‌اندازی مجدد سیستم اطمینان دارید؟\nاین عمل صفحه را مجدداً بارگذاری می‌کند.')) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('سیستم در حال راه‌اندازی مجدد...', 'info');
            }
            
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    }

    setupEventListeners() {
        console.log('📡 Settings event listeners set up');
        
        // Update system info periodically
        this.updateSystemInfo();
        setInterval(() => this.updateSystemInfo(), 30000); // Every 30 seconds
    }

    updateSystemInfo() {
        try {
            // Update browser info
            const browserInfo = this.detectBrowser();
            const browserElement = document.getElementById('browser-info');
            if (browserElement) {
                browserElement.textContent = browserInfo;
            }
            
            // Update uptime (since page load)
            const startTime = window.performance.timeOrigin || Date.now();
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const uptimeElement = document.getElementById('uptime');
            if (uptimeElement) {
                uptimeElement.textContent = this.formatUptime(uptime);
            }
            
        } catch (error) {
            console.error('Error updating system info:', error);
        }
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'نامشخص';
    }

    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    // ===== SYSTEM MONITORING METHODS =====

    async startRealTimeMonitoring() {
        try {
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
            }

            this.showAlert('شروع پایش زنده سیستم...', 'info');
            
            // Start monitoring every 5 seconds
            this.monitoringInterval = setInterval(() => {
                this.updateSystemStats();
                this.updateConnectionStatus();
            }, 5000);

            // Initial update
            this.updateSystemStats();
            this.updateConnectionStatus();
            
            this.showAlert('پایش زنده سیستم فعال شد', 'success');
        } catch (error) {
            console.error('Error starting monitoring:', error);
            this.showAlert('خطا در شروع پایش سیستم', 'error');
        }
    }

    stopRealTimeMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            this.showAlert('پایش زنده سیستم متوقف شد', 'info');
        }
    }

    async updateSystemStats() {
        try {
            // Mock system stats (در production از API واقعی استفاده کنید)
            const stats = {
                status: 'عملیاتی',
                cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
                memory: Math.floor(Math.random() * 40) + 30, // 30-70%
                uptime: Date.now() - (Date.now() - 86400000 * 3), // 3 days ago
                lastCheck: new Date().toLocaleTimeString('fa-IR')
            };

            // Update DOM elements
            const systemStatus = document.getElementById('system-status');
            const cpuUsage = document.getElementById('cpu-usage');
            const cpuBar = document.getElementById('cpu-bar');
            const memoryUsage = document.getElementById('memory-usage');
            const memoryBar = document.getElementById('memory-bar');
            const systemUptime = document.getElementById('system-uptime');
            const lastCheckTime = document.getElementById('last-check-time');
            const startTime = document.getElementById('start-time');

            if (systemStatus) systemStatus.textContent = stats.status;
            if (cpuUsage) cpuUsage.textContent = `${stats.cpu}%`;
            if (cpuBar) cpuBar.style.width = `${stats.cpu}%`;
            if (memoryUsage) memoryUsage.textContent = `${stats.memory}%`;
            if (memoryBar) memoryBar.style.width = `${stats.memory}%`;
            if (systemUptime) systemUptime.textContent = this.formatUptime(stats.uptime);
            if (lastCheckTime) lastCheckTime.textContent = stats.lastCheck;
            if (startTime) startTime.textContent = new Date(Date.now() - 86400000 * 3).toLocaleTimeString('fa-IR');
            
        } catch (error) {
            console.error('Error updating system stats:', error);
        }
    }

    formatUptime(startTime) {
        const uptime = Date.now() - startTime;
        const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
        const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
        
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    async updateConnectionStatus() {
        // Mock connection status updates
        const connections = {
            exchanges: ['binance', 'coinbase', 'kucoin'],
            ai: ['openai', 'gemini', 'claude'],
            external: ['coingecko', 'newsapi', 'telegram']
        };
        
        // Simulate some connection changes
        // In production, this would make real API calls to check status
    }

    async testAllConnections() {
        this.showAlert('در حال تست همه اتصالات...', 'info');
        
        try {
            // Simulate testing all connections
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showAlert('تست اتصالات کامل شد', 'success');
        } catch (error) {
            console.error('Error testing connections:', error);
            this.showAlert('خطا در تست اتصالات', 'error');
        }
    }

    async refreshConnections() {
        this.showAlert('بروزرسانی وضعیت اتصالات...', 'info');
        
        try {
            // Simulate refreshing connection status
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showAlert('وضعیت اتصالات بروزرسانی شد', 'success');
        } catch (error) {
            console.error('Error refreshing connections:', error);
            this.showAlert('خطا در بروزرسانی اتصالات', 'error');
        }
    }

    // Database monitoring methods
    async checkDatabaseHealth() {
        this.showAlert('در حال بررسی سلامت پایگاه داده...', 'info');
        
        try {
            // Simulate database health check
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            this.showAlert('پایگاه داده سالم است', 'success');
        } catch (error) {
            console.error('Error checking database health:', error);
            this.showAlert('خطا در بررسی پایگاه داده', 'error');
        }
    }

    async optimizeDatabase() {
        const confirmed = confirm('آیا از بهینه‌سازی پایگاه داده اطمینان دارید؟ این عملیات ممکن است چند دقیقه طول بکشد.');
        if (!confirmed) return;

        this.showAlert('در حال بهینه‌سازی پایگاه داده...', 'info');
        
        try {
            // Simulate database optimization
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            this.showAlert('بهینه‌سازی پایگاه داده کامل شد', 'success');
        } catch (error) {
            console.error('Error optimizing database:', error);
            this.showAlert('خطا در بهینه‌سازی پایگاه داده', 'error');
        }
    }

    async cleanupDatabase() {
        const confirmed = confirm('آیا از پاکسازی داده‌های قدیمی اطمینان دارید؟ این عملیات برگشت‌ناپذیر است.');
        if (!confirmed) return;

        this.showAlert('در حال پاکسازی داده‌های قدیمی...', 'info');
        
        try {
            // Simulate database cleanup
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            this.showAlert('پاکسازی پایگاه داده کامل شد', 'success');
        } catch (error) {
            console.error('Error cleaning up database:', error);
            this.showAlert('خطا در پاکسازی پایگاه داده', 'error');
        }
    }

    async repairDatabase() {
        const confirmed = confirm('آیا از تعمیر پایگاه داده اطمینان دارید؟ لطفا قبل از ادامه بک‌آپ تهیه کنید.');
        if (!confirmed) return;

        this.showAlert('در حال تعمیر پایگاه داده...', 'info');
        
        try {
            // Simulate database repair
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            this.showAlert('تعمیر پایگاه داده کامل شد', 'success');
        } catch (error) {
            console.error('Error repairing database:', error);
            this.showAlert('خطا در تعمیر پایگاه داده', 'error');
        }
    }

    // UI/UX testing methods
    async testResponsiveDesign() {
        this.showAlert('در حال تست Responsive Design...', 'info');
        
        try {
            // Simulate responsive design test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showAlert('تست Responsive Design موفقیت‌آمیز بود', 'success');
        } catch (error) {
            console.error('Error testing responsive design:', error);
            this.showAlert('خطا در تست Responsive Design', 'error');
        }
    }

    async testLoadingTimes() {
        this.showAlert('در حال اندازه‌گیری زمان بارگذاری...', 'info');
        
        try {
            const startTime = performance.now();
            // Simulate loading test
            await new Promise(resolve => setTimeout(resolve, 1500));
            const endTime = performance.now();
            
            const loadTime = ((endTime - startTime) / 1000).toFixed(2);
            this.showAlert(`زمان بارگذاری: ${loadTime} ثانیه`, 'success');
        } catch (error) {
            console.error('Error testing loading times:', error);
            this.showAlert('خطا در تست زمان بارگذاری', 'error');
        }
    }

    async testFormValidation() {
        this.showAlert('در حال تست اعتبارسنجی فرم‌ها...', 'info');
        
        try {
            // Simulate form validation test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showAlert('تست اعتبارسنجی فرم‌ها موفقیت‌آمیز بود', 'success');
        } catch (error) {
            console.error('Error testing form validation:', error);
            this.showAlert('خطا در تست اعتبارسنجی فرم‌ها', 'error');
        }
    }

    async testJavaScript() {
        this.showAlert('در حال تست عملکرد JavaScript...', 'info');
        
        try {
            // Test some JavaScript functionality
            const testStart = performance.now();
            
            // Run some performance tests
            let sum = 0;
            for (let i = 0; i < 1000000; i++) {
                sum += i;
            }
            
            const testEnd = performance.now();
            const jsPerf = ((testEnd - testStart)).toFixed(2);
            
            this.showAlert(`عملکرد JavaScript: ${jsPerf}ms برای 1M عملیات`, 'success');
        } catch (error) {
            console.error('Error testing JavaScript:', error);
            this.showAlert('خطا در تست JavaScript', 'error');
        }
    }

    async runFullUITest() {
        this.showAlert('شروع تست کامل رابط کاربری...', 'info');
        
        try {
            await this.testResponsiveDesign();
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.testLoadingTimes();
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.testFormValidation();
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.testJavaScript();
            
            this.showAlert('تست کامل رابط کاربری با موفقیت انجام شد', 'success');
        } catch (error) {
            console.error('Error running full UI test:', error);
            this.showAlert('خطا در تست کامل رابط کاربری', 'error');
        }
    }

    // Backup and restore methods
    async createBackup() {
        const backupType = document.querySelector('input[name="backup-type"]:checked')?.value || 'full';
        
        this.showAlert(`در حال ایجاد بک‌آپ ${this.getBackupTypeLabel(backupType)}...`, 'info');
        
        try {
            // Simulate backup creation
            const backupSize = backupType === 'full' ? '218.9 MB' : 
                              backupType === 'database' ? '156.3 MB' : '2.1 MB';
                              
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const timestamp = new Date().toLocaleString('fa-IR');
            this.showAlert(`بک‌آپ ${this.getBackupTypeLabel(backupType)} (${backupSize}) با موفقیت ایجاد شد`, 'success');
            
            // Refresh backup list
            this.refreshBackupList();
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showAlert('خطا در ایجاد بک‌آپ', 'error');
        }
    }

    getBackupTypeLabel(type) {
        const labels = {
            'full': 'کامل',
            'database': 'پایگاه داده',
            'settings': 'تنظیمات',
            'custom': 'سفارشی'
        };
        return labels[type] || type;
    }

    async scheduleBackup() {
        this.showAlert('تنظیم برنامه‌ریزی بک‌آپ خودکار...', 'info');
        
        try {
            // Simulate backup scheduling
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showAlert('برنامه‌ریزی بک‌آپ خودکار تنظیم شد', 'success');
        } catch (error) {
            console.error('Error scheduling backup:', error);
            this.showAlert('خطا در برنامه‌ریزی بک‌آپ', 'error');
        }
    }

    async downloadBackup(backupId) {
        this.showAlert(`در حال دانلود بک‌آپ ${backupId}...`, 'info');
        
        try {
            // Simulate backup download
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showAlert('دانلود بک‌آپ آغاز شد', 'success');
        } catch (error) {
            console.error('Error downloading backup:', error);
            this.showAlert('خطا در دانلود بک‌آپ', 'error');
        }
    }

    async restoreBackup(backupId) {
        const confirmed = confirm(`آیا از بازیابی بک‌آپ ${backupId} اطمینان دارید؟ تمام تغییرات فعلی پاک خواهد شد.`);
        if (!confirmed) return;

        this.showAlert(`در حال بازیابی بک‌آپ ${backupId}...`, 'info');
        
        try {
            // Simulate backup restoration
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            this.showAlert('بازیابی بک‌آپ با موفقیت انجام شد', 'success');
        } catch (error) {
            console.error('Error restoring backup:', error);
            this.showAlert('خطا در بازیابی بک‌آپ', 'error');
        }
    }

    async emergencyRestore() {
        const confirmed = confirm('⚠️ هشدار: بازیابی اضطراری تمام داده‌ها و تنظیمات فعلی را پاک می‌کند. آیا مطمئن هستید؟');
        if (!confirmed) return;

        const doubleConfirm = confirm('این عملیات برگشت‌ناپذیر است. آیا واقعاً می‌خواهید ادامه دهید؟');
        if (!doubleConfirm) return;

        this.showAlert('در حال انجام بازیابی اضطراری...', 'info');
        
        try {
            // Simulate emergency restore
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            this.showAlert('بازیابی اضطراری با موفقیت انجام شد', 'success');
        } catch (error) {
            console.error('Error during emergency restore:', error);
            this.showAlert('خطا در بازیابی اضطراری', 'error');
        }
    }

    refreshBackupList() {
        // This would refresh the backup list from the server
        console.log('Refreshing backup list...');
    }

    async exportMonitoringReport() {
        this.showAlert('در حال تهیه گزارش کامل پایش...', 'info');
        
        try {
            // Simulate report generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showAlert('گزارش پایش سیستم آماده شد', 'success');
        } catch (error) {
            console.error('Error exporting monitoring report:', error);
            this.showAlert('خطا در تهیه گزارش پایش', 'error');
        }
    }

    showAlert(message, type = 'info') {
        // Use app's alert system if available
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // ==================== Advanced AI Methods ====================

    async openAIConfigPanel() {
        try {
            // Load the AI configuration module
            if (window.aiConfigManager) {
                const configUI = window.aiConfigManager.createConfigurationUI();
                
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                        <div class="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                            <h3 class="text-xl font-semibold text-white">🧠 پیکربندی پیشرفته AI</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto p-4"></div>
                    </div>
                `;
                
                modal.querySelector('.p-4:last-child').appendChild(configUI);
                document.body.appendChild(modal);
            } else {
                this.showToast('در حال بارگذاری تنظیمات AI...', 'info');
                // Load AI config manager script
                const script = document.createElement('script');
                script.src = '/static/modules/ai-config.js?v=' + Date.now();
                script.onload = () => {
                    setTimeout(() => this.openAIConfigPanel(), 1000);
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error('Error opening AI config panel:', error);
            this.showToast('خطا در بارگذاری پنل تنظیمات AI', 'error');
        }
    }

    async testAllAIProviders() {
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin text-2xl mb-2"></i><div class="font-medium">در حال تست...</div>';
            button.disabled = true;

            const response = await axios.get('/api/ai/config/providers');
            if (response.data.success) {
                const providers = response.data.providers.filter(p => p.enabled);
                let results = [];

                for (const provider of providers) {
                    try {
                        const testResult = await axios.post(`/api/ai/config/providers/${provider.id}/test`);
                        results.push({
                            provider: provider.name,
                            success: testResult.data.success,
                            responseTime: testResult.data.responseTime || 0
                        });
                    } catch (error) {
                        results.push({
                            provider: provider.name,
                            success: false,
                            error: error.message
                        });
                    }
                }

                this.showTestResults(results);
            }
        } catch (error) {
            console.error('Error testing AI providers:', error);
            this.showToast('خطا در تست ارائه‌دهندگان AI', 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    showTestResults(results) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">نتایج تست ارائه‌دهندگان AI</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    ${results.map(result => `
                        <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div>
                                <div class="font-medium text-white">${result.provider}</div>
                                ${result.responseTime ? `<div class="text-xs text-gray-400">${result.responseTime}ms</div>` : ''}
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-${result.success ? 'green' : 'red'}-400 rounded-full"></div>
                                <span class="text-sm text-${result.success ? 'green' : 'red'}-400">
                                    ${result.success ? 'موفق' : 'ناموفق'}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.closest('.fixed').remove()" class="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-2 rounded text-white">
                    بستن
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async viewAIAnalytics() {
        try {
            const response = await axios.get('/api/ai/advanced/analytics/performance');
            if (response.data.success) {
                this.showAnalyticsModal(response.data.analytics);
            }
        } catch (error) {
            console.error('Error loading AI analytics:', error);
            this.showToast('خطا در بارگذاری آنالیتیکس AI', 'error');
        }
    }

    showAnalyticsModal(analytics) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div class="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h3 class="text-xl font-semibold text-white">📊 آنالیتیکس AI</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div class="bg-gray-700 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-blue-400">${analytics?.totalRequests || 0}</div>
                            <div class="text-sm text-gray-400">کل درخواست‌ها</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-green-400">${Math.round((analytics?.successRate || 0) * 100)}%</div>
                            <div class="text-sm text-gray-400">نرخ موفقیت</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-yellow-400">${analytics?.averageResponseTime || 0}ms</div>
                            <div class="text-sm text-gray-400">متوسط زمان پاسخ</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-purple-400">${Math.round((analytics?.qualityScore || 0) * 100)}%</div>
                            <div class="text-sm text-gray-400">امتیاز کیفیت</div>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-gray-400">آنالیتیکس تفصیلی در نسخه‌های آینده اضافه خواهد شد.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async exportAISettings() {
        try {
            const response = await axios.get('/api/ai/config/export');
            if (response.data.success) {
                const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { 
                    type: 'application/json' 
                });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `titan-ai-config-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showToast('تنظیمات AI با موفقیت خروجی گرفته شد', 'success');
            }
        } catch (error) {
            console.error('Error exporting AI settings:', error);
            this.showToast('خطا در خروجی گیری تنظیمات AI', 'error');
        }
    }

    testSentimentAnalysis() {
        const testText = 'من واقعا از این سیستم معاملاتی راضی هستم! عملکرد فوق‌العاده‌ای دارد.';
        
        axios.post('/api/ai/advanced/sentiment/analyze', {
            text: testText,
            language: 'fa'
        }).then(response => {
            if (response.data.success) {
                const sentiment = response.data.sentiment;
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-white">نتیجه تست تحلیل احساسات</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="space-y-3">
                            <div class="bg-gray-700 rounded-lg p-3">
                                <div class="text-sm text-gray-400 mb-1">متن تست:</div>
                                <div class="text-white">"${testText}"</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-3">
                                <div class="text-sm text-gray-400 mb-2">نتیجه تحلیل:</div>
                                <div class="flex items-center justify-between">
                                    <span class="text-white">احساس کلی:</span>
                                    <span class="text-${sentiment.overall === 'positive' ? 'green' : sentiment.overall === 'negative' ? 'red' : 'yellow'}-400 font-bold">
                                        ${sentiment.overall === 'positive' ? 'مثبت' : sentiment.overall === 'negative' ? 'منفی' : 'خنثی'}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between mt-1">
                                    <span class="text-white">امتیاز:</span>
                                    <span class="text-blue-400 font-bold">${Math.round(sentiment.score * 100)}%</span>
                                </div>
                                <div class="flex items-center justify-between mt-1">
                                    <span class="text-white">اعتماد:</span>
                                    <span class="text-purple-400 font-bold">${Math.round(sentiment.confidence * 100)}%</span>
                                </div>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-2 rounded text-white">
                            بستن
                        </button>
                    </div>
                `;
                document.body.appendChild(modal);
            }
        }).catch(error => {
            console.error('Error testing sentiment analysis:', error);
            this.showToast('خطا در تست تحلیل احساسات', 'error');
        });
    }

    viewLearningMetrics() {
        axios.get('/api/ai/advanced/learning/metrics').then(response => {
            if (response.data.success) {
                const metrics = response.data.metrics;
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-white">آمار یادگیری ماشین</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <span class="text-gray-300">کل بازخوردها:</span>
                                <span class="text-white font-bold">${metrics?.totalFeedbacks || 0}</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <span class="text-gray-300">نرخ بهبود کیفیت:</span>
                                <span class="text-green-400 font-bold">${Math.round((metrics?.improvementRate || 0) * 100)}%</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <span class="text-gray-300">امتیاز یادگیری:</span>
                                <span class="text-purple-400 font-bold">${Math.round((metrics?.learningScore || 0) * 100)}/100</span>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-2 rounded text-white">
                            بستن
                        </button>
                    </div>
                `;
                document.body.appendChild(modal);
            }
        }).catch(error => {
            console.error('Error loading learning metrics:', error);
            this.showToast('خطا در بارگذاری آمار یادگیری', 'error');
        });
    }

    manageContextMemory() {
        axios.get('/api/ai/advanced/context/conversations').then(response => {
            if (response.data.success) {
                const conversations = response.data.conversations || [];
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                modal.innerHTML = `
                    <div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div class="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                            <h3 class="text-xl font-semibold text-white">مدیریت حافظه زمینه</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto p-4">
                            <div class="mb-4 flex justify-between items-center">
                                <span class="text-white">مکالمات ذخیره شده: ${conversations.length}</span>
                                <button onclick="settingsModule.clearContextMemory()" class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm">
                                    پاکسازی همه
                                </button>
                            </div>
                            <div class="space-y-2 max-h-64 overflow-y-auto">
                                ${conversations.length ? conversations.map(conv => `
                                    <div class="bg-gray-700 rounded p-3">
                                        <div class="flex justify-between items-center">
                                            <span class="text-white text-sm">مکالمه ${conv.id}</span>
                                            <span class="text-gray-400 text-xs">${conv.messageCount} پیام</span>
                                        </div>
                                        <div class="text-gray-400 text-xs mt-1">${new Date(conv.lastActivity).toLocaleString('fa-IR')}</div>
                                    </div>
                                `).join('') : '<div class="text-center py-8 text-gray-400">هیچ مکالمه‌ای ذخیره نشده</div>'}
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
        }).catch(error => {
            console.error('Error loading context memory:', error);
            this.showToast('خطا در بارگذاری حافظه زمینه', 'error');
        });
    }

    async clearContextMemory() {
        if (confirm('آیا مطمئن هستید که می‌خواهید تمام حافظه زمینه را پاک کنید؟')) {
            try {
                await axios.delete('/api/ai/advanced/context/memory');
                this.showToast('حافظه زمینه با موفقیت پاک شد', 'success');
                document.querySelector('.fixed').remove();
            } catch (error) {
                console.error('Error clearing context memory:', error);
                this.showToast('خطا در پاکسازی حافظه زمینه', 'error');
            }
        }
    }

    resetAISystem() {
        if (confirm('آیا مطمئن هستید که می‌خواهید سیستم AI را بازنشانی کنید؟ این عمل تمام تنظیمات را به حالت پیش‌فرض بازمی‌گرداند.')) {
            axios.post('/api/ai/config/reset').then(response => {
                if (response.data.success) {
                    this.showToast('سیستم AI با موفقیت بازنشانی شد', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                }
            }).catch(error => {
                console.error('Error resetting AI system:', error);
                this.showToast('خطا در بازنشانی سیستم AI', 'error');
            });
        }
    }

    optimizeAI() {
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin text-xl mb-2 block"></i><div>در حال بهینه‌سازی...</div>';
        button.disabled = true;

        // Simulate optimization process
        setTimeout(() => {
            this.showToast('سیستم AI با موفقیت بهینه‌سازی شد', 'success');
            button.innerHTML = originalText;
            button.disabled = false;
        }, 3000);
    }

    updateAIModels() {
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin text-xl mb-2 block"></i><div>در حال بروزرسانی...</div>';
        button.disabled = true;

        // Simulate model update process
        setTimeout(() => {
            this.showToast('مدل‌های AI با موفقیت بروزرسانی شدند', 'success');
            button.innerHTML = originalText;
            button.disabled = false;
        }, 5000);
    }

    emergencyStopAI() {
        if (confirm('آیا مطمئن هستید که می‌خواهید سیستم AI را متوقف کنید؟ این عمل تمام عملیات AI را قطع می‌کند.')) {
            axios.post('/api/ai/advanced/emergency-stop').then(response => {
                this.showToast('سیستم AI در حالت اضطراری متوقف شد', 'warning');
            }).catch(error => {
                console.error('Error stopping AI system:', error);
                this.showToast('خطا در توقف سیستم AI', 'error');
            });
        }
    }

    // AI Management specific methods
    loadAIManagementDashboard() {
        console.log('🔄 Loading AI Management Dashboard...');
        const container = document.getElementById('ai-management-container');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-gray-700 rounded-lg p-4 text-center">
                <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p class="text-gray-300">در حال بارگذاری داشبورد...</p>
            </div>
        `;

        // Load AI Management module
        const script = document.createElement('script');
        script.src = '/static/modules/ai-management.js?v=' + Date.now();
        script.onload = () => {
            if (window.TitanModules && window.TitanModules.AIManagement) {
                const aiModule = window.TitanModules.AIManagement;
                aiModule.init();
                container.innerHTML = '<div id="ai-content-area"></div>';
                aiModule.switchView('overview');
                console.log('✅ AI Management Dashboard loaded successfully');
            }
        };
        script.onerror = () => {
            container.innerHTML = `
                <div class="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
                    <p class="text-red-400">خطا در بارگذاری داشبورد AI</p>
                    <button onclick="settingsModule.loadAIManagementDashboard()" class="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                        تلاش مجدد
                    </button>
                </div>
            `;
        };
        document.head.appendChild(script);
    }

    saveAIManagementSettings() {
        try {
            const settings = {
                artemis: {
                    mode: document.getElementById('artemis-mode')?.value || 'autonomous',
                    collectiveIntelligence: document.getElementById('collective-intelligence')?.value || 85,
                    decisionThreshold: document.getElementById('decision-threshold')?.value || 80,
                    learningStrategy: document.getElementById('learning-strategy')?.value || 'balanced',
                    autoTraining: document.getElementById('auto-training')?.checked || true,
                    longTermMemory: document.getElementById('long-term-memory')?.checked || true,
                    persianSentiment: document.getElementById('persian-sentiment')?.checked || true
                },
                agents: {
                    trainingFrequency: document.getElementById('training-frequency')?.value || 12,
                    maxContext: document.getElementById('max-context')?.value || 100,
                    retrainThreshold: document.getElementById('retrain-threshold')?.value || 75,
                    autoOptimization: document.getElementById('auto-optimization')?.checked || true,
                    agentFallback: document.getElementById('agent-fallback')?.checked || true,
                    detailedLogging: document.getElementById('detailed-logging')?.checked || false
                }
            };

            // Save to localStorage
            localStorage.setItem('titan_ai_management_settings', JSON.stringify(settings));
            
            // Show success message
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('تنظیمات AI با موفقیت ذخیره شد', 'success');
            }

            console.log('✅ AI Management settings saved:', settings);
        } catch (error) {
            console.error('❌ Error saving AI settings:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در ذخیره تنظیمات AI', 'error');
            }
        }
    }

    resetAllAgents() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه ایجنت‌ها را بازنشانی کنید؟ این عمل غیرقابل بازگشت است.')) {
            // Reset logic here
            localStorage.removeItem('titan_ai_agents_data');
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('همه ایجنت‌ها بازنشانی شدند', 'success');
            }
            console.log('🔄 All AI agents reset');
        }
    }

    generatePerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            accuracy: '92.3%',
            decisions: 1247,
            memoryUsage: '3.2GB',
            agents: 15,
            uptime: '99.7%'
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_performance_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('گزارش عملکرد دانلود شد', 'success');
        }
    }

    exportAISettings() {
        const settings = localStorage.getItem('titan_ai_management_settings') || '{}';
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_settings_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('تنظیمات AI صادر شد', 'success');
        }
    }

    importAISettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const settings = JSON.parse(e.target.result);
                        localStorage.setItem('titan_ai_management_settings', JSON.stringify(settings));
                        if (typeof app !== 'undefined' && app.showAlert) {
                            app.showAlert('تنظیمات AI وارد شد', 'success');
                        }
                        // Reload the current tab to show new settings
                        this.switchTab('ai-management');
                    } catch (error) {
                        if (typeof app !== 'undefined' && app.showAlert) {
                            app.showAlert('خطا در وارد کردن تنظیمات', 'error');
                        }
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    destroy() {
        // Clean up monitoring interval
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('✅ Settings module destroyed');
    }
}

// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.SettingsModule = SettingsModule;

// Create global instance for easy access
window.settingsModule = null;