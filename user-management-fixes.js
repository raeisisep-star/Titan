// User Management Frontend Fixes
// These functions should replace the existing ones in settings.js

// Initialize pagination state
if (!this.currentUsersPage) this.currentUsersPage = 1;
if (!this.usersPagination) this.usersPagination = null;

// Fixed loadUsers with real API integration
async loadUsers() {
    try {
        // Get filter values
        const search = document.getElementById('user-search')?.value || '';
        const status = document.getElementById('user-status-filter')?.value || '';
        const role = document.getElementById('user-role-filter')?.value || '';
        
        // Build query parameters
        const params = new URLSearchParams({
            page: this.currentUsersPage || 1,
            limit: 10
        });
        
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (role) params.append('role', role);
        
        const response = await axios.get(`/api/users?${params.toString()}`);
        
        if (!response.data.success) throw new Error('Failed to load users');
        
        const users = response.data.data.users;
        const pagination = response.data.data.pagination;
        
        // Store pagination info
        this.usersPagination = pagination;
        
        // Render table
        const tbody = document.getElementById('users-table-body');
        if (tbody) {
            tbody.innerHTML = users.map(user => {
                const fullname = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                const status = user.is_suspended ? 'suspended' : (user.is_active ? 'active' : 'inactive');
                return `
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
                                    ${fullname ? `<div class="text-xs text-gray-500">${fullname}</div>` : ''}
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(status)}">
                                ${this.getStatusText(status)}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-300">${user.role}</td>
                        <td class="px-4 py-3 text-sm text-gray-300">${this.formatDate(user.last_login_at || user.created_at)}</td>
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
                                <button onclick="settingsModule.toggleUserStatus('${user.id}', '${status}')" class="text-green-400 hover:text-green-300 text-sm p-1" title="تغییر وضعیت">
                                    <i class="fas fa-toggle-${status === 'active' ? 'on' : 'off'}"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
        console.log('✅ Users loaded from real API');
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('خطا در بارگذاری کاربران', 'error');
        }
    }
}

// Fixed saveUser with real API calls
async saveUser(userId = null) {
    try {
        const formData = {
            username: document.getElementById('user-username').value,
            email: document.getElementById('user-email').value,
            first_name: document.getElementById('user-fullname')?.value?.split(' ')[0] || '',
            last_name: document.getElementById('user-fullname')?.value?.split(' ').slice(1).join(' ') || '',
            role: document.getElementById('user-role').value
        };
        
        // Validation
        if (!formData.username || !formData.email || !formData.role) {
            throw new Error('لطفاً تمام فیلدهای ضروری را پر کنید');
        }
        
        let response;
        if (!userId) {
            // Create new user
            const password = document.getElementById('user-password').value;
            const passwordConfirm = document.getElementById('user-password-confirm').value;
            
            if (!password || password !== passwordConfirm) {
                throw new Error('رمز عبور و تکرار آن باید یکسان باشند');
            }
            
            formData.password = password;
            response = await axios.post('/api/users', formData);
        } else {
            // Update existing user
            response = await axios.put(`/api/users/${userId}`, formData);
        }
        
        if (response.data.success) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(response.data.message || (userId ? 'کاربر بروزرسانی شد' : 'کاربر جدید ایجاد شد'), 'success');
            }
            
            this.closeUserModal();
            this.loadUsers(); // Refresh users list
        } else {
            throw new Error(response.data.error || 'خطا در ذخیره کاربر');
        }
        
    } catch (error) {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(error.response?.data?.error || error.message, 'error');
        }
    }
}

// Fixed deleteUser with real API call
async deleteUser(userId) {
    if (!confirm(`آیا از حذف این کاربر اطمینان دارید؟\nاین عمل قابل بازگردانی نیست.`)) {
        return;
    }
    
    try {
        const response = await axios.delete(`/api/users/${userId}`);
        
        if (response.data.success) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(response.data.message || 'کاربر حذف شد', 'success');
            }
            this.loadUsers(); // Refresh users list
        } else {
            throw new Error(response.data.error || 'خطا در حذف کاربر');
        }
    } catch (error) {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(error.response?.data?.error || error.message || 'خطا در حذف کاربر', 'error');
        }
    }
}

// Fixed filterUsers
filterUsers() {
    // Reset to page 1 when filtering
    this.currentUsersPage = 1;
    this.loadUsers();
}

// Fixed toggleUserStatus with real API calls
async toggleUserStatus(userId, currentStatus) {
    try {
        let response;
        if (currentStatus === 'suspended') {
            // Unsuspend
            response = await axios.post(`/api/users/${userId}/unsuspend`);
        } else {
            // Suspend
            const reason = prompt('دلیل تعلیق را وارد کنید:');
            if (!reason) return;
            
            response = await axios.post(`/api/users/${userId}/suspend`, {
                reason,
                duration_hours: 24
            });
        }
        
        if (response.data.success) {
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert(response.data.message || 'وضعیت کاربر تغییر کرد', 'success');
            }
            this.loadUsers();
        } else {
            throw new Error(response.data.error || 'خطا در تغییر وضعیت');
        }
    } catch (error) {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(error.response?.data?.error || error.message, 'error');
        }
    }
}

// Fixed bulkUserAction with real API calls
async bulkUserAction(action) {
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
        case 'suspend':
            actionText = 'تعلیق';
            confirmText = `آیا از تعلیق ${selectedUsers.length} کاربر انتخاب شده اطمینان دارید؟`;
            break;
        case 'unsuspend':
            actionText = 'رفع تعلیق';
            confirmText = `آیا از رفع تعلیق ${selectedUsers.length} کاربر انتخاب شده اطمینان دارید؟`;
            break;
        case 'delete':
            actionText = 'حذف';
            confirmText = `آیا از حذف ${selectedUsers.length} کاربر انتخاب شده اطمینان دارید؟\nاین عمل قابل بازگردانی نیست.`;
            break;
    }

    if (!confirm(confirmText)) return;
    
    try {
        let successCount = 0;
        let errorCount = 0;
        
        for (const userId of selectedUsers) {
            try {
                if (action === 'delete') {
                    await axios.delete(`/api/users/${userId}`);
                } else if (action === 'suspend') {
                    await axios.post(`/api/users/${userId}/suspend`, { reason: 'عملیات گروهی', duration_hours: 24 });
                } else if (action === 'unsuspend') {
                    await axios.post(`/api/users/${userId}/unsuspend`);
                }
                successCount++;
            } catch (err) {
                errorCount++;
                console.error(`Error processing user ${userId}:`, err);
            }
        }
        
        if (typeof app !== 'undefined' && app.showAlert) {
            if (errorCount === 0) {
                app.showAlert(`${actionText} ${successCount} کاربر با موفقیت انجام شد`, 'success');
            } else {
                app.showAlert(`${successCount} موفق، ${errorCount} خطا`, 'warning');
            }
        }
        
        this.loadUsers();
    } catch (error) {
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert('خطا در انجام عملیات گروهی', 'error');
        }
    }
}

// Fixed loadSuspiciousActivities with real API
async loadSuspiciousActivities() {
    try {
        const response = await axios.get('/api/users/activities/suspicious');
        
        if (!response.data.success) throw new Error('Failed to load activities');
        
        let activities = response.data.data || [];
        
        const tbody = document.getElementById('suspicious-activities-tbody');
        if (tbody && activities.length > 0) {
            tbody.innerHTML = activities.map(activity => `
                <tr class="hover:bg-gray-800">
                    <td class="px-4 py-3 text-sm text-white">${activity.description || activity.activity_type}</td>
                    <td class="px-4 py-3 text-sm text-gray-300">${activity.email || activity.username || 'نامشخص'}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 text-xs rounded-full ${this.getSeverityColor(activity.severity)}">
                            ${this.getSeverityText(activity.severity)}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-400">${this.formatDate(activity.created_at)}</td>
                </tr>
            `).join('');
        } else if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-400">فعالیت مشکوکی یافت نشد</td></tr>';
        }
        
        console.log('✅ Suspicious activities loaded from real API');
        
    } catch (error) {
        console.error('❌ Error loading suspicious activities:', error);
    }
}

// Fixed pagination
prevUsersPage() {
    if (this.currentUsersPage > 1) {
        this.currentUsersPage--;
        this.loadUsers();
    }
}

nextUsersPage() {
    if (this.usersPagination && this.currentUsersPage < this.usersPagination.totalPages) {
        this.currentUsersPage++;
        this.loadUsers();
    }
}
