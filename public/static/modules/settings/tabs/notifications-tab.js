// Notifications Tab Module - TITAN Trading System
// Comprehensive notification system configuration

export default class NotificationsTab {
    constructor(settings) {
        this.settings = settings.notifications || {};
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- Email Notifications -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-envelope text-blue-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">اعلان‌های ایمیل</h3>
                                <p class="text-gray-400">پیکربندی سرویس ایمیل برای اعلان‌ها</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="email-enabled" class="sr-only peer" ${this.settings.email?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div id="email-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
                            <input type="text" id="smtp-host" value="${this.settings.email?.smtp_host || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                   placeholder="smtp.gmail.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                            <input type="number" id="smtp-port" value="${this.settings.email?.smtp_port || 587}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری SMTP</label>
                            <input type="text" id="smtp-user" value="${this.settings.email?.smtp_user || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                   placeholder="your-email@gmail.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور SMTP</label>
                            <input type="password" id="smtp-pass" value="${this.settings.email?.smtp_pass || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">ایمیل فرستنده</label>
                            <input type="email" id="from-email" value="${this.settings.email?.from_email || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                   placeholder="notifications@yoursite.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نام فرستنده</label>
                            <input type="text" id="from-name" value="${this.settings.email?.from_name || 'TITAN Trading System'}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.testEmailConnection()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-paper-plane mr-2"></i>
                            تست ارسال ایمیل
                        </button>
                    </div>
                </div>

                <!-- Telegram Notifications -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fab fa-telegram text-blue-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">اعلان‌های تلگرام</h3>
                                <p class="text-gray-400">ارسال اعلان‌ها از طریق ربات تلگرام</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="telegram-enabled" class="sr-only peer" ${this.settings.telegram?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div id="telegram-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Bot Token</label>
                            <input type="text" id="telegram-bot-token" value="${this.settings.telegram?.bot_token || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                   placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Chat ID</label>
                            <input type="text" id="telegram-chat-id" value="${this.settings.telegram?.chat_id || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                   placeholder="123456789">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">Parse Mode</label>
                            <select id="telegram-parse-mode" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="HTML" ${this.settings.telegram?.parse_mode === 'HTML' ? 'selected' : ''}>HTML</option>
                                <option value="Markdown" ${this.settings.telegram?.parse_mode === 'Markdown' ? 'selected' : ''}>Markdown</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.testTelegramConnection()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fab fa-telegram mr-2"></i>
                            تست ارسال پیام
                        </button>
                    </div>
                </div>

                <!-- WhatsApp Notifications -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fab fa-whatsapp text-green-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">اعلان‌های واتس‌اپ</h3>
                                <p class="text-gray-400">ارسال پیام از طریق WhatsApp Business API</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="whatsapp-enabled" class="sr-only peer" ${this.settings.whatsapp?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div id="whatsapp-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Token</label>
                            <input type="text" id="whatsapp-api-token" value="${this.settings.whatsapp?.api_token || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">شماره تلفن</label>
                            <input type="text" id="whatsapp-phone-number" value="${this.settings.whatsapp?.phone_number || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                   placeholder="+989123456789">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">Instance ID</label>
                            <input type="text" id="whatsapp-instance-id" value="${this.settings.whatsapp?.instance_id || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.testWhatsAppConnection()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fab fa-whatsapp mr-2"></i>
                            تست ارسال پیام
                        </button>
                    </div>
                </div>

                <!-- SMS Notifications -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-sms text-purple-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">اعلان‌های پیامک</h3>
                                <p class="text-gray-400">ارسال پیامک از طریق سرویس‌های داخلی</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="sms-enabled" class="sr-only peer" ${this.settings.sms?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div id="sms-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">ارائه‌دهنده سرویس</label>
                            <select id="sms-provider" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="kavenegar" ${this.settings.sms?.provider === 'kavenegar' ? 'selected' : ''}>کاوه نگار</option>
                                <option value="farapayamak" ${this.settings.sms?.provider === 'farapayamak' ? 'selected' : ''}>فراپیامک</option>
                                <option value="ippanel" ${this.settings.sms?.provider === 'ippanel' ? 'selected' : ''}>IP Panel</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="text" id="sms-api-key" value="${this.settings.sms?.api_key || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">شماره فرستنده</label>
                            <input type="text" id="sms-sender" value="${this.settings.sms?.sender || 'TITAN'}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.testSMSConnection()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-sms mr-2"></i>
                            تست ارسال پیامک
                        </button>
                    </div>
                </div>

                <!-- Discord Notifications -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fab fa-discord text-indigo-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">اعلان‌های دیسکورد</h3>
                                <p class="text-gray-400">ارسال پیام از طریق Discord Webhook</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="discord-enabled" class="sr-only peer" ${this.settings.discord?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div id="discord-config" class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                            <input type="url" id="discord-webhook-url" value="${this.settings.discord?.webhook_url || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                   placeholder="https://discord.com/api/webhooks/...">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری</label>
                            <input type="text" id="discord-username" value="${this.settings.discord?.username || 'TITAN Bot'}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.testDiscordConnection()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            <i class="fab fa-discord mr-2"></i>
                            تست ارسال پیام
                        </button>
                    </div>
                </div>

                <!-- In-App Notifications -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-bell text-yellow-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">اعلان‌های درون‌برنامه‌ای</h3>
                                <p class="text-gray-400">تنظیمات نمایش اعلان‌ها در رابط کاربری</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="inapp-enabled" class="sr-only peer" ${this.settings.inapp?.enabled !== false ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div id="inapp-config" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <span class="text-white">صدای اعلان</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="inapp-sound" class="sr-only peer" ${this.settings.inapp?.sound !== false ? 'checked' : ''}>
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <span class="text-white">اعلان دسکتاپ</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="inapp-desktop" class="sr-only peer" ${this.settings.inapp?.desktop !== false ? 'checked' : ''}>
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-center">
                            <button onclick="this.requestDesktopPermission()" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                                <i class="fas fa-desktop mr-2"></i>
                                مجوز دسکتاپ
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Notification Types -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-list text-blue-400 ml-2"></i>
                        انواع اعلان‌ها
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="p-4 bg-gray-800 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">معاملات موفق</span>
                                <input type="checkbox" class="notification-type" data-type="successful-trades" checked>
                            </div>
                            <p class="text-sm text-gray-400">اطلاع از معاملات انجام شده</p>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">هشدارهای قیمت</span>
                                <input type="checkbox" class="notification-type" data-type="price-alerts" checked>
                            </div>
                            <p class="text-sm text-gray-400">هشدار تغییرات قیمت مهم</p>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">خطاهای سیستم</span>
                                <input type="checkbox" class="notification-type" data-type="system-errors" checked>
                            </div>
                            <p class="text-sm text-gray-400">اطلاع از خطاهای حیاتی</p>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تجزیه‌وتحلیل AI</span>
                                <input type="checkbox" class="notification-type" data-type="ai-analysis" checked>
                            </div>
                            <p class="text-sm text-gray-400">نتایج تحلیل هوش مصنوعی</p>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">گزارش‌های روزانه</span>
                                <input type="checkbox" class="notification-type" data-type="daily-reports" checked>
                            </div>
                            <p class="text-sm text-gray-400">خلاصه روزانه عملکرد</p>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">بروزرسانی‌ها</span>
                                <input type="checkbox" class="notification-type" data-type="updates">
                            </div>
                            <p class="text-sm text-gray-400">اطلاع از بروزرسانی‌های سیستم</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        // Set up toggle functionality for notification services
        this.setupToggleHandlers();
        
        // Request desktop notification permission if enabled
        if (this.settings.inapp?.desktop && Notification.permission === 'default') {
            this.requestDesktopPermission();
        }
    }

    setupToggleHandlers() {
        const services = ['email', 'telegram', 'whatsapp', 'sms', 'discord', 'inapp'];
        
        services.forEach(service => {
            const checkbox = document.getElementById(`${service}-enabled`);
            const config = document.getElementById(`${service}-config`);
            
            if (checkbox && config) {
                checkbox.addEventListener('change', () => {
                    config.style.opacity = checkbox.checked ? '1' : '0.5';
                    config.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
                });
                
                // Set initial state
                config.style.opacity = checkbox.checked ? '1' : '0.5';
                config.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
            }
        });
    }

    async testEmailConnection() {
        const data = this.collectEmailData();
        // Test email connection logic here
        alert('تست اتصال ایمیل در حال پیاده‌سازی...');
    }

    async testTelegramConnection() {
        const data = this.collectTelegramData();
        // Test Telegram connection logic here
        alert('تست اتصال تلگرام در حال پیاده‌سازی...');
    }

    async testWhatsAppConnection() {
        const data = this.collectWhatsAppData();
        // Test WhatsApp connection logic here
        alert('تست اتصال واتس‌اپ در حال پیاده‌سازی...');
    }

    async testSMSConnection() {
        const data = this.collectSMSData();
        // Test SMS connection logic here
        alert('تست اتصال پیامک در حال پیاده‌سازی...');
    }

    async testDiscordConnection() {
        const data = this.collectDiscordData();
        // Test Discord connection logic here
        alert('تست اتصال دیسکورد در حال پیاده‌سازی...');
    }

    async requestDesktopPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification('TITAN Trading System', {
                    body: 'مجوز اعلان‌های دسکتاپ فعال شد ✅',
                    icon: '/static/favicon.ico'
                });
            }
        } else {
            alert('مرورگر شما از اعلان‌های دسکتاپ پشتیبانی نمی‌کند');
        }
    }

    collectEmailData() {
        return {
            enabled: document.getElementById('email-enabled')?.checked || false,
            smtp_host: document.getElementById('smtp-host')?.value || '',
            smtp_port: parseInt(document.getElementById('smtp-port')?.value) || 587,
            smtp_user: document.getElementById('smtp-user')?.value || '',
            smtp_pass: document.getElementById('smtp-pass')?.value || '',
            from_email: document.getElementById('from-email')?.value || '',
            from_name: document.getElementById('from-name')?.value || 'TITAN Trading System'
        };
    }

    collectTelegramData() {
        return {
            enabled: document.getElementById('telegram-enabled')?.checked || false,
            bot_token: document.getElementById('telegram-bot-token')?.value || '',
            chat_id: document.getElementById('telegram-chat-id')?.value || '',
            parse_mode: document.getElementById('telegram-parse-mode')?.value || 'HTML'
        };
    }

    collectWhatsAppData() {
        return {
            enabled: document.getElementById('whatsapp-enabled')?.checked || false,
            api_token: document.getElementById('whatsapp-api-token')?.value || '',
            phone_number: document.getElementById('whatsapp-phone-number')?.value || '',
            instance_id: document.getElementById('whatsapp-instance-id')?.value || ''
        };
    }

    collectSMSData() {
        return {
            enabled: document.getElementById('sms-enabled')?.checked || false,
            provider: document.getElementById('sms-provider')?.value || 'kavenegar',
            api_key: document.getElementById('sms-api-key')?.value || '',
            sender: document.getElementById('sms-sender')?.value || 'TITAN'
        };
    }

    collectDiscordData() {
        return {
            enabled: document.getElementById('discord-enabled')?.checked || false,
            webhook_url: document.getElementById('discord-webhook-url')?.value || '',
            username: document.getElementById('discord-username')?.value || 'TITAN Bot'
        };
    }

    collectInAppData() {
        return {
            enabled: document.getElementById('inapp-enabled')?.checked || false,
            sound: document.getElementById('inapp-sound')?.checked || false,
            desktop: document.getElementById('inapp-desktop')?.checked || false
        };
    }

    collectData() {
        return {
            email: this.collectEmailData(),
            telegram: this.collectTelegramData(),
            whatsapp: this.collectWhatsAppData(),
            sms: this.collectSMSData(),
            discord: this.collectDiscordData(),
            inapp: this.collectInAppData(),
            // Collect notification types
            types: Array.from(document.querySelectorAll('.notification-type:checked'))
                      .map(cb => cb.getAttribute('data-type'))
        };
    }
}