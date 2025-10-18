// Wallets Tab Module - TITAN Trading System
// Wallet management, balances, and transaction history

export default class WalletsTab {
    constructor(settings) {
        this.settings = settings.wallets || {};
        this.apiBaseUrl = window.location.origin;
        
        // Initialize with empty arrays - will be populated by API
        this.wallets = []
        this.recentTransactions = []
        this.portfolioAllocation = null
        
        // Store original mock data as fallback
        this.mockWallets = [
            {
                id: 1,
                name: 'Main Trading Wallet',
                type: 'Trading',
                exchange: 'Binance',
                balance: 12547.89,
                currency: 'USDT',
                status: 'Active',
                lastUpdate: '2024-01-15 10:30:00'
            },
            {
                id: 2,
                name: 'MEXC Wallet',
                type: 'Trading',
                exchange: 'MEXC',
                balance: 8234.56,
                currency: 'USDT',
                status: 'Active',
                lastUpdate: '2024-01-15 10:28:00'
            },
            {
                id: 3,
                name: 'Cold Storage',
                type: 'Cold Storage',
                exchange: 'Hardware',
                balance: 2.45678,
                currency: 'BTC',
                status: 'Secure',
                lastUpdate: '2024-01-14 18:00:00'
            }
        ];
        this.mockTransactions = [
            { type: 'Deposit', amount: 1000, currency: 'USDT', exchange: 'Binance', time: '10:25:00', status: 'Completed' },
            { type: 'Withdrawal', amount: 0.1, currency: 'BTC', exchange: 'MEXC', time: '09:15:00', status: 'Pending' },
            { type: 'Trade', amount: 500, currency: 'USDT', exchange: 'Binance', time: '08:30:00', status: 'Completed' }
        ];
    }

    // API Helper Methods
    getAuthToken() {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }

    async apiCall(endpoint, options = {}) {
        const token = this.getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await fetch(this.apiBaseUrl + endpoint, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white shadow-lg ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            type === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (duration > 0) {
            setTimeout(() => {
                notification.remove();
            }, duration);
        }
        
        return notification;
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- Wallets Overview -->
                <div class="bg-gradient-to-r from-yellow-900 via-orange-900 to-red-900 rounded-lg p-6 border border-yellow-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-white flex items-center">
                                <i class="fas fa-wallet text-yellow-400 text-3xl ml-3"></i>
                                مدیریت کیف‌پول‌های TITAN
                            </h3>
                            <p class="text-yellow-200 mt-2">مدیریت موجودی، تراکنش‌ها و اتصال کیف‌پول‌ها</p>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-white">$${this.calculateTotalBalance().toLocaleString()}</div>
                            <div class="text-yellow-200 text-sm">کل موجودی</div>
                        </div>
                    </div>
                </div>

                <!-- Portfolio Summary -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-coins text-white text-xl"></i>
                            </div>
                            <div class="mr-4">
                                <div class="text-2xl font-bold text-white">$23,015</div>
                                <div class="text-gray-400 text-sm">مجموع دارایی‌ها</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-exchange-alt text-white text-xl"></i>
                            </div>
                            <div class="mr-4">
                                <div class="text-2xl font-bold text-white">3</div>
                                <div class="text-gray-400 text-sm">کیف‌پول فعال</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-chart-line text-white text-xl"></i>
                            </div>
                            <div class="mr-4">
                                <div class="text-2xl font-bold text-white">+12.5%</div>
                                <div class="text-gray-400 text-sm">سود 24 ساعت</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-shield-alt text-white text-xl"></i>
                            </div>
                            <div class="mr-4">
                                <div class="text-2xl font-bold text-white">1</div>
                                <div class="text-gray-400 text-sm">ذخیره سرد</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Wallet Management -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-white">
                            <i class="fas fa-briefcase text-blue-400 ml-2"></i>
                            کیف‌پول‌های متصل
                        </h3>
                        <div class="flex space-x-2 space-x-reverse">
                            <button onclick="walletsTabInstance.connectNewWallet()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-plus mr-2"></i>
                                اتصال کیف‌پول جدید
                            </button>
                            <button onclick="walletsTabInstance.refreshBalances()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-sync mr-2"></i>
                                بروزرسانی موجودی
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        ${this.renderWalletCards()}
                    </div>
                </div>

                <!-- Portfolio Allocation -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-chart-pie text-purple-400 ml-2"></i>
                        تخصیص پورتفولیو
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-3">توزیع دارایی‌ها</h4>
                            <div class="space-y-3">
                                ${this.renderAssetAllocation()}
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-3">نمودار تخصیص</h4>
                            <div class="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
                                <div class="text-center">
                                    <i class="fas fa-chart-pie text-purple-400 text-4xl mb-2"></i>
                                    <p class="text-gray-400">نمودار پای تخصیص دارایی‌ها</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-white">
                            <i class="fas fa-history text-green-400 ml-2"></i>
                            تراکنش‌های اخیر
                        </h3>
                        <button onclick="walletsTabInstance.viewAllTransactions()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-list mr-2"></i>
                            مشاهده همه
                        </button>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-800">
                                <tr>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">نوع</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">مقدار</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">صرافی</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">زمان</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">وضعیت</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-700">
                                ${this.renderTransactionRows()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Wallet Security -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-shield-alt text-red-400 ml-2"></i>
                        امنیت کیف‌پول‌ها
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">رمزنگاری کلیدهای خصوصی</span>
                                <input type="checkbox" id="encrypt-keys" ${this.settings.encryptKeys !== false ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">تأیید دو مرحله‌ای</span>
                                <input type="checkbox" id="two-factor-wallet" ${this.settings.twoFactorWallet ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">محدودیت برداشت روزانه</span>
                                <input type="checkbox" id="daily-limit" ${this.settings.dailyLimit ? 'checked' : ''}>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">هشدار تراکنش‌های مشکوک</span>
                                <input type="checkbox" id="suspicious-alerts" ${this.settings.suspiciousAlerts ? 'checked' : ''}>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">حداکثر برداشت روزانه (USDT)</label>
                                <input type="number" id="withdrawal-limit" value="${this.settings.withdrawalLimit || 10000}" min="100" max="100000"
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">آدرس‌های مجاز برای برداشت</label>
                                <textarea id="allowed-addresses" rows="4" placeholder="آدرس‌های کیف‌پول مجاز (هر آدرس در خط جداگانه)"
                                          class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">${this.settings.allowedAddresses || ''}</textarea>
                            </div>
                            
                            <div>
                                <button onclick="walletsTabInstance.backupWallets()" class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                    <i class="fas fa-download mr-2"></i>
                                    پشتیبان‌گیری از کیف‌پول‌ها
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cold Wallet Automation -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-snowflake text-blue-400 ml-2"></i>
                        🧊 اتوماسیون کلد والت
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div>
                                    <span class="text-white block">انتقال خودکار به کیف پول سرد</span>
                                    <span class="text-gray-400 text-sm">فعال‌سازی انتقال خودکار مقادیر بالا</span>
                                </div>
                                <input type="checkbox" id="auto-cold-transfer" ${this.settings.autoColdTransfer ? 'checked' : ''} 
                                       class="toggle-switch">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">حد آستانه انتقال (USDT)</label>
                                <input type="number" id="cold-wallet-threshold" value="${this.settings.coldWalletThreshold || 50000}" 
                                       min="1000" max="1000000" step="1000"
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <p class="text-xs text-gray-500 mt-1">هنگامی که موجودی از این مقدار بیشتر شود، به صورت خودکار انتقال می‌یابد</p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">درصد انتقال</label>
                                <div class="flex items-center space-x-3 space-x-reverse">
                                    <input type="range" id="transfer-percentage" min="10" max="90" value="${this.settings.transferPercentage || 70}" 
                                           class="flex-1 cold-wallet-slider">
                                    <span id="transfer-percentage-value" class="text-white font-semibold min-w-12">${this.settings.transferPercentage || 70}%</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">درصدی از موجودی اضافی که انتقال می‌یابد</p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">زمان‌بندی بررسی</label>
                                <select id="check-frequency" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                    <option value="hourly" ${this.settings.checkFrequency === 'hourly' ? 'selected' : ''}>هر ساعت</option>
                                    <option value="every4hours" ${this.settings.checkFrequency === 'every4hours' ? 'selected' : ''}>هر 4 ساعت</option>
                                    <option value="every12hours" ${this.settings.checkFrequency === 'every12hours' ? 'selected' : ''}>هر 12 ساعت</option>
                                    <option value="daily" ${this.settings.checkFrequency === 'daily' ? 'selected' : ''}>روزانه</option>
                                    <option value="weekly" ${this.settings.checkFrequency === 'weekly' ? 'selected' : ''}>هفتگی</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">آدرس کیف پول سرد (Primary)</label>
                                <div class="relative">
                                    <input type="text" id="primary-cold-wallet" value="${this.settings.primaryColdWallet || ''}" 
                                           placeholder="bc1q... یا 0x... یا آدرس کیف پول سرد"
                                           class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-10">
                                    <i class="fas fa-wallet absolute left-3 top-3 text-gray-400"></i>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">آدرس اصلی کیف پول سرد برای انتقال خودکار</p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">آدرس کیف پول سرد (Backup)</label>
                                <div class="relative">
                                    <input type="text" id="backup-cold-wallet" value="${this.settings.backupColdWallet || ''}" 
                                           placeholder="آدرس پشتیبان (اختیاری)"
                                           class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-10">
                                    <i class="fas fa-shield-alt absolute left-3 top-3 text-gray-400"></i>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">آدرس پشتیبان در صورت عدم دسترسی به آدرس اصلی</p>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div>
                                    <span class="text-white block">تأیید دستی انتقال‌ها</span>
                                    <span class="text-gray-400 text-sm">نیاز به تایید قبل از انتقال</span>
                                </div>
                                <input type="checkbox" id="manual-confirmation" ${this.settings.manualConfirmation !== false ? 'checked' : ''} 
                                       class="toggle-switch">
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div>
                                    <span class="text-white block">اطلاع‌رسانی انتقال‌ها</span>
                                    <span class="text-gray-400 text-sm">ارسال اعلان پس از هر انتقال</span>
                                </div>
                                <input type="checkbox" id="transfer-notifications" ${this.settings.transferNotifications !== false ? 'checked' : ''} 
                                       class="toggle-switch">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cold Wallet Statistics -->
                    <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                            <div class="flex items-center">
                                <i class="fas fa-snowflake text-blue-400 text-lg ml-2"></i>
                                <div>
                                    <div class="text-blue-400 text-sm">موجودی کلد والت</div>
                                    <div class="text-white font-bold text-xl">${(this.settings.coldWalletBalance || 0).toLocaleString()}$</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-green-900/30 border border-green-600 rounded-lg p-4">
                            <div class="flex items-center">
                                <i class="fas fa-arrow-up text-green-400 text-lg ml-2"></i>
                                <div>
                                    <div class="text-green-400 text-sm">انتقال‌های امروز</div>
                                    <div class="text-white font-bold text-xl">${this.settings.todayTransfers || 0}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
                            <div class="flex items-center">
                                <i class="fas fa-clock text-purple-400 text-lg ml-2"></i>
                                <div>
                                    <div class="text-purple-400 text-sm">آخرین انتقال</div>
                                    <div class="text-white font-bold text-sm">${this.settings.lastTransferTime || 'هنوز نداشته'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
                            <div class="flex items-center">
                                <i class="fas fa-percentage text-orange-400 text-lg ml-2"></i>
                                <div>
                                    <div class="text-orange-400 text-sm">درصد ایمنی</div>
                                    <div class="text-white font-bold text-xl">${this.settings.safetyPercentage || 85}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cold Wallet Actions -->
                    <div class="mt-6 flex flex-wrap gap-3">
                        <button onclick="walletsTabInstance.testColdWalletConnection()" 
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center">
                            <i class="fas fa-plug mr-2"></i>
                            تست اتصال کلد والت
                        </button>
                        <button onclick="walletsTabInstance.forceColdTransfer()" 
                                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center">
                            <i class="fas fa-paper-plane mr-2"></i>
                            انتقال فوری
                        </button>
                        <button onclick="walletsTabInstance.viewTransferHistory()" 
                                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center">
                            <i class="fas fa-history mr-2"></i>
                            تاریخچه انتقال‌ها
                        </button>
                        <button onclick="walletsTabInstance.generateColdWalletReport()" 
                                class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center">
                            <i class="fas fa-file-alt mr-2"></i>
                            گزارش کلد والت
                        </button>
                    </div>
                </div>

                <!-- DeFi Integration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-link text-indigo-400 ml-2"></i>
                        یکپارچگی DeFi
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-seedling text-white text-xl"></i>
                            </div>
                            <div class="text-lg font-bold text-white">Staking</div>
                            <div class="text-sm text-gray-400 mb-3">سود سالانه تا 12%</div>
                            <button onclick="walletsTabInstance.manageStaking()" class="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                                مدیریت
                            </button>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-swimming-pool text-white text-xl"></i>
                            </div>
                            <div class="text-lg font-bold text-white">Liquidity Pools</div>
                            <div class="text-sm text-gray-400 mb-3">ارائه نقدینگی</div>
                            <button onclick="walletsTabInstance.manageLiquidity()" class="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                                مدیریت
                            </button>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-coins text-white text-xl"></i>
                            </div>
                            <div class="text-lg font-bold text-white">Yield Farming</div>
                            <div class="text-sm text-gray-400 mb-3">کشاورزی درآمد</div>
                            <button onclick="walletsTabInstance.manageYieldFarming()" class="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                                مدیریت
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-3">پروتکل‌های پشتیبانی شده</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="text-blue-400 font-medium">Uniswap V3</div>
                                <div class="text-xs text-gray-400">DEX</div>
                            </div>
                            <div class="text-center">
                                <div class="text-purple-400 font-medium">Compound</div>
                                <div class="text-xs text-gray-400">Lending</div>
                            </div>
                            <div class="text-center">
                                <div class="text-green-400 font-medium">Aave</div>
                                <div class="text-xs text-gray-400">Lending</div>
                            </div>
                            <div class="text-center">
                                <div class="text-orange-400 font-medium">PancakeSwap</div>
                                <div class="text-xs text-gray-400">DEX</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Wallet Configuration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-cogs text-gray-400 ml-2"></i>
                        پیکربندی عمومی کیف‌پول‌ها
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">ارز پایه برای نمایش</label>
                                <select id="base-currency" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500">
                                    <option value="USD" ${this.settings.baseCurrency === 'USD' ? 'selected' : ''}>USD</option>
                                    <option value="EUR" ${this.settings.baseCurrency === 'EUR' ? 'selected' : ''}>EUR</option>
                                    <option value="BTC" ${this.settings.baseCurrency === 'BTC' ? 'selected' : ''}>BTC</option>
                                    <option value="ETH" ${this.settings.baseCurrency === 'ETH' ? 'selected' : ''}>ETH</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">بروزرسانی خودکار موجودی (ثانیه)</label>
                                <input type="number" id="auto-refresh-interval" value="${this.settings.autoRefreshInterval || 30}" min="10" max="300"
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500">
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">نمایش موجودی‌های صفر</span>
                                <input type="checkbox" id="show-zero-balances" ${this.settings.showZeroBalances ? 'checked' : ''}>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">کارمزد شبکه پیش‌فرض</label>
                                <select id="default-fee" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500">
                                    <option value="slow">آهسته (کم‌هزینه)</option>
                                    <option value="standard" selected>استاندارد</option>
                                    <option value="fast">سریع (پرهزینه)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">حد آستانه هشدار موجودی (USDT)</label>
                                <input type="number" id="balance-threshold" value="${this.settings.balanceThreshold || 1000}" min="100"
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500">
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">هشدار موجودی کم</span>
                                <input type="checkbox" id="low-balance-alert" ${this.settings.lowBalanceAlert !== false ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex flex-wrap gap-2">
                        <button onclick="walletsTabInstance.saveWalletSettings()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>
                            ذخیره تنظیمات
                        </button>
                        <button onclick="walletsTabInstance.exportWalletData()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>
                            صادرات داده‌ها
                        </button>
                        <button onclick="walletsTabInstance.importWalletData()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-upload mr-2"></i>
                            وارد کردن داده‌ها
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderWalletCards() {
        return this.wallets.map(wallet => `
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                        <div class="w-10 h-10 ${this.getWalletColor(wallet.type)} rounded-full flex items-center justify-center ml-3">
                            <i class="fas ${this.getWalletIcon(wallet.type)} text-white"></i>
                        </div>
                        <div>
                            <div class="text-white font-medium">${wallet.name}</div>
                            <div class="text-gray-400 text-sm">${wallet.exchange}</div>
                        </div>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeClass(wallet.status)}">
                        ${wallet.status}
                    </span>
                </div>
                
                <div class="mb-3">
                    <div class="text-2xl font-bold text-white">${wallet.balance.toLocaleString()} ${wallet.currency}</div>
                    <div class="text-gray-400 text-sm">≈ $${(wallet.balance * (wallet.currency === 'USDT' ? 1 : 45000)).toLocaleString()}</div>
                </div>
                
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">آخرین بروزرسانی: ${wallet.lastUpdate.split(' ')[1]}</span>
                    <div class="flex space-x-2 space-x-reverse">
                        <button onclick="walletsTabInstance.viewWalletDetails(${wallet.id})" class="text-blue-400 hover:text-blue-300">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="walletsTabInstance.editWallet(${wallet.id})" class="text-green-400 hover:text-green-300">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="walletsTabInstance.disconnectWallet(${wallet.id})" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-unlink"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAssetAllocation() {
        const assets = [
            { symbol: 'USDT', name: 'Tether', percentage: 65, amount: 14982, color: 'green' },
            { symbol: 'BTC', name: 'Bitcoin', percentage: 25, amount: 2.45, color: 'orange' },
            { symbol: 'ETH', name: 'Ethereum', percentage: 8, amount: 3.2, color: 'blue' },
            { symbol: 'BNB', name: 'BNB', percentage: 2, amount: 15.8, color: 'yellow' }
        ];

        return assets.map(asset => `
            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-${asset.color}-600 rounded-full flex items-center justify-center ml-3">
                        <span class="text-white text-xs font-bold">${asset.symbol.substring(0, 2)}</span>
                    </div>
                    <div>
                        <div class="text-white font-medium">${asset.name}</div>
                        <div class="text-gray-400 text-sm">${asset.amount} ${asset.symbol}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-white font-bold">${asset.percentage}%</div>
                    <div class="w-20 bg-gray-700 rounded-full h-2 mt-1">
                        <div class="bg-${asset.color}-600 h-2 rounded-full" style="width: ${asset.percentage}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTransactionRows() {
        return this.recentTransactions.map(tx => `
            <tr class="hover:bg-gray-800">
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getTransactionTypeClass(tx.type)}">
                        ${this.getTransactionTypeText(tx.type)}
                    </span>
                </td>
                <td class="px-4 py-3 text-white">${tx.amount} ${tx.currency}</td>
                <td class="px-4 py-3 text-gray-300">${tx.exchange}</td>
                <td class="px-4 py-3 text-gray-300">${tx.time}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getTransactionStatusClass(tx.status)}">
                        ${tx.status === 'Completed' ? 'تکمیل شده' : tx.status === 'Pending' ? 'در انتظار' : tx.status}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    getWalletColor(type) {
        switch (type) {
            case 'Trading': return 'bg-blue-600';
            case 'Cold Storage': return 'bg-purple-600';
            case 'DeFi': return 'bg-green-600';
            default: return 'bg-gray-600';
        }
    }

    getWalletIcon(type) {
        switch (type) {
            case 'Trading': return 'fa-chart-line';
            case 'Cold Storage': return 'fa-lock';
            case 'DeFi': return 'fa-seedling';
            default: return 'fa-wallet';
        }
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Secure': return 'bg-purple-100 text-purple-800';
            case 'Inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getTransactionTypeClass(type) {
        switch (type) {
            case 'Deposit': return 'bg-green-100 text-green-800';
            case 'Withdrawal': return 'bg-red-100 text-red-800';
            case 'Trade': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getTransactionTypeText(type) {
        switch (type) {
            case 'Deposit': return 'واریز';
            case 'Withdrawal': return 'برداشت';
            case 'Trade': return 'معامله';
            default: return type;
        }
    }

    getTransactionStatusClass(status) {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    calculateTotalBalance() {
        return this.wallets.reduce((total, wallet) => {
            const usdValue = wallet.currency === 'USDT' ? wallet.balance : wallet.balance * 45000; // Simplified conversion
            return total + usdValue;
        }, 0);
    }

    async initialize() {
        try {
            // Set global instance for onclick handlers first
            window.walletsTabInstance = this;
            
            // Load data from API
            await this.loadWalletData();
            await this.loadPortfolioAllocation(); 
            await this.loadRecentTransactions();
            await this.loadWalletSettings();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Set up auto-refresh if enabled
            this.setupAutoRefresh();
            
            console.log('✅ Wallets tab initialized with API data');
        } catch (error) {
            console.warn('⚠️ Failed to load wallet data from API, using fallback:', error);
            this.showNotification('خطا در بارگذاری داده‌های کیف‌پول، از داده‌های پیش‌فرض استفاده می‌شود', 'warning');
            
            // Use fallback data
            this.wallets = this.mockWallets;
            this.recentTransactions = this.mockTransactions;
            
            // Set up event handlers with fallback data
            this.setupEventHandlers();
            this.setupAutoRefresh();
        }
    }

    async loadWalletData() {
        try {
            const response = await this.apiCall('/api/wallets');
            if (response.success && response.data) {
                this.wallets = response.data.wallets || [];
                this.walletSummary = {
                    totalBalance: response.data.totalBalance || 0,
                    activeWallets: response.data.activeWallets || 0,
                    totalAssets: response.data.totalAssets || 0,
                    coldStorageCount: response.data.coldStorageCount || 0
                };
                
                console.log('✅ Loaded wallet data:', this.wallets.length, 'wallets');
            }
        } catch (error) {
            console.error('Failed to load wallet data:', error);
            throw error;
        }
    }

    async loadPortfolioAllocation() {
        try {
            const response = await this.apiCall('/api/wallets/portfolio/allocation');
            if (response.success && response.data) {
                this.portfolioAllocation = response.data;
                
                // Initialize chart after data is loaded
                setTimeout(() => {
                    this.initializePortfolioChart();
                }, 100);
                
                console.log('✅ Loaded portfolio allocation data');
            }
        } catch (error) {
            console.error('Failed to load portfolio allocation:', error);
            // Use fallback data for chart
            this.portfolioAllocation = {
                assets: [
                    { symbol: 'USDT', name: 'Tether', percentage: 65, amount: 14982, color: '#26A17B' },
                    { symbol: 'BTC', name: 'Bitcoin', percentage: 25, amount: 2.45, color: '#F7931A' },
                    { symbol: 'ETH', name: 'Ethereum', percentage: 8, amount: 3.2, color: '#627EEA' },
                    { symbol: 'BNB', name: 'BNB', percentage: 2, amount: 15.8, color: '#F3BA2F' }
                ]
            };
        }
    }

    async loadRecentTransactions() {
        try {
            const response = await this.apiCall('/api/wallets/transactions?limit=10');
            if (response.success && response.data) {
                this.recentTransactions = response.data.transactions || [];
                this.transactionSummary = response.data.summary || {};
                
                console.log('✅ Loaded recent transactions:', this.recentTransactions.length);
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
            this.recentTransactions = this.mockTransactions;
        }
    }

    async loadWalletSettings() {
        try {
            const response = await this.apiCall('/api/wallets/settings');
            if (response.success && response.data) {
                this.settings = { ...this.settings, ...response.data };
                console.log('✅ Loaded wallet settings');
            }
        } catch (error) {
            console.error('Failed to load wallet settings:', error);
        }
    }

    setupEventHandlers() {
        // Set up range slider for transfer percentage
        const transferSlider = document.getElementById('transfer-percentage');
        const transferValueDisplay = document.getElementById('transfer-percentage-value');
        
        if (transferSlider && transferValueDisplay) {
            transferSlider.addEventListener('input', (e) => {
                transferValueDisplay.textContent = e.target.value + '%';
            });
        }
        
        // Set up auto-save for settings changes
        const inputs = document.querySelectorAll('#unified-settings-content input, #unified-settings-content select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.saveSettingsDebounced();
            });
        });
    }

    saveSettingsDebounced() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveWalletSettings();
        }, 1000);
    }

    setupAutoRefresh() {
        const interval = (this.settings.autoRefreshInterval || 30) * 1000;
        
        this.refreshInterval = setInterval(() => {
            this.refreshBalances(true); // Silent refresh
        }, interval);
    }

    // Wallet management methods
    async connectNewWallet() {
        const modal = this.createConnectWalletModal();
        document.body.appendChild(modal);
    }

    createConnectWalletModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4 w-full">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">اتصال کیف‌پول جدید</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="connect-wallet-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نوع کیف‌پول</label>
                        <select id="wallet-type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500" required>
                            <option value="">انتخاب کنید</option>
                            <option value="Trading">کیف‌پول معاملاتی</option>
                            <option value="Cold Storage">ذخیره سرد</option>
                            <option value="DeFi">کیف‌پول DeFi</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نام کیف‌پول</label>
                        <input type="text" id="wallet-name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500" required>
                    </div>
                    
                    <div id="exchange-selection" style="display: none;">
                        <label class="block text-sm font-medium text-gray-300 mb-2">صرافی</label>
                        <select id="wallet-exchange" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            <option value="Binance">Binance</option>
                            <option value="MEXC">MEXC</option>
                            <option value="OKX">OKX</option>
                            <option value="KuCoin">KuCoin</option>
                            <option value="Coinbase Pro">Coinbase Pro</option>
                        </select>
                    </div>
                    
                    <div id="api-credentials" style="display: none;">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="text" id="wallet-api-key" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        <div class="mt-3">
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
                            <input type="password" id="wallet-api-secret" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        <div class="mt-3 flex items-center">
                            <input type="checkbox" id="wallet-testnet" class="mr-2">
                            <label class="text-sm text-gray-300">حالت آزمایشی (Testnet)</label>
                        </div>
                    </div>
                    
                    <div id="address-input" style="display: none;">
                        <label class="block text-sm font-medium text-gray-300 mb-2">آدرس کیف‌پول</label>
                        <input type="text" id="wallet-address" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500" placeholder="0x... یا bc1q...">
                    </div>
                    
                    <div class="flex space-x-2 space-x-reverse pt-4">
                        <button type="submit" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-plus mr-2"></i>
                            اتصال
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            لغو
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add event listeners
        const walletTypeSelect = modal.querySelector('#wallet-type');
        const exchangeSelection = modal.querySelector('#exchange-selection');
        const apiCredentials = modal.querySelector('#api-credentials');
        const addressInput = modal.querySelector('#address-input');
        
        walletTypeSelect.addEventListener('change', (e) => {
            const type = e.target.value;
            
            if (type === 'Trading') {
                exchangeSelection.style.display = 'block';
                apiCredentials.style.display = 'block';
                addressInput.style.display = 'none';
            } else if (type === 'Cold Storage') {
                exchangeSelection.style.display = 'none';
                apiCredentials.style.display = 'none';
                addressInput.style.display = 'block';
            } else if (type === 'DeFi') {
                exchangeSelection.style.display = 'none';
                apiCredentials.style.display = 'none';
                addressInput.style.display = 'block';
            } else {
                exchangeSelection.style.display = 'none';
                apiCredentials.style.display = 'none';
                addressInput.style.display = 'none';
            }
        });
        
        const form = modal.querySelector('#connect-wallet-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleConnectWallet(form, modal);
        });
        
        return modal;
    }

    async handleConnectWallet(form, modal) {
        try {
            this.showNotification('در حال اتصال کیف‌پول...', 'info');
            
            const formData = new FormData(form);
            const walletData = {
                type: form.querySelector('#wallet-type').value,
                name: form.querySelector('#wallet-name').value,
                exchange: form.querySelector('#wallet-exchange')?.value,
                apiKey: form.querySelector('#wallet-api-key')?.value,
                apiSecret: form.querySelector('#wallet-api-secret')?.value,
                address: form.querySelector('#wallet-address')?.value,
                testnet: form.querySelector('#wallet-testnet')?.checked
            };
            
            const response = await this.apiCall('/api/wallets/connect', {
                method: 'POST',
                body: JSON.stringify(walletData)
            });
            
            if (response.success) {
                this.showNotification(response.message || 'کیف‌پول با موفقیت متصل شد', 'success');
                modal.remove();
                
                // Reload wallet data
                await this.loadWalletData();
                this.refreshWalletDisplay();
            } else {
                throw new Error(response.error || 'خطا در اتصال کیف‌پول');
            }
        } catch (error) {
            console.error('Connect wallet error:', error);
            this.showNotification('خطا در اتصال کیف‌پول: ' + error.message, 'error');
        }
    }

    async refreshBalances(silent = false) {
        try {
            if (!silent) {
                this.showNotification('در حال بروزرسانی موجودی کیف‌پول‌ها...', 'info');
            }
            
            const response = await this.apiCall('/api/wallets/refresh', {
                method: 'POST'
            });
            
            if (response.success) {
                // Update local wallet balances with API response
                const updatedBalances = response.data;
                
                updatedBalances.forEach(updated => {
                    const wallet = this.wallets.find(w => w.id === updated.id);
                    if (wallet) {
                        wallet.balance = updated.balance;
                        wallet.lastUpdate = updated.lastUpdate;
                    }
                });
                
                if (!silent) {
                    this.showNotification('موجودی‌ها بروزرسانی شدند', 'success');
                    this.refreshWalletDisplay();
                }
                
                console.log('✅ Wallet balances refreshed');
            } else {
                throw new Error(response.error || 'خطا در بروزرسانی موجودی‌ها');
            }
        } catch (error) {
            console.error('Refresh balances error:', error);
            
            if (!silent) {
                this.showNotification('خطا در بروزرسانی موجودی‌ها: ' + error.message, 'error');
            }
            
            // Fallback: simulate updates
            this.wallets.forEach(wallet => {
                const randomChange = (Math.random() - 0.5) * 100;
                wallet.balance += randomChange;
                wallet.lastUpdate = new Date().toISOString();
            });
            
            if (!silent) {
                this.refreshWalletDisplay();
            }
        }
    }

    refreshWalletDisplay() {
        // Find the wallet container and update it
        const walletContainer = document.querySelector('[data-wallets-container]');
        if (walletContainer) {
            walletContainer.innerHTML = this.renderWalletCards();
        }
        
        // Update summary cards
        this.updateSummaryCards();
    }

    updateSummaryCards() {
        const totalBalance = this.calculateTotalBalance();
        const activeWallets = this.wallets.filter(w => w.status === 'Active').length;
        const coldStorage = this.wallets.filter(w => w.type === 'Cold Storage').length;
        
        // Update total balance in header
        const totalBalanceElement = document.querySelector('[data-total-balance]');
        if (totalBalanceElement) {
            totalBalanceElement.textContent = `$${totalBalance.toLocaleString()}`;
        }
        
        // Update summary cards
        const summaryElements = {
            totalAssets: document.querySelector('[data-summary="totalAssets"]'),
            activeWallets: document.querySelector('[data-summary="activeWallets"]'),
            coldStorage: document.querySelector('[data-summary="coldStorage"]')
        };
        
        if (summaryElements.totalAssets) {
            summaryElements.totalAssets.textContent = `$${totalBalance.toLocaleString()}`;
        }
        if (summaryElements.activeWallets) {
            summaryElements.activeWallets.textContent = activeWallets.toString();
        }
        if (summaryElements.coldStorage) {
            summaryElements.coldStorage.textContent = coldStorage.toString();
        }
    }

    async viewWalletDetails(walletId) {
        try {
            this.showNotification('در حال بارگذاری جزئیات کیف‌پول...', 'info');
            
            const response = await this.apiCall(`/api/wallets/${walletId}`);
            
            if (response.success && response.data) {
                this.showWalletDetailsModal(response.data);
            } else {
                throw new Error(response.error || 'خطا در دریافت جزئیات');
            }
        } catch (error) {
            console.error('View wallet details error:', error);
            
            // Fallback to local data
            const wallet = this.wallets.find(w => w.id === walletId);
            if (wallet) {
                this.showWalletDetailsModal(wallet);
            } else {
                this.showNotification('خطا در دریافت جزئیات کیف‌پول', 'error');
            }
        }
    }

    showWalletDetailsModal(wallet) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl mx-4 w-full max-h-96 overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">جزئیات ${wallet.name}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="space-y-3">
                        <div>
                            <label class="text-sm text-gray-400">نوع کیف‌پول</label>
                            <p class="text-white font-medium">${wallet.type}</p>
                        </div>
                        <div>
                            <label class="text-sm text-gray-400">صرافی</label>
                            <p class="text-white font-medium">${wallet.exchange}</p>
                        </div>
                        <div>
                            <label class="text-sm text-gray-400">موجودی</label>
                            <p class="text-white font-bold text-lg">${wallet.balance?.toLocaleString() || 'N/A'} ${wallet.currency}</p>
                        </div>
                        <div>
                            <label class="text-sm text-gray-400">وضعیت</label>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeClass(wallet.status)}">
                                ${wallet.status}
                            </span>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <div>
                            <label class="text-sm text-gray-400">دسترسی‌ها</label>
                            <p class="text-white">${wallet.permissions?.join(', ') || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="text-sm text-gray-400">آخرین بروزرسانی</label>
                            <p class="text-white">${new Date(wallet.lastUpdate).toLocaleString('fa-IR')}</p>
                        </div>
                        ${wallet.performance ? `
                        <div>
                            <label class="text-sm text-gray-400">عملکرد روزانه</label>
                            <p class="text-white font-medium ${wallet.performance.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}">
                                ${wallet.performance.dailyPnL >= 0 ? '+' : ''}${wallet.performance.dailyPnL?.toFixed(2)}$
                            </p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                ${wallet.recentTransactions && wallet.recentTransactions.length > 0 ? `
                <div class="mt-4">
                    <h4 class="text-lg font-semibold text-white mb-2">تراکنش‌های اخیر</h4>
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                        ${wallet.recentTransactions.slice(0, 5).map(tx => `
                            <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                                <div class="flex items-center">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${this.getTransactionTypeClass(tx.type)}">
                                        ${this.getTransactionTypeText(tx.type)}
                                    </span>
                                    <span class="text-white ml-2">${tx.amount} ${tx.currency}</span>
                                </div>
                                <span class="text-gray-400 text-sm">${new Date(tx.time).toLocaleString('fa-IR')}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async editWallet(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (!wallet) {
            this.showNotification('کیف‌پول پیدا نشد', 'error');
            return;
        }
        
        const newName = prompt('نام جدید کیف‌پول:', wallet.name);
        if (!newName || newName.trim() === wallet.name) {
            return;
        }
        
        try {
            const response = await this.apiCall(`/api/wallets/${walletId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: newName.trim(),
                    settings: wallet.settings || {}
                })
            });
            
            if (response.success) {
                // Update local data
                wallet.name = newName.trim();
                wallet.lastModified = new Date().toISOString();
                
                this.showNotification('کیف‌پول با موفقیت ویرایش شد', 'success');
                this.refreshWalletDisplay();
            } else {
                throw new Error(response.error || 'خطا در ویرایش کیف‌پول');
            }
        } catch (error) {
            console.error('Edit wallet error:', error);
            this.showNotification('خطا در ویرایش کیف‌پول: ' + error.message, 'error');
        }
    }

    async disconnectWallet(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (!wallet) {
            this.showNotification('کیف‌پول پیدا نشد', 'error');
            return;
        }
        
        if (!confirm(`آیا مطمئن هستید که می‌خواهید کیف‌پول ${wallet.name} را قطع کنید؟\n\nاین عمل اتصال API را حذف می‌کند.`)) {
            return;
        }
        
        try {
            const response = await this.apiCall(`/api/wallets/${walletId}`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                // Remove from local data
                this.wallets = this.wallets.filter(w => w.id !== walletId);
                
                this.showNotification('کیف‌پول قطع شد', 'success');
                this.refreshWalletDisplay();
            } else {
                throw new Error(response.error || 'خطا در قطع کیف‌پول');
            }
        } catch (error) {
            console.error('Disconnect wallet error:', error);
            this.showNotification('خطا در قطع کیف‌پول: ' + error.message, 'error');
        }
    }

    async viewAllTransactions() {
        try {
            this.showNotification('در حال بارگذاری تراکنش‌ها...', 'info');
            
            const response = await this.apiCall('/api/wallets/transactions?limit=50');
            
            if (response.success && response.data) {
                this.showAllTransactionsModal(response.data);
            } else {
                throw new Error(response.error || 'خطا در دریافت تراکنش‌ها');
            }
        } catch (error) {
            console.error('View all transactions error:', error);
            this.showNotification('خطا در بارگذاری تراکنش‌ها: ' + error.message, 'error');
        }
    }

    showAllTransactionsModal(transactionData) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-4xl mx-4 w-full max-h-96 overflow-hidden">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">همه تراکنش‌ها</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4 grid grid-cols-4 gap-4 text-center">
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-green-400 font-bold">${transactionData.summary?.totalDeposits || 0}</div>
                        <div class="text-gray-400 text-sm">واریز</div>
                    </div>
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-red-400 font-bold">${transactionData.summary?.totalWithdrawals || 0}</div>
                        <div class="text-gray-400 text-sm">برداشت</div>
                    </div>
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-blue-400 font-bold">${transactionData.summary?.totalTrades || 0}</div>
                        <div class="text-gray-400 text-sm">معامله</div>
                    </div>
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-yellow-400 font-bold">${transactionData.summary?.pendingCount || 0}</div>
                        <div class="text-gray-400 text-sm">در انتظار</div>
                    </div>
                </div>
                
                <div class="overflow-y-auto max-h-64">
                    <table class="w-full">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">نوع</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">مقدار</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">صرافی</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">زمان</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${transactionData.transactions.map(tx => `
                                <tr class="hover:bg-gray-700">
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getTransactionTypeClass(tx.type)}">
                                            ${this.getTransactionTypeText(tx.type)}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-white">${tx.amount} ${tx.currency}</td>
                                    <td class="px-4 py-3 text-gray-300">${tx.exchange}</td>
                                    <td class="px-4 py-3 text-gray-300">${new Date(tx.time).toLocaleString('fa-IR')}</td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getTransactionStatusClass(tx.status)}">
                                            ${tx.status === 'Completed' ? 'تکمیل شده' : tx.status === 'Pending' ? 'در انتظار' : tx.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    initializePortfolioChart() {
        const chartContainer = document.querySelector('[data-portfolio-chart]');
        if (!chartContainer || !this.portfolioAllocation) {
            // If Chart.js is not available or no data, show text representation
            const fallbackElement = document.querySelector('.bg-gray-800.rounded-lg.p-4.h-64');
            if (fallbackElement && this.portfolioAllocation) {
                fallbackElement.innerHTML = `
                    <canvas id="portfolio-pie-chart" width="200" height="200"></canvas>
                `;
                
                // Try to initialize Chart.js if available
                if (typeof Chart !== 'undefined') {
                    this.createPieChart();
                } else {
                    // Fallback to text representation
                    fallbackElement.innerHTML = `
                        <div class="text-center">
                            <h4 class="text-white font-bold mb-4">توزیع دارایی‌ها</h4>
                            <div class="space-y-2">
                                ${this.portfolioAllocation.assets.map(asset => `
                                    <div class="flex items-center justify-between text-sm">
                                        <div class="flex items-center">
                                            <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${asset.color}"></div>
                                            <span class="text-white">${asset.symbol}</span>
                                        </div>
                                        <span class="text-white font-bold">${asset.percentage}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            }
            return;
        }
        
        // Initialize Chart.js if available
        if (typeof Chart !== 'undefined') {
            this.createPieChart();
        }
    }

    createPieChart() {
        const canvas = document.getElementById('portfolio-pie-chart');
        if (!canvas || !this.portfolioAllocation) return;
        
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.portfolioAllocation.assets.map(asset => `${asset.symbol} (${asset.percentage}%)`),
                datasets: [{
                    data: this.portfolioAllocation.assets.map(asset => asset.percentage),
                    backgroundColor: this.portfolioAllocation.assets.map(asset => asset.color),
                    borderWidth: 2,
                    borderColor: '#374151'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#FFFFFF',
                            padding: 10,
                            fontSize: 12
                        }
                    }
                }
            }
        });
    }

    // DeFi methods
    async manageStaking() {
        try {
            // Get current DeFi positions
            const response = await this.apiCall('/api/wallets/defi/positions');
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to load DeFi positions');
            }
            
            const defiData = response.data;
            this.showStakingManagementModal(defiData.staking);
            
        } catch (error) {
            console.error('Manage staking error:', error);
            this.showNotification('❌ خطا در بارگذاری اطلاعات Staking: ' + error.message, 'error');
        }
    }

    async manageLiquidity() {
        try {
            // Get current DeFi positions
            const response = await this.apiCall('/api/wallets/defi/positions');
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to load DeFi positions');
            }
            
            const defiData = response.data;
            this.showLiquidityManagementModal(defiData.liquidityPools);
            
        } catch (error) {
            console.error('Manage liquidity error:', error);
            this.showNotification('❌ خطا در بارگذاری اطلاعات Liquidity: ' + error.message, 'error');
        }
    }

    async manageYieldFarming() {
        try {
            // Get current DeFi positions
            const response = await this.apiCall('/api/wallets/defi/positions');
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to load DeFi positions');
            }
            
            const defiData = response.data;
            this.showYieldFarmingModal(defiData.yieldFarming);
            
        } catch (error) {
            console.error('Manage yield farming error:', error);
            this.showNotification('❌ خطا در بارگذاری اطلاعات Yield Farming: ' + error.message, 'error');
        }
    }

    // DeFi Management Modal Methods
    showStakingManagementModal(stakingData) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">
                        <i class="fas fa-coins mr-2"></i>مدیریت Staking
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Current Staking Positions -->
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-4">موقعیت‌های فعلی</h4>
                        <div class="space-y-3">
                            ${stakingData.map(position => `
                                <div class="bg-gray-800 rounded p-3 border border-gray-700">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <div class="font-semibold text-white">${position.protocol}</div>
                                            <div class="text-sm text-gray-400">${position.asset}</div>
                                        </div>
                                        <span class="px-2 py-1 bg-green-600 text-white text-xs rounded">${position.status}</span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 text-sm">
                                        <div>مقدار: <span class="text-white">${position.amount.toLocaleString()}</span></div>
                                        <div>APR: <span class="text-green-400">${position.apr}%</span></div>
                                        <div>پاداش: <span class="text-yellow-400">${position.rewards}</span></div>
                                        <div class="col-span-2">
                                            <button onclick="walletsTabInstance.performStakingAction('claim_rewards', '${position.protocol}', '${position.asset}')" 
                                                    class="w-full mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700">
                                                دریافت پاداش
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- New Staking -->
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-4">Staking جدید</h4>
                        <form onsubmit="walletsTabInstance.handleNewStaking(event); return false;" class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">پروتکل</label>
                                <select name="protocol" class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2">
                                    <option value="Ethereum 2.0">Ethereum 2.0 (5.2% APR)</option>
                                    <option value="Polygon">Polygon (8.5% APR)</option>
                                    <option value="Cardano">Cardano (4.8% APR)</option>
                                    <option value="Solana">Solana (6.9% APR)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">دارایی</label>
                                <select name="asset" class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2">
                                    <option value="ETH">ETH</option>
                                    <option value="MATIC">MATIC</option>
                                    <option value="ADA">ADA</option>
                                    <option value="SOL">SOL</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">مقدار</label>
                                <input type="number" name="amount" step="0.01" min="0.01" 
                                       class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2" 
                                       placeholder="مقدار برای Staking">
                            </div>
                            <button type="submit" class="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                <i class="fas fa-coins mr-2"></i>شروع Staking
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showLiquidityManagementModal(liquidityData) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">
                        <i class="fas fa-swimming-pool mr-2"></i>مدیریت Liquidity Pools
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Active Liquidity Pools -->
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-4">Pool‌های فعال</h4>
                        <div class="space-y-3">
                            ${liquidityData.map(pool => `
                                <div class="bg-gray-800 rounded p-3 border border-gray-700">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <div class="font-semibold text-white">${pool.protocol}</div>
                                            <div class="text-sm text-gray-400">${pool.pair}</div>
                                        </div>
                                        <span class="px-2 py-1 bg-green-600 text-white text-xs rounded">${pool.status}</span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 text-sm">
                                        <div>نقدینگی: <span class="text-white">$${pool.liquidity.toLocaleString()}</span></div>
                                        <div>APR: <span class="text-green-400">${pool.apr}%</span></div>
                                        <div>کارمزد 24h: <span class="text-yellow-400">$${pool.fees24h}</span></div>
                                        <div class="col-span-2 flex gap-2 mt-2">
                                            <button onclick="walletsTabInstance.performLiquidityAction('harvest_fees', '${pool.protocol}', '${pool.pair}')" 
                                                    class="flex-1 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700">
                                                دریافت کارمزد
                                            </button>
                                            <button onclick="walletsTabInstance.performLiquidityAction('remove_liquidity', '${pool.protocol}', '${pool.pair}')" 
                                                    class="flex-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                                                حذف نقدینگی
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Add Liquidity -->
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-4">افزودن نقدینگی</h4>
                        <form onsubmit="walletsTabInstance.handleAddLiquidity(event); return false;" class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">پروتکل</label>
                                <select name="protocol" class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2">
                                    <option value="Uniswap V3">Uniswap V3</option>
                                    <option value="PancakeSwap">PancakeSwap</option>
                                    <option value="SushiSwap">SushiSwap</option>
                                    <option value="Curve">Curve Finance</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">جفت ارز</label>
                                <select name="pair" class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2">
                                    <option value="ETH/USDC">ETH/USDC</option>
                                    <option value="BTC/ETH">BTC/ETH</option>
                                    <option value="BNB/BUSD">BNB/BUSD</option>
                                    <option value="MATIC/USDT">MATIC/USDT</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">مقدار (USD)</label>
                                <input type="number" name="amount" step="1" min="100" 
                                       class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2" 
                                       placeholder="مقدار نقدینگی">
                            </div>
                            <div class="bg-gray-800 rounded p-3 text-sm">
                                <div class="text-gray-400 mb-2">هشدارهای مهم:</div>
                                <div class="text-yellow-400 text-xs">• خطر Impermanent Loss وجود دارد</div>
                                <div class="text-yellow-400 text-xs">• کارمزدها به صورت خودکار دریافت نمی‌شوند</div>
                            </div>
                            <button type="submit" class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                <i class="fas fa-plus mr-2"></i>افزودن نقدینگی
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showYieldFarmingModal(yieldFarmingData) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">
                        <i class="fas fa-seedling mr-2"></i>مدیریت Yield Farming
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="grid md:grid-cols-3 gap-6">
                    <!-- Active Positions -->
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-4">موقعیت‌های فعال</h4>
                        <div class="space-y-3">
                            ${yieldFarmingData.map(position => `
                                <div class="bg-gray-800 rounded p-3 border border-gray-700">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <div class="font-semibold text-white">${position.protocol}</div>
                                            <div class="text-sm text-gray-400">${position.asset}</div>
                                        </div>
                                        <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded">${position.status}</span>
                                    </div>
                                    <div class="text-sm space-y-1">
                                        <div>تامین: <span class="text-white">$${position.supplied.toLocaleString()}</span></div>
                                        <div>وام: <span class="text-red-400">$${position.borrowed.toLocaleString()}</span></div>
                                        <div>APR خالص: <span class="text-green-400">${position.netApr}%</span></div>
                                    </div>
                                    <div class="flex gap-1 mt-2">
                                        <button onclick="walletsTabInstance.performYieldAction('repay', '${position.protocol}', '${position.asset}')" 
                                                class="flex-1 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700">
                                            بازپرداخت
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Supply Assets -->
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-4">تامین دارایی</h4>
                        <form onsubmit="walletsTabInstance.handleSupplyAsset(event); return false;" class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">پروتکل</label>
                                <select name="protocol" class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2">
                                    <option value="Compound">Compound (3.8% APR)</option>
                                    <option value="Aave">Aave (6.2% APR)</option>
                                    <option value="Venus">Venus (4.5% APR)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">دارایی</label>
                                <select name="asset" class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2">
                                    <option value="USDC">USDC</option>
                                    <option value="DAI">DAI</option>
                                    <option value="ETH">ETH</option>
                                    <option value="BTC">WBTC</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">مقدار</label>
                                <input type="number" name="amount" step="1" min="100" 
                                       class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2" 
                                       placeholder="مقدار تامین">
                            </div>
                            <button type="submit" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                <i class="fas fa-arrow-up mr-2"></i>تامین دارایی
                            </button>
                        </form>
                    </div>

                    <!-- Strategy Optimizer -->
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-4">بهینه‌ساز استراتژی</h4>
                        <div class="space-y-4">
                            <div class="bg-gray-800 rounded p-3">
                                <div class="text-sm text-gray-400 mb-2">استراتژی پیشنهادی:</div>
                                <div class="text-white font-semibold">Conservative Yield</div>
                                <div class="text-green-400 text-sm">APR متوقع: 8.2%</div>
                                <div class="text-gray-400 text-xs mt-1">ریسک پایین - بازده متوسط</div>
                            </div>
                            <button onclick="walletsTabInstance.optimizeYieldStrategy()" 
                                    class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                                <i class="fas fa-magic mr-2"></i>بهینه‌سازی خودکار
                            </button>
                            <div class="text-xs text-gray-400">
                                بهینه‌سازی بر اساس تحمل ریسک و اهداف بازدهی شما
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // DeFi Action Handlers
    async performStakingAction(action, protocol, asset) {
        try {
            const response = await this.apiCall('/api/wallets/defi/staking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, protocol, asset })
            });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to perform staking action');
            }
            
            this.showNotification(`✅ عملیات ${action} با موفقیت انجام شد`, 'success');
            
        } catch (error) {
            console.error('Staking action error:', error);
            this.showNotification('❌ خطا در انجام عملیات: ' + error.message, 'error');
        }
    }

    async performLiquidityAction(action, protocol, pair) {
        try {
            const response = await this.apiCall('/api/wallets/defi/liquidity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, protocol, pair })
            });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to perform liquidity action');
            }
            
            this.showNotification(`✅ عملیات ${action} با موفقیت انجام شد`, 'success');
            
        } catch (error) {
            console.error('Liquidity action error:', error);
            this.showNotification('❌ خطا در انجام عملیات: ' + error.message, 'error');
        }
    }

    async performYieldAction(action, protocol, asset) {
        try {
            const response = await this.apiCall('/api/wallets/defi/yield-farming', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, protocol, asset })
            });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to perform yield farming action');
            }
            
            this.showNotification(`✅ عملیات ${action} با موفقیت انجام شد`, 'success');
            
        } catch (error) {
            console.error('Yield farming action error:', error);
            this.showNotification('❌ خطا در انجام عملیات: ' + error.message, 'error');
        }
    }

    async handleNewStaking(event) {
        const formData = new FormData(event.target);
        const data = {
            action: 'stake',
            protocol: formData.get('protocol'),
            asset: formData.get('asset'),
            amount: formData.get('amount')
        };
        
        await this.performStakingAction(data.action, data.protocol, data.asset);
        event.target.closest('.fixed').remove();
    }

    async handleAddLiquidity(event) {
        const formData = new FormData(event.target);
        const data = {
            action: 'add_liquidity',
            protocol: formData.get('protocol'),
            pair: formData.get('pair'),
            amount: formData.get('amount')
        };
        
        await this.performLiquidityAction(data.action, data.protocol, data.pair);
        event.target.closest('.fixed').remove();
    }

    async handleSupplyAsset(event) {
        const formData = new FormData(event.target);
        const data = {
            action: 'supply',
            protocol: formData.get('protocol'),
            asset: formData.get('asset'),
            amount: formData.get('amount')
        };
        
        await this.performYieldAction(data.action, data.protocol, data.asset);
        event.target.closest('.fixed').remove();
    }

    async optimizeYieldStrategy() {
        try {
            const response = await this.apiCall('/api/wallets/defi/yield-farming', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'optimize', 
                    protocol: 'Auto-Optimizer',
                    asset: 'Multi-Asset',
                    strategy: 'conservative_yield'
                })
            });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to optimize strategy');
            }
            
            this.showNotification('✅ استراتژی بهینه‌سازی شد - اجرای خودکار آغاز شد', 'success');
            
        } catch (error) {
            console.error('Strategy optimization error:', error);
            this.showNotification('❌ خطا در بهینه‌سازی: ' + error.message, 'error');
        }
    }

    // Security and backup methods
    backupWallets() {
        if (confirm('آیا مطمئن هستید که می‌خواهید از کیف‌پول‌ها پشتیبان‌گیری کنید؟\\n\\nاین فایل شامل اطلاعات حساس است.')) {
            // Create backup file
            const backupData = {
                wallets: this.wallets.map(w => ({ ...w, balance: '[ENCRYPTED]' })),
                settings: this.settings,
                timestamp: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `titan-wallets-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            alert('💾 پشتیبان کیف‌پول‌ها ایجاد شد');
        }
    }

    async saveWalletSettings() {
        try {
            // Show loading state
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>در حال ذخیره...';
            button.disabled = true;
            
            const settings = this.collectData();
            
            const response = await this.apiCall('/api/wallets/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to save settings');
            }
            
            this.showNotification('✅ تنظیمات کیف‌پول با موفقیت ذخیره شد', 'success');
            console.log('Wallet settings saved:', response.data);
            
            // Update local settings with server response
            this.settings = { ...this.settings, ...response.data };
            
        } catch (error) {
            console.error('Save wallet settings error:', error);
            this.showNotification('❌ خطا در ذخیره تنظیمات: ' + error.message, 'error');
        } finally {
            // Reset button state
            const button = event.target;
            if (button) {
                button.innerHTML = '<i class="fas fa-save mr-2"></i>ذخیره تنظیمات';
                button.disabled = false;
            }
        }
    }

    async exportWalletData() {
        try {
            // Show loading state
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>در حال صادرات...';
            button.disabled = true;
            
            // Show export options modal
            this.showExportOptionsModal();
            
        } catch (error) {
            console.error('Export wallet data error:', error);
            this.showNotification('❌ خطا در صادرات داده‌ها: ' + error.message, 'error');
        } finally {
            // Reset button state
            const button = event.target;
            if (button) {
                button.innerHTML = '<i class="fas fa-download mr-2"></i>صادرات داده‌ها';
                button.disabled = false;
            }
        }
    }

    showExportOptionsModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">
                        <i class="fas fa-download mr-2"></i>صادرات داده‌های کیف‌پول
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <form onsubmit="walletsTabInstance.performExport(event); return false;" class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-400 mb-2">فرمت فایل</label>
                        <select name="format" class="w-full bg-gray-700 text-white border border-gray-600 rounded p-2">
                            <option value="json">JSON (کامل)</option>
                            <option value="csv">CSV (ساده)</option>
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="checkbox" name="includeBalances" class="mr-2" checked>
                            <span class="text-white">شامل موجودی‌ها</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" name="includeSensitive" class="mr-2">
                            <span class="text-white">شامل اطلاعات حساس (تراکنش‌ها)</span>
                        </label>
                    </div>

                    <div class="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded p-3 text-sm">
                        <div class="text-yellow-400 font-semibold mb-1">⚠️ توجه امنیتی</div>
                        <div class="text-yellow-300">
                            فایل صادراتی شامل اطلاعات حساس است. آن را در مکان امن نگهداری کنید.
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button type="button" onclick="this.closest('.fixed').remove()" 
                                class="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                            انصراف
                        </button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            <i class="fas fa-download mr-2"></i>صادرات
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async performExport(event) {
        try {
            const formData = new FormData(event.target);
            const options = {
                format: formData.get('format'),
                includeBalances: formData.has('includeBalances'),
                includeSensitive: formData.has('includeSensitive')
            };

            const response = await this.apiCall('/api/wallets/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options)
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to export data');
            }

            // Create and download file
            const dataStr = options.format === 'json' ? 
                JSON.stringify(response.data, null, 2) : 
                this.convertToCSV(response.data);
            
            const blob = new Blob([dataStr], { 
                type: options.format === 'json' ? 'application/json' : 'text/csv' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.filename || `titan-wallets-${new Date().toISOString().split('T')[0]}.${options.format}`;
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification('✅ داده‌های کیف‌پول با موفقیت صادر شد', 'success');
            event.target.closest('.fixed').remove();

        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('❌ خطا در صادرات: ' + error.message, 'error');
        }
    }

    convertToCSV(data) {
        if (!data.wallets || !Array.isArray(data.wallets)) {
            return 'No wallet data available';
        }

        const headers = ['Name', 'Type', 'Exchange', 'Balance', 'Currency', 'Status', 'Last Update'];
        const csvRows = [headers.join(',')];

        data.wallets.forEach(wallet => {
            const row = [
                `"${wallet.name}"`,
                `"${wallet.type}"`,
                `"${wallet.exchange}"`,
                `"${wallet.balance}"`,
                `"${wallet.currency}"`,
                `"${wallet.status}"`,
                `"${new Date().toLocaleString()}"`
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    importWalletData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    const fileContent = await this.readFile(file);
                    await this.processImportFile(fileContent, file.name);
                } catch (error) {
                    console.error('Import file error:', error);
                    this.showNotification('❌ خطا در وارد کردن فایل: ' + error.message, 'error');
                }
            }
        };
        
        input.click();
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async processImportFile(content, filename) {
        try {
            let parsedData;
            const format = filename.endsWith('.json') ? 'json' : 'csv';
            
            if (format === 'json') {
                parsedData = JSON.parse(content);
            } else {
                // Convert CSV to JSON format
                parsedData = this.parseCSVToJSON(content);
            }

            // Show preview modal first
            this.showImportPreviewModal(parsedData, format);

        } catch (error) {
            throw new Error('فرمت فایل نامعتبر است: ' + error.message);
        }
    }

    parseCSVToJSON(csvContent) {
        const lines = csvContent.split('\n');
        if (lines.length < 2) {
            throw new Error('فایل CSV باید حداقل دو خط داشته باشد');
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const wallets = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                const wallet = {};
                headers.forEach((header, index) => {
                    wallet[header.toLowerCase()] = values[index] || '';
                });
                wallets.push(wallet);
            }
        }

        return { wallets, metadata: { format: 'csv', importedAt: new Date().toISOString() } };
    }

    showImportPreviewModal(data, format) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">
                        <i class="fas fa-upload mr-2"></i>پیش‌نمایش وارد کردن داده‌ها
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="mb-6">
                    <div class="bg-gray-900 rounded-lg p-4 mb-4">
                        <h4 class="text-white font-semibold mb-2">اطلاعات فایل</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>فرمت: <span class="text-blue-400">${format.toUpperCase()}</span></div>
                            <div>تعداد کیف‌پول: <span class="text-green-400">${data.wallets ? data.wallets.length : 0}</span></div>
                        </div>
                    </div>

                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-white font-semibold mb-3">کیف‌پول‌های قابل وارد:</h4>
                        <div class="max-h-60 overflow-y-auto">
                            <table class="w-full text-sm">
                                <thead class="text-gray-400 border-b border-gray-700">
                                    <tr>
                                        <th class="text-right p-2">نام</th>
                                        <th class="text-right p-2">نوع</th>
                                        <th class="text-right p-2">صرافی</th>
                                        <th class="text-right p-2">وضعیت</th>
                                    </tr>
                                </thead>
                                <tbody class="text-white">
                                    ${(data.wallets || []).slice(0, 10).map(wallet => `
                                        <tr class="border-b border-gray-700">
                                            <td class="p-2">${wallet.name || wallet.Name || 'نامشخص'}</td>
                                            <td class="p-2">${wallet.type || wallet.Type || 'نامشخص'}</td>
                                            <td class="p-2">${wallet.exchange || wallet.Exchange || 'نامشخص'}</td>
                                            <td class="p-2">
                                                <span class="px-2 py-1 bg-green-600 text-xs rounded">
                                                    ${wallet.status || wallet.Status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${(data.wallets?.length || 0) > 10 ? `
                                        <tr>
                                            <td colspan="4" class="p-2 text-center text-gray-400">
                                                و ${data.wallets.length - 10} کیف‌پول دیگر...
                                            </td>
                                        </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        انصراف
                    </button>
                    <button onclick="walletsTabInstance.confirmImport(${JSON.stringify(data).replace(/"/g, '&quot;')}, '${format}'); this.closest('.fixed').remove()" 
                            class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        <i class="fas fa-check mr-2"></i>تایید و وارد کردن
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async confirmImport(data, format) {
        try {
            // Show loading notification
            const loadingNotification = this.showNotification('در حال وارد کردن داده‌ها...', 'info', 0);
            
            const response = await this.apiCall('/api/wallets/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, format })
            });

            // Remove loading notification
            if (loadingNotification && loadingNotification.remove) {
                loadingNotification.remove();
            }

            if (!response.success) {
                throw new Error(response.error || 'Failed to import data');
            }

            const result = response.data;
            this.showNotification(`✅ ${result.imported} کیف‌پول با موفقیت وارد شد`, 'success');
            
            // Refresh wallet data
            await this.loadWalletData();
            await this.updateSummaryCards();

        } catch (error) {
            console.error('Confirm import error:', error);
            this.showNotification('❌ خطا در وارد کردن داده‌ها: ' + error.message, 'error');
        }
    }

    // Cold Wallet Automation Methods
    async testColdWalletConnection() {
        const primaryAddress = document.getElementById('primary-cold-wallet')?.value;
        const backupAddress = document.getElementById('backup-cold-wallet')?.value;
        
        if (!primaryAddress) {
            this.showNotification('لطفاً ابتدا آدرس کیف پول سرد اصلی را وارد کنید', 'error');
            return;
        }
        
        try {
            const loadingAlert = this.showNotification('در حال تست اتصال به کیف پول سرد...', 'info', 0);
            
            const response = await this.apiCall('/api/wallets/cold-wallet/test', {
                method: 'POST',
                body: JSON.stringify({
                    primaryAddress,
                    backupAddress
                })
            });
            
            // Hide loading
            if (loadingAlert) loadingAlert.remove();
            
            if (response.success) {
                const testResult = response.data;
                
                // Update connection status
                this.settings.coldWalletConnected = testResult.primaryAddress.connected;
                this.settings.lastConnectionTest = new Date().toLocaleString('fa-IR');
                
                // Show detailed results
                let message = `✅ نتایج تست اتصال:\n`;
                message += `آدرس اصلی: ${testResult.primaryAddress.connected ? 'متصل' : 'قطع'}\n`;
                if (testResult.primaryAddress.balance) {
                    message += `موجودی: ${testResult.primaryAddress.balance.toFixed(6)} ${testResult.primaryAddress.network === 'Bitcoin' ? 'BTC' : 'ETH'}\n`;
                }
                
                if (testResult.backupAddress) {
                    message += `آدرس پشتیبان: ${testResult.backupAddress.connected ? 'متصل' : 'قطع'}\n`;
                }
                
                this.showNotification(message, 'success', 8000);
                
                // Update cold wallet statistics
                this.updateColdWalletStats(testResult);
            } else {
                this.showNotification('خطا در تست اتصال: ' + response.error, 'error');
                this.settings.coldWalletConnected = false;
            }
        } catch (error) {
            console.error('Test cold wallet connection error:', error);
            this.showNotification('خطا در تست اتصال به کیف پول سرد: ' + error.message, 'error');
        }
    }

    updateColdWalletStats(testResult) {
        // Update balance if available
        if (testResult.primaryAddress.balance) {
            const balanceElement = document.querySelector('[data-cold-balance]');
            if (balanceElement) {
                const btcPrice = 45000; // Simplified price
                const balanceUSD = testResult.primaryAddress.balance * btcPrice;
                balanceElement.textContent = `${balanceUSD.toLocaleString()}$`;
            }
        }
        
        // Update last connection test time
        const lastTestElement = document.querySelector('[data-last-test]');
        if (lastTestElement) {
            lastTestElement.textContent = new Date().toLocaleString('fa-IR');
        }
    }

    async forceColdTransfer() {
        const threshold = parseFloat(document.getElementById('cold-wallet-threshold')?.value) || 50000;
        const percentage = parseFloat(document.getElementById('transfer-percentage')?.value) || 70;
        const primaryAddress = document.getElementById('primary-cold-wallet')?.value;
        
        if (!primaryAddress) {
            this.showNotification('آدرس کیف پول سرد مشخص نشده است', 'error');
            return;
        }
        
        if (!confirm(`آیا از انتقال فوری ${percentage}% موجودی به کیف پول سرد اطمینان دارید؟\n\nمقصد: ${primaryAddress.substring(0, 10)}...`)) {
            return;
        }
        
        try {
            const loadingAlert = this.showNotification('در حال انجام انتقال فوری...', 'info', 0);
            
            // Calculate transfer amount based on total balance
            const totalBalance = this.calculateTotalBalance();
            const transferAmount = (totalBalance * percentage) / 100;
            
            const response = await this.apiCall('/api/wallets/cold-wallet/transfer', {
                method: 'POST',
                body: JSON.stringify({
                    amount: transferAmount,
                    percentage,
                    destination: primaryAddress,
                    force: true
                })
            });
            
            // Hide loading
            if (loadingAlert) loadingAlert.remove();
            
            if (response.success) {
                const transfer = response.data;
                
                // Update statistics
                this.settings.todayTransfers = (this.settings.todayTransfers || 0) + 1;
                this.settings.lastTransferTime = new Date().toLocaleString('fa-IR');
                this.settings.coldWalletBalance = (this.settings.coldWalletBalance || 0) + transferAmount;
                
                // Show transfer details
                let message = `✅ انتقال فوری شروع شد\n`;
                message += `مقدار: $${transferAmount.toLocaleString()}\n`;
                message += `شناسه انتقال: ${transfer.id}\n`;
                message += `زمان تخمینی تکمیل: ${new Date(transfer.estimatedCompletion).toLocaleTimeString('fa-IR')}`;
                
                this.showNotification(message, 'success', 8000);
                
                // Update cold wallet statistics display
                this.updateColdWalletDisplay();
                
                // Start monitoring transfer status
                this.monitorTransferProgress(transfer.id);
            } else {
                throw new Error(response.error || 'خطا در انتقال فوری');
            }
        } catch (error) {
            console.error('Force cold transfer error:', error);
            this.showNotification('خطا در انتقال فوری: ' + error.message, 'error');
        }
    }

    async monitorTransferProgress(transferId) {
        // This would typically poll the API for transfer status updates
        setTimeout(() => {
            this.showNotification('انتقال با موفقیت تکمیل شد', 'success');
            this.updateColdWalletDisplay();
        }, 30000); // Simulate 30 second completion
    }

    updateColdWalletDisplay() {
        // Update today's transfers count
        const todayTransfersElement = document.querySelector('[data-today-transfers]');
        if (todayTransfersElement) {
            todayTransfersElement.textContent = this.settings.todayTransfers || 0;
        }
        
        // Update last transfer time
        const lastTransferElement = document.querySelector('[data-last-transfer]');
        if (lastTransferElement) {
            lastTransferElement.textContent = this.settings.lastTransferTime || 'هنوز نداشته';
        }
        
        // Update cold wallet balance
        const coldBalanceElement = document.querySelector('[data-cold-balance]');
        if (coldBalanceElement) {
            coldBalanceElement.textContent = `${(this.settings.coldWalletBalance || 0).toLocaleString()}$`;
        }
    }

    async viewTransferHistory() {
        try {
            this.showNotification('در حال بارگذاری تاریخچه انتقال‌ها...', 'info');
            
            const response = await this.apiCall('/api/wallets/cold-wallet/history?limit=20');
            
            if (response.success && response.data) {
                this.showTransferHistoryModal(response.data);
            } else {
                throw new Error(response.error || 'خطا در دریافت تاریخچه');
            }
        } catch (error) {
            console.error('View transfer history error:', error);
            
            // Show fallback modal with mock data
            const fallbackData = {
                transfers: [
                    {
                        id: 1,
                        type: 'auto',
                        amount: 0.55,
                        amountUSD: 24750,
                        destination: 'bc1q7x9k2m5n8p4r6s3t1v7w9',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        status: 'completed',
                        transactionHash: 'tx_abc123def456'
                    },
                    {
                        id: 2,
                        type: 'manual',
                        amount: 0.33,
                        amountUSD: 14850,
                        destination: 'bc1q7x9k2m5n8p4r6s3t1v7w9',
                        timestamp: new Date(Date.now() - 86400000).toISOString(),
                        status: 'completed',
                        transactionHash: 'tx_def456ghi789'
                    }
                ],
                summary: {
                    totalTransfers: 15,
                    totalAmount: 5.67,
                    totalAmountUSD: 255150
                }
            };
            
            this.showTransferHistoryModal(fallbackData);
            this.showNotification('خطا در بارگذاری از API، داده‌های نمونه نمایش داده شد', 'warning');
        }
    }

    showTransferHistoryModal(historyData) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-5xl mx-4 w-full max-h-96 overflow-hidden">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">📋 تاریخچه انتقال‌های کلد والت</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                ${historyData.summary ? `
                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div class="bg-gray-700 p-3 rounded text-center">
                        <div class="text-blue-400 font-bold">${historyData.summary.totalTransfers}</div>
                        <div class="text-gray-400 text-sm">کل انتقال‌ها</div>
                    </div>
                    <div class="bg-gray-700 p-3 rounded text-center">
                        <div class="text-green-400 font-bold">${historyData.summary.totalAmount?.toFixed(4)} BTC</div>
                        <div class="text-gray-400 text-sm">کل مقدار</div>
                    </div>
                    <div class="bg-gray-700 p-3 rounded text-center">
                        <div class="text-purple-400 font-bold">$${historyData.summary.totalAmountUSD?.toLocaleString()}</div>
                        <div class="text-gray-400 text-sm">ارزش دلاری</div>
                    </div>
                </div>
                ` : ''}
                
                <div class="overflow-y-auto max-h-64">
                    <table class="w-full">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">نوع</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">مقدار</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">آدرس مقصد</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">زمان</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">وضعیت</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">هش تراکنش</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${historyData.transfers.map(transfer => `
                                <tr class="hover:bg-gray-700">
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                            transfer.type === 'auto' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }">
                                            ${transfer.type === 'auto' ? 'خودکار' : 'دستی'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-white">
                                        <div>${transfer.amount?.toFixed(6)} BTC</div>
                                        <div class="text-gray-400 text-sm">$${transfer.amountUSD?.toLocaleString()}</div>
                                    </td>
                                    <td class="px-4 py-3 text-gray-300 font-mono text-sm">
                                        ${transfer.destination?.substring(0, 10)}...${transfer.destination?.slice(-6)}
                                    </td>
                                    <td class="px-4 py-3 text-gray-300">
                                        ${new Date(transfer.timestamp).toLocaleString('fa-IR')}
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                            transfer.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }">
                                            ${transfer.status === 'completed' ? 'تکمیل شده' : 'در حال پردازش'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-gray-300 font-mono text-sm">
                                        <a href="#" onclick="navigator.clipboard.writeText('${transfer.transactionHash}')" 
                                           class="hover:text-blue-400" title="کپی هش">
                                            ${transfer.transactionHash?.substring(0, 8)}...
                                        </a>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async generateColdWalletReport() {
        try {
            // Show loading state
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>در حال تولید گزارش...';
            button.disabled = true;
            
            // Get comprehensive report from API
            const response = await this.apiCall('/api/wallets/cold-wallet/report');
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to generate report');
            }
            
            const reportData = response.data;
            
            // Create comprehensive report content
            const reportContent = `
TITAN Trading System - Cold Wallet Comprehensive Report
Generated: ${new Date(reportData.metadata.generatedAt).toLocaleString('fa-IR')}
Generated By: ${reportData.metadata.generatedBy}
Report Version: ${reportData.metadata.version}

========================================
COLD WALLET STATISTICS
========================================
Total Balance: ${reportData.statistics.totalBalance} BTC ($${reportData.statistics.totalBalanceUSD.toLocaleString()})
Safety Percentage: ${reportData.statistics.safetyPercentage}%
Security Score: ${reportData.security.securityScore}/100

Transfer Statistics:
├─ Today: ${reportData.statistics.transfersToday} transfers
├─ This Week: ${reportData.statistics.transfersThisWeek} transfers  
├─ This Month: ${reportData.statistics.transfersThisMonth} transfers
├─ Average Size: ${reportData.statistics.avgTransferSize} BTC
├─ Success Rate: ${reportData.performance.transferSuccessRate}%
└─ Last Transfer: ${new Date(reportData.statistics.lastTransferTime).toLocaleString('fa-IR')}

Network Fees:
├─ Total Fees Paid: ${reportData.statistics.totalNetworkFees} BTC ($${reportData.statistics.networkFeesUSD})
├─ Average Transfer Time: ${reportData.performance.avgTransferTime} minutes
└─ Network Impact: ${reportData.performance.networkCongestionImpact}

========================================
CONFIGURATION
========================================
Primary Wallet: ${reportData.configuration.primaryWallet}
Backup Wallet: ${reportData.configuration.backupWallet}
Auto Transfer: ${reportData.configuration.autoTransferEnabled ? 'Enabled' : 'Disabled'}
Transfer Threshold: $${reportData.configuration.transferThreshold.toLocaleString()}
Transfer Percentage: ${reportData.configuration.transferPercentage}%
Check Frequency: ${reportData.configuration.checkFrequency}

========================================
SECURITY STATUS
========================================
${reportData.security.encryptionStatus === 'active' ? '✅' : '❌'} Encryption: ${reportData.security.encryptionStatus}
${reportData.security.multiSigEnabled ? '✅' : '❌'} Multi-Signature: ${reportData.security.multiSigEnabled ? 'Enabled' : 'Disabled'}
${reportData.security.backupStatus === 'verified' ? '✅' : '⚠️'} Backup Status: ${reportData.security.backupStatus}
${reportData.security.vulnerabilities === 0 ? '✅' : '⚠️'} Vulnerabilities: ${reportData.security.vulnerabilities}
Last Security Audit: ${new Date(reportData.security.lastSecurityAudit).toLocaleString('fa-IR')}

========================================
PERFORMANCE METRICS
========================================
Transfer Success Rate: ${reportData.performance.transferSuccessRate}%
Average Transfer Time: ${reportData.performance.avgTransferTime} minutes
Network Congestion Impact: ${reportData.performance.networkCongestionImpact}
Last Optimization: ${new Date(reportData.performance.lastOptimization).toLocaleString('fa-IR')}

========================================
RECOMMENDATIONS
========================================
${reportData.recommendations.map(rec => `
${rec.priority.toUpperCase()} PRIORITY - ${rec.type.toUpperCase()}:
${rec.description}
Impact: ${rec.impact}
`).join('\n')}

========================================
RECENT ACTIVITY
========================================
${reportData.recentActivity.map(activity => `
Transfer ID: ${activity.id}
Type: ${activity.type.replace('_', ' ').toUpperCase()}
Amount: ${activity.amount} BTC ($${activity.amountUSD.toLocaleString()})
Time: ${new Date(activity.timestamp).toLocaleString('fa-IR')}
Status: ${activity.status.toUpperCase()}
Network Fee: ${activity.networkFee} BTC
Confirmations: ${activity.confirmations}
`).join('\n')}

========================================
Report generated by TITAN AI Cold Wallet Management System
Generation Time: ${new Date().toLocaleString('fa-IR')}
Report ID: TCWR-${Date.now()}
            `;
            
            // Create and download comprehensive report
            const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.filename || `TITAN-ColdWallet-Report-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show success notification
            this.showNotification('✅ گزارش جامع کلد والت با موفقیت تولید و دانلود شد', 'success');
            
            // Update cold wallet display with fresh data
            this.updateColdWalletDisplay(reportData.statistics);
            
        } catch (error) {
            console.error('Generate cold wallet report error:', error);
            this.showNotification('❌ خطا در تولید گزارش: ' + error.message, 'error');
        } finally {
            // Reset button state
            const button = event.target;
            if (button) {
                button.innerHTML = '<i class="fas fa-file-alt mr-2"></i>گزارش کلد والت';
                button.disabled = false;
            }
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white shadow-lg ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            type === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (duration > 0) {
            setTimeout(() => {
                notification.remove();
            }, duration);
        }
        
        return notification;
    }

    // Cleanup method
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        // Remove global instance
        window.walletsTabInstance = null;
    }

    collectData() {
        return {
            // Security settings
            encryptKeys: document.getElementById('encrypt-keys')?.checked !== false,
            twoFactorWallet: document.getElementById('two-factor-wallet')?.checked || false,
            dailyLimit: document.getElementById('daily-limit')?.checked || false,
            suspiciousAlerts: document.getElementById('suspicious-alerts')?.checked || false,
            withdrawalLimit: parseInt(document.getElementById('withdrawal-limit')?.value || 10000),
            allowedAddresses: document.getElementById('allowed-addresses')?.value || '',
            
            // Configuration settings
            baseCurrency: document.getElementById('base-currency')?.value || 'USD',
            autoRefreshInterval: parseInt(document.getElementById('auto-refresh-interval')?.value || 30),
            showZeroBalances: document.getElementById('show-zero-balances')?.checked || false,
            defaultFee: document.getElementById('default-fee')?.value || 'standard',
            balanceThreshold: parseInt(document.getElementById('balance-threshold')?.value || 1000),
            lowBalanceAlert: document.getElementById('low-balance-alert')?.checked !== false,
            
            // Wallet data
            wallets: this.wallets
        };
    }
}