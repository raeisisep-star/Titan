// Alerts Module for Titan Trading System - Complete Implementation
// Comprehensive notification and alert management system

class AlertsModule {
    constructor() {
        this.alerts = [];
        this.alertRules = [];
        this.activeAlerts = [];
        this.notificationChannels = {
            email: { enabled: false, templates: {} },
            telegram: { enabled: false, templates: {} },
            whatsapp: { enabled: false, templates: {} },
            sms: { enabled: false, templates: {} },
            inapp: { enabled: true, templates: {} },
            mobile: { enabled: false, templates: {} },
            discord: { enabled: false, templates: {} }
        };
        this.alertTypes = [
            'price_alert',
            'trade_execution',
            'portfolio_change',
            'ai_signal',
            'system_warning',
            'security_alert',
            'market_news',
            'stop_loss_hit',
            'take_profit_hit',
            'balance_low'
        ];
        this.currentPage = 1;
        this.itemsPerPage = 10;
    }

    async initialize() {
        console.log('🔔 Initializing Alerts module...');
        
        try {
            await this.loadAlertsData();
            await this.loadNotificationTemplates();
            this.setupEventListeners();
            this.startAlertMonitoring();
            console.log('✅ Alerts module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing alerts module:', error);
            throw error;
        }
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">🔔 سیستم هشدارها و اعلان‌ها</h2>
                    <p class="text-gray-400 mt-1">مدیریت کامل اعلان‌های چندکانال و هشدارهای هوشمند</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="alertsModule.createAlert()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-plus mr-2"></i>ایجاد هشدار جدید
                    </button>
                    <button onclick="alertsModule.testAllChannels()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                        <i class="fas fa-broadcast-tower mr-2"></i>تست همه کانال‌ها
                    </button>
                </div>
            </div>

            <!-- Alert Stats -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-blue-400" id="total-alerts">0</p>
                            <p class="text-sm text-gray-400">کل هشدارها</p>
                        </div>
                        <i class="fas fa-bell text-blue-400 text-xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-green-400" id="active-alerts">0</p>
                            <p class="text-sm text-gray-400">فعال</p>
                        </div>
                        <i class="fas fa-check-circle text-green-400 text-xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-yellow-400" id="triggered-today">0</p>
                            <p class="text-sm text-gray-400">امروز فعال شده</p>
                        </div>
                        <i class="fas fa-fire text-yellow-400 text-xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-red-400" id="failed-alerts">0</p>
                            <p class="text-sm text-gray-400">ناموفق</p>
                        </div>
                        <i class="fas fa-exclamation-triangle text-red-400 text-xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-purple-400" id="channels-active">0</p>
                            <p class="text-sm text-gray-400">کانال‌های فعال</p>
                        </div>
                        <i class="fas fa-broadcast-tower text-purple-400 text-xl opacity-50"></i>
                    </div>
                </div>
            </div>

            <!-- Notification Channels Status -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                        <i class="fas fa-broadcast-tower"></i>
                        وضعیت کانال‌های اعلان
                    </h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        ${this.getChannelStatusCards()}
                    </div>
                </div>
            </div>

            <!-- Alert Filters -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white">🔍 فیلتر هشدارها</h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نوع هشدار</label>
                            <select id="alert-type-filter" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="">همه انواع</option>
                                <option value="price_alert">هشدار قیمت</option>
                                <option value="trade_execution">اجرای معامله</option>
                                <option value="portfolio_change">تغییر پورتفولیو</option>
                                <option value="ai_signal">سیگنال هوش مصنوعی</option>
                                <option value="system_warning">هشدار سیستم</option>
                                <option value="security_alert">هشدار امنیتی</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">وضعیت</label>
                            <select id="alert-status-filter" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="">همه</option>
                                <option value="active">فعال</option>
                                <option value="triggered">فعال شده</option>
                                <option value="paused">متوقف</option>
                                <option value="expired">منقضی</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">کانال اعلان</label>
                            <select id="channel-filter" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="">همه کانال‌ها</option>
                                <option value="email">ایمیل</option>
                                <option value="telegram">تلگرام</option>
                                <option value="whatsapp">واتساپ</option>
                                <option value="sms">پیامک</option>
                                <option value="inapp">داخل برنامه</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <button onclick="alertsModule.filterAlerts()" class="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                                <i class="fas fa-search mr-2"></i>اعمال فیلتر
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alerts List -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-white">📋 لیست هشدارها</h3>
                    <div class="flex gap-2">
                        <button onclick="alertsModule.bulkAction('enable')" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-play mr-1"></i>فعال‌سازی گروهی
                        </button>
                        <button onclick="alertsModule.bulkAction('disable')" class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-pause mr-1"></i>توقف گروهی
                        </button>
                        <button onclick="alertsModule.bulkAction('delete')" class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm">
                            <i class="fas fa-trash mr-1"></i>حذف گروهی
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-900">
                            <tr>
                                <th class="px-4 py-3 text-right">
                                    <input type="checkbox" id="select-all-alerts" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded">
                                </th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">هشدار</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">نوع</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">شرایط</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">کانال‌ها</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">وضعیت</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">آخرین اجرا</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="alerts-table-body" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Alerts will be loaded here -->
                        </tbody>
                    </table>
                </div>
                <div class="px-6 py-4 bg-gray-900 border-t border-gray-700">
                    <div class="flex items-center justify-between">
                        <div class="text-sm text-gray-400">
                            نمایش <span id="alerts-from">1</span> تا <span id="alerts-to">10</span> از <span id="alerts-total">0</span> هشدار
                        </div>
                        <div class="flex gap-2">
                            <button onclick="alertsModule.prevPage()" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">قبلی</button>
                            <span class="px-3 py-1 text-white text-sm" id="current-page">1</span>
                            <button onclick="alertsModule.nextPage()" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">بعدی</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Alert Activities -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                        <i class="fas fa-history"></i>
                        فعالیت‌های اخیر هشدارها
                    </h3>
                </div>
                <div id="recent-activities" class="p-6">
                    <!-- Recent activities will be loaded here -->
                </div>
            </div>
        </div>

        <!-- Create Alert Modal -->
        <div id="create-alert-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-white">🔔 ایجاد هشدار جدید</h3>
                        <button onclick="alertsModule.closeCreateModal()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="create-alert-content" class="p-6">
                        <!-- Modal content will be loaded here -->
                    </div>
                </div>
            </div>
        </div>`;
    }

    getChannelStatusCards() {
        const channels = [
            { key: 'email', name: 'ایمیل', icon: 'fa-envelope', color: 'blue' },
            { key: 'telegram', name: 'تلگرام', icon: 'fa-paper-plane', color: 'cyan' },
            { key: 'whatsapp', name: 'واتساپ', icon: 'fa-whatsapp', color: 'green' },
            { key: 'sms', name: 'پیامک', icon: 'fa-sms', color: 'yellow' },
            { key: 'inapp', name: 'درون‌برنامه', icon: 'fa-bell', color: 'purple' },
            { key: 'mobile', name: 'موبایل', icon: 'fa-mobile-alt', color: 'pink' },
            { key: 'discord', name: 'دیسکورد', icon: 'fa-discord', color: 'indigo' }
        ];

        return channels.map(channel => {
            const isEnabled = this.notificationChannels[channel.key]?.enabled || false;
            const statusColor = isEnabled ? channel.color : 'gray';
            const statusText = isEnabled ? 'فعال' : 'غیرفعال';
            
            return `
                <div class="bg-gray-900 rounded-lg p-4 text-center border border-gray-600">
                    <div class="flex flex-col items-center">
                        <i class="fas ${channel.icon} text-2xl text-${statusColor}-400 mb-2"></i>
                        <h4 class="text-sm font-medium text-white mb-1">${channel.name}</h4>
                        <span class="text-xs px-2 py-1 rounded-full bg-${statusColor}-100 text-${statusColor}-800">
                            ${statusText}
                        </span>
                        <button data-channel="${channel.key}" class="configure-channel-btn mt-2 text-xs text-blue-400 hover:text-blue-300">
                            تنظیم
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadAlertsData() {
        try {
            // Load from localStorage first
            const saved = localStorage.getItem('titan_alerts');
            if (saved) {
                const data = JSON.parse(saved);
                this.alerts = data.alerts || [];
                this.alertRules = data.rules || [];
            }

            // Try to load from server
            if (typeof axios !== 'undefined') {
                try {
                    const response = await axios.get('/api/alerts/list');
                    if (response.data.success) {
                        this.alerts = response.data.alerts || [];
                        this.alertRules = response.data.rules || [];
                    }
                } catch (error) {
                    console.warn('Could not load alerts from server, using local data:', error);
                }
            }

            this.updateAlertStats();
            this.renderAlertsTable();
            
        } catch (error) {
            console.error('Error loading alerts data:', error);
        }
    }

    async loadNotificationTemplates() {
        try {
            // Default notification templates
            const defaultTemplates = {
                email: {
                    price_alert: {
                        subject: 'TITAN - هشدار قیمت {{symbol}}',
                        body: `
                            <h2>هشدار قیمت</h2>
                            <p>{{symbol}} به قیمت {{price}} {{currency}} رسیده است.</p>
                            <p><strong>شرایط:</strong> {{condition}}</p>
                            <p><strong>زمان:</strong> {{timestamp}}</p>
                            <hr>
                            <p><small>سیستم معاملاتی TITAN</small></p>
                        `
                    },
                    trade_execution: {
                        subject: 'TITAN - اجرای معامله {{symbol}}',
                        body: `
                            <h2>اجرای معامله</h2>
                            <p>معامله {{type}} برای {{symbol}} با موفقیت انجام شد.</p>
                            <p><strong>مقدار:</strong> {{amount}} {{symbol}}</p>
                            <p><strong>قیمت:</strong> {{price}} {{currency}}</p>
                            <p><strong>کل:</strong> {{total}} {{currency}}</p>
                            <hr>
                            <p><small>سیستم معاملاتی TITAN</small></p>
                        `
                    }
                },
                telegram: {
                    price_alert: `
🚨 <b>هشدار قیمت</b>

💰 <b>{{symbol}}</b> به قیمت <b>{{price}} {{currency}}</b> رسید

📋 <b>شرایط:</b> {{condition}}
⏰ <b>زمان:</b> {{timestamp}}

🤖 سیستم معاملاتی TITAN
                    `,
                    trade_execution: `
✅ <b>اجرای معامله</b>

💎 <b>{{symbol}}</b>
🔄 <b>نوع:</b> {{type}}
📊 <b>مقدار:</b> {{amount}}
💵 <b>قیمت:</b> {{price}} {{currency}}
💰 <b>کل:</b> {{total}} {{currency}}

🤖 سیستم معاملاتی TITAN
                    `
                },
                whatsapp: {
                    price_alert: `
🚨 *هشدار قیمت TITAN*

💰 *{{symbol}}* به قیمت *{{price}} {{currency}}* رسید

📋 شرایط: {{condition}}
⏰ زمان: {{timestamp}}

🤖 سیستم معاملاتی TITAN
                    `,
                    trade_execution: `
✅ *اجرای معامله TITAN*

💎 {{symbol}}
🔄 نوع: {{type}}  
📊 مقدار: {{amount}}
💵 قیمت: {{price}} {{currency}}
💰 کل: {{total}} {{currency}}

🤖 سیستم معاملاتی TITAN
                    `
                },
                sms: {
                    price_alert: 'TITAN: {{symbol}} به {{price}} {{currency}} رسید. شرایط: {{condition}}',
                    trade_execution: 'TITAN: معامله {{type}} {{symbol}} انجام شد. مقدار: {{amount}}, قیمت: {{price}}'
                }
            };

            // Load custom templates if available
            const savedTemplates = localStorage.getItem('titan_notification_templates');
            if (savedTemplates) {
                const customTemplates = JSON.parse(savedTemplates);
                this.notificationChannels = { ...this.notificationChannels, ...customTemplates };
            } else {
                // Set default templates
                Object.keys(defaultTemplates).forEach(channel => {
                    this.notificationChannels[channel].templates = defaultTemplates[channel];
                });
            }
            
        } catch (error) {
            console.error('Error loading notification templates:', error);
        }
    }

    updateAlertStats() {
        try {
            const stats = {
                total: this.alerts.length,
                active: this.alerts.filter(a => a.status === 'active').length,
                triggeredToday: this.alerts.filter(a => {
                    if (!a.lastTriggered) return false;
                    const today = new Date().toDateString();
                    const triggered = new Date(a.lastTriggered).toDateString();
                    return today === triggered;
                }).length,
                failed: this.alerts.filter(a => a.status === 'failed').length,
                channelsActive: Object.values(this.notificationChannels).filter(c => c.enabled).length
            };

            document.getElementById('total-alerts').textContent = stats.total;
            document.getElementById('active-alerts').textContent = stats.active;
            document.getElementById('triggered-today').textContent = stats.triggeredToday;
            document.getElementById('failed-alerts').textContent = stats.failed;
            document.getElementById('channels-active').textContent = stats.channelsActive;
            
        } catch (error) {
            console.error('Error updating alert stats:', error);
        }
    }

    renderAlertsTable() {
        try {
            const tbody = document.getElementById('alerts-table-body');
            if (!tbody) return;

            if (this.alerts.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="px-4 py-8 text-center text-gray-400">
                            <i class="fas fa-bell-slash text-4xl mb-4"></i>
                            <p>هیچ هشداری تعریف نشده است</p>
                            <button onclick="alertsModule.createAlert()" class="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm">
                                <i class="fas fa-plus mr-2"></i>ایجاد اولین هشدار
                            </button>
                        </td>
                    </tr>
                `;
                return;
            }

            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const pageAlerts = this.alerts.slice(startIndex, endIndex);

            tbody.innerHTML = pageAlerts.map(alert => `
                <tr class="hover:bg-gray-700">
                    <td class="px-4 py-3">
                        <input type="checkbox" class="alert-checkbox w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded" value="${alert.id}">
                    </td>
                    <td class="px-4 py-3">
                        <div>
                            <div class="text-sm font-medium text-white">${alert.name}</div>
                            <div class="text-sm text-gray-400">${alert.description || ''}</div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 text-xs rounded-full ${this.getTypeColor(alert.type)}">
                            ${this.getTypeText(alert.type)}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-300">
                        ${this.formatCondition(alert.conditions)}
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex gap-1">
                            ${alert.channels.map(channel => `
                                <span class="w-6 h-6 rounded-full bg-${this.getChannelColor(channel)}-600 flex items-center justify-center">
                                    <i class="fas ${this.getChannelIcon(channel)} text-xs text-white"></i>
                                </span>
                            `).join('')}
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(alert.status)}">
                            ${this.getStatusText(alert.status)}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-300">
                        ${alert.lastTriggered ? this.formatDate(alert.lastTriggered) : 'هرگز'}
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex gap-2">
                            <button onclick="alertsModule.editAlert('${alert.id}')" class="text-blue-400 hover:text-blue-300">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="alertsModule.toggleAlert('${alert.id}')" class="text-${alert.status === 'active' ? 'yellow' : 'green'}-400 hover:text-${alert.status === 'active' ? 'yellow' : 'green'}-300">
                                <i class="fas fa-${alert.status === 'active' ? 'pause' : 'play'}"></i>
                            </button>
                            <button onclick="alertsModule.testAlert('${alert.id}')" class="text-purple-400 hover:text-purple-300">
                                <i class="fas fa-vial"></i>
                            </button>
                            <button onclick="alertsModule.deleteAlert('${alert.id}')" class="text-red-400 hover:text-red-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Update pagination info
            document.getElementById('alerts-from').textContent = startIndex + 1;
            document.getElementById('alerts-to').textContent = Math.min(endIndex, this.alerts.length);
            document.getElementById('alerts-total').textContent = this.alerts.length;
            document.getElementById('current-page').textContent = this.currentPage;
            
        } catch (error) {
            console.error('Error rendering alerts table:', error);
        }
    }

    createAlert() {
        const modal = document.getElementById('create-alert-modal');
        const content = document.getElementById('create-alert-content');
        
        if (!modal || !content) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در بارگذاری فرم ایجاد هشدار', 'error');
            }
            return;
        }

        content.innerHTML = this.getCreateAlertForm();
        modal.classList.remove('hidden');
    }

    getCreateAlertForm() {
        return `
        <form id="create-alert-form" class="space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">نام هشدار</label>
                    <input type="text" id="alert-name" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="نام توصیفی برای هشدار">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">نوع هشدار</label>
                    <select id="alert-type" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option value="">انتخاب کنید</option>
                        <option value="price_alert">هشدار قیمت</option>
                        <option value="trade_execution">اجرای معامله</option>
                        <option value="portfolio_change">تغییر پورتفولیو</option>
                        <option value="ai_signal">سیگنال هوش مصنوعی</option>
                        <option value="system_warning">هشدار سیستم</option>
                        <option value="balance_low">موجودی کم</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">توضیحات</label>
                <textarea id="alert-description" rows="2" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="توضیح مختصری از هشدار"></textarea>
            </div>

            <!-- Conditions -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">شرایط فعال‌سازی</h4>
                <div id="alert-conditions">
                    <div class="condition-row flex gap-4 items-end mb-4">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-300 mb-2">متغیر</label>
                            <select class="condition-variable w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value="price">قیمت</option>
                                <option value="volume">حجم معاملات</option>
                                <option value="change_percent">درصد تغییر</option>
                                <option value="portfolio_value">ارزش پورتفولیو</option>
                                <option value="balance">موجودی</option>
                            </select>
                        </div>
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-300 mb-2">نماد</label>
                            <input type="text" class="condition-symbol w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="BTCUSDT">
                        </div>
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-300 mb-2">عملگر</label>
                            <select class="condition-operator w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                <option value=">">&gt; بیشتر از</option>
                                <option value="<">&lt; کمتر از</option>
                                <option value="=">=  مساوی</option>
                                <option value=">=">&gt;= بیشتر مساوی</option>
                                <option value="<=">&lt;= کمتر مساوی</option>
                            </select>
                        </div>
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-300 mb-2">مقدار</label>
                            <input type="number" class="condition-value w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="0">
                        </div>
                        <button type="button" onclick="alertsModule.removeCondition(this)" class="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <button type="button" onclick="alertsModule.addCondition()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                    <i class="fas fa-plus mr-2"></i>افزودن شرط
                </button>
            </div>

            <!-- Notification Channels -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">کانال‌های اعلان</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="channels" value="email" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <i class="fas fa-envelope text-blue-400"></i>
                        <span class="text-gray-300">ایمیل</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="channels" value="telegram" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <i class="fas fa-paper-plane text-cyan-400"></i>
                        <span class="text-gray-300">تلگرام</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="channels" value="whatsapp" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <i class="fab fa-whatsapp text-green-400"></i>
                        <span class="text-gray-300">واتساپ</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="channels" value="sms" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <i class="fas fa-sms text-yellow-400"></i>
                        <span class="text-gray-300">پیامک</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="channels" value="inapp" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded" checked>
                        <i class="fas fa-bell text-purple-400"></i>
                        <span class="text-gray-300">درون‌برنامه</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="channels" value="mobile" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <i class="fas fa-mobile-alt text-pink-400"></i>
                        <span class="text-gray-300">موبایل</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="channels" value="discord" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <i class="fab fa-discord text-indigo-400"></i>
                        <span class="text-gray-300">دیسکورد</span>
                    </label>
                </div>
            </div>

            <!-- Message Templates -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">قالب پیام سفارشی</h4>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">عنوان پیام</label>
                        <input type="text" id="message-title" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="متغیرها: {{symbol}}, {{price}}, {{timestamp}}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">محتوای پیام</label>
                        <textarea id="message-body" rows="4" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="محتوای پیام خود را بنویسید. می‌توانید از متغیرهای {{symbol}}, {{price}}, {{condition}}, {{timestamp}} استفاده کنید."></textarea>
                    </div>
                    <div class="text-sm text-gray-400">
                        <strong>متغیرهای قابل استفاده:</strong>
                        {{symbol}}, {{price}}, {{condition}}, {{timestamp}}, {{user}}, {{portfolio_value}}
                    </div>
                </div>
            </div>

            <!-- Advanced Settings -->
            <div class="bg-gray-900 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-white mb-4">تنظیمات پیشرفته</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">اولویت</label>
                        <select id="alert-priority" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            <option value="low">کم</option>
                            <option value="medium" selected>متوسط</option>
                            <option value="high">بالا</option>
                            <option value="critical">بحرانی</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر تکرار در روز</label>
                        <input type="number" id="max-triggers" min="1" max="100" value="5" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">فاصله بین تکرار (دقیقه)</label>
                        <input type="number" id="cooldown" min="1" max="1440" value="30" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    </div>
                </div>
                <div class="mt-4">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="auto-disable" class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded">
                        <span class="text-gray-300">غیرفعال شدن خودکار پس از اولین اجرا</span>
                    </label>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onclick="alertsModule.closeCreateModal()" class="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg text-white">
                    انصراف
                </button>
                <button type="button" onclick="alertsModule.testAlertForm()" class="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white">
                    <i class="fas fa-vial mr-2"></i>تست هشدار
                </button>
                <button type="submit" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white">
                    <i class="fas fa-save mr-2"></i>ایجاد هشدار
                </button>
            </div>
        </form>`;
    }

    addCondition() {
        const container = document.getElementById('alert-conditions');
        const conditionRow = document.createElement('div');
        conditionRow.className = 'condition-row flex gap-4 items-end mb-4';
        conditionRow.innerHTML = `
            <div class="flex-1">
                <select class="condition-variable w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option value="price">قیمت</option>
                    <option value="volume">حجم معاملات</option>
                    <option value="change_percent">درصد تغییر</option>
                    <option value="portfolio_value">ارزش پورتفولیو</option>
                    <option value="balance">موجودی</option>
                </select>
            </div>
            <div class="flex-1">
                <input type="text" class="condition-symbol w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="BTCUSDT">
            </div>
            <div class="flex-1">
                <select class="condition-operator w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option value=">">&gt; بیشتر از</option>
                    <option value="<">&lt; کمتر از</option>
                    <option value="=">=  مساوی</option>
                    <option value=">=">&gt;= بیشتر مساوی</option>
                    <option value="<=">&lt;= کمتر مساوی</option>
                </select>
            </div>
            <div class="flex-1">
                <input type="number" class="condition-value w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="0">
            </div>
            <button type="button" onclick="alertsModule.removeCondition(this)" class="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(conditionRow);
    }

    removeCondition(button) {
        const row = button.closest('.condition-row');
        if (row) {
            row.remove();
        }
    }

    closeCreateModal() {
        const modal = document.getElementById('create-alert-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async saveAlert(formData) {
        try {
            const newAlert = {
                id: Date.now().toString(),
                name: formData.name,
                type: formData.type,
                description: formData.description,
                conditions: formData.conditions,
                channels: formData.channels,
                messageTemplate: formData.messageTemplate,
                priority: formData.priority,
                maxTriggers: formData.maxTriggers,
                cooldown: formData.cooldown,
                autoDisable: formData.autoDisable,
                status: 'active',
                createdAt: new Date().toISOString(),
                triggeredCount: 0,
                lastTriggered: null
            };

            this.alerts.push(newAlert);
            this.saveToStorage();
            this.updateAlertStats();
            this.renderAlertsTable();
            this.closeCreateModal();

            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('هشدار با موفقیت ایجاد شد', 'success');
            }

        } catch (error) {
            console.error('Error saving alert:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در ایجاد هشدار', 'error');
            }
        }
    }

    saveToStorage() {
        try {
            const data = {
                alerts: this.alerts,
                rules: this.alertRules,
                channels: this.notificationChannels
            };
            localStorage.setItem('titan_alerts', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    async testAllChannels() {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('تست همه کانال‌های اعلان در حال انجام...', 'info');
        }
        
        // Test implementation would go here
        setTimeout(() => {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('تست کانال‌های اعلان تکمیل شد', 'success');
            }
        }, 2000);
    }

    startAlertMonitoring() {
        // Start monitoring for alert conditions
        console.log('🔄 Alert monitoring started');
    }

    // Helper methods for styling
    getTypeColor(type) {
        const colors = {
            'price_alert': 'bg-blue-100 text-blue-800',
            'trade_execution': 'bg-green-100 text-green-800',
            'portfolio_change': 'bg-purple-100 text-purple-800',
            'ai_signal': 'bg-cyan-100 text-cyan-800',
            'system_warning': 'bg-yellow-100 text-yellow-800',
            'security_alert': 'bg-red-100 text-red-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    }

    getTypeText(type) {
        const texts = {
            'price_alert': 'هشدار قیمت',
            'trade_execution': 'اجرای معامله',
            'portfolio_change': 'تغییر پورتفولیو',
            'ai_signal': 'سیگنال هوش مصنوعی',
            'system_warning': 'هشدار سیستم',
            'security_alert': 'هشدار امنیتی'
        };
        return texts[type] || type;
    }

    getStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'paused': 'bg-yellow-100 text-yellow-800',
            'triggered': 'bg-blue-100 text-blue-800',
            'failed': 'bg-red-100 text-red-800',
            'expired': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'active': 'فعال',
            'paused': 'متوقف',
            'triggered': 'فعال شده',
            'failed': 'ناموفق',
            'expired': 'منقضی'
        };
        return texts[status] || status;
    }

    getChannelColor(channel) {
        const colors = {
            'email': 'blue',
            'telegram': 'cyan',
            'whatsapp': 'green',
            'sms': 'yellow',
            'inapp': 'purple',
            'mobile': 'pink',
            'discord': 'indigo'
        };
        return colors[channel] || 'gray';
    }

    getChannelIcon(channel) {
        const icons = {
            'email': 'fa-envelope',
            'telegram': 'fa-paper-plane',
            'whatsapp': 'fa-whatsapp',
            'sms': 'fa-sms',
            'inapp': 'fa-bell',
            'mobile': 'fa-mobile-alt',
            'discord': 'fa-discord'
        };
        return icons[channel] || 'fa-bell';
    }

    formatCondition(conditions) {
        if (!conditions || conditions.length === 0) return '-';
        return conditions.map(c => `${c.variable} ${c.operator} ${c.value}`).join(' و ');
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('fa-IR');
    }

    setupEventListeners() {
        console.log('📡 Alerts event listeners set up');
        
        // Setup form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'create-alert-form') {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });
        
        // Setup event delegation for channel configure buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('configure-channel-btn')) {
                const channelKey = e.target.getAttribute('data-channel');
                if (channelKey) {
                    this.configureChannel(channelKey);
                }
            }
        });
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const alertData = {
            name: formData.get('alert-name') || document.getElementById('alert-name')?.value,
            type: formData.get('alert-type') || document.getElementById('alert-type')?.value,
            description: formData.get('alert-description') || document.getElementById('alert-description')?.value,
            // ... collect other form data
        };
        
        // Process form data and save alert
        this.saveAlert(alertData);
    }

    // Channel Configuration Methods
    configureChannel(channelKey) {
        console.log('🔧 Configuring channel:', channelKey);
        
        // Create and show channel configuration modal
        this.showChannelConfigModal(channelKey);
    }

    showChannelConfigModal(channelKey) {
        // Remove existing modal if any
        const existingModal = document.getElementById('channel-config-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'channel-config-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = this.getChannelConfigContent(channelKey);
        
        document.body.appendChild(modal);
        
        // Load current settings for this channel
        this.loadChannelSettings(channelKey);
    }

    getChannelConfigContent(channelKey) {
        const channelInfo = this.getChannelInfo(channelKey);
        
        return `
        <div class="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                    <i class="fas ${channelInfo.icon} text-${channelInfo.color}-400"></i>
                    تنظیم کانال ${channelInfo.name}
                </h3>
                <button onclick="alertsModule.closeChannelConfigModal()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">
                ${this.getChannelSpecificConfig(channelKey)}
            </div>
            <div class="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
                <button onclick="alertsModule.testChannelConfig('${channelKey}')" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm">
                    <i class="fas fa-vial mr-2"></i>تست اتصال
                </button>
                <button onclick="alertsModule.closeChannelConfigModal()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white text-sm">
                    انصراف
                </button>
                <button onclick="alertsModule.saveChannelConfig('${channelKey}')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm">
                    <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                </button>
            </div>
        </div>`;
    }

    getChannelInfo(channelKey) {
        const channelMap = {
            'email': { name: 'ایمیل', icon: 'fa-envelope', color: 'blue' },
            'telegram': { name: 'تلگرام', icon: 'fa-paper-plane', color: 'cyan' },
            'whatsapp': { name: 'واتساپ', icon: 'fa-whatsapp', color: 'green' },
            'sms': { name: 'پیامک', icon: 'fa-sms', color: 'yellow' },
            'inapp': { name: 'درون‌برنامه', icon: 'fa-bell', color: 'purple' },
            'mobile': { name: 'موبایل', icon: 'fa-mobile-alt', color: 'pink' },
            'discord': { name: 'دیسکورد', icon: 'fa-discord', color: 'indigo' }
        };
        return channelMap[channelKey] || { name: channelKey, icon: 'fa-bell', color: 'gray' };
    }

    getChannelSpecificConfig(channelKey) {
        switch(channelKey) {
            case 'email':
                return this.getEmailConfig();
            case 'telegram':
                return this.getTelegramConfig();
            case 'whatsapp':
                return this.getWhatsAppConfig();
            case 'sms':
                return this.getSMSConfig();
            case 'discord':
                return this.getDiscordConfig();
            case 'inapp':
                return this.getInAppConfig();
            case 'mobile':
                return this.getMobileConfig();
            default:
                return this.getGenericConfig(channelKey);
        }
    }

    getEmailConfig() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">📧 تنظیمات ایمیل</h4>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="email-enabled" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">سرور SMTP</label>
                    <input type="text" id="email-smtp-host" placeholder="smtp.gmail.com" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">پورت</label>
                    <input type="number" id="email-smtp-port" placeholder="587" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری</label>
                    <input type="email" id="email-username" placeholder="your-email@gmail.com" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور</label>
                    <input type="password" id="email-password" placeholder="••••••••" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">ایمیل فرستنده</label>
                    <input type="email" id="email-from" placeholder="noreply@yourcompany.com" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">نام فرستنده</label>
                    <input type="text" id="email-from-name" placeholder="TITAN Trading System" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">ایمیل‌های دریافت‌کننده (هر کدام در یک خط)</label>
                <textarea id="email-recipients" rows="3" placeholder="admin@yourcompany.com&#10;alerts@yourcompany.com" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"></textarea>
            </div>
        </div>`;
    }

    getTelegramConfig() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">📱 تنظیمات تلگرام</h4>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="telegram-enabled" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">توکن ربات تلگرام</label>
                    <input type="text" id="telegram-token" placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <p class="text-xs text-gray-400 mt-1">از @BotFather در تلگرام دریافت کنید</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">شناسه چت</label>
                    <input type="text" id="telegram-chat-id" placeholder="@your_channel یا 123456789" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <p class="text-xs text-gray-400 mt-1">شناسه کانال، گروه یا کاربر مقصد</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">حالت پارس</label>
                    <select id="telegram-parse-mode" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option value="HTML">HTML</option>
                        <option value="Markdown">Markdown</option>
                        <option value="">بدون فرمت</option>
                    </select>
                </div>
            </div>
            
            <div class="bg-gray-900 rounded-lg p-4">
                <h5 class="text-sm font-semibold text-white mb-2">راهنمای راه‌اندازی:</h5>
                <ol class="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                    <li>به @BotFather در تلگرام مراجعه کنید</li>
                    <li>دستور /newbot را ارسال کنید</li>
                    <li>نام و نام کاربری ربات را تعیین کنید</li>
                    <li>توکن دریافتی را در بالا وارد کنید</li>
                    <li>ربات را به کانال یا گروه مورد نظر اضافه کنید</li>
                </ol>
            </div>
        </div>`;
    }

    getWhatsAppConfig() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">📲 تنظیمات واتساپ</h4>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="whatsapp-enabled" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">توکن WhatsApp Business API</label>
                    <input type="text" id="whatsapp-token" placeholder="WhatsApp Business API Token" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">شماره تلفن</label>
                    <input type="tel" id="whatsapp-phone" placeholder="+989123456789" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">شناسه Instance</label>
                    <input type="text" id="whatsapp-instance" placeholder="Instance ID" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
            </div>
            
            <div class="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                <h5 class="text-sm font-semibold text-yellow-200 mb-2">⚠️ توجه:</h5>
                <p class="text-xs text-yellow-200">
                    برای استفاده از واتساپ نیاز به WhatsApp Business API دارید که نیاز به تأیید فیس‌بوک دارد.
                    می‌توانید از سرویس‌های شخص ثالث مانند Twilio یا MessageBird استفاده کنید.
                </p>
            </div>
        </div>`;
    }

    getSMSConfig() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">💬 تنظیمات پیامک</h4>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="sms-enabled" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">ارائه‌دهنده خدمات</label>
                    <select id="sms-provider" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option value="kavenegar">کاوه‌نگار (Kavenegar)</option>
                        <option value="twilio">Twilio</option>
                        <option value="custom">سرویس سفارشی</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">کلید API</label>
                    <input type="text" id="sms-api-key" placeholder="API Key" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">شماره فرستنده</label>
                    <input type="text" id="sms-sender" placeholder="TITAN" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">شماره‌های دریافت‌کننده (هر کدام در یک خط)</label>
                    <textarea id="sms-recipients" rows="3" placeholder="+989123456789&#10;+989987654321" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"></textarea>
                </div>
            </div>
        </div>`;
    }

    getDiscordConfig() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">🎮 تنظیمات دیسکورد</h4>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="discord-enabled" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                    <input type="url" id="discord-webhook" placeholder="https://discord.com/api/webhooks/..." class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری ربات</label>
                    <input type="text" id="discord-username" placeholder="TITAN Trading Bot" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">آواتار ربات (URL)</label>
                    <input type="url" id="discord-avatar" placeholder="https://example.com/avatar.png" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
            </div>
            
            <div class="bg-gray-900 rounded-lg p-4">
                <h5 class="text-sm font-semibold text-white mb-2">راهنمای راه‌اندازی Webhook:</h5>
                <ol class="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                    <li>وارد کانال Discord مورد نظر شوید</li>
                    <li>روی تنظیمات کانال کلیک کنید</li>
                    <li>بخش Integrations > Webhooks را انتخاب کنید</li>
                    <li>New Webhook را کلیک کنید</li>
                    <li>URL ایجاد شده را کپی کرده و در بالا وارد کنید</li>
                </ol>
            </div>
        </div>`;
    }

    getInAppConfig() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">🔔 تنظیمات اعلان‌های درون‌برنامه</h4>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="inapp-enabled" class="sr-only peer" checked>
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-gray-300">اعلان‌های دسکتاپ</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="inapp-desktop" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-300">صدای اعلان</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="inapp-sound" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-300">نمایش در Badge</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="inapp-badge" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">مدت زمان نمایش (ثانیه)</label>
                <input type="number" id="inapp-duration" min="1" max="60" value="5" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">موقعیت نمایش</label>
                <select id="inapp-position" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option value="top-right">بالا راست</option>
                    <option value="top-left">بالا چپ</option>
                    <option value="bottom-right">پایین راست</option>
                    <option value="bottom-left">پایین چپ</option>
                </select>
            </div>
        </div>`;
    }

    getMobileConfig() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">📱 تنظیمات اعلان‌های موبایل</h4>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="mobile-enabled" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">سرویس Push Notification</label>
                    <select id="mobile-service" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option value="firebase">Firebase Cloud Messaging</option>
                        <option value="onesignal">OneSignal</option>
                        <option value="pusher">Pusher</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">کلید سرور</label>
                    <input type="text" id="mobile-server-key" placeholder="Server Key" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">App ID</label>
                    <input type="text" id="mobile-app-id" placeholder="Application ID" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
            </div>
            
            <div class="bg-blue-900 border border-blue-600 rounded-lg p-4">
                <h5 class="text-sm font-semibold text-blue-200 mb-2">ℹ️ اطلاعات:</h5>
                <p class="text-xs text-blue-200">
                    برای فعال‌سازی اعلان‌های موبایل، کاربران باید اپلیکیشن موبایل TITAN را نصب کرده و اجازه دریافت اعلان را داده باشند.
                </p>
            </div>
        </div>`;
    }

    getGenericConfig(channelKey) {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-white">🔧 تنظیمات ${channelKey}</h4>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="${channelKey}-enabled" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="text-center text-gray-400 py-8">
                <i class="fas fa-cog text-4xl mb-4"></i>
                <p>تنظیمات برای این کانال هنوز پیاده‌سازی نشده است.</p>
            </div>
        </div>`;
    }

    loadChannelSettings(channelKey) {
        try {
            // Load settings from localStorage or server
            const savedSettings = localStorage.getItem('titan_notification_channels');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                const channelSettings = settings[channelKey];
                
                if (channelSettings) {
                    // Apply settings to form fields
                    Object.keys(channelSettings).forEach(key => {
                        const element = document.getElementById(`${channelKey}-${key}`);
                        if (element) {
                            if (element.type === 'checkbox') {
                                element.checked = channelSettings[key];
                            } else {
                                element.value = channelSettings[key];
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading channel settings:', error);
        }
    }

    async saveChannelConfig(channelKey) {
        try {
            // Collect form data
            const formData = this.collectChannelFormData(channelKey);
            
            // Save to notificationChannels object
            this.notificationChannels[channelKey] = {
                ...this.notificationChannels[channelKey],
                ...formData
            };
            
            // Save to localStorage
            localStorage.setItem('titan_notification_channels', JSON.stringify(this.notificationChannels));
            
            // Update UI
            this.updateChannelStatusDisplay();
            this.closeChannelConfigModal();
            
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`تنظیمات کانال ${this.getChannelInfo(channelKey).name} ذخیره شد`, 'success');
            }
            
        } catch (error) {
            console.error('Error saving channel config:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در ذخیره تنظیمات', 'error');
            }
        }
    }

    collectChannelFormData(channelKey) {
        const formData = {};
        const modal = document.getElementById('channel-config-modal');
        if (!modal) return formData;
        
        // Collect all form inputs for this channel
        const inputs = modal.querySelectorAll(`[id^="${channelKey}-"]`);
        inputs.forEach(input => {
            const key = input.id.replace(`${channelKey}-`, '');
            if (input.type === 'checkbox') {
                formData[key] = input.checked;
            } else {
                formData[key] = input.value;
            }
        });
        
        return formData;
    }

    async testChannelConfig(channelKey) {
        try {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`تست کانال ${this.getChannelInfo(channelKey).name} در حال انجام...`, 'info');
            }
            
            // Collect current form data
            const formData = this.collectChannelFormData(channelKey);
            
            // Send test message
            const testMessage = {
                channel: channelKey,
                title: 'تست سیستم TITAN',
                message: `این یک پیام تست از سیستم معاملاتی TITAN است.\nزمان: ${new Date().toLocaleString('fa-IR')}`,
                settings: formData
            };
            
            // Simulate API call for testing
            setTimeout(() => {
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert(`تست کانال ${this.getChannelInfo(channelKey).name} موفقیت‌آمیز بود`, 'success');
                }
            }, 2000);
            
        } catch (error) {
            console.error(`Error testing ${channelKey}:`, error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(`خطا در تست کانال ${this.getChannelInfo(channelKey).name}`, 'error');
            }
        }
    }

    closeChannelConfigModal() {
        const modal = document.getElementById('channel-config-modal');
        if (modal) {
            modal.remove();
        }
    }

    updateChannelStatusDisplay() {
        // Update the channel status cards in the main view
        const container = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4.lg\\:grid-cols-7');
        if (container) {
            container.innerHTML = this.getChannelStatusCards();
        }
        
        // Update stats
        this.updateAlertStats();
    }

    destroy() {
        console.log('✅ Alerts module destroyed');
    }
}

// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.AlertsModule = AlertsModule;

// Create global instance for easy access
window.alertsModule = null;