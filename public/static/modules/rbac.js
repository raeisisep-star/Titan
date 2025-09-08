// Feature 8: Role-Based Access Control (RBAC) Module
class RBACModule {
    constructor() {
        this.roles = this.getDefaultRoles();
        this.users = this.getDefaultUsers();
        this.permissions = this.getDefaultPermissions();
        this.accessLogs = [];
        this.currentUser = null;
        this.initialized = false;
        
        console.log('✅ RBAC Module constructor called');
    }

    getDefaultRoles() {
        return {
            super_admin: {
                id: 'super_admin',
                name: 'سوپر ادمین',
                description: 'دسترسی کامل به تمام بخش‌های سیستم',
                icon: '👑',
                color: 'bg-red-600',
                priority: 1,
                permissions: ['*'],
                users_count: 1,
                created_at: '2024-01-01',
                is_system: true
            },
            admin: {
                id: 'admin',
                name: 'مدیر سیستم',
                description: 'مدیریت کاربران، تنظیمات و نظارت عمومی',
                icon: '🔧',
                color: 'bg-orange-600',
                priority: 2,
                permissions: [
                    'users.manage',
                    'settings.view',
                    'settings.edit',
                    'trading.view',
                    'analytics.view',
                    'exchanges.view',
                    'exchanges.configure',
                    'alerts.manage',
                    'backup.manage'
                ],
                users_count: 2,
                created_at: '2024-01-01',
                is_system: true
            },
            trader: {
                id: 'trader',
                name: 'معامله‌گر',
                description: 'دسترسی به معاملات، پرتفولیو و تحلیل‌ها',
                icon: '💹',
                color: 'bg-green-600',
                priority: 3,
                permissions: [
                    'trading.view',
                    'trading.manual',
                    'portfolio.view',
                    'analytics.view',
                    'alerts.view',
                    'watchlist.manage',
                    'strategies.view',
                    'strategies.execute'
                ],
                users_count: 5,
                created_at: '2024-01-01',
                is_system: false
            },
            analyst: {
                id: 'analyst',
                name: 'تحلیل‌گر',
                description: 'دسترسی به داده‌ها، تحلیل‌ها و گزارش‌گیری',
                icon: '📊',
                color: 'bg-blue-600',
                priority: 4,
                permissions: [
                    'analytics.view',
                    'analytics.advanced',
                    'portfolio.view',
                    'trading.view',
                    'reports.generate',
                    'data.export',
                    'watchlist.view'
                ],
                users_count: 3,
                created_at: '2024-01-02',
                is_system: false
            },
            viewer: {
                id: 'viewer',
                name: 'مشاهده‌گر',
                description: 'دسترسی محدود به مشاهده اطلاعات عمومی',
                icon: '👁️',
                color: 'bg-gray-600',
                priority: 5,
                permissions: [
                    'dashboard.view',
                    'portfolio.view',
                    'analytics.basic',
                    'watchlist.view'
                ],
                users_count: 8,
                created_at: '2024-01-02',
                is_system: false
            },
            api_only: {
                id: 'api_only',
                name: 'دسترسی API',
                description: 'دسترسی فقط از طریق API برای سیستم‌های خارجی',
                icon: '🔌',
                color: 'bg-purple-600',
                priority: 6,
                permissions: [
                    'api.read',
                    'api.trading',
                    'webhook.receive'
                ],
                users_count: 2,
                created_at: '2024-01-03',
                is_system: false
            }
        };
    }

    getDefaultUsers() {
        return {
            admin_1: {
                id: 'admin_1',
                username: 'admin',
                email: 'admin@titan.com',
                full_name: 'مدیر اصلی سیستم',
                role_id: 'super_admin',
                status: 'active',
                last_login: new Date().toISOString(),
                login_count: 156,
                created_at: '2024-01-01',
                avatar: '👨‍💼',
                two_factor: true,
                api_access: true
            },
            manager_1: {
                id: 'manager_1',
                username: 'manager',
                email: 'manager@titan.com',
                full_name: 'مدیر عملیات',
                role_id: 'admin',
                status: 'active',
                last_login: new Date(Date.now() - 3600000).toISOString(),
                login_count: 89,
                created_at: '2024-01-01',
                avatar: '👩‍💼',
                two_factor: true,
                api_access: false
            },
            trader_1: {
                id: 'trader_1',
                username: 'trader_pro',
                email: 'trader1@titan.com',
                full_name: 'علی احمدی',
                role_id: 'trader',
                status: 'active',
                last_login: new Date(Date.now() - 1800000).toISOString(),
                login_count: 234,
                created_at: '2024-01-05',
                avatar: '🧑‍💼',
                two_factor: false,
                api_access: true
            },
            analyst_1: {
                id: 'analyst_1',
                username: 'data_analyst',
                email: 'analyst@titan.com',
                full_name: 'سارا محمدی',
                role_id: 'analyst',
                status: 'active',
                last_login: new Date(Date.now() - 7200000).toISOString(),
                login_count: 67,
                created_at: '2024-01-10',
                avatar: '👩‍🔬',
                two_factor: true,
                api_access: false
            },
            viewer_1: {
                id: 'viewer_1',
                username: 'guest_user',
                email: 'guest@titan.com',
                full_name: 'کاربر مهمان',
                role_id: 'viewer',
                status: 'inactive',
                last_login: new Date(Date.now() - 86400000).toISOString(),
                login_count: 12,
                created_at: '2024-01-15',
                avatar: '👤',
                two_factor: false,
                api_access: false
            }
        };
    }

    getDefaultPermissions() {
        return {
            // System Management
            'users.manage': 'مدیریت کاربران و نقش‌ها',
            'settings.view': 'مشاهده تنظیمات سیستم',
            'settings.edit': 'ویرایش تنظیمات سیستم',
            'system.maintenance': 'نگهداری و تعمیرات سیستم',
            'logs.view': 'مشاهده لاگ‌های سیستم',
            
            // Trading
            'trading.view': 'مشاهده اطلاعات معاملات',
            'trading.manual': 'انجام معاملات دستی',
            'trading.auto': 'مدیریت معاملات خودکار',
            'trading.advanced': 'ابزارهای پیشرفته معاملاتی',
            
            // Portfolio & Analytics
            'portfolio.view': 'مشاهده پرتفولیو',
            'portfolio.edit': 'ویرایش پرتفولیو',
            'analytics.view': 'مشاهده تحلیل‌ها',
            'analytics.basic': 'تحلیل‌های پایه',
            'analytics.advanced': 'تحلیل‌های پیشرفته',
            
            // Exchange Management
            'exchanges.view': 'مشاهده صرافی‌ها',
            'exchanges.configure': 'تنظیم صرافی‌ها',
            'exchanges.trading': 'معامله در صرافی‌ها',
            
            // Alerts & Notifications
            'alerts.view': 'مشاهده هشدارها',
            'alerts.manage': 'مدیریت هشدارها',
            'notifications.send': 'ارسال اطلاع‌رسانی',
            
            // Data & Reports
            'reports.generate': 'تولید گزارش‌ها',
            'data.export': 'خروجی داده‌ها',
            'data.import': 'ورودی داده‌ها',
            
            // Watchlist & Strategies
            'watchlist.view': 'مشاهده واچ‌لیست',
            'watchlist.manage': 'مدیریت واچ‌لیست',
            'strategies.view': 'مشاهده استراتژی‌ها',
            'strategies.execute': 'اجرای استراتژی‌ها',
            'strategies.create': 'ایجاد استراتژی‌ها',
            
            // API Access
            'api.read': 'خواندن از API',
            'api.write': 'نوشتن در API',
            'api.trading': 'معاملات از طریق API',
            'webhook.receive': 'دریافت Webhook',
            
            // Backup & Security
            'backup.manage': 'مدیریت پشتیبان‌گیری',
            'security.manage': 'مدیریت امنیت',
            'dashboard.view': 'مشاهده داشبورد'
        };
    }

    async initialize() {
        console.log('🔄 Initializing RBAC Module...');
        
        try {
            // Load current user session
            await this.loadCurrentUser();
            
            // Load custom roles and permissions
            await this.loadCustomRolesAndPermissions();
            
            // Initialize access logging
            this.initializeAccessLogging();
            
            // Generate sample access logs
            this.generateSampleLogs();
            
            this.initialized = true;
            console.log('✅ RBAC Module initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing RBAC Module:', error);
        }
    }

    async loadCurrentUser() {
        // Simulate loading current user
        this.currentUser = this.users.admin_1;
        console.log('👤 Current user loaded:', this.currentUser.full_name);
    }

    async loadCustomRolesAndPermissions() {
        // Load saved custom roles from storage
        const savedRoles = localStorage.getItem('titan_custom_roles');
        if (savedRoles) {
            try {
                const customRoles = JSON.parse(savedRoles);
                this.roles = { ...this.roles, ...customRoles };
                console.log('✅ Custom roles loaded');
            } catch (error) {
                console.warn('⚠️ Error loading custom roles:', error);
            }
        }
    }

    initializeAccessLogging() {
        // Initialize access logging system
        console.log('📝 Access logging initialized');
    }

    generateSampleLogs() {
        const actions = [
            'login', 'logout', 'view_dashboard', 'execute_trade', 'view_portfolio', 
            'configure_exchange', 'create_alert', 'generate_report', 'view_analytics'
        ];
        
        const statuses = ['success', 'failed', 'warning'];
        
        // Generate last 50 access logs
        for (let i = 0; i < 50; i++) {
            const userId = Object.keys(this.users)[Math.floor(Math.random() * Object.keys(this.users).length)];
            const user = this.users[userId];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            this.accessLogs.push({
                id: `log_${i}`,
                user_id: userId,
                username: user.username,
                action: action,
                status: status,
                ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                details: `${action} performed by ${user.full_name}`
            });
        }
        
        // Sort by timestamp (newest first)
        this.accessLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getContent() {
        return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-users-cog text-purple-400 mr-3"></i>
                        کنترل دسترسی مبتنی بر نقش
                    </h2>
                    <p class="text-gray-400 mt-1">مدیریت کاربران، نقش‌ها، مجوزها و لاگ‌های دسترسی</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="rbacModule.createUser()" 
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <i class="fas fa-user-plus"></i>کاربر جدید
                    </button>
                    <button onclick="rbacModule.createRole()" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <i class="fas fa-shield-alt"></i>نقش جدید
                    </button>
                </div>
            </div>

            <!-- RBAC Overview Stats -->
            ${this.getOverviewStats()}

            <!-- RBAC Tabs -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="flex border-b border-gray-700 overflow-x-auto" id="rbac-tabs">
                    <button onclick="rbacModule.switchRBACTab('roles')" 
                            class="rbac-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-blue-400 border-b-2 border-blue-400">
                        <i class="fas fa-shield-alt"></i>نقش‌ها و مجوزها
                    </button>
                    <button onclick="rbacModule.switchRBACTab('users')" 
                            class="rbac-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-gray-400 hover:text-white">
                        <i class="fas fa-users"></i>مدیریت کاربران
                    </button>
                    <button onclick="rbacModule.switchRBACTab('permissions')" 
                            class="rbac-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-gray-400 hover:text-white">
                        <i class="fas fa-key"></i>ماتریس مجوزها
                    </button>
                    <button onclick="rbacModule.switchRBACTab('logs')" 
                            class="rbac-tab px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 text-gray-400 hover:text-white">
                        <i class="fas fa-clipboard-list"></i>لاگ‌های دسترسی
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="p-6" id="rbac-tab-content">
                    ${this.getRolesTab()}
                </div>
            </div>
        </div>`;
    }

    getOverviewStats() {
        const totalUsers = Object.keys(this.users).length;
        const activeUsers = Object.values(this.users).filter(u => u.status === 'active').length;
        const totalRoles = Object.keys(this.roles).length;
        const recentLogins = this.accessLogs.filter(log => 
            log.action === 'login' && 
            Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000
        ).length;

        return `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-blue-600 rounded-lg">
                        <i class="fas fa-users text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">کل کاربران</p>
                        <p class="text-2xl font-bold text-white">${totalUsers}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-green-600 rounded-lg">
                        <i class="fas fa-user-check text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">کاربران فعال</p>
                        <p class="text-2xl font-bold text-white">${activeUsers}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-purple-600 rounded-lg">
                        <i class="fas fa-shield-alt text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">نقش‌ها</p>
                        <p class="text-2xl font-bold text-white">${totalRoles}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-orange-600 rounded-lg">
                        <i class="fas fa-sign-in-alt text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">ورود امروز</p>
                        <p class="text-2xl font-bold text-white">${recentLogins}</p>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getRolesTab() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-white">نقش‌ها و سطوح دسترسی</h3>
                <div class="text-sm text-gray-400">
                    ${Object.keys(this.roles).length} نقش تعریف شده
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                ${Object.values(this.roles).map(role => this.getRoleCard(role)).join('')}
            </div>
        </div>`;
    }

    getRoleCard(role) {
        const permissionCount = role.permissions.includes('*') ? 'همه' : role.permissions.length;
        
        return `
        <div class="bg-gray-900 rounded-lg border border-gray-700 p-4">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                    <div class="p-2 ${role.color} rounded-lg text-white mr-3">
                        ${role.icon}
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold text-white">${role.name}</h4>
                        <p class="text-xs text-gray-400">Priority: ${role.priority}</p>
                    </div>
                </div>
                ${role.is_system ? '<span class="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">سیستمی</span>' : ''}
            </div>
            
            <p class="text-sm text-gray-300 mb-4">${role.description}</p>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-400">کاربران:</span>
                    <span class="text-white">${role.users_count}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">مجوزها:</span>
                    <span class="text-white">${permissionCount}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">تاریخ ایجاد:</span>
                    <span class="text-white">${role.created_at}</span>
                </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-gray-700">
                <div class="flex gap-2">
                    <button onclick="rbacModule.viewRoleDetails('${role.id}')" 
                            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        جزئیات
                    </button>
                    ${!role.is_system ? 
                        '<button onclick="rbacModule.editRole(\'' + role.id + '\')" class="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">ویرایش</button>' :
                        '<button disabled class="flex-1 px-3 py-2 bg-gray-800 text-gray-500 rounded text-sm cursor-not-allowed">محافظت شده</button>'
                    }
                </div>
            </div>
        </div>`;
    }

    getUsersTab() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-white">مدیریت کاربران</h3>
                <div class="flex items-center gap-3">
                    <select class="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600">
                        <option value="">همه نقش‌ها</option>
                        ${Object.values(this.roles).map(role => 
                            '<option value="' + role.id + '">' + role.name + '</option>'
                        ).join('')}
                    </select>
                    <select class="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600">
                        <option value="">همه وضعیت‌ها</option>
                        <option value="active">فعال</option>
                        <option value="inactive">غیرفعال</option>
                        <option value="suspended">تعلیق شده</option>
                    </select>
                </div>
            </div>
            
            <div class="bg-gray-900 rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-4 py-3 text-right text-sm font-medium text-gray-300">کاربر</th>
                                <th class="px-4 py-3 text-right text-sm font-medium text-gray-300">نقش</th>
                                <th class="px-4 py-3 text-right text-sm font-medium text-gray-300">وضعیت</th>
                                <th class="px-4 py-3 text-right text-sm font-medium text-gray-300">آخرین ورود</th>
                                <th class="px-4 py-3 text-right text-sm font-medium text-gray-300">عملیات</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${Object.values(this.users).map(user => this.getUserRow(user)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    }

    getUserRow(user) {
        const role = this.roles[user.role_id];
        const statusColor = {
            'active': 'text-green-400',
            'inactive': 'text-gray-400',
            'suspended': 'text-red-400'
        }[user.status] || 'text-gray-400';
        
        const lastLogin = new Date(user.last_login).toLocaleDateString('fa-IR');
        
        return `
        <tr class="hover:bg-gray-800">
            <td class="px-4 py-3">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${user.avatar}</span>
                    <div>
                        <div class="text-sm font-medium text-white">${user.full_name}</div>
                        <div class="text-xs text-gray-400">${user.email}</div>
                        <div class="text-xs text-gray-500">@${user.username}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${role.color} text-white">
                    ${role.icon} ${role.name}
                </span>
            </td>
            <td class="px-4 py-3">
                <span class="text-sm ${statusColor} flex items-center">
                    <i class="fas fa-circle text-xs mr-1"></i>
                    ${user.status === 'active' ? 'فعال' : user.status === 'inactive' ? 'غیرفعال' : 'تعلیق شده'}
                </span>
                ${user.two_factor ? '<div class="text-xs text-blue-400 mt-1"><i class="fas fa-shield-alt mr-1"></i>2FA</div>' : ''}
            </td>
            <td class="px-4 py-3">
                <div class="text-sm text-white">${lastLogin}</div>
                <div class="text-xs text-gray-400">${user.login_count} بار ورود</div>
            </td>
            <td class="px-4 py-3">
                <div class="flex gap-1">
                    <button onclick="rbacModule.editUser('${user.id}')" 
                            class="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="rbacModule.viewUserLogs('${user.id}')" 
                            class="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                        <i class="fas fa-history"></i>
                    </button>
                    ${user.id !== 'admin_1' ? 
                        '<button onclick="rbacModule.toggleUserStatus(\'' + user.id + '\')" class="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"><i class="fas fa-power-off"></i></button>' : ''
                    }
                </div>
            </td>
        </tr>`;
    }

    getPermissionsTab() {
        const roleIds = Object.keys(this.roles);
        const permissionIds = Object.keys(this.permissions);
        
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-white">ماتریس مجوزها</h3>
                <div class="text-sm text-gray-400">
                    ${permissionIds.length} مجوز برای ${roleIds.length} نقش
                </div>
            </div>
            
            <div class="bg-gray-900 rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300 sticky right-0 bg-gray-800">مجوز</th>
                                ${roleIds.map(roleId => {
                                    const role = this.roles[roleId];
                                    return '<th class="px-2 py-2 text-center text-xs font-medium text-gray-300 min-w-[80px]" title="' + role.name + '">' + role.icon + '<br>' + role.name + '</th>';
                                }).join('')}
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${permissionIds.map(permissionId => {
                                const description = this.permissions[permissionId];
                                return `
                                <tr class="hover:bg-gray-800">
                                    <td class="px-3 py-2 sticky right-0 bg-gray-900">
                                        <div class="text-white font-medium">${permissionId}</div>
                                        <div class="text-xs text-gray-400">${description}</div>
                                    </td>
                                    ${roleIds.map(roleId => {
                                        const role = this.roles[roleId];
                                        const hasPermission = role.permissions.includes('*') || role.permissions.includes(permissionId);
                                        return `
                                        <td class="px-2 py-2 text-center">
                                            ${hasPermission ? 
                                                '<i class="fas fa-check-circle text-green-400 text-lg"></i>' : 
                                                '<i class="fas fa-times-circle text-gray-600 text-lg"></i>'
                                            }
                                        </td>`;
                                    }).join('')}
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    }

    getLogsTab() {
        return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-white">لاگ‌های دسترسی</h3>
                <div class="flex items-center gap-3">
                    <select class="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm">
                        <option value="">همه کاربران</option>
                        ${Object.values(this.users).map(user => 
                            '<option value="' + user.id + '">' + user.full_name + '</option>'
                        ).join('')}
                    </select>
                    <select class="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm">
                        <option value="">همه عملیات</option>
                        <option value="login">ورود</option>
                        <option value="logout">خروج</option>
                        <option value="execute_trade">انجام معامله</option>
                        <option value="view_portfolio">مشاهده پرتفولیو</option>
                        <option value="configure_exchange">تنظیم صرافی</option>
                    </select>
                    <button onclick="rbacModule.refreshLogs()" 
                            class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                        <i class="fas fa-refresh mr-1"></i>بروزرسانی
                    </button>
                </div>
            </div>
            
            <div class="bg-gray-900 rounded-lg overflow-hidden">
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-800 sticky top-0">
                            <tr>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">زمان</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">کاربر</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">عملیات</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">وضعیت</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300">IP</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${this.accessLogs.slice(0, 20).map(log => this.getLogRow(log)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="flex justify-between items-center text-sm text-gray-400">
                <span>نمایش 20 مورد از ${this.accessLogs.length} لاگ</span>
                <button onclick="rbacModule.exportLogs()" 
                        class="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    <i class="fas fa-download mr-1"></i>خروجی
                </button>
            </div>
        </div>`;
    }

    getLogRow(log) {
        const statusColor = {
            'success': 'text-green-400',
            'failed': 'text-red-400',
            'warning': 'text-yellow-400'
        }[log.status] || 'text-gray-400';
        
        const statusIcon = {
            'success': 'fa-check-circle',
            'failed': 'fa-times-circle',
            'warning': 'fa-exclamation-triangle'
        }[log.status] || 'fa-info-circle';
        
        const timestamp = new Date(log.timestamp).toLocaleString('fa-IR');
        
        return `
        <tr class="hover:bg-gray-800">
            <td class="px-3 py-2 text-gray-300">${timestamp}</td>
            <td class="px-3 py-2">
                <div class="text-white">${log.username}</div>
            </td>
            <td class="px-3 py-2">
                <div class="text-white">${log.action}</div>
                <div class="text-xs text-gray-400">${log.details}</div>
            </td>
            <td class="px-3 py-2">
                <span class="${statusColor} flex items-center">
                    <i class="fas ${statusIcon} text-xs mr-1"></i>
                    ${log.status}
                </span>
            </td>
            <td class="px-3 py-2 text-gray-300">${log.ip_address}</td>
        </tr>`;
    }

    // RBAC Tab Management
    switchRBACTab(tabName) {
        console.log('🔄 Switching RBAC tab to:', tabName);
        
        // Update tab styles
        document.querySelectorAll('.rbac-tab').forEach(tab => {
            tab.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
            tab.classList.add('text-gray-400');
        });
        
        const activeTab = document.querySelector(`[onclick="rbacModule.switchRBACTab('${tabName}')"]`);
        if (activeTab) {
            activeTab.classList.remove('text-gray-400');
            activeTab.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
        }
        
        // Update content
        const container = document.getElementById('rbac-tab-content');
        if (container) {
            switch (tabName) {
                case 'roles':
                    container.innerHTML = this.getRolesTab();
                    break;
                case 'users':
                    container.innerHTML = this.getUsersTab();
                    break;
                case 'permissions':
                    container.innerHTML = this.getPermissionsTab();
                    break;
                case 'logs':
                    container.innerHTML = this.getLogsTab();
                    break;
            }
        }
    }

    // Role Management Methods
    viewRoleDetails(roleId) {
        const role = this.roles[roleId];
        console.log('👁️ Viewing role details:', role.name);
        
        const permissionsList = role.permissions.includes('*') ? 
            'تمام مجوزها' : 
            role.permissions.map(p => this.permissions[p] || p).join('، ');
        
        alert(`جزئیات نقش: ${role.name}\n\nتوضیحات: ${role.description}\n\nمجوزها: ${permissionsList}\n\nتعداد کاربران: ${role.users_count}`);
    }

    editRole(roleId) {
        console.log('✏️ Editing role:', roleId);
        alert('🚧 ویرایش نقش در نسخه‌های آتی اضافه خواهد شد.');
    }

    createRole() {
        console.log('➕ Creating new role...');
        alert('🚧 ایجاد نقش جدید در نسخه‌های آتی اضافه خواهد شد.');
    }

    // User Management Methods
    createUser() {
        console.log('👤 Creating new user...');
        alert('🚧 ایجاد کاربر جدید در نسخه‌های آتی اضافه خواهد شد.');
    }

    editUser(userId) {
        const user = this.users[userId];
        console.log('✏️ Editing user:', user.full_name);
        alert('🚧 ویرایش کاربر در نسخه‌های آتی اضافه خواهد شد.');
    }

    viewUserLogs(userId) {
        const user = this.users[userId];
        console.log('📋 Viewing logs for user:', user.full_name);
        alert('🚧 مشاهده لاگ‌های کاربر در نسخه‌های آتی اضافه خواهد شد.');
    }

    toggleUserStatus(userId) {
        const user = this.users[userId];
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        user.status = newStatus;
        console.log(`🔄 User ${user.full_name} status changed to: ${newStatus}`);
        
        // Refresh the display
        this.switchRBACTab('users');
    }

    // Utility Methods
    refreshLogs() {
        console.log('🔄 Refreshing access logs...');
        this.generateSampleLogs();
        this.switchRBACTab('logs');
    }

    exportLogs() {
        console.log('📥 Exporting access logs...');
        alert('🚧 خروجی لاگ‌ها در نسخه‌های آتی اضافه خواهد شد.');
    }
}

// Register module globally
window.TitanModules = window.TitanModules || {};
window.TitanModules.RBACModule = RBACModule;

// Create global instance
window.rbacModule = null;

console.log('✅ RBAC Module registered successfully');