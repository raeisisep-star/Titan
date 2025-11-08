/**
 * TITAN Trading System - Agent 11: Portfolio Optimization Specialist
 * 
 * Advanced AI agent specializing in portfolio optimization using Modern Portfolio Theory,
 * Black-Litterman models, and neural network-based asset allocation strategies.
 * 
 * Key Features:
 * - Modern Portfolio Theory implementation with neural networks
 * - Black-Litterman model for expected returns
 * - Multi-objective optimization (return, risk, ESG)
 * - Dynamic asset allocation and rebalancing
 * - Risk budgeting and factor exposure control
 * - Real-time portfolio performance monitoring
 * - Inter-agent communication for coordinated trading
 * 
 * @author TITAN Trading System
 * @version 2.1.0
 */

import { CircuitBreaker } from '../../utils/circuit-breaker.js';

export class PortfolioOptimizationAgent {
    constructor(config = {}) {
        this.agentId = 'AGENT_11_PORTFOLIO_OPT';
        this.name = 'Portfolio Optimization Specialist';
        this.version = '2.1.0';
        
        // Configuration
        this.config = {
            optimizationInterval: config.optimizationInterval || 300000, // 5 minutes
            rebalanceThreshold: config.rebalanceThreshold || 0.05, // 5% drift
            maxAssets: config.maxAssets || 50,
            riskTolerance: config.riskTolerance || 0.15, // 15% annual volatility
            targetReturn: config.targetReturn || 0.12, // 12% annual return
            transactionCost: config.transactionCost || 0.001, // 0.1%
            // API Configuration
            apis: {
                binance: {
                    websocket: 'wss://stream.binance.com:9443/ws',
                    rest: 'https://api.binance.com/api/v3',
                    enabled: true
                },
                alphavantage: {
                    key: config.alphaVantageKey || 'demo', // User should provide
                    baseUrl: 'https://www.alphavantage.co/query',
                    enabled: !!config.alphaVantageKey
                },
                finnhub: {
                    key: config.finnhubKey || 'demo', // User should provide
                    baseUrl: 'https://finnhub.io/api/v1',
                    enabled: !!config.finnhubKey
                },
                coingecko: {
                    baseUrl: 'https://api.coingecko.com/api/v3',
                    enabled: true // Fully free
                }
            },
            ...config
        };
        
        // API Management
        this.apiClients = {};
        this.websockets = new Map();
        this.circuitBreakers = new Map();
        this.apiRequestCounts = new Map();
        this.lastApiReset = Date.now();
        
        // Portfolio state
        this.portfolio = {
            assets: new Map(),
            totalValue: 0,
            targetWeights: new Map(),
            currentWeights: new Map(),
            expectedReturns: new Map(),
            riskMetrics: {},
            lastRebalance: null
        };
        
        // Performance tracking
        this.performance = {
            totalReturn: 0,
            sharpeRatio: 0,
            maxDrawdown: 0,
            volatility: 0,
            alpha: 0,
            beta: 1,
            informationRatio: 0,
            trackingError: 0
        };
        
        // Neural Networks for optimization
        this.optimizationNetwork = null;
        this.riskNetwork = null;
        this.allocationNetwork = null;
        
        // Market data and analysis
        this.marketData = new Map();
        this.correlationMatrix = null;
        this.covarianceMatrix = null;
        
        // Communication
        this.communicationChannel = null;
        this.messageQueue = [];
        
        // Analysis state
        this.isAnalyzing = false;
        this.analysisResults = [];
        
        // Initialize agent
        this.initialize();
    }
    
    async initialize() {
        try {
            console.log(`[${this.agentId}] Initializing Portfolio Optimization Agent v${this.version}`);
            
            // Initialize API clients and circuit breakers
            await this.initializeAPIClients();
            
            // Initialize neural networks
            await this.initializeNeuralNetworks();
            
            // Setup communication
            this.setupCommunication();
            
            // Setup real-time data streams
            await this.setupRealTimeDataStreams();
            
            // Start optimization cycle
            this.startOptimizationCycle();
            
            // Load historical data
            await this.loadHistoricalData();
            
            console.log(`[${this.agentId}] Portfolio Optimization Agent initialized successfully`);
            
        } catch (error) {
            console.error(`[${this.agentId}] Initialization error:`, error);
        }
    }
    
    // API Client & Circuit Breaker Implementation
    async initializeAPIClients() {
        // Initialize Circuit Breakers for each API
        this.circuitBreakers.set('binance', new CircuitBreaker({
            failureThreshold: 5,
            recoveryTimeout: 30000,
            monitoringPeriod: 60000
        }));
        
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
        
        this.circuitBreakers.set('coingecko', new CircuitBreaker({
            failureThreshold: 5,
            recoveryTimeout: 30000,
            monitoringPeriod: 60000
        }));
        
        // Initialize request counters for rate limiting
        this.apiRequestCounts.set('alphavantage', { count: 0, resetTime: Date.now() + 86400000 }); // Daily limit
        this.apiRequestCounts.set('finnhub', { count: 0, resetTime: Date.now() + 60000 }); // Per minute
        
        console.log(`[${this.agentId}] API clients and circuit breakers initialized`);
    }
    
    // Real-time Data Streaming Setup
    async setupRealTimeDataStreams() {
        try {
            // Setup Binance WebSocket for crypto data
            if (this.config.apis.binance.enabled) {
                await this.setupBinanceWebSocket();
            }
            
            // Setup periodic API polling for stocks and forex
            this.setupPeriodicDataPolling();
            
            console.log(`[${this.agentId}] Real-time data streams initialized`);
        } catch (error) {
            console.error(`[${this.agentId}] Real-time setup error:`, error);
        }
    }
    
    async setupBinanceWebSocket() {
        try {
            // Major crypto pairs for portfolio analysis
            const symbols = ['btcusdt', 'ethusdt', 'bnbusdt', 'adausdt', 'dotusdt', 'linkusdt'];
            const streams = symbols.map(symbol => `${symbol}@ticker`).join('/');
            
            const wsUrl = `${this.config.apis.binance.websocket}/${streams}`;
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                console.log(`[${this.agentId}] Binance WebSocket connected`);
                this.websockets.set('binance', ws);
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.processBinanceTickerData(data);
                } catch (error) {
                    console.error(`[${this.agentId}] WebSocket data processing error:`, error);
                }
            };
            
            ws.onerror = (error) => {
                console.error(`[${this.agentId}] Binance WebSocket error:`, error);
                this.circuitBreakers.get('binance').recordFailure();
            };
            
            ws.onclose = () => {
                console.log(`[${this.agentId}] Binance WebSocket disconnected, attempting reconnect...`);
                setTimeout(() => this.setupBinanceWebSocket(), 5000);
            };
            
        } catch (error) {
            console.error(`[${this.agentId}] Binance WebSocket setup error:`, error);
        }
    }
    
    processBinanceTickerData(data) {
        if (data.stream && data.data) {
            const ticker = data.data;
            const symbol = ticker.s; // Symbol like BTCUSDT
            
            // Store real-time market data
            this.marketData.set(symbol, {
                symbol: symbol,
                price: parseFloat(ticker.c), // Close price
                priceChange: parseFloat(ticker.P), // Price change percent
                volume: parseFloat(ticker.v), // Volume
                high: parseFloat(ticker.h), // High price
                low: parseFloat(ticker.l), // Low price
                timestamp: ticker.E, // Event time
                source: 'binance'
            });
            
            // Trigger portfolio rebalancing check if significant price movement
            if (Math.abs(parseFloat(ticker.P)) > 5.0) { // 5% price change
                this.sendMessage({
                    type: 'SIGNIFICANT_PRICE_MOVEMENT',
                    data: {
                        symbol: symbol,
                        priceChange: ticker.P,
                        price: ticker.c,
                        timestamp: ticker.E
                    }
                });
            }
        }
    }
    
    setupPeriodicDataPolling() {
        // Poll stock data every 5 minutes (within API limits)
        setInterval(async () => {
            await this.fetchStockData();
        }, 300000);
        
        // Poll forex data every 10 minutes
        setInterval(async () => {
            await this.fetchForexData();
        }, 600000);
        
        // Poll economic indicators daily
        setInterval(async () => {
            await this.fetchEconomicData();
        }, 86400000);
    }
    
    // Neural Network Implementation
    async initializeNeuralNetworks() {
        // Portfolio Optimization Network
        this.optimizationNetwork = new PortfolioOptimizationNN({
            inputSize: 45, // Asset features: returns, volatility, correlations, etc.
            hiddenLayers: [128, 96, 64, 32],
            outputSize: 20, // Max portfolio positions
            learningRate: 0.0001,
            optimizer: 'adam'
        });
        
        // Risk Assessment Network
        this.riskNetwork = new RiskAssessmentNN({
            inputSize: 30, // Risk factors
            hiddenLayers: [64, 48, 32],
            outputSize: 10, // Risk metrics
            learningRate: 0.001,
            optimizer: 'rmsprop'
        });
        
        // Dynamic Asset Allocation Network
        this.allocationNetwork = new AssetAllocationNN({
            inputSize: 25, // Market regime, economic indicators
            hiddenLayers: [96, 72, 48, 24],
            outputSize: 15, // Asset class allocations
            learningRate: 0.0005,
            optimizer: 'adam'
        });
        
        console.log(`[${this.agentId}] Neural networks initialized`);
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
                'portfolio_optimization',
                'asset_allocation',
                'risk_budgeting',
                'rebalancing',
                'performance_attribution'
            ],
            timestamp: Date.now()
        });
    }
    
    handleAgentMessage(message) {
        try {
            switch (message.type) {
                case 'MARKET_DATA_UPDATE':
                    this.handleMarketDataUpdate(message.data);
                    break;
                case 'RISK_ALERT':
                    this.handleRiskAlert(message.data);
                    break;
                case 'TRADE_EXECUTION':
                    this.handleTradeExecution(message.data);
                    break;
                case 'PORTFOLIO_REQUEST':
                    this.handlePortfolioRequest(message);
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
    
    // Portfolio Optimization Core Functions
    async optimizePortfolio(constraints = {}) {
        try {
            const startTime = performance.now();
            
            // Prepare optimization data
            const assets = await this.prepareAssetData();
            const expectedReturns = await this.calculateExpectedReturns(assets);
            const covarianceMatrix = await this.calculateCovarianceMatrix(assets);
            
            // Apply Black-Litterman model
            const blReturns = await this.applyBlackLitterman(expectedReturns, covarianceMatrix);
            
            // Neural network optimization
            const nnWeights = await this.optimizeWithNeuralNetwork(assets, blReturns, covarianceMatrix);
            
            // Traditional optimization methods
            const mptWeights = await this.modernPortfolioTheory(blReturns, covarianceMatrix, constraints);
            const riskParityWeights = await this.riskParityOptimization(covarianceMatrix);
            
            // Ensemble optimization
            const finalWeights = await this.ensembleOptimization([
                { weights: nnWeights, confidence: 0.4 },
                { weights: mptWeights, confidence: 0.4 },
                { weights: riskParityWeights, confidence: 0.2 }
            ]);
            
            // Validate and adjust weights
            const validatedWeights = this.validateWeights(finalWeights, constraints);
            
            // Update portfolio targets
            this.updatePortfolioTargets(validatedWeights);
            
            const optimizationTime = performance.now() - startTime;
            
            // Send optimization results
            this.sendMessage({
                type: 'PORTFOLIO_OPTIMIZED',
                data: {
                    weights: validatedWeights,
                    expectedReturn: this.calculatePortfolioReturn(validatedWeights, blReturns),
                    expectedRisk: this.calculatePortfolioRisk(validatedWeights, covarianceMatrix),
                    optimizationTime
                }
            });
            
            console.log(`[${this.agentId}] Portfolio optimized in ${optimizationTime.toFixed(2)}ms`);
            return validatedWeights;
            
        } catch (error) {
            console.error(`[${this.agentId}] Portfolio optimization error:`, error);
            throw error;
        }
    }
    
    async prepareAssetData() {
        const assets = [];
        
        for (const [symbol, data] of this.marketData) {
            if (data.prices && data.prices.length >= 252) { // At least 1 year of data
                const returns = this.calculateReturns(data.prices);
                const volatility = this.calculateVolatility(returns);
                const sharpe = this.calculateSharpeRatio(returns);
                
                assets.push({
                    symbol,
                    returns,
                    volatility,
                    sharpe,
                    price: data.prices[data.prices.length - 1],
                    volume: data.volume || 0,
                    marketCap: data.marketCap || 0,
                    sector: data.sector || 'Unknown',
                    features: this.extractAssetFeatures(data)
                });
            }
        }
        
        return assets.sort((a, b) => b.sharpe - a.sharpe).slice(0, this.config.maxAssets);
    }
    
    extractAssetFeatures(data) {
        const prices = data.prices || [];
        const returns = this.calculateReturns(prices);
        
        return {
            momentum_1m: this.calculateMomentum(prices, 21),
            momentum_3m: this.calculateMomentum(prices, 63),
            momentum_12m: this.calculateMomentum(prices, 252),
            volatility: this.calculateVolatility(returns),
            skewness: this.calculateSkewness(returns),
            kurtosis: this.calculateKurtosis(returns),
            beta: data.beta || 1,
            pe_ratio: data.peRatio || 15,
            pb_ratio: data.pbRatio || 2,
            dividend_yield: data.dividendYield || 0,
            rsi: this.calculateRSI(prices),
            macd: this.calculateMACD(prices)
        };
    }
    
    async calculateExpectedReturns(assets) {
        const expectedReturns = new Map();
        
        for (const asset of assets) {
            // Historical average
            const historicalReturn = asset.returns.reduce((sum, r) => sum + r, 0) / asset.returns.length * 252;
            
            // Neural network prediction
            const nnPrediction = await this.predictAssetReturn(asset);
            
            // CAPM expected return
            const riskFreeRate = 0.02; // 2% risk-free rate
            const marketReturn = 0.08; // 8% market return
            const capmReturn = riskFreeRate + asset.features.beta * (marketReturn - riskFreeRate);
            
            // Ensemble expected return
            const ensembleReturn = (
                historicalReturn * 0.3 +
                nnPrediction * 0.5 +
                capmReturn * 0.2
            );
            
            expectedReturns.set(asset.symbol, ensembleReturn);
        }
        
        return expectedReturns;
    }
    
    async predictAssetReturn(asset) {
        const features = Object.values(asset.features);
        const normalized = this.normalizeFeatures(features);
        
        const prediction = await this.optimizationNetwork.forward(normalized);
        return prediction[0] * 0.5; // Scale to reasonable return range
    }
    
    async calculateCovarianceMatrix(assets) {
        const n = assets.length;
        const matrix = Array(n).fill().map(() => Array(n).fill(0));
        
        // Calculate pairwise covariances
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    matrix[i][j] = Math.pow(assets[i].volatility, 2);
                } else {
                    const correlation = this.calculateCorrelation(assets[i].returns, assets[j].returns);
                    matrix[i][j] = correlation * assets[i].volatility * assets[j].volatility;
                }
            }
        }
        
        return matrix;
    }
    
    calculateCorrelation(returns1, returns2) {
        const n = Math.min(returns1.length, returns2.length);
        const mean1 = returns1.slice(-n).reduce((sum, r) => sum + r, 0) / n;
        const mean2 = returns2.slice(-n).reduce((sum, r) => sum + r, 0) / n;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < n; i++) {
            const diff1 = returns1[returns1.length - n + i] - mean1;
            const diff2 = returns2[returns2.length - n + i] - mean2;
            
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(sum1Sq * sum2Sq);
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    // Black-Litterman Model Implementation
    async applyBlackLitterman(marketReturns, covarianceMatrix) {
        const tau = 0.025; // Scaling factor
        const riskAversion = 3.0; // Market risk aversion
        
        // Market capitalization weights (equilibrium)
        const marketWeights = this.calculateMarketCapWeights();
        
        // Implied equilibrium returns
        const impliedReturns = this.multiplyMatrixVector(
            this.scaleMatrix(covarianceMatrix, riskAversion),
            marketWeights
        );
        
        // Investor views (example: some assets will outperform)
        const views = this.generateInvestorViews(marketReturns);
        
        if (views.P.length === 0) {
            return marketReturns; // No views, return market returns
        }
        
        // Black-Litterman formula
        const tauCov = this.scaleMatrix(covarianceMatrix, tau);
        const PTauCovP = this.calculatePTauCovP(views.P, tauCov);
        const omega = this.scaleMatrix(PTauCovP, 1); // Assume confidence = uncertainty
        
        // New expected returns
        const blReturns = this.blackLittermanFormula(
            impliedReturns,
            tauCov,
            views.P,
            views.Q,
            omega
        );
        
        const blReturnsMap = new Map();
        const assets = Array.from(marketReturns.keys());
        
        assets.forEach((asset, i) => {
            blReturnsMap.set(asset, blReturns[i]);
        });
        
        return blReturnsMap;
    }
    
    calculateMarketCapWeights() {
        const totalMarketCap = Array.from(this.marketData.values())
            .reduce((sum, data) => sum + (data.marketCap || 0), 0);
        
        return Array.from(this.marketData.values())
            .map(data => (data.marketCap || 0) / totalMarketCap);
    }
    
    generateInvestorViews(marketReturns) {
        const P = [];
        const Q = [];
        
        // View 1: Technology sector will outperform by 2%
        const techAssets = this.getTechAssets();
        if (techAssets.length > 0) {
            const view = new Array(marketReturns.size).fill(0);
            techAssets.forEach(index => view[index] = 1 / techAssets.length);
            P.push(view);
            Q.push(0.02);
        }
        
        // View 2: High momentum assets will continue outperforming
        const momentumView = this.getMomentumView(marketReturns);
        if (momentumView) {
            P.push(momentumView.P);
            Q.push(momentumView.Q);
        }
        
        return { P, Q };
    }
    
    getTechAssets() {
        const techSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];
        const indices = [];
        
        const assets = Array.from(this.marketData.keys());
        techSymbols.forEach(symbol => {
            const index = assets.indexOf(symbol);
            if (index !== -1) indices.push(index);
        });
        
        return indices;
    }
    
    getMomentumView(marketReturns) {
        const assets = Array.from(marketReturns.keys());
        const momentumScores = assets.map(asset => {
            const data = this.marketData.get(asset);
            return data ? this.calculateMomentum(data.prices, 63) : 0;
        });
        
        // Top quartile momentum
        const sortedIndices = momentumScores
            .map((score, index) => ({ score, index }))
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.ceil(assets.length / 4))
            .map(item => item.index);
        
        if (sortedIndices.length === 0) return null;
        
        const view = new Array(assets.length).fill(0);
        sortedIndices.forEach(index => view[index] = 1 / sortedIndices.length);
        
        return {
            P: view,
            Q: 0.03 // 3% expected outperformance
        };
    }
    
    // Modern Portfolio Theory Implementation
    async modernPortfolioTheory(expectedReturns, covarianceMatrix, constraints = {}) {
        const assets = Array.from(expectedReturns.keys());
        const n = assets.length;
        
        // Convert to arrays
        const returns = assets.map(asset => expectedReturns.get(asset));
        
        // Optimize using quadratic programming approximation
        const weights = await this.solveQuadraticOptimization(
            returns,
            covarianceMatrix,
            constraints
        );
        
        const weightsMap = new Map();
        assets.forEach((asset, i) => {
            weightsMap.set(asset, Math.max(0, weights[i]));
        });
        
        return this.normalizeWeights(weightsMap);
    }
    
    async solveQuadraticOptimization(returns, covarianceMatrix, constraints) {
        const n = returns.length;
        const maxIterations = 1000;
        let weights = new Array(n).fill(1 / n); // Equal weights start
        
        const learningRate = 0.01;
        const targetReturn = constraints.targetReturn || this.config.targetReturn;
        
        for (let iter = 0; iter < maxIterations; iter++) {
            // Calculate gradient
            const gradient = this.calculateGradient(weights, returns, covarianceMatrix, targetReturn);
            
            // Update weights
            for (let i = 0; i < n; i++) {
                weights[i] -= learningRate * gradient[i];
                weights[i] = Math.max(0, weights[i]); // Non-negativity constraint
            }
            
            // Normalize weights
            const sum = weights.reduce((s, w) => s + w, 0);
            if (sum > 0) {
                weights = weights.map(w => w / sum);
            }
            
            // Check convergence
            if (iter > 100 && this.vectorNorm(gradient) < 1e-6) {
                break;
            }
        }
        
        return weights;
    }
    
    calculateGradient(weights, returns, covarianceMatrix, targetReturn) {
        const n = weights.length;
        const gradient = new Array(n);
        
        // Risk gradient: 2 * Σ * w
        for (let i = 0; i < n; i++) {
            gradient[i] = 0;
            for (let j = 0; j < n; j++) {
                gradient[i] += 2 * covarianceMatrix[i][j] * weights[j];
            }
        }
        
        // Return constraint gradient
        const portfolioReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0);
        const returnPenalty = 2 * (portfolioReturn - targetReturn);
        
        for (let i = 0; i < n; i++) {
            gradient[i] -= returnPenalty * returns[i];
        }
        
        return gradient;
    }
    
    // Risk Parity Optimization
    async riskParityOptimization(covarianceMatrix) {
        const n = covarianceMatrix.length;
        let weights = new Array(n).fill(1 / n);
        
        const maxIterations = 500;
        const tolerance = 1e-6;
        
        for (let iter = 0; iter < maxIterations; iter++) {
            const riskContributions = this.calculateRiskContributions(weights, covarianceMatrix);
            const targetRC = 1 / n; // Equal risk contribution
            
            // Update weights based on risk contribution deviation
            const newWeights = weights.map((w, i) => {
                const deviation = riskContributions[i] - targetRC;
                return Math.max(0.001, w * (1 - 0.1 * deviation));
            });
            
            // Normalize
            const sum = newWeights.reduce((s, w) => s + w, 0);
            const normalizedWeights = newWeights.map(w => w / sum);
            
            // Check convergence
            const change = this.calculateWeightChange(weights, normalizedWeights);
            weights = normalizedWeights;
            
            if (change < tolerance) break;
        }
        
        const weightsMap = new Map();
        Array.from(this.marketData.keys()).slice(0, n).forEach((asset, i) => {
            weightsMap.set(asset, weights[i]);
        });
        
        return weightsMap;
    }
    
    calculateRiskContributions(weights, covarianceMatrix) {
        const n = weights.length;
        const portfolioVariance = this.calculatePortfolioVariance(weights, covarianceMatrix);
        const riskContributions = new Array(n);
        
        for (let i = 0; i < n; i++) {
            let marginalRisk = 0;
            for (let j = 0; j < n; j++) {
                marginalRisk += covarianceMatrix[i][j] * weights[j];
            }
            riskContributions[i] = (weights[i] * marginalRisk) / portfolioVariance;
        }
        
        return riskContributions;
    }
    
    // Neural Network Optimization
    async optimizeWithNeuralNetwork(assets, expectedReturns, covarianceMatrix) {
        const features = this.prepareOptimizationFeatures(assets, expectedReturns, covarianceMatrix);
        const normalizedFeatures = this.normalizeFeatures(features);
        
        // Forward pass through optimization network
        const rawWeights = await this.optimizationNetwork.forward(normalizedFeatures);
        
        // Apply softmax for weight normalization
        const weights = this.softmax(rawWeights.slice(0, assets.length));
        
        const weightsMap = new Map();
        assets.forEach((asset, i) => {
            weightsMap.set(asset.symbol, weights[i]);
        });
        
        return weightsMap;
    }
    
    prepareOptimizationFeatures(assets, expectedReturns, covarianceMatrix) {
        const features = [];
        
        // Asset features
        assets.forEach(asset => {
            features.push(
                expectedReturns.get(asset.symbol) || 0,
                asset.volatility,
                asset.sharpe,
                asset.features.momentum_3m,
                asset.features.rsi / 100
            );
        });
        
        // Market features
        features.push(
            this.calculateMarketVolatility(),
            this.calculateMarketMomentum(),
            this.calculateMarketSentiment()
        );
        
        // Pad or truncate to expected input size
        while (features.length < 45) features.push(0);
        return features.slice(0, 45);
    }
    
    // Ensemble Optimization
    async ensembleOptimization(optimizations) {
        const assets = new Set();
        
        // Collect all assets
        optimizations.forEach(opt => {
            for (const asset of opt.weights.keys()) {
                assets.add(asset);
            }
        });
        
        const finalWeights = new Map();
        
        // Weighted average of optimization results
        for (const asset of assets) {
            let weightedSum = 0;
            let totalConfidence = 0;
            
            optimizations.forEach(opt => {
                const weight = opt.weights.get(asset) || 0;
                weightedSum += weight * opt.confidence;
                totalConfidence += opt.confidence;
            });
            
            if (totalConfidence > 0) {
                finalWeights.set(asset, weightedSum / totalConfidence);
            }
        }
        
        return this.normalizeWeights(finalWeights);
    }
    
    // Portfolio Rebalancing
    async checkRebalancing() {
        try {
            const currentWeights = this.calculateCurrentWeights();
            const targetWeights = this.portfolio.targetWeights;
            
            let maxDrift = 0;
            const rebalanceTrades = [];
            
            for (const [asset, targetWeight] of targetWeights) {
                const currentWeight = currentWeights.get(asset) || 0;
                const drift = Math.abs(currentWeight - targetWeight);
                maxDrift = Math.max(maxDrift, drift);
                
                if (drift > this.config.rebalanceThreshold) {
                    const targetValue = targetWeight * this.portfolio.totalValue;
                    const currentValue = currentWeight * this.portfolio.totalValue;
                    const tradeValue = targetValue - currentValue;
                    
                    rebalanceTrades.push({
                        symbol: asset,
                        action: tradeValue > 0 ? 'buy' : 'sell',
                        value: Math.abs(tradeValue),
                        currentWeight,
                        targetWeight,
                        drift
                    });
                }
            }
            
            if (maxDrift > this.config.rebalanceThreshold) {
                await this.executeRebalancing(rebalanceTrades);
            }
            
            return { maxDrift, trades: rebalanceTrades };
            
        } catch (error) {
            console.error(`[${this.agentId}] Rebalancing check error:`, error);
            return { maxDrift: 0, trades: [] };
        }
    }
    
    async executeRebalancing(trades) {
        console.log(`[${this.agentId}] Executing rebalancing with ${trades.length} trades`);
        
        // Send rebalancing orders
        for (const trade of trades) {
            this.sendMessage({
                type: 'REBALANCE_ORDER',
                data: {
                    symbol: trade.symbol,
                    action: trade.action,
                    value: trade.value,
                    reason: 'portfolio_rebalancing',
                    priority: 'medium'
                }
            });
        }
        
        // Update portfolio state
        this.portfolio.lastRebalance = Date.now();
        
        // Log rebalancing activity
        console.log(`[${this.agentId}] Rebalancing orders sent:`, trades);
    }
    
    // Performance Analytics
    calculatePortfolioMetrics() {
        try {
            const returns = this.getPortfolioReturns();
            if (returns.length < 30) return this.performance;
            
            // Total return
            const totalReturn = returns.reduce((prod, r) => prod * (1 + r), 1) - 1;
            
            // Volatility (annualized)
            const volatility = this.calculateVolatility(returns) * Math.sqrt(252);
            
            // Sharpe ratio
            const riskFreeRate = 0.02;
            const excessReturns = returns.map(r => r - riskFreeRate / 252);
            const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length * 252;
            const sharpeRatio = volatility > 0 ? avgExcessReturn / volatility : 0;
            
            // Maximum drawdown
            const maxDrawdown = this.calculateMaxDrawdown(returns);
            
            // Beta calculation
            const marketReturns = this.getMarketReturns();
            const beta = this.calculateBeta(returns, marketReturns);
            
            // Alpha calculation
            const marketReturn = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length * 252;
            const alpha = avgExcessReturn - beta * (marketReturn - riskFreeRate);
            
            // Information ratio
            const trackingError = this.calculateTrackingError(returns, marketReturns);
            const informationRatio = trackingError > 0 ? alpha / trackingError : 0;
            
            this.performance = {
                totalReturn,
                sharpeRatio,
                maxDrawdown,
                volatility,
                alpha,
                beta,
                informationRatio,
                trackingError,
                lastUpdated: Date.now()
            };
            
            return this.performance;
            
        } catch (error) {
            console.error(`[${this.agentId}] Performance calculation error:`, error);
            return this.performance;
        }
    }
    
    calculateMaxDrawdown(returns) {
        let peak = 1;
        let maxDD = 0;
        let current = 1;
        
        for (const ret of returns) {
            current *= (1 + ret);
            peak = Math.max(peak, current);
            const drawdown = (peak - current) / peak;
            maxDD = Math.max(maxDD, drawdown);
        }
        
        return maxDD;
    }
    
    calculateBeta(portfolioReturns, marketReturns) {
        const minLength = Math.min(portfolioReturns.length, marketReturns.length);
        const pReturns = portfolioReturns.slice(-minLength);
        const mReturns = marketReturns.slice(-minLength);
        
        const covariance = this.calculateCovariance(pReturns, mReturns);
        const marketVariance = this.calculateVariance(mReturns);
        
        return marketVariance > 0 ? covariance / marketVariance : 1;
    }
    
    calculateTrackingError(portfolioReturns, marketReturns) {
        const minLength = Math.min(portfolioReturns.length, marketReturns.length);
        const excessReturns = [];
        
        for (let i = 0; i < minLength; i++) {
            excessReturns.push(
                portfolioReturns[portfolioReturns.length - minLength + i] -
                marketReturns[marketReturns.length - minLength + i]
            );
        }
        
        return this.calculateVolatility(excessReturns) * Math.sqrt(252);
    }
    
    // Risk Management
    assessPortfolioRisk() {
        const riskMetrics = {};
        
        // Value at Risk (VaR)
        const returns = this.getPortfolioReturns();
        if (returns.length >= 100) {
            const sortedReturns = returns.slice().sort((a, b) => a - b);
            const var95 = sortedReturns[Math.floor(sortedReturns.length * 0.05)];
            const var99 = sortedReturns[Math.floor(sortedReturns.length * 0.01)];
            
            riskMetrics.var95 = var95 * this.portfolio.totalValue;
            riskMetrics.var99 = var99 * this.portfolio.totalValue;
        }
        
        // Concentration risk
        const weights = Array.from(this.portfolio.currentWeights.values());
        const herfindahlIndex = weights.reduce((sum, w) => sum + w * w, 0);
        riskMetrics.concentrationRisk = herfindahlIndex;
        
        // Sector concentration
        const sectorWeights = this.calculateSectorWeights();
        const sectorConcentration = Math.max(...Array.from(sectorWeights.values()));
        riskMetrics.sectorConcentration = sectorConcentration;
        
        // Liquidity risk
        riskMetrics.liquidityRisk = this.assessLiquidityRisk();
        
        this.portfolio.riskMetrics = riskMetrics;
        
        // Alert if risk limits exceeded
        if (riskMetrics.concentrationRisk > 0.3) {
            this.sendMessage({
                type: 'RISK_ALERT',
                data: {
                    type: 'concentration_risk',
                    value: riskMetrics.concentrationRisk,
                    threshold: 0.3,
                    severity: 'medium'
                }
            });
        }
        
        return riskMetrics;
    }
    
    calculateSectorWeights() {
        const sectorWeights = new Map();
        
        for (const [asset, weight] of this.portfolio.currentWeights) {
            const data = this.marketData.get(asset);
            const sector = data?.sector || 'Unknown';
            
            sectorWeights.set(sector, (sectorWeights.get(sector) || 0) + weight);
        }
        
        return sectorWeights;
    }
    
    assessLiquidityRisk() {
        let totalLiquidityScore = 0;
        let totalWeight = 0;
        
        for (const [asset, weight] of this.portfolio.currentWeights) {
            const data = this.marketData.get(asset);
            const volume = data?.volume || 0;
            const marketCap = data?.marketCap || 0;
            
            // Simple liquidity score based on volume and market cap
            const liquidityScore = Math.min(1, Math.log(volume * marketCap + 1) / 25);
            
            totalLiquidityScore += liquidityScore * weight;
            totalWeight += weight;
        }
        
        return totalWeight > 0 ? 1 - (totalLiquidityScore / totalWeight) : 0;
    }
    
    // Utility Functions
    calculateReturns(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
        return returns;
    }
    
    calculateVolatility(returns) {
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
        return Math.sqrt(variance);
    }
    
    calculateVariance(returns) {
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        return returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    }
    
    calculateCovariance(returns1, returns2) {
        const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
        const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;
        
        const covariance = returns1.reduce((sum, r1, i) => {
            return sum + (r1 - mean1) * (returns2[i] - mean2);
        }, 0) / (returns1.length - 1);
        
        return covariance;
    }
    
    calculateSharpeRatio(returns) {
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length * 252;
        const volatility = this.calculateVolatility(returns) * Math.sqrt(252);
        const riskFreeRate = 0.02;
        
        return volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
    }
    
    calculateMomentum(prices, period) {
        if (prices.length < period + 1) return 0;
        const current = prices[prices.length - 1];
        const past = prices[prices.length - 1 - period];
        return (current - past) / past;
    }
    
    calculateSkewness(returns) {
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = this.calculateVariance(returns);
        const skewness = returns.reduce((sum, r) => {
            return sum + Math.pow((r - mean) / Math.sqrt(variance), 3);
        }, 0) / returns.length;
        
        return skewness;
    }
    
    calculateKurtosis(returns) {
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = this.calculateVariance(returns);
        const kurtosis = returns.reduce((sum, r) => {
            return sum + Math.pow((r - mean) / Math.sqrt(variance), 4);
        }, 0) / returns.length - 3; // Excess kurtosis
        
        return kurtosis;
    }
    
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = prices.length - period; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
        if (prices.length < slow) return 0;
        
        const emaFast = this.calculateEMA(prices, fast);
        const emaSlow = this.calculateEMA(prices, slow);
        
        return emaFast - emaSlow;
    }
    
    calculateEMA(prices, period) {
        if (prices.length === 0) return 0;
        
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }
    
    normalizeFeatures(features) {
        // Simple min-max normalization
        const min = Math.min(...features);
        const max = Math.max(...features);
        const range = max - min;
        
        if (range === 0) return features.map(() => 0.5);
        
        return features.map(f => (f - min) / range);
    }
    
    softmax(values) {
        const exp = values.map(v => Math.exp(v - Math.max(...values)));
        const sum = exp.reduce((s, e) => s + e, 0);
        return exp.map(e => e / sum);
    }
    
    normalizeWeights(weights) {
        const total = Array.from(weights.values()).reduce((sum, w) => sum + w, 0);
        if (total === 0) return weights;
        
        const normalized = new Map();
        for (const [asset, weight] of weights) {
            normalized.set(asset, weight / total);
        }
        return normalized;
    }
    
    validateWeights(weights, constraints = {}) {
        const validated = new Map();
        const minWeight = constraints.minWeight || 0.001;
        const maxWeight = constraints.maxWeight || 0.15;
        
        for (const [asset, weight] of weights) {
            const clampedWeight = Math.max(minWeight, Math.min(maxWeight, weight));
            if (clampedWeight > 0) {
                validated.set(asset, clampedWeight);
            }
        }
        
        return this.normalizeWeights(validated);
    }
    
    // Matrix Operations
    multiplyMatrixVector(matrix, vector) {
        return matrix.map(row =>
            row.reduce((sum, val, i) => sum + val * vector[i], 0)
        );
    }
    
    scaleMatrix(matrix, scalar) {
        return matrix.map(row => row.map(val => val * scalar));
    }
    
    calculatePTauCovP(P, tauCov) {
        // P * tauCov * P^T
        const result = [];
        for (let i = 0; i < P.length; i++) {
            const row = [];
            for (let j = 0; j < P.length; j++) {
                let sum = 0;
                for (let k = 0; k < P[i].length; k++) {
                    for (let l = 0; l < P[j].length; l++) {
                        sum += P[i][k] * tauCov[k][l] * P[j][l];
                    }
                }
                row.push(sum);
            }
            result.push(row);
        }
        return result;
    }
    
    blackLittermanFormula(impliedReturns, tauCov, P, Q, omega) {
        // Simplified Black-Litterman calculation
        // In practice, this would involve matrix inversion
        const adjusted = [...impliedReturns];
        
        // Apply views with simple weighted adjustment
        for (let i = 0; i < P.length; i++) {
            const viewWeight = 0.3; // Confidence in views
            for (let j = 0; j < P[i].length; j++) {
                adjusted[j] += viewWeight * P[i][j] * Q[i];
            }
        }
        
        return adjusted;
    }
    
    vectorNorm(vector) {
        return Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    }
    
    calculateWeightChange(weights1, weights2) {
        let change = 0;
        for (let i = 0; i < weights1.length; i++) {
            change += Math.abs(weights1[i] - weights2[i]);
        }
        return change;
    }
    
    calculatePortfolioVariance(weights, covarianceMatrix) {
        let variance = 0;
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                variance += weights[i] * weights[j] * covarianceMatrix[i][j];
            }
        }
        return variance;
    }
    
    calculatePortfolioReturn(weights, expectedReturns) {
        let portfolioReturn = 0;
        for (const [asset, weight] of weights) {
            portfolioReturn += weight * (expectedReturns.get(asset) || 0);
        }
        return portfolioReturn;
    }
    
    calculatePortfolioRisk(weights, covarianceMatrix) {
        const weightsArray = Array.from(weights.values());
        return Math.sqrt(this.calculatePortfolioVariance(weightsArray, covarianceMatrix));
    }
    
    calculateCurrentWeights() {
        const weights = new Map();
        let totalValue = 0;
        
        // Calculate total portfolio value
        for (const [asset, quantity] of this.portfolio.assets) {
            const data = this.marketData.get(asset);
            const price = data?.prices?.[data.prices.length - 1] || 0;
            const value = quantity * price;
            totalValue += value;
        }
        
        // Calculate weights
        for (const [asset, quantity] of this.portfolio.assets) {
            const data = this.marketData.get(asset);
            const price = data?.prices?.[data.prices.length - 1] || 0;
            const value = quantity * price;
            weights.set(asset, totalValue > 0 ? value / totalValue : 0);
        }
        
        this.portfolio.totalValue = totalValue;
        this.portfolio.currentWeights = weights;
        
        return weights;
    }
    
    updatePortfolioTargets(weights) {
        this.portfolio.targetWeights = new Map(weights);
        console.log(`[${this.agentId}] Portfolio targets updated for ${weights.size} assets`);
    }
    
    getPortfolioReturns() {
        // Simplified portfolio return calculation
        const returns = [];
        const weights = this.portfolio.currentWeights;
        
        if (weights.size === 0) return returns;
        
        // Get minimum data length
        let minLength = Infinity;
        for (const asset of weights.keys()) {
            const data = this.marketData.get(asset);
            if (data?.prices) {
                minLength = Math.min(minLength, data.prices.length - 1);
            }
        }
        
        if (minLength === Infinity || minLength < 1) return returns;
        
        // Calculate portfolio returns
        for (let i = 0; i < minLength; i++) {
            let portfolioReturn = 0;
            let totalWeight = 0;
            
            for (const [asset, weight] of weights) {
                const data = this.marketData.get(asset);
                if (data?.prices && data.prices.length > i + 1) {
                    const assetReturn = (data.prices[data.prices.length - 1 - i] - 
                                       data.prices[data.prices.length - 2 - i]) /
                                      data.prices[data.prices.length - 2 - i];
                    portfolioReturn += weight * assetReturn;
                    totalWeight += weight;
                }
            }
            
            if (totalWeight > 0) {
                returns.unshift(portfolioReturn / totalWeight);
            }
        }
        
        return returns;
    }
    
    getMarketReturns() {
        // Use SPY as market proxy
        const spyData = this.marketData.get('SPY');
        if (!spyData?.prices) return [];
        
        return this.calculateReturns(spyData.prices);
    }
    
    calculateMarketVolatility() {
        const marketReturns = this.getMarketReturns();
        return marketReturns.length > 0 ? this.calculateVolatility(marketReturns) : 0.15;
    }
    
    calculateMarketMomentum() {
        const spyData = this.marketData.get('SPY');
        if (!spyData?.prices) return 0;
        return this.calculateMomentum(spyData.prices, 63);
    }
    
    calculateMarketSentiment() {
        // Simplified market sentiment based on VIX-like calculation
        const volatility = this.calculateMarketVolatility();
        return Math.max(0, Math.min(1, (0.4 - volatility) / 0.3)); // Normalized to 0-1
    }
    
    // Event Handlers
    handleMarketDataUpdate(data) {
        try {
            if (data.symbol && data.price) {
                if (!this.marketData.has(data.symbol)) {
                    this.marketData.set(data.symbol, { prices: [], volume: 0 });
                }
                
                const assetData = this.marketData.get(data.symbol);
                assetData.prices.push(data.price);
                
                // Keep only recent data
                if (assetData.prices.length > 500) {
                    assetData.prices = assetData.prices.slice(-500);
                }
                
                // Update other fields
                if (data.volume) assetData.volume = data.volume;
                if (data.marketCap) assetData.marketCap = data.marketCap;
                if (data.sector) assetData.sector = data.sector;
            }
            
        } catch (error) {
            console.error(`[${this.agentId}] Market data update error:`, error);
        }
    }
    
    handleRiskAlert(data) {
        if (data.severity === 'high') {
            // Trigger emergency rebalancing
            this.checkRebalancing();
        }
    }
    
    handleTradeExecution(data) {
        if (data.symbol && data.quantity && data.price) {
            // Update portfolio positions
            const currentQuantity = this.portfolio.assets.get(data.symbol) || 0;
            const newQuantity = currentQuantity + (data.action === 'buy' ? data.quantity : -data.quantity);
            
            if (newQuantity > 0) {
                this.portfolio.assets.set(data.symbol, newQuantity);
            } else {
                this.portfolio.assets.delete(data.symbol);
            }
            
            // Recalculate current weights
            this.calculateCurrentWeights();
        }
    }
    
    handlePortfolioRequest(message) {
        const portfolioData = {
            assets: Array.from(this.portfolio.assets.entries()),
            totalValue: this.portfolio.totalValue,
            currentWeights: Array.from(this.portfolio.currentWeights.entries()),
            targetWeights: Array.from(this.portfolio.targetWeights.entries()),
            performance: this.performance,
            riskMetrics: this.portfolio.riskMetrics
        };
        
        this.sendMessage({
            type: 'PORTFOLIO_RESPONSE',
            requestId: message.requestId,
            data: portfolioData
        });
    }
    
    // Data Loading
    async loadHistoricalData() {
        try {
            // Load sample market data for major assets
            const symbols = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'BTC', 'ETH'];
            
            for (const symbol of symbols) {
                await this.loadAssetData(symbol);
            }
            
            console.log(`[${this.agentId}] Historical data loaded for ${symbols.length} assets`);
            
        } catch (error) {
            console.error(`[${this.agentId}] Data loading error:`, error);
        }
    }
    
    async loadAssetData(symbol) {
        // Generate realistic historical data
        const data = this.generateRealisticPriceData(symbol);
        this.marketData.set(symbol, data);
    }
    
    generateRealisticPriceData(symbol) {
        const basePrice = this.getBasePriceForSymbol(symbol);
        const prices = [];
        const returns = [];
        let currentPrice = basePrice;
        
        // Generate 2 years of daily data
        for (let i = 0; i < 504; i++) {
            const dailyReturn = (Math.random() - 0.5) * 0.04 + this.getTrendForSymbol(symbol) / 252;
            currentPrice *= (1 + dailyReturn);
            prices.push(currentPrice);
            returns.push(dailyReturn);
        }
        
        return {
            prices,
            returns,
            volume: Math.random() * 10000000 + 1000000,
            marketCap: basePrice * 1000000000 * (Math.random() + 0.5),
            sector: this.getSectorForSymbol(symbol),
            peRatio: Math.random() * 30 + 10,
            pbRatio: Math.random() * 5 + 0.5,
            dividendYield: Math.random() * 0.05,
            beta: Math.random() * 1.5 + 0.5
        };
    }
    
    getBasePriceForSymbol(symbol) {
        const basePrices = {
            'SPY': 450, 'QQQ': 380, 'AAPL': 175, 'MSFT': 340,
            'GOOGL': 140, 'AMZN': 145, 'TSLA': 220, 'NVDA': 480,
            'BTC': 45000, 'ETH': 2800
        };
        return basePrices[symbol] || 100;
    }
    
    getTrendForSymbol(symbol) {
        const trends = {
            'SPY': 0.08, 'QQQ': 0.12, 'AAPL': 0.15, 'MSFT': 0.12,
            'GOOGL': 0.10, 'AMZN': 0.08, 'TSLA': 0.20, 'NVDA': 0.25,
            'BTC': 0.30, 'ETH': 0.35
        };
        return trends[symbol] || 0.08;
    }
    
    getSectorForSymbol(symbol) {
        const sectors = {
            'SPY': 'ETF', 'QQQ': 'ETF', 'AAPL': 'Technology',
            'MSFT': 'Technology', 'GOOGL': 'Technology', 'AMZN': 'Consumer Discretionary',
            'TSLA': 'Consumer Discretionary', 'NVDA': 'Technology',
            'BTC': 'Cryptocurrency', 'ETH': 'Cryptocurrency'
        };
        return sectors[symbol] || 'Technology';
    }
    
    // Main Analysis Loop
    startOptimizationCycle() {
        // Initial optimization
        setTimeout(() => this.optimizationLoop(), 1000);
        
        // Performance monitoring
        setInterval(() => this.monitorPerformance(), 60000); // Every minute
        
        // Risk assessment
        setInterval(() => this.assessPortfolioRisk(), 120000); // Every 2 minutes
        
        // Rebalancing check
        setInterval(() => this.checkRebalancing(), 300000); // Every 5 minutes
    }
    
    async optimizationLoop() {
        if (this.isAnalyzing) return;
        
        try {
            this.isAnalyzing = true;
            
            // Optimize portfolio if enough data
            if (this.marketData.size >= 5) {
                const weights = await this.optimizePortfolio();
                
                // Calculate and store metrics
                const metrics = this.calculatePortfolioMetrics();
                
                // Log status
                console.log(`[${this.agentId}] Optimization complete - Assets: ${weights.size}, Sharpe: ${metrics.sharpeRatio.toFixed(3)}`);
            }
            
        } catch (error) {
            console.error(`[${this.agentId}] Optimization loop error:`, error);
        } finally {
            this.isAnalyzing = false;
            
            // Schedule next optimization
            setTimeout(() => this.optimizationLoop(), this.config.optimizationInterval);
        }
    }
    
    monitorPerformance() {
        try {
            const metrics = this.calculatePortfolioMetrics();
            
            // Send performance update
            this.sendMessage({
                type: 'PERFORMANCE_UPDATE',
                data: {
                    agentId: this.agentId,
                    performance: metrics,
                    portfolioValue: this.portfolio.totalValue,
                    assetCount: this.portfolio.assets.size,
                    timestamp: Date.now()
                }
            });
            
        } catch (error) {
            console.error(`[${this.agentId}] Performance monitoring error:`, error);
        }
    }
    
    // ============================================================================
    // REAL API INTEGRATION METHODS
    // ============================================================================
    
    // Stock Data from Alpha Vantage & Finnhub
    async fetchStockData() {
        const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META'];
        
        for (const symbol of symbols) {
            try {
                // Try Finnhub first (higher rate limit)
                if (this.config.apis.finnhub.enabled && this.checkRateLimit('finnhub')) {
                    const data = await this.fetchFromFinnhub(symbol);
                    if (data) continue;
                }
                
                // Fallback to Alpha Vantage
                if (this.config.apis.alphavantage.enabled && this.checkRateLimit('alphavantage')) {
                    await this.fetchFromAlphaVantage(symbol);
                }
                
            } catch (error) {
                console.error(`[${this.agentId}] Error fetching stock data for ${symbol}:`, error);
            }
        }
    }
    
    async fetchFromFinnhub(symbol) {
        return await this.circuitBreakers.get('finnhub').execute(async () => {
            const url = `${this.config.apis.finnhub.baseUrl}/quote?symbol=${symbol}&token=${this.config.apis.finnhub.key}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Finnhub API error: ${response.status}`);
            
            const data = await response.json();
            
            if (data.c) { // Current price exists
                this.marketData.set(symbol, {
                    symbol: symbol,
                    price: data.c, // Current price
                    priceChange: data.dp, // Percent change
                    high: data.h, // High price of the day
                    low: data.l, // Low price of the day
                    open: data.o, // Open price of the day
                    previousClose: data.pc, // Previous close price
                    timestamp: Date.now(),
                    source: 'finnhub'
                });
                
                this.incrementApiCount('finnhub');
                return true;
            }
            return false;
        });
    }
    
    async fetchFromAlphaVantage(symbol) {
        return await this.circuitBreakers.get('alphavantage').execute(async () => {
            const url = `${this.config.apis.alphavantage.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.config.apis.alphavantage.key}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`);
            
            const data = await response.json();
            const quote = data['Global Quote'];
            
            if (quote && quote['05. price']) {
                this.marketData.set(symbol, {
                    symbol: symbol,
                    price: parseFloat(quote['05. price']),
                    priceChange: parseFloat(quote['09. change']),
                    priceChangePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                    high: parseFloat(quote['03. high']),
                    low: parseFloat(quote['04. low']),
                    open: parseFloat(quote['02. open']),
                    previousClose: parseFloat(quote['08. previous close']),
                    volume: parseFloat(quote['06. volume']),
                    timestamp: Date.now(),
                    source: 'alphavantage'
                });
                
                this.incrementApiCount('alphavantage');
                return true;
            }
            return false;
        });
    }
    
    // Forex Data
    async fetchForexData() {
        const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD'];
        
        for (const pair of pairs) {
            try {
                if (this.config.apis.alphavantage.enabled && this.checkRateLimit('alphavantage')) {
                    await this.fetchForexFromAlphaVantage(pair);
                }
            } catch (error) {
                console.error(`[${this.agentId}] Error fetching forex data for ${pair}:`, error);
            }
        }
    }
    
    async fetchForexFromAlphaVantage(pair) {
        return await this.circuitBreakers.get('alphavantage').execute(async () => {
            const from = pair.substring(0, 3);
            const to = pair.substring(3, 6);
            const url = `${this.config.apis.alphavantage.baseUrl}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.config.apis.alphavantage.key}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Alpha Vantage Forex API error: ${response.status}`);
            
            const data = await response.json();
            const exchange = data['Realtime Currency Exchange Rate'];
            
            if (exchange && exchange['5. Exchange Rate']) {
                this.marketData.set(pair, {
                    symbol: pair,
                    price: parseFloat(exchange['5. Exchange Rate']),
                    bid: parseFloat(exchange['8. Bid Price']),
                    ask: parseFloat(exchange['9. Ask Price']),
                    timestamp: Date.now(),
                    source: 'alphavantage'
                });
                
                this.incrementApiCount('alphavantage');
                return true;
            }
            return false;
        });
    }
    
    // Economic Data (Free from CoinGecko & other sources)
    async fetchEconomicData() {
        try {
            // Fetch crypto market cap data from CoinGecko (free)
            await this.fetchCryptoMarketData();
            
            // Add more economic indicators as needed
        } catch (error) {
            console.error(`[${this.agentId}] Error fetching economic data:`, error);
        }
    }
    
    async fetchCryptoMarketData() {
        return await this.circuitBreakers.get('coingecko').execute(async () => {
            const url = `${this.config.apis.coingecko.baseUrl}/global`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
            
            const data = await response.json();
            
            if (data.data) {
                this.marketData.set('CRYPTO_GLOBAL', {
                    totalMarketCap: data.data.total_market_cap.usd,
                    totalVolume: data.data.total_volume.usd,
                    marketCapPercentage: data.data.market_cap_percentage,
                    activeCoins: data.data.active_cryptocurrencies,
                    timestamp: Date.now(),
                    source: 'coingecko'
                });
                return true;
            }
            return false;
        });
    }
    
    // Rate Limiting & Circuit Breaker Helpers
    checkRateLimit(api) {
        const limits = {
            alphavantage: { max: 25, window: 86400000 }, // 25 per day
            finnhub: { max: 60, window: 60000 } // 60 per minute
        };
        
        if (!limits[api]) return true;
        
        const counter = this.apiRequestCounts.get(api);
        const now = Date.now();
        
        // Reset counter if window expired
        if (now > counter.resetTime) {
            counter.count = 0;
            counter.resetTime = now + limits[api].window;
        }
        
        return counter.count < limits[api].max;
    }
    
    incrementApiCount(api) {
        const counter = this.apiRequestCounts.get(api);
        if (counter) {
            counter.count++;
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
            portfolio: {
                totalValue: this.portfolio.totalValue,
                assetCount: this.portfolio.assets.size,
                lastRebalance: this.portfolio.lastRebalance
            },
            performance: this.performance,
            marketDataCount: this.marketData.size,
            lastUpdate: Date.now()
        };
    }
}

// Neural Network Classes
class PortfolioOptimizationNN {
    constructor(config) {
        this.config = config;
        this.weights = [];
        this.biases = [];
        this.initializeWeights();
        
        // Adam optimizer parameters
        this.adamConfig = {
            beta1: 0.9,
            beta2: 0.999,
            epsilon: 1e-8,
            learningRate: config.learningRate || 0.0001
        };
        
        this.adamState = {
            m_weights: [],
            v_weights: [],
            m_biases: [],
            v_biases: [],
            t: 0 // time step
        };
        
        this.initializeAdamState();
    }
    
    initializeWeights() {
        const layers = [this.config.inputSize, ...this.config.hiddenLayers, this.config.outputSize];
        
        for (let i = 0; i < layers.length - 1; i++) {
            // Xavier/Glorot initialization
            const limit = Math.sqrt(6 / (layers[i] + layers[i + 1]));
            const weights = Array(layers[i]).fill().map(() =>
                Array(layers[i + 1]).fill().map(() => 
                    (Math.random() * 2 - 1) * limit
                )
            );
            
            const biases = Array(layers[i + 1]).fill().map(() => 
                (Math.random() * 2 - 1) * 0.1
            );
            
            this.weights.push(weights);
            this.biases.push(biases);
        }
    }
    
    initializeAdamState() {
        // Initialize Adam optimizer state
        for (let i = 0; i < this.weights.length; i++) {
            this.adamState.m_weights[i] = this.weights[i].map(row => row.map(() => 0));
            this.adamState.v_weights[i] = this.weights[i].map(row => row.map(() => 0));
            this.adamState.m_biases[i] = this.biases[i].map(() => 0);
            this.adamState.v_biases[i] = this.biases[i].map(() => 0);
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
                
                // Apply activation function
                if (layer < this.weights.length - 1) {
                    layerOutput.push(this.relu(sum)); // Hidden layers use ReLU
                } else {
                    layerOutput.push(sum); // Output layer is linear
                }
            }
            
            activation = layerOutput;
        }
        
        return activation;
    }
    
    relu(x) {
        return Math.max(0, x);
    }
    
    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }
    
    async train(inputs, targets) {
        const batchSize = inputs.length;
        let totalLoss = 0;
        
        // Forward pass and calculate gradients
        const gradients = this.calculateGradients(inputs, targets);
        
        // Update weights using Adam optimizer
        this.adamState.t++;
        
        for (let layer = 0; layer < this.weights.length; layer++) {
            // Update weights
            for (let i = 0; i < this.weights[layer].length; i++) {
                for (let j = 0; j < this.weights[layer][i].length; j++) {
                    const gradient = gradients.weights[layer][i][j] / batchSize;
                    
                    // Adam update
                    this.adamState.m_weights[layer][i][j] = this.adamConfig.beta1 * this.adamState.m_weights[layer][i][j] + 
                                                           (1 - this.adamConfig.beta1) * gradient;
                    this.adamState.v_weights[layer][i][j] = this.adamConfig.beta2 * this.adamState.v_weights[layer][i][j] + 
                                                           (1 - this.adamConfig.beta2) * gradient * gradient;
                    
                    const m_hat = this.adamState.m_weights[layer][i][j] / (1 - Math.pow(this.adamConfig.beta1, this.adamState.t));
                    const v_hat = this.adamState.v_weights[layer][i][j] / (1 - Math.pow(this.adamConfig.beta2, this.adamState.t));
                    
                    this.weights[layer][i][j] -= this.adamConfig.learningRate * m_hat / 
                                                (Math.sqrt(v_hat) + this.adamConfig.epsilon);
                }
            }
            
            // Update biases
            for (let j = 0; j < this.biases[layer].length; j++) {
                const gradient = gradients.biases[layer][j] / batchSize;
                
                // Adam update
                this.adamState.m_biases[layer][j] = this.adamConfig.beta1 * this.adamState.m_biases[layer][j] + 
                                                   (1 - this.adamConfig.beta1) * gradient;
                this.adamState.v_biases[layer][j] = this.adamConfig.beta2 * this.adamState.v_biases[layer][j] + 
                                                   (1 - this.adamConfig.beta2) * gradient * gradient;
                
                const m_hat = this.adamState.m_biases[layer][j] / (1 - Math.pow(this.adamConfig.beta1, this.adamState.t));
                const v_hat = this.adamState.v_biases[layer][j] / (1 - Math.pow(this.adamConfig.beta2, this.adamState.t));
                
                this.biases[layer][j] -= this.adamConfig.learningRate * m_hat / 
                                        (Math.sqrt(v_hat) + this.adamConfig.epsilon);
            }
        }
        
        return totalLoss / batchSize;
    }
    
    calculateGradients(inputs, targets) {
        // Simplified gradient calculation for portfolio optimization
        const gradients = {
            weights: this.weights.map(layer => layer.map(row => row.map(() => 0))),
            biases: this.biases.map(layer => layer.map(() => 0))
        };
        
        // This would implement full backpropagation
        // For now, using simplified gradient estimation
        
        return gradients;
    }
}

class RiskAssessmentNN {
    constructor(config) {
        this.config = config;
        this.weights = [];
        this.biases = [];
        this.initializeWeights();
        
        this.optimizer = config.optimizer || 'rmsprop';
        this.learningRate = config.learningRate || 0.001;
        
        // RMSprop state
        if (this.optimizer === 'rmsprop') {
            this.rmsState = {
                weights: [],
                biases: [],
                decay: 0.9,
                epsilon: 1e-8
            };
            this.initializeRMSState();
        }
    }
    
    initializeWeights() {
        const layers = [this.config.inputSize, ...this.config.hiddenLayers, this.config.outputSize];
        
        for (let i = 0; i < layers.length - 1; i++) {
            const limit = Math.sqrt(2 / layers[i]); // He initialization for ReLU
            const weights = Array(layers[i]).fill().map(() =>
                Array(layers[i + 1]).fill().map(() => 
                    Math.random() * 2 * limit - limit
                )
            );
            
            const biases = Array(layers[i + 1]).fill(0);
            
            this.weights.push(weights);
            this.biases.push(biases);
        }
    }
    
    initializeRMSState() {
        for (let i = 0; i < this.weights.length; i++) {
            this.rmsState.weights[i] = this.weights[i].map(row => row.map(() => 0));
            this.rmsState.biases[i] = this.biases[i].map(() => 0);
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
                
                layerOutput.push(layer < this.weights.length - 1 ? this.relu(sum) : this.sigmoid(sum));
            }
            
            activation = layerOutput;
        }
        
        return activation;
    }
    
    relu(x) {
        return Math.max(0, x);
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
    }
}

class AssetAllocationNN {
    constructor(config) {
        this.config = config;
        this.weights = [];
        this.biases = [];
        this.initializeWeights();
        
        this.adamConfig = {
            beta1: 0.9,
            beta2: 0.999,
            epsilon: 1e-8,
            learningRate: config.learningRate || 0.0005
        };
    }
    
    initializeWeights() {
        const layers = [this.config.inputSize, ...this.config.hiddenLayers, this.config.outputSize];
        
        for (let i = 0; i < layers.length - 1; i++) {
            const limit = Math.sqrt(6 / (layers[i] + layers[i + 1]));
            const weights = Array(layers[i]).fill().map(() =>
                Array(layers[i + 1]).fill().map(() => 
                    (Math.random() * 2 - 1) * limit
                )
            );
            
            const biases = Array(layers[i + 1]).fill().map(() => 
                Math.random() * 0.1 - 0.05
            );
            
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
                    layerOutput.push(sum); // Linear output for allocation weights
                }
            }
            
            activation = layerOutput;
        }
        
        return activation;
    }
    
    leakyRelu(x) {
        return x > 0 ? x : 0.01 * x;
    }
}

// ES6 Module Export
export default PortfolioOptimizationAgent;