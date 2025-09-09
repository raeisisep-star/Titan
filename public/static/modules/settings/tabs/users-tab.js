// Users Tab Module - TITAN Trading System
// User management and role-based access control

export default class UsersTab {
    constructor(settings) {
        this.settings = settings.users || {};
        this.currentUsers = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@titan.trading',
                role: 'Administrator',
                status: 'Active',
                lastLogin: '2024-01-15 10:30:00',
                avatar: 'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff'
            },
            {
                id: 2,
                username: 'trader1',
                email: 'trader1@titan.trading',
                role: 'Trader',
                status: 'Active',
                lastLogin: '2024-01-15 09:15:00',
                avatar: 'https://ui-avatars.com/api/?name=T1&background=10B981&color=fff'
            },
            {
                id: 3,
                username: 'analyst',
                email: 'analyst@titan.trading',
                role: 'Analyst',
                status: 'Inactive',
                lastLogin: '2024-01-10 14:20:00',
                avatar: 'https://ui-avatars.com/api/?name=AN&background=F59E0B&color=fff'
            }
        ];
    }

    render() {
        return `
            <div class="space-y-6">
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
                            <button onclick="this.openAddUserModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-plus mr-2"></i>
                                افزودن کاربر
                            </button>
                            <button onclick="this.bulkImportUsers()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                                <div class="text-2xl font-bold text-white">3</div>
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
                                <div class="text-2xl font-bold text-white">2</div>
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
                                <div class="text-2xl font-bold text-white">1</div>
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
                                <div class="text-2xl font-bold text-white">1</div>
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
                            <button onclick="this.exportUsers()" class="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                <i class="fas fa-download mr-1"></i>
                                خروجی
                            </button>
                            <button onclick="this.refreshUsers()" class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                            
                            <button onclick="this.openAddRoleModal()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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
                        <button onclick="this.viewFullActivityLog()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                                        <button onclick="this.terminateSession('session1')" class="text-red-400 hover:text-red-300">
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
                                        <button onclick="this.terminateSession('session2')" class="text-red-400 hover:text-red-300">
                                            <i class="fas fa-sign-out-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="this.terminateAllSessions()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
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
                        <button onclick="this.closeAddUserModal()" class="text-gray-400 hover:text-white">
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
                            <button type="button" onclick="this.closeAddUserModal()" 
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
                    <button onclick="this.editUser(${user.id})" class="text-blue-400 hover:text-blue-300 ml-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="this.toggleUserStatus(${user.id})" class="text-yellow-400 hover:text-yellow-300 ml-3">
                        <i class="fas fa-power-off"></i>
                    </button>
                    <button onclick="this.deleteUser(${user.id})" class="text-red-400 hover:text-red-300">
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
                    <button onclick="this.editRole('${role.name}')" class="text-blue-400 hover:text-blue-300">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${role.users === 0 ? `
                        <button onclick="this.deleteRole('${role.name}')" class="text-red-400 hover:text-red-300">
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

    initialize() {
        this.setupEventListeners();
        this.setupFormHandlers();
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
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser();
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

    addUser() {
        const username = document.getElementById('new-username')?.value;
        const email = document.getElementById('new-email')?.value;
        const role = document.getElementById('new-role')?.value;
        const password = document.getElementById('new-password')?.value;

        if (!username || !email || !role || !password) {
            alert('لطفاً همه فیلدها را پر کنید');
            return;
        }

        // Add user logic would be implemented here
        alert(`کاربر ${username} با موفقیت اضافه شد`);
        this.closeAddUserModal();
        this.refreshUsers();
    }

    editUser(userId) {
        const user = this.currentUsers.find(u => u.id === userId);
        if (user) {
            alert(`ویرایش کاربر ${user.username} در حال پیاده‌سازی...`);
        }
    }

    toggleUserStatus(userId) {
        const user = this.currentUsers.find(u => u.id === userId);
        if (user) {
            const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
            if (confirm(`آیا مطمئن هستید که می‌خواهید وضعیت ${user.username} را به ${newStatus} تغییر دهید؟`)) {
                user.status = newStatus;
                this.refreshUsersTable();
                alert(`وضعیت کاربر ${user.username} تغییر کرد`);
            }
        }
    }

    deleteUser(userId) {
        const user = this.currentUsers.find(u => u.id === userId);
        if (user) {
            if (confirm(`آیا مطمئن هستید که می‌خواهید کاربر ${user.username} را حذف کنید؟\\n\\nاین عمل غیرقابل بازگشت است!`)) {
                this.currentUsers = this.currentUsers.filter(u => u.id !== userId);
                this.refreshUsersTable();
                alert(`کاربر ${user.username} حذف شد`);
            }
        }
    }

    bulkImportUsers() {
        alert('وارد کردن گروهی کاربران در حال پیاده‌سازی...');
    }

    exportUsers() {
        // Export users to CSV/Excel
        const csvContent = 'Username,Email,Role,Status,Last Login\\n' + 
                          this.currentUsers.map(user => 
                              `${user.username},${user.email},${user.role},${user.status},${user.lastLogin}`
                          ).join('\\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'titan-users.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    refreshUsers() {
        alert('بروزرسانی لیست کاربران...');
        this.refreshUsersTable();
    }

    refreshUsersTable() {
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = this.renderUsersRows();
        }
    }

    // Role management methods
    openAddRoleModal() {
        const roleName = prompt('نام نقش جدید را وارد کنید:');
        if (roleName && roleName.trim()) {
            alert(`نقش "${roleName}" اضافه شد`);
        }
    }

    editRole(roleName) {
        alert(`ویرایش نقش ${roleName} در حال پیاده‌سازی...`);
    }

    deleteRole(roleName) {
        if (confirm(`آیا مطمئن هستید که می‌خواهید نقش ${roleName} را حذف کنید؟`)) {
            alert(`نقش ${roleName} حذف شد`);
        }
    }

    // Session management methods
    terminateSession(sessionId) {
        if (confirm('آیا مطمئن هستید که می‌خواهید این جلسه را پایان دهید؟')) {
            alert(`جلسه ${sessionId} پایان یافت`);
        }
    }

    terminateAllSessions() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه جلسات را پایان دهید؟\\n\\nتمام کاربران مجبور به ورود مجدد خواهند شد!')) {
            alert('همه جلسات پایان یافتند');
        }
    }

    viewFullActivityLog() {
        alert('نمایش لاگ کامل فعالیت در حال پیاده‌سازی...');
    }

    collectData() {
        return {
            users: this.currentUsers,
            roles: document.querySelectorAll('[data-permission]').length > 0 ? 
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