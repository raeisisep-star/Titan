// Watchlist Module for Titan Trading System
// Manages user's favorite assets with real-time price monitoring

class WatchlistModule {
    constructor() {
        this.watchlistItems = [];
        this.priceCache = new Map();
        this.autoRefreshInterval = null;
        this.isLoading = false;
    }

    async initialize() {
        console.log('🎯 Initializing Watchlist module...');
        
        try {
            // Load user's watchlist
            await this.loadUserWatchlist();
            
            // Load real-time prices
            await this.refreshWatchlistPrices();
            
            // Load market overview data
            await this.loadMarketOverview();
            
            // Load market movers
            await this.loadMarketMovers();
            
            // Load Fear & Greed Index
            await this.loadFearGreedIndex();
            
            // Load trending coins
            await this.loadTrendingCoins();
            
            // Setup auto-refresh
            this.setupWatchlistAutoRefresh();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Watchlist module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing watchlist module:', error);
            throw error;
        }
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Watchlist Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">🎯 لیست مورد علاقه</h2>
                    <p class="text-gray-400 mt-1">کوین‌ها و سهام‌های دنبال شده با قیمت‌های real-time</p>
                </div>
                <button onclick="watchlistModule.showAddToWatchlistModal()" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                    <i class="fas fa-plus mr-2"></i>
                    افزودن جدید
                </button>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-green-400 text-2xl mb-1">📈</div>
                        <p class="text-gray-400 text-xs">رشد کنندگان</p>
                        <p id="gainers-count" class="text-lg font-bold text-green-400">3</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-red-400 text-2xl mb-1">📉</div>
                        <p class="text-gray-400 text-xs">کاهش یافتگان</p>
                        <p id="losers-count" class="text-lg font-bold text-red-400">2</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-yellow-400 text-2xl mb-1">⚠️</div>
                        <p class="text-gray-400 text-xs">آلرت‌های فعال</p>
                        <p id="alerts-count" class="text-lg font-bold text-yellow-400">4</p>
                    </div>
                </div>
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="text-center">
                        <div class="text-blue-400 text-2xl mb-1">👁️</div>
                        <p class="text-gray-400 text-xs">کل آیتم‌ها</p>
                        <p id="total-items" class="text-lg font-bold text-white">5</p>
                    </div>
                </div>
            </div>

            <!-- Watchlist Table -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-white">قیمت‌های Real-time</h3>
                    <div class="flex items-center space-x-3 space-x-reverse">
                        <span class="text-sm text-gray-400">آخرین بروزرسانی:</span>  
                        <span id="last-update" class="text-sm text-green-400">در حال بارگذاری...</span>
                        <button onclick="watchlistModule.refreshWatchlistPrices()" 
                                class="text-blue-400 hover:text-blue-300 text-sm">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">نماد</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">نام</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">قیمت</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">تغییر 24ساعته</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">حجم</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">آلرت</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">عمل</th>
                            </tr>
                        </thead>
                        <tbody id="watchlist-table" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Market Overview -->
            <div class="mt-8 space-y-6">
                <!-- Global Market Stats -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white">📊 آمار کلی بازار</h3>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="text-2xl mb-1">💰</div>
                                <div class="text-gray-400 text-xs">کل بازار</div>
                                <div id="total-market-cap" class="text-lg font-bold text-white">$2.5T</div>
                                <div id="market-cap-change" class="text-sm text-green-400">+2.1%</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl mb-1">📈</div>
                                <div class="text-gray-400 text-xs">حجم 24ساعته</div>
                                <div id="total-volume" class="text-lg font-bold text-white">$85B</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl mb-1">₿</div>
                                <div class="text-gray-400 text-xs">غالبیت BTC</div>
                                <div id="btc-dominance" class="text-lg font-bold text-orange-400">58.2%</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl mb-1">Ξ</div>
                                <div class="text-gray-400 text-xs">غالبیت ETH</div>
                                <div id="eth-dominance" class="text-lg font-bold text-blue-400">12.8%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Top Gainers -->
                    <div class="bg-gray-800 rounded-lg border border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-white">🚀 برترین صعودی‌ها</h3>
                            <button onclick="watchlistModule.refreshMarketData()" class="text-blue-400 hover:text-blue-300 text-sm">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        <div id="top-gainers" class="p-4">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>

                    <!-- Top Losers -->
                    <div class="bg-gray-800 rounded-lg border border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-700">
                            <h3 class="text-lg font-semibold text-white">📉 برترین نزولی‌ها</h3>
                        </div>
                        <div id="top-losers" class="p-4">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>

                    <!-- Fear & Greed Index -->
                    <div class="bg-gray-800 rounded-lg border border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-700">
                            <h3 class="text-lg font-semibold text-white">😨 شاخص ترس و طمع</h3>
                        </div>
                        <div class="p-6 text-center">
                            <div class="text-6xl mb-4" id="fear-greed-emoji">😐</div>
                            <div class="text-3xl font-bold mb-2" id="fear-greed-value">50</div>
                            <div class="text-gray-400 mb-4" id="fear-greed-status">خنثی</div>
                            <div class="bg-gray-700 rounded-full h-3 mb-2">
                                <div id="fear-greed-bar" class="bg-yellow-400 h-3 rounded-full transition-all duration-500" style="width: 50%"></div>
                            </div>
                            <div class="text-xs text-gray-500" id="fear-greed-update">بروزرسانی شده</div>
                        </div>
                    </div>
                </div>

                <!-- Trending Coins -->
                <div class="bg-gray-800 rounded-lg border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white">📈 کوین‌های ترند</h3>
                    </div>
                    <div id="trending-coins" class="p-4">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Add to Watchlist Modal -->
        <div id="add-watchlist-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-white">افزودن به لیست مورد علاقه</h3>
                    <button onclick="watchlistModule.hideAddToWatchlistModal()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نوع دارایی</label>
                        <select id="asset-type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                            <option value="crypto">کریپتو</option>
                            <option value="stock">سهام</option>
                            <option value="forex">فارکس</option>
                            <option value="commodity">کالا</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نماد (Symbol)</label>
                        <input type="text" id="asset-symbol" placeholder="مثل: BTCUSDT" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">نام</label>
                        <input type="text" id="asset-name" placeholder="مثل: Bitcoin" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">آلرت بالا</label>
                            <input type="number" id="price-alert-high" placeholder="قیمت" 
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">آلرت پایین</label>
                            <input type="number" id="price-alert-low" placeholder="قیمت" 
                                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                    <button onclick="watchlistModule.hideAddToWatchlistModal()" 
                            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                        انصراف
                    </button>
                    <button onclick="watchlistModule.addToWatchlist()" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                        افزودن
                    </button>
                </div>
            </div>
        </div>

        <!-- Set Alert Modal -->
        <div id="set-alert-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-white">تنظیم آلرت قیمت</h3>
                    <button onclick="watchlistModule.hideSetAlertModal()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">آلرت بالا</label>
                        <input type="number" id="edit-price-alert-high" placeholder="قیمت بالا" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">آلرت پایین</label>
                        <input type="number" id="edit-price-alert-low" placeholder="قیمت پایین" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                    <button onclick="watchlistModule.hideSetAlertModal()" 
                            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                        انصراف
                    </button>
                    <button onclick="watchlistModule.saveAlert()" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                        ذخیره
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    async loadUserWatchlist() {
        try {
            // Use demo_user for development - in production this would come from authenticated user
            const userId = 'demo_user';
            console.log('📡 Loading watchlist for user:', userId);
            
            const response = await axios.get(`/api/watchlist/list/${userId}`);
            
            if (response.data.success) {
                this.watchlistItems = response.data.data;
                console.log(`✅ Loaded ${this.watchlistItems.length} watchlist items from database`);
                this.renderWatchlistTable();
                this.updateWatchlistStats();
            } else {
                throw new Error(response.data.error || 'Failed to load watchlist');
            }
        } catch (error) {
            console.error('❌ Error loading user watchlist:', error);
            
            // Check if it's an authentication error
            if (error.response && error.response.status === 401) {
                console.warn('⚠️ Authentication required for watchlist access');
                this.showAlert('برای دسترسی به لیست مورد علاقه، ورود به حساب کاربری لازم است', 'warning');
                // In a real app, redirect to login
                return;
            }
            
            // Use minimal demo data as fallback
            console.log('📋 Using fallback demo data');
            this.watchlistItems = [
                { id: 'demo1', symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto', current_price: 45230, price_change_percent_24h: 2.45 },
                { id: 'demo2', symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto', current_price: 2890, price_change_percent_24h: -1.23 }
            ];
            this.renderWatchlistTable();
            this.updateWatchlistStats();
        }
    }

    async refreshWatchlistPrices() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            // First update prices in database
            const updateResponse = await axios.post('/api/watchlist/update-prices', {
                user_id: 'demo_user'
            });
            
            if (updateResponse.data.success) {
                console.log(`✅ Updated prices for ${updateResponse.data.updated_count} items`);
                
                // Reload watchlist to get updated data
                await this.loadUserWatchlist();
            } else {
                console.warn('Price update failed, falling back to cache method');
                await this.refreshPricesFromMarketAPI();
            }
            
        } catch (error) {
            console.error('Error refreshing watchlist prices:', error);
            // Fallback to market API method
            await this.refreshPricesFromMarketAPI();
        } finally {
            this.isLoading = false;
        }
    }

    async refreshPricesFromMarketAPI() {
        try {
            const symbols = this.watchlistItems.map(item => item.symbol);
            
            // Get prices from market API
            const response = await axios.post('/api/market/prices', { symbols });
            
            if (response.data.success) {
                const prices = response.data.data;
                
                // Update cache
                prices.forEach(price => {
                    this.priceCache.set(price.symbol, price);
                });
                
                // Update UI
                this.renderWatchlistTable();
                this.updateLastUpdateTime();
                
            } else {
                throw new Error('Failed to fetch prices from market API');
            }
            
        } catch (error) {
            console.error('Error refreshing from market API:', error);
            // Use mock data as last resort
            this.loadMockPrices();
        }
    }

    async refreshItemPrice(itemId) {
        try {
            const item = this.watchlistItems.find(i => i.id === itemId);
            if (!item) return;

            // Update single item price via market API
            const response = await axios.post('/api/market/prices', { 
                symbols: [item.symbol] 
            });
            
            if (response.data.success && response.data.data.length > 0) {
                const priceData = response.data.data[0];
                
                // Update cache
                this.priceCache.set(item.symbol, priceData);
                
                // Update UI
                this.renderWatchlistTable();
                this.updateLastUpdateTime();
                
                this.showAlert(`قیمت ${item.symbol} بروزرسانی شد`, 'success');
            }
            
        } catch (error) {
            console.error('Error refreshing item price:', error);
            this.showAlert('خطا در بروزرسانی قیمت', 'error');
        }
    }

    loadMockPrices() {
        const mockPrices = [
            { symbol: 'BTCUSDT', price: 45230, change_24h: 2.45, volume_24h: 28500000000 },
            { symbol: 'ETHUSDT', price: 2890, change_24h: -1.23, volume_24h: 15200000000 },
            { symbol: 'SOLUSDT', price: 98.45, change_24h: 5.67, volume_24h: 1800000000 },
            { symbol: 'ADAUSDT', price: 0.485, change_24h: -2.34, volume_24h: 850000000 },
            { symbol: 'DOTUSDT', price: 7.82, change_24h: 1.89, volume_24h: 420000000 }
        ];

        mockPrices.forEach(price => {
            this.priceCache.set(price.symbol, price);
        });

        this.renderWatchlistTable();
        this.updateLastUpdateTime();
    }

    renderWatchlistTable() {
        const tableBody = document.getElementById('watchlist-table');
        if (!tableBody) return;

        const rows = this.watchlistItems.map(item => {
            // Use real database data first, then fallback to cache or mock data
            const currentPrice = item.current_price || 0;
            const change24h = item.price_change_percent_24h || 0;
            const volume = item.volume_24h || 0;
            
            // If no real data, try cache
            const priceData = this.priceCache.get(item.symbol) || {};
            const price = currentPrice || priceData.price || 0;
            const changePercent = change24h || priceData.change_24h || 0;
            const volumeData = volume || priceData.volume_24h || 0;
            
            const changeClass = changePercent >= 0 ? 'text-green-400' : 'text-red-400';
            const changeIcon = changePercent >= 0 ? '↗' : '↘';
            
            // Check if alerts are set
            const hasAlerts = item.price_alert_high || item.price_alert_low;
            const alertIcon = hasAlerts ? 'fas fa-bell text-yellow-400' : 'far fa-bell text-gray-400';
            
            // Price alert status
            let alertStatus = '';
            if (hasAlerts && price > 0) {
                if (item.price_alert_high && price >= item.price_alert_high) {
                    alertStatus = ' 🔔'; // Alert triggered high
                } else if (item.price_alert_low && price <= item.price_alert_low) {
                    alertStatus = ' 🔔'; // Alert triggered low
                }
            }
            
            return `
                <tr class="hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="text-sm font-medium text-white">${item.symbol}${alertStatus}</div>
                            <div class="text-xs text-gray-400 mr-2">${item.type?.toUpperCase() || 'CRYPTO'}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-300">${item.name}</div>
                        ${item.notes ? `<div class="text-xs text-gray-500">${item.notes}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-white">$${price.toLocaleString()}</div>
                        ${item.market_cap ? `<div class="text-xs text-gray-400">MC: $${this.formatVolume(item.market_cap)}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm ${changeClass}">
                            ${changeIcon} ${Math.abs(changePercent).toFixed(2)}%
                        </div>
                        ${item.price_change_24h ? `<div class="text-xs text-gray-400">$${Math.abs(item.price_change_24h).toFixed(4)}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-300">$${this.formatVolume(volumeData)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="watchlistModule.showSetAlertModal('${item.id}')" 
                                class="hover:text-yellow-300 text-sm" title="تنظیم آلرت قیمت">
                            <i class="${alertIcon}"></i>
                        </button>
                        ${hasAlerts ? `<div class="text-xs text-gray-400 mt-1">
                            ${item.price_alert_high ? `H: $${item.price_alert_high}` : ''}
                            ${item.price_alert_low ? `L: $${item.price_alert_low}` : ''}
                        </div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex space-x-2 space-x-reverse">
                            <button onclick="watchlistModule.removeFromWatchlist('${item.id}')" 
                                    class="text-red-400 hover:text-red-300" title="حذف از لیست">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button onclick="app.loadModule('trading')" 
                                    class="text-blue-400 hover:text-blue-300" title="نمودار قیمت">
                                <i class="fas fa-chart-line"></i>
                            </button>
                            <button onclick="watchlistModule.refreshItemPrice('${item.id}')" 
                                    class="text-green-400 hover:text-green-300" title="بروزرسانی قیمت">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rows;
    }

    updateWatchlistStats() {
        const totalItems = this.watchlistItems.length;
        let gainers = 0;
        let losers = 0;
        let alerts = 0;

        this.watchlistItems.forEach(item => {
            // Use real database data first, then fallback to cache
            const change24h = item.price_change_percent_24h || 
                             (this.priceCache.get(item.symbol) || {}).change_24h || 0;
            
            if (change24h > 0) gainers++;
            else if (change24h < 0) losers++;
            
            if (item.price_alert_high || item.price_alert_low) alerts++;
        });

        // Update stats
        const gainersEl = document.getElementById('gainers-count');
        const losersEl = document.getElementById('losers-count');
        const alertsEl = document.getElementById('alerts-count');
        const totalEl = document.getElementById('total-items');
        
        if (gainersEl) gainersEl.textContent = gainers;
        if (losersEl) losersEl.textContent = losers;
        if (alertsEl) alertsEl.textContent = alerts;
        if (totalEl) totalEl.textContent = totalItems;
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('fa-IR');
        const element = document.getElementById('last-update');
        if (element) {
            element.textContent = timeString;
        }
    }

    formatVolume(volume) {
        if (volume >= 1e9) return (volume / 1e9).toFixed(1) + 'B';
        if (volume >= 1e6) return (volume / 1e6).toFixed(1) + 'M';
        if (volume >= 1e3) return (volume / 1e3).toFixed(1) + 'K';
        return volume.toString();
    }

    async loadMarketOverview() {
        try {
            const response = await axios.get('/api/market/overview');
            
            if (response.data.success) {
                const data = response.data.data;
                document.getElementById('total-market-cap').textContent = `$${(data.market_cap / 1e12).toFixed(1)}T`;
                document.getElementById('market-cap-change').textContent = `${data.market_cap_change >= 0 ? '+' : ''}${data.market_cap_change.toFixed(1)}%`;
                document.getElementById('total-volume').textContent = `$${(data.volume_24h / 1e9).toFixed(0)}B`;
                document.getElementById('btc-dominance').textContent = `${data.btc_dominance.toFixed(1)}%`;
                document.getElementById('eth-dominance').textContent = `${data.eth_dominance.toFixed(1)}%`;
            }
        } catch (error) {
            console.error('Error loading market overview:', error);
            // Keep default values
        }
    }

    async loadMarketMovers() {
        try {
            const response = await axios.get('/api/market/movers');
            
            if (response.data.success) {
                const { gainers, losers } = response.data.data;
                this.renderMarketMovers('top-gainers', gainers);
                this.renderMarketMovers('top-losers', losers);
            }
        } catch (error) {
            console.error('Error loading market movers:', error);
            this.loadMockMarketMovers();
        }
    }

    loadMockMarketMovers() {
        const mockGainers = [
            { symbol: 'SHIB', name: 'Shiba Inu', change_24h: 15.67 },
            { symbol: 'DOGE', name: 'Dogecoin', change_24h: 12.45 },
            { symbol: 'LINK', name: 'Chainlink', change_24h: 8.91 }
        ];

        const mockLosers = [
            { symbol: 'LUNA', name: 'Terra Luna', change_24h: -8.45 },
            { symbol: 'AVAX', name: 'Avalanche', change_24h: -6.23 }
        ];

        this.renderMarketMovers('top-gainers', mockGainers);
        this.renderMarketMovers('top-losers', mockLosers);
    }

    renderMarketMovers(containerId, movers) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = movers.map(mover => {
            const changeClass = mover.change_24h >= 0 ? 'text-green-400' : 'text-red-400';
            const changeIcon = mover.change_24h >= 0 ? '↗' : '↘';
            
            return `
                <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                    <div>
                        <div class="text-white font-medium">${mover.symbol}</div>
                        <div class="text-gray-400 text-xs">${mover.name}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm ${changeClass}">
                            ${changeIcon} ${Math.abs(mover.change_24h).toFixed(2)}%
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async loadFearGreedIndex() {
        try {
            const response = await axios.get('/api/market/fear-greed');
            
            if (response.data.success) {
                const data = response.data.data;
                this.updateFearGreedIndex(data.value, data.classification);
            }
        } catch (error) {
            console.error('Error loading fear & greed index:', error);
            // Use default value
            this.updateFearGreedIndex(50, 'Neutral');
        }
    }

    updateFearGreedIndex(value, classification) {
        const emoji = this.getFearGreedEmoji(value);
        const persianStatus = this.getFearGreedStatus(classification);
        const color = this.getFearGreedColor(value);

        document.getElementById('fear-greed-value').textContent = value;
        document.getElementById('fear-greed-emoji').textContent = emoji;
        document.getElementById('fear-greed-status').textContent = persianStatus;
        document.getElementById('fear-greed-bar').style.width = `${value}%`;
        document.getElementById('fear-greed-bar').className = `h-3 rounded-full transition-all duration-500 ${color}`;
    }

    getFearGreedEmoji(value) {
        if (value <= 20) return '😰';
        if (value <= 40) return '😟';
        if (value <= 60) return '😐';
        if (value <= 80) return '😊';
        return '🤑';
    }

    getFearGreedStatus(classification) {
        const statusMap = {
            'Extreme Fear': 'ترس شدید',
            'Fear': 'ترس',
            'Neutral': 'خنثی', 
            'Greed': 'طمع',
            'Extreme Greed': 'طمع شدید'
        };
        return statusMap[classification] || 'خنثی';
    }

    getFearGreedColor(value) {
        if (value <= 20) return 'bg-red-500';
        if (value <= 40) return 'bg-orange-500';
        if (value <= 60) return 'bg-yellow-400';
        if (value <= 80) return 'bg-green-400';
        return 'bg-green-500';
    }

    async loadTrendingCoins() {
        try {
            const response = await axios.get('/api/market/trending');
            
            if (response.data.success) {
                this.renderTrendingCoins(response.data.data);
            }
        } catch (error) {
            console.error('Error loading trending coins:', error);
            this.loadMockTrendingCoins();
        }
    }

    loadMockTrendingCoins() {
        const mockTrending = [
            { symbol: 'BTC', name: 'Bitcoin', price: 45230, change_24h: 2.45 },
            { symbol: 'ETH', name: 'Ethereum', price: 2890, change_24h: -1.23 },
            { symbol: 'SOL', name: 'Solana', price: 98.45, change_24h: 5.67 },
            { symbol: 'ADA', name: 'Cardano', price: 0.485, change_24h: -2.34 }
        ];

        this.renderTrendingCoins(mockTrending);
    }

    renderTrendingCoins(coins) {
        const container = document.getElementById('trending-coins');
        if (!container) return;

        const html = coins.map(coin => {
            const changeClass = coin.change_24h >= 0 ? 'text-green-400' : 'text-red-400';
            const changeIcon = coin.change_24h >= 0 ? '↗' : '↘';
            
            return `
                <div class="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
                    <div>
                        <div class="text-white font-medium">${coin.symbol}</div>
                        <div class="text-gray-400 text-xs">${coin.name}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-white font-medium">$${coin.price.toLocaleString()}</div>
                        <div class="text-sm ${changeClass}">
                            ${changeIcon} ${Math.abs(coin.change_24h).toFixed(2)}%
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    setupWatchlistAutoRefresh() {
        // Clear existing interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        // Refresh every 30 seconds
        this.autoRefreshInterval = setInterval(() => {
            this.refreshWatchlistPrices();
        }, 30000);
    }

    setupEventListeners() {
        // Modal event listeners will be handled by onclick attributes in HTML
        console.log('📡 Watchlist event listeners set up');
    }

    // Modal methods
    showAddToWatchlistModal() {
        const modal = document.getElementById('add-watchlist-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    hideAddToWatchlistModal() {
        const modal = document.getElementById('add-watchlist-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        this.clearAddModalForm();
    }

    clearAddModalForm() {
        document.getElementById('asset-type').value = 'crypto';
        document.getElementById('asset-symbol').value = '';
        document.getElementById('asset-name').value = '';
        document.getElementById('price-alert-high').value = '';
        document.getElementById('price-alert-low').value = '';
    }

    async addToWatchlist() {
        const type = document.getElementById('asset-type').value;
        const symbol = document.getElementById('asset-symbol').value.toUpperCase();
        const name = document.getElementById('asset-name').value;
        const alertHigh = parseFloat(document.getElementById('price-alert-high').value) || null;
        const alertLow = parseFloat(document.getElementById('price-alert-low').value) || null;

        if (!symbol || !name) {
            alert('لطفاً نماد و نام را وارد کنید');
            return;
        }

        try {
            // Save to server first to get real database ID
            const response = await axios.post('/api/watchlist/add', {
                user_id: 'demo_user',
                symbol,
                name,
                type,
                price_alert_high: alertHigh,
                price_alert_low: alertLow
            });

            if (response.data.success) {
                // Add the server-returned item with real database ID
                const newItem = response.data.data;
                this.watchlistItems.push(newItem);

                // Update UI
                this.renderWatchlistTable();
                this.updateWatchlistStats();
                
                // Close modal
                this.hideAddToWatchlistModal();

                // Show success message
                this.showAlert('آیتم به لیست مورد علاقه اضافه شد', 'success');
                
                // Refresh prices for new item
                await this.refreshItemPrice(newItem.id);
                
            } else {
                throw new Error(response.data.error || 'Failed to add to watchlist');
            }

        } catch (error) {
            console.error('Error adding to watchlist:', error);
            if (error.response && error.response.data && error.response.data.error) {
                this.showAlert(error.response.data.error, 'error');
            } else {
                this.showAlert('خطا در افزودن آیتم', 'error');
            }
        }
    }

    async removeFromWatchlist(itemId) {
        if (!confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
            return;
        }

        try {
            // Remove from local array
            this.watchlistItems = this.watchlistItems.filter(item => item.id !== itemId);

            // Remove from server
            await axios.delete(`/api/watchlist/remove/${itemId}`);

            // Update UI
            this.renderWatchlistTable();
            this.updateWatchlistStats();

            this.showAlert('آیتم از لیست حذف شد', 'success');

        } catch (error) {
            console.error('Error removing from watchlist:', error);
            this.showAlert('خطا در حذف آیتم', 'error');
        }
    }

    showSetAlertModal(itemId) {
        this.currentAlertItemId = itemId;
        const item = this.watchlistItems.find(i => i.id === itemId);
        
        if (item) {
            document.getElementById('edit-price-alert-high').value = item.price_alert_high || '';
            document.getElementById('edit-price-alert-low').value = item.price_alert_low || '';
            
            const modal = document.getElementById('set-alert-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }
    }

    hideSetAlertModal() {
        const modal = document.getElementById('set-alert-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        this.currentAlertItemId = null;
    }

    async saveAlert() {
        if (!this.currentAlertItemId) return;

        const alertHigh = parseFloat(document.getElementById('edit-price-alert-high').value) || null;
        const alertLow = parseFloat(document.getElementById('edit-price-alert-low').value) || null;

        try {
            // Update local item
            const item = this.watchlistItems.find(i => i.id === this.currentAlertItemId);
            if (item) {
                item.price_alert_high = alertHigh;
                item.price_alert_low = alertLow;
            }

            // Save to server
            await axios.put(`/api/watchlist/update/${this.currentAlertItemId}`, {
                price_alert_high: alertHigh,
                price_alert_low: alertLow
            });

            // Update UI
            this.renderWatchlistTable();
            this.updateWatchlistStats();
            
            // Close modal
            this.hideSetAlertModal();

            this.showAlert('آلرت قیمت بروزرسانی شد', 'success');

        } catch (error) {
            console.error('Error saving alert:', error);
            this.showAlert('خطا در بروزرسانی آلرت', 'error');
        }
    }

    async refreshMarketData() {
        await this.loadMarketMovers();
        this.showAlert('داده‌های بازار بروزرسانی شد', 'success');
    }

    showAlert(message, type = 'info') {
        // Use app's alert system if available, otherwise console log
        if (typeof app !== 'undefined' && app.showAlert) {
            app.showAlert(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    destroy() {
        console.log('🗑️ Destroying Watchlist module...');
        
        // Clear auto-refresh interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        
        // Clear cache
        this.priceCache.clear();
        this.watchlistItems = [];
        
        console.log('✅ Watchlist module destroyed');
    }
}

// Global instance for TitanModules namespace
if (typeof window.TitanModules === 'undefined') {
    window.TitanModules = {};
}

window.TitanModules.WatchlistModule = WatchlistModule;

// Global instance for direct access
window.watchlistModule = null;

// Export for module loader
// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.WatchlistModule = WatchlistModule;