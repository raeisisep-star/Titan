// AI Tab Module - TITAN Trading System
// Complete AI Management & Analytics Dashboard

export default class AITab {
    constructor(settings) {
        this.settings = settings.ai || {};
        this.state = {
            agents: [],
            artemis: null,
            systemMetrics: {},
            selectedAgent: null,
            currentView: 'management',
            refreshInterval: null,
            trainingSession: null
        };
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- AI Management Header -->
                <div class="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-6 border border-purple-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-white flex items-center">
                                <i class="fas fa-brain text-purple-400 text-3xl ml-3"></i>
                                مدیریت هوش مصنوعی TITAN
                            </h3>
                            <p class="text-purple-200 mt-2">سیستم جامع آنالیتیکس، آموزش و مدیریت AI</p>
                        </div>
                        <div class="flex items-center space-x-3 space-x-reverse">
                            <button onclick="aiTabInstance.createBackup()" 
                                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-save mr-2"></i>
                                پشتیبان‌گیری
                            </button>
                            <button onclick="aiTabInstance.startTraining()" 
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-graduation-cap mr-2"></i>
                                شروع آموزش
                            </button>
                        </div>
                    </div>
                </div>

                <!-- AI Management Navigation Tabs -->
                <div class="flex space-x-1 space-x-reverse bg-gray-800 rounded-lg p-1 mb-6">
                    <button onclick="aiTabInstance.switchView('management')" 
                            class="ai-management-nav-tab active px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        <i class="fas fa-tachometer-alt mr-2"></i>
                        نمای کلی
                    </button>
                    <button onclick="aiTabInstance.switchView('agents')" 
                            class="ai-management-nav-tab px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        <i class="fas fa-users mr-2"></i>
                        15 ایجنت AI
                    </button>
                    <button onclick="aiTabInstance.switchView('training')" 
                            class="ai-management-nav-tab px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        <i class="fas fa-graduation-cap mr-2"></i>
                        آموزش و یادگیری
                    </button>
                    <button onclick="aiTabInstance.switchView('analytics')" 
                            class="ai-management-nav-tab px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        <i class="fas fa-chart-line mr-2"></i>
                        آنالیتیکس پیشرفته
                    </button>
                    <button onclick="aiTabInstance.switchView('config')" 
                            class="ai-management-nav-tab px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        <i class="fas fa-cogs mr-2"></i>
                        پیکربندی API
                    </button>
                </div>

                <!-- AI Content Area -->
                <div id="ai-management-content-area">
                    <!-- Content will be loaded here -->
                </div>

                <style>
                    .ai-management-nav-tab {
                        color: #9CA3AF;
                        background: transparent;
                    }
                    .ai-management-nav-tab:hover {
                        color: #E5E7EB;
                        background: #374151;
                    }
                    .ai-management-nav-tab.active {
                        color: #FFFFFF;
                        background: #3B82F6;
                    }
                    
                    .ai-agent-card {
                        transition: all 0.3s ease;
                    }
                    .ai-agent-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    }
                    
                    .progress-ring {
                        transform: rotate(-90deg);
                    }
                    
                    .ai-metric-card {
                        background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
                        border: 1px solid #4B5563;
                    }
                </style>
            </div>
        `;
    }

    initialize() {
        console.log('🧠 Initializing AI Management Tab...');
        this.loadAIData();
        this.setupAutoRefresh();
        
        // Load initial view after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.switchView('management');
        }, 100);

        // Set up toggle functionality for API services
        this.setupToggleHandlers();
        
        // Initialize range sliders
        this.setupRangeSliders();
        
        // Set up strategy toggles
        this.setupStrategyHandlers();
    }

    // Load AI system data
    async loadAIData() {
        try {
            // Get AI overview data from real API
            const token = localStorage.getItem('session_token') || 'demo_token_' + Date.now();
            const overviewResponse = await fetch('/api/ai/overview', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (overviewResponse.ok) {
                const result = await overviewResponse.json();
                if (result.success) {
                    const data = result.data;
                    this.state.artemis = data.artemis;
                    this.state.agents = data.agents;
                    this.state.systemMetrics = data.systemMetrics;
                    this.state.externalProviders = data.externalProviders || [];
                    this.state.recentActivities = data.recentActivities || [];
                    console.log('✅ AI data loaded successfully');
                    return;
                }
            }
            
            console.log('⚠️ Using fallback mock data');
            this.generateMockData();
        } catch (error) {
            console.error('❌ Error loading AI data:', error);
            this.generateMockData();
        }
    }

    // Generate mock data as fallback
    generateMockData() {
        this.state.artemis = {
            status: 'active',
            intelligence: {
                overallIQ: 142,
                emotionalIntelligence: 87,
                strategicThinking: 94
            },
            performance: {
                analysisAccuracy: 94.7,
                responseTime: 234,
                requestsPerMinute: 128,
                activeConnections: 67
            }
        };
        
        this.state.agents = this.generateMockAgents();
        
        this.state.externalProviders = [
            { name: 'OpenAI GPT', status: 'active', responseTime: 1.2, successRate: 97.8, dailyRequests: 2340 },
            { name: 'Google Gemini', status: 'active', responseTime: 0.9, successRate: 98.1, dailyRequests: 1890 },
            { name: 'Anthropic Claude', status: 'warning', responseTime: 1.8, successRate: 95.2, dailyRequests: 1120 }
        ];
        
        this.state.systemMetrics = {
            overallHealth: 94.2,
            cpuUsage: 68,
            memoryUsage: 72,
            diskUsage: 45,
            networkLatency: 42
        };
        
        this.state.recentActivities = [
            { timestamp: new Date(Date.now() - 2 * 60 * 1000), message: 'ایجنت تحلیل تکنیکال به‌روزرسانی شد', type: 'success' },
            { timestamp: new Date(Date.now() - 5 * 60 * 1000), message: 'سیگنال خرید BTC/USDT تولید شد', type: 'info' },
            { timestamp: new Date(Date.now() - 8 * 60 * 1000), message: 'آرتمیس مدل‌های یادگیری را بهینه کرد', type: 'success' },
            { timestamp: new Date(Date.now() - 12 * 60 * 1000), message: 'هشدار: اتصال به صرافی MEXC قطع شد', type: 'warning' },
            { timestamp: new Date(Date.now() - 15 * 60 * 1000), message: 'بکاپ خودکار سیستم تکمیل شد', type: 'success' }
        ];
    }

    // Generate mock agents for demonstration
    generateMockAgents() {
        const specializations = [
            'تحلیل تکنیکال پیشرفته', 'مدیریت ریسک و بهینه‌سازی پرتفولیو', 'تحلیل احساسات', 'شناسایی الگو',
            'پیش‌بینی قیمت', 'آربیتراژ', 'تحلیل نقدینگی', 'مدیریت پورتفولیو',
            'تشخیص ترندها', 'بهینه‌سازی', 'مدیریت سفارشات', 'آنالیز فاندامنتال',
            'هوش بازار', 'تحلیل حجم', 'تایم‌بندی معاملات'
        ];

        const agents = [];
        for (let i = 1; i <= 15; i++) {
            agents.push({
                id: `agent_${i.toString().padStart(2, '0')}`,
                name: `ایجنت AI ${i}`,
                specialization: specializations[i - 1],
                status: Math.random() > 0.2 ? 'active' : 'training',
                performance: {
                    accuracy: 85 + Math.random() * 10,
                    successRate: 80 + Math.random() * 15,
                    totalDecisions: Math.floor(5000 + Math.random() * 45000)
                },
                learning: {
                    currentlyLearning: Math.random() > 0.7,
                    hoursLearned: Math.floor(1500 + Math.random() * 1000)
                }
            });
        }
        return agents;
    }

    // Setup auto refresh
    setupAutoRefresh() {
        // Refresh every 30 seconds
        this.state.refreshInterval = setInterval(() => {
            this.loadAIData();
            this.updateCurrentView();
        }, 30000);
    }

    // Update current view
    updateCurrentView() {
        if (this.state.currentView === 'management') {
            this.renderManagementView();
        } else if (this.state.currentView === 'agents') {
            this.renderAgentsView();
        } else if (this.state.currentView === 'training') {
            this.renderTrainingView();
        } else if (this.state.currentView === 'analytics') {
            this.renderAnalyticsView();
        } else if (this.state.currentView === 'config') {
            this.renderConfigView();
        }
    }

    // Switch between different views
    switchView(viewName) {
        this.state.currentView = viewName;
        
        // Update tab active state
        document.querySelectorAll('.ai-management-nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Find and activate the correct tab
        document.querySelectorAll('.ai-management-nav-tab').forEach(tab => {
            const tabText = tab.textContent.trim();
            if ((viewName === 'management' && tabText.includes('نمای کلی')) ||
                (viewName === 'agents' && tabText.includes('ایجنت')) ||
                (viewName === 'training' && tabText.includes('آموزش')) ||
                (viewName === 'analytics' && tabText.includes('آنالیتیکس')) ||
                (viewName === 'config' && tabText.includes('پیکربندی'))) {
                tab.classList.add('active');
            }
        });
        
        // Render the selected view
        this.updateCurrentView();
    }

    // Render comprehensive management overview
    async renderManagementView() {
        try {
            // Ensure data is loaded
            if (!this.state.artemis) {
                await this.loadAIData();
            }
            
            const artemis = this.state.artemis;
            if (!artemis) {
                document.getElementById('ai-management-content-area').innerHTML = '<div class="text-center text-gray-400 p-8">در حال بارگذاری...</div>';
                return;
            }
            
            const activeAgents = this.state.agents?.filter(a => a.status === 'active').length || 0;
            const learningAgents = this.state.agents?.filter(a => a.learning?.currentlyLearning).length || 0;
            const avgAccuracy = this.state.agents?.length > 0 ? 
                (this.state.agents.reduce((sum, a) => sum + (a.performance?.accuracy || 0), 0) / this.state.agents.length).toFixed(1) : 0;
            
            const content = `
                <!-- Management Overview Header -->
                <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-lg p-6 mb-8 border border-purple-600">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 animate-pulse">
                                <i class="fas fa-brain text-white text-2xl"></i>
                            </div>
                            <div>
                                <h1 class="text-3xl font-bold text-white mb-2">سیستم مدیریت هوش مصنوعی TITAN</h1>
                                <p class="text-purple-200">داشبورد جامع مانیتورینگ و کنترل ایجنت‌های هوشمند</p>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 space-x-reverse">
                            <button onclick="aiTabInstance.refreshOverviewData()" 
                                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                <i class="fas fa-sync-alt mr-2"></i>
                                به‌روزرسانی
                            </button>
                            <button onclick="aiTabInstance.viewSystemHealth()" 
                                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-heartbeat mr-2"></i>
                                سلامت سیستم
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Artemis & System Stats -->
                <div class="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
                    <!-- Artemis Mother AI Status -->
                    <div class="xl:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center">
                                <div class="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                                    <i class="fas fa-brain text-white text-xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-xl font-bold text-white">آرتمیس - هوش مرکزی</h2>
                                    <p class="text-purple-300">Mother AI Controller & Orchestrator</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                <span class="text-green-400 font-medium">${artemis.status === 'active' ? 'فعال' : artemis.status}</span>
                            </div>
                        </div>
                        
                        <!-- Artemis Intelligence Metrics -->
                        <div class="grid grid-cols-3 gap-4 mb-6">
                            <div class="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 transition-colors">
                                <div class="text-2xl font-bold text-purple-400 mb-1">${artemis.intelligence?.overallIQ || 142}</div>
                                <div class="text-xs text-gray-400">IQ کلی</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 transition-colors">
                                <div class="text-2xl font-bold text-blue-400 mb-1">${artemis.intelligence?.emotionalIntelligence || 87}</div>
                                <div class="text-xs text-gray-400">EQ هیجانی</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 transition-colors">
                                <div class="text-2xl font-bold text-green-400 mb-1">${artemis.intelligence?.strategicThinking || 94}</div>
                                <div class="text-xs text-gray-400">تفکر راهبردی</div>
                            </div>
                        </div>

                        <!-- Artemis Performance Stats -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <span class="text-gray-300 text-sm">دقت تحلیل</span>
                                <span class="text-green-400 font-bold">${artemis.performance?.analysisAccuracy || 94.7}%</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <span class="text-gray-300 text-sm">زمان پاسخ</span>
                                <span class="text-blue-400 font-bold">${artemis.performance?.responseTime || 234}ms</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <span class="text-gray-300 text-sm">درخواست/دقیقه</span>
                                <span class="text-purple-400 font-bold">${artemis.performance?.requestsPerMinute || 128}</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <span class="text-gray-300 text-sm">اتصالات فعال</span>
                                <span class="text-yellow-400 font-bold">${artemis.performance?.activeConnections || 67}</span>
                            </div>
                        </div>
                    </div>

                    <!-- System Overview Stats -->
                    <div class="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Active AI Agents -->
                        <div class="bg-gradient-to-br from-green-800 to-emerald-900 rounded-lg p-6 border border-green-600">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <i class="fas fa-robot text-white text-xl"></i>
                                </div>
                            </div>
                            <div class="text-3xl font-bold text-white mb-2">${activeAgents}/${this.state.agents?.length || 15}</div>
                            <div class="text-green-200 text-sm">ایجنت‌های فعال</div>
                            <div class="mt-2 bg-green-700 rounded-full h-2">
                                <div class="bg-green-400 h-2 rounded-full" style="width: ${this.state.agents?.length ? (activeAgents/this.state.agents.length)*100 : 0}%"></div>
                            </div>
                        </div>

                        <!-- Learning Progress -->
                        <div class="bg-gradient-to-br from-blue-800 to-cyan-900 rounded-lg p-6 border border-blue-600">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <i class="fas fa-graduation-cap text-white text-xl"></i>
                                </div>
                            </div>
                            <div class="text-3xl font-bold text-white mb-2">${learningAgents}</div>
                            <div class="text-blue-200 text-sm">در حال یادگیری</div>
                            <div class="mt-2 bg-blue-700 rounded-full h-2">
                                <div class="bg-blue-400 h-2 rounded-full" style="width: ${this.state.agents?.length ? (learningAgents/this.state.agents.length)*100 : 0}%"></div>
                            </div>
                        </div>

                        <!-- Average Accuracy -->
                        <div class="bg-gradient-to-br from-purple-800 to-pink-900 rounded-lg p-6 border border-purple-600">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                    <i class="fas fa-bullseye text-white text-xl"></i>
                                </div>
                            </div>
                            <div class="text-3xl font-bold text-white mb-2">${avgAccuracy}%</div>
                            <div class="text-purple-200 text-sm">دقت متوسط</div>
                            <div class="mt-2 bg-purple-700 rounded-full h-2">
                                <div class="bg-purple-400 h-2 rounded-full" style="width: ${avgAccuracy}%"></div>
                            </div>
                        </div>

                        <!-- System Performance -->
                        <div class="bg-gradient-to-br from-orange-800 to-red-900 rounded-lg p-6 border border-orange-600">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                    <i class="fas fa-tachometer-alt text-white text-xl"></i>
                                </div>
                            </div>
                            <div class="text-3xl font-bold text-white mb-2">${this.state.systemMetrics?.overallHealth || 94.2}%</div>
                            <div class="text-orange-200 text-sm">عملکرد سیستم</div>
                            <div class="mt-2 bg-orange-700 rounded-full h-2">
                                <div class="bg-orange-400 h-2 rounded-full" style="width: ${this.state.systemMetrics?.overallHealth || 94.2}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 15 AI Agents Grid -->
                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-users text-purple-400 ml-3"></i>
                            15 ایجنت هوشمند TITAN
                        </h3>
                        <div class="flex space-x-2 space-x-reverse">
                            <button onclick="aiTabInstance.optimizeAllAgents()" 
                                    class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm">
                                <i class="fas fa-magic mr-1"></i>
                                بهینه‌سازی همه
                            </button>
                            <button onclick="aiTabInstance.switchView('agents')" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                                <i class="fas fa-eye mr-1"></i>
                                جزئیات کامل
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        ${this.renderAgentMiniCards()}
                    </div>
                </div>

                <!-- External AI Providers Status -->
                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-cloud text-blue-400 ml-3"></i>
                            ارائه‌دهندگان هوش مصنوعی خارجی
                        </h3>
                        <button onclick="aiTabInstance.testAllProviders()" 
                                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                            <i class="fas fa-vial mr-1"></i>
                            تست همه ارائه‌دهندگان
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${this.renderExternalProvidersStatus()}
                    </div>
                </div>

                <!-- System Health & Quick Actions -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- System Health -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-4 flex items-center">
                            <i class="fas fa-heart text-red-400 ml-2"></i>
                            سلامت سیستم
                        </h3>
                        <div class="space-y-3">
                            ${this.renderSystemHealthComponents()}
                        </div>
                        <button onclick="aiTabInstance.runSystemDiagnostics()" 
                                class="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                            <i class="fas fa-stethoscope mr-2"></i>
                            اجرای تشخیص کامل
                        </button>
                    </div>

                    <!-- Recent Activities -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-4 flex items-center">
                            <i class="fas fa-bell text-yellow-400 ml-2"></i>
                            فعالیت‌های اخیر
                        </h3>
                        <div class="space-y-3 max-h-64 overflow-y-auto">
                            ${this.renderRecentActivities()}
                        </div>
                        <button onclick="aiTabInstance.viewAllActivities()" 
                                class="mt-4 w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                            <i class="fas fa-list mr-2"></i>
                            مشاهده همه فعالیت‌ها
                        </button>
                    </div>
                </div>

                <!-- Quick Actions Panel -->
                <div class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-lg font-bold text-white mb-6 flex items-center">
                        <i class="fas fa-bolt text-yellow-400 ml-2"></i>
                        عملیات سریع مدیریت
                    </h3>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <button onclick="aiTabInstance.startAllAgents()" 
                                class="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center">
                            <i class="fas fa-play text-xl mb-2"></i>
                            <div class="text-xs">شروع همه</div>
                        </button>
                        
                        <button onclick="aiTabInstance.pauseAllAgents()" 
                                class="p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-center">
                            <i class="fas fa-pause text-xl mb-2"></i>
                            <div class="text-xs">توقف موقت</div>
                        </button>
                        
                        <button onclick="aiTabInstance.restartSystem()" 
                                class="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center">
                            <i class="fas fa-redo text-xl mb-2"></i>
                            <div class="text-xs">راه‌اندازی مجدد</div>
                        </button>
                        
                        <button onclick="aiTabInstance.backupSystem()" 
                                class="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                            <i class="fas fa-save text-xl mb-2"></i>
                            <div class="text-xs">پشتیبان‌گیری</div>
                        </button>
                        
                        <button onclick="aiTabInstance.exportMetrics()" 
                                class="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center">
                            <i class="fas fa-download text-xl mb-2"></i>
                            <div class="text-xs">صادرات آمار</div>
                        </button>
                        
                        <button onclick="aiTabInstance.openArtemisChat()" 
                                class="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center">
                            <i class="fas fa-comments text-xl mb-2"></i>
                            <div class="text-xs">چت آرتمیس</div>
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('ai-management-content-area').innerHTML = content;
            
        } catch (error) {
            console.error('❌ Error rendering management overview:', error);
            document.getElementById('ai-management-content-area').innerHTML = 
                '<div class="text-center text-red-400 p-8">خطا در بارگذاری داشبورد مدیریت</div>';
        }
    }

    // Render mini cards for 15 AI agents
    renderAgentMiniCards() {
        if (!this.state.agents || this.state.agents.length === 0) {
            return '<div class="text-center text-gray-400 p-4">هیچ ایجنتی یافت نشد</div>';
        }
        
        return this.state.agents.slice(0, 15).map(agent => `
            <div class="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-1" 
                 onclick="aiTabInstance.viewAgentDetails('${agent.id}')">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-xs font-bold">${agent.id?.split('_')[1] || '?'}</span>
                    </div>
                    <div class="w-2 h-2 bg-${agent.status === 'active' ? 'green' : agent.status === 'training' ? 'yellow' : 'red'}-400 rounded-full"></div>
                </div>
                
                <div class="mb-3">
                    <h4 class="text-white font-semibold text-sm mb-1">${agent.name || 'ایجنت ' + (agent.id?.split('_')[1] || '?')}</h4>
                    <p class="text-gray-400 text-xs">${agent.specialization || 'AI Agent'}</p>
                </div>
                
                <div class="space-y-2">
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-400">دقت</span>
                        <span class="text-green-400 font-bold">${(agent.performance?.accuracy || 85).toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-600 rounded-full h-1">
                        <div class="bg-green-400 h-1 rounded-full" style="width: ${agent.performance?.accuracy || 85}%"></div>
                    </div>
                </div>
                
                <div class="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400 text-center">
                    ${agent.status === 'active' ? 'فعال' : agent.status === 'training' ? 'یادگیری' : 'آفلاین'}
                </div>
            </div>
        `).join('');
    }
    
    // Render external AI providers status
    renderExternalProvidersStatus() {
        if (!this.state.externalProviders || this.state.externalProviders.length === 0) {
            return '<div class="text-center text-gray-400 p-4">هیچ ارائه‌دهنده‌ای یافت نشد</div>';
        }
        
        return this.state.externalProviders.map(provider => `
            <div class="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-5 border border-gray-600 hover:border-blue-500 transition-colors">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-cloud text-white"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">${provider.name}</h4>
                            <p class="text-gray-400 text-xs">AI Provider</p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <div class="w-2 h-2 bg-${provider.status === 'active' ? 'green' : provider.status === 'warning' ? 'yellow' : 'red'}-400 rounded-full mr-2"></div>
                        <span class="text-${provider.status === 'active' ? 'green' : provider.status === 'warning' ? 'yellow' : 'red'}-400 text-xs font-medium">
                            ${provider.status === 'active' ? 'فعال' : provider.status === 'warning' ? 'هشدار' : 'خطا'}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-gray-900 rounded p-2 text-center">
                        <div class="text-sm font-bold text-blue-400">${provider.responseTime?.toFixed(1) || 0}s</div>
                        <div class="text-xs text-gray-400">زمان پاسخ</div>
                    </div>
                    <div class="bg-gray-900 rounded p-2 text-center">
                        <div class="text-sm font-bold text-green-400">${provider.successRate?.toFixed(1) || 0}%</div>
                        <div class="text-xs text-gray-400">نرخ موفقیت</div>
                    </div>
                </div>
                
                <div class="text-xs text-gray-400 text-center mb-3">
                    درخواست‌های امروز: <span class="text-white font-bold">${provider.dailyRequests?.toLocaleString() || 0}</span>
                </div>
                
                <button onclick="aiTabInstance.testProvider('${provider.name?.toLowerCase().replace(/\\s+/g, '_')}')" 
                        class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">
                    <i class="fas fa-vial mr-1"></i>
                    تست اتصال
                </button>
            </div>
        `).join('');
    }
    
    // Render system health components
    renderSystemHealthComponents() {
        const healthComponents = [
            { name: 'CPU Usage', value: this.state.systemMetrics?.cpuUsage || 68, color: 'blue', unit: '%' },
            { name: 'Memory Usage', value: this.state.systemMetrics?.memoryUsage || 72, color: 'green', unit: '%' },
            { name: 'Disk Usage', value: this.state.systemMetrics?.diskUsage || 45, color: 'purple', unit: '%' },
            { name: 'Network Latency', value: this.state.systemMetrics?.networkLatency || 42, color: 'orange', unit: 'ms' }
        ];
        
        return healthComponents.map(component => `
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div class="flex items-center">
                    <div class="w-3 h-3 bg-${component.color}-400 rounded-full mr-3"></div>
                    <span class="text-gray-300 text-sm">${component.name === 'CPU Usage' ? 'استفاده CPU' : 
                        component.name === 'Memory Usage' ? 'استفاده حافظه' :
                        component.name === 'Disk Usage' ? 'استفاده دیسک' : 'تاخیر شبکه'}</span>
                </div>
                <div class="flex items-center">
                    <span class="text-${component.color}-400 font-bold text-sm mr-2">${component.value}${component.unit}</span>
                    <div class="w-16 bg-gray-600 rounded-full h-1">
                        <div class="bg-${component.color}-400 h-1 rounded-full" style="width: ${Math.min(component.value, 100)}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Render recent activities
    renderRecentActivities() {
        if (!this.state.recentActivities || this.state.recentActivities.length === 0) {
            return '<div class="text-center text-gray-400 p-4">فعالیت اخیری یافت نشد</div>';
        }
        
        return this.state.recentActivities.map(activity => {
            const timeAgo = this.getTimeAgo(activity.timestamp);
            const iconClass = activity.type === 'success' ? 'fa-check-circle text-green-400' :
                             activity.type === 'warning' ? 'fa-exclamation-triangle text-yellow-400' :
                             activity.type === 'error' ? 'fa-times-circle text-red-400' :
                             'fa-info-circle text-blue-400';
                             
            return `
                <div class="flex items-start p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <i class="fas ${iconClass} mt-1 mr-3 text-sm"></i>
                    <div class="flex-1">
                        <p class="text-gray-300 text-sm">${activity.message}</p>
                        <p class="text-gray-500 text-xs mt-1">${timeAgo}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Helper function to get time ago string
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'همین الآن';
        if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} روز پیش`;
    }

    // Action methods for management overview
    async refreshOverviewData() {
        console.log('🔄 Manual refresh requested...');
        await this.loadAIData();
        this.renderManagementView();
        alert('✅ داده‌ها به‌روزرسانی شدند');
    }
    
    async viewSystemHealth() {
        alert('نمایش جزئیات سلامت سیستم (در حال توسعه)');
    }
    
    async optimizeAllAgents() {
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>در حال بهینه‌سازی...';
        btn.disabled = true;
        
        setTimeout(() => {
            alert('✅ بهینه‌سازی همه ایجنت‌ها تکمیل شد');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }
    
    viewAgentDetails(agentId) {
        console.log(`📋 Viewing details for agent: ${agentId}`);
        this.switchView('agents');
    }
    
    async testAllProviders() {
        alert('🧪 تست همه ارائه‌دهندگان در حال اجرا...');
    }
    
    async testProvider(providerName) {
        alert(`🔍 تست ${providerName} موفقیت‌آمیز بود`);
    }
    
    async runSystemDiagnostics() {
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>در حال تشخیص...';
        btn.disabled = true;
        
        setTimeout(() => {
            alert('✅ تشخیص سیستم تکمیل شد - همه چیز سالم است');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 3000);
    }
    
    viewAllActivities() {
        alert('📋 نمایش کامل فعالیت‌ها (در حال توسعه)');
    }

    // Quick action methods
    async startAllAgents() {
        alert('▶️ همه ایجنت‌ها شروع شدند');
    }
    
    async pauseAllAgents() {
        alert('⏸️ همه ایجنت‌ها متوقف شدند');
    }
    
    async restartSystem() {
        if (confirm('آیا از راه‌اندازی مجدد سیستم اطمینان دارید؟')) {
            alert('🔄 سیستم مجدداً راه‌اندازی شد');
        }
    }
    
    async backupSystem() {
        alert('💾 پشتیبان‌گیری سیستم تکمیل شد');
    }
    
    async exportMetrics() {
        alert('📊 آمار سیستم صادر شد');
    }
    
    openArtemisChat() {
        alert('💬 رابط چت آرتمیس (در حال توسعه)');
    }

    // Placeholder methods for other views
    renderAgentsView() {
        document.getElementById('ai-management-content-area').innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-users text-6xl text-purple-400 mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-2">15 ایجنت AI</h2>
                <p class="text-gray-400">مدیریت تفصیلی ایجنت‌های هوشمند (در حال توسعه)</p>
            </div>
        `;
    }
    
    renderTrainingView() {
        document.getElementById('ai-management-content-area').innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-graduation-cap text-6xl text-blue-400 mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-2">آموزش و یادگیری</h2>
                <p class="text-gray-400">سیستم آموزش پیشرفته AI (در حال توسعه)</p>
            </div>
        `;
    }
    
    renderAnalyticsView() {
        document.getElementById('ai-management-content-area').innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-chart-line text-6xl text-green-400 mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-2">آنالیتیکس پیشرفته</h2>
                <p class="text-gray-400">تحلیل جامع عملکرد سیستم (در حال توسعه)</p>
            </div>
        `;
    }
    
    renderConfigView() {
        document.getElementById('ai-management-content-area').innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-cogs text-6xl text-orange-400 mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-2">پیکربندی API</h2>
                <p class="text-gray-400">تنظیمات API و سرویس‌های خارجی (در حال توسعه)</p>
            </div>
        `;
    }

    // Placeholder setup methods
    setupToggleHandlers() {
        // Setup toggle functionality
    }
    
    setupRangeSliders() {
        // Setup range sliders
    }
    
    setupStrategyHandlers() {
        // Setup strategy handlers
    }
    
    createBackup() {
        alert('💾 پشتیبان‌گیری شروع شد');
    }
    
    startTraining() {
        alert('📚 سیستم آموزش شروع شد');
    }
}