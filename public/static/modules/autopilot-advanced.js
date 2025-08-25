/**
 * Advanced Autopilot Module - Professional AI-Driven Trading System
 * Version: 4.0.0
 * Created: 2024-08-24
 * Features: Target-based trading, integrated AI systems, advanced strategies
 */

class AutopilotAdvancedModule {
    constructor() {
        this.name = 'autopilot-advanced';
        this.version = '4.0.0';
        this.config = null;
        this.targetTrade = null;
        this.strategies = [];
        this.signals = [];
        this.refreshInterval = null;
        this.websocket = null;
        
        console.log(`🚀 Advanced Autopilot Module v${this.version} initialized`);
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Professional Autopilot Header -->
            <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold mb-2">🚀 سیستم اتوپایلوت حرفه‌ای</h1>
                        <p class="text-purple-100">کنترل کامل معاملات خودکار</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <button id="emergency-stop-btn" onclick="window.autopilotAdvanced?.emergencyStop()" 
                                class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-all">
                            🛑 توقف اضطراری
                        </button>
                        <div class="text-right">
                            <div class="text-sm text-purple-100">وضعیت سیستم</div>
                            <div id="autopilot-status" class="text-lg font-bold">غیرفعال</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Performance Overview -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">کل عملکرد</p>
                            <p class="text-2xl font-bold text-green-400" id="total-performance">7</p>
                            <p class="text-xs text-gray-500">سود امروز</p>
                        </div>
                        <div class="text-3xl">📊</div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">سود امروز</p>
                            <p class="text-2xl font-bold text-green-400" id="daily-profit">$2,847</p>
                            <p class="text-xs text-gray-500">سود امروز</p>
                        </div>
                        <div class="text-3xl">💰</div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">کل معاملات</p>
                            <p class="text-2xl font-bold text-blue-400" id="total-trades">156</p>
                            <p class="text-xs text-gray-500">کل معاملات</p>
                        </div>
                        <div class="text-3xl">🔄</div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">نرخ موفقیت</p>
                            <p class="text-2xl font-bold text-green-400" id="success-rate">78.2%</p>
                            <p class="text-xs text-gray-500">نرخ موفقیت</p>
                        </div>
                        <div class="text-3xl">🎯</div>
                    </div>
                </div>
            </div>

            <!-- Main Autopilot Interface -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Active Strategies Panel (Left) -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Active Strategies -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-white">🧠 استراتژی‌های فعال</h3>
                            <div class="text-sm text-gray-400">
                                <span id="active-strategies-count">6</span> از 8 فعال
                            </div>
                        </div>
                        
                        <div id="strategies-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Strategies will be loaded here -->
                        </div>
                    </div>

                    <!-- Target-Based Trading -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-xl font-bold text-white mb-4">🎯 معاملات هدف‌مند</h3>
                        
                        <!-- Current Target Display -->
                        <div id="current-target-display" class="bg-gray-700 rounded-lg p-4 mb-4">
                            <div class="flex items-center justify-between mb-3">
                                <div>
                                    <p class="text-gray-400 text-sm">هدف فعلی</p>
                                    <p class="text-lg font-bold text-white">
                                        $<span id="current-amount">2,847</span> → $<span id="target-amount">5,000</span>
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-gray-400 text-sm">پیشرفت</p>
                                    <p class="text-lg font-bold text-green-400"><span id="target-progress">56.9</span>%</p>
                                </div>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div class="w-full bg-gray-600 rounded-full h-3 mb-3">
                                <div id="target-progress-bar" class="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300" style="width: 56.9%"></div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p class="text-gray-400">زمان تخمینی</p>
                                    <p class="text-white font-medium" id="estimated-time">18 ساعت</p>
                                </div>
                                <div>
                                    <p class="text-gray-400">استراتژی</p>
                                    <p class="text-white font-medium" id="active-strategy">Multi-Strategy AI</p>
                                </div>
                            </div>
                        </div>

                        <!-- New Target Setup -->
                        <div class="border border-gray-600 rounded-lg p-4">
                            <h4 class="font-medium text-white mb-3">🆕 تنظیم هدف جدید</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-gray-400 text-sm mb-1">مبلغ اولیه ($)</label>
                                    <input type="number" id="initial-amount" placeholder="100" min="10" 
                                           class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                                </div>
                                <div>
                                    <label class="block text-gray-400 text-sm mb-1">هدف ($)</label>
                                    <input type="number" id="target-amount-input" placeholder="5000" min="100" 
                                           class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                                </div>
                            </div>
                            <button onclick="window.autopilotAdvanced?.createTargetTrade()" 
                                    class="w-full mt-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-2 rounded font-medium transition-all">
                                🚀 شروع هدف جدید
                            </button>
                        </div>
                    </div>

                    <!-- Real-time Signals -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-xl font-bold text-white mb-4">📡 سیگنال‌های فعال</h3>
                        <div id="signals-container" class="space-y-3">
                            <!-- Signals will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Control Panel (Right) -->
                <div class="space-y-6">
                    <!-- System Control -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-4">🎮 کنترل سیستم</h3>
                        
                        <!-- Main Toggle -->
                        <div class="mb-6">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-gray-300">وضعیت اتوپایلوت</span>
                                <div class="relative">
                                    <input type="checkbox" id="autopilot-main-toggle" class="sr-only" 
                                           onchange="window.autopilotAdvanced?.toggleAutopilot()">
                                    <label for="autopilot-main-toggle" 
                                           class="flex items-center cursor-pointer">
                                        <div class="toggle-switch bg-gray-600 w-12 h-6 rounded-full relative transition-colors duration-300">
                                            <div class="toggle-dot bg-white w-5 h-5 rounded-full absolute top-0.5 right-0.5 transition-transform duration-300"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Performance Mode -->
                        <div class="mb-4">
                            <label class="block text-gray-400 text-sm mb-2">حالت عملکرد</label>
                            <select id="performance-mode" onchange="window.autopilotAdvanced?.changePerformanceMode(this.value)"
                                    class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                                <option value="conservative">محافظه‌کار (کم ریسک)</option>
                                <option value="moderate" selected>متعادل (متوسط)</option>
                                <option value="aggressive">تهاجمی (پر ریسک)</option>
                            </select>
                        </div>

                        <!-- Budget Management -->
                        <div class="mb-4">
                            <label class="block text-gray-400 text-sm mb-2">بودجه معاملات ($)</label>
                            <input type="number" id="trading-budget" value="50000" min="100" 
                                   onchange="window.autopilotAdvanced?.updateBudget(this.value)"
                                   class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                            <div class="text-xs text-gray-500 mt-1">
                                موجودی: <span id="available-balance">$50,000</span>
                            </div>
                        </div>

                        <!-- Risk Management -->
                        <div class="mb-4">
                            <label class="block text-gray-400 text-sm mb-2">سطح ریسک</label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="radio" name="risk-level" value="1" class="mr-2">
                                    <span class="text-green-400 text-sm">🟢 محافظه‌کار (1-2% ریسک)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="risk-level" value="5" checked class="mr-2">
                                    <span class="text-yellow-400 text-sm">🟡 متعادل (2-5% ریسک)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="risk-level" value="10" class="mr-2">
                                    <span class="text-red-400 text-sm">🔴 تهاجمی (5-10% ریسک)</span>
                                </label>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="space-y-2">
                            <button onclick="window.autopilotAdvanced?.pauseAutopilot()" 
                                    class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded font-medium transition-all">
                                ⏸️ توقف موقت
                            </button>
                            <button onclick="window.autopilotAdvanced?.resetAutopilot()" 
                                    class="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-medium transition-all">
                                🔄 ریست سیستم
                            </button>
                        </div>
                    </div>

                    <!-- AI Integration Status -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-4">🤖 وضعیت AI</h3>
                        
                        <div class="space-y-3 text-sm">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">آرتمیس AI</span>
                                <div class="flex items-center">
                                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span class="text-green-400">فعال</span>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">ChatGPT-4</span>
                                <div class="flex items-center">
                                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span class="text-green-400">متصل</span>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">Google Gemini</span>
                                <div class="flex items-center">
                                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span class="text-green-400">متصل</span>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">Claude 3</span>
                                <div class="flex items-center">
                                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span class="text-green-400">متصل</span>
                                </div>
                            </div>

                            <div class="border-t border-gray-600 pt-3 mt-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-300">15 AI Agents</span>
                                    <div class="flex items-center">
                                        <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        <span class="text-green-400">13 فعال</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-4">⚡ اقدامات سریع</h3>
                        
                        <div class="space-y-2 text-sm">
                            <button onclick="window.autopilotAdvanced?.viewAIDecisions()" 
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-all">
                                🧠 تصمیمات AI
                            </button>
                            <button onclick="window.autopilotAdvanced?.viewPerformanceReport()" 
                                    class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-all">
                                📊 گزارش عملکرد
                            </button>
                            <button onclick="window.autopilotAdvanced?.exportSettings()" 
                                    class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition-all">
                                💾 صادرات تنظیمات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    async init() {
        try {
            console.log('🚀 Initializing Advanced Autopilot system...');
            
            // Show loading state
            this.showLoadingState();
            
            // Initialize the advanced autopilot system
            await Promise.all([
                this.loadConfiguration(),
                this.loadStrategies(),
                this.loadCurrentTarget()
            ]);
            
            // Start real-time updates
            await this.startRealTimeUpdates();
            
            // Setup UI interactions
            this.setupEventListeners();
            
            // Hide loading state
            this.hideLoadingState();
            
            console.log('✅ Advanced Autopilot system initialized successfully');
            this.showNotification('سیستم اتوپایلوت حرفه‌ای آماده است', 'success');
            
        } catch (error) {
            console.error('❌ Error initializing autopilot system:', error);
            this.hideLoadingState();
            this.showNotification('خطا در راه‌اندازی سیستم اتوپایلوت', 'error');
        }
    }

    showLoadingState() {
        // Show loading indicators
        const loadingElements = [
            'strategies-grid',
            'signals-container',
            'current-target-display'
        ];
        
        loadingElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = `
                    <div class="flex items-center justify-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span class="mr-3 text-gray-400">در حال بارگیری...</span>
                    </div>
                `;
            }
        });
    }

    hideLoadingState() {
        // This will be handled by the individual render methods
        // when they populate the content
    }

    async loadConfiguration() {
        try {
            const response = await axios.get('/api/autopilot/config');
            if (response.data.success) {
                this.config = response.data.config;
                this.updateUI();
                this.updatePerformanceMetrics(response.data.systemStatus);
            }
        } catch (error) {
            console.error('Error loading autopilot configuration:', error);
            this.showNotification('خطا در بارگیری تنظیمات', 'error');
        }
    }

    async loadStrategies() {
        try {
            const response = await axios.get('/api/autopilot/strategies/performance');
            if (response.data.success) {
                this.strategies = response.data.strategies;
                this.renderStrategies();
                this.updateActiveStrategiesCount();
            }
        } catch (error) {
            console.error('Error loading strategies:', error);
            this.showNotification('خطا در بارگیری استراتژی‌ها', 'error');
        }
    }

    async loadCurrentTarget() {
        try {
            const response = await axios.get('/api/autopilot/target-trade');
            if (response.data.success) {
                this.targetTrade = response.data.targetTrade;
                this.updateTargetDisplay();
            }
        } catch (error) {
            console.error('Error loading target trade:', error);
        }
    }

    renderStrategies() {
        const container = document.getElementById('strategies-grid');
        if (!container) return;

        if (!this.strategies || this.strategies.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-8 text-gray-400">
                    <div class="text-3xl mb-2">🧠</div>
                    <p>در حال بارگیری استراتژی‌های AI...</p>
                    <p class="text-sm mt-1">لطفاً صبر کنید</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.strategies.map(strategy => `
            <div class="strategy-card bg-gray-700 rounded-lg p-4 border ${strategy.enabled ? 'border-green-500' : 'border-gray-600'} transition-all hover:shadow-lg">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-white truncate mr-2">${strategy.name}</h4>
                    <div class="relative flex-shrink-0">
                        <input type="checkbox" id="strategy-${strategy.id}" ${strategy.enabled ? 'checked' : ''} 
                               class="sr-only" onchange="window.autopilotAdvanced?.toggleStrategy('${strategy.id}')">
                        <label for="strategy-${strategy.id}" class="toggle-switch-small cursor-pointer block">
                            <div class="w-8 h-4 bg-gray-600 rounded-full relative transition-colors duration-200 ${strategy.enabled ? 'bg-green-500' : ''}">
                                <div class="toggle-dot-small bg-white w-3 h-3 rounded-full absolute top-0.5 transition-transform duration-200 ${strategy.enabled ? 'transform translate-x-4' : 'right-0.5'}"></div>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div class="text-center">
                        <p class="text-gray-400 mb-1">اعتماد</p>
                        <p class="text-white font-medium">${strategy.confidence.toFixed(1)}%</p>
                    </div>
                    <div class="text-center">
                        <p class="text-gray-400 mb-1">سود</p>
                        <p class="text-green-400 font-medium">+${strategy.profitPotential.toFixed(1)}%</p>
                    </div>
                    <div class="text-center">
                        <p class="text-gray-400 mb-1">ریسک</p>
                        <p class="${strategy.riskScore > 7 ? 'text-red-400' : strategy.riskScore > 4 ? 'text-yellow-400' : 'text-green-400'} font-medium">${strategy.riskScore.toFixed(1)}</p>
                    </div>
                </div>
                
                <div>
                    <div class="flex items-center justify-between text-xs mb-1">
                        <span class="text-gray-400">عملکرد</span>
                        <span class="text-blue-400">Agent ${strategy.aiAgent}</span>
                    </div>
                    <div class="w-full bg-gray-600 rounded-full h-1.5">
                        <div class="bg-gradient-to-r from-blue-400 to-green-400 h-1.5 rounded-full transition-all duration-500" 
                             style="width: ${strategy.confidence}%"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1 text-center">
                        آخرین بروزرسانی: ${this.formatTimestamp(strategy.lastUpdate || Date.now())}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateTargetDisplay() {
        if (!this.targetTrade) return;

        const elements = {
            currentAmount: document.getElementById('current-amount'),
            targetAmount: document.getElementById('target-amount'),
            targetProgress: document.getElementById('target-progress'),
            targetProgressBar: document.getElementById('target-progress-bar'),
            estimatedTime: document.getElementById('estimated-time'),
            activeStrategy: document.getElementById('active-strategy')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                switch(key) {
                    case 'currentAmount':
                        this.animateMetricUpdate(elements[key].id, this.targetTrade.currentAmount.toLocaleString());
                        break;
                    case 'targetAmount':
                        elements[key].textContent = this.targetTrade.targetAmount.toLocaleString();
                        break;
                    case 'targetProgress':
                        this.animateMetricUpdate(elements[key].id, this.targetTrade.progress.toFixed(1));
                        break;
                    case 'targetProgressBar':
                        this.animateProgressBar(this.targetTrade.progress);
                        break;
                    case 'estimatedTime':
                        elements[key].textContent = this.targetTrade.estimatedTimeToTarget;
                        break;
                    case 'activeStrategy':
                        elements[key].textContent = this.targetTrade.strategy;
                        break;
                }
            }
        });

        // Update target display visibility
        const targetDisplay = document.getElementById('current-target-display');
        if (targetDisplay) {
            targetDisplay.style.display = this.targetTrade ? 'block' : 'none';
        }
    }

    async toggleAutopilot() {
        try {
            const action = this.config?.enabled ? 'stop' : 'start';
            const response = await axios.post('/api/autopilot/toggle', { action });
            
            if (response.data.success) {
                this.config = response.data.config;
                this.updateUI();
                this.showNotification(response.data.message, 'success');
            }
        } catch (error) {
            console.error('Error toggling autopilot:', error);
            this.showNotification('خطا در تغییر وضعیت اتوپایلوت', 'error');
        }
    }

    async emergencyStop() {
        if (!confirm('آیا از توقف اضطراری اتوپایلوت اطمینان دارید؟ تمام معاملات متوقف خواهد شد.')) {
            return;
        }

        try {
            const response = await axios.post('/api/autopilot/emergency-stop');
            if (response.data.success) {
                this.config.enabled = false;
                this.config.emergencyStop = true;
                this.updateUI();
                this.showNotification(response.data.message, 'warning');
            }
        } catch (error) {
            console.error('Error in emergency stop:', error);
            this.showNotification('خطا در توقف اضطراری', 'error');
        }
    }

    async createTargetTrade() {
        const initialAmount = parseFloat(document.getElementById('initial-amount').value);
        const targetAmount = parseFloat(document.getElementById('target-amount-input').value);

        if (!initialAmount || !targetAmount || targetAmount <= initialAmount) {
            this.showNotification('لطفاً مقادیر صحیح وارد کنید', 'error');
            return;
        }

        try {
            const response = await axios.post('/api/autopilot/target-trade', {
                initialAmount,
                targetAmount,
                strategy: 'Multi-Strategy AI'
            });

            if (response.data.success) {
                this.targetTrade = response.data.targetTrade;
                this.updateTargetDisplay();
                this.showNotification(response.data.message, 'success');
                
                // Clear inputs
                document.getElementById('initial-amount').value = '';
                document.getElementById('target-amount-input').value = '';
            }
        } catch (error) {
            console.error('Error creating target trade:', error);
            this.showNotification('خطا در ایجاد هدف جدید', 'error');
        }
    }

    async toggleStrategy(strategyId) {
        try {
            const response = await axios.post(`/api/autopilot/strategies/${strategyId}/toggle`);
            if (response.data.success) {
                // Update local strategy state
                const strategy = this.strategies.find(s => s.id === strategyId);
                if (strategy) {
                    strategy.enabled = response.data.strategy.enabled;
                    
                    // Update the strategy card UI
                    const strategyCard = document.querySelector(`#strategy-${strategyId}`).closest('.strategy-card');
                    if (strategyCard) {
                        strategyCard.className = `strategy-card bg-gray-700 rounded-lg p-4 border ${
                            strategy.enabled ? 'border-green-500' : 'border-gray-600'
                        }`;
                    }
                    
                    // Update toggle switch
                    const toggle = document.getElementById(`strategy-${strategyId}`);
                    if (toggle) {
                        toggle.checked = strategy.enabled;
                    }
                }
                
                this.updateActiveStrategiesCount();
                this.showNotification(response.data.message, 'success');
            }
        } catch (error) {
            console.error('Error toggling strategy:', error);
            this.showNotification('خطا در تغییر وضعیت استراتژی', 'error');
            
            // Revert toggle switch if error occurred
            const toggle = document.getElementById(`strategy-${strategyId}`);
            if (toggle) {
                toggle.checked = !toggle.checked;
            }
        }
    }

    async startRealTimeUpdates() {
        // Update all real-time data every 5 seconds
        this.refreshInterval = setInterval(async () => {
            await Promise.all([
                this.loadSignals(),
                this.loadCurrentTarget(),
                this.loadAIStatus(),
                this.loadPerformanceMetrics()
            ]);
        }, 5000);

        // Load initial data
        await Promise.all([
            this.loadSignals(),
            this.loadAIStatus(),
            this.loadPerformanceMetrics()
        ]);
    }

    async loadSignals() {
        try {
            const response = await axios.get('/api/autopilot/signals');
            if (response.data.success) {
                this.signals = response.data.signals;
                this.renderSignals();
            }
        } catch (error) {
            console.error('Error loading signals:', error);
        }
    }

    renderSignals() {
        const container = document.getElementById('signals-container');
        if (!container) return;

        if (!this.signals || this.signals.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <div class="text-3xl mb-2">📡</div>
                    <p>در انتظار سیگنال‌های جدید...</p>
                    <p class="text-sm mt-1">سیستم AI در حال تحلیل بازار است</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.signals.map(signal => `
            <div class="signal-item bg-gray-700 rounded-lg p-3 border-l-4 ${this.getSignalBorderColor(signal.action)} hover:bg-gray-600 transition-colors">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="font-medium text-white">${signal.pair}</span>
                        <span class="text-xs px-2 py-1 rounded ${this.getActionBadgeColor(signal.action)}">
                            ${this.getActionText(signal.action)}
                        </span>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-400">${signal.aiProvider}</p>
                        <p class="text-sm font-medium text-white">${signal.confidence}%</p>
                    </div>
                </div>
                <p class="text-xs text-gray-400 mb-2">${signal.reasoning}</p>
                <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-400">${signal.strategy}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-green-400">+${signal.expectedProfit}%</span>
                        <span class="text-gray-500">${this.formatTimestamp(signal.timestamp)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatTimestamp(timestamp) {
        const now = new Date();
        const signalTime = new Date(timestamp);
        const diffSeconds = Math.floor((now - signalTime) / 1000);
        
        if (diffSeconds < 60) return `${diffSeconds}ث پیش`;
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}د پیش`;
        return `${Math.floor(diffSeconds / 3600)}س پیش`;
    }

    getSignalBorderColor(action) {
        switch(action) {
            case 'BUY': return 'border-green-400';
            case 'SELL': return 'border-red-400';
            case 'HOLD': return 'border-yellow-400';
            default: return 'border-gray-400';
        }
    }

    getActionBadgeColor(action) {
        switch(action) {
            case 'BUY': return 'bg-green-600 text-white';
            case 'SELL': return 'bg-red-600 text-white';
            case 'HOLD': return 'bg-yellow-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    }

    getActionText(action) {
        switch(action) {
            case 'BUY': return 'خرید';
            case 'SELL': return 'فروش';
            case 'HOLD': return 'نگهداری';
            default: return action;
        }
    }

    updateUI() {
        if (!this.config) return;

        // Update status displays
        const statusEl = document.getElementById('autopilot-status');
        if (statusEl) {
            statusEl.textContent = this.config.enabled ? 'فعال' : 'غیرفعال';
            statusEl.className = this.config.enabled ? 'text-lg font-bold text-green-400' : 'text-lg font-bold text-red-400';
        }

        // Update toggle switch
        const toggle = document.getElementById('autopilot-main-toggle');
        if (toggle) {
            toggle.checked = this.config.enabled;
        }

        // Update performance mode
        const performanceMode = document.getElementById('performance-mode');
        if (performanceMode) {
            performanceMode.value = this.config.mode;
        }

        // Update budget
        const budget = document.getElementById('trading-budget');
        if (budget) {
            budget.value = this.config.budget;
        }
    }

    setupEventListeners() {
        // Setup toggle switch styling
        const style = document.createElement('style');
        style.textContent = `
            .toggle-switch input:checked + label .toggle-switch {
                background-color: #10b981;
            }
            .toggle-switch input:checked + label .toggle-dot {
                transform: translateX(24px);
            }
            .toggle-switch-small input:checked + div {
                background-color: #10b981;
            }
            .toggle-switch-small input:checked + div .toggle-dot-small {
                transform: translateX(16px);
            }
            .strategy-card {
                transition: all 0.3s ease;
            }
            .strategy-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);

        // Setup risk level change listener
        document.addEventListener('change', (e) => {
            if (e.target.name === 'risk-level') {
                this.updateRiskLevel(e.target.value);
            }
        });
    }

    async updateRiskLevel(level) {
        try {
            const response = await axios.post('/api/autopilot/config', { 
                riskLevel: parseInt(level) 
            });
            if (response.data.success) {
                this.config = response.data.config;
                const riskNames = {
                    '1': 'محافظه‌کار',
                    '5': 'متعادل', 
                    '10': 'تهاجمی'
                };
                this.showNotification(`سطح ریسک به ${riskNames[level]} تغییر کرد`, 'success');
            }
        } catch (error) {
            console.error('Error updating risk level:', error);
            this.showNotification('خطا در تغییر سطح ریسک', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
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

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Enhanced real-time update methods
    async loadPerformanceMetrics() {
        try {
            const response = await axios.get('/api/autopilot/performance');
            if (response.data.success) {
                this.updatePerformanceMetrics(response.data.metrics);
            }
        } catch (error) {
            console.error('Error loading performance metrics:', error);
        }
    }

    async loadAIStatus() {
        try {
            const response = await axios.get('/api/autopilot/ai-status');
            if (response.data.success) {
                this.updateAIStatus(response.data.aiStatus);
            }
        } catch (error) {
            console.error('Error loading AI status:', error);
        }
    }

    updatePerformanceMetrics(metrics) {
        if (!metrics) return;

        // Update performance cards
        const elements = {
            'total-performance': metrics.totalPerformance || '0',
            'daily-profit': `$${(metrics.dailyProfit || 0).toLocaleString()}`,
            'total-trades': metrics.totalTrades || '0',
            'success-rate': `${(metrics.successRate || 0).toFixed(1)}%`
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
                // Add animation effect
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 150);
            }
        });

        // Update balance
        const balanceEl = document.getElementById('available-balance');
        if (balanceEl && metrics.availableBalance) {
            balanceEl.textContent = `$${metrics.availableBalance.toLocaleString()}`;
        }
    }

    updateAIStatus(aiStatus) {
        if (!aiStatus) return;

        // This would update the AI status indicators in the UI
        // For now, we'll just log it
        console.log('AI Status updated:', aiStatus);
    }

    updateActiveStrategiesCount() {
        const activeCount = this.strategies.filter(s => s.enabled).length;
        const totalCount = this.strategies.length;
        const countEl = document.getElementById('active-strategies-count');
        if (countEl) {
            countEl.textContent = activeCount;
            countEl.parentNode.innerHTML = `<span id="active-strategies-count">${activeCount}</span> از ${totalCount} فعال`;
        }
    }

    async changePerformanceMode(mode) {
        try {
            const response = await axios.post('/api/autopilot/config', { mode });
            if (response.data.success) {
                this.config = response.data.config;
                this.showNotification(`حالت عملکرد به ${this.getModeName(mode)} تغییر کرد`, 'success');
            }
        } catch (error) {
            console.error('Error changing performance mode:', error);
            this.showNotification('خطا در تغییر حالت عملکرد', 'error');
        }
    }

    getModeName(mode) {
        const modeNames = {
            'conservative': 'محافظه‌کار',
            'moderate': 'متعادل',
            'aggressive': 'تهاجمی'
        };
        return modeNames[mode] || mode;
    }

    async updateBudget(budget) {
        try {
            const response = await axios.post('/api/autopilot/config', { budget: parseFloat(budget) });
            if (response.data.success) {
                this.config = response.data.config;
                this.showNotification('بودجه بروزرسانی شد', 'success');
            }
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    }

    async pauseAutopilot() {
        await this.toggleAutopilot();
    }

    async resetAutopilot() {
        if (!confirm('آیا از بازنشانی تنظیمات اتوپایلوت اطمینان دارید؟')) return;

        try {
            const response = await axios.post('/api/autopilot/reset');
            if (response.data.success) {
                this.config = response.data.config;
                this.targetTrade = null;
                this.strategies = [];
                this.signals = [];
                this.updateUI();
                this.showNotification(response.data.message, 'success');
                
                // Reload all data after reset
                await this.loadConfiguration();
                await this.loadStrategies();
                await this.loadCurrentTarget();
            }
        } catch (error) {
            console.error('Error resetting autopilot:', error);
            this.showNotification('خطا در بازنشانی اتوپایلوت', 'error');
        }
    }

    async viewAIDecisions() {
        try {
            const response = await axios.get('/api/autopilot/ai-decisions');
            if (response.data.success) {
                this.showAIDecisionsModal(response.data.decisions);
            }
        } catch (error) {
            console.error('Error loading AI decisions:', error);
            this.showNotification('خطا در بارگیری تصمیمات AI', 'error');
        }
    }

    showAIDecisionsModal(decisions) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-96 overflow-y-auto m-4 w-full">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">🧠 تصمیمات AI اخیر</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    ${decisions.map(decision => `
                        <div class="bg-gray-700 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium text-white">${decision.pair}</span>
                                    <span class="px-2 py-1 rounded text-xs ${
                                        decision.action === 'BUY' ? 'bg-green-600' :
                                        decision.action === 'SELL' ? 'bg-red-600' : 'bg-yellow-600'
                                    } text-white">
                                        ${this.getActionText(decision.action)}
                                    </span>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs text-gray-400">${decision.aiProvider}</p>
                                    <p class="text-sm font-medium text-white">${decision.confidence}%</p>
                                </div>
                            </div>
                            <p class="text-sm text-gray-300 mb-2">${decision.reasoning}</p>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-gray-400">${new Date(decision.timestamp).toLocaleString('fa-IR')}</span>
                                <span class="text-green-400">سود پیش‌بینی: +${decision.expectedProfit}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async viewPerformanceReport() {
        try {
            const response = await axios.get('/api/autopilot/performance/detailed');
            if (response.data.success) {
                this.showPerformanceReportModal(response.data.report);
            }
        } catch (error) {
            console.error('Error loading performance report:', error);
            this.showNotification('خطا در بارگیری گزارش عملکرد', 'error');
        }
    }

    showPerformanceReportModal(report) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-96 overflow-y-auto m-4 w-full">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">📊 گزارش تفصیلی عملکرد</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h4 class="font-medium text-white mb-2">📈 عملکرد کلی</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">کل سود:</span>
                                <span class="text-green-400">$${(report.totalProfit || 0).toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">نرخ موفقیت:</span>
                                <span class="text-white">${(report.successRate || 0).toFixed(1)}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">معاملات موفق:</span>
                                <span class="text-white">${report.successfulTrades || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h4 class="font-medium text-white mb-2">🎯 بهترین استراتژی‌ها</h4>
                        <div class="space-y-2 text-sm">
                            ${(report.topStrategies || []).map(strategy => `
                                <div class="flex justify-between">
                                    <span class="text-gray-400">${strategy.name}:</span>
                                    <span class="text-green-400">+${strategy.profit.toFixed(1)}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="bg-gray-700 rounded-lg p-4">
                    <h4 class="font-medium text-white mb-2">📋 معاملات اخیر</h4>
                    <div class="space-y-2">
                        ${(report.recentTrades || []).map(trade => `
                            <div class="flex items-center justify-between bg-gray-600 rounded p-2 text-sm">
                                <div class="flex items-center gap-2">
                                    <span class="text-white">${trade.pair}</span>
                                    <span class="px-2 py-1 rounded text-xs ${
                                        trade.result === 'profit' ? 'bg-green-600' : 'bg-red-600'
                                    } text-white">
                                        ${trade.result === 'profit' ? 'سود' : 'ضرر'}
                                    </span>
                                </div>
                                <div class="text-right">
                                    <span class="${
                                        trade.result === 'profit' ? 'text-green-400' : 'text-red-400'
                                    }">$${trade.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    exportSettings() {
        if (this.config) {
            const exportData = {
                config: this.config,
                strategies: this.strategies,
                exportDate: new Date().toISOString(),
                version: this.version
            };
            const data = JSON.stringify(exportData, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `autopilot-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('تنظیمات کامل صادر شد', 'success');
        }
    }

    // AI Provider Testing Methods
    async testAIProvider(provider) {
        try {
            this.showNotification(`در حال تست ${provider}...`, 'info');
            const response = await axios.post('/api/autopilot/test-ai-provider', { provider });
            
            if (response.data.success) {
                this.showNotification(`${provider} با موفقیت متصل شد`, 'success');
                return true;
            } else {
                this.showNotification(`خطا در اتصال به ${provider}: ${response.data.error}`, 'error');
                return false;
            }
        } catch (error) {
            console.error(`Error testing ${provider}:`, error);
            this.showNotification(`خطا در تست ${provider}`, 'error');
            return false;
        }
    }

    async testAllAIProviders() {
        const providers = ['ChatGPT-4', 'Google Gemini', 'Claude 3'];
        const results = {};
        
        this.showNotification('در حال تست تمام ارائه‌دهندگان AI...', 'info');
        
        for (const provider of providers) {
            results[provider] = await this.testAIProvider(provider);
            // Add small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const successCount = Object.values(results).filter(Boolean).length;
        this.showNotification(`تست کامل شد: ${successCount}/${providers.length} ارائه‌دهنده متصل`, 
                            successCount === providers.length ? 'success' : 'warning');
        
        return results;
    }

    // System Validation Methods
    async validateSystem() {
        try {
            const response = await axios.get('/api/autopilot/system/validate');
            if (response.data.success) {
                this.showSystemValidationModal(response.data.validation);
            }
        } catch (error) {
            console.error('Error validating system:', error);
            this.showNotification('خطا در اعتبارسنجی سیستم', 'error');
        }
    }

    showSystemValidationModal(validation) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl m-4 w-full">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">🔍 اعتبارسنجی سیستم</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    ${validation.checks.map(check => `
                        <div class="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                            <div class="flex items-center gap-3">
                                <div class="w-4 h-4 rounded-full ${
                                    check.status === 'pass' ? 'bg-green-500' :
                                    check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                }"></div>
                                <span class="text-white">${check.name}</span>
                            </div>
                            <div class="text-right">
                                <span class="${
                                    check.status === 'pass' ? 'text-green-400' :
                                    check.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                                }">${check.message}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-6 flex justify-center">
                    <div class="text-center">
                        <div class="text-2xl mb-2">
                            ${validation.overall === 'healthy' ? '✅' : 
                              validation.overall === 'warning' ? '⚠️' : '❌'}
                        </div>
                        <p class="text-lg font-medium ${
                            validation.overall === 'healthy' ? 'text-green-400' :
                            validation.overall === 'warning' ? 'text-yellow-400' : 'text-red-400'
                        }">${validation.summary}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Advanced Strategy Management
    async enableAllStrategies() {
        try {
            const response = await axios.post('/api/autopilot/strategies/enable-all');
            if (response.data.success) {
                this.strategies = this.strategies.map(s => ({ ...s, enabled: true }));
                this.renderStrategies();
                this.updateActiveStrategiesCount();
                this.showNotification('تمام استراتژی‌ها فعال شدند', 'success');
            }
        } catch (error) {
            console.error('Error enabling all strategies:', error);
            this.showNotification('خطا در فعال‌سازی استراتژی‌ها', 'error');
        }
    }

    async disableAllStrategies() {
        try {
            const response = await axios.post('/api/autopilot/strategies/disable-all');
            if (response.data.success) {
                this.strategies = this.strategies.map(s => ({ ...s, enabled: false }));
                this.renderStrategies();
                this.updateActiveStrategiesCount();
                this.showNotification('تمام استراتژی‌ها غیرفعال شدند', 'warning');
            }
        } catch (error) {
            console.error('Error disabling all strategies:', error);
            this.showNotification('خطا در غیرفعال‌سازی استراتژی‌ها', 'error');
        }
    }

    // Enhanced UI Animation Methods
    animateMetricUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.1)';
        element.style.color = '#10b981';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 150);
    }

    // Progress Animation for Target Trading
    animateProgressBar(progress) {
        const progressBar = document.getElementById('target-progress-bar');
        if (!progressBar) return;

        let currentWidth = parseFloat(progressBar.style.width) || 0;
        const targetWidth = Math.min(progress, 100);
        
        const animate = () => {
            if (Math.abs(currentWidth - targetWidth) < 0.1) {
                progressBar.style.width = `${targetWidth}%`;
                return;
            }
            
            currentWidth += (targetWidth - currentWidth) * 0.1;
            progressBar.style.width = `${currentWidth}%`;
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.websocket) {
            this.websocket.close();
        }
    }
}

// Register the module globally
if (typeof window !== 'undefined') {
    window.AutopilotAdvancedModule = AutopilotAdvancedModule;
    
    // Auto-initialize if element exists
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('autopilot-advanced-container')) {
            window.autopilotAdvanced = new AutopilotAdvancedModule();
            window.autopilotAdvanced.init();
        }
    });
}

// Module exports for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutopilotAdvancedModule;
}