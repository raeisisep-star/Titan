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
            // Mock data for AI system (in production, this would come from your API)
            this.state.artemis = {
                status: 'active',
                intelligence: {
                    overallIQ: 165,
                    emotionalIQ: 87,
                    strategicThinking: 92,
                    adaptability: 89
                },
                externalProviders: {
                    openai: { status: true, performance: 94, usage: 1247 },
                    anthropic: { status: true, performance: 91, usage: 832 },
                    google: { status: false, performance: 0, usage: 0 }
                },
                collectiveIntelligence: {
                    swarmEfficiency: 93,
                    knowledgeSharing: 87,
                    consensusAccuracy: 95,
                    emergentCapabilities: ['تحلیل پیچیده', 'پیش‌بینی ترندها', 'بهینه‌سازی خودکار', 'تطبیق رفتاری']
                }
            };
            
            // Mock agents data
            this.state.agents = this.generateMockAgents();
            
            console.log('✅ AI data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading AI data:', error);
        }
    }

    // Generate mock agents for demonstration
    generateMockAgents() {
        const specializations = [
            'تحلیل تکنیکال', 'مدیریت ریسک', 'تحلیل احساسات', 'شناسایی الگو',
            'پیش‌بینی قیمت', 'آربیتراژ', 'تحلیل نقدینگی', 'مدیریت پورتفولیو',
            'تشخیص ترندها', 'بهینه‌سازی', 'مدیریت سفارشات', 'آنالیز فاندامنتال',
            'هوش بازار', 'تحلیل حجم', 'تایم‌بندی معاملات'
        ];

        const capabilities = [
            'تحلیل چارت', 'محاسبه ریسک', 'پردازش متن', 'شناسایی سیگنال',
            'یادگیری ماشین', 'آنالیز داده', 'پیش‌بینی', 'بهینه‌سازی',
            'تصمیم‌گیری', 'تطبیق سریع', 'تحلیل احساسات', 'مدیریت زمان'
        ];

        const agents = [];
        for (let i = 1; i <= 15; i++) {
            const accuracy = 75 + Math.random() * 20;
            const successRate = 70 + Math.random() * 25;
            const experienceLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
            const statuses = ['active', 'training', 'offline'];
            
            agents.push({
                id: `agent_${i.toString().padStart(2, '0')}`,
                name: `ایجنت AI ${i}`,
                specialization: specializations[i - 1],
                status: statuses[Math.floor(Math.random() * 3)],
                performance: {
                    accuracy: accuracy,
                    successRate: successRate,
                    trainingProgress: Math.floor(Math.random() * 100),
                    totalDecisions: Math.floor(1000 + Math.random() * 50000),
                    experienceLevel: experienceLevels[Math.floor(Math.random() * 4)],
                    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                    lastTraining: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
                },
                learning: {
                    currentlyLearning: Math.random() > 0.7,
                    hoursLearned: Math.floor(100 + Math.random() * 2000),
                    knowledgeBase: Math.floor(512 + Math.random() * 4096) * 1024, // in KB
                    totalSessions: Math.floor(50 + Math.random() * 200)
                },
                capabilities: capabilities.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 4))
            });
        }
        return agents;
    }

    // Setup auto refresh
    setupAutoRefresh() {
        // Refresh every 15 seconds
        this.state.refreshInterval = setInterval(() => {
            this.loadAIData();
            this.updateCurrentView();
        }, 15000);
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

    // Render management overview
    renderManagementView() {
        const artemis = this.state.artemis;
        if (!artemis) {
            document.getElementById('ai-management-content-area').innerHTML = '<div class="text-center text-gray-400">در حال بارگذاری...</div>';
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
                    <button onclick="aiTabInstance.switchView('agents')" 
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
                                 onclick="aiTabInstance.selectAgent('${agent.id}')">
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
        
        document.getElementById('ai-management-content-area').innerHTML = content;
    }

    // Render agents view
    renderAgentsView() {
        const content = `
            <div class="space-y-6">
                <!-- Filters and Controls -->
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4 space-x-reverse">
                            <select id="agent-status-filter" onchange="aiTabInstance.filterAgents()" 
                                    class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
                                <option value="all">همه وضعیت‌ها</option>
                                <option value="active">فعال</option>
                                <option value="training">در حال آموزش</option>
                                <option value="offline">آفلاین</option>
                            </select>
                            <select id="agent-level-filter" onchange="aiTabInstance.filterAgents()" 
                                    class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
                                <option value="all">همه سطوح</option>
                                <option value="expert">خبره</option>
                                <option value="advanced">پیشرفته</option>
                                <option value="intermediate">متوسط</option>
                                <option value="beginner">مبتدی</option>
                            </select>
                        </div>
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <button onclick="aiTabInstance.startMassTraining()" 
                                    class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                                <i class="fas fa-graduation-cap mr-1"></i>
                                آموزش گروهی
                            </button>
                            <button onclick="aiTabInstance.toggleAllAgents()" 
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
        
        document.getElementById('ai-management-content-area').innerHTML = content;
    }

    // Render individual agent cards
    renderAgentCards() {
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
                    <button onclick="aiTabInstance.toggleAgentStatus('${agent.id}')" 
                            class="flex-1 px-3 py-2 bg-${agent.status === 'active' ? 'red' : 'green'}-600 hover:bg-${agent.status === 'active' ? 'red' : 'green'}-700 text-white rounded-lg text-sm transition-colors">
                        <i class="fas fa-power-off mr-1"></i>
                        ${agent.status === 'active' ? 'غیرفعال' : 'فعال'}
                    </button>
                    <button onclick="aiTabInstance.startAgentTraining('${agent.id}')" 
                            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                        <i class="fas fa-graduation-cap mr-1"></i>
                        آموزش
                    </button>
                    <button onclick="aiTabInstance.viewAgentDetails('${agent.id}')" 
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
    }

    // Render training view
    renderTrainingView() {
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
                        <button onclick="aiTabInstance.quickTraining('individual')" 
                                class="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                            <i class="fas fa-user text-2xl mb-2"></i>
                            <div class="font-semibold">آموزش فردی</div>
                            <div class="text-sm opacity-80">بهبود یک ایجنت</div>
                        </button>
                        <button onclick="aiTabInstance.quickTraining('collective')" 
                                class="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                            <i class="fas fa-users text-2xl mb-2"></i>
                            <div class="font-semibold">آموزش جمعی</div>
                            <div class="text-sm opacity-80">بهبود کل تیم</div>
                        </button>
                        <button onclick="aiTabInstance.quickTraining('cross')" 
                                class="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
                            <i class="fas fa-exchange-alt text-2xl mb-2"></i>
                            <div class="font-semibold">آموزش متقابل</div>
                            <div class="text-sm opacity-80">اشتراک دانش</div>
                        </button>
                    </div>
                    
                    <!-- Custom Training Setup -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-white mb-4">تنظیمات آموزش سفارشی</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-300 text-sm mb-2">انتخاب ایجنت‌ها</label>
                                <select multiple id="training-agents" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm h-24">
                                    ${this.state.agents.map(agent => `
                                        <option value="${agent.id}">${agent.name} (${agent.performance.experienceLevel})</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-gray-300 text-sm mb-2">موضوع آموزش</label>
                                <select id="training-topic" class="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm mb-3">
                                    <option value="market_analysis">تحلیل بازار</option>
                                    <option value="risk_management">مدیریت ریسک</option>
                                    <option value="pattern_recognition">شناسایی الگو</option>
                                    <option value="sentiment_analysis">تحلیل احساسات</option>
                                    <option value="decision_making">تصمیم‌گیری</option>
                                    <option value="coordination">هماهنگی تیمی</option>
                                </select>
                                <button onclick="aiTabInstance.startCustomTraining()" 
                                        class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                                    <i class="fas fa-play mr-2"></i>
                                    شروع آموزش سفارشی
                                </button>
                            </div>
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
        
        document.getElementById('ai-management-content-area').innerHTML = content;
    }

    // Render analytics view
    renderAnalyticsView() {
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
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div class="bg-gray-700 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-blue-400">${this.state.agents.reduce((sum, a) => sum + a.learning.hoursLearned, 0).toFixed(0)}</div>
                            <div class="text-sm text-gray-400">ساعت یادگیری کل</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-green-400">${(this.state.agents.reduce((sum, a) => sum + a.performance.accuracy, 0) / this.state.agents.length).toFixed(1)}%</div>
                            <div class="text-sm text-gray-400">میانگین دقت</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-purple-400">${(this.state.agents.reduce((sum, a) => sum + a.learning.knowledgeBase, 0) / 1024).toFixed(1)}MB</div>
                            <div class="text-sm text-gray-400">پایگاه دانش</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-yellow-400">8.7%</div>
                            <div class="text-sm text-gray-400">نرخ بهبود</div>
                        </div>
                    </div>
                    
                    <!-- Knowledge Distribution -->
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-white mb-4">توزیع سطح دانش</h3>
                        <div class="grid grid-cols-4 gap-3">
                            <div class="text-center">
                                <div class="text-xl font-bold text-gray-400">${this.state.agents.filter(a => a.performance.experienceLevel === 'beginner').length}</div>
                                <div class="text-sm text-gray-500">مبتدی</div>
                            </div>
                            <div class="text-center">
                                <div class="text-xl font-bold text-yellow-400">${this.state.agents.filter(a => a.performance.experienceLevel === 'intermediate').length}</div>
                                <div class="text-sm text-gray-500">متوسط</div>
                            </div>
                            <div class="text-center">
                                <div class="text-xl font-bold text-blue-400">${this.state.agents.filter(a => a.performance.experienceLevel === 'advanced').length}</div>
                                <div class="text-sm text-gray-500">پیشرفته</div>
                            </div>
                            <div class="text-center">
                                <div class="text-xl font-bold text-green-400">${this.state.agents.filter(a => a.performance.experienceLevel === 'expert').length}</div>
                                <div class="text-sm text-gray-500">خبره</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('ai-management-content-area').innerHTML = content;
    }

    // Render API configuration view
    renderConfigView() {
        const content = `
            <div class="space-y-6">
                <!-- OpenAI Configuration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-brain text-green-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">OpenAI (GPT)</h3>
                                <p class="text-gray-400">استفاده از مدل‌های GPT برای تحلیل بازار و تولید محتوا</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="openai-enabled" class="sr-only peer" ${this.settings.openai?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                    
                    <div id="openai-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="password" id="openai-api-key" value="${this.settings.openai?.api_key || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                   placeholder="sk-...">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">مدل GPT</label>
                            <select id="openai-model" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500">
                                <option value="gpt-4" ${this.settings.openai?.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
                                <option value="gpt-4-turbo" ${this.settings.openai?.model === 'gpt-4-turbo' ? 'selected' : ''}>GPT-4 Turbo</option>
                                <option value="gpt-3.5-turbo" ${this.settings.openai?.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Temperature (${this.settings.openai?.temperature || 0.7})</label>
                            <input type="range" id="openai-temperature" min="0" max="1" step="0.1" 
                                   value="${this.settings.openai?.temperature || 0.7}" 
                                   class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
                            <input type="number" id="openai-max-tokens" value="${this.settings.openai?.max_tokens || 2000}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                   min="1" max="32000">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">درخواست‌های روزانه</label>
                            <input type="number" id="openai-daily-limit" value="${this.settings.openai?.daily_limit || 1000}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500">
                        </div>
                    </div>
                    
                    <div class="mt-4 flex space-x-2 space-x-reverse">
                        <button onclick="aiTabInstance.testOpenAI()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-vial mr-2"></i>
                            تست API
                        </button>
                        <button onclick="aiTabInstance.checkOpenAIUsage()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-chart-line mr-2"></i>
                            بررسی مصرف
                        </button>
                    </div>
                </div>

                <!-- Anthropic Claude Configuration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-microchip text-orange-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">Anthropic Claude</h3>
                                <p class="text-gray-400">استفاده از مدل‌های Claude برای تحلیل پیشرفته</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="anthropic-enabled" class="sr-only peer" ${this.settings.anthropic?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                    
                    <div id="anthropic-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="password" id="anthropic-api-key" value="${this.settings.anthropic?.api_key || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">مدل Claude</label>
                            <select id="anthropic-model" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                                <option value="claude-3-opus" ${this.settings.anthropic?.model === 'claude-3-opus' ? 'selected' : ''}>Claude-3 Opus</option>
                                <option value="claude-3-sonnet" ${this.settings.anthropic?.model === 'claude-3-sonnet' ? 'selected' : ''}>Claude-3 Sonnet</option>
                                <option value="claude-3-haiku" ${this.settings.anthropic?.model === 'claude-3-haiku' ? 'selected' : ''}>Claude-3 Haiku</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
                            <input type="number" id="anthropic-max-tokens" value="${this.settings.anthropic?.max_tokens || 4000}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="aiTabInstance.testAnthropic()" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            <i class="fas fa-vial mr-2"></i>
                            تست API
                        </button>
                    </div>
                </div>

                <!-- Google AI Configuration -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center">
                            <i class="fab fa-google text-blue-400 text-2xl ml-3"></i>
                            <div>
                                <h3 class="text-xl font-bold text-white">Google AI (Gemini)</h3>
                                <p class="text-gray-400">استفاده از مدل‌های Gemini برای تحلیل چندوجهی</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="google-enabled" class="sr-only peer" ${this.settings.google?.enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div id="google-config" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="password" id="google-api-key" value="${this.settings.google?.api_key || ''}" 
                                   class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">مدل Gemini</label>
                            <select id="google-model" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="gemini-pro" ${this.settings.google?.model === 'gemini-pro' ? 'selected' : ''}>Gemini Pro</option>
                                <option value="gemini-pro-vision" ${this.settings.google?.model === 'gemini-pro-vision' ? 'selected' : ''}>Gemini Pro Vision</option>
                                <option value="gemini-ultra" ${this.settings.google?.model === 'gemini-ultra' ? 'selected' : ''}>Gemini Ultra</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Safety Settings</label>
                            <select id="google-safety" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                <option value="BLOCK_NONE">بدون فیلتر</option>
                                <option value="BLOCK_ONLY_HIGH" selected>فقط محتوای خطرناک</option>
                                <option value="BLOCK_MEDIUM_AND_ABOVE">متوسط و بالا</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="aiTabInstance.testGoogle()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-vial mr-2"></i>
                            تست API
                        </button>
                    </div>
                </div>

                <!-- Trading AI Strategies -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-chart-line text-purple-400 ml-2"></i>
                        استراتژی‌های AI معاملاتی
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تحلیل تکنیکال AI</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="technical-analysis" checked>
                            </div>
                            <p class="text-sm text-gray-400">استفاده از AI برای تشخیص الگوهای تکنیکال</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">اعتماد مورد نیاز</label>
                                <input type="range" class="w-full h-1 bg-gray-600 rounded-lg mt-1" min="60" max="95" value="80">
                                <span class="text-xs text-green-400">80%</span>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تحلیل احساسات بازار</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="sentiment-analysis" checked>
                            </div>
                            <p class="text-sm text-gray-400">تجزیه‌وتحلیل احساسات از اخبار و رسانه‌ها</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">وزن تأثیر</label>
                                <input type="range" class="w-full h-1 bg-gray-600 rounded-lg mt-1" min="10" max="50" value="25">
                                <span class="text-xs text-blue-400">25%</span>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">پیش‌بینی قیمت ML</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="price-prediction" checked>
                            </div>
                            <p class="text-sm text-gray-400">مدل‌های یادگیری ماشین برای پیش‌بینی</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">بازه زمانی</label>
                                <select class="w-full text-xs bg-gray-700 text-white rounded mt-1">
                                    <option>5 دقیقه</option>
                                    <option selected>15 دقیقه</option>
                                    <option>1 ساعت</option>
                                    <option>4 ساعت</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-red-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">مدیریت ریسک هوشمند</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="risk-management" checked>
                            </div>
                            <p class="text-sm text-gray-400">محاسبه خودکار stop-loss و take-profit</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">حداکثر ریسک</label>
                                <input type="range" class="w-full h-1 bg-gray-600 rounded-lg mt-1" min="1" max="10" value="3">
                                <span class="text-xs text-red-400">3%</span>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تشخیص الگوهای نوسانات</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="volatility-patterns">
                            </div>
                            <p class="text-sm text-gray-400">شناسایی دوره‌های کم و پر نوسان</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">حساسیت</label>
                                <select class="w-full text-xs bg-gray-700 text-white rounded mt-1">
                                    <option>کم</option>
                                    <option selected>متوسط</option>
                                    <option>زیاد</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-gray-800 rounded-lg border-l-4 border-indigo-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-white">تحلیل همبستگی دارایی‌ها</span>
                                <input type="checkbox" class="ai-strategy" data-strategy="correlation-analysis">
                            </div>
                            <p class="text-sm text-gray-400">بررسی روابط بین دارایی‌های مختلف</p>
                            <div class="mt-2">
                                <label class="text-xs text-gray-500">تعداد دارایی</label>
                                <input type="number" class="w-full text-xs bg-gray-700 text-white rounded mt-1 p-1" min="5" max="50" value="20">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Performance Monitoring -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-tachometer-alt text-green-400 ml-2"></i>
                        نظارت بر عملکرد AI
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-green-400">87.5%</div>
                            <div class="text-sm text-gray-400">دقت پیش‌بینی</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-blue-400">156</div>
                            <div class="text-sm text-gray-400">تحلیل امروز</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-purple-400">92.3%</div>
                            <div class="text-sm text-gray-400">نرخ موفقیت</div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-yellow-400">2.8s</div>
                            <div class="text-sm text-gray-400">متوسط پاسخ</div>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2">
                        <button onclick="aiTabInstance.viewAILogs()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-list mr-2"></i>
                            مشاهده لاگ‌ها
                        </button>
                        <button onclick="aiTabInstance.exportAIMetrics()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>
                            صادرات متریک‌ها
                        </button>
                        <button onclick="aiTabInstance.retrainModels()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-sync mr-2"></i>
                            بازآموزی مدل‌ها
                        </button>
                        <button onclick="aiTabInstance.clearAICache()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <i class="fas fa-trash mr-2"></i>
                            پاک کردن کش
                        </button>
                    </div>
                </div>

                <!-- AI Security & Privacy -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-shield-alt text-red-400 ml-2"></i>
                        امنیت و حریم خصوصی AI
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">رمزنگاری داده‌ها</span>
                                <input type="checkbox" id="ai-encrypt-data" checked class="toggle-checkbox">
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">حذف خودکار لاگ‌ها</span>
                                <input type="checkbox" id="ai-auto-delete-logs" class="toggle-checkbox">
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <span class="text-white">محدودیت نرخ درخواست</span>
                                <input type="checkbox" id="ai-rate-limiting" checked class="toggle-checkbox">
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">مدت نگهداری داده‌ها (روز)</label>
                                <input type="number" id="ai-data-retention" value="30" min="7" max="365" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">سطح امنیتی</label>
                                <select id="ai-security-level" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                                    <option value="standard">استاندارد</option>
                                    <option value="high" selected>بالا</option>
                                    <option value="maximum">حداکثر</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm text-gray-300 mb-2">تعداد درخواست در ساعت</label>
                                <input type="number" id="ai-hourly-limit" value="1000" min="100" max="10000" 
                                       class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('ai-management-content-area').innerHTML = content;
        
        // Re-setup handlers after rendering config view
        this.setupToggleHandlers();
        this.setupRangeSliders();
        this.setupStrategyHandlers();
    }

    setupToggleHandlers() {
        const services = ['openai', 'anthropic', 'google'];
        
        services.forEach(service => {
            const checkbox = document.getElementById(`${service}-enabled`);
            const config = document.getElementById(`${service}-config`);
            
            if (checkbox && config) {
                checkbox.addEventListener('change', () => {
                    config.style.opacity = checkbox.checked ? '1' : '0.5';
                    config.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
                });
                
                // Set initial state
                config.style.opacity = checkbox.checked ? '1' : '0.5';
                config.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
            }
        });
    }

    setupRangeSliders() {
        const tempSlider = document.getElementById('openai-temperature');
        if (tempSlider) {
            tempSlider.addEventListener('input', (e) => {
                const label = document.querySelector('label[for="openai-temperature"]');
                if (label) {
                    label.textContent = `Temperature (${e.target.value})`;
                }
            });
        }
    }

    setupStrategyHandlers() {
        const strategies = document.querySelectorAll('.ai-strategy');
        strategies.forEach(strategy => {
            strategy.addEventListener('change', () => {
                console.log(`AI Strategy ${strategy.dataset.strategy} toggled:`, strategy.checked);
            });
        });
    }

    // AI Management Functions
    async toggleAgentStatus(agentId) {
        try {
            const agent = this.state.agents.find(a => a.id === agentId);
            const newStatus = agent.status === 'active' ? 'offline' : 'active';
            
            // Update local state
            agent.status = newStatus;
            this.updateCurrentView();
            
            alert(`ایجنت ${agent.name} ${newStatus === 'active' ? 'فعال' : 'غیرفعال'} شد`);
        } catch (error) {
            console.error('Error toggling agent status:', error);
            alert('خطا در تغییر وضعیت ایجنت');
        }
    }

    async startAgentTraining(agentId) {
        try {
            const agent = this.state.agents.find(a => a.id === agentId);
            agent.status = 'training';
            this.updateCurrentView();
            
            alert(`آموزش ایجنت ${agent.name} شروع شد`);
        } catch (error) {
            console.error('Error starting agent training:', error);
            alert('خطا در شروع آموزش');
        }
    }

    viewAgentDetails(agentId) {
        const agent = this.state.agents.find(a => a.id === agentId);
        if (!agent) {
            alert('ایجنت یافت نشد');
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
                        <button onclick="aiTabInstance.startAgentTraining('${agent.id}'); this.closest('.fixed').remove();" 
                                class="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base">
                            <i class="fas fa-graduation-cap mr-2"></i>
                            شروع آموزش
                        </button>
                        <button onclick="aiTabInstance.toggleAgentStatus('${agent.id}'); this.closest('.fixed').remove();" 
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
    }

    selectAgent(agentId) {
        this.viewAgentDetails(agentId);
    }

    filterAgents() {
        // Filter functionality
        console.log('Filtering agents...');
    }

    startMassTraining() {
        alert('آموزش گروهی شروع شد');
    }

    toggleAllAgents() {
        alert('وضعیت همه ایجنت‌ها تغییر یافت');
    }

    async createBackup() {
        try {
            alert('در حال ایجاد پشتیبان...');
            // Mock backup creation
            setTimeout(() => {
                alert('پشتیبان‌گیری موفق: 15 ایجنت، 2840 تجربه');
            }, 2000);
        } catch (error) {
            console.error('Error creating backup:', error);
            alert('خطا در ایجاد پشتیبان');
        }
    }

    startTraining() {
        this.switchView('training');
    }

    async quickTraining(type) {
        try {
            alert(`آموزش ${type === 'individual' ? 'فردی' : type === 'collective' ? 'جمعی' : 'متقابل'} شروع شد`);
        } catch (error) {
            console.error('Error starting quick training:', error);
            alert('خطا در شروع آموزش');
        }
    }

    startCustomTraining() {
        const selectedAgents = Array.from(document.getElementById('training-agents').selectedOptions).map(option => option.value);
        const topic = document.getElementById('training-topic').value;
        
        if (selectedAgents.length === 0) {
            alert('لطفاً حداقل یک ایجنت انتخاب کنید');
            return;
        }
        
        alert(`آموزش سفارشی برای ${selectedAgents.length} ایجنت در موضوع ${topic} شروع شد`);
    }

    // API Testing Functions
    async testOpenAI() {
        const apiKey = document.getElementById('openai-api-key')?.value;
        if (!apiKey) {
            alert('لطفاً API Key را وارد کنید');
            return;
        }
        
        try {
            alert('در حال تست اتصال به OpenAI...');
        } catch (error) {
            alert('خطا در اتصال به OpenAI: ' + error.message);
        }
    }

    async testAnthropic() {
        const apiKey = document.getElementById('anthropic-api-key')?.value;
        if (!apiKey) {
            alert('لطفاً API Key را وارد کنید');
            return;
        }
        
        try {
            alert('در حال تست اتصال به Anthropic...');
        } catch (error) {
            alert('خطا در اتصال به Anthropic: ' + error.message);
        }
    }

    async testGoogle() {
        const apiKey = document.getElementById('google-api-key')?.value;
        if (!apiKey) {
            alert('لطفاً API Key را وارد کنید');
            return;
        }
        
        try {
            alert('در حال تست اتصال به Google AI...');
        } catch (error) {
            alert('خطا در اتصال به Google AI: ' + error.message);
        }
    }

    checkOpenAIUsage() {
        alert('بررسی مصرف OpenAI در حال پیاده‌سازی...');
    }

    viewAILogs() {
        alert('نمایش لاگ‌های AI در حال پیاده‌سازی...');
    }

    exportAIMetrics() {
        alert('صادرات متریک‌های AI در حال پیاده‌سازی...');
    }

    retrainModels() {
        if (confirm('آیا مطمئن هستید که می‌خواهید مدل‌های AI را بازآموزی دهید؟')) {
            alert('بازآموزی مدل‌ها شروع شد...');
        }
    }

    clearAICache() {
        if (confirm('آیا مطمئن هستید که می‌خواهید کش AI را پاک کنید؟')) {
            alert('کش AI پاک شد');
        }
    }

    // Cleanup function
    cleanup() {
        if (this.state.refreshInterval) {
            clearInterval(this.state.refreshInterval);
        }
    }

    collectData() {
        return {
            openai: {
                enabled: document.getElementById('openai-enabled')?.checked || false,
                api_key: document.getElementById('openai-api-key')?.value || '',
                model: document.getElementById('openai-model')?.value || 'gpt-4',
                temperature: parseFloat(document.getElementById('openai-temperature')?.value) || 0.7,
                max_tokens: parseInt(document.getElementById('openai-max-tokens')?.value) || 2000,
                daily_limit: parseInt(document.getElementById('openai-daily-limit')?.value) || 1000
            },
            anthropic: {
                enabled: document.getElementById('anthropic-enabled')?.checked || false,
                api_key: document.getElementById('anthropic-api-key')?.value || '',
                model: document.getElementById('anthropic-model')?.value || 'claude-3-opus',
                max_tokens: parseInt(document.getElementById('anthropic-max-tokens')?.value) || 4000
            },
            google: {
                enabled: document.getElementById('google-enabled')?.checked || false,
                api_key: document.getElementById('google-api-key')?.value || '',
                model: document.getElementById('google-model')?.value || 'gemini-pro',
                safety_settings: document.getElementById('google-safety')?.value || 'BLOCK_ONLY_HIGH'
            },
            strategies: Array.from(document.querySelectorAll('.ai-strategy:checked'))
                          .map(cb => cb.getAttribute('data-strategy')),
            security: {
                encrypt_data: document.getElementById('ai-encrypt-data')?.checked || false,
                auto_delete_logs: document.getElementById('ai-auto-delete-logs')?.checked || false,
                rate_limiting: document.getElementById('ai-rate-limiting')?.checked || false,
                data_retention: parseInt(document.getElementById('ai-data-retention')?.value) || 30,
                security_level: document.getElementById('ai-security-level')?.value || 'high',
                hourly_limit: parseInt(document.getElementById('ai-hourly-limit')?.value) || 1000
            },
            management: {
                artemis: this.state.artemis,
                agents: this.state.agents,
                systemMetrics: this.state.systemMetrics
            }
        };
    }
}