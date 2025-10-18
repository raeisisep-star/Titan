// Users Tab Module - TITAN Trading System  
// User management and role-based access control

export default class UsersTab {
    constructor(settings) {
        this.settings = settings.users || {};
        this.currentUsers = [];
        this.currentRoles = [];
        this.currentSessions = [];
        this.currentActivities = [];
        this.userStats = { total: 0, active: 0, inactive: 0, admins: 0 };
        this.loading = false;
        
        // Initialize API base URL
        this.apiBaseUrl = '';
        
        // Get auth token from localStorage
        this.getAuthToken = () => {
            try {
                const session = JSON.parse(localStorage.getItem('titan_session') || '{}');
                return session.accessToken || null;
            } catch {
                return null;
            }
        };
        
        // API call helper with auth
        this.apiCall = async (endpoint, options = {}) => {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const defaultOptions = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const mergedOptions = {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...(options.headers || {}) }
            };
            
            const response = await fetch(this.apiBaseUrl + endpoint, mergedOptions);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
        };
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- Loading Indicator -->
                <div id="users-loading" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center space-x-3 space-x-reverse">
                            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span class="text-white">در حال بارگذاری...</span>
                        </div>
                    </div>
                </div>

                <!-- Users Overview -->
                <div class="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 rounded-lg p-6 border border-blue-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-white flex items-center">
                                <i class="fas fa-users text-blue-400 text-3xl ml-3"></i>
                                مدیریت کاربران TITAN
                            </h3>
                            <p class="text-blue-200 mt-2">مدیریت کاربران، نقش‌ها و دسترسی‌ها</p>
                        </div>
                        <div class="flex space-x-2 space-x-reverse">
                            <button onclick="usersTab.openAddUserModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-plus mr-2"></i>
                                افزودن کاربر
                            </button>
                            <button onclick="usersTab.bulkImportUsers()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-upload mr-2"></i>
                                وارد کردن گروهی
                            </button>
                        </div>
                    </div>
                </div>

                <!-- User Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-users text-white text-xl"></i>
                            </div>
                            <div class="mr-4">
                                <div id="total-users-count" class="text-2xl font-bold text-white">0</div>
                                <div class="text-gray-400 text-sm">کل کاربران</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-user-check text-white text-xl"></i>
                            </div>
                            <div class="mr-4">
                                <div id="active-users-count" class="text-2xl font-bold text-white">0</div>
                                <div class="text-gray-400 text-sm">فعال</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-user-times text-white text-xl"></i>
                            </div>
                            <div class="mr-4">
                                <div id="inactive-users-count" class="text-2xl font-bold text-white">0</div>
                                <div class="text-gray-400 text-sm">غیرفعال</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-crown text-white text-xl"></i>
                            </div>
                            <div class="mr-4">
                                <div id="admin-users-count" class="text-2xl font-bold text-white">0</div>
                                <div class="text-gray-400 text-sm">مدیر</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- User Search and Filters -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div class="flex flex-wrap items-center gap-4">
                            <div class="relative">
                                <input type="text" id="user-search" placeholder="جستجوی کاربر..." 
                                       class="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                            </div>
                            
                            <select id="role-filter" class="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="">همه نقش‌ها</option>
                                <option value="Administrator">مدیر کل</option>
                                <option value="Trader">معامله‌گر</option>
                                <option value="Analyst">تحلیلگر</option>
                                <option value="Viewer">بیننده</option>
                            </select>
                            
                            <select id="status-filter" class="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="">همه وضعیت‌ها</option>
                                <option value="Active">فعال</option>
                                <option value="Inactive">غیرفعال</option>
                                <option value="Suspended">تعلیق شده</option>
                            </select>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <button onclick="usersTab.exportUsers()" class="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                <i class="fas fa-download mr-1"></i>
                                خروجی
                            </button>
                            <button onclick="usersTab.refreshUsers()" class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-sync mr-1"></i>
                                تازه‌سازی
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Users Table -->
                <div class="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-800">
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        <input type="checkbox" id="select-all-users" class="rounded">
                                    </th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">کاربر</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">نقش</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">وضعیت</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">آخرین ورود</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">عملیات</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body" class="bg-gray-900 divide-y divide-gray-700">
                                ${this.renderUsersRows()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Role Management -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-user-tag text-purple-400 ml-2"></i>
                        مدیریت نقش‌ها و دسترسی‌ها
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-3">نقش‌های موجود</h4>
                            <div class="space-y-3">
                                ${this.renderRolesSection()}
                            </div>
                            
                            <button onclick="usersTab.openAddRoleModal()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                <i class="fas fa-plus mr-2"></i>
                                افزودن نقش جدید
                            </button>
                        </div>
                        
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-3">دسترسی‌های سیستم</h4>
                            <div class="space-y-2">
                                ${this.renderPermissionsSection()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- User Activity Log -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-history text-blue-400 ml-2"></i>
                        لاگ فعالیت کاربران
                    </h3>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg border-r-4 border-green-500">
                            <div class="flex items-center">
                                <img src="https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff" 
                                     alt="Admin" class="w-8 h-8 rounded-full ml-3">
                                <div>
                                    <div class="text-white font-medium">admin وارد سیستم شد</div>
                                    <div class="text-gray-400 text-sm">IP: 192.168.1.100</div>
                                </div>
                            </div>
                            <span class="text-green-400 text-sm">5 دقیقه پیش</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg border-r-4 border-blue-500">
                            <div class="flex items-center">
                                <img src="https://ui-avatars.com/api/?name=T1&background=10B981&color=fff" 
                                     alt="Trader1" class="w-8 h-8 rounded-full ml-3">
                                <div>
                                    <div class="text-white font-medium">trader1 معامله جدیدی انجام داد</div>
                                    <div class="text-gray-400 text-sm">BTC/USDT - خرید</div>
                                </div>
                            </div>
                            <span class="text-blue-400 text-sm">15 دقیقه پیش</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg border-r-4 border-yellow-500">
                            <div class="flex items-center">
                                <img src="https://ui-avatars.com/api/?name=AN&background=F59E0B&color=fff" 
                                     alt="Analyst" class="w-8 h-8 rounded-full ml-3">
                                <div>
                                    <div class="text-white font-medium">analyst تنظیمات را تغییر داد</div>
                                    <div class="text-gray-400 text-sm">صفحه: تنظیمات AI</div>
                                </div>
                            </div>
                            <span class="text-yellow-400 text-sm">1 ساعت پیش</span>
                        </div>
                    </div>
                    
                    <div class="mt-4 text-center">
                        <button onclick="usersTab.viewFullActivityLog()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-list mr-2"></i>
                            مشاهده لاگ کامل
                        </button>
                    </div>
                </div>

                <!-- Session Management -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-desktop text-orange-400 ml-2"></i>
                        مدیریت جلسات فعال
                    </h3>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-800">
                                <tr>
                                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-300">کاربر</th>
                                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-300">IP آدرس</th>
                                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-300">مرورگر</th>
                                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-300">شروع جلسه</th>
                                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-300">عملیات</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-700">
                                <tr>
                                    <td class="px-4 py-3 text-white">admin</td>
                                    <td class="px-4 py-3 text-gray-300">192.168.1.100</td>
                                    <td class="px-4 py-3 text-gray-300">Chrome 120.0</td>
                                    <td class="px-4 py-3 text-gray-300">10:30:00</td>
                                    <td class="px-4 py-3">
                                        <button onclick="usersTab.terminateSession('session1')" class="text-red-400 hover:text-red-300">
                                            <i class="fas fa-sign-out-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="px-4 py-3 text-white">trader1</td>
                                    <td class="px-4 py-3 text-gray-300">192.168.1.105</td>
                                    <td class="px-4 py-3 text-gray-300">Firefox 121.0</td>
                                    <td class="px-4 py-3 text-gray-300">09:15:00</td>
                                    <td class="px-4 py-3">
                                        <button onclick="usersTab.terminateSession('session2')" class="text-red-400 hover:text-red-300">
                                            <i class="fas fa-sign-out-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="usersTab.terminateAllSessions()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <i class="fas fa-power-off mr-2"></i>
                            پایان همه جلسات
                        </button>
                    </div>
                </div>
            </div>

            <!-- Add User Modal (Hidden) -->
            <div id="add-user-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
                <div class="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-white">افزودن کاربر جدید</h3>
                        <button onclick="usersTab.closeAddUserModal()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="add-user-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نام کاربری</label>
                            <input type="text" id="new-username" required
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">ایمیل</label>
                            <input type="email" id="new-email" required
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">نقش</label>
                            <select id="new-role" required
                                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="">انتخاب کنید</option>
                                <option value="Administrator">مدیر کل</option>
                                <option value="Trader">معامله‌گر</option>
                                <option value="Analyst">تحلیلگر</option>
                                <option value="Viewer">بیننده</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">رمز عبور</label>
                            <input type="password" id="new-password" required
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div class="flex items-center justify-between pt-4">
                            <button type="button" onclick="usersTab.closeAddUserModal()" 
                                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                لغو
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                افزودن کاربر
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderUsersRows() {
        return this.currentUsers.map(user => `
            <tr class="hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="user-checkbox" data-user-id="${user.id}" class="rounded">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <img class="h-8 w-8 rounded-full ml-3" src="${user.avatar}" alt="${user.username}">
                        <div>
                            <div class="text-sm font-medium text-white">${user.username}</div>
                            <div class="text-sm text-gray-400">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getRoleBadgeClass(user.role)}">
                        ${user.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeClass(user.status)}">
                        ${user.status === 'Active' ? 'فعال' : 'غیرفعال'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    ${user.lastLogin}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="usersTab.editUser(${user.id})" class="text-blue-400 hover:text-blue-300 ml-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="usersTab.toggleUserStatus(${user.id})" class="text-yellow-400 hover:text-yellow-300 ml-3">
                        <i class="fas fa-power-off"></i>
                    </button>
                    <button onclick="usersTab.deleteUser(${user.id})" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderRolesSection() {
        const roles = [
            { name: 'Administrator', users: 1, color: 'bg-red-600', permissions: ['همه دسترسی‌ها'] },
            { name: 'Trader', users: 1, color: 'bg-blue-600', permissions: ['معاملات', 'پورتفولیو', 'چارت‌ها'] },
            { name: 'Analyst', users: 1, color: 'bg-green-600', permissions: ['تحلیل‌ها', 'گزارش‌ها', 'چارت‌ها'] },
            { name: 'Viewer', users: 0, color: 'bg-gray-600', permissions: ['مشاهده فقط'] }
        ];

        return roles.map(role => `
            <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div class="flex items-center">
                    <div class="w-3 h-3 ${role.color} rounded-full ml-3"></div>
                    <div>
                        <div class="text-white font-medium">${role.name}</div>
                        <div class="text-gray-400 text-sm">${role.users} کاربر</div>
                    </div>
                </div>
                <div class="flex items-center space-x-2 space-x-reverse">
                    <button onclick="usersTab.editRole('${role.name}')" class="text-blue-400 hover:text-blue-300">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${role.users === 0 ? `
                        <button onclick="usersTab.deleteRole('${role.name}')" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderPermissionsSection() {
        const permissions = [
            { name: 'مشاهده داشبورد', key: 'dashboard.view', enabled: true },
            { name: 'انجام معاملات', key: 'trading.execute', enabled: true },
            { name: 'مدیریت پورتفولیو', key: 'portfolio.manage', enabled: true },
            { name: 'دسترسی به AI', key: 'ai.access', enabled: false },
            { name: 'مشاهده گزارش‌ها', key: 'reports.view', enabled: true },
            { name: 'مدیریت کاربران', key: 'users.manage', enabled: false },
            { name: 'تنظیمات سیستم', key: 'system.settings', enabled: false }
        ];

        return permissions.map(permission => `
            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span class="text-white">${permission.name}</span>
                <input type="checkbox" data-permission="${permission.key}" ${permission.enabled ? 'checked' : ''}>
            </div>
        `).join('');
    }

    getRoleBadgeClass(role) {
        switch (role) {
            case 'Administrator': return 'bg-red-100 text-red-800';
            case 'Trader': return 'bg-blue-100 text-blue-800';
            case 'Analyst': return 'bg-green-100 text-green-800';
            case 'Viewer': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Inactive': return 'bg-red-100 text-red-800';
            case 'Suspended': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    async initialize() {
        // Create global reference for onclick handlers
        window.usersTab = this;
        
        this.setupEventListeners();
        this.setupFormHandlers();
        
        // Load initial data
        await this.loadAllData();
    }
    
    // Show/hide loading indicator
    showLoading() {
        document.getElementById('users-loading')?.classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('users-loading')?.classList.add('hidden');
    }
    
    // Show notification
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border max-w-md transition-all duration-300 ${
            type === 'success' 
                ? 'bg-green-900 border-green-500 text-green-100' 
                : type === 'error' 
                    ? 'bg-red-900 border-red-500 text-red-100'
                    : 'bg-blue-900 border-blue-500 text-blue-100'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'} mr-2"></i>
                    <span>${message}</span>
                </div>
                <button onclick="this.remove()" class="mr-4 text-gray-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // Load all data
    async loadAllData() {
        try {
            this.showLoading();
            
            await Promise.all([
                this.loadUsers(),
                this.loadRoles(),
                this.loadSessions(),
                this.loadActivity()
            ]);
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('خطا در بارگذاری اطلاعات: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Load users from API
    async loadUsers() {
        try {
            const response = await this.apiCall('/api/users');
            
            if (response.success) {
                this.currentUsers = response.data.users || [];
                this.userStats = response.data.stats || { total: 0, active: 0, inactive: 0, admins: 0 };
                
                // Update statistics
                this.updateUserStats();
                
                // Refresh users table
                this.refreshUsersTable();
            }
        } catch (error) {
            console.error('Error loading users:', error);
            throw error;
        }
    }
    
    // Load roles from API
    async loadRoles() {
        try {
            const response = await this.apiCall('/api/roles');
            
            if (response.success) {
                this.currentRoles = response.data.roles || [];
                
                // Refresh roles display
                this.updateRolesDisplay();
            }
        } catch (error) {
            console.error('Error loading roles:', error);
            throw error;
        }
    }
    
    // Load sessions from API
    async loadSessions() {
        try {
            const response = await this.apiCall('/api/sessions');
            
            if (response.success) {
                this.currentSessions = response.data.sessions || [];
                
                // Refresh sessions display
                this.updateSessionsDisplay();
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
            throw error;
        }
    }
    
    // Load activity from API
    async loadActivity() {
        try {
            const response = await this.apiCall('/api/users/activity');
            
            if (response.success) {
                this.currentActivities = response.data.activities || [];
                
                // Refresh activity display
                this.updateActivityDisplay();
            }
        } catch (error) {
            console.error('Error loading activity:', error);
            throw error;
        }
    }
    
    // Update user statistics
    updateUserStats() {
        document.getElementById('total-users-count').textContent = this.userStats.total || this.currentUsers.length;
        document.getElementById('active-users-count').textContent = this.userStats.active || this.currentUsers.filter(u => u.status === 'Active').length;
        document.getElementById('inactive-users-count').textContent = this.userStats.inactive || this.currentUsers.filter(u => u.status !== 'Active').length;
        document.getElementById('admin-users-count').textContent = this.userStats.admins || this.currentUsers.filter(u => u.role === 'Administrator').length;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUsers();
            });
        }

        // Filter functionality
        const roleFilter = document.getElementById('role-filter');
        const statusFilter = document.getElementById('status-filter');
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.filterUsers());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterUsers());
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-users');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const userCheckboxes = document.querySelectorAll('.user-checkbox');
                userCheckboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }
    }

    setupFormHandlers() {
        const addUserForm = document.getElementById('add-user-form');
        if (addUserForm) {
            addUserForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addUser();
            });
        }
    }

    filterUsers() {
        const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('role-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';

        // Filter logic would be implemented here
        console.log('Filtering users:', { searchTerm, roleFilter, statusFilter });
    }

    // User management methods
    openAddUserModal() {
        document.getElementById('add-user-modal').classList.remove('hidden');
    }

    closeAddUserModal() {
        document.getElementById('add-user-modal').classList.add('hidden');
        document.getElementById('add-user-form').reset();
    }

    async addUser() {
        const username = document.getElementById('new-username')?.value;
        const email = document.getElementById('new-email')?.value;
        const role = document.getElementById('new-role')?.value;
        const password = document.getElementById('new-password')?.value;

        if (!username || !email || !role || !password) {
            this.showNotification('لطفاً همه فیلدها را پر کنید', 'error');
            return;
        }

        try {
            this.showLoading();
            
            const response = await this.apiCall('/api/users', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    email,
                    role,
                    password
                })
            });

            if (response.success) {
                this.showNotification(`کاربر ${username} با موفقیت اضافه شد`, 'success');
                this.closeAddUserModal();
                await this.loadUsers(); // Refresh users list
            } else {
                this.showNotification('خطا در افزودن کاربر: ' + (response.error || 'خطای نامشخص'), 'error');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            this.showNotification('خطا در افزودن کاربر: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async editUser(userId) {
        const user = this.currentUsers.find(u => u.id === userId);
        if (!user) {
            this.showNotification('کاربر پیدا نشد', 'error');
            return;
        }

        // Create edit modal (simple prompt for now, can be enhanced later)
        const newUsername = prompt('نام کاربری جدید:', user.username);
        if (!newUsername || newUsername === user.username) {
            return;
        }

        try {
            this.showLoading();
            
            const response = await this.apiCall(`/api/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    username: newUsername,
                    email: user.email,
                    role: user.role
                })
            });

            if (response.success) {
                this.showNotification(`کاربر ${user.username} با موفقیت ویرایش شد`, 'success');
                await this.loadUsers(); // Refresh users list
            } else {
                this.showNotification('خطا در ویرایش کاربر: ' + (response.error || 'خطای نامشخص'), 'error');
            }
        } catch (error) {
            console.error('Error editing user:', error);
            this.showNotification('خطا در ویرایش کاربر: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async toggleUserStatus(userId) {
        const user = this.currentUsers.find(u => u.id === userId);
        if (!user) {
            this.showNotification('کاربر پیدا نشد', 'error');
            return;
        }

        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        const statusText = newStatus === 'Active' ? 'فعال' : 'غیرفعال';
        
        if (!confirm(`آیا مطمئن هستید که می‌خواهید وضعیت ${user.username} را به ${statusText} تغییر دهید؟`)) {
            return;
        }

        try {
            this.showLoading();
            
            const response = await this.apiCall(`/api/users/${userId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: newStatus
                })
            });

            if (response.success) {
                this.showNotification(`وضعیت کاربر ${user.username} به ${statusText} تغییر کرد`, 'success');
                await this.loadUsers(); // Refresh users list
            } else {
                this.showNotification('خطا در تغییر وضعیت کاربر: ' + (response.error || 'خطای نامشخص'), 'error');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            this.showNotification('خطا در تغییر وضعیت کاربر: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteUser(userId) {
        const user = this.currentUsers.find(u => u.id === userId);
        if (!user) {
            this.showNotification('کاربر پیدا نشد', 'error');
            return;
        }

        if (!confirm(`آیا مطمئن هستید که می‌خواهید کاربر ${user.username} را حذف کنید؟\n\nاین عمل غیرقابل بازگشت است!`)) {
            return;
        }

        try {
            this.showLoading();
            
            const response = await this.apiCall(`/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                this.showNotification(`کاربر ${user.username} با موفقیت حذف شد`, 'success');
                await this.loadUsers(); // Refresh users list
            } else {
                this.showNotification('خطا در حذف کاربر: ' + (response.error || 'خطای نامشخص'), 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('خطا در حذف کاربر: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async bulkImportUsers() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.json';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                this.showLoading();
                this.showNotification('در حال پردازش فایل...', 'info');
                
                // For now, show a placeholder message
                this.showNotification('قابلیت وارد کردن گروهی کاربران در نسخه بعدی اضافه خواهد شد', 'info');
                
            } catch (error) {
                console.error('Error importing users:', error);
                this.showNotification('خطا در وارد کردن کاربران: ' + error.message, 'error');
            } finally {
                this.hideLoading();
            }
        };
        
        input.click();
    }

    exportUsers() {
        try {
            if (this.currentUsers.length === 0) {
                this.showNotification('هیچ کاربری برای خروجی وجود ندارد', 'error');
                return;
            }

            // Export users to CSV/Excel
            const csvContent = 'Username,Email,Role,Status,Last Login\n' + 
                              this.currentUsers.map(user => 
                                  `${user.username},${user.email},${user.role},${user.status},"${user.lastLogin || 'N/A'}"`
                              ).join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `titan-users-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification(`فایل حاوی ${this.currentUsers.length} کاربر با موفقیت دانلود شد`, 'success');
        } catch (error) {
            console.error('Error exporting users:', error);
            this.showNotification('خطا در خروجی گرفتن: ' + error.message, 'error');
        }
    }

    async refreshUsers() {
        try {
            this.showNotification('در حال بروزرسانی لیست کاربران...', 'info');
            await this.loadAllData();
            this.showNotification('لیست کاربران با موفقیت بروزرسانی شد', 'success');
        } catch (error) {
            console.error('Error refreshing users:', error);
            this.showNotification('خطا در بروزرسانی: ' + error.message, 'error');
        }
    }

    refreshUsersTable() {
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = this.renderUsersRows();
        }
    }
    
    // Update roles display
    updateRolesDisplay() {
        // This would update the roles section if it exists
        // For now, we'll just log that roles were loaded
        console.log('Roles updated:', this.currentRoles);
    }
    
    // Update sessions display  
    updateSessionsDisplay() {
        // Update the sessions table with real data
        const sessionsTableBody = document.querySelector('#sessions-table tbody');
        if (sessionsTableBody && this.currentSessions.length > 0) {
            sessionsTableBody.innerHTML = this.currentSessions.map(session => `
                <tr>
                    <td class="px-4 py-3 text-white">${session.username || session.user_id}</td>
                    <td class="px-4 py-3 text-gray-300">${session.ip_address || 'N/A'}</td>
                    <td class="px-4 py-3 text-gray-300">${session.user_agent || 'N/A'}</td>
                    <td class="px-4 py-3 text-gray-300">${session.created_at || 'N/A'}</td>
                    <td class="px-4 py-3">
                        <button onclick="usersTab.terminateSession('${session.id}')" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    // Update activity display
    updateActivityDisplay() {
        // Update the activity log with real data if available
        console.log('Activity updated:', this.currentActivities);
    }

    // Role management methods
    async openAddRoleModal() {
        const roleName = prompt('نام نقش جدید را وارد کنید:');
        if (!roleName || !roleName.trim()) {
            return;
        }

        try {
            this.showLoading();
            
            // For now, show a placeholder message as role creation endpoint would need implementation
            this.showNotification(`قابلیت افزودن نقش "${roleName.trim()}" در نسخه بعدی اضافه خواهد شد`, 'info');
            
        } catch (error) {
            console.error('Error adding role:', error);
            this.showNotification('خطا در افزودن نقش: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async editRole(roleName) {
        try {
            this.showLoading();
            
            // For now, show a placeholder message
            this.showNotification(`ویرایش نقش ${roleName} در نسخه بعدی اضافه خواهد شد`, 'info');
            
        } catch (error) {
            console.error('Error editing role:', error);
            this.showNotification('خطا در ویرایش نقش: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteRole(roleName) {
        if (!confirm(`آیا مطمئن هستید که می‌خواهید نقش ${roleName} را حذف کنید؟`)) {
            return;
        }

        try {
            this.showLoading();
            
            // For now, show a placeholder message
            this.showNotification(`حذف نقش ${roleName} در نسخه بعدی اضافه خواهد شد`, 'info');
            
        } catch (error) {
            console.error('Error deleting role:', error);
            this.showNotification('خطا در حذف نقش: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Session management methods
    async terminateSession(sessionId) {
        if (!confirm('آیا مطمئن هستید که می‌خواهید این جلسه را پایان دهید؟')) {
            return;
        }

        try {
            this.showLoading();
            
            const response = await this.apiCall(`/api/sessions/${sessionId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                this.showNotification(`جلسه ${sessionId} با موفقیت پایان یافت`, 'success');
                await this.loadSessions(); // Refresh sessions list
            } else {
                this.showNotification('خطا در پایان جلسه: ' + (response.error || 'خطای نامشخص'), 'error');
            }
        } catch (error) {
            console.error('Error terminating session:', error);
            this.showNotification('خطا در پایان جلسه: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async terminateAllSessions() {
        if (!confirm('آیا مطمئن هستید که می‌خواهید همه جلسات را پایان دهید؟\n\nتمام کاربران مجبور به ورود مجدد خواهند شد!')) {
            return;
        }

        try {
            this.showLoading();
            
            // Terminate all sessions one by one
            const promises = this.currentSessions.map(session => 
                this.apiCall(`/api/sessions/${session.id}`, { method: 'DELETE' })
            );
            
            await Promise.allSettled(promises);
            
            this.showNotification('همه جلسات با موفقیت پایان یافتند', 'success');
            await this.loadSessions(); // Refresh sessions list
            
        } catch (error) {
            console.error('Error terminating all sessions:', error);
            this.showNotification('خطا در پایان همه جلسات: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async viewFullActivityLog() {
        try {
            this.showLoading();
            
            // For now, just refresh the activity log
            await this.loadActivity();
            this.showNotification('لاگ فعالیت بروزرسانی شد', 'success');
            
        } catch (error) {
            console.error('Error viewing full activity log:', error);
            this.showNotification('خطا در نمایش لاگ فعالیت: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    collectData() {
        return {
            users: this.currentUsers,
            roles: this.currentRoles,
            sessions: this.currentSessions,
            activities: this.currentActivities,
            stats: this.userStats,
            permissions: document.querySelectorAll('[data-permission]').length > 0 ? 
                Array.from(document.querySelectorAll('[data-permission]')).map(el => ({
                    permission: el.dataset.permission,
                    enabled: el.checked
                })) : [],
            settings: {
                allowSelfRegistration: document.getElementById('allow-self-registration')?.checked || false,
                requireEmailVerification: document.getElementById('require-email-verification')?.checked || true,
                defaultRole: document.getElementById('default-role')?.value || 'Viewer'
            }
        };
    }
}