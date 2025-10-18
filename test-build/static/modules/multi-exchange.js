// Feature 7: Multi-Exchange Settings Module
class MultiExchangeModule {
    constructor() {
        this.exchanges = this.getDefaultExchanges();
        this.activeConnections = new Map();
        this.rateLimits = new Map();
        this.initialized = false;
        
        console.log('✅ Multi-Exchange Module constructor called');
    }

    getDefaultExchanges() {
        return {
            binance: {
                id: 'binance',
                name: 'Binance',
                icon: '🟡',
                status: 'disconnected',
                apiKey: '',
                apiSecret: '',
                sandbox: true,
                testnet: 'https://testnet.binance.vision',
                mainnet: 'https://api.binance.com',
                rateLimits: {
                    requests_per_minute: 1200,
                    orders_per_second: 10,
                    daily_requests: 160000
                },
                supported_pairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'],
                fees: {
                    maker: 0.001,
                    taker: 0.001
                },
                features: ['spot', 'futures', 'margin', 'options']
            },
            coinbase: {
                id: 'coinbase',
                name: 'Coinbase Pro',
                icon: '🔵',
                status: 'disconnected',
                apiKey: '',
                apiSecret: '',
                passphrase: '',
                sandbox: true,
                testnet: 'https://api-public.sandbox.exchange.coinbase.com',
                mainnet: 'https://api.exchange.coinbase.com',
                rateLimits: {
                    requests_per_minute: 600,
                    orders_per_second: 5,
                    daily_requests: 10000
                },
                supported_pairs: ['BTC/USD', 'ETH/USD', 'LTC/USD', 'BCH/USD'],
                fees: {
                    maker: 0.005,
                    taker: 0.005
                },
                features: ['spot']
            },
            kucoin: {
                id: 'kucoin',
                name: 'KuCoin',
                icon: '🟢',
                status: 'disconnected',
                apiKey: '',
                apiSecret: '',
                passphrase: '',
                sandbox: true,
                testnet: 'https://openapi-sandbox.kucoin.com',
                mainnet: 'https://api.kucoin.com',
                rateLimits: {
                    requests_per_minute: 1800,
                    orders_per_second: 15,
                    daily_requests: 200000
                },
                supported_pairs: ['BTC/USDT', 'ETH/USDT', 'KCS/USDT', 'DOT/USDT'],
                fees: {
                    maker: 0.001,
                    taker: 0.001
                },
                features: ['spot', 'futures', 'margin']
            },
            bybit: {
                id: 'bybit',
                name: 'Bybit',
                icon: '🟠',
                status: 'disconnected',
                apiKey: '',
                apiSecret: '',
                sandbox: true,
                testnet: 'https://api-testnet.bybit.com',
                mainnet: 'https://api.bybit.com',
                rateLimits: {
                    requests_per_minute: 600,
                    orders_per_second: 8,
                    daily_requests: 120000
                },
                supported_pairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT'],
                fees: {
                    maker: 0.001,
                    taker: 0.001
                },
                features: ['spot', 'futures', 'options']
            },
            kraken: {
                id: 'kraken',
                name: 'Kraken',
                icon: '🟣',
                status: 'disconnected',
                apiKey: '',
                apiSecret: '',
                sandbox: false,
                mainnet: 'https://api.kraken.com',
                rateLimits: {
                    requests_per_minute: 60,
                    orders_per_second: 1,
                    daily_requests: 5000
                },
                supported_pairs: ['BTC/USD', 'ETH/USD', 'XRP/USD', 'ADA/USD'],
                fees: {
                    maker: 0.0016,
                    taker: 0.0026
                },
                features: ['spot', 'futures']
            }
        };
    }

    async initialize() {
        console.log('🔄 Initializing Multi-Exchange Module...');
        
        try {
            // Load saved exchange configurations
            await this.loadExchangeConfigs();
            
            // Initialize rate limit monitors
            this.initializeRateLimitMonitors();
            
            // Check connection status for configured exchanges
            await this.checkConnectionStatus();
            
            this.initialized = true;
            console.log('✅ Multi-Exchange Module initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Multi-Exchange Module:', error);
        }
    }

    async loadExchangeConfigs() {
        // In real implementation, load from encrypted storage/database
        console.log('📚 Loading exchange configurations...');
        
        // Simulate loading saved API keys (in production, these should be encrypted)
        const savedConfigs = localStorage.getItem('titan_exchange_configs');
        if (savedConfigs) {
            try {
                const configs = JSON.parse(savedConfigs);
                Object.keys(configs).forEach(exchangeId => {
                    if (this.exchanges[exchangeId]) {
                        this.exchanges[exchangeId] = { ...this.exchanges[exchangeId], ...configs[exchangeId] };
                    }
                });
                console.log('✅ Exchange configurations loaded');
            } catch (error) {
                console.warn('⚠️ Error parsing saved configs:', error);
            }
        }
    }

    initializeRateLimitMonitors() {
        console.log('⏱️ Initializing rate limit monitors...');
        
        Object.keys(this.exchanges).forEach(exchangeId => {
            this.rateLimits.set(exchangeId, {
                requests_count: 0,
                orders_count: 0,
                last_reset: Date.now(),
                violations: 0
            });
        });
    }

    async checkConnectionStatus() {
        console.log('🔍 Checking exchange connection status...');
        
        for (const [exchangeId, exchange] of Object.entries(this.exchanges)) {
            if (exchange.apiKey && exchange.apiSecret) {
                try {
                    // Simulate connection test
                    const isConnected = await this.testConnection(exchangeId);
                    this.exchanges[exchangeId].status = isConnected ? 'connected' : 'error';
                } catch (error) {
                    this.exchanges[exchangeId].status = 'error';
                    console.warn(`⚠️ Connection test failed for ${exchange.name}:`, error.message);
                }
            }
        }
    }

    async testConnection(exchangeId) {
        // Simulate API connection test
        return new Promise((resolve) => {
            setTimeout(() => {
                // Random success rate for demo
                resolve(Math.random() > 0.3);
            }, 1000 + Math.random() * 2000);
        });
    }

    getContent() {
        return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-exchange-alt text-blue-400 mr-3"></i>
                        مدیریت صرافی‌ها
                    </h2>
                    <p class="text-gray-400 mt-1">تنظیمات و مدیریت اتصال به صرافی‌های مختلف</p>
                </div>
                <button onclick="multiExchangeModule.addNewExchange()" 
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <i class="fas fa-plus"></i>افزودن صرافی
                </button>
            </div>

            <!-- Statistics Overview -->
            ${this.getOverviewStats()}

            <!-- Exchange Cards Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                ${this.getExchangeCards()}
            </div>

            <!-- Rate Limits Monitor -->
            ${this.getRateLimitsMonitor()}

            <!-- Trading Pairs Management -->
            ${this.getTradingPairsSection()}
        </div>`;
    }

    getOverviewStats() {
        const totalExchanges = Object.keys(this.exchanges).length;
        const connectedExchanges = Object.values(this.exchanges).filter(ex => ex.status === 'connected').length;
        const totalPairs = Object.values(this.exchanges).reduce((sum, ex) => sum + ex.supported_pairs.length, 0);
        
        return `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-blue-600 rounded-lg">
                        <i class="fas fa-building text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">کل صرافی‌ها</p>
                        <p class="text-2xl font-bold text-white">${totalExchanges}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-green-600 rounded-lg">
                        <i class="fas fa-plug text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">متصل</p>
                        <p class="text-2xl font-bold text-white">${connectedExchanges}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-purple-600 rounded-lg">
                        <i class="fas fa-coins text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">جفت ارزها</p>
                        <p class="text-2xl font-bold text-white">${totalPairs}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="p-2 bg-orange-600 rounded-lg">
                        <i class="fas fa-tachometer-alt text-white"></i>
                    </div>
                    <div class="mr-3">
                        <p class="text-sm text-gray-400">وضعیت API</p>
                        <p class="text-2xl font-bold text-green-400">عادی</p>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getExchangeCards() {
        return Object.values(this.exchanges).map(exchange => {
            const statusColor = {
                'connected': 'text-green-400',
                'disconnected': 'text-gray-400',
                'error': 'text-red-400'
            }[exchange.status] || 'text-gray-400';

            const statusIcon = {
                'connected': 'fa-check-circle',
                'disconnected': 'fa-circle',
                'error': 'fa-exclamation-circle'
            }[exchange.status] || 'fa-circle';

            return `
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <span class="text-2xl mr-3">${exchange.icon}</span>
                        <div>
                            <h3 class="text-lg font-semibold text-white">${exchange.name}</h3>
                            <p class="text-sm ${statusColor} flex items-center">
                                <i class="fas ${statusIcon} mr-1"></i>
                                ${this.getStatusText(exchange.status)}
                            </p>
                        </div>
                    </div>
                    <button onclick="multiExchangeModule.configureExchange('${exchange.id}')" 
                            class="p-2 text-gray-400 hover:text-white">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>

                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">جفت ارزها:</span>
                        <span class="text-white">${exchange.supported_pairs.length}</span>
                    </div>
                    
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">کارمزد Maker:</span>
                        <span class="text-white">${(exchange.fees.maker * 100).toFixed(3)}%</span>
                    </div>
                    
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">محدودیت API:</span>
                        <span class="text-white">${exchange.rateLimits.requests_per_minute}/min</span>
                    </div>
                    
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">ویژگی‌ها:</span>
                        <span class="text-white">${exchange.features.join(', ')}</span>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-700">
                    <div class="flex gap-2">
                        ${exchange.status === 'connected' ? 
                            '<button onclick="multiExchangeModule.disconnectExchange(\'' + exchange.id + '\')" class="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">قطع اتصال</button>' :
                            '<button onclick="multiExchangeModule.connectExchange(\'' + exchange.id + '\')" class="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">اتصال</button>'
                        }
                        <button onclick="multiExchangeModule.testExchange('${exchange.id}')" 
                                class="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            تست
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'connected': 'متصل',
            'disconnected': 'قطع',
            'error': 'خطا'
        };
        return statusMap[status] || 'نامشخص';
    }

    getRateLimitsMonitor() {
        return `
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 class="text-xl font-semibold text-white mb-4 flex items-center">
                <i class="fas fa-tachometer-alt text-orange-400 mr-3"></i>
                نظارت محدودیت‌های API
            </h3>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                ${Object.entries(this.exchanges).map(([id, exchange]) => {
                    const limits = this.rateLimits.get(id) || { requests_count: 0, orders_count: 0 };
                    const requestsPercentage = (limits.requests_count / exchange.rateLimits.requests_per_minute) * 100;
                    const ordersPercentage = (limits.orders_count / (exchange.rateLimits.orders_per_second * 60)) * 100;
                    
                    return `
                    <div class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-lg font-semibold text-white mb-3 flex items-center">
                            <span class="mr-2">${exchange.icon}</span>
                            ${exchange.name}
                        </h4>
                        
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-gray-400">درخواست‌ها (دقیقه)</span>
                                    <span class="text-white">${limits.requests_count}/${exchange.rateLimits.requests_per_minute}</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="h-2 rounded-full ${requestsPercentage > 80 ? 'bg-red-500' : requestsPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}" 
                                         style="width: ${Math.min(requestsPercentage, 100)}%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-gray-400">سفارش‌ها (ثانیه)</span>
                                    <span class="text-white">${limits.orders_count}/${exchange.rateLimits.orders_per_second}</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="h-2 rounded-full ${ordersPercentage > 80 ? 'bg-red-500' : ordersPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}" 
                                         style="width: ${Math.min(ordersPercentage, 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }

    getTradingPairsSection() {
        const allPairs = new Set();
        Object.values(this.exchanges).forEach(ex => {
            ex.supported_pairs.forEach(pair => allPairs.add(pair));
        });

        return `
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 class="text-xl font-semibold text-white mb-4 flex items-center">
                <i class="fas fa-coins text-green-400 mr-3"></i>
                مدیریت جفت ارزهای معاملاتی
            </h3>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h4 class="text-lg font-semibold text-white mb-3">جفت ارزهای موجود</h4>
                    <div class="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                        ${Array.from(allPairs).map(pair => `
                            <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                                <span class="text-white">${pair}</span>
                                <div class="flex gap-2">
                                    ${Object.values(this.exchanges).map(ex => 
                                        ex.supported_pairs.includes(pair) ? 
                                        `<span class="text-xs px-2 py-1 bg-green-600 rounded" title="${ex.name}">${ex.icon}</span>` : ''
                                    ).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h4 class="text-lg font-semibold text-white mb-3">آمار جفت ارزها</h4>
                    <div class="space-y-3">
                        <div class="bg-gray-900 rounded-lg p-3 flex justify-between">
                            <span class="text-gray-400">کل جفت ارزها:</span>
                            <span class="text-white font-semibold">${allPairs.size}</span>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-3 flex justify-between">
                            <span class="text-gray-400">جفت‌های BTC:</span>
                            <span class="text-white font-semibold">${Array.from(allPairs).filter(p => p.includes('BTC')).length}</span>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-3 flex justify-between">
                            <span class="text-gray-400">جفت‌های ETH:</span>
                            <span class="text-white font-semibold">${Array.from(allPairs).filter(p => p.includes('ETH')).length}</span>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-3 flex justify-between">
                            <span class="text-gray-400">جفت‌های USDT:</span>
                            <span class="text-white font-semibold">${Array.from(allPairs).filter(p => p.includes('USDT')).length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // Exchange Management Methods
    async configureExchange(exchangeId) {
        console.log(`🔧 Configuring exchange: ${exchangeId}`);
        
        const exchange = this.exchanges[exchangeId];
        if (!exchange) return;

        // Create configuration modal
        const modalHTML = `
        <div id="exchange-config-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <span class="mr-2">${exchange.icon}</span>
                    تنظیمات ${exchange.name}
                </h3>
                
                <form onsubmit="multiExchangeModule.saveExchangeConfig('${exchangeId}', event)">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">API Key</label>
                            <input type="text" id="api-key-${exchangeId}" value="${exchange.apiKey}" 
                                   class="w-full p-3 bg-gray-700 text-white rounded border border-gray-600" placeholder="API Key را وارد کنید">
                        </div>
                        
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">API Secret</label>
                            <input type="password" id="api-secret-${exchangeId}" value="${exchange.apiSecret}" 
                                   class="w-full p-3 bg-gray-700 text-white rounded border border-gray-600" placeholder="API Secret را وارد کنید">
                        </div>
                        
                        ${exchange.passphrase !== undefined ? `
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">Passphrase</label>
                            <input type="password" id="passphrase-${exchangeId}" value="${exchange.passphrase || ''}" 
                                   class="w-full p-3 bg-gray-700 text-white rounded border border-gray-600" placeholder="Passphrase را وارد کنید">
                        </div>` : ''}
                        
                        <div class="flex items-center">
                            <input type="checkbox" id="sandbox-${exchangeId}" ${exchange.sandbox ? 'checked' : ''} 
                                   class="mr-2">
                            <label for="sandbox-${exchangeId}" class="text-sm text-gray-300">استفاده از Testnet/Sandbox</label>
                        </div>
                    </div>
                    
                    <div class="flex gap-3 mt-6">
                        <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">ذخیره</button>
                        <button type="button" onclick="multiExchangeModule.closeConfigModal()" 
                                class="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">انصراف</button>
                    </div>
                </form>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    saveExchangeConfig(exchangeId, event) {
        event.preventDefault();
        
        const exchange = this.exchanges[exchangeId];
        const apiKey = document.getElementById(`api-key-${exchangeId}`).value;
        const apiSecret = document.getElementById(`api-secret-${exchangeId}`).value;
        const sandbox = document.getElementById(`sandbox-${exchangeId}`).checked;
        
        let passphrase = '';
        const passphraseField = document.getElementById(`passphrase-${exchangeId}`);
        if (passphraseField) {
            passphrase = passphraseField.value;
        }

        // Update exchange configuration
        exchange.apiKey = apiKey;
        exchange.apiSecret = apiSecret;
        exchange.sandbox = sandbox;
        if (exchange.passphrase !== undefined) {
            exchange.passphrase = passphrase;
        }

        // Save to localStorage (in production, use encrypted storage)
        const configs = {};
        Object.keys(this.exchanges).forEach(id => {
            const ex = this.exchanges[id];
            configs[id] = {
                apiKey: ex.apiKey,
                apiSecret: ex.apiSecret,
                sandbox: ex.sandbox
            };
            if (ex.passphrase !== undefined) {
                configs[id].passphrase = ex.passphrase;
            }
        });
        localStorage.setItem('titan_exchange_configs', JSON.stringify(configs));

        console.log(`✅ Configuration saved for ${exchange.name}`);
        this.closeConfigModal();
        
        // Refresh the display
        this.refreshDisplay();
    }

    closeConfigModal() {
        const modal = document.getElementById('exchange-config-modal');
        if (modal) {
            modal.remove();
        }
    }

    async connectExchange(exchangeId) {
        const exchange = this.exchanges[exchangeId];
        
        if (!exchange.apiKey || !exchange.apiSecret) {
            alert(`لطفاً ابتدا API Key و Secret برای ${exchange.name} را تنظیم کنید.`);
            this.configureExchange(exchangeId);
            return;
        }

        console.log(`🔌 Connecting to ${exchange.name}...`);
        exchange.status = 'connecting';
        this.refreshDisplay();

        try {
            const connected = await this.testConnection(exchangeId);
            exchange.status = connected ? 'connected' : 'error';
            
            if (connected) {
                console.log(`✅ Successfully connected to ${exchange.name}`);
            } else {
                console.log(`❌ Failed to connect to ${exchange.name}`);
            }
        } catch (error) {
            exchange.status = 'error';
            console.error(`❌ Connection error for ${exchange.name}:`, error);
        }

        this.refreshDisplay();
    }

    disconnectExchange(exchangeId) {
        const exchange = this.exchanges[exchangeId];
        exchange.status = 'disconnected';
        console.log(`🔌 Disconnected from ${exchange.name}`);
        this.refreshDisplay();
    }

    async testExchange(exchangeId) {
        const exchange = this.exchanges[exchangeId];
        console.log(`🧪 Testing connection to ${exchange.name}...`);
        
        // Simulate API test
        const success = await this.testConnection(exchangeId);
        
        if (success) {
            alert(`✅ تست اتصال به ${exchange.name} موفقیت‌آمیز بود!`);
        } else {
            alert(`❌ تست اتصال به ${exchange.name} ناموفق بود. لطفاً تنظیمات را بررسی کنید.`);
        }
    }

    addNewExchange() {
        console.log('➕ Adding new exchange...');
        alert('🚧 قابلیت افزودن صرافی جدید در نسخه‌های آتی اضافه خواهد شد.');
    }

    refreshDisplay() {
        const container = document.querySelector('.multi-exchange-content');
        if (container) {
            container.innerHTML = this.getContent();
        }
    }
}

// Register module globally
window.TitanModules = window.TitanModules || {};
window.TitanModules.MultiExchangeModule = MultiExchangeModule;

// Create global instance
window.multiExchangeModule = null;

console.log('✅ Multi-Exchange Module registered successfully');