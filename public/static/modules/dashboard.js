// Dashboard Module - Extracted from monolithic app.js
// Maintains 100% compatibility with existing functionality
// 🔄 Updated to use Adapters for real API integration
// 🔒 PRODUCTION SAFETY: Enhanced with metadata validation and No-Data UI

// Import adapters (dynamic imports will be used in methods)
// NOTE: در صورت استفاده از build tool، می‌توان از static import استفاده کرد

// 🔐 Production Safety - will be imported dynamically
let validationFunctions = null;

class DashboardModule {
    constructor() {
        this.currentTimeframe = '1D';
        this.widgets = [];
        this.isInitialized = false;
        this.dashboardData = null;
    }

    /**
     * Initialize dashboard module with real API data - similar to alerts.js pattern
     */
    async initialize() {
        console.log('🎯 Initializing Dashboard module...');
        
        try {
            // Set global reference for onclick handlers
            window.dashboardModule = this;
            
            // Load dashboard data from our API
            await this.loadDashboardData();
            
            // Update last update time
            this.updateLastUpdateTime();
            
            // Initialize charts if Chart.js is available
            if (typeof Chart !== 'undefined') {
                this.initializeCharts();
            } else {
                console.log('⏳ Chart.js not yet available, will initialize later');
            }
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            // Load saved widget configuration
            setTimeout(() => {
                this.loadWidgetConfiguration();
            }, 500); // Wait for DOM to be ready
            
            this.isInitialized = true;
            console.log('✅ Dashboard module initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing dashboard module:', error);
            // Set global reference even on error
            window.dashboardModule = this;
            // Use fallback data
            this.setFallbackData();
            this.isInitialized = true;
        }
    }

    /**
     * Load comprehensive dashboard data from API - Enhanced with 15 AI Agents
     * 🔄 UPDATED: Now uses Adapter pattern for clean separation
     * 🔒 PRODUCTION SAFETY: Validates metadata and handles NO-DATA responses
     */
    async loadDashboardData() {
        try {
            console.log('📊 Loading comprehensive dashboard data via Adapters...');
            
            // 🔐 Load validation functions if not already loaded
            if (!validationFunctions) {
                validationFunctions = await import('../lib/flags.js');
            }
            
            // 🎯 Load comprehensive adapter dynamically
            const { getComprehensiveDashboard } = await import('../data/dashboard/comprehensive.adapter.js');
            
            // 🚀 Use adapter to get data (handles all fallbacks internally)
            this.dashboardData = await getComprehensiveDashboard();
            
            // 🔒 PRODUCTION SAFETY: Validate metadata before displaying
            if (this.dashboardData.noData === true) {
                console.warn('⚠️ NO-DATA response received:', this.dashboardData.meta?.reason);
                this.showNoDataState(this.dashboardData.meta?.reason);
                this.disableAllActionButtons();
                return;
            }
            
            if (!this.dashboardData.meta || !validationFunctions.isValidMetadata(this.dashboardData.meta)) {
                console.error('❌ Invalid or missing metadata in dashboard response');
                this.showNoDataState('Data validation failed: Invalid metadata');
                this.disableAllActionButtons();
                return;
            }
            
            // ✅ Metadata valid - proceed with UI update
            console.log('✅ Data validation passed, source:', this.dashboardData.meta.source);
            
            // Update UI with loaded data
            this.updateDashboardUI();
            
            // 🤖 Initialize AI Agents display
            if (this.dashboardData.aiAgents) {
                this.updateAIAgentsSection();
            }
            
            // 📊 Initialize performance charts
            if (this.dashboardData.charts) {
                if (typeof Chart !== 'undefined') {
                    console.log('🔄 Chart.js available, initializing charts...');
                    this.initializePerformanceCharts();
                } else {
                    console.log('⏳ Chart.js not available yet, setting up retry mechanism...');
                    this.setupChartRetry();
                }
            } else {
                console.warn('⚠️ No charts data available in response');
            }
            
            // 🏷️ Show source badge in DEBUG mode
            if (validationFunctions.DEBUG_MODE) {
                this.showSourceBadge(this.dashboardData.meta.source);
            }
            
            // ✅ Enable action buttons (data is valid)
            this.enableAllActionButtons();
            
            console.log('✅ Comprehensive dashboard data loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load dashboard data via adapter:', error);
            
            // 🔴 PRODUCTION: Show NO-DATA instead of fallback mock
            this.showNoDataState(`Failed to load dashboard: ${error.message}`);
            this.disableAllActionButtons();
        }
    }

    /**
     * Get comprehensive fallback data when APIs fail
     */
    getComprehensiveFallbackData() {
        return {
            portfolio: { 
                totalBalance: 125000, 
                dailyChange: 2.3, 
                weeklyChange: 8.5,
                monthlyChange: 15.2,
                totalPnL: 12500,
                totalTrades: 145,
                winRate: 68,
                sharpeRatio: 1.42
            },
            aiAgents: [
                { id: 1, name: 'Scalping Master', status: 'active', performance: 12.3, trades: 45, uptime: 98.5 },
                { id: 2, name: 'Trend Follower', status: 'active', performance: 8.7, trades: 23, uptime: 99.2 },
                { id: 3, name: 'Grid Trading Pro', status: 'paused', performance: 15.4, trades: 67, uptime: 95.1 },
                { id: 4, name: 'Arbitrage Hunter', status: 'active', performance: 6.2, trades: 12, uptime: 97.8 },
                { id: 5, name: 'Mean Reversion', status: 'active', performance: 9.8, trades: 34, uptime: 98.9 }
            ],
            market: { 
                btcPrice: 43250, 
                ethPrice: 2680, 
                fear_greed_index: 65,
                dominance: 51.2 
            },
            trading: { 
                activeTrades: 8, 
                todayTrades: 15, 
                pendingOrders: 5,
                totalVolume24h: 85000,
                successfulTrades: 12,
                failedTrades: 3
            },
            risk: { 
                totalExposure: 75, 
                maxRiskPerTrade: 2.5, 
                currentDrawdown: -4.2,
                riskScore: 55 
            },
            learning: { 
                totalSessions: 125, 
                completedCourses: 8, 
                currentLevel: 5,
                weeklyProgress: 85 
            },
            activities: [
                { id: 1, type: 'trade', description: 'BTC/USDT Long Position', amount: 2340, timestamp: Date.now() - 300000, agent: 'Trend Follower' },
                { id: 2, type: 'profit', description: 'ETH/USDT Trade Closed', amount: 450, timestamp: Date.now() - 900000, agent: 'Scalping Master' }
            ],
            summary: { activeAgents: 4, totalAgents: 5, avgPerformance: 10.5, systemHealth: 98.2 }
        };
    }

    /**
     * Update comprehensive dashboard UI with enhanced data - 15 AI Agents Integration
     */
    updateDashboardUI() {
        if (!this.dashboardData) return;

        const data = this.dashboardData;

        try {
            // 💰 Update Portfolio Section
            this.updatePortfolioSection(data.portfolio);
            
            // 📊 Update Trading Statistics
            this.updateTradingSection(data.trading);
            
            // 📈 Update Market Data
            this.updateMarketSection(data.market);
            
            // ⚠️ Update Risk Management
            this.updateRiskSection(data.risk);
            
            // 🎓 Update Learning Progress
            this.updateLearningSection(data.learning);
            
            // 📱 Update Recent Activities
            if (data.activities && data.activities.length > 0) {
                this.updateRecentActivities(data.activities);
            }

            // 🚀 Update System Summary
            this.updateSystemSummary(data.summary);

            console.log('✅ Dashboard UI updated with comprehensive data');

        } catch (error) {
            console.error('❌ Error updating dashboard UI:', error);
        }
    }

    /**
     * Update Portfolio Section with enhanced data
     */
    updatePortfolioSection(portfolio) {
        if (!portfolio) return;

        // Total Balance
        const totalBalanceCard = document.getElementById('total-balance-card');
        if (totalBalanceCard) {
            totalBalanceCard.textContent = `$${portfolio.totalBalance?.toLocaleString() || '0'}`;
        }

        // Daily Change
        const balanceChange = document.getElementById('balance-change');
        if (balanceChange) {
            const change = portfolio.dailyChange || 0;
            const changeClass = change >= 0 ? 'text-green-400' : 'text-red-400';
            const changeSymbol = change >= 0 ? '+' : '';
            balanceChange.textContent = `${changeSymbol}${Math.abs(change).toFixed(1)}% امروز`;
            balanceChange.className = `${changeClass} text-sm`;
        }

        // Total PnL
        const totalPnLCard = document.getElementById('total-pnl-card');
        if (totalPnLCard && portfolio.totalPnL !== undefined) {
            const pnl = portfolio.totalPnL;
            const pnlClass = pnl >= 0 ? 'text-green-400' : 'text-red-400';
            const pnlSymbol = pnl >= 0 ? '+' : '';
            totalPnLCard.innerHTML = `<span class="${pnlClass}">${pnlSymbol}$${Math.abs(pnl).toLocaleString()}</span>`;
        }

        // Win Rate
        const winRateCard = document.getElementById('win-rate-card');
        if (winRateCard && portfolio.winRate !== undefined) {
            winRateCard.textContent = `${portfolio.winRate}%`;
        }

        // Sharpe Ratio
        const sharpeRatioCard = document.getElementById('sharpe-ratio-card');
        if (sharpeRatioCard && portfolio.sharpeRatio !== undefined) {
            sharpeRatioCard.textContent = portfolio.sharpeRatio.toFixed(2);
        }
    }

    /**
     * Update Trading Section
     */
    updateTradingSection(trading) {
        if (!trading) return;

        // Active Trades
        const activeTradesCard = document.getElementById('active-trades-card');
        if (activeTradesCard) {
            activeTradesCard.textContent = (trading.activeTrades || 0).toString();
        }

        // Today's Trades
        const todayTradesCard = document.getElementById('today-trades-card');
        if (todayTradesCard) {
            todayTradesCard.textContent = (trading.todayTrades || 0).toString();
        }

        // Pending Orders
        const pendingOrdersCard = document.getElementById('pending-orders-card');
        if (pendingOrdersCard) {
            pendingOrdersCard.textContent = (trading.pendingOrders || 0).toString();
        }

        // 24h Volume
        const volumeCard = document.getElementById('volume-24h-card');
        if (volumeCard && trading.totalVolume24h) {
            volumeCard.textContent = `$${trading.totalVolume24h.toLocaleString()}`;
        }
    }

    /**
     * Update Market Section
     */
    updateMarketSection(market) {
        if (!market) return;

        // BTC Price
        const btcPriceCard = document.getElementById('btc-price-card');
        if (btcPriceCard) {
            btcPriceCard.textContent = `$${market.btcPrice?.toLocaleString() || '0'}`;
        }

        // ETH Price
        const ethPriceCard = document.getElementById('eth-price-card');
        if (ethPriceCard) {
            ethPriceCard.textContent = `$${market.ethPrice?.toLocaleString() || '0'}`;
        }

        // Fear & Greed Index
        const fearGreedCard = document.getElementById('fear-greed-card');
        if (fearGreedCard) {
            const index = market.fear_greed_index || 50;
            const status = index > 75 ? 'طمع شدید' : index > 50 ? 'طمع' : index > 25 ? 'خنثی' : 'ترس';
            fearGreedCard.innerHTML = `${index} <span class="text-xs text-gray-400">(${status})</span>`;
        }

        // BTC Dominance
        const dominanceCard = document.getElementById('btc-dominance-card');
        if (dominanceCard) {
            dominanceCard.textContent = `${market.dominance || 0}%`;
        }
    }

    /**
     * Update Risk Management Section
     */
    updateRiskSection(risk) {
        if (!risk) return;

        // Total Exposure
        const exposureCard = document.getElementById('total-exposure-card');
        if (exposureCard) {
            const exposure = risk.totalExposure || 0;
            const exposureClass = exposure > 80 ? 'text-red-400' : exposure > 60 ? 'text-yellow-400' : 'text-green-400';
            exposureCard.innerHTML = `<span class="${exposureClass}">${exposure}%</span>`;
        }

        // Current Drawdown
        const drawdownCard = document.getElementById('current-drawdown-card');
        if (drawdownCard && risk.currentDrawdown !== undefined) {
            const drawdown = risk.currentDrawdown;
            const drawdownClass = Math.abs(drawdown) > 10 ? 'text-red-400' : Math.abs(drawdown) > 5 ? 'text-yellow-400' : 'text-green-400';
            drawdownCard.innerHTML = `<span class="${drawdownClass}">${drawdown}%</span>`;
        }

        // Risk Score
        const riskScoreCard = document.getElementById('risk-score-card');
        if (riskScoreCard) {
            const score = risk.riskScore || 50;
            const scoreClass = score > 70 ? 'text-red-400' : score > 50 ? 'text-yellow-400' : 'text-green-400';
            riskScoreCard.innerHTML = `<span class="${scoreClass}">${score}/100</span>`;
        }
    }

    /**
     * Update Learning & Training Section
     */
    updateLearningSection(learning) {
        if (!learning) return;

        // Completed Courses
        const coursesCard = document.getElementById('completed-courses-card');
        if (coursesCard) {
            coursesCard.textContent = (learning.completedCourses || 0).toString();
        }

        // Current Level
        const levelCard = document.getElementById('current-level-card');
        if (levelCard) {
            levelCard.textContent = `سطح ${learning.currentLevel || 1}`;
        }

        // Weekly Progress
        const progressCard = document.getElementById('weekly-progress-card');
        if (progressCard) {
            progressCard.textContent = `${learning.weeklyProgress || 0}%`;
        }

        // Total Sessions
        const sessionsCard = document.getElementById('total-sessions-card');
        if (sessionsCard) {
            sessionsCard.textContent = (learning.totalSessions || 0).toString();
        }
    }

    /**
     * Update System Summary
     */
    updateSystemSummary(summary) {
        if (!summary) return;

        // Active Agents Count
        const activeAgentsCard = document.getElementById('active-agents-card');
        if (activeAgentsCard) {
            activeAgentsCard.textContent = `${summary.activeAgents || 0}/${summary.totalAgents || 0}`;
        }

        // Average Performance
        const avgPerformanceCard = document.getElementById('avg-performance-card');
        if (avgPerformanceCard) {
            const avgPerf = summary.avgPerformance || 0;
            const perfClass = avgPerf > 10 ? 'text-green-400' : avgPerf > 5 ? 'text-yellow-400' : 'text-red-400';
            avgPerformanceCard.innerHTML = `<span class="${perfClass}">+${avgPerf.toFixed(1)}%</span>`;
        }

        // System Health
        const systemHealthCard = document.getElementById('system-health-card');
        if (systemHealthCard) {
            const health = summary.systemHealth || 0;
            const healthClass = health > 95 ? 'text-green-400' : health > 85 ? 'text-yellow-400' : 'text-red-400';
            systemHealthCard.innerHTML = `<span class="${healthClass}">${health.toFixed(1)}%</span>`;
        }
    }

    /**
     * Update recent activities section - Enhanced with AI Agent info
     */
    updateRecentActivities(activities) {
        const container = document.getElementById('recent-activities');
        if (!container || !activities || activities.length === 0) return;

        const getActivityIcon = (type) => {
            switch(type) {
                case 'trade': return '💹';
                case 'profit': return '📈';
                case 'loss': return '📉';
                case 'deposit': return '💳';
                case 'withdraw': return '💰';
                case 'alert': return '🚨';
                default: return '📊';
            }
        };

        const activitiesHtml = activities.slice(0, 6).map(activity => `
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                <div class="flex items-center">
                    <div class="text-lg ml-3">${getActivityIcon(activity.type)}</div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <p class="text-white text-sm font-medium">${activity.description}</p>
                            ${activity.agent ? `<span class="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">${activity.agent}</span>` : ''}
                        </div>
                        <p class="text-gray-400 text-xs mt-1">${this.formatTimeAgo(activity.timestamp)}</p>
                    </div>
                </div>
                ${activity.amount !== 0 ? `
                    <div class="text-${activity.amount >= 0 ? 'green' : 'red'}-400 text-sm font-medium">
                        ${activity.amount >= 0 ? '+' : ''}$${Math.abs(activity.amount).toLocaleString()}
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = activitiesHtml;
    }

    /**
     * 🤖 Update AI Agents Section - Core Feature for 15 AI Agents
     */
    updateAIAgentsSection() {
        if (!this.dashboardData || !this.dashboardData.aiAgents) return;

        const container = document.getElementById('ai-agents-container');
        if (!container) {
            console.warn('⚠️ AI Agents container not found in DOM');
            return;
        }

        const agents = this.dashboardData.aiAgents;
        
        const agentsHtml = agents.map(agent => {
            const statusColor = {
                'active': 'text-green-400 bg-green-500/20',
                'paused': 'text-yellow-400 bg-yellow-500/20', 
                'inactive': 'text-red-400 bg-red-500/20'
            }[agent.status] || 'text-gray-400 bg-gray-500/20';

            const performanceColor = agent.performance > 10 ? 'text-green-400' : 
                                   agent.performance > 0 ? 'text-yellow-400' : 'text-red-400';

            return `
                <div class="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors cursor-pointer"
                     onclick="window.dashboardModule.showAgentDetails(${agent.id})">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-white font-medium text-sm">${agent.name}</h4>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                            ${agent.status === 'active' ? 'فعال' : agent.status === 'paused' ? 'متوقف' : 'غیرفعال'}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <span class="text-gray-400">عملکرد:</span>
                            <span class="${performanceColor} font-medium">+${agent.performance}%</span>
                        </div>
                        <div>
                            <span class="text-gray-400">معاملات:</span>
                            <span class="text-white">${agent.trades}</span>
                        </div>
                        <div class="col-span-2">
                            <div class="flex justify-between text-gray-400 mb-1">
                                <span>آپ‌تایم:</span>
                                <span>${agent.uptime}%</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-1.5">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${agent.uptime}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                ${agentsHtml}
            </div>
        `;

        console.log(`✅ Updated AI Agents section with ${agents.length} agents`);
    }

    /**
     * Show detailed information for a specific AI agent
     */
    showAgentDetails(agentId) {
        const agent = this.dashboardData?.aiAgents?.find(a => a.id === agentId);
        if (!agent) return;

        // Create detailed modal or expand view
        const detailsHtml = `
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="this.remove()">
                <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-white text-lg font-bold">🤖 ${agent.name}</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">✕</button>
                    </div>
                    
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">وضعیت:</span>
                            <span class="text-${agent.status === 'active' ? 'green' : agent.status === 'paused' ? 'yellow' : 'red'}-400">
                                ${agent.status === 'active' ? 'فعال' : agent.status === 'paused' ? 'متوقف' : 'غیرفعال'}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">عملکرد:</span>
                            <span class="text-green-400">+${agent.performance}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">تعداد معاملات:</span>
                            <span class="text-white">${agent.trades}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">آپ‌تایم:</span>
                            <span class="text-white">${agent.uptime}%</span>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex gap-3">
                        <button class="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 flex-1">
                            تنظیمات
                        </button>
                        <button class="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-500 flex-1">
                            گزارشات
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', detailsHtml);
    }

    /**
     * 📊 Initialize Performance Charts - Enhanced with AI Agents data
     */
    initializePerformanceCharts() {
        console.log('🔄 Initializing performance charts...');
        
        // Check Chart.js availability with retry
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js not ready, retrying in 1 second...');
            setTimeout(() => this.initializePerformanceCharts(), 1000);
            return;
        }

        if (!this.dashboardData?.charts) {
            console.warn('⚠️ Charts data not available');
            return;
        }

        try {
            const charts = this.dashboardData.charts;
            
            // Hide loading indicators
            document.getElementById('portfolio-chart-loading')?.classList.add('hidden');
            document.getElementById('agents-chart-loading')?.classList.add('hidden');  
            document.getElementById('volume-chart-loading')?.classList.add('hidden');
            
            // 📈 Portfolio Performance Chart (using real API data structure)
            this.createPortfolioChart(charts.performance || charts.portfolioHistory);
            
            // 🤖 AI Agents Performance Chart (using real API data structure)
            this.createAgentsPerformanceChart(charts.agents || charts.agentPerformance);
            
            // 📊 Trading Volume Chart (using real API data structure)
            this.createTradingVolumeChart(charts.volume || charts.tradingVolume);
            
            console.log('✅ Performance charts initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing performance charts:', error);
            // Show error in loading areas
            document.getElementById('portfolio-chart-loading').innerHTML = '<i class="fas fa-exclamation-triangle text-red-400"></i><div class="text-red-400">خطا در بارگذاری نمودار</div>';
            document.getElementById('agents-chart-loading').innerHTML = '<i class="fas fa-exclamation-triangle text-red-400"></i><div class="text-red-400">خطا در بارگذاری نمودار</div>';
            document.getElementById('volume-chart-loading').innerHTML = '<i class="fas fa-exclamation-triangle text-red-400"></i><div class="text-red-400">خطا در بارگذاری نمودار</div>';
        }
    }

    /**
     * Create Portfolio Performance Chart
     */
    createPortfolioChart(data) {
        const canvas = document.getElementById('portfolio-chart');
        if (!canvas || !data) {
            console.error('❌ Portfolio chart canvas or data not found');
            return;
        }

        try {
            const ctx = canvas.getContext('2d');
            
            // Destroy existing chart if exists
            if (this.portfolioChart) {
                this.portfolioChart.destroy();
            }

            this.portfolioChart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: { 
                                color: '#ffffff',
                                usePointStyle: true,
                                padding: 20,
                                font: { family: 'IRANSans' }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#6b7280',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            ticks: { 
                                color: '#9ca3af',
                                font: { family: 'IRANSans' }
                            },
                            grid: { color: '#374151' }
                        },
                        y: {
                            ticks: { 
                                color: '#9ca3af',
                                font: { family: 'IRANSans' },
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            },
                            grid: { color: '#374151' }
                        }
                    }
                }
            });
            
            console.log('✅ Portfolio chart created successfully');
        } catch (error) {
            console.error('❌ Error creating portfolio chart:', error);
        }
    }

    /**
     * Create AI Agents Performance Chart
     */
    createAgentsPerformanceChart(data) {
        const canvas = document.getElementById('agents-performance-chart');
        if (!canvas || !data) {
            console.error('❌ Agents chart canvas or data not found');
            return;
        }

        try {
            const ctx = canvas.getContext('2d');
            
            // Destroy existing chart if exists
            if (this.agentsChart) {
                this.agentsChart.destroy();
            }

            this.agentsChart = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: { 
                                color: '#ffffff',
                                font: { family: 'IRANSans' }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { 
                                color: '#9ca3af',
                                font: { family: 'IRANSans', size: 10 },
                                maxRotation: 45
                            },
                            grid: { color: '#374151' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { 
                                color: '#9ca3af',
                                font: { family: 'IRANSans' },
                                callback: function(value) {
                                    return value + '%';
                                }
                            },
                            grid: { color: '#374151' }
                        }
                    }
                }
            });
            
            console.log('✅ Agents performance chart created successfully');
        } catch (error) {
            console.error('❌ Error creating agents chart:', error);
        }
    }

    /**
     * Create Trading Volume Chart  
     */
    createTradingVolumeChart(data) {
        const canvas = document.getElementById('trading-volume-chart');
        if (!canvas || !data) {
            console.error('❌ Volume chart canvas or data not found');
            return;
        }

        try {
            const ctx = canvas.getContext('2d');
            
            // Destroy existing chart if exists
            if (this.volumeChart) {
                this.volumeChart.destroy();
            }

            this.volumeChart = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: { 
                                color: '#ffffff',
                                font: { family: 'IRANSans' }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { 
                                color: '#9ca3af',
                                font: { family: 'IRANSans' }
                            },
                            grid: { color: '#374151' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { 
                                color: '#9ca3af',
                                font: { family: 'IRANSans' },
                                callback: function(value) {
                                    return '$' + (value / 1000).toFixed(0) + 'k';
                                }
                            },
                            grid: { color: '#374151' }
                        }
                    }
                }
            });
            
            console.log('✅ Trading volume chart created successfully');
        } catch (error) {
            console.error('❌ Error creating volume chart:', error);
        }
    }

    /**
     * Setup Chart.js retry mechanism for delayed loading
     */
    setupChartRetry() {
        console.log('⏳ Setting up Chart.js retry mechanism...');
        let retryCount = 0;
        const maxRetries = 10;
        
        const checkChartJs = () => {
            retryCount++;
            if (typeof Chart !== 'undefined') {
                console.log('✅ Chart.js now available, initializing charts...');
                if (this.dashboardData?.charts) {
                    this.initializePerformanceCharts();
                }
            } else if (retryCount < maxRetries) {
                console.log(`⏳ Chart.js not ready, retry ${retryCount}/${maxRetries} in 1 second...`);
                setTimeout(checkChartJs, 1000);
            } else {
                console.error('❌ Chart.js failed to load after maximum retries');
                // Show error message in chart containers
                this.showChartError();
            }
        };
        
        setTimeout(checkChartJs, 1000);
    }
    
    /**
     * Show chart loading error
     */
    showChartError() {
        const chartContainers = ['portfolio-chart-loading', 'agents-chart-loading', 'volume-chart-loading'];
        chartContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="text-center text-red-400">
                        <i class="fas fa-exclamation-triangle mb-2"></i>
                        <div>خطا در بارگذاری Chart.js</div>
                        <div class="text-xs text-gray-500 mt-1">لطفاً صفحه را رفرش کنید</div>
                    </div>
                `;
            }
        });
    }

    /**
     * Format timestamp to relative time
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diff = now - activityTime;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'همین الان';
        if (minutes < 60) return `${minutes} دقیقه پیش`;
        if (hours < 24) return `${hours} ساعت پیش`;
        return `${days} روز پیش`;
    }

    /**
     * Update last update time
     */
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            const now = new Date();
            lastUpdateElement.textContent = now.toLocaleTimeString('fa-IR');
        }
    }

    /**
     * Set fallback data when API fails
     */
    setFallbackData() {
        console.log('⚠️ Using fallback dashboard data');
        
        const totalBalanceCard = document.getElementById('total-balance-card');
        const balanceChange = document.getElementById('balance-change');
        const activeTradesCard = document.getElementById('active-trades-card');
        
        if (totalBalanceCard) totalBalanceCard.textContent = '$125,000';
        if (balanceChange) balanceChange.textContent = '+2.3% امروز';
        if (activeTradesCard) activeTradesCard.textContent = '8';
        
        this.updateLastUpdateTime();
    }

    /**
     * Setup auto-refresh for dashboard data
     */
    setupAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            if (this.isInitialized) {
                this.loadDashboardData();
            }
        }, 30000);
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        // Initialize portfolio chart if canvas exists
        const portfolioCanvas = document.getElementById('portfolioChart');
        if (portfolioCanvas && this.dashboardData?.portfolio?.allocation) {
            this.renderPortfolioChart(this.dashboardData.portfolio.allocation);
        }
    }

    /**
     * Render portfolio chart
     */
    renderPortfolioChart(allocation) {
        const canvas = document.getElementById('portfolioChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Clear existing chart
        if (window.portfolioChart) {
            window.portfolioChart.destroy();
        }

        const labels = allocation.map(item => item.symbol || item.name);
        const data = allocation.map(item => item.percentage || item.value);
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

        window.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#374151'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 10
                        }
                    }
                }
            }
        });
    }

    /**
     * Get dashboard content HTML
     * Extracted from original getDashboardContent() method
     */
    async getContent() {
        return `
        <div class="space-y-6">
            <!-- Dashboard Toolbar -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
                <!-- Desktop Header -->
                <div class="hidden sm:flex items-center justify-between p-4">
                    <div class="flex items-center gap-4">
                        <h1 class="text-xl font-bold text-white">داشبورد شخصی</h1>
                        <span class="text-sm text-gray-400">آخرین بروزرسانی: <span id="last-update">در حال بارگذاری...</span></span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.dashboardModule.showWidgetLibrary()" 
                                class="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center text-lg hover:scale-105 transition-all"
                                title="افزودن ویجت">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button onclick="window.dashboardModule.refreshData()" 
                                class="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                title="بروزرسانی">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button onclick="window.dashboardModule.clearAllWidgets()" 
                                class="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                title="پاک کردن همه ویجت‌ها">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="window.dashboardModule.resetToDefault()" 
                                class="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                                title="بازنشانی پیش‌فرض">
                            <i class="fas fa-undo"></i>
                        </button>
                        <div class="hidden md:flex items-center gap-2">
                            <span class="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                                <i class="fas fa-arrows-alt mr-1"></i>
                                کشیدن برای جابجایی
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Header -->
                <div class="sm:hidden p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h1 class="text-lg font-bold text-white">داشبورد</h1>
                        <div class="flex items-center gap-2">
                            <button onclick="window.dashboardModule.showWidgetLibrary()" 
                                    class="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center text-lg active:scale-95 transition-all"
                                    title="افزودن ویجت">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button onclick="window.dashboardModule.refreshData()" 
                                    class="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center active:scale-95 transition-all"
                                    title="بروزرسانی">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-xs text-gray-400 bg-gray-700/30 px-3 py-2 rounded-lg text-center">
                        <i class="fas fa-hand-paper mr-1"></i>
                        لمس و کشیدن برای جابجایی ویجت‌ها
                    </div>
                </div>
            </div>

            <!-- Dashboard Widgets Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-widgets-container">
                <!-- Total Balance Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">موجودی کل</p>
                            <p id="total-balance-card" class="text-2xl font-bold text-white">$125,000</p>
                            <p id="balance-change" class="text-green-400 text-sm">+2.3% امروز</p>
                        </div>
                        <div class="text-green-400 text-3xl">💰</div>
                    </div>
                </div>

                <!-- Active Trades Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">معاملات فعال</p>
                            <p id="active-trades-card" class="text-2xl font-bold text-white">8</p>
                            <p class="text-blue-400 text-sm">نرخ موفقیت: 75%</p>
                        </div>
                        <div class="text-blue-400 text-3xl">📈</div>
                    </div>
                </div>

                <!-- Artemis Status Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">وضعیت آرتمیس</p>
                            <p class="text-2xl font-bold text-white">85%</p>
                            <p class="text-purple-400 text-sm">اعتماد بالا</p>
                        </div>
                        <div class="text-purple-400 text-3xl">🧠</div>
                    </div>
                </div>

                <!-- AI Analytics Widget -->
                <div class="dashboard-widget bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 border border-purple-700 shadow-lg hover:border-purple-600 transition-all duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <p class="text-purple-200 text-sm">هوش مصنوعی TITAN</p>
                            <p class="text-2xl font-bold text-white" id="ai-agents-count">15 Agent</p>
                            <p class="text-purple-300 text-sm" id="ai-performance-summary">میانگین عملکرد: 87%</p>
                        </div>
                        <div class="text-purple-300 text-3xl">🤖</div>
                    </div>
                    
                    <!-- Quick AI Stats -->
                    <div class="grid grid-cols-3 gap-2 mb-3">
                        <div class="text-center">
                            <div class="text-sm font-bold text-green-400" id="ai-active-count">12</div>
                            <div class="text-xs text-purple-200">فعال</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm font-bold text-yellow-400" id="ai-training-count">2</div>
                            <div class="text-xs text-purple-200">آموزش</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm font-bold text-red-400" id="ai-standby-count">1</div>
                            <div class="text-xs text-purple-200">آماده باش</div>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <button onclick="dashboardModule.openAIManagement()" 
                            class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-brain mr-2"></i>مدیریت AI
                    </button>
                </div>
            </div>

            <!-- Enhanced Dashboard Stats Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Total PnL Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">سود و زیان کل</p>
                            <p id="total-pnl-card" class="text-xl font-bold text-green-400">+$12,500</p>
                        </div>
                        <div class="text-green-400 text-2xl">💹</div>
                    </div>
                </div>

                <!-- Win Rate Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">نرخ موفقیت</p>
                            <p id="win-rate-card" class="text-xl font-bold text-white">68%</p>
                        </div>
                        <div class="text-blue-400 text-2xl">🎯</div>
                    </div>
                </div>

                <!-- Sharpe Ratio Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">نسبت شارپ</p>
                            <p id="sharpe-ratio-card" class="text-xl font-bold text-white">1.42</p>
                        </div>
                        <div class="text-purple-400 text-2xl">📊</div>
                    </div>
                </div>

                <!-- System Health Card -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">سلامت سیستم</p>
                            <p id="system-health-card" class="text-xl font-bold text-green-400">98.2%</p>
                        </div>
                        <div class="text-green-400 text-2xl">💚</div>
                    </div>
                </div>
            </div>

            <!-- 🤖 15 AI Agents Management Section -->
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <h2 class="text-xl font-bold text-white">🤖 سیستم 15 ایجنت هوشمند</h2>
                        <span class="bg-blue-500/20 text-blue-400 text-sm px-3 py-1 rounded-full">
                            فعال: <span id="active-agents-card">12/15</span>
                        </span>
                        <span class="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full">
                            میانگین عملکرد: <span id="avg-performance-card">+10.5%</span>
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.dashboardModule.refreshAIAgents()" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                            <i class="fas fa-sync-alt mr-1"></i>بروزرسانی
                        </button>
                        <button onclick="app.loadModule('settings')" 
                                class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm">
                            <i class="fas fa-cog mr-1"></i>تنظیمات
                        </button>
                    </div>
                </div>

                <!-- AI Agents Grid -->
                <div id="ai-agents-container">
                    <!-- This will be populated dynamically by updateAIAgentsSection() -->
                    <div class="text-center text-gray-400 py-8">
                        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                        <p>در حال بارگذاری اطلاعات ایجنت‌های هوشمند...</p>
                    </div>
                </div>
            </div>

            <!-- Advanced Analytics & Risk Management -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Market Overview -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h3 class="text-lg font-semibold text-white mb-4">بازار رمزارز</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">قیمت BTC:</span>
                            <span id="btc-price-card" class="text-orange-400 font-bold">$43,250</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">قیمت ETH:</span>
                            <span id="eth-price-card" class="text-blue-400 font-bold">$2,680</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">شاخص ترس و طمع:</span>
                            <span id="fear-greed-card" class="text-yellow-400 font-bold">65</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">تسلط BTC:</span>
                            <span id="btc-dominance-card" class="text-orange-400 font-bold">51.2%</span>
                        </div>
                    </div>
                </div>

                <!-- Trading Activity -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h3 class="text-lg font-semibold text-white mb-4">فعالیت معاملاتی</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">معاملات امروز:</span>
                            <span id="today-trades-card" class="text-blue-400 font-bold">15</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">سفارشات در انتظار:</span>
                            <span id="pending-orders-card" class="text-yellow-400 font-bold">5</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">حجم 24 ساعته:</span>
                            <span id="volume-24h-card" class="text-green-400 font-bold">$85,000</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">معاملات موفق:</span>
                            <span class="text-green-400 font-bold">12/15</span>
                        </div>
                    </div>
                </div>

                <!-- Risk Management -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h3 class="text-lg font-semibold text-white mb-4">مدیریت ریسک</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">کل اکسپوژر:</span>
                            <span id="total-exposure-card" class="text-yellow-400 font-bold">75%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">درجه ریسک:</span>
                            <span id="risk-score-card" class="text-orange-400 font-bold">55/100</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">کل افت:</span>
                            <span id="current-drawdown-card" class="text-red-400 font-bold">-4.2%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">ریسک هر معامله:</span>
                            <span class="text-blue-400 font-bold">2.5%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Learning & Performance Analytics -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Learning Progress -->
                <div class="dashboard-widget bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 border border-purple-700 shadow-lg">
                    <h3 class="text-lg font-semibold text-white mb-4">🎓 پیشرفت یادگیری</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div id="completed-courses-card" class="text-2xl font-bold text-purple-300">8</div>
                            <div class="text-purple-200 text-sm">دوره تکمیل شده</div>
                        </div>
                        <div class="text-center">
                            <div id="current-level-card" class="text-2xl font-bold text-purple-300">سطح 5</div>
                            <div class="text-purple-200 text-sm">سطح فعلی</div>
                        </div>
                        <div class="text-center">
                            <div id="weekly-progress-card" class="text-2xl font-bold text-purple-300">85%</div>
                            <div class="text-purple-200 text-sm">پیشرفت هفتگی</div>
                        </div>
                        <div class="text-center">
                            <div id="total-sessions-card" class="text-2xl font-bold text-purple-300">125</div>
                            <div class="text-purple-200 text-sm">کل جلسات</div>
                        </div>
                    </div>
                </div>

                <!-- System Status -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h3 class="text-lg font-semibold text-white mb-4">⚙️ وضعیت سیستم</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">آپ‌تایم سیستم:</span>
                            <span class="text-green-400 font-bold">99.5%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">ایجنت‌های فعال:</span>
                            <span class="text-blue-400 font-bold">12/15</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">میانگین تأخیر:</span>
                            <span class="text-green-400 font-bold">15ms</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">آخرین بک‌آپ:</span>
                            <span class="text-gray-300 font-bold">2 ساعت پیش</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Portfolio Performance Chart -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">📈 نمودار پورتفولیو</h3>
                        <button onclick="window.dashboardModule?.expandChart('portfolio')" class="text-gray-400 hover:text-white text-sm">
                            <i class="fas fa-expand-alt"></i>
                        </button>
                    </div>
                    <div class="h-64 flex items-center justify-center">
                        <canvas id="portfolio-chart" class="w-full h-full"></canvas>
                        <div id="portfolio-chart-loading" class="text-gray-400 text-center">
                            <i class="fas fa-spinner fa-spin mb-2"></i>
                            <div>بارگذاری نمودار...</div>
                        </div>
                    </div>
                </div>

                <!-- AI Agents Performance Chart -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">🤖 عملکرد ایجنت‌ها</h3>
                        <button onclick="window.dashboardModule?.expandChart('agents')" class="text-gray-400 hover:text-white text-sm">
                            <i class="fas fa-expand-alt"></i>
                        </button>
                    </div>
                    <div class="h-64 flex items-center justify-center">
                        <canvas id="agents-performance-chart" class="w-full h-full"></canvas>
                        <div id="agents-chart-loading" class="text-gray-400 text-center">
                            <i class="fas fa-spinner fa-spin mb-2"></i>
                            <div>بارگذاری نمودار...</div>
                        </div>
                    </div>
                </div>

                <!-- Trading Volume Chart -->
                <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">📊 حجم معاملات</h3>
                        <button onclick="window.dashboardModule?.expandChart('volume')" class="text-gray-400 hover:text-white text-sm">
                            <i class="fas fa-expand-alt"></i>
                        </button>
                    </div>
                    <div class="h-64 flex items-center justify-center">
                        <canvas id="trading-volume-chart" class="w-full h-full"></canvas>
                        <div id="volume-chart-loading" class="text-gray-400 text-center">
                            <i class="fas fa-spinner fa-spin mb-2"></i>
                            <div>بارگذاری نمودار...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activities Enhanced -->
            <div class="dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">📱 فعالیت‌های اخیر</h3>
                    <button onclick="app.loadModule('trading')" class="text-gray-400 hover:text-white text-sm">
                        <i class="fas fa-external-link-alt mr-1"></i>مشاهده همه
                    </button>
                </div>
                <div id="recent-activities" class="space-y-3">
                    <!-- This will be populated dynamically by updateRecentActivities() -->
                    <div class="text-center text-gray-400 py-4">
                        <i class="fas fa-spinner fa-spin mr-2"></i>در حال بارگذاری فعالیت‌های اخیر...
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Initialize dashboard functionality
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize charts if available
            await this.initializeCharts();
            
            // Setup drag and drop
            this.setupDragAndDrop();
            
            // Load dashboard data
            await this.loadData();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            this.isInitialized = true;
            console.log('✅ Dashboard module initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
        }
    }

    /**
     * Initialize charts
     */
    async initializeCharts() {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded yet, will initialize charts later');
            return;
        }

        const canvas = document.getElementById('portfolioChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Bitcoin', 'Ethereum', 'Others'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6'],
                    borderWidth: 2,
                    borderColor: '#374151'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        const widgets = document.querySelectorAll('.dashboard-widget');
        
        widgets.forEach(widget => {
            widget.draggable = true;
            
            widget.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', widget.id || 'widget');
                widget.classList.add('opacity-50');
            });
            
            widget.addEventListener('dragend', (e) => {
                widget.classList.remove('opacity-50');
            });
        });
    }

    /**
     * Load dashboard data
     */
    async loadData() {
        try {
            // Simulate API calls - replace with real API endpoints
            await this.updateStats();
            await this.updateActivities();
            
            // Update last update time
            const lastUpdate = document.getElementById('last-update');
            if (lastUpdate) {
                lastUpdate.textContent = new Date().toLocaleTimeString('fa-IR');
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    /**
     * Update dashboard statistics
     */
    async updateStats() {
        // Simulate real data updates
        const totalBalance = document.getElementById('total-balance-card');
        const balanceChange = document.getElementById('balance-change');
        const activeTrades = document.getElementById('active-trades-card');

        if (totalBalance) {
            // Add animation for number changes
            this.animateNumber(totalBalance, 125000, '$');
        }

        // Update AI Analytics Widget
        await this.updateAIStats();
    }

    /**
     * Update recent activities
     */
    async updateActivities() {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        // Activities already rendered in HTML, could be made dynamic here
    }

    /**
     * Setup auto-refresh
     */
    setupAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            this.loadData();
        }, 30000);
    }

    /**
     * 🔄 Refresh AI Agents data - for dashboard button
     */
    async refreshAIAgents() {
        console.log('🔄 Refreshing AI Agents data...');
        try {
            await this.loadDashboardData();
            console.log('✅ AI Agents data refreshed successfully');
        } catch (error) {
            console.error('❌ Failed to refresh AI Agents data:', error);
        }
    }

    /**
     * 🔄 Refresh dashboard data - for dashboard button
     */
    async refreshData() {
        console.log('🔄 Refreshing dashboard data...');
        try {
            // Show loading state
            const loadingElements = document.querySelectorAll('[id$="-card"]');
            loadingElements.forEach(el => {
                if (el) el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            });

            // Reload data
            await this.loadDashboardData();
            
            console.log('✅ Dashboard data refreshed successfully');
        } catch (error) {
            console.error('❌ Failed to refresh dashboard data:', error);
        }
    }

    /**
     * 📊 Expand chart to fullscreen modal
     */
    expandChart(chartType) {
        console.log(`📊 Expanding ${chartType} chart...`);
        
        const modalHtml = `
            <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onclick="this.remove()">
                <div class="bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-white text-xl font-bold">
                            ${chartType === 'portfolio' ? '📈 نمودار پورتفولیو' : 
                              chartType === 'agents' ? '🤖 عملکرد ایجنت‌ها' : 
                              chartType === 'volume' ? '📊 حجم معاملات' : 'نمودار'}
                        </h3>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="text-gray-400 hover:text-white text-2xl">×</button>
                    </div>
                    <div class="h-96">
                        <canvas id="expanded-${chartType}-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Re-create chart in expanded view
        setTimeout(() => {
            if (this.dashboardData?.charts) {
                const canvas = document.getElementById(`expanded-${chartType}-chart`);
                if (canvas && typeof Chart !== 'undefined') {
                    const ctx = canvas.getContext('2d');
                    let chartData = null;
                    
                    if (chartType === 'portfolio') {
                        chartData = this.dashboardData.charts.portfolioHistory;
                    } else if (chartType === 'agents') {
                        chartData = this.dashboardData.charts.agentPerformance;
                    } else if (chartType === 'volume') {
                        chartData = this.dashboardData.charts.tradingVolume;
                    }
                    
                    if (chartData) {
                        new Chart(ctx, {
                            type: chartType === 'portfolio' ? 'line' : 'bar',
                            data: chartData,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { labels: { color: '#ffffff' } }
                                },
                                scales: {
                                    x: {
                                        ticks: { color: '#9ca3af' },
                                        grid: { color: '#374151' }
                                    },
                                    y: {
                                        ticks: { 
                                            color: '#9ca3af',
                                            callback: function(value) {
                                                if (chartType === 'portfolio') return '$' + value.toLocaleString();
                                                if (chartType === 'agents') return value + '%';
                                                if (chartType === 'volume') return '$' + (value / 1000).toFixed(0) + 'k';
                                                return value;
                                            }
                                        },
                                        grid: { color: '#374151' }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }, 100);
    }

    /**
     * 🧠 Open AI Management Panel
     */
    openAIManagement() {
        console.log('🧠 Opening AI Management panel...');
        
        const modalHtml = `
            <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onclick="this.remove()">
                <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-white text-xl font-bold">🤖 مدیریت ایجنت‌های هوشمند</h3>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="text-gray-400 hover:text-white text-2xl">×</button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.dashboardData?.aiAgents?.map(agent => `
                            <div class="bg-gray-700 rounded-lg p-4">
                                <div class="flex justify-between items-center mb-3">
                                    <h4 class="text-white font-bold">${agent.name}</h4>
                                    <span class="px-2 py-1 rounded text-xs ${
                                        agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                        agent.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }">
                                        ${agent.status === 'active' ? 'فعال' : agent.status === 'paused' ? 'متوقف' : 'غیرفعال'}
                                    </span>
                                </div>
                                <div class="space-y-2 text-sm text-gray-300">
                                    <div class="flex justify-between">
                                        <span>عملکرد:</span>
                                        <span class="text-green-400">+${agent.performance}%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>معاملات:</span>
                                        <span>${agent.trades}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>آپ‌تایم:</span>
                                        <span>${agent.uptime}%</span>
                                    </div>
                                </div>
                                <div class="mt-4 flex gap-2">
                                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex-1">
                                        تنظیمات
                                    </button>
                                    <button class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs flex-1">
                                        گزارش
                                    </button>
                                </div>
                            </div>
                        `).join('') || '<div class="col-span-full text-center text-gray-400">هیچ ایجنتی یافت نشد</div>'}
                    </div>
                    
                    <div class="mt-6 flex justify-end gap-3">
                        <button onclick="app.loadModule('settings')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                            <i class="fas fa-cog mr-2"></i>تنظیمات پیشرفته
                        </button>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                            بستن
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * 📚 Show widget library for adding new widgets
     */
    showWidgetLibrary() {
        console.log('📚 Opening widget library...');
        
        const availableWidgets = [
            { id: 'market-overview', name: 'نمای کلی بازار', icon: '📊' },
            { id: 'top-gainers', name: 'بیشترین رشد', icon: '📈' },
            { id: 'top-losers', name: 'بیشترین کاهش', icon: '📉' },
            { id: 'fear-greed', name: 'شاخص ترس و طمع', icon: '😨' },
            { id: 'volume-analysis', name: 'تحلیل حجم', icon: '📊' },
            { id: 'correlation-matrix', name: 'ماتریس همبستگی', icon: '🔗' }
        ];
        
        const modalHtml = `
            <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onclick="this.remove()">
                <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-white text-xl font-bold">📚 کتابخانه ویجت‌ها</h3>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="text-gray-400 hover:text-white text-2xl">×</button>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        ${availableWidgets.map(widget => `
                            <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer transition-colors"
                                 onclick="window.dashboardModule.addWidget('${widget.id}')">
                                <div class="flex items-center gap-3">
                                    <div class="text-2xl">${widget.icon}</div>
                                    <div>
                                        <h4 class="text-white font-medium">${widget.name}</h4>
                                        <p class="text-gray-400 text-sm">افزودن به داشبورد</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="mt-6 flex justify-end">
                        <button onclick="this.closest('.fixed').remove()" 
                                class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                            بستن
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * ➕ Add widget to dashboard
     */
    addWidget(widgetId) {
        console.log(`➕ Adding widget: ${widgetId}`);
        // Implementation for adding widgets dynamically
        // This would typically save to user preferences and refresh the dashboard
        alert(`ویجت ${widgetId} به زودی اضافه خواهد شد!`);
        
        // Close modal
        const modal = document.querySelector('.fixed');
        if (modal) modal.remove();
    }

    /**
     * 🗑️ Clear all widgets (reset dashboard)
     */
    clearAllWidgets() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه ویجت‌ها را پاک کنید؟')) {
            console.log('🗑️ Clearing all dashboard widgets...');
            // Implementation for clearing user's custom widgets
            // Reset to default dashboard layout
            location.reload(); // Simple approach - reload to default state
        }
    }

    /**
     * 🔄 Reset dashboard to default layout
     */
    resetToDefault() {
        if (confirm('آیا می‌خواهید داشبورد را به حالت پیش‌فرض بازگردانید؟')) {
            console.log('🔄 Resetting dashboard to default...');
            // Clear any saved dashboard customizations
            localStorage.removeItem('dashboard_layout');
            localStorage.removeItem('dashboard_widgets');
            
            // Reload dashboard
            location.reload();
        }
    }

    /**
     * Animate number changes
     */
    animateNumber(element, targetValue, prefix = '') {
        const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
            element.textContent = prefix + currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * Expand chart to full view
     */
    expandChart(chartType) {
        // This could load the advanced portfolio module
        if (window.moduleLoader) {
            window.moduleLoader.loadModule('portfolio');
        }
    }

    /**
     * Refresh dashboard
     */
    async refresh() {
        await this.loadData();
        if (this.portfolioChart) {
            this.portfolioChart.update();
        }
    }

    /**
     * Show widget library modal
     */
    showWidgetLibrary() {
        try {
            // Create modal if it doesn't exist
            let modal = document.getElementById('widget-library-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'widget-library-modal';
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center p-4';
                document.body.appendChild(modal);
            }

            const availableWidgets = [
                {
                    id: 'price-tracker',
                    name: 'ردیاب قیمت',
                    description: 'نمایش قیمت لحظه‌ای ارزهای مختلف',
                    icon: 'fa-chart-line',
                    category: 'market'
                },
                {
                    id: 'portfolio-summary',
                    name: 'خلاصه پورتفولیو',
                    description: 'نمایش کلی دارایی‌ها و سود/زیان',
                    icon: 'fa-wallet',
                    category: 'portfolio'
                },
                {
                    id: 'trading-signals',
                    name: 'سیگنال‌های معاملاتی',
                    description: 'آخرین سیگنال‌های هوش مصنوعی',
                    icon: 'fa-bullseye',
                    category: 'trading'
                },
                {
                    id: 'market-news',
                    name: 'اخبار بازار',
                    description: 'آخرین اخبار و تحلیل‌ها',
                    icon: 'fa-newspaper',
                    category: 'news'
                },
                {
                    id: 'performance-chart',
                    name: 'نمودار عملکرد',
                    description: 'نمودار عملکرد پورتفولیو در دوره‌های مختلف',
                    icon: 'fa-chart-area',
                    category: 'analytics'
                },
                {
                    id: 'active-trades',
                    name: 'معاملات فعال',
                    description: 'لیست معاملات در حال انجام',
                    icon: 'fa-exchange-alt',
                    category: 'trading'
                },
                {
                    id: 'ai-insights',
                    name: 'بینش‌های هوش مصنوعی',
                    description: 'توصیه‌ها و تحلیل‌های آرتمیس',
                    icon: 'fa-robot',
                    category: 'ai'
                },
                {
                    id: 'alerts-summary',
                    name: 'خلاصه هشدارها',
                    description: 'آخرین هشدارها و اعلان‌ها',
                    icon: 'fa-bell',
                    category: 'alerts'
                }
            ];

            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-white">🧩 کتابخانه ویجت‌ها</h3>
                        <button onclick="dashboardModule.hideWidgetLibrary()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto">
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${availableWidgets.map(widget => `
                                    <div class="bg-gray-900 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all cursor-pointer"
                                         onclick="dashboardModule.addWidget('${widget.id}')">
                                        <div class="flex items-center gap-3 mb-2">
                                            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                                <i class="fas ${widget.icon} text-white"></i>
                                            </div>
                                            <div>
                                                <h4 class="text-white font-medium">${widget.name}</h4>
                                                <span class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">${widget.category}</span>
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-400">${widget.description}</p>
                                        <div class="mt-3 flex justify-end">
                                            <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm">
                                                <i class="fas fa-plus mr-1"></i>افزودن
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
        } catch (error) {
            console.error('Widget library error:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در بارگذاری کتابخانه ویجت‌ها', 'error');
            }
        }
    }

    /**
     * Hide widget library modal
     */
    hideWidgetLibrary() {
        const modal = document.getElementById('widget-library-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    /**
     * Add widget to dashboard
     */
    async addWidget(widgetType) {
        try {
            console.log(`Adding widget: ${widgetType}`);
            
            // Get widget container
            const container = document.getElementById('dashboard-widgets-container');
            if (!container) {
                throw new Error('Dashboard container not found');
            }

            // Create widget element
            const widgetElement = document.createElement('div');
            widgetElement.className = 'dashboard-widget bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-300';
            widgetElement.dataset.widgetType = widgetType;
            
            // Generate widget content based on type
            const widgetContent = this.generateWidgetContent(widgetType);
            widgetElement.innerHTML = widgetContent;
            
            // Add to dashboard
            container.appendChild(widgetElement);
            
            // Close modal
            this.hideWidgetLibrary();
            
            // Show success message
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('ویجت با موفقیت اضافه شد', 'success');
            }
            
            // Save widget configuration
            this.saveWidgetConfiguration();
            
        } catch (error) {
            console.error('Error adding widget:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در افزودن ویجت', 'error');
            }
        }
    }

    /**
     * Generate widget content based on type
     */
    generateWidgetContent(widgetType) {
        const widgets = {
            'price-tracker': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">ردیاب قیمت</h3>
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <img src="https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/btc.png" class="w-6 h-6">
                            <span class="text-white">BTC/USDT</span>
                        </div>
                        <div class="text-right">
                            <div class="text-white font-semibold">$43,250</div>
                            <div class="text-green-400 text-sm">+2.34%</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <img src="https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/eth.png" class="w-6 h-6">
                            <span class="text-white">ETH/USDT</span>
                        </div>
                        <div class="text-right">
                            <div class="text-white font-semibold">$2,680</div>
                            <div class="text-red-400 text-sm">-1.23%</div>
                        </div>
                    </div>
                </div>
            `,
            'portfolio-summary': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">خلاصه پورتفولیو</h3>
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-white mb-2">$125,430</div>
                    <div class="text-green-400 text-sm mb-4">+5.67% این هفته</div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="bg-gray-700 rounded p-2">
                            <div class="text-gray-400">سود کل</div>
                            <div class="text-green-400 font-semibold">+$6,750</div>
                        </div>
                        <div class="bg-gray-700 rounded p-2">
                            <div class="text-gray-400">دارایی‌ها</div>
                            <div class="text-white font-semibold">8</div>
                        </div>
                    </div>
                </div>
            `,
            'trading-signals': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">سیگنال‌های معاملاتی</h3>
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="bg-green-900/30 border border-green-500/30 rounded p-3">
                        <div class="flex items-center justify-between">
                            <span class="text-green-400 font-semibold">خرید BTC</span>
                            <span class="text-green-400 text-sm">قوی</span>
                        </div>
                        <div class="text-gray-400 text-sm mt-1">RSI: 32, MACD: صعودی</div>
                    </div>
                    <div class="bg-yellow-900/30 border border-yellow-500/30 rounded p-3">
                        <div class="flex items-center justify-between">
                            <span class="text-yellow-400 font-semibold">نگهداری ETH</span>
                            <span class="text-yellow-400 text-sm">متوسط</span>
                        </div>
                        <div class="text-gray-400 text-sm mt-1">RSI: 58, حجم: کم</div>
                    </div>
                </div>
            `,
            'market-news': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">اخبار بازار</h3>
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="border-l-2 border-blue-500 pl-3">
                        <h4 class="text-white text-sm font-medium">بیت‌کوین به سطح مقاومت مهم رسید</h4>
                        <p class="text-gray-400 text-xs mt-1">تحلیلگران پیش‌بینی می‌کنند...</p>
                        <div class="text-gray-500 text-xs mt-1">2 ساعت پیش</div>
                    </div>
                    <div class="border-l-2 border-green-500 pl-3">
                        <h4 class="text-white text-sm font-medium">اتریوم بروزرسانی جدید دریافت کرد</h4>
                        <p class="text-gray-400 text-xs mt-1">بهبود عملکرد و کاهش هزینه...</p>
                        <div class="text-gray-500 text-xs mt-1">4 ساعت پیش</div>
                    </div>
                </div>
            `,
            'performance-chart': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">نمودار عملکرد</h3>
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="h-32 bg-gray-700 rounded flex items-center justify-center">
                    <div class="text-gray-400 text-center">
                        <i class="fas fa-chart-line text-2xl mb-2"></i>
                        <div class="text-sm">نمودار عملکرد</div>
                        <div class="text-xs">Chart.js در حال بارگذاری...</div>
                    </div>
                </div>
            `,
            'active-trades': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">معاملات فعال</h3>
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-2">
                    <div class="bg-gray-700 rounded p-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-green-400">خرید BTC</span>
                            <span class="text-white">+2.3%</span>
                        </div>
                        <div class="text-gray-400 text-xs">0.5 BTC @ $42,000</div>
                    </div>
                    <div class="bg-gray-700 rounded p-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-red-400">فروش ETH</span>  
                            <span class="text-white">-0.8%</span>
                        </div>
                        <div class="text-gray-400 text-xs">10 ETH @ $2,700</div>
                    </div>
                </div>
            `,
            'ai-insights': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">بینش‌های آرتمیس</h3>
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="bg-blue-900/30 border border-blue-500/30 rounded p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-robot text-blue-400"></i>
                            <span class="text-blue-400 font-semibold">توصیه آرتمیس</span>
                        </div>
                        <p class="text-gray-300 text-sm">بازار در حال تجمیع است. زمان مناسب برای خرید DCA.</p>
                        <div class="text-gray-500 text-xs mt-2">اطمینان: 87%</div>
                    </div>
                </div>
            `,
            'alerts-summary': `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">خلاصه هشدارها</h3>
                    <button onclick="window.dashboardModule.removeWidget(this.closest('[data-widget-type]'))" class="text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400 text-sm">هشدارهای فعال</span>
                        <span class="text-white font-semibold">3</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400 text-sm">امروز فعال شده</span>
                        <span class="text-green-400 font-semibold">2</span>
                    </div>
                    <div class="bg-yellow-900/30 border border-yellow-500/30 rounded p-2 mt-3">
                        <div class="text-yellow-400 text-sm font-medium">BTC > $44,000</div>
                        <div class="text-gray-400 text-xs">30 دقیقه پیش</div>
                    </div>
                </div>
            `
        };

        return widgets[widgetType] || `
            <div class="text-center text-gray-400">
                <i class="fas fa-puzzle-piece text-2xl mb-2"></i>
                <div>ویجت ${widgetType}</div>
                <div class="text-xs">در دست توسعه</div>
            </div>
        `;
    }

    /**
     * Save widget configuration
     */
    saveWidgetConfiguration() {
        try {
            const widgets = document.querySelectorAll('[data-widget-type]');
            const config = Array.from(widgets).map(widget => ({
                type: widget.dataset.widgetType,
                position: Array.from(widget.parentElement.children).indexOf(widget)
            }));
            
            localStorage.setItem('dashboard_widgets', JSON.stringify(config));
            console.log('💾 Widget configuration saved:', config);
        } catch (error) {
            console.error('Error saving widget configuration:', error);
        }
    }

    /**
     * Remove widget from dashboard
     */
    removeWidget(widgetElement) {
        try {
            if (widgetElement) {
                widgetElement.remove();
                // Save configuration after removal
                this.saveWidgetConfiguration();
                console.log('🗑️ Widget removed and configuration saved');
                
                // Show success message
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert('ویجت حذف شد', 'info');
                }
            }
        } catch (error) {
            console.error('Error removing widget:', error);
        }
    }

    /**
     * Load saved widget configuration
     */
    loadWidgetConfiguration() {
        try {
            const saved = localStorage.getItem('dashboard_widgets');
            if (!saved) {
                console.log('📋 No saved widget configuration found');
                return;
            }

            const config = JSON.parse(saved);
            console.log('📋 Loading saved widget configuration:', config);
            
            // Get dashboard grid container
            const container = document.getElementById('dashboard-grid');
            if (!container) {
                console.warn('Dashboard grid container not found');
                return;
            }

            // Clear existing widgets except default ones if any
            const existingWidgets = container.querySelectorAll('[data-widget-type]');
            existingWidgets.forEach(widget => {
                if (!widget.hasAttribute('data-default')) {
                    widget.remove();
                }
            });

            // Add widgets from saved configuration
            config.forEach(widgetConfig => {
                if (widgetConfig.type) {
                    this.addWidget(widgetConfig.type);
                }
            });
            
            console.log('✅ Widget configuration loaded successfully');
        } catch (error) {
            console.error('Error loading widget configuration:', error);
        }
    }

    /**
     * Open AI Management from dashboard widget
     */
    openAIManagement() {
        try {
            // Switch to settings tab and then to AI Management
            if (typeof app !== 'undefined' && app.loadModule) {
                app.loadModule('settings').then(() => {
                    // Wait for settings to load, then switch to AI Management tab
                    setTimeout(() => {
                        if (typeof settingsModule !== 'undefined' && settingsModule.switchTab) {
                            settingsModule.switchTab('ai-management');
                        }
                    }, 100);
                });
            } else {
                console.warn('App module loader not available');
            }
        } catch (error) {
            console.error('Error opening AI Management:', error);
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('خطا در باز کردن مدیریت AI', 'error');
            }
        }
    }

    /**
     * Update AI Analytics Widget with real-time data
     */
    async updateAIStats() {
        try {
            // Fetch AI data from API with authentication
            const token = localStorage.getItem('titan_auth_token');
            const response = await fetch('/api/ai-analytics/agents', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                
                // Update main stats
                const agentsCount = document.getElementById('ai-agents-count');
                const performanceSummary = document.getElementById('ai-performance-summary');
                const activeCount = document.getElementById('ai-active-count');
                const trainingCount = document.getElementById('ai-training-count');
                const standbyCount = document.getElementById('ai-standby-count');

                if (agentsCount) {
                    agentsCount.textContent = `${data.agents.length} Agent`;
                }

                if (performanceSummary) {
                    const avgPerformance = data.agents.reduce((sum, agent) => sum + agent.performance, 0) / data.agents.length;
                    performanceSummary.textContent = `میانگین عملکرد: ${Math.round(avgPerformance)}%`;
                }

                if (activeCount) {
                    const active = data.agents.filter(agent => agent.status === 'active').length;
                    activeCount.textContent = active;
                }

                if (trainingCount) {
                    const training = data.agents.filter(agent => agent.status === 'training').length;
                    trainingCount.textContent = training;
                }

                if (standbyCount) {
                    const standby = data.agents.filter(agent => agent.status === 'standby').length;
                    standbyCount.textContent = standby;
                }

            } else {
                console.warn('Failed to fetch AI analytics data');
            }
        } catch (error) {
            console.error('Error updating AI stats:', error);
            // Fallback to mock data if API fails
            this.setMockAIData();
        }
    }

    /**
     * Set mock AI data for development/fallback
     */
    setMockAIData() {
        const agentsCount = document.getElementById('ai-agents-count');
        const performanceSummary = document.getElementById('ai-performance-summary');
        const activeCount = document.getElementById('ai-active-count');
        const trainingCount = document.getElementById('ai-training-count');
        const standbyCount = document.getElementById('ai-standby-count');

        if (agentsCount) agentsCount.textContent = '15 Agent';
        if (performanceSummary) performanceSummary.textContent = 'میانگین عملکرد: 87%';
        if (activeCount) activeCount.textContent = '12';
        if (trainingCount) trainingCount.textContent = '2';
        if (standbyCount) standbyCount.textContent = '1';
    }

    /**
     * 🔒 PRODUCTION SAFETY: Show NO-DATA state across entire dashboard
     * @param {string} reason - Reason for no data
     */
    showNoDataState(reason = 'No valid data available') {
        console.warn('🚫 Displaying NO-DATA state:', reason);
        
        const dashboardContainer = document.getElementById('dashboard-widgets-container');
        if (dashboardContainer) {
            const noDataBanner = document.createElement('div');
            noDataBanner.id = 'no-data-banner';
            noDataBanner.className = 'col-span-full bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6 text-center';
            noDataBanner.innerHTML = `
                <div class="flex flex-col items-center gap-3">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl"></i>
                    <h3 class="text-xl font-bold text-red-400">No Data Available</h3>
                    <p class="text-gray-300 max-w-md">${reason}</p>
                    <button onclick="window.dashboardModule.refreshData()" 
                            class="mt-3 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i>Try Again
                    </button>
                </div>
            `;
            dashboardContainer.prepend(noDataBanner);
        }
        
        this.replaceAllWidgetsWithNoData();
    }

    /**
     * 🔒 Replace all widget data with NO-DATA placeholders
     */
    replaceAllWidgetsWithNoData() {
        const dataCardIds = [
            'total-balance-card', 'balance-change', 'active-trades-card',
            'total-pnl-card', 'win-rate-card', 'sharpe-ratio-card', 'system-health-card',
            'btc-price-card', 'eth-price-card', 'fear-greed-card', 'btc-dominance-card',
            'today-trades-card', 'pending-orders-card', 'volume-24h-card',
            'total-exposure-card', 'risk-score-card', 'current-drawdown-card',
            'completed-courses-card', 'current-level-card', 'weekly-progress-card', 'total-sessions-card',
            'active-agents-card', 'avg-performance-card'
        ];
        
        dataCardIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '<span class="text-gray-500 text-sm">—</span>';
            }
        });
        
        const aiAgentsContainer = document.getElementById('ai-agents-container');
        if (aiAgentsContainer) {
            aiAgentsContainer.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-database text-3xl mb-3 text-red-400"></i>
                    <p class="text-lg font-semibold">No Agent Data Available</p>
                </div>
            `;
        }
        
        const recentActivities = document.getElementById('recent-activities');
        if (recentActivities) {
            recentActivities.innerHTML = `
                <div class="text-center text-gray-400 py-4">
                    <i class="fas fa-inbox text-2xl mb-2 text-gray-500"></i>
                    <p>No activity data available</p>
                </div>
            `;
        }
        
        ['portfolio-chart-loading', 'agents-chart-loading', 'volume-chart-loading'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = `<div class="text-center text-gray-500"><i class="fas fa-chart-line text-3xl mb-2 opacity-30"></i><div class="text-sm">No chart data</div></div>`;
            }
        });
    }

    /**
     * 🔒 Disable all action buttons when data is invalid
     */
    disableAllActionButtons() {
        console.log('🔒 Disabling all action buttons (invalid data)');
        const actionButtons = document.querySelectorAll('button[onclick*="trade"], button[onclick*="buy"], button[onclick*="sell"]');
        actionButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
            button.title = 'Disabled: No valid data available';
        });
    }

    /**
     * 🔓 Enable all action buttons when data is valid
     */
    enableAllActionButtons() {
        console.log('✅ Enabling all action buttons (valid data)');
        const disabledButtons = document.querySelectorAll('button[disabled]');
        disabledButtons.forEach(button => {
            if (button.classList.contains('cursor-not-allowed')) {
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.removeAttribute('title');
            }
        });
    }

    /**
     * 🏷️ Show source badge (ALWAYS visible for data transparency)
     */
    showSourceBadge(source) {
        if (!validationFunctions) return;
        
        const existingBadge = document.getElementById('data-source-badge');
        if (existingBadge) existingBadge.remove();
        
        const badge = document.createElement('div');
        badge.id = 'data-source-badge';
        badge.className = `fixed bottom-4 left-4 z-50 px-3 py-2 rounded-lg border text-xs font-mono ${validationFunctions.getSourceBadgeColor(source)} shadow-lg`;
        badge.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-database"></i>
                <span>منبع: ${validationFunctions.getSourceDisplayName(source)}</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-400">${new Date(this.dashboardData.meta.ts).toLocaleTimeString('fa-IR')}</span>
            </div>
        `;
        document.body.appendChild(badge);
    }

    /**
     * Refresh dashboard data - called by UI buttons
     */
    async refreshData() {
        console.log('🔄 Refreshing dashboard data...');
        try {
            await this.loadDashboardData();
            this.updateLastUpdateTime();
            console.log('✅ Dashboard data refreshed');
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
        }
    }

    /**
     * Show widget library with all available widgets
     */
    showWidgetLibrary() {
        console.log('📦 Opening widget library...');
        
        // Define available widgets with descriptions
        const availableWidgets = [
            {
                type: 'price-tracker',
                name: 'ردیاب قیمت',
                description: 'نمایش قیمت‌های لحظه‌ای ارزهای دیجیتال',
                icon: 'fas fa-chart-line'
            },
            {
                type: 'portfolio-summary', 
                name: 'خلاصه پورتفولیو',
                description: 'اطلاعات کلی و عملکرد پورتفولیو شما',
                icon: 'fas fa-wallet'
            },
            {
                type: 'trading-signals',
                name: 'سیگنال‌های معاملاتی', 
                description: 'سیگنال‌های خرید و فروش بر اساس تحلیل تکنیکال',
                icon: 'fas fa-bullseye'
            },
            {
                type: 'market-news',
                name: 'اخبار بازار',
                description: 'آخرین اخبار و تحلیل‌های بازار ارز دیجیتال',
                icon: 'fas fa-newspaper'
            },
            {
                type: 'performance-chart',
                name: 'نمودار عملکرد',
                description: 'نمودار عملکرد پورتفولیو در بازه‌های زمانی مختلف',
                icon: 'fas fa-chart-area'
            },
            {
                type: 'active-trades',
                name: 'معاملات فعال',
                description: 'لیست معاملات باز و در حال انجام',
                icon: 'fas fa-exchange-alt'
            },
            {
                type: 'ai-insights',
                name: 'بینش‌های آرتمیس',
                description: 'تحلیل‌ها و پیشنهادات هوش مصنوعی آرتمیس',
                icon: 'fas fa-robot'
            },
            {
                type: 'alerts-summary',
                name: 'خلاصه هشدارها',
                description: 'وضعیت هشدارهای قیمت و نوتیفیکیشن‌ها',
                icon: 'fas fa-bell'
            }
        ];

        // Create modal HTML
        const modalHTML = `
            <div id="widget-library-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b border-gray-700">
                        <h2 class="text-xl font-bold text-white flex items-center gap-2">
                            <i class="fas fa-th-large text-blue-400"></i>
                            کتابخانه ویجت‌ها
                        </h2>
                        <button onclick="document.getElementById('widget-library-modal').remove()" 
                                class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-6 overflow-y-auto max-h-96">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${availableWidgets.map(widget => `
                                <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600 hover:border-blue-500"
                                     onclick="window.dashboardModule.addWidgetFromLibrary('${widget.type}'); document.getElementById('widget-library-modal').remove();">
                                    <div class="flex items-center gap-3 mb-3">
                                        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <i class="${widget.icon} text-white"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-white">${widget.name}</h3>
                                        </div>
                                    </div>
                                    <p class="text-gray-300 text-sm leading-relaxed">${widget.description}</p>
                                    <div class="mt-3 flex justify-end">
                                        <span class="text-blue-400 text-sm font-medium hover:text-blue-300">
                                            <i class="fas fa-plus mr-1"></i>
                                            افزودن
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-750">
                        <div class="text-gray-400 text-sm">
                            <i class="fas fa-info-circle mr-1"></i>
                            ${availableWidgets.length} ویجت موجود
                        </div>
                        <button onclick="document.getElementById('widget-library-modal').remove()" 
                                class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                            بستن
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add click outside to close
        setTimeout(() => {
            const modal = document.getElementById('widget-library-modal');
            const modalContent = modal.querySelector('.bg-gray-800');
            modal.addEventListener('click', (e) => {
                if (!modalContent.contains(e.target)) {
                    modal.remove();
                }
            });
        }, 100);
    }

    /**
     * Add widget from library (called from modal)
     */
    addWidgetFromLibrary(widgetType) {
        console.log(`📦 Adding widget from library: ${widgetType}`);
        this.addWidget(widgetType);
    }

    /**
     * Clear all custom widgets
     */
    clearAllWidgets() {
        try {
            const container = document.getElementById('dashboard-widgets-container');
            if (!container) return;

            // Confirm before clearing
            if (!confirm('آیا مطمئن هستید که می‌خواهید تمام ویجت‌های اضافه شده را حذف کنید؟')) {
                return;
            }

            // Remove all custom widgets (keep only default ones)
            const customWidgets = container.querySelectorAll('[data-widget-type]:not([data-default])');
            customWidgets.forEach(widget => widget.remove());

            // Clear saved configuration
            localStorage.removeItem('dashboard_widgets');
            
            console.log('🗑️ All custom widgets cleared');
            if (typeof app !== 'undefined' && app.showAlert) {
                app.showAlert('تمام ویجت‌ها پاک شدند', 'info');
            }
        } catch (error) {
            console.error('Error clearing widgets:', error);
        }
    }

    /**
     * Reset dashboard to default layout
     */
    resetToDefault() {
        try {
            // Confirm before resetting
            if (!confirm('آیا مطمئن هستید که می‌خواهید داشبورد را به حالت پیش‌فرض برگردانید؟')) {
                return;
            }

            // Clear all widgets
            this.clearAllWidgets();

            // Add default widgets
            const defaultWidgets = ['portfolio-summary', 'price-tracker', 'trading-signals'];
            
            setTimeout(() => {
                defaultWidgets.forEach(widgetType => {
                    this.addWidget(widgetType);
                });
                console.log('🔄 Dashboard reset to default layout');
                if (typeof app !== 'undefined' && app.showAlert) {
                    app.showAlert('داشبورد به حالت پیش‌فرض بازنشانی شد', 'success');
                }
            }, 100);

        } catch (error) {
            console.error('Error resetting dashboard:', error);
        }
    }
}

// Register module in global namespace
window.TitanModules = window.TitanModules || {};
window.TitanModules.DashboardModule = DashboardModule;

// Also make it available directly as window.DashboardModule for direct access
window.DashboardModule = DashboardModule;

// Create global instance for easy access
window.dashboardModule = null;