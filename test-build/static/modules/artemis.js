/**
 * Artemis AI Module - Advanced Artificial Intelligence System
 * Modular Architecture Phase 4
 * Created: 2024-08-23
 * Features: Multi-agent AI system, predictions, market analysis, AI chat
 */

class ArtemisModule {
    constructor() {
        this.name = 'artemis';
        this.version = '4.0.0';
        this.aiAgents = [];
        this.predictions = [];
        this.chatHistory = [];
        this.marketInsights = [];
        this.aiModels = {
            marketAnalyzer: { status: 'active', confidence: 0, lastUpdate: null },
            pricePredictor: { status: 'active', confidence: 0, lastUpdate: null },
            riskManager: { status: 'active', confidence: 0, lastUpdate: null },
            signalGenerator: { status: 'active', confidence: 0, lastUpdate: null },
            newsAnalyzer: { status: 'active', confidence: 0, lastUpdate: null }
        };
        this.refreshInterval = null;
        this.isLearning = false;
        this.conversationId = null;
        
        console.log(`🤖 Artemis AI Module v${this.version} initialized`);
    }

    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Artemis AI Header -->
            <div class="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-xl p-8 border border-purple-500/30">
                <div class="flex flex-col lg:flex-row items-center justify-between">
                    <div class="flex items-center mb-6 lg:mb-0">
                        <div class="text-8xl mr-6 animate-pulse">🧠</div>
                        <div>
                            <h1 class="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                آرتمیس AI
                            </h1>
                            <p class="text-xl text-purple-200 mb-2">سیستم هوش مصنوعی پیشرفته معاملاتی</p>
                            <div class="flex items-center space-x-4 space-x-reverse text-sm">
                                <div class="flex items-center">
                                    <div id="ai-status-indicator" class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <span class="text-green-300 mr-2">آنلاین</span>
                                </div>
                                <div class="text-blue-300">
                                    آخرین تحلیل: <span id="last-ai-update">--</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- AI Performance Stats -->
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div class="bg-purple-800/40 rounded-lg p-3">
                            <div class="text-2xl font-bold text-purple-300" id="ai-accuracy">94.2%</div>
                            <div class="text-xs text-purple-200">دقت پیش‌بینی</div>
                        </div>
                        <div class="bg-blue-800/40 rounded-lg p-3">
                            <div class="text-2xl font-bold text-blue-300" id="ai-predictions">1,247</div>
                            <div class="text-xs text-blue-200">پیش‌بینی‌ها</div>
                        </div>
                        <div class="bg-green-800/40 rounded-lg p-3">
                            <div class="text-2xl font-bold text-green-300" id="ai-profit">+28.5%</div>
                            <div class="text-xs text-green-200">سود AI</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Agent Management -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- AI Agents Status -->
                <div class="bg-gray-800 rounded-xl border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-white flex items-center">
                                <i class="fas fa-users text-purple-400 mr-3"></i>
                                عامل‌های هوش مصنوعی
                            </h3>
                            <div class="flex items-center gap-2">
                                <button onclick="window.artemisModule?.startLearning()" 
                                        id="learning-toggle"
                                        class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-brain mr-1"></i> شروع یادگیری
                                </button>
                                <button onclick="window.artemisModule?.refreshAgents()" 
                                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-sync-alt mr-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="p-6">
                        <div id="ai-agents-grid" class="space-y-3">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>

                <!-- AI Chat Assistant -->
                <div class="bg-gray-800 rounded-xl border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white flex items-center">
                            <i class="fas fa-comments text-green-400 mr-3"></i>
                            دستیار هوشمند آرتمیس
                        </h3>
                    </div>
                    <div class="p-6">
                        <!-- Chat Messages -->
                        <div id="ai-chat-messages" class="bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-3">
                            <div class="flex items-start">
                                <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm mr-3">
                                    🤖
                                </div>
                                <div class="bg-purple-900/50 rounded-lg p-3 max-w-xs">
                                    <p class="text-purple-100 text-sm">سلام! من آرتمیس هستم، دستیار هوشمند معاملاتی شما. چطور می‌توانم کمکتان کنم؟</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Chat Input -->
                        <div class="flex gap-2">
                            <input type="text" id="ai-chat-input" placeholder="سوال خود را بپرسید..." 
                                   onkeypress="if(event.key==='Enter') window.artemisModule?.sendMessage()"
                                   class="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                            <button onclick="window.artemisModule?.sendMessage()" 
                                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        
                        <!-- Quick Questions -->
                        <div class="flex flex-wrap gap-2 mt-3">
                            <button onclick="window.artemisModule?.askQuickQuestion('تحلیل BTC')" 
                                    class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                                تحلیل BTC
                            </button>
                            <button onclick="window.artemisModule?.askQuickQuestion('پیش‌بینی بازار')" 
                                    class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                                پیش‌بینی بازار
                            </button>
                            <button onclick="window.artemisModule?.askQuickQuestion('بهترین سیگنال')" 
                                    class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                                بهترین سیگنال
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Predictions & Analysis -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Market Predictions -->
                <div class="bg-gray-800 rounded-xl border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white flex items-center">
                            <i class="fas fa-crystal-ball text-blue-400 mr-3"></i>
                            پیش‌بینی‌های بازار
                        </h3>
                    </div>
                    <div class="p-6">
                        <div class="space-y-4">
                            <!-- Prediction Controls -->
                            <div class="flex gap-2">
                                <select id="prediction-symbol" onchange="window.artemisModule?.updatePredictions()"
                                        class="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                                    <option value="BTC">Bitcoin</option>
                                    <option value="ETH">Ethereum</option>
                                    <option value="ADA">Cardano</option>
                                    <option value="DOT">Polkadot</option>
                                </select>
                                <select id="prediction-timeframe" onchange="window.artemisModule?.updatePredictions()"
                                        class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                                    <option value="1h">1 ساعت</option>
                                    <option value="4h">4 ساعت</option>
                                    <option value="1d">1 روز</option>
                                    <option value="1w">1 هفته</option>
                                </select>
                            </div>
                            
                            <!-- Predictions List -->
                            <div id="ai-predictions-list" class="space-y-3">
                                <!-- Will be populated -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Insights -->
                <div class="bg-gray-800 rounded-xl border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white flex items-center">
                            <i class="fas fa-lightbulb text-yellow-400 mr-3"></i>
                            بینش‌های هوشمند
                        </h3>
                    </div>
                    <div class="p-6">
                        <div id="ai-insights-list" class="space-y-3">
                            <!-- Will be populated -->
                        </div>
                        
                        <button onclick="window.artemisModule?.generateInsights()" 
                                class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded text-sm mt-4">
                            <i class="fas fa-magic mr-2"></i>
                            تولید بینش جدید
                        </button>
                    </div>
                </div>

                <!-- AI Trading Signals -->
                <div class="bg-gray-800 rounded-xl border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white flex items-center">
                            <i class="fas fa-signal text-green-400 mr-3"></i>
                            سیگنال‌های AI
                        </h3>
                    </div>
                    <div class="p-6">
                        <div id="ai-signals-list" class="space-y-3">
                            <!-- Will be populated -->
                        </div>
                        
                        <button onclick="window.artemisModule?.refreshSignals()" 
                                class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm mt-4">
                            <i class="fas fa-refresh mr-2"></i>
                            بروزرسانی سیگنال‌ها
                        </button>
                    </div>
                </div>
            </div>

            <!-- Advanced AI Analytics -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- AI Performance Chart -->
                <div class="bg-gray-800 rounded-xl border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-white">نمودار عملکرد AI</h3>
                            <select id="ai-chart-metric" onchange="window.artemisModule?.updateAIChart()"
                                    class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                                <option value="accuracy">دقت پیش‌بینی</option>
                                <option value="profit">سود حاصله</option>
                                <option value="confidence">اطمینان</option>
                                <option value="activity">فعالیت</option>
                            </select>
                        </div>
                    </div>
                    <div class="p-6">
                        <canvas id="ai-performance-chart" class="w-full" height="250"></canvas>
                    </div>
                </div>

                <!-- AI Learning Progress -->
                <div class="bg-gray-800 rounded-xl border border-gray-700">
                    <div class="px-6 py-4 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white">پیشرفت یادگیری</h3>
                    </div>
                    <div class="p-6">
                        <!-- Learning Metrics -->
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="text-gray-400">مدل تحلیل بازار</span>
                                    <span id="market-learning" class="text-blue-400">87%</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: 87%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="text-gray-400">پیش‌بینی قیمت</span>
                                    <span id="price-learning" class="text-green-400">92%</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-green-600 h-2 rounded-full" style="width: 92%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="text-gray-400">مدیریت ریسک</span>
                                    <span id="risk-learning" class="text-yellow-400">79%</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-yellow-600 h-2 rounded-full" style="width: 79%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="text-gray-400">تحلیل احساسات</span>
                                    <span id="sentiment-learning" class="text-purple-400">84%</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-purple-600 h-2 rounded-full" style="width: 84%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Learning Controls -->
                        <div class="mt-6 pt-4 border-t border-gray-700">
                            <div class="flex gap-2">
                                <button onclick="window.artemisModule?.startTraining()" 
                                        class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm">
                                    <i class="fas fa-play mr-1"></i>
                                    شروع آموزش
                                </button>
                                <button onclick="window.artemisModule?.pauseTraining()" 
                                        class="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm">
                                    <i class="fas fa-pause mr-1"></i>
                                    مکث
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Configuration & Settings -->
            <div class="bg-gray-800 rounded-xl border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-cogs text-gray-400 mr-3"></i>
                        تنظیمات پیشرفته AI
                    </h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- AI Sensitivity -->
                        <div>
                            <label class="text-sm text-gray-400 mb-2 block">حساسیت AI</label>
                            <input type="range" id="ai-sensitivity" min="1" max="10" value="7" 
                                   onchange="window.artemisModule?.updateSettings()"
                                   class="w-full">
                            <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>محافظه‌کار</span>
                                <span id="sensitivity-value">7</span>
                                <span>تهاجمی</span>
                            </div>
                        </div>
                        
                        <!-- Confidence Threshold -->
                        <div>
                            <label class="text-sm text-gray-400 mb-2 block">آستانه اطمینان</label>
                            <input type="range" id="confidence-threshold" min="50" max="95" value="75"
                                   onchange="window.artemisModule?.updateSettings()"
                                   class="w-full">
                            <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>50%</span>
                                <span id="confidence-value">75%</span>
                                <span>95%</span>
                            </div>
                        </div>
                        
                        <!-- Learning Rate -->
                        <div>
                            <label class="text-sm text-gray-400 mb-2 block">نرخ یادگیری</label>
                            <input type="range" id="learning-rate" min="1" max="10" value="5"
                                   onchange="window.artemisModule?.updateSettings()"
                                   class="w-full">
                            <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>آهسته</span>
                                <span id="learning-value">5</span>
                                <span>سریع</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- AI Actions -->
                    <div class="mt-6 pt-6 border-t border-gray-700">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button onclick="window.artemisModule?.exportAIData()" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm">
                                <i class="fas fa-download mr-2"></i>
                                خروجی داده‌ها
                            </button>
                            <button onclick="window.artemisModule?.resetAI()" 
                                    class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm">
                                <i class="fas fa-redo mr-2"></i>
                                ریست AI
                            </button>
                            <button onclick="window.artemisModule?.optimizeModels()" 
                                    class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm">
                                <i class="fas fa-magic mr-2"></i>
                                بهینه‌سازی
                            </button>
                            <button onclick="window.artemisModule?.backupAI()" 
                                    class="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm">
                                <i class="fas fa-save mr-2"></i>
                                پشتیبان‌گیری
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async initialize() {
        console.log('🤖 Initializing Artemis AI Module...');
        
        try {
            // Set global reference
            window.artemisModule = this;
            
            // Initialize AI agents
            await this.initializeAIAgents();
            
            // Load initial predictions
            await this.loadAIPredictions();
            
            // Generate market insights
            await this.generateInsights();
            
            // Load AI signals
            await this.loadAISignals();
            
            // Initialize AI chat
            this.initializeAIChat();
            
            // Setup AI performance chart
            await this.initializeAIChart();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            // Setup settings sliders
            this.setupSettingsSliders();
            
            // Load initial AI data
            await this.loadAIData();
            
            console.log('✅ Artemis AI Module initialized successfully');
        } catch (error) {
            console.error('❌ Artemis AI Module initialization error:', error);
        }
    }

    async initializeAIAgents() {
        try {
            // Load real AI agents from API
            const response = await fetch('/api/artemis/agents', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });

            const data = await response.json();
            
            if (data.success && data.data) {
                // Map API data to frontend format
                this.aiAgents = data.data.map(agent => ({
                    id: agent.id,
                    name: agent.name,
                    role: agent.specialty,
                    status: agent.status,
                    confidence: agent.confidence,
                    accuracy: agent.accuracy,
                    lastActivity: Date.now() - Math.random() * 3600000, // Mock last activity
                    icon: agent.icon || '🤖',
                    color: this.getAgentColor(agent.id),
                    speciality: agent.specialty,
                    current_task: agent.current_task,
                    trades_executed: agent.trades_executed
                }));
            } else {
                throw new Error(data.error || 'خطا در دریافت اطلاعات ایجنت‌ها');
            }
            
        } catch (error) {
            console.error('AI Agents API Error:', error);
            
            // Fallback to mock data
            this.aiAgents = [
                {
                    id: 'market_analyzer',
                    name: 'تحلیلگر بازار',
                    role: 'Market Analysis',
                    status: 'active',
                    confidence: 88,
                    icon: '📊',
                    color: 'blue',
                    speciality: 'تحلیل تکنیکال و بنیادی'
                }
            ];
        }
        await this.renderAIAgents();
    }

    getAgentColor(agentId) {
        const colors = {
            'market_analyzer': 'blue',
            'price_predictor': 'purple', 
            'risk_manager': 'green',
            'signal_generator': 'yellow',
            'news_analyzer': 'orange',
            '1': 'blue',
            '2': 'purple',
            '3': 'green',
            '4': 'yellow',
            '5': 'orange'
        };
        return colors[agentId] || 'gray';
    }

    async renderAIAgents() {
        const agentsGrid = document.getElementById('ai-agents-grid');
        if (!agentsGrid) return;

        agentsGrid.innerHTML = this.aiAgents.map(agent => {
            const timeSinceActivity = Date.now() - agent.lastActivity;
            const timeAgo = this.formatTimeAgo(timeSinceActivity);
            const confidenceClass = agent.confidence >= 90 ? 'text-green-400' : 
                                   agent.confidence >= 75 ? 'text-yellow-400' : 'text-red-400';

            return `
                <div class="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-${agent.color}-500 transition-all">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                            <span class="text-2xl mr-3">${agent.icon}</span>
                            <div>
                                <h4 class="text-white font-medium text-sm">${agent.name}</h4>
                                <p class="text-gray-400 text-xs">${agent.speciality}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="flex items-center mb-1">
                                <div class="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                <span class="text-green-300 text-xs">${agent.status}</span>
                            </div>
                            <div class="${confidenceClass} text-xs font-medium">
                                ${agent.confidence.toFixed(1)}% اطمینان
                            </div>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">
                        آخرین فعالیت: ${timeAgo}
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadAIPredictions() {
        try {
            const symbol = document.getElementById('prediction-symbol')?.value || 'BTC';
            const timeframe = document.getElementById('prediction-timeframe')?.value || '4h';
            
            const response = await fetch(`/api/artemis/predictions?symbol=${symbol}&timeframe=${timeframe}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.predictions = data.data;
                await this.renderPredictions();
            } else {
                throw new Error(data.error || 'خطا در دریافت پیش‌بینی‌ها');
            }
            
        } catch (error) {
            console.error('Predictions API Error:', error);
            
            // Fallback to mock data
            const predictions = [
                {
                    id: 'pred_1',
                    symbol: 'BTC',
                    timeframe: '4h',
                    prediction: 'صعودی',
                    targetPrice: 47500,
                    confidence: 87,
                    reasoning: 'الگوی مثلث صعودی و شکست مقاومت کلیدی',
                    timestamp: Date.now(),
                    accuracy: 'متوسط'
                },
                {
                    id: 'pred_2', 
                    symbol: 'ETH',
                    timeframe: '1d',
                    prediction: 'نزولی',
                    targetPrice: 3100,
                    confidence: 73,
                    reasoning: 'واگرایی منفی RSI و کاهش حجم معاملات',
                    timestamp: Date.now() - 1800000,
                    accuracy: 'بالا'
                }
            ];

            this.predictions = predictions;
            await this.renderPredictions();
            
            this.showNotification('خطا در دریافت پیش‌بینی‌ها از سرور. از داده‌های محلی استفاده شد.', 'warning');
        }
    }

    async renderPredictions() {
        const predictionsList = document.getElementById('ai-predictions-list');
        if (!predictionsList) return;

        predictionsList.innerHTML = this.predictions.map(pred => {
            const predictionClass = {
                'صعودی': 'text-green-400 bg-green-900/20',
                'نزولی': 'text-red-400 bg-red-900/20',
                'خنثی': 'text-gray-400 bg-gray-900/20'
            }[pred.prediction];

            const confidenceColor = pred.confidence >= 80 ? 'text-green-400' :
                                   pred.confidence >= 60 ? 'text-yellow-400' : 'text-red-400';

            return `
                <div class="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <span class="font-medium text-white">${pred.symbol}</span>
                            <span class="text-gray-400 text-xs mr-2">${pred.timeframe}</span>
                        </div>
                        <span class="${predictionClass} px-2 py-1 rounded text-xs font-medium">
                            ${pred.prediction}
                        </span>
                    </div>
                    <div class="text-sm text-gray-300 mb-2">
                        هدف: <span class="text-yellow-400">$${pred.targetPrice.toLocaleString()}</span>
                    </div>
                    <div class="text-xs text-gray-400 mb-2">${pred.reasoning}</div>
                    <div class="flex justify-between text-xs">
                        <span class="${confidenceColor}">${pred.confidence}% اطمینان</span>
                        <span class="text-gray-500">${this.formatTimeAgo(Date.now() - pred.timestamp)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    async generateInsights() {
        try {
            const response = await fetch('/api/artemis/insights', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.marketInsights = data.data;
                await this.renderInsights();
                
                this.showNotification('بینش‌های جدید تولید شدند', 'success');
            } else {
                throw new Error(data.error || 'خطا در تولید بینش‌ها');
            }
            
        } catch (error) {
            console.error('Insights API Error:', error);
            
            // Fallback to mock data
            const insights = [
                {
                    type: 'market_trend',
                    title: 'روند کلی بازار',
                    content: 'بازار در حال تثبیت در محدوده فعلی است. انتظار حرکت قوی در 48 ساعت آینده.',
                    confidence: 82,
                    impact: 'متوسط',
                    icon: '📈'
                },
                {
                    type: 'volume_analysis',
                    title: 'تحلیل حجم معاملات',
                    content: 'حجم معاملات در 24 ساعت گذشته 15% کاهش یافته که نشانگر تردید معامله‌گران است.',
                    confidence: 91,
                    impact: 'بالا',
                    icon: '📊'
                },
                {
                    type: 'sentiment',
                    title: 'احساسات بازار',
                    content: 'شاخص ترس و طمع در ناحیه ترس قرار دارد. ممکن است فرصت خرید ایجاد شود.',
                    confidence: 76,
                    impact: 'متوسط',
                    icon: '😰'
                }
            ];

            this.marketInsights = insights;
            await this.renderInsights();
            
            this.showNotification('خطا در دریافت بینش‌ها از سرور. از داده‌های محلی استفاده شد.', 'warning');
        }
    }

    async renderInsights() {
        const insightsList = document.getElementById('ai-insights-list');
        if (!insightsList) return;

        insightsList.innerHTML = this.marketInsights.map(insight => {
            const confidenceColor = insight.confidence >= 85 ? 'text-green-400' :
                                   insight.confidence >= 70 ? 'text-yellow-400' : 'text-red-400';
            
            const impactColor = {
                'بالا': 'text-red-400',
                'متوسط': 'text-yellow-400', 
                'پایین': 'text-green-400'
            }[insight.impact];

            return `
                <div class="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div class="flex items-start mb-2">
                        <span class="text-xl mr-2">${insight.icon}</span>
                        <div class="flex-1">
                            <h4 class="text-white font-medium text-sm mb-1">${insight.title}</h4>
                            <p class="text-gray-300 text-xs leading-relaxed">${insight.content}</p>
                        </div>
                    </div>
                    <div class="flex justify-between text-xs mt-2">
                        <span class="${confidenceColor}">${insight.confidence}% اطمینان</span>
                        <span class="${impactColor}">تأثیر ${insight.impact}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadAISignals() {
        try {
            const response = await fetch('/api/artemis/signals', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                await this.renderAISignals(data.data);
            } else {
                throw new Error(data.error || 'خطا در دریافت سیگنال‌ها');
            }
            
        } catch (error) {
            console.error('Signals API Error:', error);
            
            // Fallback to mock data
            const signals = [
                {
                    symbol: 'BTC',
                    action: 'خرید',
                    strength: 'قوی',
                    price: 45200,
                    confidence: 88,
                    reason: 'شکست خط مقاومت با حجم بالا',
                    timeframe: '4h',
                    timestamp: Date.now() - 900000
                },
                {
                    symbol: 'ETH',
                    action: 'فروش',
                    strength: 'متوسط',
                    price: 3180,
                    confidence: 72,
                    reason: 'واگرایی منفی و ضعف نسبی',
                    timeframe: '1h',
                    timestamp: Date.now() - 1800000
                }
            ];

            await this.renderAISignals(signals);
            
            this.showNotification('خطا در دریافت سیگنال‌ها از سرور. از داده‌های محلی استفاده شد.', 'warning');
        }
    }

    async renderAISignals(signals) {
        const signalsList = document.getElementById('ai-signals-list');
        if (!signalsList) return;

        signalsList.innerHTML = signals.map(signal => {
            const actionClass = signal.action === 'خرید' ? 'text-green-400 bg-green-900/20' :
                               signal.action === 'فروش' ? 'text-red-400 bg-red-900/20' :
                               'text-gray-400 bg-gray-900/20';
            
            const strengthColor = signal.strength === 'قوی' ? 'text-green-400' :
                                 signal.strength === 'متوسط' ? 'text-yellow-400' : 'text-red-400';

            return `
                <div class="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-white">${signal.symbol}</span>
                        <span class="${actionClass} px-2 py-1 rounded text-xs font-medium">
                            ${signal.action} ${signal.strength}
                        </span>
                    </div>
                    <div class="text-sm text-gray-300 mb-1">
                        قیمت: <span class="text-yellow-400">$${signal.price.toLocaleString()}</span>
                    </div>
                    <div class="text-xs text-gray-400 mb-2">${signal.reason}</div>
                    <div class="flex justify-between text-xs">
                        <span class="text-blue-400">${signal.confidence}% اطمینان</span>
                        <span class="text-gray-500">${signal.timeframe}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Interactive methods will continue...
    // [Due to length limit, continuing with key methods]

    formatTimeAgo(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} روز پیش`;
        if (hours > 0) return `${hours} ساعت پیش`;
        if (minutes > 0) return `${minutes} دقیقه پیش`;
        return 'همین الان';
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';

        await this.addChatMessage('user', message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Call Artemis AI Chat API instead of simulation
            const response = await fetch('/api/artemis/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: this.conversationId || `artemis_${Date.now()}_${Math.random()}`
                })
            });

            const data = await response.json();
            
            this.hideTypingIndicator();

            if (data.success) {
                // Store conversation ID for context
                this.conversationId = data.data.conversationId;
                
                await this.addChatMessage('ai', data.data.message, data.data.confidence);
                
                // Update chat statistics
                this.updateChatStats(data.data);
            } else {
                throw new Error(data.error || 'خطا در ارتباط با آرتمیس');
            }
            
        } catch (error) {
            console.error('Artemis Chat Error:', error);
            this.hideTypingIndicator();
            
            // Fallback to local response
            const fallbackResponse = await this.generateAIResponse(message);
            await this.addChatMessage('ai', fallbackResponse);
            
            // Show error notification
            this.showNotification('خطا در ارتباط با سرور آرتمیس. از پاسخ محلی استفاده شد.', 'warning');
        }
    }

    async addChatMessage(sender, message) {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start';
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm ml-3">
                    👤
                </div>
                <div class="bg-blue-900/50 rounded-lg p-3 max-w-xs">
                    <p class="text-blue-100 text-sm">${message}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm mr-3">
                    🤖
                </div>
                <div class="bg-purple-900/50 rounded-lg p-3 max-w-xs">
                    <p class="text-purple-100 text-sm">${message}</p>
                </div>
            `;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async generateAIResponse(userMessage) {
        const responses = {
            'تحلیل BTC': 'بر اساس تحلیل‌های من، بیت‌کوین در محدوده 44-46 هزار دلار در حال تثبیت است. سیگنال‌های فنی نشان‌دهنده احتمال حرکت صعودی در روزهای آینده هستند.',
            'پیش‌بینی بازار': 'بازار کریپتو در کوتاه‌مدت متغیر خواهد بود. عوامل کلان اقتصادی و تصمیمات بانک‌های مرکزی تأثیر زیادی خواهند داشت. توصیه می‌کنم مدیریت ریسک را اولویت قرار دهید.',
            'بهترین سیگنال': 'در حال حاضر قوی‌ترین سیگنال خرید برای ETH وجود دارد با اطمینان 85%. همچنین ADA نیز سیگنال مثبت نشان می‌دهد.',
            'default': 'سوال جالبی پرسیدید! بر اساس داده‌های موجود و تحلیل‌های انجام شده، پاسخ دقیقی نیاز به بررسی بیشتر دارد. می‌توانید سوال خود را دقیق‌تر مطرح کنید؟'
        };

        return responses[userMessage] || responses['default'];
    }

    async askQuickQuestion(question) {
        const input = document.getElementById('ai-chat-input');
        if (input) {
            input.value = question;
            await this.sendMessage();
        }
    }

    // AI Learning and Training Methods
    async startLearning() {
        try {
            const response = await fetch('/api/artemis/learning/progress', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.updateLearningProgress(data.data);
            }
            
            this.isLearning = !this.isLearning;
            const button = document.getElementById('learning-toggle');
            if (button) {
                if (this.isLearning) {
                    button.innerHTML = '<i class="fas fa-pause mr-1"></i> توقف یادگیری';
                    button.className = 'bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm';
                    this.showNotification('یادگیری AI شروع شد', 'success');
                } else {
                    button.innerHTML = '<i class="fas fa-brain mr-1"></i> شروع یادگیری';
                    button.className = 'bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm';
                    this.showNotification('یادگیری AI متوقف شد', 'info');
                }
            }
        } catch (error) {
            console.error('Learning API Error:', error);
            this.showNotification('خطا در شروع یادگیری', 'error');
        }
    }

    async refreshAgents() { 
        await this.initializeAIAgents();
        this.showNotification('عامل‌های AI به‌روزرسانی شدند', 'success');
    }
    
    async updatePredictions() { 
        await this.loadAIPredictions();
    }
    
    async refreshSignals() { 
        await this.loadAISignals();
        this.showNotification('سیگنال‌ها به‌روزرسانی شدند', 'success');
    }
    
    async updateSettings() { 
        try {
            const sensitivity = document.getElementById('ai-sensitivity')?.value || 7;
            const confidence = document.getElementById('confidence-threshold')?.value || 75;
            const learningRate = document.getElementById('learning-rate')?.value || 5;
            
            const response = await fetch('/api/artemis/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                },
                body: JSON.stringify({
                    sensitivity: parseInt(sensitivity),
                    confidenceThreshold: parseInt(confidence),
                    learningRate: parseInt(learningRate)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('تنظیمات AI به‌روزرسانی شد', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Settings API Error:', error);
            this.showNotification('خطا در به‌روزرسانی تنظیمات', 'error');
        }
    }
    
    async startTraining() { 
        try {
            const response = await fetch('/api/artemis/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                },
                body: JSON.stringify({
                    action: 'start_training'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('آموزش AI شروع شد', 'success');
            }
        } catch (error) {
            console.error('Training API Error:', error);
            this.showNotification('خطا در شروع آموزش', 'error');
        }
    }
    
    async pauseTraining() { 
        try {
            const response = await fetch('/api/artemis/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                },
                body: JSON.stringify({
                    action: 'pause_training'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('آموزش AI متوقف شد', 'info');
            }
        } catch (error) {
            console.error('Pause Training API Error:', error);
            this.showNotification('خطا در توقف آموزش', 'error');
        }
    }
    
    async exportAIData() { 
        try {
            const response = await fetch('/api/artemis/analytics/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Create and download CSV file
                const blob = new Blob([data.data.csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `artemis_ai_data_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                this.showNotification('داده‌های AI صادر شدند', 'success');
            }
        } catch (error) {
            console.error('Export API Error:', error);
            this.showNotification('خطا در صادرات داده‌ها', 'error');
        }
    }
    
    async resetAI() { 
        if (!confirm('آیا مطمئن هستید که می‌خواهید AI را ریست کنید؟')) return;
        
        try {
            const response = await fetch('/api/artemis/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                },
                body: JSON.stringify({
                    action: 'reset_ai'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('AI با موفقیت ریست شد', 'success');
                await this.loadAIData();
            }
        } catch (error) {
            console.error('Reset AI API Error:', error);
            this.showNotification('خطا در ریست AI', 'error');
        }
    }
    
    async optimizeModels() { 
        try {
            const response = await fetch('/api/artemis/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                },
                body: JSON.stringify({
                    action: 'optimize_models'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('مدل‌های AI بهینه‌سازی شدند', 'success');
            }
        } catch (error) {
            console.error('Optimize API Error:', error);
            this.showNotification('خطا در بهینه‌سازی', 'error');
        }
    }
    
    async backupAI() { 
        try {
            const response = await fetch('/api/artemis/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                },
                body: JSON.stringify({
                    action: 'backup_ai'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('پشتیبان AI با موفقیت ایجاد شد', 'success');
            }
        } catch (error) {
            console.error('Backup API Error:', error);
            this.showNotification('خطا در ایجاد پشتیبان', 'error');
        }
    }

    async initializeAIChart() {
        // Placeholder for AI performance chart
        console.log('🔀 AI Chart initialization - will be implemented with Chart.js');
    }

    async loadAIData() {
        try {
            const response = await fetch('/api/artemis/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                const artemisData = data.data;
                
                // Update AI stats from real API data
                const accuracyEl = document.getElementById('ai-accuracy');
                const predictionsEl = document.getElementById('ai-predictions');
                const profitEl = document.getElementById('ai-profit');
                const lastUpdateEl = document.getElementById('last-ai-update');

                if (accuracyEl && artemisData.artemisStatus) {
                    accuracyEl.textContent = `${artemisData.artemisStatus.confidence.toFixed(1)}%`;
                }
                if (predictionsEl && artemisData.artemisStatus) {
                    predictionsEl.textContent = artemisData.artemisStatus.totalPredictions.toLocaleString('fa-IR');
                }
                if (profitEl && artemisData.artemisStatus) {
                    const profit = artemisData.artemisStatus.totalProfit;
                    profitEl.textContent = profit > 0 ? `+${profit.toFixed(1)}%` : `${profit.toFixed(1)}%`;
                }
                if (lastUpdateEl && artemisData.artemisStatus) {
                    lastUpdateEl.textContent = new Date(artemisData.artemisStatus.lastUpdate).toLocaleTimeString('fa-IR');
                }
                
                // Update AI agents with real data
                if (artemisData.aiAgents) {
                    this.aiAgents = artemisData.aiAgents;
                    this.renderAIAgents();
                }
                
                // Store real Artemis status for other methods
                this.artemisStatus = artemisData.artemisStatus;
                
            } else {
                throw new Error(data.error || 'خطا در دریافت داده‌های AI');
            }
            
        } catch (error) {
            console.error('AI Data API Error:', error);
            
            // Fallback to mock data
            const accuracyEl = document.getElementById('ai-accuracy');
            const predictionsEl = document.getElementById('ai-predictions');
            const profitEl = document.getElementById('ai-profit');
            const lastUpdateEl = document.getElementById('last-ai-update');

            if (accuracyEl) accuracyEl.textContent = `${(90 + Math.random() * 10).toFixed(1)}%`;
            if (predictionsEl) predictionsEl.textContent = (1200 + Math.floor(Math.random() * 100)).toLocaleString();
            if (profitEl) profitEl.textContent = `+${(25 + Math.random() * 10).toFixed(1)}%`;
            if (lastUpdateEl) lastUpdateEl.textContent = new Date().toLocaleTimeString('fa-IR');
        }
    }

    setupAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(async () => {
            await this.loadAIData();
            if (Math.random() > 0.7) {
                await this.renderAIAgents();
            }
        }, 10000); // 10 seconds
    }
    
    setupSettingsSliders() {
        const sensitivitySlider = document.getElementById('ai-sensitivity');
        const confidenceSlider = document.getElementById('confidence-threshold');
        const learningSlider = document.getElementById('learning-rate');
        
        if (sensitivitySlider) {
            sensitivitySlider.addEventListener('input', (e) => {
                document.getElementById('sensitivity-value').textContent = e.target.value;
            });
        }
        
        if (confidenceSlider) {
            confidenceSlider.addEventListener('input', (e) => {
                document.getElementById('confidence-value').textContent = `${e.target.value}%`;
            });
        }
        
        if (learningSlider) {
            learningSlider.addEventListener('input', (e) => {
                document.getElementById('learning-value').textContent = e.target.value;
            });
        }
    }

    // Helper Methods
    updateLearningProgress(progressData) {
        const marketEl = document.getElementById('market-learning');
        const priceEl = document.getElementById('price-learning');
        const riskEl = document.getElementById('risk-learning');
        const sentimentEl = document.getElementById('sentiment-learning');
        
        if (progressData.marketAnalyzer && marketEl) {
            marketEl.textContent = `${progressData.marketAnalyzer.progress}%`;
            marketEl.parentElement.querySelector('.bg-blue-600').style.width = `${progressData.marketAnalyzer.progress}%`;
        }
        
        if (progressData.pricePredictor && priceEl) {
            priceEl.textContent = `${progressData.pricePredictor.progress}%`;
            priceEl.parentElement.querySelector('.bg-green-600').style.width = `${progressData.pricePredictor.progress}%`;
        }
        
        if (progressData.riskManager && riskEl) {
            riskEl.textContent = `${progressData.riskManager.progress}%`;
            riskEl.parentElement.querySelector('.bg-yellow-600').style.width = `${progressData.riskManager.progress}%`;
        }
        
        if (progressData.newsAnalyzer && sentimentEl) {
            sentimentEl.textContent = `${progressData.newsAnalyzer.progress}%`;
            sentimentEl.parentElement.querySelector('.bg-purple-600').style.width = `${progressData.newsAnalyzer.progress}%`;
        }
    }
    
    showTypingIndicator() {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex items-center';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm mr-3">
                🤖
            </div>
            <div class="bg-purple-900/50 rounded-lg p-3">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    updateChatStats(responseData) {
        // Update conversation statistics if available
        if (responseData.stats) {
            console.log('Chat Stats Updated:', responseData.stats);
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        const bgColor = {
            'success': 'bg-green-600',
            'error': 'bg-red-600', 
            'warning': 'bg-yellow-600',
            'info': 'bg-blue-600'
        }[type] || 'bg-blue-600';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        delete window.artemisModule;
        console.log('🗑️ Artemis AI Module destroyed');
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArtemisModule;
}

// Register in global TitanModules namespace
if (typeof window !== 'undefined') {
    window.TitanModules = window.TitanModules || {};
    window.TitanModules.ArtemisModule = ArtemisModule;
    console.log('📦 Artemis AI Module registered in TitanModules');
}