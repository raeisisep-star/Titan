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
            trainingSession: null
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
                // Load system overview
                const overviewResponse = await axios.get('/api/ai-analytics/system/overview');
                if (overviewResponse.data.success) {
                    this.state.artemis = overviewResponse.data.data.artemis;
                    this.state.systemMetrics = overviewResponse.data.data.metrics;
                }
                
                // Load agents list
                const agentsResponse = await axios.get('/api/ai-analytics/agents');
                if (agentsResponse.data.agents) {
                    this.state.agents = agentsResponse.data.agents;
                }
                
                console.log('✅ AI data loaded successfully');
            } catch (error) {
                console.error('❌ Error loading AI data:', error);
            }
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
                                    <button onclick="TitanModules.AIManagement.startCustomTraining()" 
                                            class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                                        <i class="fas fa-play mr-2"></i>
                                        شروع آموزش سفارشی
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
            const agent = this.state.agents.find(a => a.id === agentId);
            if (!agent) {
                app.showAlert('ایجنت یافت نشد', 'error');
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
                    topic = 'Individual Performance Boost';
                } else if (type === 'collective') {
                    // Select all active agents
                    agentIds = this.state.agents.filter(a => a.status === 'active').map(a => a.id);
                    topic = 'Collective Intelligence Enhancement';
                } else if (type === 'cross') {
                    // Select agents with different specializations
                    agentIds = this.state.agents.slice(0, 5).map(a => a.id);
                    topic = 'Cross-Training & Knowledge Sharing';
                }
                
                const response = await axios.post('/api/ai-analytics/training/start', {
                    agentIds,
                    type,
                    topic
                });
                
                if (response.data.success) {
                    app.showAlert(`آموزش ${type === 'individual' ? 'فردی' : type === 'collective' ? 'جمعی' : 'متقابل'} شروع شد`, 'success');
                    this.loadTrainingSessions();
                }
            } catch (error) {
                console.error('Error starting quick training:', error);
                app.showAlert('خطا در شروع آموزش', 'error');
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