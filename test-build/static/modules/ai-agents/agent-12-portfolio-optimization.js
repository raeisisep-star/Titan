/**
 * TITAN Trading System - Agent 12: Portfolio Optimization Specialist
 * 
 * Advanced AI Agent specializing in portfolio construction, asset allocation optimization,
 * and Modern Portfolio Theory implementation with deep learning enhancement.
 * 
 * Features:
 * - Deep Neural Network for portfolio optimization
 * - Modern Portfolio Theory (MPT) implementation
 * - Black-Litterman model integration
 * - Risk Parity and Factor-based allocation
 * - Dynamic rebalancing with ML predictions
 * - Multi-objective optimization (return, risk, diversification)
 * - Genetic Algorithm for portfolio construction
 * - Real-time portfolio monitoring and adjustment
 * - Inter-agent communication for market insights
 * 
 * @author TITAN Trading System
 * @version 2.0.0
 */

class PortfolioOptimizationAgent {
    constructor() {
        this.agentId = 'AGENT_12_PORTFOLIO';
        this.name = 'Portfolio Optimization Specialist';
        this.version = '2.0.0';
        
        // Neural Network Architecture
        this.optimizationNetwork = null;
        this.allocationNetwork = null;
        this.riskNetwork = null;
        
        // Portfolio Optimization Configuration
        this.config = {
            networkParams: {
                optimizationLayers: [200, 150, 100, 75, 50, 25, 10], // Asset count to weights
                allocationLayers: [100, 80, 60, 40, 20, 10, 5],
                riskLayers: [80, 60, 40, 20, 10, 5, 1],
                learningRate: 0.0005,
                momentum: 0.9,
                dropout: 0.2,
                batchSize: 32
            },
            optimizationMethods: {
                meanVariance: true,
                blackLitterman: true,
                riskParity: true,
                factorBased: true,
                geneticAlgorithm: true,
                rlOptimization: true
            },
            constraints: {
                maxWeightPerAsset: 0.15,     // 15% max per asset
                minWeightPerAsset: 0.001,    // 0.1% minimum
                maxSectorWeight: 0.25,       // 25% max per sector
                minDiversification: 10,       // Minimum 10 assets
                maxTurnover: 0.10,           // 10% max turnover per rebalance
                targetVolatility: 0.12       // 12% target annual volatility
            },
            rebalancing: {
                frequency: 'weekly',         // weekly, monthly, quarterly
                threshold: 0.05,             // 5% drift threshold
                costPerTrade: 0.001,         // 0.1% transaction cost
                minTradeSize: 0.005          // 0.5% minimum trade size
            }
        };
        
        // Portfolio Data
        this.portfolioData = {
            currentPortfolio: new Map(),
            targetPortfolio: new Map(),
            universeAssets: new Map(),
            priceHistory: new Map(),
            returnHistory: new Map(),
            covarianceMatrix: null,
            correlationMatrix: null,
            optimizationHistory: [],
            performanceMetrics: {
                totalReturn: 0,
                volatility: 0,
                sharpeRatio: 0,
                maxDrawdown: 0,
                alpha: 0,
                beta: 1,
                informationRatio: 0
            }
        };
        
        // Optimization Models
        this.models = {
            meanVariance: null,
            blackLitterman: null,
            riskParity: null,
            factorModel: null,
            geneticOptimizer: null
        };
        
        // Performance Metrics
        this.metrics = {
            optimizationsPerformed: 0,
            totalRebalances: 0,
            avgOptimizationTime: 0,
            optimizationSuccess: 0,
            portfolioPerformance: [],
            backTestResults: new Map()
        };
        
        // Inter-agent Communication
        this.communicationChannel = new BroadcastChannel('titan-agents-portfolio');
        this.lastBroadcast = Date.now();
        
        // Market data subscriptions
        this.dataSubscriptions = new Set();
        
        this.initialize();
    }

    /**
     * Initialize the Portfolio Optimization Agent
     */
    async initialize() {
        console.log(`[${this.agentId}] Initializing Portfolio Optimization Specialist...`);
        
        try {
            // Initialize neural networks
            await this.initializeNeuralNetworks();
            
            // Initialize optimization models
            await this.initializeOptimizationModels();
            
            // Setup communication listeners
            this.setupCommunication();
            
            // Load market data
            await this.loadMarketData();
            
            // Start optimization engine
            this.startOptimizationEngine();
            
            console.log(`[${this.agentId}] Successfully initialized`);
            
            // Broadcast initialization
            this.broadcastMessage({
                type: 'AGENT_INITIALIZED',
                agentId: this.agentId,
                capabilities: ['portfolio_optimization', 'asset_allocation', 'risk_management'],
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error(`[${this.agentId}] Initialization failed:`, error);
        }
    }

    /**
     * Initialize Neural Networks for Portfolio Optimization
     */
    async initializeNeuralNetworks() {
        // Main Portfolio Optimization Network
        this.optimizationNetwork = new PortfolioOptimizationNeuralNetwork(
            this.config.networkParams.optimizationLayers
        );
        await this.optimizationNetwork.initialize();
        
        // Asset Allocation Network
        this.allocationNetwork = new AssetAllocationNeuralNetwork(
            this.config.networkParams.allocationLayers
        );
        await this.allocationNetwork.initialize();
        
        // Risk Assessment Network
        this.riskNetwork = new RiskAssessmentNeuralNetwork(
            this.config.networkParams.riskLayers
        );
        await this.riskNetwork.initialize();
        
        console.log(`[${this.agentId}] Neural networks initialized`);
    }

    /**
     * Initialize optimization models
     */
    async initializeOptimizationModels() {
        // Mean-Variance Optimization
        this.models.meanVariance = new MeanVarianceOptimizer();
        
        // Black-Litterman Model
        this.models.blackLitterman = new BlackLittermanModel();
        
        // Risk Parity Model
        this.models.riskParity = new RiskParityOptimizer();
        
        // Factor Model
        this.models.factorModel = new FactorBasedOptimizer();
        
        // Genetic Algorithm Optimizer
        this.models.geneticOptimizer = new GeneticAlgorithmOptimizer();
        
        console.log(`[${this.agentId}] Optimization models initialized`);
    }

    /**
     * Main Portfolio Optimization Function
     */
    async optimizePortfolio(universe = null, constraints = null) {
        const startTime = performance.now();
        
        try {
            console.log(`[${this.agentId}] Starting portfolio optimization...`);
            
            // Use provided universe or default
            const assetUniverse = universe || Array.from(this.portfolioData.universeAssets.keys());
            const optimizationConstraints = { ...this.config.constraints, ...constraints };
            
            // Prepare input data
            const inputData = await this.prepareOptimizationData(assetUniverse);
            
            // Run multiple optimization methods
            const optimizationResults = await this.runMultipleOptimizations(inputData, optimizationConstraints);
            
            // Ensemble optimization results
            const ensemblePortfolio = await this.ensembleOptimizations(optimizationResults);
            
            // Apply neural network enhancement
            const enhancedPortfolio = await this.enhanceWithNeuralNetwork(ensemblePortfolio, inputData);
            
            // Validate and constrain portfolio
            const finalPortfolio = this.applyConstraints(enhancedPortfolio, optimizationConstraints);
            
            // Calculate expected performance
            const expectedMetrics = await this.calculateExpectedPerformance(finalPortfolio, inputData);
            
            const result = {
                portfolio: finalPortfolio,
                expectedMetrics: expectedMetrics,
                optimizationMethods: optimizationResults,
                processingTime: performance.now() - startTime,
                timestamp: Date.now()
            };
            
            // Store result
            this.portfolioData.optimizationHistory.push(result);
            
            // Update metrics
            this.metrics.optimizationsPerformed++;
            this.metrics.avgOptimizationTime = (
                this.metrics.avgOptimizationTime * (this.metrics.optimizationsPerformed - 1) + 
                result.processingTime
            ) / this.metrics.optimizationsPerformed;
            
            // Broadcast optimization result
            this.broadcastMessage({
                type: 'PORTFOLIO_OPTIMIZED',
                agentId: this.agentId,
                portfolio: finalPortfolio,
                expectedMetrics: expectedMetrics,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            console.error(`[${this.agentId}] Portfolio optimization failed:`, error);
            return null;
        }
    }

    /**
     * Prepare data for optimization
     */
    async prepareOptimizationData(assetUniverse) {
        const data = {
            assets: assetUniverse,
            returns: new Map(),
            prices: new Map(),
            volatilities: new Map(),
            correlations: null,
            covariance: null,
            marketData: new Map(),
            factorExposures: new Map(),
            expectedReturns: new Map()
        };
        
        // Collect historical data for each asset
        for (const asset of assetUniverse) {
            const priceHistory = this.portfolioData.priceHistory.get(asset) || [];
            const returnHistory = this.portfolioData.returnHistory.get(asset) || [];
            
            if (priceHistory.length > 0) {
                data.prices.set(asset, priceHistory);
                data.returns.set(asset, returnHistory);
                
                // Calculate volatility
                const volatility = this.calculateVolatility(returnHistory);
                data.volatilities.set(asset, volatility);
                
                // Estimate expected return using multiple methods
                const expectedReturn = await this.estimateExpectedReturn(asset, returnHistory);
                data.expectedReturns.set(asset, expectedReturn);
                
                // Get factor exposures
                const factorExposure = await this.calculateFactorExposures(asset);
                data.factorExposures.set(asset, factorExposure);
            }
        }
        
        // Calculate correlation and covariance matrices
        data.correlations = this.calculateCorrelationMatrix(data.returns);
        data.covariance = this.calculateCovarianceMatrix(data.returns);
        
        return data;
    }

    /**
     * Run multiple optimization methods
     */
    async runMultipleOptimizations(data, constraints) {
        const results = {};
        
        // Mean-Variance Optimization
        if (this.config.optimizationMethods.meanVariance) {
            results.meanVariance = await this.models.meanVariance.optimize(data, constraints);
        }
        
        // Black-Litterman Model
        if (this.config.optimizationMethods.blackLitterman) {
            results.blackLitterman = await this.models.blackLitterman.optimize(data, constraints);
        }
        
        // Risk Parity
        if (this.config.optimizationMethods.riskParity) {
            results.riskParity = await this.models.riskParity.optimize(data, constraints);
        }
        
        // Factor-Based Optimization
        if (this.config.optimizationMethods.factorBased) {
            results.factorBased = await this.models.factorModel.optimize(data, constraints);
        }
        
        // Genetic Algorithm
        if (this.config.optimizationMethods.geneticAlgorithm) {
            results.geneticAlgorithm = await this.models.geneticOptimizer.optimize(data, constraints);
        }
        
        return results;
    }

    /**
     * Ensemble multiple optimization results
     */
    async ensembleOptimizations(optimizationResults) {
        const assets = new Set();
        const methodWeights = {
            meanVariance: 0.25,
            blackLitterman: 0.25,
            riskParity: 0.20,
            factorBased: 0.15,
            geneticAlgorithm: 0.15
        };
        
        // Collect all assets from all methods
        Object.values(optimizationResults).forEach(result => {
            if (result && result.weights) {
                Object.keys(result.weights).forEach(asset => assets.add(asset));
            }
        });
        
        const ensemblePortfolio = {};
        
        // Calculate weighted average of all methods
        for (const asset of assets) {
            let weightedSum = 0;
            let totalWeight = 0;
            
            Object.entries(optimizationResults).forEach(([method, result]) => {
                if (result && result.weights && result.weights[asset]) {
                    const methodWeight = methodWeights[method] || 0.1;
                    weightedSum += result.weights[asset] * methodWeight;
                    totalWeight += methodWeight;
                }
            });
            
            if (totalWeight > 0) {
                ensemblePortfolio[asset] = weightedSum / totalWeight;
            }
        }
        
        // Normalize to sum to 1
        const totalPortfolioWeight = Object.values(ensemblePortfolio).reduce((sum, weight) => sum + weight, 0);
        
        if (totalPortfolioWeight > 0) {
            Object.keys(ensemblePortfolio).forEach(asset => {
                ensemblePortfolio[asset] /= totalPortfolioWeight;
            });
        }
        
        return ensemblePortfolio;
    }

    /**
     * Enhance portfolio using neural network
     */
    async enhanceWithNeuralNetwork(portfolio, inputData) {
        try {
            // Prepare neural network inputs
            const networkInput = this.prepareNetworkInput(portfolio, inputData);
            
            // Get neural network recommendations
            const networkOutput = await this.optimizationNetwork.optimize(networkInput);
            
            // Combine traditional and neural network results
            const enhancedPortfolio = {};
            const assets = Object.keys(portfolio);
            
            for (let i = 0; i < assets.length && i < networkOutput.length; i++) {
                const asset = assets[i];
                const traditionalWeight = portfolio[asset] || 0;
                const networkWeight = networkOutput[i] || 0;
                
                // Weighted combination (70% traditional, 30% neural network)
                enhancedPortfolio[asset] = traditionalWeight * 0.7 + networkWeight * 0.3;
            }
            
            // Normalize
            const totalWeight = Object.values(enhancedPortfolio).reduce((sum, weight) => sum + weight, 0);
            if (totalWeight > 0) {
                Object.keys(enhancedPortfolio).forEach(asset => {
                    enhancedPortfolio[asset] /= totalWeight;
                });
            }
            
            return enhancedPortfolio;
            
        } catch (error) {
            console.error(`[${this.agentId}] Neural network enhancement failed:`, error);
            return portfolio;
        }
    }

    /**
     * Prepare neural network input
     */
    prepareNetworkInput(portfolio, inputData) {
        const input = [];
        
        // Portfolio weights
        const assets = Object.keys(portfolio);
        assets.forEach(asset => {
            input.push(portfolio[asset] || 0);
        });
        
        // Expected returns
        assets.forEach(asset => {
            input.push(inputData.expectedReturns.get(asset) || 0);
        });
        
        // Volatilities
        assets.forEach(asset => {
            input.push(inputData.volatilities.get(asset) || 0);
        });
        
        // Pad or truncate to network input size
        while (input.length < this.config.networkParams.optimizationLayers[0]) {
            input.push(0);
        }
        
        return input.slice(0, this.config.networkParams.optimizationLayers[0]);
    }

    /**
     * Apply portfolio constraints
     */
    applyConstraints(portfolio, constraints) {
        const constrainedPortfolio = { ...portfolio };
        
        // Apply individual asset weight constraints
        Object.keys(constrainedPortfolio).forEach(asset => {
            if (constrainedPortfolio[asset] > constraints.maxWeightPerAsset) {
                constrainedPortfolio[asset] = constraints.maxWeightPerAsset;
            }
            if (constrainedPortfolio[asset] < constraints.minWeightPerAsset) {
                delete constrainedPortfolio[asset];
            }
        });
        
        // Normalize after constraint application
        const totalWeight = Object.values(constrainedPortfolio).reduce((sum, weight) => sum + weight, 0);
        if (totalWeight > 0) {
            Object.keys(constrainedPortfolio).forEach(asset => {
                constrainedPortfolio[asset] /= totalWeight;
            });
        }
        
        return constrainedPortfolio;
    }

    /**
     * Calculate expected portfolio performance metrics
     */
    async calculateExpectedPerformance(portfolio, inputData) {
        let expectedReturn = 0;
        let portfolioVariance = 0;
        
        // Calculate expected return
        Object.entries(portfolio).forEach(([asset, weight]) => {
            const assetReturn = inputData.expectedReturns.get(asset) || 0;
            expectedReturn += weight * assetReturn;
        });
        
        // Calculate portfolio variance using covariance matrix
        const assets = Object.keys(portfolio);
        for (let i = 0; i < assets.length; i++) {
            for (let j = 0; j < assets.length; j++) {
                const asset1 = assets[i];
                const asset2 = assets[j];
                const weight1 = portfolio[asset1] || 0;
                const weight2 = portfolio[asset2] || 0;
                
                const covariance = this.getCovarianceBetweenAssets(asset1, asset2, inputData);
                portfolioVariance += weight1 * weight2 * covariance;
            }
        }
        
        const portfolioVolatility = Math.sqrt(portfolioVariance);
        const sharpeRatio = expectedReturn / portfolioVolatility;
        
        return {
            expectedReturn: expectedReturn,
            volatility: portfolioVolatility,
            sharpeRatio: sharpeRatio,
            diversificationRatio: this.calculateDiversificationRatio(portfolio, inputData),
            riskContribution: this.calculateRiskContribution(portfolio, inputData)
        };
    }

    /**
     * Calculate diversification ratio
     */
    calculateDiversificationRatio(portfolio, inputData) {
        let weightedVolatilitySum = 0;
        
        Object.entries(portfolio).forEach(([asset, weight]) => {
            const volatility = inputData.volatilities.get(asset) || 0;
            weightedVolatilitySum += weight * volatility;
        });
        
        // Portfolio volatility vs weighted individual volatilities
        const portfolioVolatility = this.calculatePortfolioVolatility(portfolio, inputData);
        
        return portfolioVolatility > 0 ? weightedVolatilitySum / portfolioVolatility : 1;
    }

    /**
     * Calculate portfolio volatility
     */
    calculatePortfolioVolatility(portfolio, inputData) {
        let variance = 0;
        const assets = Object.keys(portfolio);
        
        for (let i = 0; i < assets.length; i++) {
            for (let j = 0; j < assets.length; j++) {
                const asset1 = assets[i];
                const asset2 = assets[j];
                const weight1 = portfolio[asset1] || 0;
                const weight2 = portfolio[asset2] || 0;
                
                const covariance = this.getCovarianceBetweenAssets(asset1, asset2, inputData);
                variance += weight1 * weight2 * covariance;
            }
        }
        
        return Math.sqrt(variance);
    }

    /**
     * Calculate risk contribution of each asset
     */
    calculateRiskContribution(portfolio, inputData) {
        const riskContribution = {};
        const portfolioVolatility = this.calculatePortfolioVolatility(portfolio, inputData);
        
        if (portfolioVolatility === 0) return riskContribution;
        
        Object.keys(portfolio).forEach(asset1 => {
            let contribution = 0;
            const weight1 = portfolio[asset1] || 0;
            
            Object.keys(portfolio).forEach(asset2 => {
                const weight2 = portfolio[asset2] || 0;
                const covariance = this.getCovarianceBetweenAssets(asset1, asset2, inputData);
                contribution += weight2 * covariance;
            });
            
            riskContribution[asset1] = (weight1 * contribution) / (portfolioVolatility * portfolioVolatility);
        });
        
        return riskContribution;
    }

    /**
     * Get covariance between two assets
     */
    getCovarianceBetweenAssets(asset1, asset2, inputData) {
        if (asset1 === asset2) {
            const volatility = inputData.volatilities.get(asset1) || 0;
            return volatility * volatility;
        }
        
        // Calculate correlation and convert to covariance
        const returns1 = inputData.returns.get(asset1) || [];
        const returns2 = inputData.returns.get(asset2) || [];
        
        if (returns1.length === 0 || returns2.length === 0) return 0;
        
        const correlation = this.calculateCorrelation(returns1, returns2);
        const vol1 = inputData.volatilities.get(asset1) || 0;
        const vol2 = inputData.volatilities.get(asset2) || 0;
        
        return correlation * vol1 * vol2;
    }

    /**
     * Calculate correlation between two return series
     */
    calculateCorrelation(returns1, returns2) {
        const n = Math.min(returns1.length, returns2.length);
        if (n < 2) return 0;
        
        const mean1 = returns1.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
        const mean2 = returns2.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < n; i++) {
            const diff1 = returns1[i] - mean1;
            const diff2 = returns2[i] - mean2;
            
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(sum1Sq * sum2Sq);
        return denominator > 0 ? numerator / denominator : 0;
    }

    /**
     * Calculate volatility from return series
     */
    calculateVolatility(returns) {
        if (returns.length < 2) return 0;
        
        const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
        const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (returns.length - 1);
        
        return Math.sqrt(variance);
    }

    /**
     * Calculate correlation matrix
     */
    calculateCorrelationMatrix(returnsMap) {
        const assets = Array.from(returnsMap.keys());
        const matrix = {};
        
        for (const asset1 of assets) {
            matrix[asset1] = {};
            for (const asset2 of assets) {
                if (asset1 === asset2) {
                    matrix[asset1][asset2] = 1.0;
                } else {
                    const returns1 = returnsMap.get(asset1) || [];
                    const returns2 = returnsMap.get(asset2) || [];
                    matrix[asset1][asset2] = this.calculateCorrelation(returns1, returns2);
                }
            }
        }
        
        return matrix;
    }

    /**
     * Calculate covariance matrix
     */
    calculateCovarianceMatrix(returnsMap) {
        const assets = Array.from(returnsMap.keys());
        const matrix = {};
        
        for (const asset1 of assets) {
            matrix[asset1] = {};
            for (const asset2 of assets) {
                const returns1 = returnsMap.get(asset1) || [];
                const returns2 = returnsMap.get(asset2) || [];
                
                if (asset1 === asset2) {
                    const volatility = this.calculateVolatility(returns1);
                    matrix[asset1][asset2] = volatility * volatility;
                } else {
                    const correlation = this.calculateCorrelation(returns1, returns2);
                    const vol1 = this.calculateVolatility(returns1);
                    const vol2 = this.calculateVolatility(returns2);
                    matrix[asset1][asset2] = correlation * vol1 * vol2;
                }
            }
        }
        
        return matrix;
    }

    /**
     * Estimate expected return for an asset
     */
    async estimateExpectedReturn(asset, returnHistory) {
        if (returnHistory.length === 0) return 0;
        
        // Multiple estimation methods
        const historicalMean = returnHistory.reduce((sum, ret) => sum + ret, 0) / returnHistory.length;
        
        // Exponentially weighted moving average (more weight on recent data)
        let ewma = 0;
        const alpha = 0.05;
        for (let i = returnHistory.length - 1; i >= 0; i--) {
            ewma = alpha * returnHistory[i] + (1 - alpha) * ewma;
        }
        
        // Simple average of different methods
        return (historicalMean + ewma) / 2;
    }

    /**
     * Calculate factor exposures for an asset
     */
    async calculateFactorExposures(asset) {
        // Mock factor exposures (in real implementation would use regression analysis)
        return {
            market: 0.8 + Math.random() * 0.4,        // Market beta
            size: (Math.random() - 0.5) * 0.5,       // Size factor
            value: (Math.random() - 0.5) * 0.3,      // Value factor
            profitability: (Math.random() - 0.5) * 0.2, // Profitability factor
            investment: (Math.random() - 0.5) * 0.2,    // Investment factor
            momentum: (Math.random() - 0.5) * 0.3       // Momentum factor
        };
    }

    /**
     * Portfolio rebalancing analysis
     */
    async analyzeRebalancingNeeds() {
        const currentPortfolio = this.portfolioData.currentPortfolio;
        const targetPortfolio = this.portfolioData.targetPortfolio;
        
        if (currentPortfolio.size === 0 || targetPortfolio.size === 0) {
            return { rebalancingNeeded: false, trades: [], turnover: 0 };
        }
        
        const trades = [];
        let totalTurnover = 0;
        
        // Compare current vs target weights
        const allAssets = new Set([...currentPortfolio.keys(), ...targetPortfolio.keys()]);
        
        for (const asset of allAssets) {
            const currentWeight = currentPortfolio.get(asset) || 0;
            const targetWeight = targetPortfolio.get(asset) || 0;
            const difference = targetWeight - currentWeight;
            
            if (Math.abs(difference) > this.config.rebalancing.minTradeSize) {
                trades.push({
                    asset: asset,
                    currentWeight: currentWeight,
                    targetWeight: targetWeight,
                    tradeSize: difference,
                    direction: difference > 0 ? 'BUY' : 'SELL'
                });
                
                totalTurnover += Math.abs(difference);
            }
        }
        
        const rebalancingNeeded = totalTurnover > this.config.rebalancing.threshold;
        
        return {
            rebalancingNeeded: rebalancingNeeded,
            trades: trades,
            turnover: totalTurnover,
            estimatedCost: totalTurnover * this.config.rebalancing.costPerTrade
        };
    }

    /**
     * Execute portfolio rebalancing
     */
    async executeRebalancing() {
        try {
            const rebalanceAnalysis = await this.analyzeRebalancingNeeds();
            
            if (!rebalanceAnalysis.rebalancingNeeded) {
                console.log(`[${this.agentId}] No rebalancing needed`);
                return null;
            }
            
            console.log(`[${this.agentId}] Executing rebalancing with ${rebalanceAnalysis.trades.length} trades`);
            
            // Execute trades (in real implementation would place actual orders)
            for (const trade of rebalanceAnalysis.trades) {
                console.log(`[${this.agentId}] ${trade.direction} ${trade.asset}: ${(trade.tradeSize * 100).toFixed(2)}%`);
                
                // Update current portfolio
                this.portfolioData.currentPortfolio.set(trade.asset, trade.targetWeight);
            }
            
            // Update metrics
            this.metrics.totalRebalances++;
            
            // Broadcast rebalancing completion
            this.broadcastMessage({
                type: 'PORTFOLIO_REBALANCED',
                agentId: this.agentId,
                trades: rebalanceAnalysis.trades,
                turnover: rebalanceAnalysis.turnover,
                cost: rebalanceAnalysis.estimatedCost,
                timestamp: Date.now()
            });
            
            return rebalanceAnalysis;
            
        } catch (error) {
            console.error(`[${this.agentId}] Rebalancing failed:`, error);
            return null;
        }
    }

    /**
     * Setup inter-agent communication
     */
    setupCommunication() {
        this.communicationChannel.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        
        console.log(`[${this.agentId}] Communication channel established`);
    }

    /**
     * Handle incoming messages from other agents
     */
    async handleMessage(message) {
        try {
            switch (message.type) {
                case 'REQUEST_PORTFOLIO_DATA':
                    await this.handlePortfolioRequest(message);
                    break;
                    
                case 'MARKET_UPDATE':
                    await this.handleMarketUpdate(message);
                    break;
                    
                case 'RISK_ALERT':
                    await this.handleRiskAlert(message);
                    break;
                    
                case 'OPTIMIZATION_REQUEST':
                    await this.handleOptimizationRequest(message);
                    break;
                    
                default:
                    console.log(`[${this.agentId}] Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error(`[${this.agentId}] Error handling message:`, error);
        }
    }

    /**
     * Handle portfolio data requests
     */
    async handlePortfolioRequest(message) {
        const portfolioData = {
            current: Object.fromEntries(this.portfolioData.currentPortfolio),
            target: Object.fromEntries(this.portfolioData.targetPortfolio),
            performance: this.portfolioData.performanceMetrics,
            lastOptimization: this.portfolioData.optimizationHistory.slice(-1)[0] || null
        };
        
        this.sendMessage(message.requesterId, {
            type: 'PORTFOLIO_DATA_RESPONSE',
            agentId: this.agentId,
            data: portfolioData,
            requestId: message.requestId,
            timestamp: Date.now()
        });
    }

    /**
     * Handle market updates
     */
    async handleMarketUpdate(message) {
        const marketData = message.marketData;
        
        // Update price and return history
        if (marketData.prices) {
            Object.entries(marketData.prices).forEach(([asset, price]) => {
                let priceHistory = this.portfolioData.priceHistory.get(asset) || [];
                priceHistory.push({
                    price: price,
                    timestamp: marketData.timestamp
                });
                
                // Keep only recent history
                if (priceHistory.length > 1000) {
                    priceHistory = priceHistory.slice(-1000);
                }
                
                this.portfolioData.priceHistory.set(asset, priceHistory);
                
                // Calculate return if we have previous price
                if (priceHistory.length > 1) {
                    const prevPrice = priceHistory[priceHistory.length - 2].price;
                    const currentReturn = (price - prevPrice) / prevPrice;
                    
                    let returnHistory = this.portfolioData.returnHistory.get(asset) || [];
                    returnHistory.push(currentReturn);
                    
                    if (returnHistory.length > 1000) {
                        returnHistory = returnHistory.slice(-1000);
                    }
                    
                    this.portfolioData.returnHistory.set(asset, returnHistory);
                }
            });
        }
        
        // Trigger portfolio performance update
        await this.updatePortfolioPerformance();
    }

    /**
     * Handle risk alerts
     */
    async handleRiskAlert(message) {
        const alert = message.alert;
        
        console.log(`[${this.agentId}] Risk alert received: ${alert.type}`);
        
        // Respond to different types of risk alerts
        switch (alert.type) {
            case 'HIGH_VOLATILITY':
                await this.handleHighVolatilityAlert(alert);
                break;
                
            case 'CONCENTRATION_RISK':
                await this.handleConcentrationRisk(alert);
                break;
                
            case 'DRAWDOWN_ALERT':
                await this.handleDrawdownAlert(alert);
                break;
        }
    }

    /**
     * Handle high volatility alert
     */
    async handleHighVolatilityAlert(alert) {
        // Reduce risk by reoptimizing with lower target volatility
        const constraintsWithLowerVol = {
            ...this.config.constraints,
            targetVolatility: this.config.constraints.targetVolatility * 0.8
        };
        
        await this.optimizePortfolio(null, constraintsWithLowerVol);
    }

    /**
     * Handle concentration risk
     */
    async handleConcentrationRisk(alert) {
        // Increase diversification by lowering max weight per asset
        const constraintsWithLowerConcentration = {
            ...this.config.constraints,
            maxWeightPerAsset: Math.min(this.config.constraints.maxWeightPerAsset * 0.8, 0.1)
        };
        
        await this.optimizePortfolio(null, constraintsWithLowerConcentration);
    }

    /**
     * Handle drawdown alert  
     */
    async handleDrawdownAlert(alert) {
        // Implement defensive positioning
        console.log(`[${this.agentId}] Implementing defensive positioning due to drawdown`);
        
        // Could trigger stop-loss or defensive asset allocation
    }

    /**
     * Handle optimization requests from other agents
     */
    async handleOptimizationRequest(message) {
        const request = message.request;
        
        const result = await this.optimizePortfolio(
            request.universe,
            request.constraints
        );
        
        this.sendMessage(message.requesterId, {
            type: 'OPTIMIZATION_RESPONSE',
            agentId: this.agentId,
            result: result,
            requestId: message.requestId,
            timestamp: Date.now()
        });
    }

    /**
     * Send message to specific agent or broadcast
     */
    sendMessage(targetId, message) {
        if (targetId === 'broadcast' || !targetId) {
            this.broadcastMessage(message);
        } else {
            this.broadcastMessage({ ...message, targetId: targetId });
        }
    }

    /**
     * Broadcast message to all agents
     */
    broadcastMessage(message) {
        try {
            this.communicationChannel.postMessage({
                ...message,
                senderId: this.agentId,
                timestamp: message.timestamp || Date.now()
            });
            this.lastBroadcast = Date.now();
        } catch (error) {
            console.error(`[${this.agentId}] Broadcast failed:`, error);
        }
    }

    /**
     * Load market data
     */
    async loadMarketData() {
        try {
            console.log(`[${this.agentId}] Loading market data...`);
            
            // Initialize universe of assets
            const sampleAssets = [
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V',
                'PG', 'UNH', 'HD', 'MA', 'DIS', 'BAC', 'NFLX', 'CRM', 'ADBE', 'CMCSA'
            ];
            
            // Generate sample historical data
            for (const asset of sampleAssets) {
                this.portfolioData.universeAssets.set(asset, {
                    symbol: asset,
                    sector: this.assignSector(asset),
                    marketCap: Math.random() * 1000000000000, // Random market cap
                });
                
                // Generate price history
                const priceHistory = [];
                const returnHistory = [];
                let currentPrice = 100 + Math.random() * 400;
                
                for (let i = 0; i < 252; i++) { // One year of daily data
                    const dailyReturn = (Math.random() - 0.5) * 0.04; // ±2% daily moves
                    currentPrice *= (1 + dailyReturn);
                    
                    priceHistory.push({
                        price: currentPrice,
                        timestamp: Date.now() - (252 - i) * 24 * 60 * 60 * 1000
                    });
                    
                    returnHistory.push(dailyReturn);
                }
                
                this.portfolioData.priceHistory.set(asset, priceHistory);
                this.portfolioData.returnHistory.set(asset, returnHistory);
            }
            
            console.log(`[${this.agentId}] Market data loaded: ${sampleAssets.length} assets`);
            
        } catch (error) {
            console.error(`[${this.agentId}] Failed to load market data:`, error);
        }
    }

    /**
     * Assign sector to asset (simplified)
     */
    assignSector(asset) {
        const sectors = {
            'AAPL': 'Technology',
            'MSFT': 'Technology', 
            'GOOGL': 'Technology',
            'AMZN': 'Consumer Discretionary',
            'TSLA': 'Consumer Discretionary',
            'META': 'Technology',
            'NVDA': 'Technology',
            'JPM': 'Financials',
            'JNJ': 'Healthcare',
            'V': 'Financials',
            'PG': 'Consumer Staples',
            'UNH': 'Healthcare',
            'HD': 'Consumer Discretionary',
            'MA': 'Financials',
            'DIS': 'Communication Services'
        };
        
        return sectors[asset] || 'Other';
    }

    /**
     * Update portfolio performance metrics
     */
    async updatePortfolioPerformance() {
        const currentPortfolio = this.portfolioData.currentPortfolio;
        if (currentPortfolio.size === 0) return;
        
        let portfolioReturn = 0;
        let portfolioValue = 0;
        
        // Calculate current portfolio value and return
        for (const [asset, weight] of currentPortfolio) {
            const priceHistory = this.portfolioData.priceHistory.get(asset);
            if (priceHistory && priceHistory.length > 1) {
                const currentPrice = priceHistory[priceHistory.length - 1].price;
                const previousPrice = priceHistory[priceHistory.length - 2].price;
                const assetReturn = (currentPrice - previousPrice) / previousPrice;
                
                portfolioReturn += weight * assetReturn;
                portfolioValue += weight * currentPrice;
            }
        }
        
        // Update performance metrics
        this.portfolioData.performanceMetrics.totalReturn = portfolioReturn;
        
        // Store performance history
        this.metrics.portfolioPerformance.push({
            return: portfolioReturn,
            value: portfolioValue,
            timestamp: Date.now()
        });
        
        // Keep only recent performance history
        if (this.metrics.portfolioPerformance.length > 1000) {
            this.metrics.portfolioPerformance = this.metrics.portfolioPerformance.slice(-1000);
        }
    }

    /**
     * Start optimization engine
     */
    startOptimizationEngine() {
        // Periodic optimization
        setInterval(async () => {
            try {
                await this.optimizePortfolio();
            } catch (error) {
                console.error(`[${this.agentId}] Periodic optimization failed:`, error);
            }
        }, 3600000); // Every hour
        
        // Periodic rebalancing check
        setInterval(async () => {
            try {
                await this.analyzeRebalancingNeeds();
            } catch (error) {
                console.error(`[${this.agentId}] Rebalancing analysis failed:`, error);
            }
        }, 1800000); // Every 30 minutes
        
        // Performance monitoring
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 60000); // Every minute
        
        console.log(`[${this.agentId}] Optimization engine started`);
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        // Calculate success rate
        const recentOptimizations = this.portfolioData.optimizationHistory.slice(-10);
        if (recentOptimizations.length > 0) {
            const successfulOptimizations = recentOptimizations.filter(
                opt => opt.expectedMetrics.sharpeRatio > 0.5
            ).length;
            
            this.metrics.optimizationSuccess = successfulOptimizations / recentOptimizations.length;
        }
        
        // Broadcast performance update periodically
        if (Date.now() - this.lastBroadcast > 300000) { // Every 5 minutes
            this.broadcastMessage({
                type: 'AGENT_PERFORMANCE',
                agentId: this.agentId,
                metrics: {
                    optimizationsPerformed: this.metrics.optimizationsPerformed,
                    totalRebalances: this.metrics.totalRebalances,
                    avgOptimizationTime: this.metrics.avgOptimizationTime,
                    optimizationSuccess: this.metrics.optimizationSuccess,
                    portfolioPerformance: this.portfolioData.performanceMetrics
                },
                timestamp: Date.now()
            });
        }
    }

    /**
     * Get current agent status
     */
    getStatus() {
        return {
            agentId: this.agentId,
            name: this.name,
            version: this.version,
            status: 'active',
            metrics: this.metrics,
            portfolioStatus: {
                currentAssets: this.portfolioData.currentPortfolio.size,
                universeSize: this.portfolioData.universeAssets.size,
                lastOptimization: this.portfolioData.optimizationHistory.slice(-1)[0]?.timestamp || null,
                performance: this.portfolioData.performanceMetrics
            },
            networks: {
                optimization: this.optimizationNetwork ? 'initialized' : 'not_initialized',
                allocation: this.allocationNetwork ? 'initialized' : 'not_initialized',
                risk: this.riskNetwork ? 'initialized' : 'not_initialized'
            }
        };
    }

    /**
     * Shutdown agent gracefully
     */
    async shutdown() {
        console.log(`[${this.agentId}] Shutting down...`);
        
        // Broadcast shutdown
        this.broadcastMessage({
            type: 'AGENT_SHUTDOWN',
            agentId: this.agentId,
            timestamp: Date.now()
        });
        
        // Close communication channel
        this.communicationChannel.close();
        
        console.log(`[${this.agentId}] Shutdown complete`);
    }
}

/**
 * Portfolio Optimization Neural Network
 */
class PortfolioOptimizationNeuralNetwork {
    constructor(layers) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
        this.learningRate = 0.0005;
        this.optimizer = new AdamOptimizer(this.learningRate);
    }

    async initialize() {
        // Initialize weights using Xavier initialization
        for (let i = 0; i < this.layers.length - 1; i++) {
            this.weights.push(this.initializeMatrix(this.layers[i], this.layers[i + 1]));
            this.biases.push(this.initializeVector(this.layers[i + 1]));
        }
        
        console.log('Portfolio Optimization Neural Network initialized');
    }

    initializeMatrix(rows, cols) {
        const matrix = [];
        const limit = Math.sqrt(6 / (rows + cols)); // Xavier initialization
        
        for (let i = 0; i < rows; i++) {
            matrix.push([]);
            for (let j = 0; j < cols; j++) {
                matrix[i].push((Math.random() - 0.5) * 2 * limit);
            }
        }
        return matrix;
    }

    initializeVector(size) {
        return Array(size).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }

    async optimize(input) {
        // Forward pass
        let activations = input;
        
        for (let i = 0; i < this.weights.length; i++) {
            activations = this.matrixMultiply(activations, this.weights[i]);
            activations = this.addBias(activations, this.biases[i]);
            
            if (i === this.weights.length - 1) {
                activations = this.softmax(activations); // Output layer - portfolio weights
            } else {
                activations = this.relu(activations); // Hidden layers
            }
        }
        
        return activations;
    }

    matrixMultiply(input, weights) {
        const result = [];
        for (let j = 0; j < weights[0].length; j++) {
            let sum = 0;
            for (let i = 0; i < input.length; i++) {
                sum += input[i] * weights[i][j];
            }
            result.push(sum);
        }
        return result;
    }

    addBias(input, bias) {
        return input.map((val, i) => val + (bias[i] || 0));
    }

    relu(input) {
        return input.map(val => Math.max(0, val));
    }

    softmax(input) {
        const maxVal = Math.max(...input);
        const exp = input.map(val => Math.exp(val - maxVal));
        const sum = exp.reduce((a, b) => a + b);
        return exp.map(val => val / sum);
    }
}

/**
 * Asset Allocation Neural Network
 */
class AssetAllocationNeuralNetwork {
    constructor(layers) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
    }

    async initialize() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            this.weights.push(this.initializeMatrix(this.layers[i], this.layers[i + 1]));
            this.biases.push(this.initializeVector(this.layers[i + 1]));
        }
        
        console.log('Asset Allocation Neural Network initialized');
    }

    initializeMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix.push([]);
            for (let j = 0; j < cols; j++) {
                matrix[i].push((Math.random() - 0.5) * 2 / Math.sqrt(rows));
            }
        }
        return matrix;
    }

    initializeVector(size) {
        return Array(size).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }
}

/**
 * Risk Assessment Neural Network  
 */
class RiskAssessmentNeuralNetwork {
    constructor(layers) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
    }

    async initialize() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            this.weights.push(this.initializeMatrix(this.layers[i], this.layers[i + 1]));
            this.biases.push(this.initializeVector(this.layers[i + 1]));
        }
        
        console.log('Risk Assessment Neural Network initialized');
    }

    initializeMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix.push([]);
            for (let j = 0; j < cols; j++) {
                matrix[i].push((Math.random() - 0.5) * 2 / Math.sqrt(rows));
            }
        }
        return matrix;
    }

    initializeVector(size) {
        return Array(size).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }
}

/**
 * Mean-Variance Optimizer
 */
class MeanVarianceOptimizer {
    async optimize(data, constraints) {
        const assets = Array.from(data.expectedReturns.keys());
        const n = assets.length;
        
        if (n === 0) return { weights: {}, expectedReturn: 0, risk: 0 };
        
        // Simple equal-weight baseline with adjustments
        const baseWeight = 1 / n;
        const weights = {};
        
        assets.forEach(asset => {
            const expectedReturn = data.expectedReturns.get(asset) || 0;
            const volatility = data.volatilities.get(asset) || 0.15;
            
            // Adjust weight based on risk-return profile
            const sharpeRatio = volatility > 0 ? expectedReturn / volatility : 0;
            const adjustment = Math.max(0.5, Math.min(2, 1 + sharpeRatio));
            
            weights[asset] = baseWeight * adjustment;
        });
        
        // Normalize weights
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        if (totalWeight > 0) {
            Object.keys(weights).forEach(asset => {
                weights[asset] /= totalWeight;
            });
        }
        
        return {
            weights: weights,
            expectedReturn: this.calculateExpectedReturn(weights, data),
            risk: this.calculateRisk(weights, data),
            method: 'mean_variance'
        };
    }

    calculateExpectedReturn(weights, data) {
        let expectedReturn = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const assetReturn = data.expectedReturns.get(asset) || 0;
            expectedReturn += weight * assetReturn;
        });
        return expectedReturn;
    }

    calculateRisk(weights, data) {
        // Simplified risk calculation
        let risk = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const volatility = data.volatilities.get(asset) || 0.15;
            risk += weight * weight * volatility * volatility;
        });
        return Math.sqrt(risk);
    }
}

/**
 * Black-Litterman Model
 */
class BlackLittermanModel {
    async optimize(data, constraints) {
        // Simplified Black-Litterman implementation
        const assets = Array.from(data.expectedReturns.keys());
        const weights = {};
        
        // Start with market cap weighted portfolio (mock)
        let totalMarketCap = 0;
        const marketCaps = {};
        
        assets.forEach(asset => {
            marketCaps[asset] = Math.random() * 1000000000; // Mock market cap
            totalMarketCap += marketCaps[asset];
        });
        
        assets.forEach(asset => {
            weights[asset] = marketCaps[asset] / totalMarketCap;
        });
        
        return {
            weights: weights,
            expectedReturn: this.calculateExpectedReturn(weights, data),
            risk: this.calculateRisk(weights, data),
            method: 'black_litterman'
        };
    }

    calculateExpectedReturn(weights, data) {
        let expectedReturn = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const assetReturn = data.expectedReturns.get(asset) || 0;
            expectedReturn += weight * assetReturn;
        });
        return expectedReturn;
    }

    calculateRisk(weights, data) {
        let risk = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const volatility = data.volatilities.get(asset) || 0.15;
            risk += weight * weight * volatility * volatility;
        });
        return Math.sqrt(risk);
    }
}

/**
 * Risk Parity Optimizer
 */
class RiskParityOptimizer {
    async optimize(data, constraints) {
        const assets = Array.from(data.volatilities.keys());
        const weights = {};
        
        // Risk parity - inverse volatility weighting
        let totalInverseVol = 0;
        const inverseVols = {};
        
        assets.forEach(asset => {
            const volatility = data.volatilities.get(asset) || 0.15;
            const inverseVol = 1 / volatility;
            inverseVols[asset] = inverseVol;
            totalInverseVol += inverseVol;
        });
        
        assets.forEach(asset => {
            weights[asset] = inverseVols[asset] / totalInverseVol;
        });
        
        return {
            weights: weights,
            expectedReturn: this.calculateExpectedReturn(weights, data),
            risk: this.calculateRisk(weights, data),
            method: 'risk_parity'
        };
    }

    calculateExpectedReturn(weights, data) {
        let expectedReturn = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const assetReturn = data.expectedReturns.get(asset) || 0;
            expectedReturn += weight * assetReturn;
        });
        return expectedReturn;
    }

    calculateRisk(weights, data) {
        let risk = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const volatility = data.volatilities.get(asset) || 0.15;
            risk += weight * weight * volatility * volatility;
        });
        return Math.sqrt(risk);
    }
}

/**
 * Factor-Based Optimizer
 */
class FactorBasedOptimizer {
    async optimize(data, constraints) {
        const assets = Array.from(data.factorExposures.keys());
        const weights = {};
        
        // Factor-based optimization (simplified)
        let totalScore = 0;
        const scores = {};
        
        assets.forEach(asset => {
            const factors = data.factorExposures.get(asset) || {};
            
            // Simple factor score calculation
            const score = (factors.value || 0) * 0.3 + 
                         (factors.profitability || 0) * 0.3 + 
                         (factors.momentum || 0) * 0.2 + 
                         (factors.size || 0) * 0.2;
            
            scores[asset] = Math.max(0, score + 1); // Ensure positive
            totalScore += scores[asset];
        });
        
        assets.forEach(asset => {
            weights[asset] = scores[asset] / totalScore;
        });
        
        return {
            weights: weights,
            expectedReturn: this.calculateExpectedReturn(weights, data),
            risk: this.calculateRisk(weights, data),
            method: 'factor_based'
        };
    }

    calculateExpectedReturn(weights, data) {
        let expectedReturn = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const assetReturn = data.expectedReturns.get(asset) || 0;
            expectedReturn += weight * assetReturn;
        });
        return expectedReturn;
    }

    calculateRisk(weights, data) {
        let risk = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const volatility = data.volatilities.get(asset) || 0.15;
            risk += weight * weight * volatility * volatility;
        });
        return Math.sqrt(risk);
    }
}

/**
 * Genetic Algorithm Optimizer
 */
class GeneticAlgorithmOptimizer {
    constructor() {
        this.populationSize = 50;
        this.generations = 20;
        this.mutationRate = 0.1;
        this.crossoverRate = 0.8;
    }

    async optimize(data, constraints) {
        const assets = Array.from(data.expectedReturns.keys());
        const n = assets.length;
        
        if (n === 0) return { weights: {}, expectedReturn: 0, risk: 0 };
        
        // Initialize population
        let population = this.initializePopulation(n);
        
        // Evolution loop
        for (let generation = 0; generation < this.generations; generation++) {
            // Evaluate fitness
            const fitness = population.map(individual => 
                this.evaluateFitness(individual, data, assets)
            );
            
            // Selection, crossover, mutation
            population = this.evolvePopulation(population, fitness);
        }
        
        // Get best individual
        const finalFitness = population.map(individual => 
            this.evaluateFitness(individual, data, assets)
        );
        
        const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
        const bestWeights = population[bestIndex];
        
        // Convert to weights object
        const weights = {};
        assets.forEach((asset, i) => {
            weights[asset] = bestWeights[i];
        });
        
        return {
            weights: weights,
            expectedReturn: this.calculateExpectedReturn(weights, data),
            risk: this.calculateRisk(weights, data),
            method: 'genetic_algorithm'
        };
    }

    initializePopulation(assetCount) {
        const population = [];
        
        for (let i = 0; i < this.populationSize; i++) {
            const individual = [];
            let sum = 0;
            
            // Generate random weights
            for (let j = 0; j < assetCount; j++) {
                const weight = Math.random();
                individual.push(weight);
                sum += weight;
            }
            
            // Normalize to sum to 1
            for (let j = 0; j < assetCount; j++) {
                individual[j] /= sum;
            }
            
            population.push(individual);
        }
        
        return population;
    }

    evaluateFitness(individual, data, assets) {
        // Calculate Sharpe ratio as fitness
        let expectedReturn = 0;
        let risk = 0;
        
        for (let i = 0; i < individual.length; i++) {
            const asset = assets[i];
            const weight = individual[i];
            const assetReturn = data.expectedReturns.get(asset) || 0;
            const volatility = data.volatilities.get(asset) || 0.15;
            
            expectedReturn += weight * assetReturn;
            risk += weight * weight * volatility * volatility;
        }
        
        risk = Math.sqrt(risk);
        return risk > 0 ? expectedReturn / risk : 0;
    }

    evolvePopulation(population, fitness) {
        const newPopulation = [];
        
        // Elitism - keep best individuals
        const eliteCount = Math.floor(this.populationSize * 0.1);
        const sortedIndices = fitness.map((fit, idx) => ({ fitness: fit, index: idx }))
                                     .sort((a, b) => b.fitness - a.fitness)
                                     .map(item => item.index);
        
        for (let i = 0; i < eliteCount; i++) {
            newPopulation.push([...population[sortedIndices[i]]]);
        }
        
        // Generate rest through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            const parent1 = this.selectParent(population, fitness);
            const parent2 = this.selectParent(population, fitness);
            
            let offspring = this.crossover(parent1, parent2);
            offspring = this.mutate(offspring);
            
            newPopulation.push(offspring);
        }
        
        return newPopulation;
    }

    selectParent(population, fitness) {
        // Tournament selection
        const tournamentSize = 3;
        let bestIndex = Math.floor(Math.random() * population.length);
        let bestFitness = fitness[bestIndex];
        
        for (let i = 1; i < tournamentSize; i++) {
            const candidateIndex = Math.floor(Math.random() * population.length);
            if (fitness[candidateIndex] > bestFitness) {
                bestIndex = candidateIndex;
                bestFitness = fitness[candidateIndex];
            }
        }
        
        return population[bestIndex];
    }

    crossover(parent1, parent2) {
        if (Math.random() > this.crossoverRate) {
            return [...parent1];
        }
        
        const offspring = [];
        const crossoverPoint = Math.floor(Math.random() * parent1.length);
        
        for (let i = 0; i < parent1.length; i++) {
            if (i < crossoverPoint) {
                offspring.push(parent1[i]);
            } else {
                offspring.push(parent2[i]);
            }
        }
        
        // Normalize
        const sum = offspring.reduce((a, b) => a + b, 0);
        return offspring.map(w => w / sum);
    }

    mutate(individual) {
        const mutated = [...individual];
        
        for (let i = 0; i < mutated.length; i++) {
            if (Math.random() < this.mutationRate) {
                mutated[i] += (Math.random() - 0.5) * 0.1; // ±5% mutation
                mutated[i] = Math.max(0, mutated[i]); // Ensure non-negative
            }
        }
        
        // Normalize
        const sum = mutated.reduce((a, b) => a + b, 0);
        return sum > 0 ? mutated.map(w => w / sum) : mutated;
    }

    calculateExpectedReturn(weights, data) {
        let expectedReturn = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const assetReturn = data.expectedReturns.get(asset) || 0;
            expectedReturn += weight * assetReturn;
        });
        return expectedReturn;
    }

    calculateRisk(weights, data) {
        let risk = 0;
        Object.entries(weights).forEach(([asset, weight]) => {
            const volatility = data.volatilities.get(asset) || 0.15;
            risk += weight * weight * volatility * volatility;
        });
        return Math.sqrt(risk);
    }
}

/**
 * Adam Optimizer for Neural Networks
 */
class AdamOptimizer {
    constructor(learningRate = 0.001, beta1 = 0.9, beta2 = 0.999, epsilon = 1e-8) {
        this.learningRate = learningRate;
        this.beta1 = beta1;
        this.beta2 = beta2;
        this.epsilon = epsilon;
        this.t = 0; // Time step
        this.m = []; // First moment estimates
        this.v = []; // Second moment estimates
    }

    update(weights, gradients) {
        this.t++;
        
        if (this.m.length === 0) {
            // Initialize moment estimates
            this.m = weights.map(layer => layer.map(row => row.map(() => 0)));
            this.v = weights.map(layer => layer.map(row => row.map(() => 0)));
        }
        
        const updatedWeights = [];
        
        for (let l = 0; l < weights.length; l++) {
            const layerWeights = [];
            
            for (let i = 0; i < weights[l].length; i++) {
                const rowWeights = [];
                
                for (let j = 0; j < weights[l][i].length; j++) {
                    // Update biased first moment estimate
                    this.m[l][i][j] = this.beta1 * this.m[l][i][j] + (1 - this.beta1) * gradients[l][i][j];
                    
                    // Update biased second raw moment estimate
                    this.v[l][i][j] = this.beta2 * this.v[l][i][j] + (1 - this.beta2) * gradients[l][i][j] * gradients[l][i][j];
                    
                    // Compute bias-corrected first moment estimate
                    const mHat = this.m[l][i][j] / (1 - Math.pow(this.beta1, this.t));
                    
                    // Compute bias-corrected second raw moment estimate
                    const vHat = this.v[l][i][j] / (1 - Math.pow(this.beta2, this.t));
                    
                    // Update weights
                    const update = this.learningRate * mHat / (Math.sqrt(vHat) + this.epsilon);
                    rowWeights.push(weights[l][i][j] - update);
                }
                
                layerWeights.push(rowWeights);
            }
            
            updatedWeights.push(layerWeights);
        }
        
        return updatedWeights;
    }
}

// Initialize and export the agent
const portfolioAgent = new PortfolioOptimizationAgent();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioOptimizationAgent;
} else if (typeof window !== 'undefined') {
    window.PortfolioOptimizationAgent = PortfolioOptimizationAgent;
    window.TitanAgents = window.TitanAgents || {};
    window.TitanAgents.PortfolioOptimizationAgent = portfolioAgent;
}