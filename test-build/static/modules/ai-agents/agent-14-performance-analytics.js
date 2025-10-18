/**
 * TITAN Trading System - Agent 14: Performance Analytics Specialist
 * 
 * Advanced AI agent specializing in comprehensive performance analysis, attribution,
 * and optimization of trading strategies and portfolio performance.
 * 
 * Key Features:
 * - Multi-dimensional performance analysis using neural networks
 * - Attribution analysis (security selection, asset allocation, timing)
 * - Risk-adjusted performance metrics (Sharpe, Sortino, Calmar, etc.)
 * - Benchmark comparison and tracking error analysis
 * - Factor exposure analysis and style drift detection
 * - Performance forecasting and predictive analytics
 * - Real-time performance monitoring and alerting
 * - Strategy performance optimization recommendations
 * - Inter-agent communication for coordinated performance improvement
 * 
 * @author TITAN Trading System
 * @version 2.1.0
 */

class PerformanceAnalyticsAgent {
    constructor(config = {}) {
        this.agentId = 'AGENT_14_PERFORMANCE_ANALYTICS';
        this.name = 'Performance Analytics Specialist';
        this.version = '2.1.0';
        
        // Configuration
        this.config = {
            analysisInterval: config.analysisInterval || 120000, // 2 minutes
            benchmarkSymbols: config.benchmarkSymbols || ['SPY', 'QQQ', 'IWM', 'VTI'],
            performanceWindow: config.performanceWindow || 252, // 1 year
            attributionLevels: config.attributionLevels || ['security', 'sector', 'strategy'],
            riskFreeRate: config.riskFreeRate || 0.02, // 2% annual
            alertThresholds: {
                underperformance: config.underperformanceThreshold || -0.05, // -5%
                trackingError: config.trackingErrorThreshold || 0.05, // 5%
                maxDrawdown: config.maxDrawdownThreshold || 0.15, // 15%
                sharpeRatio: config.sharpeRatioThreshold || 1.0
            },
            // Real Performance Data APIs
            apis: {
                alphavantage: {
                    key: config.alphaVantageKey || 'demo',
                    baseUrl: 'https://www.alphavantage.co/query',
                    enabled: !!config.alphaVantageKey
                },
                finnhub: {
                    key: config.finnhubKey || 'demo',
                    baseUrl: 'https://finnhub.io/api/v1',
                    enabled: !!config.finnhubKey
                },
                fred: {
                    key: config.fredKey || 'demo',
                    baseUrl: 'https://api.stlouisfed.org/fred',
                    enabled: !!config.fredKey
                },
                binance: {
                    websocket: 'wss://stream.binance.com:9443/ws',
                    enabled: true
                }
            },
            ...config
        };
        
        // API Management
        this.websockets = new Map();
        this.circuitBreakers = new Map();
        this.apiRequestCounts = new Map();
        this.performanceDataStreams = new Map();
        
        // Performance data and metrics
        this.portfolioReturns = [];
        this.benchmarkReturns = new Map();
        this.performanceMetrics = new Map();
        this.attributionAnalysis = new Map();
        
        // Portfolio and position data
        this.portfolioData = {
            positions: new Map(),
            historicalValues: [],
            transactions: [],
            weights: new Map()
        };
        
        // Market and factor data
        this.marketData = new Map();
        this.factorReturns = new Map();
        this.economicIndicators = new Map();
        
        // Performance analytics and models
        this.performanceModels = {
            attribution: null,
            forecasting: null,
            optimization: null,
            riskAdjusted: null
        };
        
        // Neural Networks for performance analysis
        this.performanceNN = null;
        this.attributionNN = null;
        this.forecastingNN = null;
        this.optimizationNN = null;
        
        // Communication
        this.communicationChannel = null;
        this.messageQueue = [];
        
        // Analysis state
        this.isAnalyzing = false;
        this.analysisResults = [];
        this.performanceAlerts = [];
        
        // Initialize agent
        this.initialize();
    }
    
    async initialize() {
        try {
            console.log(`[${this.agentId}] Initializing Performance Analytics Agent v${this.version}`);
            
            // Initialize API clients
            await this.initializePerformanceAPIs();
            
            // Initialize neural networks
            await this.initializePerformanceNeuralNetworks();
            
            // Setup communication
            this.setupCommunication();
            
            // Setup real-time performance monitoring
            await this.setupRealTimePerformanceStreams();
            
            // Load historical performance data
            await this.loadHistoricalPerformanceData();
            
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            console.log(`[${this.agentId}] Performance Analytics Agent initialized successfully`);
            
        } catch (error) {
            console.error(`[${this.agentId}] Initialization error:`, error);
        }
    }
    
    // ============================================================================
    // REAL PERFORMANCE DATA API INTEGRATION
    // ============================================================================
    
    async initializePerformanceAPIs() {
        // Initialize Circuit Breakers
        this.circuitBreakers.set('alphavantage', new CircuitBreaker({
            failureThreshold: 3,
            recoveryTimeout: 60000,
            monitoringPeriod: 60000
        }));
        
        this.circuitBreakers.set('finnhub', new CircuitBreaker({
            failureThreshold: 5,
            recoveryTimeout: 30000,
            monitoringPeriod: 60000
        }));
        
        this.circuitBreakers.set('fred', new CircuitBreaker({
            failureThreshold: 3,
            recoveryTimeout: 60000,
            monitoringPeriod: 60000
        }));
        
        this.circuitBreakers.set('binance', new CircuitBreaker({
            failureThreshold: 5,
            recoveryTimeout: 30000,
            monitoringPeriod: 60000
        }));
        
        // Initialize request counters
        this.apiRequestCounts.set('alphavantage', { count: 0, resetTime: Date.now() + 86400000 });
        this.apiRequestCounts.set('finnhub', { count: 0, resetTime: Date.now() + 60000 });
        this.apiRequestCounts.set('fred', { count: 0, resetTime: Date.now() + 86400000 });
        
        console.log(`[${this.agentId}] Performance API clients initialized`);
    }
    
    async setupRealTimePerformanceStreams() {
        try {
            // Setup benchmark tracking via Binance
            if (this.config.apis.binance.enabled) {
                await this.setupBenchmarkTracking();
            }
            
            // Setup economic indicators polling
            this.setupEconomicIndicatorsPolling();
            
            // Setup market performance polling
            this.setupMarketPerformancePolling();
            
            console.log(`[${this.agentId}] Real-time performance streams initialized`);
        } catch (error) {
            console.error(`[${this.agentId}] Performance streams setup error:`, error);
        }
    }
    
    async setupBenchmarkTracking() {
        try {
            // Track crypto market performance for correlation analysis
            const symbols = ['btcusdt', 'ethusdt'];
            const streams = symbols.map(symbol => `${symbol}@ticker`).join('/');
            
            const wsUrl = `${this.config.apis.binance.websocket}/${streams}`;
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                console.log(`[${this.agentId}] Performance tracking WebSocket connected`);
                this.websockets.set('performance_tracker', ws);
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.processBenchmarkData(data);
                } catch (error) {
                    console.error(`[${this.agentId}] Benchmark data processing error:`, error);
                }
            };
            
            ws.onerror = (error) => {
                console.error(`[${this.agentId}] Performance WebSocket error:`, error);
                this.circuitBreakers.get('binance').recordFailure();
            };
            
            ws.onclose = () => {
                console.log(`[${this.agentId}] Performance WebSocket disconnected, attempting reconnect...`);
                setTimeout(() => this.setupBenchmarkTracking(), 5000);
            };
            
        } catch (error) {
            console.error(`[${this.agentId}] Benchmark tracking setup error:`, error);
        }
    }
    
    processBenchmarkData(data) {
        if (data.stream && data.data) {
            const ticker = data.data;
            const symbol = ticker.s;
            const priceChange = parseFloat(ticker.P);
            const price = parseFloat(ticker.c);
            
            // Store benchmark performance data
            this.performanceDataStreams.set(symbol, {
                symbol: symbol,
                price: price,
                dayChange: priceChange,
                volume: parseFloat(ticker.v),
                high: parseFloat(ticker.h),
                low: parseFloat(ticker.l),
                timestamp: ticker.E
            });
            
            // Calculate real-time correlation with portfolio
            this.calculateRealTimeCorrelation(symbol, priceChange);
        }
    }
    
    calculateRealTimeCorrelation(benchmarkSymbol, benchmarkChange) {
        // Simplified correlation calculation
        const portfolioChange = this.getCurrentPortfolioChange();
        
        if (portfolioChange !== null) {
            const correlation = (portfolioChange * benchmarkChange) > 0 ? 0.7 : -0.3;
            
            this.performanceMetrics.set(`correlation_${benchmarkSymbol}`, {
                correlation: correlation,
                portfolioChange: portfolioChange,
                benchmarkChange: benchmarkChange,
                timestamp: Date.now()
            });
            
            // Alert on high tracking error
            const trackingError = Math.abs(portfolioChange - benchmarkChange);
            if (trackingError > this.config.alertThresholds.trackingError * 100) {
                this.triggerPerformanceAlert({
                    type: 'HIGH_TRACKING_ERROR',
                    severity: trackingError > 10 ? 'CRITICAL' : 'HIGH',
                    benchmarkSymbol: benchmarkSymbol,
                    trackingError: trackingError,
                    timestamp: Date.now()
                });
            }
        }
    }
    
    setupEconomicIndicatorsPolling() {
        // Poll economic indicators every 4 hours
        setInterval(async () => {
            await this.fetchEconomicIndicators();
        }, 14400000);
        
        // Initial call
        setTimeout(() => this.fetchEconomicIndicators(), 15000);
    }
    
    async fetchEconomicIndicators() {
        if (!this.config.apis.fred.enabled || !this.checkRateLimit('fred')) return;
        
        try {
            // Fetch key economic indicators from FRED API (if available)
            const indicators = ['GDP', 'UNRATE', 'CPIAUCSL']; // GDP, Unemployment, CPI
            
            for (const indicator of indicators) {
                await this.circuitBreakers.get('fred').execute(async () => {
                    const url = `${this.config.apis.fred.baseUrl}/series/observations?series_id=${indicator}&api_key=${this.config.apis.fred.key}&file_type=json&limit=1&sort_order=desc`;
                    
                    const response = await fetch(url);
                    if (!response.ok) return;
                    
                    const data = await response.json();
                    
                    if (data.observations && data.observations.length > 0) {
                        const latest = data.observations[0];
                        
                        this.performanceDataStreams.set(`ECON_${indicator}`, {
                            indicator: indicator,
                            value: parseFloat(latest.value),
                            date: latest.date,
                            timestamp: Date.now()
                        });
                    }
                });
                
                this.incrementApiCount('fred');
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (error) {
            console.error(`[${this.agentId}] Economic indicators fetch error:`, error);
        }
    }
    
    setupMarketPerformancePolling() {
        // Poll market performance data every 10 minutes
        setInterval(async () => {
            await this.fetchMarketPerformanceData();
        }, 600000);
        
        // Initial call
        setTimeout(() => this.fetchMarketPerformanceData(), 20000);
    }
    
    async fetchMarketPerformanceData() {
        if (!this.config.apis.alphavantage.enabled || !this.checkRateLimit('alphavantage')) return;
        
        try {
            // Fetch S&P 500 performance data
            return await this.circuitBreakers.get('alphavantage').execute(async () => {
                const url = `${this.config.apis.alphavantage.baseUrl}?function=GLOBAL_QUOTE&symbol=SPY&apikey=${this.config.apis.alphavantage.key}`;
                
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
                
                const data = await response.json();
                const quote = data['Global Quote'];
                
                if (quote && quote['05. price']) {
                    this.performanceDataStreams.set('SPY_BENCHMARK', {
                        symbol: 'SPY',
                        price: parseFloat(quote['05. price']),
                        change: parseFloat(quote['09. change']),
                        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                        volume: parseFloat(quote['06. volume']),
                        timestamp: Date.now()
                    });
                    
                    // Calculate portfolio beta vs S&P 500
                    this.calculatePortfolioBeta();
                }
                
                this.incrementApiCount('alphavantage');
            });
        } catch (error) {
            console.error(`[${this.agentId}] Market performance data fetch error:`, error);
        }
    }
    
    calculatePortfolioBeta() {
        const spyData = this.performanceDataStreams.get('SPY_BENCHMARK');
        const portfolioChange = this.getCurrentPortfolioChange();
        
        if (spyData && portfolioChange !== null) {
            // Simplified beta calculation
            const beta = portfolioChange / (spyData.changePercent || 1);
            
            this.performanceMetrics.set('portfolio_beta', {
                beta: beta,
                marketReturn: spyData.changePercent,
                portfolioReturn: portfolioChange,
                timestamp: Date.now()
            });
            
            // Alert on high beta
            if (Math.abs(beta) > 2.0) {
                this.triggerPerformanceAlert({
                    type: 'HIGH_BETA',
                    severity: Math.abs(beta) > 3.0 ? 'CRITICAL' : 'HIGH',
                    beta: beta,
                    timestamp: Date.now()
                });
            }
        }
    }
    
    getCurrentPortfolioChange() {
        // This would normally get real portfolio data from other agents
        // For now, return a simulated value based on recent performance
        return Math.random() * 4 - 2; // -2% to +2%
    }
    
    triggerPerformanceAlert(alert) {
        const alertId = `PERFORMANCE_${alert.type}_${Date.now()}`;
        alert.id = alertId;
        
        // Send alert to other agents
        this.sendMessage({
            type: 'PERFORMANCE_ALERT',
            data: alert
        });
        
        console.log(`[${this.agentId}] Performance alert: ${alert.type} - ${alert.severity}`);
    }
    
    // Neural Network Implementation
    async initializePerformanceNeuralNetworks() {
        // Performance Analysis Network
        this.performanceNN = new PerformanceAnalysisNN({
            inputSize: 75, // Returns, volatility, correlations, factors, etc.
            hiddenLayers: [150, 120, 90, 60, 30],
            outputSize: 15, // Performance metrics and scores
            learningRate: 0.0002,
            optimizer: 'adam',
            activationFunction: 'leaky_relu'
        });
        
        // Attribution Analysis Network
        this.attributionNN = new AttributionAnalysisNN({
            inputSize: 50, // Asset returns, weights, benchmark data, etc.
            hiddenLayers: [100, 80, 60, 40],
            outputSize: 12, // Attribution components
            learningRate: 0.0003,
            optimizer: 'adam',
            activationFunction: 'relu'
        });
        
        // Performance Forecasting Network (LSTM-based)
        this.forecastingNN = new PerformanceForecastingLSTM({
            inputSize: 40, // Time series features
            hiddenSize: 80,
            numLayers: 3,
            outputSize: 8, // Forecasted metrics
            learningRate: 0.0001,
            optimizer: 'adam'
        });
        
        // Performance Optimization Network
        this.optimizationNN = new PerformanceOptimizationNN({
            inputSize: 60, // Current metrics, constraints, objectives
            hiddenLayers: [120, 90, 60, 30],
            outputSize: 20, // Optimization recommendations
            learningRate: 0.0005,
            optimizer: 'rmsprop',
            activationFunction: 'tanh'
        });
        
        console.log(`[${this.agentId}] Performance neural networks initialized`);
    }
    
    setupCommunication() {
        // Inter-agent communication
        this.communicationChannel = new BroadcastChannel('titan_agents');
        
        this.communicationChannel.onmessage = (event) => {
            this.handleAgentMessage(event.data);
        };
        
        // Send initialization message
        this.sendMessage({
            type: 'AGENT_INITIALIZED',
            agentId: this.agentId,
            capabilities: [
                'performance_analysis',
                'attribution_analysis',
                'risk_adjusted_metrics',
                'benchmark_comparison',
                'factor_analysis',
                'performance_forecasting',
                'strategy_optimization',
                'real_time_monitoring'
            ],
            timestamp: Date.now()
        });
    }
    
    handleAgentMessage(message) {
        try {
            switch (message.type) {
                case 'PORTFOLIO_UPDATE':
                    this.handlePortfolioUpdate(message.data);
                    break;
                case 'TRADE_EXECUTION':
                    this.handleTradeExecution(message.data);
                    break;
                case 'POSITION_UPDATE':
                    this.handlePositionUpdate(message.data);
                    break;
                case 'MARKET_DATA_UPDATE':
                    this.handleMarketDataUpdate(message.data);
                    break;
                case 'BENCHMARK_UPDATE':
                    this.handleBenchmarkUpdate(message.data);
                    break;
                case 'PERFORMANCE_REQUEST':
                    this.handlePerformanceRequest(message);
                    break;
                case 'ATTRIBUTION_REQUEST':
                    this.handleAttributionRequest(message);
                    break;
                case 'OPTIMIZATION_REQUEST':
                    this.handleOptimizationRequest(message);
                    break;
                default:
                    // Store for later processing
                    this.messageQueue.push(message);
            }
        } catch (error) {
            console.error(`[${this.agentId}] Error handling message:`, error);
        }
    }
    
    sendMessage(message) {
        if (this.communicationChannel) {
            this.communicationChannel.postMessage({
                ...message,
                fromAgent: this.agentId,
                timestamp: Date.now()
            });
        }
    }
    
    // Core Performance Analysis
    async analyzePerformance(period = null) {
        try {
            const startTime = performance.now();
            
            // Get performance data for the period
            const performanceData = this.getPerformanceData(period);
            
            if (!performanceData || performanceData.returns.length < 30) {
                console.warn(`[${this.agentId}] Insufficient data for performance analysis`);
                return null;
            }
            
            // Calculate basic performance metrics
            const basicMetrics = this.calculateBasicPerformanceMetrics(performanceData);
            
            // Calculate risk-adjusted metrics
            const riskAdjustedMetrics = this.calculateRiskAdjustedMetrics(performanceData);
            
            // Benchmark comparison
            const benchmarkComparison = await this.performBenchmarkComparison(performanceData);
            
            // Factor analysis
            const factorAnalysis = await this.performFactorAnalysis(performanceData);
            
            // Neural network analysis
            const nnAnalysis = await this.performNeuralNetworkAnalysis(performanceData);
            
            // Style analysis
            const styleAnalysis = await this.performStyleAnalysis(performanceData);
            
            // Performance attribution
            const attributionResults = await this.performAttributionAnalysis(performanceData);
            
            const performanceReport = {
                period: period || { start: performanceData.startDate, end: performanceData.endDate },
                basic: basicMetrics,
                riskAdjusted: riskAdjustedMetrics,
                benchmark: benchmarkComparison,
                factors: factorAnalysis,
                neuralNetwork: nnAnalysis,
                style: styleAnalysis,
                attribution: attributionResults,
                processingTime: performance.now() - startTime,
                timestamp: Date.now()
            };
            
            // Store results
            this.performanceMetrics.set(Date.now(), performanceReport);
            
            // Check for performance alerts
            await this.checkPerformanceAlerts(performanceReport);
            
            // Send performance update
            this.sendMessage({
                type: 'PERFORMANCE_UPDATE',
                data: performanceReport
            });
            
            console.log(`[${this.agentId}] Performance analysis completed - Return: ${(basicMetrics.totalReturn * 100).toFixed(2)}%, Sharpe: ${riskAdjustedMetrics.sharpeRatio.toFixed(3)}`);
            
            return performanceReport;
            
        } catch (error) {
            console.error(`[${this.agentId}] Performance analysis error:`, error);
            return null;
        }
    }
    
    calculateBasicPerformanceMetrics(data) {
        const returns = data.returns;
        const values = data.portfolioValues;
        
        // Total return
        const totalReturn = (values[values.length - 1] - values[0]) / values[0];
        
        // Annualized return
        const periods = returns.length;
        const annualizedReturn = Math.pow(1 + totalReturn, 252 / periods) - 1;
        
        // Volatility (annualized)
        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
        const volatility = Math.sqrt(variance * 252);
        
        // Maximum drawdown
        const maxDrawdown = this.calculateMaxDrawdown(values);
        
        // Win rate
        const winningDays = returns.filter(r => r > 0).length;
        const winRate = winningDays / returns.length;
        
        // Average win/loss
        const wins = returns.filter(r => r > 0);
        const losses = returns.filter(r => r < 0);
        const avgWin = wins.length > 0 ? wins.reduce((sum, w) => sum + w, 0) / wins.length : 0;
        const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0;
        
        return {
            totalReturn,
            annualizedReturn,
            volatility,
            maxDrawdown,
            winRate,
            avgWin,
            avgLoss,
            profitFactor: avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : Infinity,
            totalTrades: data.transactions?.length || 0,
            currentValue: values[values.length - 1]
        };
    }
    
    calculateRiskAdjustedMetrics(data) {
        const returns = data.returns;
        const riskFreeRate = this.config.riskFreeRate;
        
        // Sharpe Ratio
        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const annualizedMeanReturn = meanReturn * 252;
        const volatility = Math.sqrt(returns.reduce((sum, r) => 
            sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1) * 252);
        const sharpeRatio = volatility > 0 ? (annualizedMeanReturn - riskFreeRate) / volatility : 0;
        
        // Sortino Ratio
        const downsideReturns = returns.filter(r => r < 0);
        const downsideDeviation = downsideReturns.length > 0 ? 
            Math.sqrt(downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length * 252) : 0;
        const sortinoRatio = downsideDeviation > 0 ? (annualizedMeanReturn - riskFreeRate) / downsideDeviation : 0;
        
        // Calmar Ratio
        const maxDrawdown = this.calculateMaxDrawdown(data.portfolioValues);
        const calmarRatio = maxDrawdown > 0 ? annualizedMeanReturn / maxDrawdown : 0;
        
        // Information Ratio
        const benchmarkReturns = this.getBenchmarkReturns(returns.length);
        const trackingError = this.calculateTrackingError(returns, benchmarkReturns);
        const excessReturns = returns.map((r, i) => r - (benchmarkReturns[i] || 0));
        const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length * 252;
        const informationRatio = trackingError > 0 ? avgExcessReturn / trackingError : 0;
        
        // Alpha and Beta
        const { alpha, beta } = this.calculateAlphaBeta(returns, benchmarkReturns);
        
        // Treynor Ratio
        const treynorRatio = beta > 0 ? (annualizedMeanReturn - riskFreeRate) / beta : 0;
        
        // Value at Risk (95% confidence)
        const sortedReturns = returns.slice().sort((a, b) => a - b);
        const var95 = sortedReturns[Math.floor(sortedReturns.length * 0.05)];
        
        // Conditional Value at Risk
        const cvar95 = sortedReturns.slice(0, Math.floor(sortedReturns.length * 0.05))
            .reduce((sum, r) => sum + r, 0) / Math.floor(sortedReturns.length * 0.05);
        
        return {
            sharpeRatio,
            sortinoRatio,
            calmarRatio,
            informationRatio,
            treynorRatio,
            alpha,
            beta,
            trackingError,
            var95,
            cvar95,
            downsideDeviation
        };
    }
    
    async performBenchmarkComparison(data) {
        const benchmarkComparisons = new Map();
        
        for (const benchmarkSymbol of this.config.benchmarkSymbols) {
            const benchmarkReturns = this.getBenchmarkReturns(data.returns.length, benchmarkSymbol);
            
            if (benchmarkReturns.length > 0) {
                const comparison = this.compareToBenchmark(data.returns, benchmarkReturns);
                benchmarkComparisons.set(benchmarkSymbol, {
                    ...comparison,
                    correlationWithBenchmark: this.calculateCorrelation(data.returns, benchmarkReturns),
                    betaVsBenchmark: this.calculateBeta(data.returns, benchmarkReturns),
                    alphaVsBenchmark: this.calculateAlpha(data.returns, benchmarkReturns)
                });
            }
        }
        
        return Object.fromEntries(benchmarkComparisons);
    }
    
    async performFactorAnalysis(data) {
        try {
            // Multi-factor model analysis
            const factorExposures = new Map();
            
            // Fama-French factors
            const factors = ['market', 'size', 'value', 'momentum', 'quality', 'lowVol'];
            
            for (const factor of factors) {
                const factorReturns = this.getFactorReturns(factor, data.returns.length);
                if (factorReturns.length > 0) {
                    const exposure = this.calculateFactorExposure(data.returns, factorReturns);
                    factorExposures.set(factor, exposure);
                }
            }
            
            // Style analysis
            const styleFactors = this.performReturnBasedStyleAnalysis(data.returns);
            
            // Factor attribution
            const factorAttribution = this.calculateFactorAttribution(data.returns, factorExposures);
            
            return {
                exposures: Object.fromEntries(factorExposures),
                styleFactors,
                attribution: factorAttribution,
                rSquared: this.calculateFactorRSquared(data.returns, factorExposures)
            };
            
        } catch (error) {
            console.error(`[${this.agentId}] Factor analysis error:`, error);
            return {};
        }
    }
    
    async performNeuralNetworkAnalysis(data) {
        try {
            // Prepare features for neural network
            const features = await this.preparePerformanceFeatures(data);
            const normalizedFeatures = this.normalizeFeatures(features);
            
            // Performance neural network analysis
            const performanceScores = await this.performanceNN.forward(normalizedFeatures);
            
            // Interpret results
            const analysisResults = {
                overallScore: performanceScores[0],
                riskScore: performanceScores[1],
                returnScore: performanceScores[2],
                consistencyScore: performanceScores[3],
                efficiencyScore: performanceScores[4],
                stabilityScore: performanceScores[5],
                outperformanceScore: performanceScores[6],
                diversificationScore: performanceScores[7],
                timingScore: performanceScores[8],
                selectionScore: performanceScores[9],
                marketCycleAdaptation: performanceScores[10],
                volatilityManagement: performanceScores[11],
                drawdownControl: performanceScores[12],
                momentumCapture: performanceScores[13],
                defensiveCapability: performanceScores[14]
            };
            
            return analysisResults;
            
        } catch (error) {
            console.error(`[${this.agentId}] Neural network analysis error:`, error);
            return {};
        }
    }
    
    async preparePerformanceFeatures(data) {
        const features = [];
        const returns = data.returns;
        
        // Basic statistical features
        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const volatility = Math.sqrt(returns.reduce((sum, r) => 
            sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1));
        
        features.push(
            meanReturn * 252, // Annualized return
            volatility * Math.sqrt(252), // Annualized volatility
            this.calculateSkewness(returns),
            this.calculateKurtosis(returns),
            this.calculateMaxDrawdown(data.portfolioValues)
        );
        
        // Rolling statistics
        const rollingWindows = [21, 63, 126]; // 1M, 3M, 6M
        for (const window of rollingWindows) {
            if (returns.length >= window) {
                const rollingReturns = returns.slice(-window);
                const rollingMean = rollingReturns.reduce((sum, r) => sum + r, 0) / rollingReturns.length;
                const rollingVol = Math.sqrt(rollingReturns.reduce((sum, r) => 
                    sum + Math.pow(r - rollingMean, 2), 0) / (rollingReturns.length - 1));
                
                features.push(rollingMean * 252, rollingVol * Math.sqrt(252));
            } else {
                features.push(0, 0);
            }
        }
        
        // Performance ratios
        const riskFreeRate = this.config.riskFreeRate / 252; // Daily risk-free rate
        const sharpeRatio = volatility > 0 ? (meanReturn - riskFreeRate) / volatility : 0;
        features.push(sharpeRatio * Math.sqrt(252));
        
        // Drawdown statistics
        const drawdownSeries = this.calculateDrawdownSeries(data.portfolioValues);
        features.push(
            Math.max(...drawdownSeries),
            drawdownSeries.reduce((sum, dd) => sum + dd, 0) / drawdownSeries.length,
            this.calculateAverageDrawdownDuration(drawdownSeries)
        );
        
        // Market correlation features
        const benchmarkReturns = this.getBenchmarkReturns(returns.length);
        if (benchmarkReturns.length > 0) {
            features.push(
                this.calculateCorrelation(returns, benchmarkReturns),
                this.calculateBeta(returns, benchmarkReturns),
                this.calculateAlpha(returns, benchmarkReturns) * 252
            );
        } else {
            features.push(0, 1, 0);
        }
        
        // Factor loadings
        const factors = ['market', 'size', 'value', 'momentum'];
        for (const factor of factors) {
            const factorReturns = this.getFactorReturns(factor, returns.length);
            if (factorReturns.length > 0) {
                features.push(this.calculateFactorExposure(returns, factorReturns).beta);
            } else {
                features.push(0);
            }
        }
        
        // Timing and selection metrics
        features.push(
            this.calculateMarketTimingMetric(returns, benchmarkReturns),
            this.calculateSecuritySelectionMetric(returns, benchmarkReturns),
            this.calculateMomentumMetric(returns),
            this.calculateMeanReversionMetric(returns)
        );
        
        // Portfolio characteristics
        const positions = Array.from(data.positions || []);
        features.push(
            positions.length, // Number of positions
            this.calculateConcentration(positions),
            this.calculateTurnover(data.transactions || []),
            this.calculateSectorDiversification(positions)
        );
        
        // Market environment features
        features.push(
            this.getMarketVolatilityRegime(),
            this.getMarketTrendRegime(),
            this.getMarketSentimentRegime(),
            this.getLiquidityRegime()
        );
        
        // Performance consistency metrics
        const monthlyReturns = this.aggregateToMonthly(returns);
        features.push(
            this.calculateConsistencyRatio(monthlyReturns),
            this.calculateStabilityIndex(returns),
            this.calculatePerformancePersistence(returns)
        );
        
        // Risk management effectiveness
        features.push(
            this.calculateDownsideCapture(returns, benchmarkReturns),
            this.calculateUpsideCapture(returns, benchmarkReturns),
            this.calculateTailRiskManagement(returns),
            this.calculateStressTestPerformance(returns)
        );
        
        // Pad or truncate to expected input size
        while (features.length < 75) features.push(0);
        return features.slice(0, 75);
    }
    
    // Attribution Analysis
    async performAttributionAnalysis(data) {
        try {
            const startTime = performance.now();
            
            // Prepare attribution features
            const features = await this.prepareAttributionFeatures(data);
            const normalizedFeatures = this.normalizeFeatures(features);
            
            // Neural network attribution analysis
            const attributionScores = await this.attributionNN.forward(normalizedFeatures);
            
            // Traditional attribution methods
            const traditionalAttribution = await this.performTraditionalAttribution(data);
            
            // Brinson attribution
            const brinsonAttribution = await this.performBrinsonAttribution(data);
            
            // Factor-based attribution
            const factorAttribution = await this.performFactorBasedAttribution(data);
            
            const attributionResults = {
                neural: {
                    securitySelection: attributionScores[0],
                    assetAllocation: attributionScores[1],
                    marketTiming: attributionScores[2],
                    sectorAllocation: attributionScores[3],
                    stockSelection: attributionScores[4],
                    interactionEffect: attributionScores[5],
                    factorExposure: attributionScores[6],
                    residualReturn: attributionScores[7],
                    tradingCosts: attributionScores[8],
                    managementEffect: attributionScores[9],
                    benchmarkBias: attributionScores[10],
                    styleConsistency: attributionScores[11]
                },
                traditional: traditionalAttribution,
                brinson: brinsonAttribution,
                factor: factorAttribution,
                processingTime: performance.now() - startTime
            };
            
            // Store attribution results
            this.attributionAnalysis.set(Date.now(), attributionResults);
            
            console.log(`[${this.agentId}] Attribution analysis completed`);
            
            return attributionResults;
            
        } catch (error) {
            console.error(`[${this.agentId}] Attribution analysis error:`, error);
            return {};
        }
    }
    
    async prepareAttributionFeatures(data) {
        const features = [];
        
        // Portfolio composition features
        const positions = Array.from(data.positions || []);
        const weights = Array.from(data.weights?.values() || []);
        
        features.push(
            positions.length,
            weights.length > 0 ? Math.max(...weights) : 0,
            weights.length > 0 ? weights.reduce((sum, w) => sum + w * w, 0) : 0, // Herfindahl index
            this.calculateActiveWeights(weights).reduce((sum, w) => sum + Math.abs(w), 0)
        );
        
        // Sector allocation features
        const sectorWeights = this.calculateSectorWeights(positions);
        const benchmarkSectorWeights = this.getBenchmarkSectorWeights();
        
        Object.keys(sectorWeights).forEach(sector => {
            const activeWeight = sectorWeights[sector] - (benchmarkSectorWeights[sector] || 0);
            features.push(activeWeight);
        });
        
        // Security selection features
        const securityReturns = this.getSecurityReturns(positions);
        const benchmarkSecurityReturns = this.getBenchmarkSecurityReturns(positions);
        
        features.push(
            this.calculateActiveReturn(securityReturns, benchmarkSecurityReturns),
            this.calculateInformationRatio(securityReturns, benchmarkSecurityReturns),
            this.calculateTrackingError(securityReturns, benchmarkSecurityReturns)
        );
        
        // Factor exposure features
        const factorExposures = this.getFactorExposures(data.returns);
        const benchmarkFactorExposures = this.getBenchmarkFactorExposures();
        
        Object.keys(factorExposures).forEach(factor => {
            const activeFactor = factorExposures[factor] - (benchmarkFactorExposures[factor] || 0);
            features.push(activeFactor);
        });
        
        // Trading activity features
        const transactions = data.transactions || [];
        features.push(
            this.calculateTurnover(transactions),
            this.calculateTradingCosts(transactions),
            this.calculateTradeSize(transactions),
            this.calculateTradingFrequency(transactions)
        );
        
        // Performance timing features
        features.push(
            this.calculateMarketTimingMetric(data.returns, this.getBenchmarkReturns(data.returns.length)),
            this.calculateVolatilityTiming(data.returns),
            this.calculateMomentumTiming(data.returns),
            this.calculateRebalancingTiming(transactions)
        );
        
        // Pad to expected size
        while (features.length < 50) features.push(0);
        return features.slice(0, 50);
    }
    
    // Performance Forecasting
    async forecastPerformance(horizon = 63) { // 3-month default
        try {
            const startTime = performance.now();
            
            // Prepare time series data for LSTM
            const timeSeriesData = this.prepareTimeSeriesData(horizon);
            
            if (timeSeriesData.length < 30) {
                console.warn(`[${this.agentId}] Insufficient data for forecasting`);
                return null;
            }
            
            // LSTM-based forecasting
            const forecastResults = await this.forecastingNN.forward(timeSeriesData);
            
            // Traditional forecasting methods
            const traditionalForecasts = this.performTraditionalForecasting(timeSeriesData, horizon);
            
            // Ensemble forecast
            const ensembleForecast = this.combineForecasts(forecastResults, traditionalForecasts);
            
            const forecastReport = {
                horizon,
                neural: {
                    expectedReturn: forecastResults[0],
                    expectedVolatility: forecastResults[1],
                    expectedSharpe: forecastResults[2],
                    expectedMaxDrawdown: forecastResults[3],
                    expectedAlpha: forecastResults[4],
                    expectedBeta: forecastResults[5],
                    expectedTrackingError: forecastResults[6],
                    confidenceScore: forecastResults[7]
                },
                traditional: traditionalForecasts,
                ensemble: ensembleForecast,
                confidence: this.calculateForecastConfidence(forecastResults, traditionalForecasts),
                processingTime: performance.now() - startTime,
                timestamp: Date.now()
            };
            
            console.log(`[${this.agentId}] Performance forecast completed - Expected Return: ${(ensembleForecast.expectedReturn * 100).toFixed(2)}%`);
            
            return forecastReport;
            
        } catch (error) {
            console.error(`[${this.agentId}] Performance forecasting error:`, error);
            return null;
        }
    }
    
    prepareTimeSeriesData(horizon) {
        const sequenceLength = 60; // 60-day sequences
        const features = [];
        
        // Get recent performance data
        const recentReturns = this.portfolioReturns.slice(-sequenceLength - horizon);
        
        if (recentReturns.length < sequenceLength) return [];
        
        // Create sequences for LSTM
        for (let i = 0; i < recentReturns.length - sequenceLength; i++) {
            const sequence = recentReturns.slice(i, i + sequenceLength);
            
            // Add technical indicators and market features
            const sequenceFeatures = sequence.map((ret, idx) => {
                const window = sequence.slice(0, idx + 1);
                return [
                    ret,
                    this.calculateMovingAverage(window, Math.min(10, window.length)),
                    this.calculateVolatility(window.slice(-21)) || 0,
                    this.calculateMomentum(window, Math.min(20, window.length)),
                    this.calculateRSI(window) / 100
                ];
            });
            
            features.push(sequenceFeatures);
        }
        
        return features;
    }
    
    // Performance Optimization
    async optimizePerformance(objectives = {}) {
        try {
            const startTime = performance.now();
            
            // Default objectives
            const defaultObjectives = {
                maximizeReturn: 0.4,
                minimizeRisk: 0.3,
                maximizeSharpe: 0.2,
                minimizeDrawdown: 0.1
            };
            
            const finalObjectives = { ...defaultObjectives, ...objectives };
            
            // Prepare optimization features
            const features = await this.prepareOptimizationFeatures(finalObjectives);
            const normalizedFeatures = this.normalizeFeatures(features);
            
            // Neural network optimization
            const optimizationResults = await this.optimizationNN.forward(normalizedFeatures);
            
            // Traditional optimization methods
            const traditionalOptimization = await this.performTraditionalOptimization(finalObjectives);
            
            // Combine optimization results
            const optimizationRecommendations = this.combineOptimizationResults(
                optimizationResults, 
                traditionalOptimization
            );
            
            const optimizationReport = {
                objectives: finalObjectives,
                recommendations: optimizationRecommendations,
                expectedImprovement: this.calculateExpectedImprovement(optimizationRecommendations),
                implementationPriority: this.prioritizeRecommendations(optimizationRecommendations),
                processingTime: performance.now() - startTime,
                timestamp: Date.now()
            };
            
            // Send optimization results
            this.sendMessage({
                type: 'PERFORMANCE_OPTIMIZATION',
                data: optimizationReport
            });
            
            console.log(`[${this.agentId}] Performance optimization completed`);
            
            return optimizationReport;
            
        } catch (error) {
            console.error(`[${this.agentId}] Performance optimization error:`, error);
            return null;
        }
    }
    
    async prepareOptimizationFeatures(objectives) {
        const features = [];
        
        // Current performance metrics
        const currentMetrics = this.getCurrentPerformanceMetrics();
        features.push(
            currentMetrics.totalReturn || 0,
            currentMetrics.volatility || 0,
            currentMetrics.sharpeRatio || 0,
            currentMetrics.maxDrawdown || 0,
            currentMetrics.alpha || 0,
            currentMetrics.beta || 1,
            currentMetrics.trackingError || 0
        );
        
        // Objective weights
        features.push(
            objectives.maximizeReturn || 0,
            objectives.minimizeRisk || 0,
            objectives.maximizeSharpe || 0,
            objectives.minimizeDrawdown || 0
        );
        
        // Portfolio characteristics
        const portfolioStats = this.getPortfolioCharacteristics();
        features.push(
            portfolioStats.concentration || 0,
            portfolioStats.diversification || 0,
            portfolioStats.turnover || 0,
            portfolioStats.activeRisk || 0
        );
        
        // Market environment
        features.push(
            this.getMarketVolatilityRegime(),
            this.getMarketTrendRegime(),
            this.getCorrelationRegime(),
            this.getLiquidityRegime()
        );
        
        // Factor exposures
        const factorExposures = this.getCurrentFactorExposures();
        Object.values(factorExposures).forEach(exposure => {
            features.push(exposure || 0);
        });
        
        // Constraints
        features.push(
            this.getRiskConstraints().maxRisk || 0.2,
            this.getConcentrationConstraints().maxPosition || 0.1,
            this.getLiquidityConstraints().minLiquidity || 0.5,
            this.getTurnoverConstraints().maxTurnover || 2.0
        );
        
        // Historical performance patterns
        features.push(
            this.getPerformancePersistence(),
            this.getVolatilityPersistence(),
            this.getDrawdownRecovery(),
            this.getCyclicalPerformance()
        );
        
        // Pad to expected size
        while (features.length < 60) features.push(0);
        return features.slice(0, 60);
    }
    
    // Performance Alerting
    async checkPerformanceAlerts(performanceReport) {
        const alerts = [];
        const thresholds = this.config.alertThresholds;
        
        // Underperformance alert
        if (performanceReport.basic.totalReturn < thresholds.underperformance) {
            alerts.push({
                type: 'underperformance',
                severity: 'medium',
                message: `Portfolio underperforming by ${Math.abs(performanceReport.basic.totalReturn * 100).toFixed(2)}%`,
                current: performanceReport.basic.totalReturn,
                threshold: thresholds.underperformance
            });
        }
        
        // Tracking error alert
        if (performanceReport.riskAdjusted.trackingError > thresholds.trackingError) {
            alerts.push({
                type: 'tracking_error',
                severity: 'medium',
                message: `Tracking error exceeded: ${(performanceReport.riskAdjusted.trackingError * 100).toFixed(2)}%`,
                current: performanceReport.riskAdjusted.trackingError,
                threshold: thresholds.trackingError
            });
        }
        
        // Drawdown alert
        if (performanceReport.basic.maxDrawdown > thresholds.maxDrawdown) {
            alerts.push({
                type: 'max_drawdown',
                severity: 'high',
                message: `Maximum drawdown exceeded: ${(performanceReport.basic.maxDrawdown * 100).toFixed(2)}%`,
                current: performanceReport.basic.maxDrawdown,
                threshold: thresholds.maxDrawdown
            });
        }
        
        // Sharpe ratio alert
        if (performanceReport.riskAdjusted.sharpeRatio < thresholds.sharpeRatio) {
            alerts.push({
                type: 'low_sharpe',
                severity: 'low',
                message: `Sharpe ratio below target: ${performanceReport.riskAdjusted.sharpeRatio.toFixed(3)}`,
                current: performanceReport.riskAdjusted.sharpeRatio,
                threshold: thresholds.sharpeRatio
            });
        }
        
        // Process alerts
        for (const alert of alerts) {
            await this.processPerformanceAlert(alert);
        }
        
        this.performanceAlerts = alerts;
        return alerts;
    }
    
    async processPerformanceAlert(alert) {
        // Send alert message
        this.sendMessage({
            type: 'PERFORMANCE_ALERT',
            data: {
                ...alert,
                agentId: this.agentId,
                timestamp: Date.now()
            }
        });
        
        // Log alert
        console.warn(`[${this.agentId}] Performance Alert - ${alert.type}: ${alert.message}`);
        
        // Auto-remediation for critical alerts
        if (alert.severity === 'high') {
            await this.triggerPerformanceRemediation(alert);
        }
    }
    
    async triggerPerformanceRemediation(alert) {
        switch (alert.type) {
            case 'max_drawdown':
                this.sendMessage({
                    type: 'PERFORMANCE_REMEDIATION',
                    action: 'reduce_risk',
                    data: { reason: 'max_drawdown_exceeded', urgency: 'high' }
                });
                break;
                
            case 'underperformance':
                this.sendMessage({
                    type: 'PERFORMANCE_REMEDIATION',
                    action: 'strategy_review',
                    data: { reason: 'sustained_underperformance', urgency: 'medium' }
                });
                break;
        }
    }
    
    // Event Handlers
    handlePortfolioUpdate(data) {
        try {
            // Update portfolio data
            if (data.positions) {
                this.portfolioData.positions = new Map(data.positions);
            }
            
            if (data.totalValue) {
                this.portfolioData.historicalValues.push({
                    value: data.totalValue,
                    timestamp: Date.now()
                });
                
                // Keep only recent data
                if (this.portfolioData.historicalValues.length > 1000) {
                    this.portfolioData.historicalValues = this.portfolioData.historicalValues.slice(-1000);
                }
            }
            
            if (data.weights) {
                this.portfolioData.weights = new Map(data.weights);
            }
            
        } catch (error) {
            console.error(`[${this.agentId}] Portfolio update error:`, error);
        }
    }
    
    handleTradeExecution(data) {
        try {
            // Add to transaction history
            this.portfolioData.transactions.push({
                ...data,
                timestamp: Date.now()
            });
            
            // Calculate return impact
            this.calculateTradeImpact(data);
            
        } catch (error) {
            console.error(`[${this.agentId}] Trade execution handling error:`, error);
        }
    }
    
    handlePositionUpdate(data) {
        try {
            if (data.symbol && data.quantity !== undefined) {
                this.portfolioData.positions.set(data.symbol, {
                    quantity: data.quantity,
                    value: data.value || 0,
                    weight: data.weight || 0
                });
            }
        } catch (error) {
            console.error(`[${this.agentId}] Position update error:`, error);
        }
    }
    
    handleMarketDataUpdate(data) {
        try {
            if (data.symbol && data.price) {
                this.marketData.set(data.symbol, {
                    ...this.marketData.get(data.symbol),
                    price: data.price,
                    timestamp: Date.now()
                });
                
                // Update portfolio returns if needed
                this.updatePortfolioReturns();
            }
        } catch (error) {
            console.error(`[${this.agentId}] Market data update error:`, error);
        }
    }
    
    handleBenchmarkUpdate(data) {
        try {
            if (data.symbol && data.returns) {
                this.benchmarkReturns.set(data.symbol, data.returns);
            }
        } catch (error) {
            console.error(`[${this.agentId}] Benchmark update error:`, error);
        }
    }
    
    handlePerformanceRequest(message) {
        try {
            const period = message.data?.period || null;
            this.analyzePerformance(period).then(result => {
                this.sendMessage({
                    type: 'PERFORMANCE_RESPONSE',
                    requestId: message.requestId,
                    data: result
                });
            });
        } catch (error) {
            console.error(`[${this.agentId}] Performance request error:`, error);
        }
    }
    
    handleAttributionRequest(message) {
        try {
            const data = message.data || {};
            this.performAttributionAnalysis(this.getPerformanceData()).then(result => {
                this.sendMessage({
                    type: 'ATTRIBUTION_RESPONSE',
                    requestId: message.requestId,
                    data: result
                });
            });
        } catch (error) {
            console.error(`[${this.agentId}] Attribution request error:`, error);
        }
    }
    
    handleOptimizationRequest(message) {
        try {
            const objectives = message.data?.objectives || {};
            this.optimizePerformance(objectives).then(result => {
                this.sendMessage({
                    type: 'OPTIMIZATION_RESPONSE',
                    requestId: message.requestId,
                    data: result
                });
            });
        } catch (error) {
            console.error(`[${this.agentId}] Optimization request error:`, error);
        }
    }
    
    // Utility Functions
    calculateMaxDrawdown(values) {
        let peak = values[0];
        let maxDD = 0;
        
        for (const value of values) {
            peak = Math.max(peak, value);
            const drawdown = (peak - value) / peak;
            maxDD = Math.max(maxDD, drawdown);
        }
        
        return maxDD;
    }
    
    calculateSkewness(returns) {
        if (returns.length < 3) return 0;
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const std = Math.sqrt(variance);
        
        if (std === 0) return 0;
        
        const skewness = returns.reduce((sum, r) => {
            return sum + Math.pow((r - mean) / std, 3);
        }, 0) / returns.length;
        
        return skewness;
    }
    
    calculateKurtosis(returns) {
        if (returns.length < 4) return 0;
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const std = Math.sqrt(variance);
        
        if (std === 0) return 0;
        
        const kurtosis = returns.reduce((sum, r) => {
            return sum + Math.pow((r - mean) / std, 4);
        }, 0) / returns.length - 3; // Excess kurtosis
        
        return kurtosis;
    }
    
    calculateCorrelation(returns1, returns2) {
        if (returns1.length !== returns2.length || returns1.length < 2) return 0;
        
        const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
        const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < returns1.length; i++) {
            const diff1 = returns1[i] - mean1;
            const diff2 = returns2[i] - mean2;
            
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(sum1Sq * sum2Sq);
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    calculateBeta(portfolioReturns, marketReturns) {
        const covariance = this.calculateCovariance(portfolioReturns, marketReturns);
        const marketVariance = this.calculateVariance(marketReturns);
        
        return marketVariance > 0 ? covariance / marketVariance : 1;
    }
    
    calculateAlpha(portfolioReturns, marketReturns) {
        const beta = this.calculateBeta(portfolioReturns, marketReturns);
        const riskFreeRate = this.config.riskFreeRate / 252; // Daily risk-free rate
        
        const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
        const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
        
        return portfolioMean - riskFreeRate - beta * (marketMean - riskFreeRate);
    }
    
    calculateAlphaBeta(portfolioReturns, marketReturns) {
        const beta = this.calculateBeta(portfolioReturns, marketReturns);
        const alpha = this.calculateAlpha(portfolioReturns, marketReturns);
        
        return { alpha, beta };
    }
    
    calculateCovariance(returns1, returns2) {
        if (returns1.length !== returns2.length || returns1.length < 2) return 0;
        
        const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
        const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;
        
        const covariance = returns1.reduce((sum, r1, i) => {
            return sum + (r1 - mean1) * (returns2[i] - mean2);
        }, 0) / (returns1.length - 1);
        
        return covariance;
    }
    
    calculateVariance(returns) {
        if (returns.length < 2) return 0;
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        return returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    }
    
    calculateTrackingError(portfolioReturns, benchmarkReturns) {
        if (portfolioReturns.length !== benchmarkReturns.length) return 0;
        
        const excessReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
        const volatility = Math.sqrt(this.calculateVariance(excessReturns));
        
        return volatility * Math.sqrt(252); // Annualized
    }
    
    normalizeFeatures(features) {
        // Z-score normalization
        const mean = features.reduce((sum, f) => sum + f, 0) / features.length;
        const variance = features.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / features.length;
        const std = Math.sqrt(variance);
        
        if (std === 0) return features.map(() => 0);
        
        return features.map(f => (f - mean) / std);
    }
    
    // Main Performance Monitoring Loop
    startPerformanceMonitoring() {
        // Performance analysis cycle
        setTimeout(() => this.performanceAnalysisLoop(), 2000);
        
        // Performance forecasting
        setInterval(() => this.periodicForecasting(), 1800000); // Every 30 minutes
        
        // Performance optimization
        setInterval(() => this.periodicOptimization(), 3600000); // Every hour
    }
    
    async performanceAnalysisLoop() {
        if (this.isAnalyzing) return;
        
        try {
            this.isAnalyzing = true;
            
            // Perform comprehensive performance analysis
            const performanceReport = await this.analyzePerformance();
            
            if (performanceReport) {
                // Check for forecasting triggers
                await this.checkForecastingTriggers();
                
                // Check for optimization triggers
                await this.checkOptimizationTriggers(performanceReport);
            }
            
            console.log(`[${this.agentId}] Performance analysis cycle completed`);
            
        } catch (error) {
            console.error(`[${this.agentId}] Performance analysis loop error:`, error);
        } finally {
            this.isAnalyzing = false;
            
            // Schedule next analysis
            setTimeout(() => this.performanceAnalysisLoop(), this.config.analysisInterval);
        }
    }
    
    async periodicForecasting() {
        try {
            await this.forecastPerformance();
        } catch (error) {
            console.error(`[${this.agentId}] Periodic forecasting error:`, error);
        }
    }
    
    async periodicOptimization() {
        try {
            await this.optimizePerformance();
        } catch (error) {
            console.error(`[${this.agentId}] Periodic optimization error:`, error);
        }
    }
    
    // Agent Status
    getStatus() {
        return {
            agentId: this.agentId,
            name: this.name,
            version: this.version,
            isActive: true,
            isAnalyzing: this.isAnalyzing,
            statistics: {
                performanceMetrics: this.performanceMetrics.size,
                attributionAnalyses: this.attributionAnalysis.size,
                portfolioReturns: this.portfolioReturns.length,
                activeAlerts: this.performanceAlerts.length
            },
            currentPerformance: this.getCurrentPerformanceMetrics(),
            lastUpdate: Date.now()
        };
    }
    
    // Placeholder implementations for missing methods
    async loadHistoricalPerformanceData() {
        // Generate sample performance data
        for (let i = 0; i < 252; i++) {
            this.portfolioReturns.push((Math.random() - 0.48) * 0.02); // Slight positive bias
        }
        console.log(`[${this.agentId}] Historical performance data loaded`);
    }
    
    getPerformanceData(period) {
        const endIndex = this.portfolioReturns.length;
        const startIndex = period ? Math.max(0, endIndex - period) : 0;
        
        const returns = this.portfolioReturns.slice(startIndex, endIndex);
        const portfolioValues = this.calculatePortfolioValues(returns);
        
        return {
            returns,
            portfolioValues,
            startDate: Date.now() - (returns.length * 24 * 60 * 60 * 1000),
            endDate: Date.now(),
            positions: this.portfolioData.positions,
            weights: this.portfolioData.weights,
            transactions: this.portfolioData.transactions
        };
    }
    
    calculatePortfolioValues(returns) {
        const values = [100000]; // Starting value
        
        for (const ret of returns) {
            values.push(values[values.length - 1] * (1 + ret));
        }
        
        return values;
    }
    
    getBenchmarkReturns(length, symbol = 'SPY') {
        // Generate benchmark returns (slightly lower than portfolio)
        return Array.from({ length }, () => (Math.random() - 0.5) * 0.018);
    }
    
    compareToBenchmark(portfolioReturns, benchmarkReturns) {
        const excessReturns = portfolioReturns.map((r, i) => r - (benchmarkReturns[i] || 0));
        const avgExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
        
        return {
            excessReturn: avgExcess * 252,
            outperformanceDays: excessReturns.filter(r => r > 0).length,
            hitRate: excessReturns.filter(r => r > 0).length / excessReturns.length
        };
    }
    
    // Simplified placeholder implementations
    performReturnBasedStyleAnalysis() { return { growth: 0.6, value: 0.4, size: 0.3 }; }
    getFactorReturns() { return Array.from({ length: 100 }, () => (Math.random() - 0.5) * 0.01); }
    calculateFactorExposure() { return { beta: 0.8, tStat: 2.1, rSquared: 0.4 }; }
    calculateFactorAttribution() { return { market: 0.05, size: 0.01, value: -0.02 }; }
    calculateFactorRSquared() { return 0.65; }
    performStyleAnalysis() { return { growthTilt: 0.2, sizeTilt: -0.1, valueTilt: 0.05 }; }
    performTraditionalAttribution() { return { allocation: 0.02, selection: 0.03, interaction: 0.01 }; }
    performBrinsonAttribution() { return { allocation: 0.025, selection: 0.028, interaction: 0.008 }; }
    performFactorBasedAttribution() { return { systematic: 0.04, idiosyncratic: 0.02 }; }
    calculateActiveWeights() { return [0.05, -0.03, 0.02, 0.01]; }
    calculateSectorWeights() { return { Technology: 0.3, Healthcare: 0.2, Financials: 0.25 }; }
    getBenchmarkSectorWeights() { return { Technology: 0.28, Healthcare: 0.18, Financials: 0.22 }; }
    getSecurityReturns() { return [0.05, 0.03, -0.02]; }
    getBenchmarkSecurityReturns() { return [0.04, 0.02, -0.01]; }
    calculateActiveReturn() { return 0.015; }
    getFactorExposures() { return { market: 0.95, size: -0.2, value: 0.1 }; }
    getBenchmarkFactorExposures() { return { market: 1.0, size: 0.0, value: 0.0 }; }
    calculateTurnover() { return 1.5; }
    calculateTradingCosts() { return 0.001; }
    calculateTradeSize() { return 50000; }
    calculateTradingFrequency() { return 20; }
    calculateVolatilityTiming() { return 0.02; }
    calculateMomentumTiming() { return 0.015; }
    calculateRebalancingTiming() { return 0.01; }
    performTraditionalForecasting() { return { expectedReturn: 0.08, expectedVol: 0.15 }; }
    combineForecasts(neural, traditional) { 
        return {
            expectedReturn: neural[0] * 0.6 + traditional.expectedReturn * 0.4,
            expectedVolatility: neural[1] * 0.6 + traditional.expectedVol * 0.4
        };
    }
    calculateForecastConfidence() { return 0.75; }
    performTraditionalOptimization() { return { rebalanceFreq: 'monthly', riskTarget: 0.12 }; }
    combineOptimizationResults(neural, traditional) {
        return {
            portfolioAdjustments: neural.slice(0, 5),
            riskManagement: neural.slice(5, 10),
            tradingStrategy: neural.slice(10, 15),
            rebalancing: neural.slice(15, 20)
        };
    }
    calculateExpectedImprovement() { return { returnImprovement: 0.02, riskReduction: 0.03 }; }
    prioritizeRecommendations() { return ['reduce_risk', 'rebalance_sectors', 'optimize_trades']; }
    getCurrentPerformanceMetrics() {
        return {
            totalReturn: 0.08,
            volatility: 0.15,
            sharpeRatio: 1.2,
            maxDrawdown: 0.08,
            alpha: 0.02,
            beta: 0.95,
            trackingError: 0.04
        };
    }
    getPortfolioCharacteristics() { return { concentration: 0.25, diversification: 0.8, turnover: 1.2, activeRisk: 0.05 }; }
    getMarketVolatilityRegime() { return 0.6; }
    getMarketTrendRegime() { return 0.7; }
    getMarketSentimentRegime() { return 0.5; }
    getLiquidityRegime() { return 0.8; }
    getCorrelationRegime() { return 0.4; }
    getCurrentFactorExposures() { return { market: 0.95, size: -0.1, value: 0.05, momentum: 0.15 }; }
    getRiskConstraints() { return { maxRisk: 0.18 }; }
    getConcentrationConstraints() { return { maxPosition: 0.08 }; }
    getLiquidityConstraints() { return { minLiquidity: 0.7 }; }
    getTurnoverConstraints() { return { maxTurnover: 3.0 }; }
    getPerformancePersistence() { return 0.4; }
    getVolatilityPersistence() { return 0.6; }
    getDrawdownRecovery() { return 60; }
    getCyclicalPerformance() { return 0.3; }
    calculateDrawdownSeries(values) {
        let peak = values[0];
        return values.map(value => {
            peak = Math.max(peak, value);
            return (peak - value) / peak;
        });
    }
    calculateAverageDrawdownDuration() { return 45; }
    calculateMarketTimingMetric() { return 0.15; }
    calculateSecuritySelectionMetric() { return 0.25; }
    calculateMomentumMetric() { return 0.2; }
    calculateMeanReversionMetric() { return -0.1; }
    calculateConcentration() { return 0.3; }
    calculateSectorDiversification() { return 0.7; }
    aggregateToMonthly() { return Array.from({ length: 12 }, () => (Math.random() - 0.48) * 0.05); }
    calculateConsistencyRatio() { return 0.8; }
    calculateStabilityIndex() { return 0.75; }
    calculatePerformancePersistence() { return 0.6; }
    calculateDownsideCapture() { return 0.85; }
    calculateUpsideCapture() { return 1.05; }
    calculateTailRiskManagement() { return 0.7; }
    calculateStressTestPerformance() { return -0.12; }
    calculateMovingAverage(data, window) { 
        return data.slice(-window).reduce((sum, val) => sum + val, 0) / window; 
    }
    calculateVolatility(data) {
        if (data.length < 2) return 0;
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
        return Math.sqrt(variance);
    }
    calculateMomentum(data, window) {
        if (data.length < window) return 0;
        return data[data.length - 1] - data[data.length - window];
    }
    calculateRSI(data, period = 14) {
        if (data.length < period + 1) return 50;
        
        let gains = 0, losses = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    calculateTradeImpact() { }
    updatePortfolioReturns() { }
    checkForecastingTriggers() { }
    checkOptimizationTriggers() { }
    
    checkRateLimit(api) {
        const limits = {
            alphavantage: { max: 25, window: 86400000 },
            finnhub: { max: 60, window: 60000 },
            fred: { max: 120, window: 86400000 }
        };
        
        if (!limits[api]) return true;
        
        const counter = this.apiRequestCounts.get(api);
        const now = Date.now();
        
        if (now > counter.resetTime) {
            counter.count = 0;
            counter.resetTime = now + limits[api].window;
        }
        
        return counter.count < limits[api].max;
    }
    
    incrementApiCount(api) {
        const counter = this.apiRequestCounts.get(api);
        if (counter) counter.count++;
    }
    
    cleanup() {
        for (const [name, ws] of this.websockets) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        }
        this.websockets.clear();
    }
}

// Neural Network Classes (Simplified implementations for performance analysis)
class PerformanceAnalysisNN {
    constructor(config) {
        this.config = config;
        this.weights = [];
        this.biases = [];
        this.initializeWeights();
    }
    
    initializeWeights() {
        const layers = [this.config.inputSize, ...this.config.hiddenLayers, this.config.outputSize];
        
        for (let i = 0; i < layers.length - 1; i++) {
            const limit = Math.sqrt(2 / layers[i]); // He initialization
            const weights = Array(layers[i]).fill().map(() =>
                Array(layers[i + 1]).fill().map(() => (Math.random() * 2 - 1) * limit)
            );
            const biases = Array(layers[i + 1]).fill().map(() => Math.random() * 0.01 - 0.005);
            
            this.weights.push(weights);
            this.biases.push(biases);
        }
    }
    
    async forward(input) {
        let activation = [...input];
        
        for (let layer = 0; layer < this.weights.length; layer++) {
            const layerOutput = [];
            
            for (let j = 0; j < this.weights[layer][0].length; j++) {
                let sum = this.biases[layer][j];
                for (let i = 0; i < activation.length; i++) {
                    sum += activation[i] * this.weights[layer][i][j];
                }
                
                if (layer < this.weights.length - 1) {
                    layerOutput.push(this.leakyRelu(sum));
                } else {
                    layerOutput.push(this.sigmoid(sum)); // Output layer
                }
            }
            
            activation = layerOutput;
        }
        
        return activation;
    }
    
    leakyRelu(x) {
        return x > 0 ? x : 0.01 * x;
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
    }
}

class AttributionAnalysisNN extends PerformanceAnalysisNN {}

class PerformanceForecastingLSTM {
    constructor(config) {
        this.config = config;
        this.weights = [];
        this.biases = [];
        this.initializeWeights();
    }
    
    initializeWeights() {
        // Simplified LSTM initialization
        const inputSize = this.config.inputSize;
        const hiddenSize = this.config.hiddenSize;
        const outputSize = this.config.outputSize;
        
        // LSTM weights (forget, input, candidate, output gates)
        this.weights = {
            forget: Array(inputSize + hiddenSize).fill().map(() => Array(hiddenSize).fill().map(() => Math.random() * 0.1 - 0.05)),
            input: Array(inputSize + hiddenSize).fill().map(() => Array(hiddenSize).fill().map(() => Math.random() * 0.1 - 0.05)),
            candidate: Array(inputSize + hiddenSize).fill().map(() => Array(hiddenSize).fill().map(() => Math.random() * 0.1 - 0.05)),
            output: Array(inputSize + hiddenSize).fill().map(() => Array(hiddenSize).fill().map(() => Math.random() * 0.1 - 0.05)),
            final: Array(hiddenSize).fill().map(() => Array(outputSize).fill().map(() => Math.random() * 0.1 - 0.05))
        };
        
        this.biases = {
            forget: Array(hiddenSize).fill(0),
            input: Array(hiddenSize).fill(0),
            candidate: Array(hiddenSize).fill(0),
            output: Array(hiddenSize).fill(0),
            final: Array(outputSize).fill(0)
        };
    }
    
    async forward(sequences) {
        if (sequences.length === 0) return Array(this.config.outputSize).fill(0);
        
        const lastSequence = sequences[sequences.length - 1];
        if (!lastSequence || lastSequence.length === 0) return Array(this.config.outputSize).fill(0);
        
        // Simplified LSTM forward pass - just use the last time step
        const lastInput = lastSequence[lastSequence.length - 1];
        if (!Array.isArray(lastInput)) return Array(this.config.outputSize).fill(0);
        
        // Simple feedforward through final layer
        const output = [];
        for (let i = 0; i < this.config.outputSize; i++) {
            let sum = this.biases.final[i];
            for (let j = 0; j < Math.min(lastInput.length, this.config.hiddenSize); j++) {
                sum += lastInput[j] * (this.weights.final[j] ? this.weights.final[j][i] : 0);
            }
            output.push(this.sigmoid(sum));
        }
        
        return output;
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
    }
}

class PerformanceOptimizationNN extends PerformanceAnalysisNN {
    async forward(input) {
        let activation = [...input];
        
        for (let layer = 0; layer < this.weights.length; layer++) {
            const layerOutput = [];
            
            for (let j = 0; j < this.weights[layer][0].length; j++) {
                let sum = this.biases[layer][j];
                for (let i = 0; i < activation.length; i++) {
                    sum += activation[i] * this.weights[layer][i][j];
                }
                
                layerOutput.push(this.tanh(sum)); // Use tanh for optimization outputs
            }
            
            activation = layerOutput;
        }
        
        return activation;
    }
    
    tanh(x) {
        const ex = Math.exp(2 * x);
        return (ex - 1) / (ex + 1);
    }
}

// Circuit Breaker Class (shared)
class CircuitBreaker {
    constructor(config = {}) {
        this.failureThreshold = config.failureThreshold || 5;
        this.recoveryTimeout = config.recoveryTimeout || 30000;
        this.monitoringPeriod = config.monitoringPeriod || 60000;
        
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.nextAttempt = null;
    }
    
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit breaker is OPEN');
            }
            this.state = 'HALF_OPEN';
        }
        
        try {
            const result = await operation();
            this.recordSuccess();
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    
    recordSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
        this.lastFailureTime = null;
    }
    
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.recoveryTimeout;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceAnalyticsAgent;
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.PerformanceAnalyticsAgent = PerformanceAnalyticsAgent;
    window.CircuitBreaker = CircuitBreaker;
}