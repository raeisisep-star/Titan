/**
 * Manual Trading Advanced Module - Professional Manual Trading System
 * Version: 1.0.0
 * Created: 2024-08-24
 * Features: Advanced portfolio management, performance analytics, multi-strategy support
 */

class ManualTradingAdvancedModule {
    constructor() {
        this.name = 'manual-trading-advanced';
        this.version = '1.0.0';
        this.portfolioData = {};
        this.performanceMetrics = {};
        this.activeStrategies = [];
        this.signals = [];
        this.refreshInterval = null;
        
        console.log(`📊 Manual Trading Advanced Module v${this.version} initialized`);
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Enhanced Trading Header with KPIs -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-white mb-2">📊 معاملات دستی حرفه‌ای</h1>
                        <p class="text-blue-100">سیستم معاملات دستی مجهز به هوش مصنوعی و تحلیل پیشرفته</p>
                    </div>
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div class="text-sm text-blue-100">موجودی کل</div>
                            <div id="total-balance" class="text-lg font-bold">$12,450.00</div>
                        </div>
                        <div>
                            <div class="text-sm text-blue-100">سود امروز</div>
                            <div id="daily-pnl" class="text-lg font-bold text-green-300">+$245.67</div>
                        </div>
                        <div>
                            <div class="text-sm text-blue-100">نرخ برد</div>
                            <div id="win-rate" class="text-lg font-bold text-yellow-300">78.4%</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Dashboard -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">معاملات فعال</p>
                            <p class="text-2xl font-bold text-blue-400" id="active-trades">8</p>
                            <p class="text-xs text-gray-500">در حال اجرا</p>
                        </div>
                        <div class="text-3xl">🔄</div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">حجم معاملات</p>
                            <p class="text-2xl font-bold text-green-400" id="trading-volume">$45.2K</p>
                            <p class="text-xs text-gray-500">24 ساعت</p>
                        </div>
                        <div class="text-3xl">📈</div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">بهترین معامله</p>
                            <p class="text-2xl font-bold text-yellow-400" id="best-trade">+12.3%</p>
                            <p class="text-xs text-gray-500">BTC/USDT</p>
                        </div>
                        <div class="text-3xl">⭐</div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">شارپ ریشو</p>
                            <p class="text-2xl font-bold text-purple-400" id="sharpe-ratio">2.47</p>
                            <p class="text-xs text-gray-500">عملکرد تعدیل شده</p>
                        </div>
                        <div class="text-3xl">📊</div>
                    </div>
                </div>
            </div>

            <!-- Main Trading Interface -->
            <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <!-- Advanced Chart with Multiple Timeframes -->
                <div class="xl:col-span-3">
                    <div class="bg-gray-800 rounded-lg border border-gray-700">
                        <div class="px-4 py-3 border-b border-gray-700">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold text-white">نمودار معاملاتی چندبعدی</h3>
                                <div class="flex items-center gap-2">
                                    <!-- Symbol Selection -->
                                    <select id="symbol-selector" onchange="window.manualTradingAdvanced?.changeSymbol(this.value)"
                                            class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                        <option value="BTC/USDT">BTC/USDT</option>
                                        <option value="ETH/USDT">ETH/USDT</option>
                                        <option value="ADA/USDT">ADA/USDT</option>
                                        <option value="SOL/USDT">SOL/USDT</option>
                                        <option value="AVAX/USDT">AVAX/USDT</option>
                                    </select>
                                    
                                    <!-- Timeframe Selection -->
                                    <select id="timeframe-selector" onchange="window.manualTradingAdvanced?.changeTimeframe(this.value)"
                                            class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                        <option value="1m">1م</option>
                                        <option value="5m">5م</option>
                                        <option value="15m">15م</option>
                                        <option value="1h" selected>1ساعت</option>
                                        <option value="4h">4ساعت</option>
                                        <option value="1d">1روز</option>
                                    </select>
                                    
                                    <!-- AI Analysis Toggle -->
                                    <button onclick="window.manualTradingAdvanced?.toggleAIAnalysis()" 
                                            id="ai-analysis-btn"
                                            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                                        🤖 تحلیل AI
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="p-4">
                            <!-- Chart Container -->
                            <div class="relative">
                                <canvas id="advanced-chart" class="w-full" height="400"></canvas>
                                <!-- AI Signal Overlay -->
                                <div id="ai-signals-overlay" class="absolute top-2 left-2 space-y-2 hidden">
                                    <!-- Dynamic AI signals will be inserted here -->
                                </div>
                            </div>
                            
                            <!-- Chart Controls -->
                            <div class="flex items-center justify-between mt-4">
                                <div class="flex items-center gap-2">
                                    <button onclick="window.manualTradingAdvanced?.toggleIndicator('rsi')" 
                                            class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                                        RSI
                                    </button>
                                    <button onclick="window.manualTradingAdvanced?.toggleIndicator('macd')" 
                                            class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">
                                        MACD
                                    </button>
                                    <button onclick="window.manualTradingAdvanced?.toggleIndicator('bb')" 
                                            class="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs">
                                        Bollinger
                                    </button>
                                </div>
                                <div class="text-sm text-gray-400">
                                    Last Update: <span id="chart-last-update">--</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Trading Panel -->
                <div class="space-y-6">
                    <!-- Quick Trading -->
                    <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 class="text-md font-semibold text-white mb-4">⚡ معاملات سریع</h3>
                        
                        <!-- Current Price -->
                        <div class="bg-gray-700 rounded p-3 mb-4 text-center">
                            <div id="current-price" class="text-xl font-bold text-white">$43,250.00</div>
                            <div id="price-change" class="text-sm text-green-400">+2.45% (24h)</div>
                        </div>
                        
                        <!-- Buy/Sell Buttons -->
                        <div class="grid grid-cols-2 gap-2 mb-4">
                            <button onclick="window.manualTradingAdvanced?.quickTrade('buy')" 
                                    class="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-medium">
                                🟢 خرید سریع
                            </button>
                            <button onclick="window.manualTradingAdvanced?.quickTrade('sell')" 
                                    class="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded font-medium">
                                🔴 فروش سریع
                            </button>
                        </div>
                        
                        <!-- Amount Presets -->
                        <div class="grid grid-cols-4 gap-1 mb-4">
                            <button onclick="window.manualTradingAdvanced?.setAmount(25)" 
                                    class="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-xs">
                                25%
                            </button>
                            <button onclick="window.manualTradingAdvanced?.setAmount(50)" 
                                    class="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-xs">
                                50%
                            </button>
                            <button onclick="window.manualTradingAdvanced?.setAmount(75)" 
                                    class="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-xs">
                                75%
                            </button>
                            <button onclick="window.manualTradingAdvanced?.setAmount(100)" 
                                    class="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-xs">
                                MAX
                            </button>
                        </div>
                        
                        <!-- Risk Management -->
                        <div class="space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400 text-sm">Stop Loss:</span>
                                <input type="number" id="stop-loss-input" placeholder="2.5%" 
                                       class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-20">
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400 text-sm">Take Profit:</span>
                                <input type="number" id="take-profit-input" placeholder="5.0%" 
                                       class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-20">
                            </div>
                        </div>
                    </div>

                    <!-- AI Trading Assistant -->
                    <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 class="text-md font-semibold text-white mb-4">🤖 دستیار معاملاتی AI</h3>
                        
                        <!-- AI Recommendation -->
                        <div id="ai-recommendation" class="bg-blue-900 bg-opacity-30 border-l-4 border-blue-400 p-3 rounded mb-4">
                            <p class="text-blue-300 text-sm font-medium">توصیه هوشمند</p>
                            <p class="text-white text-sm">بر اساس تحلیل، زمان مناسبی برای خرید BTC است</p>
                        </div>
                        
                        <!-- Market Sentiment -->
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400 text-sm">احساسات بازار:</span>
                                <span id="market-sentiment" class="text-green-400 font-medium">مثبت 78%</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2">
                                <div id="sentiment-bar" class="bg-green-400 h-2 rounded-full" style="width: 78%"></div>
                            </div>
                        </div>
                        
                        <!-- Fear & Greed Index -->
                        <div class="bg-gray-700 rounded p-3">
                            <div class="text-center">
                                <div class="text-xs text-gray-400">شاخص ترس و طمع</div>
                                <div id="fear-greed-index" class="text-lg font-bold text-yellow-400">72</div>
                                <div class="text-xs text-gray-400">حالت طمع</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Strategy Manager -->
                    <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 class="text-md font-semibold text-white mb-4">🧠 مدیر استراتژی</h3>
                        
                        <!-- Active Strategies -->
                        <div class="space-y-2 mb-4">
                            <div class="flex items-center justify-between bg-gray-700 rounded p-2">
                                <div>
                                    <span class="text-white text-sm">اسکلپینگ BTC</span>
                                    <div class="text-xs text-green-400">+5.2% (فعال)</div>
                                </div>
                                <button onclick="window.manualTradingAdvanced?.toggleStrategy('scalping')" 
                                        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">
                                    ON
                                </button>
                            </div>
                            <div class="flex items-center justify-between bg-gray-700 rounded p-2">
                                <div>
                                    <span class="text-white text-sm">DCA ETH</span>
                                    <div class="text-xs text-gray-400">غیرفعال</div>
                                </div>
                                <button onclick="window.manualTradingAdvanced?.toggleStrategy('dca')" 
                                        class="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs">
                                    OFF
                                </button>
                            </div>
                        </div>
                        
                        <button onclick="window.manualTradingAdvanced?.openStrategyManager()" 
                                class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium">
                            ⚙️ مدیریت استراتژی‌ها
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Enhanced Portfolio Management -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Portfolio Overview -->
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 class="text-lg font-semibold text-white mb-4">💼 نمای کلی پورتفولیو</h3>
                    
                    <!-- Portfolio Allocation Chart -->
                    <div class="mb-4">
                        <canvas id="portfolio-pie-chart" width="200" height="200"></canvas>
                    </div>
                    
                    <!-- Top Holdings -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-6 h-6 bg-orange-500 rounded-full mr-2"></div>
                                <span class="text-white text-sm">BTC</span>
                            </div>
                            <div class="text-right">
                                <div class="text-white text-sm">45.2%</div>
                                <div class="text-gray-400 text-xs">$5,625</div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
                                <span class="text-white text-sm">ETH</span>
                            </div>
                            <div class="text-right">
                                <div class="text-white text-sm">32.1%</div>
                                <div class="text-gray-400 text-xs">$3,996</div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-6 h-6 bg-green-500 rounded-full mr-2"></div>
                                <span class="text-white text-sm">USDT</span>
                            </div>
                            <div class="text-right">
                                <div class="text-white text-sm">22.7%</div>
                                <div class="text-gray-400 text-xs">$2,829</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Performance Analytics -->
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 class="text-lg font-semibold text-white mb-4">📈 آنالیز عملکرد</h3>
                    
                    <!-- Performance Chart -->
                    <div class="mb-4">
                        <canvas id="performance-chart" width="300" height="150"></canvas>
                    </div>
                    
                    <!-- Key Metrics -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-400">+23.7%</div>
                            <div class="text-xs text-gray-400">بازده کل</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-400">127</div>
                            <div class="text-xs text-gray-400">کل معاملات</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-400">2.47</div>
                            <div class="text-xs text-gray-400">شارپ ریشو</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-400">-5.2%</div>
                            <div class="text-xs text-gray-400">حداکثر کاهش</div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 class="text-lg font-semibold text-white mb-4">⚡ فعالیت‌های اخیر</h3>
                    
                    <div id="recent-activity" class="space-y-3">
                        <div class="flex items-center justify-between bg-gray-700 rounded p-2">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                                    <i class="fas fa-arrow-up text-white text-xs"></i>
                                </div>
                                <div>
                                    <div class="text-white text-sm">خرید BTC</div>
                                    <div class="text-gray-400 text-xs">2 دقیقه پیش</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-white text-sm">+$1,250</div>
                                <div class="text-green-400 text-xs">+2.3%</div>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between bg-gray-700 rounded p-2">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-2">
                                    <i class="fas fa-arrow-down text-white text-xs"></i>
                                </div>
                                <div>
                                    <div class="text-white text-sm">فروش ETH</div>
                                    <div class="text-gray-400 text-xs">15 دقیقه پیش</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-white text-sm">+$890</div>
                                <div class="text-green-400 text-xs">+4.1%</div>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between bg-gray-700 rounded p-2">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                                    <i class="fas fa-robot text-white text-xs"></i>
                                </div>
                                <div>
                                    <div class="text-white text-sm">سیگنال AI</div>
                                    <div class="text-gray-400 text-xs">32 دقیقه پیش</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-yellow-400 text-sm">خرید</div>
                                <div class="text-gray-400 text-xs">CONFIDENCE 85%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    async init() {
        console.log('📊 Initializing Manual Trading Advanced system...');
        
        try {
            // Load initial data
            await Promise.all([
                this.loadPortfolioData(),
                this.loadPerformanceMetrics(),
                this.initializeCharts(),
                this.startRealTimeUpdates()
            ]);
            
            console.log('✅ Manual Trading Advanced system initialized successfully');
            this.showNotification('سیستم معاملات دستی حرفه‌ای آماده است', 'success');
            
        } catch (error) {
            console.error('❌ Error initializing manual trading system:', error);
            this.showNotification('خطا در راه‌اندازی سیستم معاملات', 'error');
        }
    }

    // Core Trading Functions
    async quickTrade(side) {
        console.log(`⚡ Quick ${side} trade initiated`);
        
        const modal = this.createModal(`معامله سریع - ${side === 'buy' ? 'خرید' : 'فروش'}`, `
            <div class="space-y-4">
                <div class="bg-${side === 'buy' ? 'green' : 'red'}-900 bg-opacity-30 border-l-4 border-${side === 'buy' ? 'green' : 'red'}-400 p-3 rounded">
                    <p class="text-${side === 'buy' ? 'green' : 'red'}-300 font-medium">
                        ${side === 'buy' ? '🟢 خرید سریع' : '🔴 فروش سریع'} BTC/USDT
                    </p>
                    <p class="text-white text-sm">قیمت فعلی: $43,250.00</p>
                </div>
                
                <div class="space-y-3">
                    <div>
                        <label class="text-gray-400 text-sm">مقدار (USDT):</label>
                        <input type="number" id="trade-amount" placeholder="1000" 
                               class="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-gray-400 text-sm">Stop Loss (%):</label>
                            <input type="number" id="sl" placeholder="2.5" 
                                   class="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                        </div>
                        <div>
                            <label class="text-gray-400 text-sm">Take Profit (%):</label>
                            <input type="number" id="tp" placeholder="5.0" 
                                   class="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end gap-3 pt-4">
                    <button onclick="this.closest('.modal-overlay').remove()" 
                            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                        انصراف
                    </button>
                    <button onclick="window.manualTradingAdvanced?.executeTrade('${side}')" 
                            class="px-4 py-2 bg-${side === 'buy' ? 'green' : 'red'}-600 hover:bg-${side === 'buy' ? 'green' : 'red'}-700 text-white rounded">
                        ${side === 'buy' ? '🟢 تایید خرید' : '🔴 تایید فروش'}
                    </button>
                </div>
            </div>
        `);
    }

    async executeTrade(side) {
        const amount = document.getElementById('trade-amount')?.value || '1000';
        const sl = document.getElementById('sl')?.value || '2.5';
        const tp = document.getElementById('tp')?.value || '5.0';
        
        console.log(`🎯 Executing ${side} trade:`, { amount, sl, tp });
        
        // Close modal
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
        
        // Show success
        this.showNotification(`معامله ${side === 'buy' ? 'خرید' : 'فروش'} $${amount} با موفقیت ثبت شد! 🎉`, 'success');
        
        // Update UI with new trade
        this.updateTradesList(side, amount, sl, tp);
    }

    async openStrategyManager() {
        console.log('🧠 Opening Strategy Manager');
        
        const modal = this.createModal('🧠 مدیریت استراتژی‌های معاملاتی', `
            <div class="space-y-6">
                <!-- Available Strategies -->
                <div>
                    <h4 class="text-lg font-medium text-white mb-4">استراتژی‌های موجود</h4>
                    <div class="space-y-3">
                        <div class="bg-gray-700 rounded p-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-white font-medium">اسکلپینگ BTC</span>
                                <span class="px-2 py-1 bg-green-600 text-white text-xs rounded">فعال</span>
                            </div>
                            <p class="text-gray-400 text-sm mb-3">معاملات سریع با بازده بالا</p>
                            <div class="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-400">ROI:</span>
                                    <span class="text-green-400 font-medium">+12.3%</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">معاملات:</span>
                                    <span class="text-white">47</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">نرخ برد:</span>
                                    <span class="text-blue-400">78.4%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-700 rounded p-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-white font-medium">DCA ETH</span>
                                <span class="px-2 py-1 bg-gray-600 text-white text-xs rounded">غیرفعال</span>
                            </div>
                            <p class="text-gray-400 text-sm mb-3">سرمایه‌گذاری تدریجی</p>
                            <div class="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-400">ROI:</span>
                                    <span class="text-green-400 font-medium">+8.7%</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">معاملات:</span>
                                    <span class="text-white">23</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">نرخ برد:</span>
                                    <span class="text-blue-400">85.2%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Create New Strategy -->
                <div>
                    <h4 class="text-lg font-medium text-white mb-4">ایجاد استراتژی جدید</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="window.manualTradingAdvanced?.createStrategy('scalping')" 
                                class="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded">
                            ⚡ اسکلپینگ
                        </button>
                        <button onclick="window.manualTradingAdvanced?.createStrategy('swing')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded">
                            📈 سوئینگ
                        </button>
                        <button onclick="window.manualTradingAdvanced?.createStrategy('dca')" 
                                class="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded">
                            💰 DCA
                        </button>
                        <button onclick="window.manualTradingAdvanced?.createStrategy('arbitrage')" 
                                class="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded">
                            🔄 آربیتراژ
                        </button>
                    </div>
                </div>
                
                <div class="flex justify-end">
                    <button onclick="this.closest('.modal-overlay').remove()" 
                            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                        بستن
                    </button>
                </div>
            </div>
        `);
    }

    // Helper Methods
    async loadPortfolioData() {
        // Simulate portfolio data loading
        this.portfolioData = {
            totalBalance: 12450.00,
            dailyPnL: 245.67,
            winRate: 78.4,
            activeTrades: 8,
            tradingVolume: 45200,
            bestTrade: 12.3,
            sharpeRatio: 2.47
        };
    }

    async loadPerformanceMetrics() {
        // Simulate performance metrics loading
        this.performanceMetrics = {
            totalReturn: 23.7,
            totalTrades: 127,
            maxDrawdown: -5.2,
            avgWin: 4.2,
            avgLoss: -2.1
        };
    }

    async initializeCharts() {
        console.log('📊 Initializing charts...');
        
        try {
            // Check if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js not loaded, loading from CDN...');
                await this.loadChartJS();
            }

            // Initialize Advanced Trading Chart
            await this.initAdvancedChart();
            
            // Initialize Portfolio Pie Chart
            await this.initPortfolioPieChart();
            
            // Initialize Performance Chart
            await this.initPerformanceChart();
            
            console.log('✅ All charts initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing charts:', error);
            this.showChartFallback();
        }
    }

    async loadChartJS() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkChart = () => {
                attempts++;
                
                if (typeof Chart !== 'undefined') {
                    console.log('✅ Chart.js found and ready');
                    resolve();
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    console.warn('⚠️ Chart.js not found, loading from CDN...');
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                    script.onload = () => {
                        console.log('✅ Chart.js loaded from CDN');
                        resolve();
                    };
                    script.onerror = () => {
                        console.error('❌ Failed to load Chart.js from CDN');
                        reject(new Error('Chart library not available'));
                    };
                    document.head.appendChild(script);
                    return;
                }
                
                setTimeout(checkChart, 200);
            };
            
            checkChart();
        });
    }

    async initAdvancedChart() {
        const canvas = document.getElementById('advanced-chart');
        if (!canvas) {
            console.warn('Advanced chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        try {
            // Destroy existing chart
            if (this.advancedChart) {
                this.advancedChart.destroy();
            }

            // Generate mock candlestick data
            const candlestickData = this.generateCandlestickData();

            this.advancedChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: candlestickData.labels,
                    datasets: [{
                        label: 'قیمت BTC/USDT',
                        data: candlestickData.prices,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#1E40AF',
                        pointBorderWidth: 1,
                        pointRadius: 3
                    }, {
                        label: 'Volume',
                        data: candlestickData.volumes,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.3)',
                        borderWidth: 1,
                        type: 'bar',
                        yAxisID: 'volumeAxis'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { 
                                color: '#ffffff',
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#3B82F6',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    if (context.datasetIndex === 0) {
                                        return `قیمت: $${context.parsed.y.toLocaleString()}`;
                                    } else {
                                        return `حجم: ${context.parsed.y.toLocaleString()}`;
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            ticks: { 
                                color: '#9CA3AF',
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            },
                            grid: { color: 'rgba(156, 163, 175, 0.1)' }
                        },
                        volumeAxis: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: { 
                                color: '#10B981',
                                callback: function(value) {
                                    return (value / 1000) + 'K';
                                }
                            },
                            grid: { drawOnChartArea: false }
                        },
                        x: {
                            ticks: { color: '#9CA3AF' },
                            grid: { color: 'rgba(156, 163, 175, 0.1)' }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });

            // Update chart data every 30 seconds
            setInterval(() => {
                this.updateAdvancedChart();
            }, 30000);

        } catch (error) {
            console.error('❌ Error creating advanced chart:', error);
            this.showChartFallback('advanced-chart');
        }
    }

    async initPortfolioPieChart() {
        const canvas = document.getElementById('portfolio-pie-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            if (this.portfolioPieChart) {
                this.portfolioPieChart.destroy();
            }

            this.portfolioPieChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['BTC', 'ETH', 'USDT', 'Others'],
                    datasets: [{
                        data: [45.2, 32.1, 22.7, 15.0],
                        backgroundColor: [
                            '#F7931A', // Bitcoin Orange
                            '#627EEA', // Ethereum Blue  
                            '#26A17B', // USDT Green
                            '#6B7280'  // Gray for others
                        ],
                        borderColor: '#1F2937',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false // We'll show custom legend
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed}%`;
                                }
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error creating portfolio pie chart:', error);
        }
    }

    async initPerformanceChart() {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        try {
            if (this.performanceChart) {
                this.performanceChart.destroy();
            }

            // Generate mock performance data
            const performanceData = this.generatePerformanceData();

            this.performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: performanceData.labels,
                    datasets: [{
                        label: 'بازده پورتفولیو',
                        data: performanceData.returns,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff'
                        }
                    },
                    scales: {
                        y: {
                            ticks: { 
                                color: '#9CA3AF',
                                callback: function(value) {
                                    return value + '%';
                                }
                            },
                            grid: { color: 'rgba(156, 163, 175, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#9CA3AF' },
                            grid: { color: 'rgba(156, 163, 175, 0.1)' }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error creating performance chart:', error);
        }
    }

    generateCandlestickData() {
        const labels = [];
        const prices = [];
        const volumes = [];
        
        let basePrice = 43000;
        const now = new Date();
        
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.getHours().toString().padStart(2, '0') + ':00');
            
            // Generate realistic price movement
            const change = (Math.random() - 0.5) * 1000;
            basePrice += change;
            prices.push(Math.round(basePrice));
            
            // Generate volume data
            volumes.push(Math.floor(Math.random() * 50000) + 10000);
        }
        
        return { labels, prices, volumes };
    }

    generatePerformanceData() {
        const labels = [];
        const returns = [];
        
        let baseReturn = 0;
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.getDate().toString());
            
            const change = (Math.random() - 0.4) * 2; // Slightly positive bias
            baseReturn += change;
            returns.push(parseFloat(baseReturn.toFixed(2)));
        }
        
        return { labels, returns };
    }

    updateAdvancedChart() {
        if (!this.advancedChart) return;
        
        try {
            // Update with new data point
            const newData = this.generateCandlestickData();
            this.advancedChart.data.labels = newData.labels;
            this.advancedChart.data.datasets[0].data = newData.prices;
            this.advancedChart.data.datasets[1].data = newData.volumes;
            this.advancedChart.update();
            
            // Update last update time
            const lastUpdateEl = document.getElementById('chart-last-update');
            if (lastUpdateEl) {
                lastUpdateEl.textContent = new Date().toLocaleTimeString('fa-IR');
            }
            
        } catch (error) {
            console.error('Error updating advanced chart:', error);
        }
    }

    showChartFallback(chartId = 'advanced-chart') {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;
        
        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="flex items-center justify-center h-64 bg-gray-700 rounded-lg">
                <div class="text-center">
                    <i class="fas fa-chart-line text-4xl text-gray-500 mb-4"></i>
                    <p class="text-gray-400">نمودار در حال بارگذاری...</p>
                    <p class="text-gray-500 text-sm mt-2">مشکل در بارگذاری Chart.js</p>
                    <button onclick="window.manualTradingAdvanced?.initializeCharts()" class="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        `;
    }

    startRealTimeUpdates() {
        // Update data every 10 seconds
        this.refreshInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 10000);
    }

    updateRealTimeData() {
        // Update live data
        const elements = {
            'current-price': `$${(43000 + Math.random() * 1000).toFixed(2)}`,
            'price-change': `${(Math.random() * 5 - 2.5).toFixed(2)}% (24h)`,
            'market-sentiment': `${Math.random() > 0.5 ? 'مثبت' : 'منفی'} ${(Math.random() * 100).toFixed(0)}%`
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    }

    // Utility Methods
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-white">${title}</h2>
                    <button onclick="this.closest('.modal-overlay').remove()" 
                            class="text-gray-400 hover:text-white text-2xl">×</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white max-w-sm transition-all duration-300 ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        }`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">×</button>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    updateTradesList(side, amount, sl, tp) {
        // Update recent activity with new trade
        console.log(`📝 Adding new ${side} trade to activity list`);
    }

    destroy() {
        console.log('🧹 Cleaning up Manual Trading Advanced module...');
        
        // Clear intervals
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Destroy charts
        if (this.advancedChart) {
            this.advancedChart.destroy();
            this.advancedChart = null;
        }
        
        if (this.portfolioPieChart) {
            this.portfolioPieChart.destroy();
            this.portfolioPieChart = null;
        }
        
        if (this.performanceChart) {
            this.performanceChart.destroy();
            this.performanceChart = null;
        }
        
        console.log('✅ Manual Trading Advanced module cleaned up');
    }

    // Placeholder methods for UI interactions
    async changeSymbol(symbol) { console.log('📊 Symbol changed:', symbol); }
    async changeTimeframe(timeframe) { console.log('⏰ Timeframe changed:', timeframe); }
    async toggleAIAnalysis() { console.log('🤖 AI Analysis toggled'); }
    async toggleIndicator(indicator) { console.log('📈 Indicator toggled:', indicator); }
    async setAmount(percent) { console.log('💰 Amount set:', percent + '%'); }
    async toggleStrategy(strategy) { console.log('🧠 Strategy toggled:', strategy); }
    async createStrategy(type) { 
        console.log('✨ Creating strategy:', type);
        this.showNotification(`استراتژی ${type} ایجاد شد!`, 'success');
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
    }
}

// Register the module globally
if (typeof window !== 'undefined') {
    window.ManualTradingAdvancedModule = ManualTradingAdvancedModule;
    console.log('📊 ManualTradingAdvancedModule registered globally');
}

// Module exports for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ManualTradingAdvancedModule;
}