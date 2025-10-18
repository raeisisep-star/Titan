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
        
        // Load current trading settings
        this.loadTradingSettings();
        
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
                    this.showNotification('⚠️ هشدار: ریسک بالای 5% توصیه نمی‌شود', 'warning');
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

        // Auto-save settings when changed
        const settingsInputs = document.querySelectorAll('#max-risk-per-trade, #max-daily-loss, #max-positions, #max-amount-per-trade, #auto-trading-enabled, #analysis-interval, #ai-confidence, #base-currency');
        settingsInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.saveTradingSettings();
            });
        });

        // Strategy checkboxes
        const strategyCheckboxes = document.querySelectorAll('input[id^="strategy-"]');
        strategyCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.saveTradingSettings();
            });
        });
    }

    // Load trading settings from backend
    async loadTradingSettings() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد شوید', 'error');
                return;
            }

            const response = await fetch('/api/trading/settings', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success && result.data) {
                this.updateUI(result.data);
                console.log('✅ Trading settings loaded:', result.data);
            } else {
                console.error('❌ Failed to load trading settings:', result.error);
            }
        } catch (error) {
            console.error('❌ Error loading trading settings:', error);
        }
    }

    // Save trading settings to backend
    async saveTradingSettings() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const settingsData = this.collectData();
            
            const response = await fetch('/api/trading/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settingsData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Trading settings saved');
            } else {
                console.error('❌ Failed to save trading settings:', result.error);
            }
        } catch (error) {
            console.error('❌ Error saving trading settings:', error);
        }
    }

    // Update UI with loaded settings
    updateUI(settings) {
        const risk = settings.riskManagement || {};
        const auto = settings.autoTrading || {};
        const strategies = auto.strategies || {};

        // Update risk management inputs
        const maxRiskInput = document.getElementById('max-risk-per-trade');
        if (maxRiskInput) maxRiskInput.value = risk.maxRiskPerTrade || 2.0;

        const maxLossInput = document.getElementById('max-daily-loss');
        if (maxLossInput) maxLossInput.value = risk.maxDailyLoss || 5.0;

        const maxPositionsInput = document.getElementById('max-positions');
        if (maxPositionsInput) maxPositionsInput.value = risk.maxPositions || 10;

        const maxAmountInput = document.getElementById('max-amount-per-trade');
        if (maxAmountInput) maxAmountInput.value = risk.maxAmountPerTrade || 1000;

        // Update auto trading settings
        const autoEnabledInput = document.getElementById('auto-trading-enabled');
        if (autoEnabledInput) autoEnabledInput.checked = auto.enabled || false;

        const analysisIntervalInput = document.getElementById('analysis-interval');
        if (analysisIntervalInput) analysisIntervalInput.value = auto.analysisInterval || 60;

        const aiConfidenceInput = document.getElementById('ai-confidence');
        if (aiConfidenceInput) aiConfidenceInput.value = auto.aiConfidence || 75;

        const baseCurrencyInput = document.getElementById('base-currency');
        if (baseCurrencyInput) baseCurrencyInput.value = auto.baseCurrency || 'USDT';

        // Update strategy checkboxes
        const momentumInput = document.getElementById('strategy-momentum');
        if (momentumInput) momentumInput.checked = strategies.momentum || false;

        const meanReversionInput = document.getElementById('strategy-mean-reversion');
        if (meanReversionInput) meanReversionInput.checked = strategies.meanReversion || false;

        const dcaInput = document.getElementById('strategy-dca');
        if (dcaInput) dcaInput.checked = strategies.dca || false;

        const gridInput = document.getElementById('strategy-grid');
        if (gridInput) gridInput.checked = strategies.grid || false;
    }

    // Action methods
    async startAutopilot() {
        if (!confirm('آیا مطمئن هستید که می‌خواهید سیستم معاملات خودکار را شروع کنید؟')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد شوید', 'error');
                return;
            }

            // Get selected strategies
            const strategies = [];
            if (document.getElementById('strategy-momentum')?.checked) strategies.push('momentum');
            if (document.getElementById('strategy-mean-reversion')?.checked) strategies.push('meanReversion');
            if (document.getElementById('strategy-dca')?.checked) strategies.push('dca');
            if (document.getElementById('strategy-grid')?.checked) strategies.push('grid');

            if (strategies.length === 0) {
                this.showNotification('لطفاً حداقل یک استراتژی انتخاب کنید', 'warning');
                return;
            }

            const response = await fetch('/api/trading/settings/autopilot/start', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    strategies: strategies,
                    riskLevel: 'medium'
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('🚀 Autopilot started:', result.data);
                this.showNotification(result.message, 'success');
                this.updateAutopilotStatus(result.data);
            } else {
                console.error('❌ Failed to start autopilot:', result.error);
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Error starting autopilot:', error);
            this.showNotification('خطا در شروع سیستم خودکار', 'error');
        }
    }

    async stopAutopilot() {
        if (!confirm('آیا مطمئن هستید که می‌خواهید معاملات خودکار را متوقف کنید؟')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد شوید', 'error');
                return;
            }

            const response = await fetch('/api/trading/settings/autopilot/stop', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                console.log('⏹️ Autopilot stopped:', result.data);
                this.showNotification(result.message, 'warning');
            } else {
                console.error('❌ Failed to stop autopilot:', result.error);
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Error stopping autopilot:', error);
            this.showNotification('خطا در توقف سیستم خودکار', 'error');
        }
    }

    async testStrategy() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد شوید', 'error');
                return;
            }

            // Get selected strategy for testing
            let strategyName = 'momentum'; // Default
            if (document.getElementById('strategy-dca')?.checked) strategyName = 'dca';
            if (document.getElementById('strategy-grid')?.checked) strategyName = 'grid';
            if (document.getElementById('strategy-mean-reversion')?.checked) strategyName = 'meanReversion';

            const response = await fetch('/api/trading/settings/strategy/test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    strategyName: strategyName,
                    testDuration: '1h',
                    testAmount: 100
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('🧪 Strategy test started:', result.data);
                this.showNotification(result.message, 'info');
            } else {
                console.error('❌ Failed to start strategy test:', result.error);
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Error testing strategy:', error);
            this.showNotification('خطا در تست استراتژی', 'error');
        }
    }

    async emergencyStop() {
        if (!confirm('⚠️ توقف اضطراری تمام معاملات؟ این عمل قابل بازگشت نیست!')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد شوید', 'error');
                return;
            }

            const response = await fetch('/api/trading/settings/emergency-stop', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                console.log('🚨 EMERGENCY STOP activated:', result.data);
                this.showNotification(result.message, 'error');
            } else {
                console.error('❌ Failed to activate emergency stop:', result.error);
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Error activating emergency stop:', error);
            this.showNotification('خطا در فعال‌سازی توقف اضطراری', 'error');
        }
    }

    async viewDetailedStats() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد شوید', 'error');
                return;
            }

            this.showNotification('در حال دریافت آمار تفصیلی...', 'info');

            const response = await fetch('/api/trading/settings/stats/detailed?timeframe=7d', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                console.log('📊 Detailed stats received:', result.data);
                this.showDetailedStatsModal(result.data);
                this.showNotification(result.message, 'success');
            } else {
                console.error('❌ Failed to get detailed stats:', result.error);
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Error getting detailed stats:', error);
            this.showNotification('خطا در دریافت آمار تفصیلی', 'error');
        }
    }

    async exportPerformance() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showNotification('لطفاً ابتدا وارد شوید', 'error');
                return;
            }

            this.showNotification('در حال تولید گزارش عملکرد...', 'info');

            const response = await fetch('/api/trading/settings/export/performance?format=json', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                console.log('📄 Performance report generated:', result.data);
                this.downloadReport(result.data);
                this.showNotification(result.message, 'success');
            } else {
                console.error('❌ Failed to export performance:', result.error);
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Error exporting performance:', error);
            this.showNotification('خطا در صادرات گزارش عملکرد', 'error');
        }
    }

    // Helper methods
    updateAutopilotStatus(data) {
        // Update UI to show autopilot is running
        // Could add a status indicator or update button text
        console.log('Autopilot status updated:', data);
    }

    showDetailedStatsModal(statsData) {
        // Create and show a modal with detailed statistics
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 max-w-4xl max-h-96 overflow-y-auto m-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">📊 آمار تفصیلی معاملات</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">📈 عملکرد کلی</h4>
                        <p>تعداد کل معاملات: ${statsData.overview.totalTrades}</p>
                        <p>نرخ موفقیت: ${statsData.overview.winRate}%</p>
                        <p>سود و زیان کل: $${statsData.overview.totalPnL}</p>
                        <p>ضریب سود: ${statsData.overview.profitFactor}</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">📊 متریک‌های ریسک</h4>
                        <p>نسبت شارپ: ${statsData.performance.sharpeRatio}</p>
                        <p>حداکثر کاهش: ${statsData.performance.maximumDrawdown}%</p>
                        <p>نوسانات: ${statsData.riskMetrics.volatility}%</p>
                        <p>همبستگی با BTC: ${statsData.riskMetrics.correlationBTC}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    downloadReport(reportData) {
        // Create and download the performance report
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `trading-performance-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        // Enhanced notification system
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        const bgColor = {
            'success': 'bg-green-600',
            'error': 'bg-red-600', 
            'warning': 'bg-yellow-600',
            'info': 'bg-blue-600'
        }[type] || 'bg-gray-600';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}