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
                        <button onclick="notificationsTab.testEmailConnection()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
                        <button onclick="notificationsTab.testTelegramConnection()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                        <button onclick="notificationsTab.testWhatsAppConnection()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
                        <button onclick="notificationsTab.testSMSConnection()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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
                        <button onclick="notificationsTab.testDiscordConnection()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
                            <button onclick="notificationsTab.requestDesktopPermission()" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-controls text-sm">
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
        try {
            const data = this.collectEmailData();
            
            if (!data.enabled) {
                this.showNotification('ابتدا سرویس ایمیل را فعال کنید', 'warning');
                return;
            }

            if (!data.smtp_host || !data.smtp_user || !data.smtp_pass) {
                this.showNotification('لطفاً تمام فیلدهای اجباری را پر کنید', 'warning');
                return;
            }

            this.showNotification('در حال تست اتصال ایمیل...', 'info');
            
            const token = localStorage.getItem('titan_auth_token');
            const response = await fetch('/api/notifications/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('✅ تست ایمیل موفق! پیام ارسال شد', 'success');
            } else {
                this.showNotification(`❌ خطا در تست ایمیل: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Email test error:', error);
            this.showNotification('❌ خطا در تست اتصال ایمیل', 'error');
        }
    }

    async testTelegramConnection() {
        try {
            console.log('🔍 Starting Telegram test...');
            
            const token = localStorage.getItem('titan_auth_token');
            
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد سیستم شوید', 'warning');
                return;
            }
            
            const data = this.collectTelegramData();
            console.log('📊 Telegram data collected:', data);
            
            if (!data.enabled) {
                this.showNotification('ابتدا سرویس تلگرام را فعال کنید', 'warning');
                return;
            }

            if (!data.bot_token || !data.chat_id) {
                this.showNotification('لطفاً Bot Token و Chat ID را وارد کنید', 'warning');
                return;
            }

            this.showNotification('در حال تست اتصال تلگرام...', 'info');
            console.log('🌐 Sending request to backend...');
            
            const response = await fetch('/api/notifications/test-telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            console.log('📡 Response status:', response.status);
            const result = await response.json();
            console.log('📄 Response data:', result);
            
            if (result.success) {
                this.showNotification('✅ تست تلگرام موفق! پیام ارسال شد', 'success');
                console.log('✅ Telegram test successful');
            } else {
                this.showNotification(`❌ خطا در تست تلگرام: ${result.error}`, 'error');
                console.error('❌ Telegram test failed:', result.error);
            }
        } catch (error) {
            console.error('Telegram test error:', error);
            this.showNotification('❌ خطا در تست اتصال تلگرام', 'error');
        }
    }

    async testWhatsAppConnection() {
        try {
            const data = this.collectWhatsAppData();
            
            if (!data.enabled) {
                this.showNotification('ابتدا سرویس واتس‌اپ را فعال کنید', 'warning');
                return;
            }

            if (!data.api_token || !data.phone_number) {
                this.showNotification('لطفاً API Token و شماره تلفن را وارد کنید', 'warning');
                return;
            }

            this.showNotification('در حال تست اتصال واتس‌اپ...', 'info');
            
            // For now, simulate WhatsApp test (real implementation would need WhatsApp Business API)
            setTimeout(() => {
                this.showNotification('✅ تست واتس‌اپ موفق! (شبیه‌سازی)', 'success');
            }, 2000);
        } catch (error) {
            console.error('WhatsApp test error:', error);
            this.showNotification('❌ خطا در تست اتصال واتس‌اپ', 'error');
        }
    }

    async testSMSConnection() {
        try {
            const data = this.collectSMSData();
            
            if (!data.enabled) {
                this.showNotification('ابتدا سرویس پیامک را فعال کنید', 'warning');
                return;
            }

            if (!data.api_key) {
                this.showNotification('لطفاً API Key را وارد کنید', 'warning');
                return;
            }

            this.showNotification('در حال تست اتصال پیامک...', 'info');
            
            // For now, simulate SMS test (real implementation would integrate with SMS providers)
            setTimeout(() => {
                this.showNotification('✅ تست پیامک موفق! (شبیه‌سازی)', 'success');
            }, 2000);
        } catch (error) {
            console.error('SMS test error:', error);
            this.showNotification('❌ خطا در تست اتصال پیامک', 'error');
        }
    }

    async testDiscordConnection() {
        try {
            const data = this.collectDiscordData();
            
            if (!data.enabled) {
                this.showNotification('ابتدا سرویس دیسکورد را فعال کنید', 'warning');
                return;
            }

            if (!data.webhook_url) {
                this.showNotification('لطفاً Webhook URL را وارد کنید', 'warning');
                return;
            }

            this.showNotification('در حال تست اتصال دیسکورد...', 'info');
            
            const token = localStorage.getItem('titan_auth_token');
            const response = await fetch('/api/notifications/test-discord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('✅ تست دیسکورد موفق! پیام ارسال شد', 'success');
            } else {
                this.showNotification(`❌ خطا در تست دیسکورد: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Discord test error:', error);
            this.showNotification('❌ خطا در تست اتصال دیسکورد', 'error');
        }
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

    // ===================================================================
    // BACKEND INTEGRATION METHODS
    // ===================================================================

    // Save settings (called by settings-unified.js)
    async saveSettings() {
        try {
            console.log('💾 Saving notification settings...');
            
            const settings = this.collectData();
            const token = localStorage.getItem('titan_auth_token');
            
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد سیستم شوید', 'warning');
                return { success: false, error: 'No authentication token' };
            }

            const response = await fetch('/api/alerts/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message || 'تنظیمات اطلاعیه‌ها با موفقیت ذخیره شد', 'success');
                return { success: true, data: result.data };
            } else {
                this.showNotification(result.error || 'خطا در ذخیره تنظیمات', 'error');
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Save notification settings error:', error);
            this.showNotification('خطا در ذخیره تنظیمات اطلاعیه‌ها', 'error');
            return { success: false, error: error.message };
        }
    }

    // Load settings from backend
    async loadSettings() {
        try {
            console.log('📋 Loading notification settings...');
            
            const token = localStorage.getItem('titan_auth_token');
            
            if (!token) {
                console.warn('No auth token found, using defaults');
                return { success: true, data: {} };
            }

            const response = await fetch('/api/alerts/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                this.applySettingsToForm(result.data);
                return { success: true, data: result.data };
            } else {
                console.warn('Failed to load settings:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Load notification settings error:', error);
            return { success: false, error: error.message };
        }
    }

    // Apply settings to form elements
    applySettingsToForm(settings) {
        if (!settings) return;

        // Apply email settings
        if (settings.email) {
            const emailEnabled = document.getElementById('email-enabled');
            if (emailEnabled) emailEnabled.checked = settings.email.enabled || false;
            
            if (settings.email.smtp_host) document.getElementById('smtp-host').value = settings.email.smtp_host;
            if (settings.email.smtp_port) document.getElementById('smtp-port').value = settings.email.smtp_port;
            if (settings.email.smtp_user) document.getElementById('smtp-user').value = settings.email.smtp_user;
            if (settings.email.smtp_pass) document.getElementById('smtp-pass').value = settings.email.smtp_pass;
            if (settings.email.from_email) document.getElementById('from-email').value = settings.email.from_email;
            if (settings.email.from_name) document.getElementById('from-name').value = settings.email.from_name;
        }

        // Apply Telegram settings
        if (settings.telegram) {
            const telegramEnabled = document.getElementById('telegram-enabled');
            if (telegramEnabled) telegramEnabled.checked = settings.telegram.enabled || false;
            
            if (settings.telegram.bot_token) document.getElementById('telegram-bot-token').value = settings.telegram.bot_token;
            if (settings.telegram.chat_id) document.getElementById('telegram-chat-id').value = settings.telegram.chat_id;
            if (settings.telegram.parse_mode) document.getElementById('telegram-parse-mode').value = settings.telegram.parse_mode;
        }

        // Apply other services settings...
        if (settings.whatsapp) {
            const whatsappEnabled = document.getElementById('whatsapp-enabled');
            if (whatsappEnabled) whatsappEnabled.checked = settings.whatsapp.enabled || false;
        }

        if (settings.sms) {
            const smsEnabled = document.getElementById('sms-enabled');
            if (smsEnabled) smsEnabled.checked = settings.sms.enabled || false;
        }

        if (settings.discord) {
            const discordEnabled = document.getElementById('discord-enabled');
            if (discordEnabled) discordEnabled.checked = settings.discord.enabled || false;
        }

        if (settings.inapp) {
            const inappEnabled = document.getElementById('inapp-enabled');
            if (inappEnabled) inappEnabled.checked = settings.inapp.enabled !== false;
            
            const inappSound = document.getElementById('inapp-sound');
            if (inappSound) inappSound.checked = settings.inapp.sound !== false;
            
            const inappDesktop = document.getElementById('inapp-desktop');
            if (inappDesktop) inappDesktop.checked = settings.inapp.desktop !== false;
        }

        // Update toggle states
        this.setupToggleHandlers();
        
        console.log('✅ Applied notification settings to form');
    }

    // Initialize tab functionality (updated)
    async initialize() {
        console.log('🔔 Notifications tab initialized');
        
        // Set up global instance
        window.notificationsTab = this;
        
        // Load settings from backend
        await this.loadSettings();
        
        // Set up toggle functionality for notification services
        this.setupToggleHandlers();
        
        // Request desktop notification permission if enabled
        if (this.settings.inapp?.desktop && Notification.permission === 'default') {
            this.requestDesktopPermission();
        }
    }

    showNotification(message, type = 'info') {
        // Console log for debugging
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create visual notification
        this.createToast(message, type);
        
        // Also try to integrate with global notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }

    createToast(message, type) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.notifications-settings-toast');
        existingToasts.forEach(toast => toast.remove());

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `notifications-settings-toast fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform`;
        
        // Style based on type
        const styles = {
            success: 'bg-green-600 text-white border-l-4 border-green-400',
            error: 'bg-red-600 text-white border-l-4 border-red-400', 
            info: 'bg-blue-600 text-white border-l-4 border-blue-400',
            warning: 'bg-yellow-600 text-white border-l-4 border-yellow-400'
        };
        
        toast.className += ` ${styles[type] || styles.info}`;
        
        // Add icon based on type
        const icons = {
            success: '✅',
            error: '❌', 
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-xl">${icons[type] || icons.info}</span>
                <span class="font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200 transition-colors">
                    ×
                </button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                toast.style.opacity = '0';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
    }
}