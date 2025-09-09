// Trading Tab Module - Clean implementation without template literal issues
// Complete trading configuration with risk management and auto-trading settings

export default class TradingTab {
    constructor(settings) {
        this.settings = settings;
    }

    render() {
        const trading = this.settings.trading || {};
        const risk = trading.risk_management || {};
        const auto = trading.auto_trading || {};
        const strategies = auto.strategies || {};

        return `
        <div class="space-y-6">
            <!-- Risk Management -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-shield-alt text-red-400 mr-3"></i>
                    ⚠️ مدیریت ریسک
                </h4>
                <p class="text-gray-400 mb-4">تنظیمات ایمنی و کنترل ریسک برای حفظ سرمایه</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                <i class="fas fa-percentage text-red-400 mr-1"></i>
                                حداکثر ریسک هر معامله (%)
                            </label>
                            <input type="number" 
                                   id="max-risk-per-trade" 
                                   min="0.1" max="10" step="0.1" 
                                   value="${risk.max_risk_per_trade || 2.0}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <p class="text-xs text-gray-500 mt-1">توصیه: حداکثر 2% سرمایه در هر معامله</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                <i class="fas fa-calendar-day text-red-400 mr-1"></i>
                                حداکثر ضرر روزانه (%)
                            </label>
                            <input type="number" 
                                   id="max-daily-loss" 
                                   min="1" max="20" step="0.5" 
                                   value="${risk.max_daily_loss || 5.0}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <p class="text-xs text-gray-500 mt-1">در صورت رسیدن به این حد، معاملات متوقف می‌شود</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                <i class="fas fa-layer-group text-blue-400 mr-1"></i>
                                حداکثر پوزیشن‌های همزمان
                            </label>
                            <input type="number" 
                                   id="max-positions" 
                                   min="1" max="50" 
                                   value="${risk.max_positions || 10}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <p class="text-xs text-gray-500 mt-1">تعداد معاملات باز همزمان</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                <i class="fas fa-dollar-sign text-green-400 mr-1"></i>
                                حداکثر مبلغ هر معامله (USDT)
                            </label>
                            <input type="number" 
                                   id="max-amount-per-trade" 
                                   min="10" max="100000" 
                                   value="${risk.max_amount_per_trade || 1000}" 
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <p class="text-xs text-gray-500 mt-1">حداکثر مبلغ قابل سرمایه‌گذاری در یک معامله</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Auto Trading -->
            <div class="bg-gray-900 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-robot text-blue-400 mr-3"></i>
                        🤖 معاملات خودکار
                    </h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               id="auto-trading-enabled" 
                               ${auto.enabled ? 'checked' : ''} 
                               class="sr-only peer">
                        <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        <span class="mr-3 text-sm font-medium text-gray-300">فعال</span>
                    </label>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Strategy Selection -->
                    <div>
                        <h5 class="text-md font-semibold text-white mb-3 flex items-center">
                            <i class="fas fa-chess text-purple-400 mr-2"></i>
                            استراتژی‌های معاملاتی
                        </h5>
                        <div class="space-y-3">
                            <label class="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                                <div class="flex items-center">
                                    <input type="checkbox" 
                                           id="strategy-momentum" 
                                           ${strategies.momentum ? 'checked' : ''} 
                                           class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                    <div class="mr-3">
                                        <span class="text-white font-medium">Momentum Trading</span>
                                        <p class="text-xs text-gray-400">پیگیری روند قیمت صعودی/نزولی</p>
                                    </div>
                                </div>
                                <span class="text-green-400 text-sm">پیشنهادی</span>
                            </label>
                            
                            <label class="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                                <div class="flex items-center">
                                    <input type="checkbox" 
                                           id="strategy-mean-reversion" 
                                           ${strategies.mean_reversion ? 'checked' : ''} 
                                           class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                    <div class="mr-3">
                                        <span class="text-white font-medium">Mean Reversion</span>
                                        <p class="text-xs text-gray-400">بازگشت قیمت به میانگین</p>
                                    </div>
                                </div>
                                <span class="text-yellow-400 text-sm">متوسط</span>
                            </label>
                            
                            <label class="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                                <div class="flex items-center">
                                    <input type="checkbox" 
                                           id="strategy-dca" 
                                           ${strategies.dca ? 'checked' : ''} 
                                           class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                    <div class="mr-3">
                                        <span class="text-white font-medium">Dollar Cost Averaging (DCA)</span>
                                        <p class="text-xs text-gray-400">خرید تدریجی در فواصل زمانی</p>
                                    </div>
                                </div>
                                <span class="text-blue-400 text-sm">امن</span>
                            </label>
                            
                            <label class="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                                <div class="flex items-center">
                                    <input type="checkbox" 
                                           id="strategy-grid" 
                                           ${strategies.grid ? 'checked' : ''} 
                                           class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                                    <div class="mr-3">
                                        <span class="text-white font-medium">Grid Trading</span>
                                        <p class="text-xs text-gray-400">شبکه سفارشات خرید و فروش</p>
                                    </div>
                                </div>
                                <span class="text-orange-400 text-sm">پیشرفته</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Advanced Settings -->
                    <div>
                        <h5 class="text-md font-semibold text-white mb-3 flex items-center">
                            <i class="fas fa-cogs text-gray-400 mr-2"></i>
                            تنظیمات پیشرفته
                        </h5>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    فاصله زمانی تحلیل (ثانیه)
                                </label>
                                <select id="analysis-interval" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="30">30 ثانیه (سریع)</option>
                                    <option value="60" selected>1 دقیقه (متعادل)</option>
                                    <option value="300">5 دقیقه (محافظه‌کارانه)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    سطح اطمینان AI (%)
                                </label>
                                <input type="range" 
                                       id="ai-confidence" 
                                       min="50" max="95" 
                                       value="75" 
                                       class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                                <div class="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>50% (پرریسک)</span>
                                    <span>75%</span>
                                    <span>95% (محافظه‌کار)</span>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    نوع ارز مبنا
                                </label>
                                <select id="base-currency" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="USDT" selected>USDT (تتر)</option>
                                    <option value="BUSD">BUSD</option>
                                    <option value="BTC">BTC (بیت‌کوین)</option>
                                    <option value="ETH">ETH (اتریوم)</option>
                                </select>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div>
                                    <span class="text-white text-sm font-medium">اعلان‌های معاملاتی</span>
                                    <p class="text-xs text-gray-400">ارسال پیام هنگام باز/بسته شدن معاملات</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Monitoring -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-chart-line text-green-400 mr-3"></i>
                    📊 پایش عملکرد
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gray-800 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-green-400">+12.5%</div>
                        <div class="text-sm text-gray-400">سود امروز</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-blue-400">73.2%</div>
                        <div class="text-sm text-gray-400">نرخ موفقیت</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-purple-400">47</div>
                        <div class="text-sm text-gray-400">معاملات امروز</div>
                    </div>
                </div>
                
                <div class="mt-4 flex space-x-2 space-x-reverse">
                    <button onclick="tradingTab.viewDetailedStats()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-chart-bar mr-2"></i>
                        آمار تفصیلی
                    </button>
                    <button onclick="tradingTab.exportPerformance()" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-download mr-2"></i>
                        صادرات گزارش
                    </button>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 border border-blue-700">
                <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                    <i class="fas fa-bolt text-yellow-400 mr-3"></i>
                    ⚡ عملیات سریع
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button onclick="tradingTab.startAutopilot()" class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-play mr-2"></i>
                        شروع خودپیلوت
                    </button>
                    <button onclick="tradingTab.stopAutopilot()" class="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-stop mr-2"></i>
                        توقف معاملات
                    </button>
                    <button onclick="tradingTab.testStrategy()" class="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-vial mr-2"></i>
                        تست استراتژی
                    </button>
                    <button onclick="tradingTab.emergencyStop()" class="px-4 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        توقف اضطراری
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    // Collect form data
    collectData() {
        return {
            risk_management: {
                max_risk_per_trade: parseFloat(document.getElementById('max-risk-per-trade')?.value || 2.0),
                max_daily_loss: parseFloat(document.getElementById('max-daily-loss')?.value || 5.0),
                max_positions: parseInt(document.getElementById('max-positions')?.value || 10),
                max_amount_per_trade: parseFloat(document.getElementById('max-amount-per-trade')?.value || 1000)
            },
            auto_trading: {
                enabled: document.getElementById('auto-trading-enabled')?.checked || false,
                strategies: {
                    momentum: document.getElementById('strategy-momentum')?.checked || false,
                    mean_reversion: document.getElementById('strategy-mean-reversion')?.checked || false,
                    dca: document.getElementById('strategy-dca')?.checked || false,
                    grid: document.getElementById('strategy-grid')?.checked || false
                },
                analysis_interval: parseInt(document.getElementById('analysis-interval')?.value || 60),
                ai_confidence: parseInt(document.getElementById('ai-confidence')?.value || 75),
                base_currency: document.getElementById('base-currency')?.value || 'USDT'
            }
        };
    }

    // Initialize tab functionality
    initialize() {
        console.log('🔧 Trading tab initialized');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up global instance
        window.tradingTab = this;
    }

    setupEventListeners() {
        // Risk validation
        const riskInput = document.getElementById('max-risk-per-trade');
        if (riskInput) {
            riskInput.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                if (value > 5) {
                    alert('⚠️ هشدار: ریسک بالای 5% توصیه نمی‌شود');
                }
            });
        }

        // AI confidence slider display
        const confidenceSlider = document.getElementById('ai-confidence');
        if (confidenceSlider) {
            confidenceSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                // Update display (could add a label)
            });
        }
    }

    // Action methods
    startAutopilot() {
        if (confirm('آیا مطمئن هستید که می‌خواهید سیستم معاملات خودکار را شروع کنید؟')) {
            console.log('🚀 Starting autopilot...');
            this.showNotification('سیستم خودپیلوت فعال شد', 'success');
        }
    }

    stopAutopilot() {
        if (confirm('آیا مطمئن هستید که می‌خواهید معاملات خودکار را متوقف کنید؟')) {
            console.log('⏹️ Stopping autopilot...');
            this.showNotification('سیستم خودپیلوت متوقف شد', 'warning');
        }
    }

    testStrategy() {
        console.log('🧪 Testing strategy...');
        this.showNotification('تست استراتژی شروع شد', 'info');
    }

    emergencyStop() {
        if (confirm('⚠️ توقف اضطراری تمام معاملات؟ این عمل قابل بازگشت نیست!')) {
            console.log('🚨 EMERGENCY STOP activated');
            this.showNotification('توقف اضطراری فعال شد', 'error');
        }
    }

    viewDetailedStats() {
        // Would open a detailed statistics modal
        this.showNotification('آمار تفصیلی در حال بارگذاری...', 'info');
    }

    exportPerformance() {
        // Would generate and download a performance report
        this.showNotification('گزارش عملکرد صادر شد', 'success');
    }

    showNotification(message, type = 'info') {
        // Simple notification - would integrate with main notification system
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}