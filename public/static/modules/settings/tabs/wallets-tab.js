// Wallets Tab Module - TITAN Trading System
// Wallet management, balances, and transaction history

export default class WalletsTab {
    constructor(settings) {
        this.settings = settings.wallets || {};
        this.wallets = [
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
        this.recentTransactions = [
            { type: 'Deposit', amount: 1000, currency: 'USDT', exchange: 'Binance', time: '10:25:00', status: 'Completed' },
            { type: 'Withdrawal', amount: 0.1, currency: 'BTC', exchange: 'MEXC', time: '09:15:00', status: 'Pending' },
            { type: 'Trade', amount: 500, currency: 'USDT', exchange: 'Binance', time: '08:30:00', status: 'Completed' }
        ];
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

    initialize() {
        // Set up auto-refresh if enabled
        this.setupAutoRefresh();
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Set global instance for onclick handlers
        window.walletsTabInstance = this;
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
    connectNewWallet() {
        const walletType = prompt('نوع کیف‌پول را انتخاب کنید:\\n1. Trading Wallet\\n2. Cold Storage\\n3. DeFi Wallet\\n\\nعدد مربوطه را وارد کنید:');
        
        if (walletType) {
            alert('اتصال کیف‌پول جدید در حال پیاده‌سازی...');
        }
    }

    refreshBalances(silent = false) {
        if (!silent) {
            alert('🔄 در حال بروزرسانی موجودی کیف‌پول‌ها...');
        }
        
        // Simulate balance updates
        this.wallets.forEach(wallet => {
            const randomChange = (Math.random() - 0.5) * 100;
            wallet.balance += randomChange;
            wallet.lastUpdate = new Date().toLocaleString('fa-IR');
        });
        
        if (!silent) {
            // Update display
            setTimeout(() => {
                alert('✅ موجودی‌ها بروزرسانی شدند');
            }, 1000);
        }
    }

    viewWalletDetails(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (wallet) {
            alert(`جزئیات ${wallet.name}:\\n\\nموجودی: ${wallet.balance} ${wallet.currency}\\nصرافی: ${wallet.exchange}\\nوضعیت: ${wallet.status}\\nآخرین بروزرسانی: ${wallet.lastUpdate}`);
        }
    }

    editWallet(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (wallet) {
            const newName = prompt('نام جدید کیف‌پول:', wallet.name);
            if (newName && newName.trim()) {
                wallet.name = newName.trim();
                alert('نام کیف‌پول تغییر کرد');
            }
        }
    }

    disconnectWallet(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (wallet) {
            if (confirm(`آیا مطمئن هستید که می‌خواهید کیف‌پول ${wallet.name} را قطع کنید؟\\n\\nاین عمل اتصال API را حذف می‌کند.`)) {
                this.wallets = this.wallets.filter(w => w.id !== walletId);
                alert('کیف‌پول قطع شد');
            }
        }
    }

    viewAllTransactions() {
        alert('نمایش همه تراکنش‌ها در حال پیاده‌سازی...');
    }

    // DeFi methods
    manageStaking() {
        alert('مدیریت Staking در حال پیاده‌سازی...');
    }

    manageLiquidity() {
        alert('مدیریت Liquidity Pools در حال پیاده‌سازی...');
    }

    manageYieldFarming() {
        alert('مدیریت Yield Farming در حال پیاده‌سازی...');
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

    saveWalletSettings() {
        const settings = this.collectData();
        alert('✅ تنظیمات کیف‌پول ذخیره شد');
        console.log('Wallet settings saved:', settings);
    }

    exportWalletData() {
        const csvContent = 'Wallet Name,Exchange,Balance,Currency,Status\\n' + 
                          this.wallets.map(wallet => 
                              `"${wallet.name}","${wallet.exchange}","${wallet.balance}","${wallet.currency}","${wallet.status}"`
                          ).join('\\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'titan-wallet-data.csv';
        a.click();
        URL.revokeObjectURL(url);
        
        alert('📊 داده‌های کیف‌پول صادر شد');
    }

    importWalletData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        if (file.name.endsWith('.json')) {
                            const data = JSON.parse(e.target.result);
                            alert('داده‌های JSON وارد شدند');
                        } else if (file.name.endsWith('.csv')) {
                            alert('داده‌های CSV وارد شدند');
                        }
                    } catch (error) {
                        alert('خطا در وارد کردن فایل: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    // Cold Wallet Automation Methods
    testColdWalletConnection() {
        const primaryAddress = document.getElementById('primary-cold-wallet')?.value;
        const backupAddress = document.getElementById('backup-cold-wallet')?.value;
        
        if (!primaryAddress) {
            alert('❌ لطفاً ابتدا آدرس کیف پول سرد اصلی را وارد کنید');
            return;
        }
        
        // Show loading state
        const loadingAlert = this.showNotification('🔄 در حال تست اتصال به کیف پول سرد...', 'info', 0);
        
        // Simulate connection test
        setTimeout(() => {
            // Hide loading
            if (loadingAlert) loadingAlert.remove();
            
            // Validate address format (simplified)
            if (primaryAddress.startsWith('bc1') || primaryAddress.startsWith('0x') || primaryAddress.startsWith('1') || primaryAddress.startsWith('3')) {
                this.showNotification('✅ اتصال به کیف پول سرد موفقیت‌آمیز بود', 'success');
                
                // Update connection status
                this.settings.coldWalletConnected = true;
                this.settings.lastConnectionTest = new Date().toLocaleString('fa-IR');
            } else {
                this.showNotification('❌ فرمت آدرس کیف پول سرد نامعتبر است', 'error');
                this.settings.coldWalletConnected = false;
            }
        }, 2000);
    }

    forceColdTransfer() {
        const threshold = parseFloat(document.getElementById('cold-wallet-threshold')?.value) || 50000;
        const percentage = parseFloat(document.getElementById('transfer-percentage')?.value) || 70;
        const primaryAddress = document.getElementById('primary-cold-wallet')?.value;
        
        if (!primaryAddress) {
            alert('❌ آدرس کیف پول سرد مشخص نشده است');
            return;
        }
        
        if (!confirm(`آیا از انتقال فوری ${percentage}% موجودی به کیف پول سرد اطمینان دارید؟\\n\\nمقصد: ${primaryAddress.substring(0, 10)}...`)) {
            return;
        }
        
        // Simulate transfer
        const loadingAlert = this.showNotification('🚀 در حال انجام انتقال فوری...', 'info', 0);
        
        setTimeout(() => {
            if (loadingAlert) loadingAlert.remove();
            
            // Update statistics
            this.settings.todayTransfers = (this.settings.todayTransfers || 0) + 1;
            this.settings.lastTransferTime = new Date().toLocaleString('fa-IR');
            this.settings.coldWalletBalance = (this.settings.coldWalletBalance || 0) + 25000; // Simulated amount
            
            this.showNotification('✅ انتقال با موفقیت انجام شد', 'success');
            
            // Refresh display
            setTimeout(() => {
                location.reload();
            }, 2000);
        }, 3000);
    }

    viewTransferHistory() {
        // Create modal for transfer history
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-4xl mx-4 max-h-96 overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">📋 تاریخچه انتقال‌های کلد والت</h3>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-3">
                    <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-white font-medium">انتقال خودکار</div>
                                <div class="text-gray-400 text-sm">به آدرس: bc1q...x7k9</div>
                            </div>
                            <div class="text-left">
                                <div class="text-green-400 font-bold">+$25,000</div>
                                <div class="text-gray-400 text-sm">${new Date().toLocaleDateString('fa-IR')}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-white font-medium">انتقال دستی</div>
                                <div class="text-gray-400 text-sm">به آدرس: bc1q...m2n5</div>
                            </div>
                            <div class="text-left">
                                <div class="text-green-400 font-bold">+$15,000</div>
                                <div class="text-gray-400 text-sm">${new Date(Date.now() - 86400000).toLocaleDateString('fa-IR')}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center text-gray-400 py-4">
                        <i class="fas fa-info-circle mr-2"></i>
                        تاریخچه کامل در API ذخیره می‌شود
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    generateColdWalletReport() {
        const reportData = {
            totalBalance: this.settings.coldWalletBalance || 0,
            transfersToday: this.settings.todayTransfers || 0,
            lastTransfer: this.settings.lastTransferTime || 'N/A',
            safetyPercentage: this.settings.safetyPercentage || 85,
            primaryWallet: document.getElementById('primary-cold-wallet')?.value || 'Not Set',
            backupWallet: document.getElementById('backup-cold-wallet')?.value || 'Not Set',
            autoTransfer: document.getElementById('auto-cold-transfer')?.checked || false,
            threshold: document.getElementById('cold-wallet-threshold')?.value || 50000,
            transferPercentage: document.getElementById('transfer-percentage')?.value || 70,
            checkFrequency: document.getElementById('check-frequency')?.value || 'daily'
        };
        
        const reportContent = `
TITAN Trading System - Cold Wallet Report
Generated: ${new Date().toLocaleString('fa-IR')}

=== Cold Wallet Statistics ===
Total Balance: $${reportData.totalBalance.toLocaleString()}
Transfers Today: ${reportData.transfersToday}
Last Transfer: ${reportData.lastTransfer}
Safety Percentage: ${reportData.safetyPercentage}%

=== Configuration ===
Primary Wallet: ${reportData.primaryWallet}
Backup Wallet: ${reportData.backupWallet}
Auto Transfer: ${reportData.autoTransfer ? 'Enabled' : 'Disabled'}
Threshold: $${parseFloat(reportData.threshold).toLocaleString()}
Transfer Percentage: ${reportData.transferPercentage}%
Check Frequency: ${reportData.checkFrequency}

=== Security Status ===
✅ Primary wallet configured: ${reportData.primaryWallet !== 'Not Set' ? 'Yes' : 'No'}
${reportData.backupWallet !== 'Not Set' ? '✅' : '⚠️'} Backup wallet configured: ${reportData.backupWallet !== 'Not Set' ? 'Yes' : 'No'}
${reportData.autoTransfer ? '✅' : '⚠️'} Auto transfer: ${reportData.autoTransfer ? 'Enabled' : 'Disabled'}

Report generated by TITAN AI System
        `;
        
        // Create and download report
        const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TITAN-ColdWallet-Report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('📄 گزارش کلد والت دانلود شد', 'success');
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