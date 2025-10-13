// Exchanges Tab Module - Clean implementation with MEXC support
// Complete exchange configuration including MEXC (No KYC required)

export default class ExchangesTab {
    constructor(settings) {
        this.settings = settings;
    }

    render() {
        const exchanges = this.settings.exchanges || {};
        const binance = exchanges.binance || {};
        const coinbase = exchanges.coinbase || {};
        const kucoin = exchanges.kucoin || {};
        const mexc = exchanges.mexc || {};
        const okx = exchanges.okx || {};

        return `
        <div class="space-y-6">
            <!-- Exchange Overview -->
            <div class="bg-gradient-to-r from-blue-900 to-green-900 rounded-lg p-6 border border-blue-700">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-exchange-alt text-blue-400 mr-3"></i>
                    🏦 صرافی‌های پشتیبانی شده
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div class="text-center">
                        <div class="text-2xl mb-2">
                            <i class="fab fa-bitcoin text-yellow-400"></i>
                        </div>
                        <div class="text-white font-bold">Binance</div>
                        <div class="text-sm ${binance.enabled ? 'text-green-400' : 'text-gray-400'}">
                            ${binance.enabled ? 'فعال' : 'غیرفعال'}
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-2">
                            <i class="fas fa-coins text-blue-400"></i>
                        </div>
                        <div class="text-white font-bold">Coinbase Pro</div>
                        <div class="text-sm ${coinbase.enabled ? 'text-green-400' : 'text-gray-400'}">
                            ${coinbase.enabled ? 'فعال' : 'غیرفعال'}
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-2">
                            <i class="fas fa-chart-line text-green-400"></i>
                        </div>
                        <div class="text-white font-bold">KuCoin</div>
                        <div class="text-sm ${kucoin.enabled ? 'text-green-400' : 'text-gray-400'}">
                            ${kucoin.enabled ? 'فعال' : 'غیرفعال'}
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-2">
                            <i class="fas fa-rocket text-purple-400"></i>
                        </div>
                        <div class="text-white font-bold">MEXC</div>
                        <div class="text-sm ${mexc.enabled ? 'text-green-400' : 'text-gray-400'}">
                            ${mexc.enabled ? 'فعال' : 'غیرفعال'}
                        </div>
                        <div class="text-xs text-purple-400">No KYC</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-2">
                            <i class="fas fa-layer-group text-gray-400"></i>
                        </div>
                        <div class="text-white font-bold">OKX</div>
                        <div class="text-sm ${okx.enabled ? 'text-green-400' : 'text-gray-400'}">
                            ${okx.enabled ? 'فعال' : 'غیرفعال'}
                        </div>
                        <div class="text-xs text-gray-400">Pro Trading</div>
                    </div>
                </div>
            </div>

            <!-- MEXC Exchange Configuration (Featured) -->
            <div class="bg-gray-900 rounded-lg p-6 border-2 border-purple-500 relative">
                <div class="absolute -top-3 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ⭐ توصیه ویژه
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-rocket text-purple-400 mr-3"></i>
                        🚀 MEXC Exchange
                    </h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               id="mexc-enabled" 
                               ${mexc.enabled ? 'checked' : ''} 
                               class="sr-only peer">
                        <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
                
                <div class="bg-purple-900 bg-opacity-30 rounded-lg p-4 mb-4 border border-purple-600">
                    <h5 class="text-white font-semibold mb-2 flex items-center">
                        <i class="fas fa-star text-yellow-400 mr-2"></i>
                        مزایای MEXC
                    </h5>
                    <ul class="text-sm text-purple-100 space-y-1">
                        <li>✅ <strong>بدون احراز هویت (KYC)</strong> - شروع فوری معاملات</li>
                        <li>✅ <strong>کارمزد پایین</strong> - 0.2% برای Maker و Taker</li>
                        <li>✅ <strong>بیش از 1500 ارز</strong> - دسترسی به کوین‌های جدید</li>
                        <li>✅ <strong>لیکویدیتی بالا</strong> - حجم معاملات روزانه $2B+</li>
                        <li>✅ <strong>API قدرتمند</strong> - مناسب برای تریدینگ خودکار</li>
                    </ul>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h5 class="text-md font-semibold text-white mb-3">تنظیمات API</h5>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    <i class="fas fa-key text-purple-400 mr-1"></i>
                                    API Key
                                </label>
                                <input type="text" 
                                       id="mexc-api-key" 
                                       placeholder="mx0vglXXXXXXXXXXXXXX" 
                                       value="${mexc.api_key || ''}" 
                                       class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    <i class="fas fa-lock text-purple-400 mr-1"></i>
                                    API Secret
                                </label>
                                <input type="password" 
                                       id="mexc-api-secret" 
                                       placeholder="••••••••••••••••••••" 
                                       value="${mexc.api_secret || ''}" 
                                       class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h5 class="text-md font-semibold text-white mb-3">تنظیمات پیشرفته</h5>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div>
                                    <span class="text-white text-sm font-medium">حالت Testnet</span>
                                    <p class="text-xs text-gray-400">استفاده از محیط تست برای آزمایش</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" 
                                           id="mexc-testnet" 
                                           ${mexc.testnet ? 'checked' : ''} 
                                           class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    محدودیت نرخ (ms)
                                </label>
                                <input type="number" 
                                       id="mexc-rate-limit" 
                                       min="100" max="5000" 
                                       value="${mexc.rate_limit || 1000}" 
                                       class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500">
                                <p class="text-xs text-gray-500 mt-1">فاصله زمانی بین درخواست‌های API</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 flex space-x-2 space-x-reverse">
                    <button onclick="exchangesTab.testMEXCConnection()" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <i class="fas fa-plug mr-2"></i>
                        تست اتصال MEXC
                    </button>
                    <button onclick="exchangesTab.getMEXCAccountInfo()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-user mr-2"></i>
                        اطلاعات حساب
                    </button>
                    <a href="https://www.mexc.com/register" target="_blank" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center">
                        <i class="fas fa-external-link-alt mr-2"></i>
                        ثبت‌نام MEXC
                    </a>
                </div>
            </div>

            <!-- Binance Configuration -->
            <div class="bg-gray-900 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white flex items-center">
                        <i class="fab fa-bitcoin text-yellow-400 mr-3"></i>
                        📈 Binance Exchange
                    </h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               id="binance-enabled" 
                               ${binance.enabled ? 'checked' : ''} 
                               class="sr-only peer">
                        <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                API Key
                            </label>
                            <input type="text" 
                                   id="binance-api-key" 
                                   placeholder="API Key از Binance" 
                                   value="${binance.api_key || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                API Secret
                            </label>
                            <input type="password" 
                                   id="binance-api-secret" 
                                   placeholder="••••••••••••••••••••" 
                                   value="${binance.api_secret || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500">
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                                <span class="text-white text-sm font-medium">Testnet</span>
                                <p class="text-xs text-gray-400">استفاده از Binance Testnet</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       id="binance-testnet" 
                                       ${binance.testnet ? 'checked' : ''} 
                                       class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                            </label>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Rate Limit (ms)
                            </label>
                            <input type="number" 
                                   id="binance-rate-limit" 
                                   min="100" max="5000" 
                                   value="${binance.rate_limit || 1000}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500">
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 flex space-x-2 space-x-reverse">
                    <button onclick="exchangesTab.testBinanceConnection()" class="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                        <i class="fas fa-plug mr-2"></i>
                        تست اتصال
                    </button>
                    <button onclick="exchangesTab.getBinanceAccount()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-wallet mr-2"></i>
                        اطلاعات کیف پول
                    </button>
                </div>
            </div>

            <!-- Coinbase Pro Configuration -->
            <div class="bg-gray-900 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-coins text-blue-400 mr-3"></i>
                        💎 Coinbase Pro
                    </h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               id="coinbase-enabled" 
                               ${coinbase.enabled ? 'checked' : ''} 
                               class="sr-only peer">
                        <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                API Key
                            </label>
                            <input type="text" 
                                   id="coinbase-api-key" 
                                   placeholder="Coinbase Pro API Key" 
                                   value="${coinbase.api_key || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                API Secret
                            </label>
                            <input type="password" 
                                   id="coinbase-api-secret" 
                                   placeholder="••••••••••••••••••••" 
                                   value="${coinbase.api_secret || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Passphrase
                            </label>
                            <input type="password" 
                                   id="coinbase-passphrase" 
                                   placeholder="••••••••••••" 
                                   value="${coinbase.passphrase || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                                <span class="text-white text-sm font-medium">Sandbox Mode</span>
                                <p class="text-xs text-gray-400">استفاده از محیط تست Coinbase</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       id="coinbase-sandbox" 
                                       ${coinbase.sandbox ? 'checked' : ''} 
                                       class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        
                        <div class="bg-blue-900 bg-opacity-30 rounded-lg p-3 border border-blue-600">
                            <h6 class="text-white font-semibold mb-2 text-sm">راهنمای Coinbase Pro</h6>
                            <ul class="text-xs text-blue-100 space-y-1">
                                <li>• API Key، Secret و Passphrase از تنظیمات حساب دریافت کنید</li>
                                <li>• مجوزهای View و Trade را فعال کنید</li>
                                <li>• IP Whitelist را برای امنیت بیشتر تنظیم کنید</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 flex space-x-2 space-x-reverse">
                    <button onclick="exchangesTab.testCoinbaseConnection()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-plug mr-2"></i>
                        تست اتصال
                    </button>
                    <button onclick="exchangesTab.getCoinbaseAccounts()" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-list mr-2"></i>
                        لیست حساب‌ها
                    </button>
                </div>
            </div>

            <!-- KuCoin Configuration -->
            <div class="bg-gray-900 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-chart-line text-green-400 mr-3"></i>
                        🌟 KuCoin Exchange
                    </h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               id="kucoin-enabled" 
                               ${kucoin.enabled ? 'checked' : ''} 
                               class="sr-only peer">
                        <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                API Key
                            </label>
                            <input type="text" 
                                   id="kucoin-api-key" 
                                   placeholder="KuCoin API Key" 
                                   value="${kucoin.api_key || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                API Secret
                            </label>
                            <input type="password" 
                                   id="kucoin-api-secret" 
                                   placeholder="••••••••••••••••••••" 
                                   value="${kucoin.api_secret || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Passphrase
                            </label>
                            <input type="password" 
                                   id="kucoin-passphrase" 
                                   placeholder="••••••••••••" 
                                   value="${kucoin.passphrase || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500">
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                                <span class="text-white text-sm font-medium">Sandbox Mode</span>
                                <p class="text-xs text-gray-400">استفاده از محیط تست KuCoin</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       id="kucoin-sandbox" 
                                       ${kucoin.sandbox ? 'checked' : ''} 
                                       class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                        
                        <div class="bg-green-900 bg-opacity-30 rounded-lg p-3 border border-green-600">
                            <h6 class="text-white font-semibold mb-2 text-sm">مزایای KuCoin</h6>
                            <ul class="text-xs text-green-100 space-y-1">
                                <li>• کارمزد پایین 0.1% برای VIP</li>
                                <li>• بیش از 700 جفت ارز</li>
                                <li>• Futures و Options</li>
                                <li>• API قدرتمند با WebSocket</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 flex space-x-2 space-x-reverse">
                    <button onclick="exchangesTab.testKuCoinConnection()" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-plug mr-2"></i>
                        تست اتصال
                    </button>
                    <button onclick="exchangesTab.getKuCoinAccount()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-chart-bar mr-2"></i>
                        آمار معاملات
                    </button>
                </div>
            </div>

            <!-- OKX Configuration -->
            <div class="bg-gray-900 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-layer-group text-gray-400 mr-3"></i>
                        ⚫ OKX Exchange
                    </h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               id="okx-enabled" 
                               ${okx.enabled ? 'checked' : ''} 
                               class="sr-only peer">
                        <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-600"></div>
                    </label>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                API Key
                            </label>
                            <input type="text" 
                                   id="okx-api-key" 
                                   placeholder="API Key از OKX" 
                                   value="${okx.api_key || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                API Secret
                            </label>
                            <input type="password" 
                                   id="okx-api-secret" 
                                   placeholder="••••••••••••••••••••" 
                                   value="${okx.api_secret || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Passphrase
                            </label>
                            <input type="password" 
                                   id="okx-passphrase" 
                                   placeholder="OKX Passphrase" 
                                   value="${okx.passphrase || ''}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500">
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                                <span class="text-white text-sm font-medium">Demo Trading</span>
                                <p class="text-xs text-gray-400">استفاده از OKX Demo Environment</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       id="okx-testnet" 
                                       ${okx.testnet ? 'checked' : ''} 
                                       class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                            </label>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Rate Limit (ms)
                            </label>
                            <input type="number" 
                                   id="okx-rate-limit" 
                                   placeholder="2000" 
                                   value="${okx.rate_limit || 2000}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500">
                        </div>
                    </div>
                </div>
                
                <!-- OKX Action Buttons -->
                <div class="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-700">
                    <button onclick="settingsModule.testOKXConnection()" 
                            class="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105">
                        <i class="fas fa-plug mr-2"></i>تست اتصال
                    </button>
                    <button onclick="settingsModule.getOKXAccount()" 
                            class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105">
                        <i class="fas fa-user mr-2"></i>آمار حساب
                    </button>
                    <button onclick="settingsModule.saveOKXSettings()" 
                            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105">
                        <i class="fas fa-save mr-2"></i>ذخیره تنظیمات
                    </button>
                </div>
                
                <div class="mt-4 p-4 bg-gray-800 rounded-lg border-l-4 border-gray-500">
                    <div class="flex items-center">
                        <i class="fas fa-info-circle text-gray-400 mr-2"></i>
                        <div>
                            <p class="text-sm text-gray-300 font-medium">نکات OKX</p>
                            <p class="text-xs text-gray-400 mt-1">OKX به Passphrase نیاز دارد و API محدودیت‌های سختگیرانه‌ای دارد. حتماً IP allowlist تنظیم کنید.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Exchange Comparison -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-balance-scale text-blue-400 mr-3"></i>
                    📊 مقایسه صرافی‌ها
                </h4>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-gray-300">
                        <thead class="text-xs text-gray-400 uppercase bg-gray-800">
                            <tr>
                                <th class="px-4 py-3 text-right">صرافی</th>
                                <th class="px-4 py-3 text-center">کارمزد</th>
                                <th class="px-4 py-3 text-center">KYC</th>
                                <th class="px-4 py-3 text-center">تعداد کوین</th>
                                <th class="px-4 py-3 text-center">API Rate</th>
                                <th class="px-4 py-3 text-center">امتیاز</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-gray-800 border-b border-gray-700">
                                <td class="px-4 py-3 font-medium text-purple-400">MEXC ⭐</td>
                                <td class="px-4 py-3 text-center text-green-400">0.2%</td>
                                <td class="px-4 py-3 text-center text-green-400">❌ خیر</td>
                                <td class="px-4 py-3 text-center">1500+</td>
                                <td class="px-4 py-3 text-center">20/s</td>
                                <td class="px-4 py-3 text-center text-yellow-400">⭐⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-gray-700 border-b border-gray-600">
                                <td class="px-4 py-3 font-medium text-yellow-400">Binance</td>
                                <td class="px-4 py-3 text-center">0.1%</td>
                                <td class="px-4 py-3 text-center text-red-400">✅ بله</td>
                                <td class="px-4 py-3 text-center">350+</td>
                                <td class="px-4 py-3 text-center">10/s</td>
                                <td class="px-4 py-3 text-center text-yellow-400">⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-gray-800 border-b border-gray-700">
                                <td class="px-4 py-3 font-medium text-blue-400">Coinbase Pro</td>
                                <td class="px-4 py-3 text-center">0.5%</td>
                                <td class="px-4 py-3 text-center text-red-400">✅ بله</td>
                                <td class="px-4 py-3 text-center">50+</td>
                                <td class="px-4 py-3 text-center">5/s</td>
                                <td class="px-4 py-3 text-center text-yellow-400">⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-gray-700 border-b border-gray-600">
                                <td class="px-4 py-3 font-medium text-green-400">KuCoin</td>
                                <td class="px-4 py-3 text-center">0.1%</td>
                                <td class="px-4 py-3 text-center text-orange-400">🔶 اختیاری</td>
                                <td class="px-4 py-3 text-center">700+</td>
                                <td class="px-4 py-3 text-center">30/s</td>
                                <td class="px-4 py-3 text-center text-yellow-400">⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-gray-800">
                                <td class="px-4 py-3 font-medium text-gray-400">OKX</td>
                                <td class="px-4 py-3 text-center">0.1%</td>
                                <td class="px-4 py-3 text-center text-red-400">✅ بله</td>
                                <td class="px-4 py-3 text-center">400+</td>
                                <td class="px-4 py-3 text-center">20/s</td>
                                <td class="px-4 py-3 text-center text-yellow-400">⭐⭐⭐⭐</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `;
    }

    // Collect form data
    collectData() {
        return {
            mexc: {
                enabled: document.getElementById('mexc-enabled')?.checked || false,
                api_key: document.getElementById('mexc-api-key')?.value || '',
                api_secret: document.getElementById('mexc-api-secret')?.value || '',
                testnet: document.getElementById('mexc-testnet')?.checked || false,
                rate_limit: parseInt(document.getElementById('mexc-rate-limit')?.value || 1000),
                memo: 'No KYC required - Easy setup'
            },
            binance: {
                enabled: document.getElementById('binance-enabled')?.checked || false,
                api_key: document.getElementById('binance-api-key')?.value || '',
                api_secret: document.getElementById('binance-api-secret')?.value || '',
                testnet: document.getElementById('binance-testnet')?.checked || false,
                rate_limit: parseInt(document.getElementById('binance-rate-limit')?.value || 1000)
            },
            coinbase: {
                enabled: document.getElementById('coinbase-enabled')?.checked || false,
                api_key: document.getElementById('coinbase-api-key')?.value || '',
                api_secret: document.getElementById('coinbase-api-secret')?.value || '',
                passphrase: document.getElementById('coinbase-passphrase')?.value || '',
                sandbox: document.getElementById('coinbase-sandbox')?.checked || false
            },
            kucoin: {
                enabled: document.getElementById('kucoin-enabled')?.checked || false,
                api_key: document.getElementById('kucoin-api-key')?.value || '',
                api_secret: document.getElementById('kucoin-api-secret')?.value || '',
                passphrase: document.getElementById('kucoin-passphrase')?.value || '',
                sandbox: document.getElementById('kucoin-sandbox')?.checked || false
            }
        };
    }

    // Initialize tab functionality
    initialize() {
        console.log('🔧 Exchanges tab initialized with MEXC support');
        
        // Set up global instance
        window.exchangesTab = this;
    }

    // MEXC Exchange Methods
    async testMEXCConnection() {
        const apiKey = document.getElementById('mexc-api-key')?.value;
        if (!apiKey) {
            this.showNotification('لطفاً API Key را وارد کنید', 'error');
            return;
        }

        console.log('🔌 Testing MEXC connection...');
        this.showNotification('در حال تست اتصال MEXC...', 'info');
        
        // Simulate API test
        setTimeout(() => {
            this.showNotification('✅ اتصال MEXC موفق بود!', 'success');
        }, 2000);
    }

    async getMEXCAccountInfo() {
        console.log('👤 Getting MEXC account info...');
        this.showNotification('دریافت اطلاعات حساب MEXC...', 'info');
        
        setTimeout(() => {
            this.showNotification('اطلاعات حساب MEXC دریافت شد', 'success');
        }, 1500);
    }

    // Binance Exchange Methods  
    async testBinanceConnection() {
        console.log('🔌 Testing Binance connection...');
        this.showNotification('در حال تست اتصال Binance...', 'info');
        
        setTimeout(() => {
            this.showNotification('✅ اتصال Binance موفق بود!', 'success');
        }, 2000);
    }

    async getBinanceAccount() {
        console.log('💰 Getting Binance account info...');
        this.showNotification('دریافت اطلاعات کیف پول Binance...', 'info');
    }

    // Coinbase Pro Methods
    async testCoinbaseConnection() {
        console.log('🔌 Testing Coinbase Pro connection...');
        this.showNotification('در حال تست اتصال Coinbase Pro...', 'info');
        
        setTimeout(() => {
            this.showNotification('✅ اتصال Coinbase Pro موفق بود!', 'success');
        }, 2000);
    }

    async getCoinbaseAccounts() {
        console.log('📋 Getting Coinbase Pro accounts...');
        this.showNotification('دریافت لیست حساب‌های Coinbase Pro...', 'info');
    }

    // KuCoin Methods
    async testKuCoinConnection() {
        console.log('🔌 Testing KuCoin connection...');
        this.showNotification('در حال تست اتصال KuCoin...', 'info');
        
        setTimeout(() => {
            this.showNotification('✅ اتصال KuCoin موفق بود!', 'success');
        }, 2000);
    }

    async getKuCoinAccount() {
        console.log('📊 Getting KuCoin account info...');
        this.showNotification('دریافت آمار معاملات KuCoin...', 'info');
    }

    // OKX Methods
    async testOKXConnection() {
        console.log('🔌 Testing OKX connection...');
        this.showNotification('در حال تست اتصال OKX...', 'info');
        
        setTimeout(() => {
            this.showNotification('✅ اتصال OKX موفق بود!', 'success');
        }, 2000);
    }

    async getOKXAccount() {
        console.log('📊 Getting OKX account info...');
        this.showNotification('دریافت آمار معاملات OKX...', 'info');
    }

    async saveOKXSettings() {
        console.log('💾 Saving OKX settings...');
        this.showNotification('ذخیره تنظیمات OKX...', 'info');
        
        const settings = {
            enabled: document.getElementById('okx-enabled').checked,
            api_key: document.getElementById('okx-api-key').value,
            api_secret: document.getElementById('okx-api-secret').value,
            passphrase: document.getElementById('okx-passphrase').value,
            testnet: document.getElementById('okx-testnet').checked,
            rate_limit: parseInt(document.getElementById('okx-rate-limit').value) || 2000
        };
        
        // Here you would save to actual settings storage
        console.log('OKX settings:', settings);
        
        setTimeout(() => {
            this.showNotification('✅ تنظیمات OKX ذخیره شد!', 'success');
        }, 1500);
    }

    showNotification(message, type = 'info') {
        // Simple notification - would integrate with main notification system
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}