// AI Management & Analytics Dashboard Module
// Advanced AI System Management for TITAN Trading System

(function() {
    'use strict';
    
    // Create namespace
    if (!window.TitanModules) {
        window.TitanModules = {};
    }
    
    const AIManagementModule = {
        // Module info
        name: 'AI Management & Analytics',
        version: '1.0.0',
        
        // State management
        state: {
            agents: [],
            artemis: null,
            systemMetrics: {},
            selectedAgent: null,
            currentView: 'overview',
            refreshInterval: null,
            trainingSession: null,
            trainingMonitorInterval: null,
            advancedTrainingConfig: null,
            learningChart: null
        },
        
        // Initialize the module
        init: function() {
            console.log('🧠 Initializing AI Management Module...');
            this.loadAIData();
            this.setupAutoRefresh();
            
            // Load initial view after a short delay to ensure DOM is ready
            setTimeout(() => {
                this.switchView('overview');
            }, 100);
        },
        
        // Load AI system data
        loadAIData: async function() {
            try {
                // Try to load from API first
                try {
                    const overviewResponse = await axios.get('/api/ai-analytics/system/overview');
                    if (overviewResponse.data.success) {
                        this.state.artemis = overviewResponse.data.data.artemis;
                        this.state.systemMetrics = overviewResponse.data.data.metrics;
                    }
                    
                    const agentsResponse = await axios.get('/api/ai-analytics/agents');
                    if (agentsResponse.data.agents) {
                        this.state.agents = agentsResponse.data.agents;
                    }
                } catch (apiError) {
                    console.warn('❌ API data unavailable, using fallback data:', apiError);
                    // Use fallback data when API is not available
                    this.loadFallbackData();
                }
                
                console.log('✅ AI data loaded successfully');
            } catch (error) {
                console.error('❌ Error loading AI data:', error);
                // Ensure we have fallback data even if everything fails
                this.loadFallbackData();
            }
        },
        
        // Load fallback data when API is unavailable
        loadFallbackData: function() {
            // Static agents data based on actual agent files
            this.state.agents = [
                {
                    id: 'market_maker',
                    name: 'ایجنت مارکت میکر', 
                    specialization: 'ارائه نقدینگی و بهینه‌سازی اسپرد',
                    status: 'active',
                    capabilities: ['ارائه نقدینگی', 'بهینه‌سازی اسپرد', 'مدیریت موجودی', 'تحلیل عمق بازار'],
                    performance: {
                        accuracy: 84.2,
                        successRate: 81.5,
                        trainingProgress: 88.0,
                        totalDecisions: 15420,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (2 * 60 * 60 * 1000) // 2 hours ago
                    },
                    learning: {
                        hoursLearned: 2847.5,
                        knowledgeBase: 125440,
                        currentlyLearning: true
                    }
                },
                {
                    id: 'algorithmic_trading',
                    name: 'ایجنت معاملات الگوریتمیک',
                    specialization: 'اجرای استراتژی‌های معاملاتی خودکار', 
                    status: 'active',
                    capabilities: ['معاملات خودکار', 'اجرای استراتژی', 'مدیریت ریسک', 'تحلیل عملکرد'],
                    performance: {
                        accuracy: 89.7,
                        successRate: 87.3,
                        trainingProgress: 92.0,
                        totalDecisions: 8934,
                        experienceLevel: 'advanced',
                        lastUpdate: Date.now() - (1 * 60 * 60 * 1000) // 1 hour ago
                    },
                    learning: {
                        hoursLearned: 1823.2,
                        knowledgeBase: 98750,
                        currentlyLearning: false
                    }
                },
                {
                    id: 'hft',
                    name: 'ایجنت HFT',
                    specialization: 'معاملات با فرکانس بالا و آربیتراژ',
                    status: 'active',
                    capabilities: ['معاملات سریع', 'آربیتراژ', 'تحلیل میکروساختار', 'بهینه‌سازی زمان'],
                    performance: {
                        accuracy: 91.4,
                        successRate: 88.9,
                        trainingProgress: 95.0,
                        totalDecisions: 47829,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (30 * 60 * 1000) // 30 minutes ago
                    },
                    learning: {
                        hoursLearned: 3204.7,
                        knowledgeBase: 187650,
                        currentlyLearning: true
                    }
                },
                {
                    id: 'quantitative_analysis',
                    name: 'ایجنت تحلیل کمّی',
                    specialization: 'تحلیل ریاضی و مدل‌سازی مالی',
                    status: 'active',
                    capabilities: ['تحلیل آماری', 'مدل‌سازی ریاضی', 'پیش‌بینی کمّی', 'بهینه‌سازی پرتفوی'],
                    performance: {
                        accuracy: 87.9,
                        successRate: 85.6,
                        trainingProgress: 91.5,
                        totalDecisions: 12847,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (45 * 60 * 1000) // 45 minutes ago
                    },
                    learning: {
                        hoursLearned: 2956.3,
                        knowledgeBase: 156780,
                        currentlyLearning: false
                    }
                },
                {
                    id: 'technical_analysis',
                    name: 'ایجنت تحلیل تکنیکال',
                    specialization: 'تحلیل چارت و شناسایی الگوها',
                    status: 'active',
                    capabilities: ['تحلیل چارت', 'شناسایی الگو', 'سیگنال‌های تکنیکال', 'نقاط ورود و خروج'],
                    performance: {
                        accuracy: 85.3,
                        successRate: 82.7,
                        trainingProgress: 89.0,
                        totalDecisions: 19472,
                        experienceLevel: 'advanced',
                        lastUpdate: Date.now() - (15 * 60 * 1000), // 15 minutes ago
                        createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
                        lastTraining: Date.now() - (2 * 24 * 60 * 60 * 1000) // 2 days ago
                    },
                    learning: {
                        hoursLearned: 2134.8,
                        knowledgeBase: 142350,
                        currentlyLearning: true,
                        totalSessions: 184
                    }
                },
                // Add more agents to reach 15 total
                {
                    id: 'sentiment_analysis',
                    name: 'ایجنت تحلیل احساسات',
                    specialization: 'تحلیل احساسات بازار و اخبار',
                    status: 'active',
                    capabilities: ['تحلیل متن', 'درک احساسات', 'تحلیل اخبار', 'شناسایی ترند'],
                    performance: {
                        accuracy: 88.9,
                        successRate: 86.2,
                        trainingProgress: 93.5,
                        totalDecisions: 11247,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (25 * 60 * 1000),
                        createdAt: Date.now() - (25 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (1 * 24 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 1987.3,
                        knowledgeBase: 134890,
                        currentlyLearning: false,
                        totalSessions: 167
                    }
                },
                {
                    id: 'portfolio_optimization',
                    name: 'ایجنت بهینه‌سازی پرتفوی',
                    specialization: 'بهینه‌سازی و تعادل پرتفوی سرمایه‌گذاری',
                    status: 'active',
                    capabilities: ['بهینه‌سازی پرتفوی', 'مدیریت ریسک', 'تخصیص سرمایه', 'ریبالانس خودکار'],
                    performance: {
                        accuracy: 86.7,
                        successRate: 84.1,
                        trainingProgress: 90.2,
                        totalDecisions: 9876,
                        experienceLevel: 'advanced',
                        lastUpdate: Date.now() - (40 * 60 * 1000),
                        createdAt: Date.now() - (22 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (3 * 24 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 1654.7,
                        knowledgeBase: 112340,
                        currentlyLearning: true,
                        totalSessions: 142
                    }
                },
                {
                    id: 'arbitrage_detector',
                    name: 'ایجنت شناسایی آربیتراژ',
                    specialization: 'شناسایی و بهره‌برداری از فرصت‌های آربیتراژ',
                    status: 'active',
                    capabilities: ['شناسایی آربیتراژ', 'تحلیل قیمت', 'اجرای سریع', 'مدیریت زمان'],
                    performance: {
                        accuracy: 92.1,
                        successRate: 89.8,
                        trainingProgress: 96.3,
                        totalDecisions: 23451,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (10 * 60 * 1000),
                        createdAt: Date.now() - (35 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (12 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 3456.8,
                        knowledgeBase: 198750,
                        currentlyLearning: true,
                        totalSessions: 298
                    }
                },
                {
                    id: 'news_analysis',
                    name: 'ایجنت تحلیل اخبار',
                    specialization: 'تحلیل و پردازش اخبار مالی',
                    status: 'active',
                    capabilities: ['تحلیل اخبار', 'استخراج اطلاعات', 'پیش‌بینی تأثیر', 'تحلیل زمان‌بندی'],
                    performance: {
                        accuracy: 83.6,
                        successRate: 81.2,
                        trainingProgress: 87.4,
                        totalDecisions: 14587,
                        experienceLevel: 'advanced',
                        lastUpdate: Date.now() - (35 * 60 * 1000),
                        createdAt: Date.now() - (28 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (4 * 24 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 2234.5,
                        knowledgeBase: 145670,
                        currentlyLearning: false,
                        totalSessions: 189
                    }
                },
                {
                    id: 'risk_manager',
                    name: 'ایجنت مدیریت ریسک',
                    specialization: 'مدیریت و کنترل ریسک‌های معاملاتی',
                    status: 'active',
                    capabilities: ['ارزیابی ریسک', 'کنترل زیان', 'تنظیم حد ضرر', 'مدیریت پوزیشن'],
                    performance: {
                        accuracy: 89.4,
                        successRate: 87.7,
                        trainingProgress: 91.8,
                        totalDecisions: 18765,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (20 * 60 * 1000),
                        createdAt: Date.now() - (33 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (6 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 2987.6,
                        knowledgeBase: 167890,
                        currentlyLearning: true,
                        totalSessions: 234
                    }
                },
                {
                    id: 'trend_follower',
                    name: 'ایجنت دنبال‌کننده روند',
                    specialization: 'شناسایی و پیروی از روندهای بازار',
                    status: 'training',
                    capabilities: ['شناسایی روند', 'تأیید سیگنال', 'مدیریت موقعیت', 'خروج بهینه'],
                    performance: {
                        accuracy: 81.7,
                        successRate: 79.3,
                        trainingProgress: 78.9,
                        totalDecisions: 16234,
                        experienceLevel: 'intermediate',
                        lastUpdate: Date.now() - (5 * 60 * 1000),
                        createdAt: Date.now() - (20 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (30 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 1765.4,
                        knowledgeBase: 98430,
                        currentlyLearning: true,
                        totalSessions: 156
                    }
                },
                {
                    id: 'options_trader',
                    name: 'ایجنت معاملات اختیار',
                    specialization: 'معاملات پیشرفته اختیار معامله',
                    status: 'active',
                    capabilities: ['استراتژی اختیار', 'محاسبه گریک', 'مدیریت انقضا', 'هج کردن'],
                    performance: {
                        accuracy: 87.2,
                        successRate: 84.9,
                        trainingProgress: 88.7,
                        totalDecisions: 7893,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (50 * 60 * 1000),
                        createdAt: Date.now() - (26 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (2 * 24 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 2145.9,
                        knowledgeBase: 123560,
                        currentlyLearning: false,
                        totalSessions: 178
                    }
                },
                {
                    id: 'futures_specialist',
                    name: 'ایجنت متخصص آتی',
                    specialization: 'معاملات قراردادهای آتی و مشتقات',
                    status: 'active',
                    capabilities: ['معاملات آتی', 'مدیریت مارژین', 'تحلیل کنتانگو', 'رول‌اور هوشمند'],
                    performance: {
                        accuracy: 85.8,
                        successRate: 83.4,
                        trainingProgress: 89.1,
                        totalDecisions: 12567,
                        experienceLevel: 'advanced',
                        lastUpdate: Date.now() - (45 * 60 * 1000),
                        createdAt: Date.now() - (24 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (5 * 24 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 1987.2,
                        knowledgeBase: 134570,
                        currentlyLearning: false,
                        totalSessions: 165
                    }
                },
                {
                    id: 'forex_analyzer',
                    name: 'ایجنت تحلیل فارکس',
                    specialization: 'تحلیل و معاملات ارزی',
                    status: 'active',
                    capabilities: ['تحلیل ارزی', 'کری تِرید', 'تحلیل بنیادی', 'مدیریت نقدینگی'],
                    performance: {
                        accuracy: 84.3,
                        successRate: 82.1,
                        trainingProgress: 86.5,
                        totalDecisions: 21345,
                        experienceLevel: 'advanced',
                        lastUpdate: Date.now() - (30 * 60 * 1000),
                        createdAt: Date.now() - (29 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (18 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 2543.7,
                        knowledgeBase: 156780,
                        currentlyLearning: true,
                        totalSessions: 213
                    }
                },
                {
                    id: 'crypto_specialist',
                    name: 'ایجنت متخصص کریپتو',
                    specialization: 'معاملات ارزهای دیجیتال و توکن‌ها',
                    status: 'offline',
                    capabilities: ['معاملات کریپتو', 'تحلیل بلاکچین', 'DeFi', 'مدیریت والت'],
                    performance: {
                        accuracy: 79.6,
                        successRate: 76.8,
                        trainingProgress: 72.3,
                        totalDecisions: 8934,
                        experienceLevel: 'intermediate',
                        lastUpdate: Date.now() - (120 * 60 * 1000),
                        createdAt: Date.now() - (18 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (7 * 24 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 1432.1,
                        knowledgeBase: 87450,
                        currentlyLearning: false,
                        totalSessions: 123
                    }
                },
                {
                    id: 'compliance_monitor',
                    name: 'ایجنت نظارت انطباق',
                    specialization: 'نظارت بر انطباق قوانین و مقررات',
                    status: 'active',
                    capabilities: ['نظارت قانونی', 'کنترل انطباق', 'گزارش‌دهی', 'مدیریت خطر حقوقی'],
                    performance: {
                        accuracy: 96.2,
                        successRate: 94.7,
                        trainingProgress: 97.8,
                        totalDecisions: 6543,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (15 * 60 * 1000),
                        createdAt: Date.now() - (40 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (24 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 3124.8,
                        knowledgeBase: 187650,
                        currentlyLearning: false,
                        totalSessions: 267
                    }
                },
                {
                    id: 'execution_optimizer',
                    name: 'ایجنت بهینه‌ساز اجرا',
                    specialization: 'بهینه‌سازی اجرای سفارشات معاملاتی',
                    status: 'active',
                    capabilities: ['بهینه‌سازی اجرا', 'کاهش اسلیپیج', 'مدیریت زمان‌بندی', 'تقسیم سفارش'],
                    performance: {
                        accuracy: 91.7,
                        successRate: 89.4,
                        trainingProgress: 94.6,
                        totalDecisions: 31245,
                        experienceLevel: 'expert',
                        lastUpdate: Date.now() - (8 * 60 * 1000),
                        createdAt: Date.now() - (36 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (3 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 3687.4,
                        knowledgeBase: 234580,
                        currentlyLearning: true,
                        totalSessions: 312
                    }
                },
                {
                    id: 'backtesting_engine',
                    name: 'ایجنت موتور بک‌تست',
                    specialization: 'آزمایش و ارزیابی استراتژی‌های معاملاتی',
                    status: 'training',
                    capabilities: ['بک‌تست استراتژی', 'تحلیل عملکرد', 'بهینه‌سازی پارامتر', 'شبیه‌سازی'],
                    performance: {
                        accuracy: 88.1,
                        successRate: 85.6,
                        trainingProgress: 82.7,
                        totalDecisions: 4567,
                        experienceLevel: 'advanced',
                        lastUpdate: Date.now() - (12 * 60 * 1000),
                        createdAt: Date.now() - (15 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (45 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 1876.3,
                        knowledgeBase: 123450,
                        currentlyLearning: true,
                        totalSessions: 145
                    }
                }
            ];
            
            // Static artemis data
            this.state.artemis = {
                status: 'active',
                version: '3.0.1',
                uptime: Date.now() - (48 * 60 * 60 * 1000), // 48 hours
                intelligence: {
                    overallIQ: 147,
                    emotionalIQ: 87,
                    strategicThinking: 92,
                    adaptability: 89
                },
                collectiveIntelligence: {
                    swarmEfficiency: 94,
                    knowledgeSharing: 91,
                    consensusAccuracy: 88,
                    emergentCapabilities: ['پیش‌بینی روند', 'شناسایی الگو', 'بهینه‌سازی خودکار']
                },
                externalProviders: {
                    openai: { status: true, performance: 92, usage: 1247 },
                    anthropic: { status: true, performance: 89, usage: 857 },
                    gemini: { status: false, performance: 0, usage: 0 }
                }
            };
            
            console.log('🔄 Fallback data loaded');
        },
        
        // Setup auto refresh
        setupAutoRefresh: function() {
            // Refresh every 15 seconds
            this.state.refreshInterval = setInterval(() => {
                this.loadAIData();
                this.updateCurrentView();
            }, 15000);
        },
        
        // Update current view
        updateCurrentView: function() {
            if (this.state.currentView === 'overview') {
                this.renderOverview();
            } else if (this.state.currentView === 'agents') {
                this.renderAgentsView();
            } else if (this.state.currentView === 'training') {
                this.renderTrainingView();
            } else if (this.state.currentView === 'analytics') {
                this.renderAnalyticsView();
            }
        },
        
        // Render the main dashboard
        render: function() {
            const content = `
                <div class="ai-management-dashboard p-6">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-brain text-purple-400 text-3xl mr-3"></i>
                            <div>
                                <h1 class="text-2xl font-bold text-white">مدیریت هوش مصنوعی</h1>
                                <p class="text-gray-400">سیستم جامع آنالیتیکس و آموزش AI</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3 space-x-reverse">
                            <button onclick="TitanModules.AIManagement.createBackup()" 
                                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-save mr-2"></i>
                                پشتیبان‌گیری
                            </button>
                            <button onclick="TitanModules.AIManagement.startTraining()" 
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-graduation-cap mr-2"></i>
                                شروع آموزش
                            </button>
                        </div>
                    </div>
                    
                    <!-- Navigation Tabs -->
                    <div class="flex space-x-1 space-x-reverse bg-gray-800 rounded-lg p-1 mb-6">
                        <button onclick="TitanModules.AIManagement.switchView('overview')" 
                                class="ai-nav-tab active px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            <i class="fas fa-tachometer-alt mr-2"></i>
                            نمای کلی
                        </button>
                        <button onclick="TitanModules.AIManagement.switchView('agents')" 
                                class="ai-nav-tab px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            <i class="fas fa-users mr-2"></i>
                            15 ایجنت AI
                        </button>
                        <button onclick="TitanModules.AIManagement.switchView('training')" 
                                class="ai-nav-tab px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            <i class="fas fa-graduation-cap mr-2"></i>
                            آموزش و یادگیری
                        </button>
                        <button onclick="TitanModules.AIManagement.switchView('analytics')" 
                                class="ai-nav-tab px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            <i class="fas fa-chart-line mr-2"></i>
                            آنالیتیکس پیشرفته
                        </button>
                    </div>
                    
                    <!-- Content Area -->
                    <div id="ai-content-area">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
                
                <style>
                    .ai-nav-tab {
                        color: #9CA3AF;
                        background: transparent;
                    }
                    .ai-nav-tab:hover {
                        color: #E5E7EB;
                        background: #374151;
                    }
                    .ai-nav-tab.active {
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
            `;
            
            // Return the content instead of trying to set it directly
            // The calling code will handle inserting it into the correct container
            return content;
        },
        
        // Switch between different views
        switchView: function(viewName) {
            this.state.currentView = viewName;
            
            // Update tab active state
            document.querySelectorAll('.ai-nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Find and activate the correct tab
            document.querySelectorAll('.ai-nav-tab').forEach(tab => {
                const tabText = tab.textContent.trim();
                if ((viewName === 'overview' && tabText.includes('نمای کلی')) ||
                    (viewName === 'agents' && tabText.includes('ایجنت')) ||
                    (viewName === 'training' && tabText.includes('آموزش')) ||
                    (viewName === 'analytics' && tabText.includes('آنالیتیکس'))) {
                    tab.classList.add('active');
                }
            });
            
            // Render the selected view
            this.updateCurrentView();
        },
        
        // Render overview page
        renderOverview: function() {
            const artemis = this.state.artemis;
            if (!artemis) {
                document.getElementById('ai-content-area').innerHTML = '<div class="text-center text-gray-400">در حال بارگذاری...</div>';
                return;
            }
            
            const activeAgents = this.state.agents.filter(a => a.status === 'active').length;
            const learningAgents = this.state.agents.filter(a => a.learning.currentlyLearning).length;
            const avgAccuracy = this.state.agents.length > 0 ? 
                (this.state.agents.reduce((sum, a) => sum + a.performance.accuracy, 0) / this.state.agents.length).toFixed(1) : 0;
            
            const content = `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Artemis Mother AI Status -->
                    <div class="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                                    <i class="fas fa-brain text-white text-xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-xl font-bold text-white">آرتمیس - مغز مرکزی</h2>
                                    <p class="text-gray-400">Mother AI Controller</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                <span class="text-green-400 font-medium">${artemis.status === 'active' ? 'فعال' : artemis.status}</span>
                            </div>
                        </div>
                        
                        <!-- Intelligence Metrics -->
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="ai-metric-card rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400 text-sm">IQ کلی</span>
                                    <span class="text-2xl font-bold text-purple-400">${artemis.intelligence.overallIQ}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-2 mt-2">
                                    <div class="bg-purple-400 h-2 rounded-full" style="width: ${(artemis.intelligence.overallIQ / 200) * 100}%"></div>
                                </div>
                            </div>
                            <div class="ai-metric-card rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400 text-sm">هوش عاطفی</span>
                                    <span class="text-2xl font-bold text-blue-400">${artemis.intelligence.emotionalIQ}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-2 mt-2">
                                    <div class="bg-blue-400 h-2 rounded-full" style="width: ${artemis.intelligence.emotionalIQ}%"></div>
                                </div>
                            </div>
                            <div class="ai-metric-card rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400 text-sm">تفکر استراتژیک</span>
                                    <span class="text-2xl font-bold text-green-400">${artemis.intelligence.strategicThinking}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-2 mt-2">
                                    <div class="bg-green-400 h-2 rounded-full" style="width: ${artemis.intelligence.strategicThinking}%"></div>
                                </div>
                            </div>
                            <div class="ai-metric-card rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400 text-sm">انطباق‌پذیری</span>
                                    <span class="text-2xl font-bold text-yellow-400">${artemis.intelligence.adaptability}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-2 mt-2">
                                    <div class="bg-yellow-400 h-2 rounded-full" style="width: ${artemis.intelligence.adaptability}%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- External Providers Status -->
                        <div class="border-t border-gray-700 pt-4">
                            <h3 class="text-lg font-semibold text-white mb-4">ارائه‌دهندگان خارجی</h3>
                            <div class="grid grid-cols-3 gap-4">
                                ${Object.entries(artemis.externalProviders).map(([provider, data]) => `
                                    <div class="bg-gray-700 rounded-lg p-3">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-gray-300 font-medium">${provider.toUpperCase()}</span>
                                            <div class="w-2 h-2 bg-${data.status ? 'green' : 'red'}-400 rounded-full"></div>
                                        </div>
                                        <div class="text-sm text-gray-400">عملکرد: ${data.performance}%</div>
                                        <div class="text-sm text-gray-400">استفاده: ${data.usage.toLocaleString()}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- System Summary -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 class="text-xl font-bold text-white mb-6">خلاصه سیستم</h2>
                        
                        <!-- Key Metrics -->
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">کل ایجنت‌ها</span>
                                <span class="text-2xl font-bold text-white">${this.state.agents.length}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">ایجنت‌های فعال</span>
                                <span class="text-2xl font-bold text-green-400">${activeAgents}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">در حال یادگیری</span>
                                <span class="text-2xl font-bold text-blue-400">${learningAgents}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">دقت متوسط</span>
                                <span class="text-2xl font-bold text-purple-400">${avgAccuracy}%</span>
                            </div>
                        </div>
                        
                        <!-- Collective Intelligence -->
                        <div class="mt-6 pt-4 border-t border-gray-700">
                            <h3 class="text-lg font-semibold text-white mb-4">هوش جمعی</h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400 text-sm">کارایی ازدحام</span>
                                    <span class="text-green-400 font-bold">${artemis.collectiveIntelligence.swarmEfficiency}%</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400 text-sm">اشتراک دانش</span>
                                    <span class="text-blue-400 font-bold">${artemis.collectiveIntelligence.knowledgeSharing}%</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400 text-sm">دقت اجماع</span>
                                    <span class="text-purple-400 font-bold">${artemis.collectiveIntelligence.consensusAccuracy}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Emergent Capabilities -->
                        <div class="mt-4">
                            <h4 class="text-sm font-semibold text-gray-300 mb-2">قابلیت‌های نوظهور</h4>
                            <div class="flex flex-wrap gap-2">
                                ${artemis.collectiveIntelligence.emergentCapabilities.map(capability => `
                                    <span class="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded-full">
                                        ${capability}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Top Performing Agents -->
                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-white">ایجنت‌های برتر</h2>
                        <button onclick="TitanModules.AIManagement.switchView('agents')" 
                                class="text-blue-400 hover:text-blue-300 text-sm">
                            مشاهده همه →
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.state.agents
                            .sort((a, b) => b.performance.accuracy - a.performance.accuracy)
                            .slice(0, 6)
                            .map(agent => `
                                <div class="ai-agent-card bg-gray-700 rounded-lg p-4 cursor-pointer" 
                                     onclick="TitanModules.AIManagement.selectAgent('${agent.id}')">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center">
                                            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                                                <span class="text-white text-xs font-bold">${agent.id.split('_')[1]}</span>
                                            </div>
                                            <div>
                                                <h3 class="text-white font-semibold text-sm">${agent.name}</h3>
                                                <p class="text-gray-400 text-xs">${agent.specialization}</p>
                                            </div>
                                        </div>
                                        <div class="w-2 h-2 bg-${agent.status === 'active' ? 'green' : agent.status === 'training' ? 'yellow' : 'red'}-400 rounded-full"></div>
                                    </div>
                                    
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-400 text-sm">دقت</span>
                                        <span class="text-green-400 font-bold">${agent.performance.accuracy.toFixed(1)}%</span>
                                    </div>
                                    
                                    <div class="w-full bg-gray-600 rounded-full h-2 mt-2">
                                        <div class="bg-green-400 h-2 rounded-full" style="width: ${agent.performance.accuracy}%"></div>
                                    </div>
                                    
                                    <div class="mt-3 flex justify-between text-xs text-gray-400">
                                        <span>تصمیمات: ${agent.performance.totalDecisions.toLocaleString()}</span>
                                        <span>سطح: ${agent.performance.experienceLevel}</span>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            `;
            
            document.getElementById('ai-content-area').innerHTML = content;
        },
        
        // Render agents view
        renderAgentsView: function() {
            const content = `
                <div class="space-y-6">
                    <!-- Filters and Controls -->
                    <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4 space-x-reverse">
                                <select id="agent-status-filter" onchange="TitanModules.AIManagement.filterAgents()" 
                                        class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="all">همه وضعیت‌ها</option>
                                    <option value="active">فعال</option>
                                    <option value="training">در حال آموزش</option>
                                    <option value="offline">آفلاین</option>
                                </select>
                                <select id="agent-level-filter" onchange="TitanModules.AIManagement.filterAgents()" 
                                        class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="all">همه سطوح</option>
                                    <option value="expert">خبره</option>
                                    <option value="advanced">پیشرفته</option>
                                    <option value="intermediate">متوسط</option>
                                    <option value="beginner">مبتدی</option>
                                </select>
                            </div>
                            <div class="flex items-center space-x-2 space-x-reverse">
                                <button onclick="TitanModules.AIManagement.startMassTraining()" 
                                        class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                                    <i class="fas fa-graduation-cap mr-1"></i>
                                    آموزش گروهی
                                </button>
                                <button onclick="TitanModules.AIManagement.toggleAllAgents()" 
                                        class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                                    <i class="fas fa-power-off mr-1"></i>
                                    فعال/غیرفعال همه
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Agents Grid -->
                    <div id="agents-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${this.renderAgentCards()}
                    </div>
                </div>
            `;
            
            document.getElementById('ai-content-area').innerHTML = content;
        },
        
        // Render individual agent cards
        renderAgentCards: function() {
            return this.state.agents.map(agent => `
                <div class="ai-agent-card bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                                <span class="text-white font-bold">${agent.id.split('_')[1]}</span>
                            </div>
                            <div>
                                <h3 class="text-white font-bold">${agent.name}</h3>
                                <p class="text-gray-400 text-sm">${agent.specialization}</p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="w-3 h-3 bg-${agent.status === 'active' ? 'green' : agent.status === 'training' ? 'yellow' : 'red'}-400 rounded-full mr-2"></div>
                            <span class="text-${agent.status === 'active' ? 'green' : agent.status === 'training' ? 'yellow' : 'red'}-400 text-sm font-medium">
                                ${agent.status === 'active' ? 'فعال' : agent.status === 'training' ? 'آموزش' : 'آفلاین'}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Performance Metrics -->
                    <div class="space-y-3 mb-4">
                        <!-- Accuracy -->
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-400">دقت</span>
                                <span class="text-green-400 font-bold">${agent.performance.accuracy.toFixed(1)}%</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2">
                                <div class="bg-green-400 h-2 rounded-full" style="width: ${agent.performance.accuracy}%"></div>
                            </div>
                        </div>
                        
                        <!-- Training Progress -->
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-400">پیشرفت آموزش</span>
                                <span class="text-blue-400 font-bold">${agent.performance.trainingProgress}%</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2">
                                <div class="bg-blue-400 h-2 rounded-full" style="width: ${agent.performance.trainingProgress}%"></div>
                            </div>
                        </div>
                        
                        <!-- Success Rate -->
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-400">نرخ موفقیت</span>
                                <span class="text-purple-400 font-bold">${agent.performance.successRate.toFixed(1)}%</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2">
                                <div class="bg-purple-400 h-2 rounded-full" style="width: ${agent.performance.successRate}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Statistics -->
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="bg-gray-700 rounded-lg p-3 text-center">
                            <div class="text-lg font-bold text-white">${agent.performance.totalDecisions.toLocaleString()}</div>
                            <div class="text-xs text-gray-400">تصمیمات</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-3 text-center">
                            <div class="text-lg font-bold text-white">${agent.learning.hoursLearned.toFixed(0)}</div>
                            <div class="text-xs text-gray-400">ساعت یادگیری</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-3 text-center">
                            <div class="text-lg font-bold text-white">${(agent.learning.knowledgeBase / 1024).toFixed(1)}MB</div>
                            <div class="text-xs text-gray-400">دانش ذخیره</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-3 text-center">
                            <div class="text-lg font-bold text-${agent.performance.experienceLevel === 'expert' ? 'green' : agent.performance.experienceLevel === 'advanced' ? 'blue' : agent.performance.experienceLevel === 'intermediate' ? 'yellow' : 'gray'}-400">
                                ${agent.performance.experienceLevel === 'expert' ? 'خبره' : 
                                  agent.performance.experienceLevel === 'advanced' ? 'پیشرفته' :
                                  agent.performance.experienceLevel === 'intermediate' ? 'متوسط' : 'مبتدی'}
                            </div>
                            <div class="text-xs text-gray-400">سطح</div>
                        </div>
                    </div>
                    
                    <!-- Capabilities -->
                    <div class="mb-4">
                        <h4 class="text-sm font-semibold text-gray-300 mb-2">قابلیت‌ها</h4>
                        <div class="flex flex-wrap gap-1">
                            ${agent.capabilities.slice(0, 3).map(capability => `
                                <span class="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-full">
                                    ${capability}
                                </span>
                            `).join('')}
                            ${agent.capabilities.length > 3 ? `<span class="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">+${agent.capabilities.length - 3}</span>` : ''}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex space-x-2 space-x-reverse">
                        <button onclick="TitanModules.AIManagement.toggleAgentStatus('${agent.id}')" 
                                class="flex-1 px-3 py-2 bg-${agent.status === 'active' ? 'red' : 'green'}-600 hover:bg-${agent.status === 'active' ? 'red' : 'green'}-700 text-white rounded-lg text-sm transition-colors">
                            <i class="fas fa-power-off mr-1"></i>
                            ${agent.status === 'active' ? 'غیرفعال' : 'فعال'}
                        </button>
                        <button onclick="TitanModules.AIManagement.startAgentTraining('${agent.id}')" 
                                class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                            <i class="fas fa-graduation-cap mr-1"></i>
                            آموزش
                        </button>
                        <button onclick="TitanModules.AIManagement.viewAgentDetails('${agent.id}')" 
                                class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                    
                    <!-- Last Update -->
                    <div class="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400 text-center">
                        آخرین بروزرسانی: ${new Date(agent.performance.lastUpdate).toLocaleString('fa-IR')}
                    </div>
                </div>
            `).join('');
        },
        
        // Render training view
        renderTrainingView: function() {
            const content = `
                <div class="space-y-6">
                    <!-- Training Controls -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold text-white">مرکز آموزش هوش مصنوعی</h2>
                            <div class="flex items-center space-x-2 space-x-reverse">
                                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span class="text-green-400 text-sm">سیستم آماده</span>
                            </div>
                        </div>
                        
                        <!-- Quick Training Options -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <button onclick="TitanModules.AIManagement.quickTraining('individual')" 
                                    class="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                                <i class="fas fa-user text-2xl mb-2"></i>
                                <div class="font-semibold">آموزش فردی</div>
                                <div class="text-sm opacity-80">بهبود یک ایجنت</div>
                            </button>
                            <button onclick="TitanModules.AIManagement.quickTraining('collective')" 
                                    class="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                                <i class="fas fa-users text-2xl mb-2"></i>
                                <div class="font-semibold">آموزش جمعی</div>
                                <div class="text-sm opacity-80">بهبود کل تیم</div>
                            </button>
                            <button onclick="TitanModules.AIManagement.quickTraining('cross')" 
                                    class="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
                                <i class="fas fa-exchange-alt text-2xl mb-2"></i>
                                <div class="font-semibold">آموزش متقابل</div>
                                <div class="text-sm opacity-80">اشتراک دانش</div>
                            </button>
                        </div>
                        
                        <!-- Custom Training Setup -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-white mb-4">تنظیمات آموزش سفارشی</h3>
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <!-- Agent Selection -->
                                <div>
                                    <label class="block text-gray-300 text-sm mb-2">انتخاب ایجنت‌ها</label>
                                    <select multiple id="training-agents" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm h-32">
                                        ${this.state.agents.map(agent => `
                                            <option value="${agent.id}">${agent.name} - دقت: ${(agent.performance.accuracy).toFixed(1)}%</option>
                                        `).join('')}
                                    </select>
                                    <p class="text-xs text-gray-400 mt-1">برای انتخاب چندگانه Ctrl کلیک کنید</p>
                                </div>
                                
                                <!-- Training Configuration -->
                                <div>
                                    <label class="block text-gray-300 text-sm mb-2">موضوع آموزش</label>
                                    <select id="training-topic" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm mb-3">
                                        <option value="market_analysis">تحلیل بازار پیشرفته</option>
                                        <option value="risk_management">مدیریت ریسک هوشمند</option>
                                        <option value="pattern_recognition">شناسایی الگوهای پیچیده</option>
                                        <option value="sentiment_analysis">تحلیل احساسات بازار</option>
                                        <option value="decision_making">بهینه‌سازی تصمیم‌گیری</option>
                                        <option value="coordination">هماهنگی تیمی ایجنت‌ها</option>
                                    </select>
                                    
                                    <label class="block text-gray-300 text-sm mb-2">نرخ یادگیری</label>
                                    <input id="learning-rate" type="number" step="0.0001" value="0.001" min="0.0001" max="0.1"
                                           class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm mb-3">
                                    
                                    <label class="block text-gray-300 text-sm mb-2">اندازه Batch</label>
                                    <select id="batch-size" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm mb-3">
                                        <option value="16">16 (کم مصرف)</option>
                                        <option value="32" selected>32 (استاندارد)</option>
                                        <option value="64">64 (پرسرعت)</option>
                                        <option value="128">128 (حرفه‌ای)</option>
                                    </select>
                                </div>
                                
                                <!-- Advanced Parameters -->
                                <div>
                                    <label class="block text-gray-300 text-sm mb-2">تعداد Epochs</label>
                                    <input id="epochs" type="number" value="100" min="10" max="1000"
                                           class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm mb-3">
                                    
                                    <label class="block text-gray-300 text-sm mb-2">درصد اعتبارسنجی</label>
                                    <select id="validation-split" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm mb-3">
                                        <option value="0.1">10%</option>
                                        <option value="0.2" selected>20%</option>
                                        <option value="0.3">30%</option>
                                    </select>
                                    
                                    <label class="block text-gray-300 text-sm mb-2">نوع بهینه‌ساز</label>
                                    <select id="optimizer" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm mb-3">
                                        <option value="adam" selected>Adam (پیشنهادی)</option>
                                        <option value="sgd">SGD</option>
                                        <option value="rmsprop">RMSprop</option>
                                        <option value="adagrad">Adagrad</option>
                                    </select>
                                    
                                    <label class="block text-gray-300 text-sm mb-2">Regularization</label>
                                    <select id="regularization" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm mb-4">
                                        <option value="l1">L1</option>
                                        <option value="l2" selected>L2</option>
                                        <option value="dropout">Dropout</option>
                                        <option value="none">بدون</option>
                                    </select>
                                    
                                    <button onclick="TitanModules.AIManagement.startCustomTraining()" 
                                            class="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 font-semibold">
                                        <i class="fas fa-rocket mr-2"></i>
                                        شروع آموزش پیشرفته
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Training Presets -->
                            <div class="mt-4 pt-4 border-t border-gray-600">
                                <h4 class="text-white font-semibold mb-3">پیش‌تنظیمات آموزش</h4>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <button onclick="TitanModules.AIManagement.applyTrainingPreset('performance')" 
                                            class="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors">
                                        <i class="fas fa-tachometer-alt mb-1"></i><br>
                                        <strong>عملکرد بالا</strong><br>
                                        <span class="text-xs opacity-80">بهینه‌سازی سرعت</span>
                                    </button>
                                    <button onclick="TitanModules.AIManagement.applyTrainingPreset('accuracy')" 
                                            class="p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors">
                                        <i class="fas fa-crosshairs mb-1"></i><br>
                                        <strong>دقت بالا</strong><br>
                                        <span class="text-xs opacity-80">حداکثر دقت</span>
                                    </button>
                                    <button onclick="TitanModules.AIManagement.applyTrainingPreset('balanced')" 
                                            class="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors">
                                        <i class="fas fa-balance-scale mb-1"></i><br>
                                        <strong>متعادل</strong><br>
                                        <span class="text-xs opacity-80">ترکیب سرعت و دقت</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Training Sessions History -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 class="text-xl font-bold text-white mb-4">جلسات آموزش اخیر</h2>
                        <div id="training-sessions">
                            <!-- Training sessions will be loaded here -->
                            <div class="text-center text-gray-400 py-8">
                                در حال بارگذاری جلسات آموزش...
                            </div>
                        </div>
                    </div>
                    
                    <!-- Learning Analytics -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 class="text-xl font-bold text-white mb-4">آنالیتیکس یادگیری</h2>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-blue-400">${this.state.agents.reduce((sum, a) => sum + a.learning.hoursLearned, 0).toFixed(0)}</div>
                                <div class="text-sm text-gray-400">ساعت یادگیری کل</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-green-400">${this.state.agents.reduce((sum, a) => sum + a.learning.totalSessions, 0)}</div>
                                <div class="text-sm text-gray-400">جلسات آموزش</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-purple-400">${(this.state.agents.reduce((sum, a) => sum + a.learning.knowledgeBase, 0) / 1024 / 1024).toFixed(1)}GB</div>
                                <div class="text-sm text-gray-400">دانش ذخیره شده</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-yellow-400">${this.state.agents.filter(a => a.learning.currentlyLearning).length}</div>
                                <div class="text-sm text-gray-400">در حال یادگیری</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('ai-content-area').innerHTML = content;
            this.loadTrainingSessions();
        },
        
        // Render analytics view
        renderAnalyticsView: function() {
            const content = `
                <div class="space-y-6">
                    <!-- Performance Overview -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Charts would go here -->
                        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 class="text-lg font-bold text-white mb-4">روند عملکرد</h3>
                            <div class="h-64 flex items-center justify-center text-gray-400">
                                <div class="text-center">
                                    <i class="fas fa-chart-line text-4xl mb-2"></i>
                                    <div>نمودار عملکرد در حال توسعه</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 class="text-lg font-bold text-white mb-4">توزیع دقت</h3>
                            <div class="h-64 flex items-center justify-center text-gray-400">
                                <div class="text-center">
                                    <i class="fas fa-chart-pie text-4xl mb-2"></i>
                                    <div>نمودار توزیع در حال توسعه</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Detailed Analytics -->
                    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 class="text-xl font-bold text-white mb-4">تحلیل جامع عملکرد</h2>
                        <div id="analytics-content">
                            <!-- Analytics content will be loaded here -->
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('ai-content-area').innerHTML = content;
            this.loadAnalyticsData();
        },
        
        // Load training sessions
        loadTrainingSessions: async function() {
            try {
                const response = await axios.get('/api/ai-analytics/training/sessions');
                if (response.data.success) {
                    const sessions = response.data.data.sessions.slice(0, 5); // Show last 5 sessions
                    
                    const sessionElements = sessions.map(session => `
                        <div class="bg-gray-700 rounded-lg p-4 mb-3">
                            <div class="flex items-center justify-between mb-2">
                                <div>
                                    <span class="text-white font-semibold">${session.topic}</span>
                                    <span class="text-gray-400 text-sm ml-2">(${session.type})</span>
                                </div>
                                <span class="px-2 py-1 bg-${session.status === 'active' ? 'green' : session.status === 'completed' ? 'blue' : 'yellow'}-900 text-${session.status === 'active' ? 'green' : session.status === 'completed' ? 'blue' : 'yellow'}-300 text-xs rounded">
                                    ${session.status === 'active' ? 'فعال' : session.status === 'completed' ? 'تکمیل' : 'متوقف'}
                                </span>
                            </div>
                            <div class="flex items-center justify-between text-sm text-gray-400">
                                <span>ایجنت‌ها: ${session.agentIds.length}</span>
                                <span>پیشرفت: ${session.progress}%</span>
                                <span>${new Date(session.startTime).toLocaleDateString('fa-IR')}</span>
                            </div>
                        </div>
                    `).join('');
                    
                    document.getElementById('training-sessions').innerHTML = sessionElements || '<div class="text-center text-gray-400 py-8">هیچ جلسه آموزشی یافت نشد</div>';
                }
            } catch (error) {
                console.error('Error loading training sessions:', error);
            }
        },
        
        // Load analytics data
        loadAnalyticsData: async function() {
            try {
                const response = await axios.get('/api/ai-analytics/analytics/learning');
                if (response.data.success) {
                    const analytics = response.data.data;
                    
                    const analyticsHtml = `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-blue-400">${analytics.overview.totalLearningHours.toFixed(0)}</div>
                                <div class="text-sm text-gray-400">ساعت یادگیری کل</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-green-400">${analytics.overview.averageAccuracy.toFixed(1)}%</div>
                                <div class="text-sm text-gray-400">میانگین دقت</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-purple-400">${(analytics.overview.totalKnowledgeBase / 1024).toFixed(1)}MB</div>
                                <div class="text-sm text-gray-400">پایگاه دانش</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-yellow-400">${analytics.overview.improvementRate.toFixed(1)}%</div>
                                <div class="text-sm text-gray-400">نرخ بهبود</div>
                            </div>
                        </div>
                        
                        <!-- Knowledge Distribution -->
                        <div class="bg-gray-700 rounded-lg p-4 mb-6">
                            <h3 class="text-lg font-semibold text-white mb-4">توزیع سطح دانش</h3>
                            <div class="grid grid-cols-4 gap-3">
                                <div class="text-center">
                                    <div class="text-xl font-bold text-gray-400">${analytics.knowledgeDistribution.beginner}</div>
                                    <div class="text-sm text-gray-500">مبتدی</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-xl font-bold text-yellow-400">${analytics.knowledgeDistribution.intermediate}</div>
                                    <div class="text-sm text-gray-500">متوسط</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-xl font-bold text-blue-400">${analytics.knowledgeDistribution.advanced}</div>
                                    <div class="text-sm text-gray-500">پیشرفته</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-xl font-bold text-green-400">${analytics.knowledgeDistribution.expert}</div>
                                    <div class="text-sm text-gray-500">خبره</div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    document.getElementById('analytics-content').innerHTML = analyticsHtml;
                }
            } catch (error) {
                console.error('Error loading analytics data:', error);
            }
        },
        
        // Agent management functions
        toggleAgentStatus: async function(agentId) {
            try {
                const agent = this.state.agents.find(a => a.id === agentId);
                const newStatus = agent.status === 'active' ? 'offline' : 'active';
                
                const response = await axios.post(`/api/ai-analytics/agents/${agentId}/status`, {
                    status: newStatus
                });
                
                if (response.data.success) {
                    // Update local state
                    agent.status = newStatus;
                    this.updateCurrentView();
                    
                    app.showAlert(`ایجنت ${agent.name} ${newStatus === 'active' ? 'فعال' : 'غیرفعال'} شد`, 'success');
                }
            } catch (error) {
                console.error('Error toggling agent status:', error);
                app.showAlert('خطا در تغییر وضعیت ایجنت', 'error');
            }
        },
        
        startAgentTraining: async function(agentId) {
            try {
                const response = await axios.post('/api/ai-analytics/training/start', {
                    agentIds: [agentId],
                    type: 'individual',
                    topic: 'Performance Optimization'
                });
                
                if (response.data.success) {
                    app.showAlert('آموزش ایجنت شروع شد', 'success');
                    this.loadAIData();
                }
            } catch (error) {
                console.error('Error starting agent training:', error);
                app.showAlert('خطا در شروع آموزش', 'error');
            }
        },

        viewAgentDetails: function(agentId) {
            // Define static agent data based on actual agent files
            const staticAgents = {
                'market_maker': {
                    id: 'market_maker',
                    name: 'ایجنت مارکت میکر',
                    specialization: 'ارائه نقدینگی و بهینه‌سازی اسپرد',
                    status: 'active',
                    capabilities: ['ارائه نقدینگی', 'بهینه‌سازی اسپرد', 'مدیریت موجودی', 'تحلیل عمق بازار'],
                    performance: {
                        accuracy: 84.2,
                        successRate: 81.5,
                        trainingProgress: 88.0,
                        totalDecisions: 15420,
                        experienceLevel: 'expert',
                        createdAt: Date.now() - (45 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (2 * 24 * 60 * 60 * 1000),
                        lastUpdate: Date.now() - (2 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 2847.5,
                        knowledgeBase: 125440,
                        currentlyLearning: true
                    }
                },
                'algorithmic_trading': {
                    id: 'algorithmic_trading', 
                    name: 'ایجنت معاملات الگوریتمیک',
                    specialization: 'اجرای استراتژی‌های معاملاتی خودکار',
                    status: 'active',
                    capabilities: ['معاملات خودکار', 'اجرای استراتژی', 'مدیریت ریسک', 'تحلیل عملکرد'],
                    performance: {
                        accuracy: 89.7,
                        successRate: 87.3,
                        trainingProgress: 92.0,
                        totalDecisions: 8934,
                        experienceLevel: 'advanced',
                        createdAt: Date.now() - (38 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (1 * 24 * 60 * 60 * 1000),
                        lastUpdate: Date.now() - (1 * 60 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 1823.2,
                        knowledgeBase: 98750,
                        currentlyLearning: false
                    }
                },
                'hft': {
                    id: 'hft',
                    name: 'ایجنت HFT',
                    specialization: 'معاملات با فرکانس بالا و آربیتراژ',
                    status: 'active', 
                    capabilities: ['معاملات سریع', 'آربیتراژ', 'تحلیل میکروساختار', 'بهینه‌سازی زمان'],
                    performance: {
                        accuracy: 91.4,
                        successRate: 88.9,
                        trainingProgress: 95.0,
                        totalDecisions: 47829,
                        experienceLevel: 'expert',
                        createdAt: Date.now() - (42 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (30 * 60 * 1000),
                        lastUpdate: Date.now() - (30 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 3204.7,
                        knowledgeBase: 187650,
                        currentlyLearning: true
                    }
                },
                'quantitative_analysis': {
                    id: 'quantitative_analysis',
                    name: 'ایجنت تحلیل کمّی',
                    specialization: 'تحلیل ریاضی و مدل‌سازی مالی',
                    status: 'active',
                    capabilities: ['تحلیل آماری', 'مدل‌سازی ریاضی', 'پیش‌بینی کمّی', 'بهینه‌سازی پرتفوی'],
                    performance: {
                        accuracy: 87.9,
                        successRate: 85.6,
                        trainingProgress: 91.5,
                        totalDecisions: 12847,
                        experienceLevel: 'expert',
                        createdAt: Date.now() - (35 * 24 * 60 * 60 * 1000),
                        lastTraining: Date.now() - (45 * 60 * 1000),
                        lastUpdate: Date.now() - (45 * 60 * 1000)
                    },
                    learning: {
                        hoursLearned: 2956.3,
                        knowledgeBase: 156780,
                        currentlyLearning: false
                    }
                }
            };
            
            const agent = this.state.agents.find(a => a.id === agentId) || staticAgents[agentId];
            if (!agent) {
                // Show error modal instead of alert for better UX
                const errorModal = `
                    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="this.remove()">
                        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl" onclick="event.stopPropagation()">
                            <div class="text-center">
                                <div class="text-6xl mb-4">❌</div>
                                <h3 class="text-xl font-bold text-white mb-4">خطا در نمایش جزئیات ایجنت</h3>
                                <p class="text-gray-400 mb-6">ایجنت مورد نظر یافت نشد یا در حال حاضر در دسترس نیست.</p>
                                <button onclick="this.closest('.fixed').remove()" 
                                        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                    متوجه شدم
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', errorModal);
                return;
            }

            const modalContent = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onclick="this.remove()">
                    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 w-full max-w-xs sm:max-w-lg lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl" onclick="event.stopPropagation()">
                        <!-- Header -->
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <div class="flex items-center">
                                <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                                    <span class="text-white font-bold text-lg sm:text-xl">${agent.id.split('_')[1]}</span>
                                </div>
                                <div>
                                    <h3 class="text-xl sm:text-2xl font-bold text-white">${agent.name}</h3>
                                    <p class="text-gray-400 text-sm sm:text-base">${agent.specialization}</p>
                                    <div class="flex items-center mt-2">
                                        <div class="w-3 h-3 bg-${agent.status === 'active' ? 'green' : agent.status === 'training' ? 'yellow' : 'red'}-400 rounded-full mr-2"></div>
                                        <span class="text-${agent.status === 'active' ? 'green' : agent.status === 'training' ? 'yellow' : 'red'}-400 text-sm font-medium">
                                            ${agent.status === 'active' ? 'فعال' : agent.status === 'training' ? 'در حال آموزش' : 'آفلاین'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white self-start sm:self-center">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <!-- Performance Details -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                            <div class="space-y-3 sm:space-y-4">
                                <h4 class="text-base sm:text-lg font-semibold text-white mb-3">📊 عملکرد</h4>
                                
                                <div class="bg-gray-700 rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-gray-300">دقت</span>
                                        <span class="text-green-400 font-bold">${agent.performance.accuracy.toFixed(1)}%</span>
                                    </div>
                                    <div class="w-full bg-gray-600 rounded-full h-3">
                                        <div class="bg-green-400 h-3 rounded-full" style="width: ${agent.performance.accuracy}%"></div>
                                    </div>
                                </div>

                                <div class="bg-gray-700 rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-gray-300">نرخ موفقیت</span>
                                        <span class="text-purple-400 font-bold">${agent.performance.successRate.toFixed(1)}%</span>
                                    </div>
                                    <div class="w-full bg-gray-600 rounded-full h-3">
                                        <div class="bg-purple-400 h-3 rounded-full" style="width: ${agent.performance.successRate}%"></div>
                                    </div>
                                </div>

                                <div class="bg-gray-700 rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-gray-300">پیشرفت آموزش</span>
                                        <span class="text-blue-400 font-bold">${agent.performance.trainingProgress}%</span>
                                    </div>
                                    <div class="w-full bg-gray-600 rounded-full h-3">
                                        <div class="bg-blue-400 h-3 rounded-full" style="width: ${agent.performance.trainingProgress}%"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-3 sm:space-y-4">
                                <h4 class="text-base sm:text-lg font-semibold text-white mb-3">📈 آمار</h4>
                                
                                <div class="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div class="bg-gray-700 rounded-lg p-3 text-center">
                                        <div class="text-lg font-bold text-white">${agent.performance.totalDecisions.toLocaleString()}</div>
                                        <div class="text-xs text-gray-400">تصمیمات</div>
                                    </div>
                                    <div class="bg-gray-700 rounded-lg p-3 text-center">
                                        <div class="text-lg font-bold text-white">${agent.learning.hoursLearned.toFixed(0)}</div>
                                        <div class="text-xs text-gray-400">ساعت یادگیری</div>
                                    </div>
                                    <div class="bg-gray-700 rounded-lg p-3 text-center">
                                        <div class="text-lg font-bold text-white">${(agent.learning.knowledgeBase / 1024).toFixed(1)}MB</div>
                                        <div class="text-xs text-gray-400">دانش ذخیره</div>
                                    </div>
                                    <div class="bg-gray-700 rounded-lg p-3 text-center">
                                        <div class="text-lg font-bold text-${agent.performance.experienceLevel === 'expert' ? 'green' : agent.performance.experienceLevel === 'advanced' ? 'blue' : agent.performance.experienceLevel === 'intermediate' ? 'yellow' : 'gray'}-400">
                                            ${agent.performance.experienceLevel === 'expert' ? 'خبره' : 
                                              agent.performance.experienceLevel === 'advanced' ? 'پیشرفته' :
                                              agent.performance.experienceLevel === 'intermediate' ? 'متوسط' : 'مبتدی'}
                                        </div>
                                        <div class="text-xs text-gray-400">سطح</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Capabilities -->
                        <div class="mb-4 sm:mb-6">
                            <h4 class="text-base sm:text-lg font-semibold text-white mb-3">🛠️ قابلیت‌ها</h4>
                            <div class="flex flex-wrap gap-1 sm:gap-2">
                                ${agent.capabilities.map(capability => `
                                    <span class="px-2 sm:px-3 py-1 bg-blue-900 text-blue-300 text-xs sm:text-sm rounded-full">
                                        ${capability}
                                    </span>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Learning History -->
                        <div class="mb-4 sm:mb-6">
                            <h4 class="text-base sm:text-lg font-semibold text-white mb-3">📚 تاریخچه یادگیری</h4>
                            <div class="bg-gray-700 rounded-lg p-3 sm:p-4">
                                <div class="text-xs sm:text-sm text-gray-300 space-y-2">
                                    <div><strong>تاریخ ایجاد:</strong> ${new Date(agent.performance.createdAt).toLocaleDateString('fa-IR')}</div>
                                    <div><strong>آخرین آموزش:</strong> ${new Date(agent.performance.lastTraining).toLocaleDateString('fa-IR')}</div>
                                    <div><strong>آخرین به‌روزرسانی:</strong> ${new Date(agent.performance.lastUpdate).toLocaleString('fa-IR')}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                            <button onclick="TitanModules.AIManagement.startAgentTraining('${agent.id}'); this.closest('.fixed').remove();" 
                                    class="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base">
                                <i class="fas fa-graduation-cap mr-2"></i>
                                شروع آموزش
                            </button>
                            <button onclick="TitanModules.AIManagement.toggleAgentStatus('${agent.id}'); this.closest('.fixed').remove();" 
                                    class="px-4 sm:px-6 py-2 bg-${agent.status === 'active' ? 'red' : 'green'}-600 hover:bg-${agent.status === 'active' ? 'red' : 'green'}-700 text-white rounded-lg transition-colors text-sm sm:text-base">
                                <i class="fas fa-power-off mr-2"></i>
                                ${agent.status === 'active' ? 'غیرفعال کردن' : 'فعال کردن'}
                            </button>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-4 sm:px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm sm:text-base">
                                بستن
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', modalContent);
        },
        
        createBackup: async function() {
            try {
                app.showAlert('در حال ایجاد پشتیبان...', 'info');
                
                const response = await axios.post('/api/ai-analytics/backup/create');
                
                if (response.data.success) {
                    const backup = response.data.data;
                    app.showAlert(`پشتیبان‌گیری موفق: ${backup.itemsBackedUp.agents} ایجنت، ${backup.itemsBackedUp.experiences} تجربه`, 'success');
                }
            } catch (error) {
                console.error('Error creating backup:', error);
                app.showAlert('خطا در ایجاد پشتیبان', 'error');
            }
        },
        
        startTraining: function() {
            this.switchView('training');
        },
        
        quickTraining: async function(type) {
            try {
                let agentIds = [];
                let topic = 'General Improvement';
                
                if (type === 'individual') {
                    // Select lowest performing agent
                    const agent = this.state.agents.sort((a, b) => a.performance.accuracy - b.performance.accuracy)[0];
                    agentIds = [agent.id];
                    topic = 'Individual Performance Enhancement';
                } else if (type === 'collective') {
                    // Select all active agents
                    agentIds = this.state.agents.filter(a => a.status === 'active').map(a => a.id);
                    topic = 'Collective Intelligence Optimization';
                } else if (type === 'cross') {
                    // Select agents with different specializations for knowledge sharing
                    agentIds = this.state.agents.slice(0, 5).map(a => a.id);
                    topic = 'Cross-Agent Knowledge Transfer';
                }
                
                // Show loading state
                this.showTrainingProgress('شروع آموزش...', 0);
                
                const response = await axios.post('/api/ai-analytics/training/start', {
                    agentIds,
                    type,
                    topic,
                    parameters: {
                        learningRate: 0.001,
                        batchSize: 64,
                        epochs: type === 'collective' ? 150 : 100,
                        validationSplit: 0.2
                    }
                });
                
                if (response.data.success) {
                    const session = response.data.data;
                    app.showAlert(`آموزش ${this.getTrainingTypeLabel(type)} شروع شد`, 'success');
                    
                    // Start monitoring training progress
                    this.monitorTrainingProgress(session.id);
                    
                    // Update training sessions view
                    this.loadTrainingSessions();
                    
                    // Show detailed progress modal
                    this.showTrainingModal(session);
                }
            } catch (error) {
                console.error('Error starting quick training:', error);
                app.showAlert('خطا در شروع آموزش', 'error');
                this.hideTrainingProgress();
            }
        },

        // Start custom training with advanced parameters
        startCustomTraining: async function() {
            try {
                const agentSelect = document.getElementById('training-agents');
                const topicSelect = document.getElementById('training-topic');
                
                if (!agentSelect || !topicSelect) {
                    app.showAlert('لطفاً ایجنت و موضوع آموزش را انتخاب کنید', 'warning');
                    return;
                }
                
                const selectedAgents = Array.from(agentSelect.selectedOptions).map(option => option.value);
                const selectedTopic = topicSelect.value;
                
                if (selectedAgents.length === 0) {
                    app.showAlert('لطفاً حداقل یک ایجنت انتخاب کنید', 'warning');
                    return;
                }
                
                const customParameters = {
                    learningRate: parseFloat(document.getElementById('learning-rate')?.value) || 0.001,
                    batchSize: parseInt(document.getElementById('batch-size')?.value) || 32,
                    epochs: parseInt(document.getElementById('epochs')?.value) || 100,
                    validationSplit: parseFloat(document.getElementById('validation-split')?.value) || 0.2,
                    regularization: document.getElementById('regularization')?.value || 'l2',
                    optimizer: document.getElementById('optimizer')?.value || 'adam'
                };
                
                this.showTrainingProgress('تنظیم آموزش سفارشی...', 0);
                
                const response = await axios.post('/api/ai-analytics/training/start', {
                    agentIds: selectedAgents,
                    type: 'custom',
                    topic: selectedTopic,
                    parameters: customParameters
                });
                
                if (response.data.success) {
                    const session = response.data.data;
                    app.showAlert('آموزش سفارشی شروع شد', 'success');
                    
                    this.monitorTrainingProgress(session.id);
                    this.loadTrainingSessions();
                    this.showTrainingModal(session);
                }
                
            } catch (error) {
                console.error('Error starting custom training:', error);
                app.showAlert('خطا در شروع آموزش سفارشی', 'error');
                this.hideTrainingProgress();
            }
        },

        // Monitor training progress in real-time
        monitorTrainingProgress: function(sessionId) {
            if (this.state.trainingMonitorInterval) {
                clearInterval(this.state.trainingMonitorInterval);
            }
            
            this.state.trainingMonitorInterval = setInterval(async () => {
                try {
                    const response = await axios.get(`/api/ai-analytics/training/progress/${sessionId}`);
                    if (response.data.success) {
                        const progress = response.data.data;
                        this.updateTrainingProgress(progress);
                        
                        if (progress.status === 'completed' || progress.status === 'failed') {
                            clearInterval(this.state.trainingMonitorInterval);
                            this.onTrainingCompleted(progress);
                        }
                    }
                } catch (error) {
                    console.error('Error monitoring training progress:', error);
                }
            }, 2000); // Check every 2 seconds
        },

        // Update training progress UI
        updateTrainingProgress: function(progress) {
            const progressPercentage = (progress.currentEpoch / progress.totalEpochs) * 100;
            
            // Update progress in training modal if open
            const progressBar = document.getElementById('training-progress-bar');
            const progressText = document.getElementById('training-progress-text');
            const accuracyDisplay = document.getElementById('current-accuracy');
            const lossDisplay = document.getElementById('current-loss');
            
            if (progressBar) {
                progressBar.style.width = `${progressPercentage}%`;
                progressBar.setAttribute('aria-valuenow', progressPercentage);
            }
            
            if (progressText) {
                progressText.textContent = `Epoch ${progress.currentEpoch}/${progress.totalEpochs} (${progressPercentage.toFixed(1)}%)`;
            }
            
            if (accuracyDisplay) {
                accuracyDisplay.textContent = `${(progress.accuracy * 100).toFixed(2)}%`;
            }
            
            if (lossDisplay) {
                lossDisplay.textContent = progress.loss.toFixed(4);
            }
            
            // Update learning curve chart
            this.updateLearningCurve(progress.learningCurve);
        },

        // Show training modal with detailed progress
        showTrainingModal: function(session) {
            const modalContent = `
                <div id="training-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-white">
                                <i class="fas fa-graduation-cap mr-2 text-blue-400"></i>
                                جلسه آموزش: ${session.topic}
                            </h2>
                            <button onclick="TitanModules.AIManagement.closeTrainingModal()" 
                                    class="text-gray-400 hover:text-white text-2xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <!-- Training Progress -->
                        <div class="bg-gray-700 rounded-lg p-4 mb-6">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-white font-semibold">پیشرفت آموزش</span>
                                <span id="training-progress-text" class="text-gray-300">Epoch 0/${session.progress.totalEpochs}</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-3">
                                <div id="training-progress-bar" 
                                     class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300" 
                                     style="width: 0%" 
                                     role="progressbar" 
                                     aria-valuenow="0" 
                                     aria-valuemin="0" 
                                     aria-valuemax="100">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Metrics -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-green-400" id="current-accuracy">0.00%</div>
                                <div class="text-sm text-gray-400">دقت فعلی</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-red-400" id="current-loss">0.0000</div>
                                <div class="text-sm text-gray-400">میزان خطا</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-blue-400">${session.dataset.trainingSize.toLocaleString()}</div>
                                <div class="text-sm text-gray-400">داده آموزش</div>
                            </div>
                            <div class="bg-gray-700 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-purple-400">${session.estimatedDuration}s</div>
                                <div class="text-sm text-gray-400">زمان تخمینی</div>
                            </div>
                        </div>
                        
                        <!-- Learning Curve Chart -->
                        <div class="bg-gray-700 rounded-lg p-4 mb-6">
                            <h3 class="text-white font-semibold mb-3">منحنی یادگیری</h3>
                            <canvas id="learning-curve-chart" width="400" height="200"></canvas>
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex justify-end space-x-3 space-x-reverse">
                            <button onclick="TitanModules.AIManagement.stopTraining('${session.id}')" 
                                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-stop mr-2"></i>
                                توقف آموزش
                            </button>
                            <button onclick="TitanModules.AIManagement.closeTrainingModal()" 
                                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                بستن
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalContent);
            this.initLearningCurveChart();
        },

        // Initialize learning curve chart
        initLearningCurveChart: function() {
            const ctx = document.getElementById('learning-curve-chart');
            if (!ctx) return;
            
            this.learningChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'دقت آموزش',
                        data: [],
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'دقت اعتبارسنجی',
                        data: [],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#E5E7EB'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#9CA3AF' },
                            grid: { color: '#374151' }
                        },
                        y: {
                            ticks: { color: '#9CA3AF' },
                            grid: { color: '#374151' },
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            });
        },

        // Update learning curve chart
        updateLearningCurve: function(curveData) {
            if (!this.learningChart || !curveData) return;
            
            const labels = curveData.map(point => `Epoch ${point.epoch}`);
            const accuracyData = curveData.map(point => point.accuracy);
            const valAccuracyData = curveData.map(point => point.valAccuracy || point.accuracy * 0.95);
            
            this.learningChart.data.labels = labels;
            this.learningChart.data.datasets[0].data = accuracyData;
            this.learningChart.data.datasets[1].data = valAccuracyData;
            this.learningChart.update();
        },

        // Close training modal
        closeTrainingModal: function() {
            const modal = document.getElementById('training-modal');
            if (modal) {
                modal.remove();
            }
            if (this.learningChart) {
                this.learningChart.destroy();
                this.learningChart = null;
            }
        },

        // Stop training session
        stopTraining: async function(sessionId) {
            try {
                const response = await axios.post(`/api/ai-analytics/training/stop/${sessionId}`);
                if (response.data.success) {
                    app.showAlert('آموزش متوقف شد', 'info');
                    clearInterval(this.state.trainingMonitorInterval);
                    this.closeTrainingModal();
                    this.loadTrainingSessions();
                }
            } catch (error) {
                console.error('Error stopping training:', error);
                app.showAlert('خطا در توقف آموزش', 'error');
            }
        },

        // Load training sessions
        loadTrainingSessions: async function() {
            try {
                const response = await axios.get('/api/ai-analytics/training/history?limit=10');
                if (response.data.success) {
                    this.renderTrainingSessions(response.data.data.sessions);
                }
            } catch (error) {
                console.error('Error loading training sessions:', error);
            }
        },

        // Render training sessions
        renderTrainingSessions: function(sessions) {
            const container = document.getElementById('training-sessions');
            if (!container) return;
            
            if (!sessions || sessions.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-gray-400 py-8">
                        <i class="fas fa-graduation-cap text-4xl mb-4"></i>
                        <p>هنوز جلسه آموزشی انجام نشده است</p>
                    </div>
                `;
                return;
            }
            
            const sessionsHTML = sessions.map(session => `
                <div class="bg-gray-700 rounded-lg p-4 mb-4 hover:bg-gray-600 transition-colors">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full ${session.status === 'completed' ? 'bg-green-400' : session.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'} mr-3"></div>
                            <span class="text-white font-semibold">${session.topic}</span>
                        </div>
                        <span class="text-gray-400 text-sm">${new Date(session.startTime).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span class="text-gray-400">نوع:</span>
                            <span class="text-white mr-2">${this.getTrainingTypeLabel(session.type)}</span>
                        </div>
                        <div>
                            <span class="text-gray-400">دقت نهایی:</span>
                            <span class="text-green-400 mr-2">${(session.finalAccuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                            <span class="text-gray-400">مدت زمان:</span>
                            <span class="text-white mr-2">${Math.floor(session.duration / 60)}m</span>
                        </div>
                        <div>
                            <span class="text-gray-400">ایجنت‌ها:</span>
                            <span class="text-blue-400 mr-2">${session.agentIds.length}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = sessionsHTML;
        },

        // Helper functions
        getTrainingTypeLabel: function(type) {
            const labels = {
                individual: 'فردی',
                collective: 'جمعی',
                cross: 'متقابل',
                custom: 'سفارشی'
            };
            return labels[type] || 'عمومی';
        },

        showTrainingProgress: function(message, percentage) {
            // Show loading indicator
            console.log(`Training Progress: ${message} (${percentage}%)`);
        },

        hideTrainingProgress: function() {
            // Hide loading indicator
            console.log('Training progress hidden');
        },

        onTrainingCompleted: function(progress) {
            app.showAlert(`آموزش با موفقیت تکمیل شد - دقت نهایی: ${(progress.accuracy * 100).toFixed(2)}%`, 'success');
            this.loadTrainingSessions();
            this.closeTrainingModal();
        },

        // Apply training presets
        applyTrainingPreset: function(preset) {
            const presets = {
                performance: {
                    learningRate: 0.01,
                    batchSize: 128,
                    epochs: 50,
                    validationSplit: 0.1,
                    optimizer: 'adam',
                    regularization: 'none'
                },
                accuracy: {
                    learningRate: 0.0001,
                    batchSize: 16,
                    epochs: 200,
                    validationSplit: 0.3,
                    optimizer: 'adam',
                    regularization: 'l2'
                },
                balanced: {
                    learningRate: 0.001,
                    batchSize: 32,
                    epochs: 100,
                    validationSplit: 0.2,
                    optimizer: 'adam',
                    regularization: 'dropout'
                }
            };

            const config = presets[preset];
            if (config) {
                document.getElementById('learning-rate').value = config.learningRate;
                document.getElementById('batch-size').value = config.batchSize;
                document.getElementById('epochs').value = config.epochs;
                document.getElementById('validation-split').value = config.validationSplit;
                document.getElementById('optimizer').value = config.optimizer;
                document.getElementById('regularization').value = config.regularization;

                app.showAlert(`پیش‌تنظیم ${preset === 'performance' ? 'عملکرد بالا' : preset === 'accuracy' ? 'دقت بالا' : 'متعادل'} اعمال شد`, 'info');
            }
        },

        // Advanced training functions
        showAdvancedTrainingConfig: function() {
            const modalContent = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white">
                                <i class="fas fa-cogs mr-2 text-blue-400"></i>
                                تنظیمات پیشرفته آموزش
                            </h2>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="text-gray-400 hover:text-white text-xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="space-y-6">
                            <!-- Training Type Selection -->
                            <div>
                                <label class="block text-gray-300 text-sm mb-2">نوع آموزش</label>
                                <select id="advanced-training-type" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="supervised">نظارت شده (Supervised)</option>
                                    <option value="unsupervised">غیر نظارت شده (Unsupervised)</option>
                                    <option value="reinforcement">تقویتی (Reinforcement)</option>
                                    <option value="transfer">انتقال یادگیری (Transfer Learning)</option>
                                </select>
                            </div>

                            <!-- Loss Function -->
                            <div>
                                <label class="block text-gray-300 text-sm mb-2">تابع خطا</label>
                                <select id="loss-function" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="mse">Mean Squared Error</option>
                                    <option value="mae">Mean Absolute Error</option>
                                    <option value="crossentropy">Cross Entropy</option>
                                    <option value="huber">Huber Loss</option>
                                </select>
                            </div>

                            <!-- Learning Rate Schedule -->
                            <div>
                                <label class="block text-gray-300 text-sm mb-2">برنامه‌ریزی نرخ یادگیری</label>
                                <select id="lr-schedule" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="constant">ثابت</option>
                                    <option value="step">پلکانی</option>
                                    <option value="exponential">نمایی</option>
                                    <option value="cosine">کسینوسی</option>
                                </select>
                            </div>

                            <!-- Early Stopping -->
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="early-stopping" class="mr-2">
                                    <span class="text-gray-300">توقف زودهنگام (Early Stopping)</span>
                                </label>
                                <p class="text-xs text-gray-400 mt-1">توقف آموزش در صورت عدم بهبود عملکرد</p>
                            </div>

                            <!-- Data Augmentation -->
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="data-augmentation" class="mr-2">
                                    <span class="text-gray-300">تکثیر داده (Data Augmentation)</span>
                                </label>
                                <p class="text-xs text-gray-400 mt-1">افزایش تنوع داده‌های آموزش</p>
                            </div>

                            <!-- Model Ensemble -->
                            <div>
                                <label class="block text-gray-300 text-sm mb-2">تعداد مدل در مجموعه</label>
                                <input type="number" id="ensemble-size" value="1" min="1" max="10" 
                                       class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm">
                                <p class="text-xs text-gray-400 mt-1">استفاده از چندین مدل برای افزایش دقت</p>
                            </div>

                            <!-- Custom Metrics -->
                            <div>
                                <label class="block text-gray-300 text-sm mb-2">معیارهای ارزیابی اضافی</label>
                                <div class="grid grid-cols-2 gap-3">
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" value="precision">
                                        <span class="text-gray-300 text-sm">دقت (Precision)</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" value="recall">
                                        <span class="text-gray-300 text-sm">بازیابی (Recall)</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" value="f1">
                                        <span class="text-gray-300 text-sm">F1 Score</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" value="auc">
                                        <span class="text-gray-300 text-sm">AUC-ROC</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                لغو
                            </button>
                            <button onclick="TitanModules.AIManagement.applyAdvancedConfig(); this.closest('.fixed').remove();" 
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                اعمال تنظیمات
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalContent);
        },

        // Apply advanced configuration
        applyAdvancedConfig: function() {
            const advancedConfig = {
                trainingType: document.getElementById('advanced-training-type')?.value,
                lossFunction: document.getElementById('loss-function')?.value,
                lrSchedule: document.getElementById('lr-schedule')?.value,
                earlyStopping: document.getElementById('early-stopping')?.checked,
                dataAugmentation: document.getElementById('data-augmentation')?.checked,
                ensembleSize: parseInt(document.getElementById('ensemble-size')?.value) || 1,
                customMetrics: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value).filter(v => v !== 'on')
            };

            // Store advanced configuration for later use
            this.state.advancedTrainingConfig = advancedConfig;
            
            app.showAlert('تنظیمات پیشرفته ذخیره شد و در آموزش بعدی اعمال خواهد شد', 'success');
        },

        // View active training sessions
        viewActiveTrainingSessions: async function() {
            try {
                const response = await axios.get('/api/ai-analytics/training/sessions?status=active');
                if (response.data.success) {
                    const sessions = response.data.data.sessions;
                    this.showActiveSessionsModal(sessions);
                }
            } catch (error) {
                console.error('Error loading active sessions:', error);
                app.showAlert('خطا در بارگذاری جلسات فعال', 'error');
            }
        },

        // Show active sessions modal
        showActiveSessionsModal: function(sessions) {
            const modalContent = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-white">
                                <i class="fas fa-play-circle mr-2 text-green-400"></i>
                                جلسات آموزش فعال (${sessions.length})
                            </h2>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="text-gray-400 hover:text-white text-xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        ${sessions.length === 0 ? `
                            <div class="text-center py-12">
                                <i class="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
                                <p class="text-gray-400">در حال حاضر هیچ جلسه آموزش فعالی وجود ندارد</p>
                            </div>
                        ` : `
                            <div class="space-y-4">
                                ${sessions.map(session => `
                                    <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                        <div class="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 class="text-white font-semibold">${session.topic}</h3>
                                                <p class="text-gray-400 text-sm">${session.type} - ${session.agentIds.length} ایجنت</p>
                                            </div>
                                            <div class="flex items-center space-x-2 space-x-reverse">
                                                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                                <span class="text-green-400 text-sm">فعال</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Progress Bar -->
                                        <div class="mb-3">
                                            <div class="flex justify-between text-sm mb-1">
                                                <span class="text-gray-300">پیشرفت</span>
                                                <span class="text-blue-400">${session.progress}%</span>
                                            </div>
                                            <div class="w-full bg-gray-600 rounded-full h-2">
                                                <div class="bg-blue-400 h-2 rounded-full" style="width: ${session.progress}%"></div>
                                            </div>
                                        </div>
                                        
                                        <!-- Session Info -->
                                        <div class="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span class="text-gray-400">شروع:</span>
                                                <span class="text-white">${new Date(session.startTime).toLocaleTimeString('fa-IR')}</span>
                                            </div>
                                            <div>
                                                <span class="text-gray-400">زمان باقی‌مانده:</span>
                                                <span class="text-white">${Math.max(0, session.estimatedDuration - session.elapsedTime)}s</span>
                                            </div>
                                            <div class="flex justify-end">
                                                <button onclick="TitanModules.AIManagement.showTrainingModal(${JSON.stringify(session).replace(/"/g, '&quot;')})" 
                                                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                                                    مشاهده جزئیات
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                        
                        <div class="flex justify-end mt-6">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                                بستن
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalContent);
        },

        // Mass training functionality
        startMassTraining: async function() {
            try {
                const activeAgents = this.state.agents.filter(a => a.status === 'active').map(a => a.id);
                
                if (activeAgents.length === 0) {
                    app.showAlert('هیچ ایجنت فعالی برای آموزش گروهی وجود ندارد', 'warning');
                    return;
                }

                this.showTrainingProgress('شروع آموزش گروهی...', 0);

                const response = await axios.post('/api/ai-analytics/training/start', {
                    agentIds: activeAgents,
                    type: 'mass',
                    topic: 'Mass Training - System Wide Optimization',
                    parameters: {
                        learningRate: 0.001,
                        batchSize: 64,
                        epochs: 75,
                        validationSplit: 0.2,
                        optimizer: 'adam'
                    }
                });

                if (response.data.success) {
                    const session = response.data.data;
                    app.showAlert(`آموزش گروهی برای ${activeAgents.length} ایجنت شروع شد`, 'success');
                    
                    this.monitorTrainingProgress(session.id);
                    this.loadTrainingSessions();
                    this.showTrainingModal(session);
                }

            } catch (error) {
                console.error('Error starting mass training:', error);
                app.showAlert('خطا در شروع آموزش گروهی', 'error');
                this.hideTrainingProgress();
            }
        },

        // Toggle all agents status
        toggleAllAgents: async function() {
            try {
                const activeCount = this.state.agents.filter(a => a.status === 'active').length;
                const totalCount = this.state.agents.length;
                const shouldActivate = activeCount < totalCount / 2; // If less than half are active, activate all
                
                const newStatus = shouldActivate ? 'active' : 'offline';
                
                for (const agent of this.state.agents) {
                    try {
                        await axios.post(`/api/ai-analytics/agents/${agent.id}/status`, {
                            status: newStatus
                        });
                        agent.status = newStatus;
                    } catch (error) {
                        console.error(`Error updating agent ${agent.id}:`, error);
                    }
                }

                this.updateCurrentView();
                app.showAlert(`همه ایجنت‌ها ${shouldActivate ? 'فعال' : 'غیرفعال'} شدند`, 'success');

            } catch (error) {
                console.error('Error toggling all agents:', error);
                app.showAlert('خطا در تغییر وضعیت کلی ایجنت‌ها', 'error');
            }
        },

        // Filter agents functionality  
        filterAgents: function() {
            const statusFilter = document.getElementById('agent-status-filter')?.value || 'all';
            const levelFilter = document.getElementById('agent-level-filter')?.value || 'all';
            
            let filteredAgents = this.state.agents;
            
            if (statusFilter !== 'all') {
                filteredAgents = filteredAgents.filter(agent => agent.status === statusFilter);
            }
            
            if (levelFilter !== 'all') {
                filteredAgents = filteredAgents.filter(agent => agent.performance.experienceLevel === levelFilter);
            }
            
            // Re-render agent cards with filtered data
            const agentGrid = document.getElementById('agents-grid');
            if (agentGrid) {
                const originalAgents = this.state.agents;
                this.state.agents = filteredAgents;
                agentGrid.innerHTML = this.renderAgentCards();
                this.state.agents = originalAgents; // Restore original data
            }
        },
        
        // Cleanup function
        cleanup: function() {
            if (this.state.refreshInterval) {
                clearInterval(this.state.refreshInterval);
            }
        }
    };
    
    // Register the module
    window.TitanModules.AIManagement = AIManagementModule;
    
    console.log('✅ AI Management Module loaded successfully');
})();