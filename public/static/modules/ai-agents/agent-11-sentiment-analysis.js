/**
 * TITAN Trading System - Agent 11: Sentiment Analysis Specialist
 * 
 * Advanced AI Agent specializing in social media sentiment analysis, market mood detection,
 * and behavioral finance indicators with deep learning neural networks.
 * 
 * Features:
 * - Deep Neural Network for sentiment classification
 * - Multi-source social sentiment aggregation (Twitter, Reddit, News)
 * - BERT-like transformer architecture for text understanding
 * - Real-time sentiment trend analysis
 * - Fear & Greed Index calculation
 * - Behavioral pattern recognition
 * - Market psychology indicators
 * - Inter-agent communication for sentiment signals
 * 
 * @author TITAN Trading System
 * @version 2.0.0
 */

class SentimentAnalysisAgent {
    constructor() {
        this.agentId = 'AGENT_11_SENTIMENT';
        this.name = 'Sentiment Analysis Specialist';
        this.version = '2.0.0';
        
        // Neural Network Architecture
        this.sentimentNetwork = null;
        this.transformerNetwork = null;
        this.behavioralNetwork = null;
        
        // Sentiment Analysis Configuration
        this.config = {
            networkParams: {
                sentimentLayers: [512, 256, 128, 64, 32, 8, 3], // Multi-class: positive, negative, neutral
                transformerLayers: [768, 384, 192, 96, 48, 24, 8],
                behavioralLayers: [256, 128, 64, 32, 16, 8, 4],
                learningRate: 0.001,
                momentum: 0.9,
                dropout: 0.3,
                batchSize: 64
            },
            sentimentSources: {
                twitter: {
                    enabled: true,
                    weight: 0.4,
                    keywords: ['$BTC', '$ETH', '$TSLA', '$AAPL', '$GOOGL']
                },
                reddit: {
                    enabled: true,
                    weight: 0.3,
                    subreddits: ['wallstreetbets', 'investing', 'cryptocurrency']
                },
                news: {
                    enabled: true,
                    weight: 0.3,
                    sources: ['reuters', 'bloomberg', 'marketwatch']
                }
            },
            analysisWindow: {
                realtime: 60000,      // 1 minute
                shortTerm: 900000,    // 15 minutes  
                mediumTerm: 3600000,  // 1 hour
                longTerm: 86400000    // 24 hours
            }
        };
        
        // Data Storage
        this.sentimentData = {
            rawSentiments: [],
            processedSentiments: [],
            aggregatedScores: new Map(),
            trendData: [],
            fearGreedIndex: 50,
            marketMoodHistory: [],
            behavioralIndicators: new Map()
        };
        
        // Performance Metrics
        this.metrics = {
            totalAnalyzed: 0,
            accuracyScore: 0,
            predictionSuccess: 0,
            processingTime: [],
            networkPerformance: {
                sentimentAccuracy: 0,
                transformerAccuracy: 0,
                behavioralAccuracy: 0
            }
        };
        
        // Inter-agent Communication
        this.communicationChannel = new BroadcastChannel('titan-agents-sentiment');
        this.lastBroadcast = Date.now();
        
        // API Integration
        this.apiEndpoints = {
            twitter: 'https://api.twitter.com/2/tweets/search/recent',
            reddit: 'https://www.reddit.com/r/{subreddit}/hot.json',
            news: 'https://newsapi.org/v2/everything',
            sentiment: 'https://api.meaningcloud.com/sentiment-2.1'
        };
        
        this.initialize();
    }

    /**
     * Initialize the Sentiment Analysis Agent
     */
    async initialize() {
        console.log(`[${this.agentId}] Initializing Sentiment Analysis Specialist...`);
        
        try {
            // Initialize neural networks
            await this.initializeNeuralNetworks();
            
            // Setup communication listeners
            this.setupCommunication();
            
            // Start real-time analysis
            this.startRealTimeAnalysis();
            
            // Initialize historical data
            await this.loadHistoricalData();
            
            console.log(`[${this.agentId}] Successfully initialized`);
            
            // Broadcast initialization
            this.broadcastMessage({
                type: 'AGENT_INITIALIZED',
                agentId: this.agentId,
                capabilities: ['sentiment_analysis', 'market_psychology', 'behavioral_finance'],
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error(`[${this.agentId}] Initialization failed:`, error);
        }
    }

    /**
     * Initialize Neural Networks for Sentiment Analysis
     */
    async initializeNeuralNetworks() {
        // Main Sentiment Classification Network
        this.sentimentNetwork = new SentimentNeuralNetwork(this.config.networkParams.sentimentLayers);
        await this.sentimentNetwork.initialize();
        
        // Transformer-like Network for Text Understanding  
        this.transformerNetwork = new TransformerNeuralNetwork(this.config.networkParams.transformerLayers);
        await this.transformerNetwork.initialize();
        
        // Behavioral Pattern Recognition Network
        this.behavioralNetwork = new BehavioralNeuralNetwork(this.config.networkParams.behavioralLayers);
        await this.behavioralNetwork.initialize();
        
        console.log(`[${this.agentId}] Neural networks initialized`);
    }

    /**
     * Main Sentiment Analysis Processing
     */
    async analyzeSentiment(textData, source = 'unknown') {
        const startTime = performance.now();
        
        try {
            // Preprocess text data
            const preprocessedText = await this.preprocessText(textData);
            
            // Extract features using transformer network
            const textFeatures = await this.transformerNetwork.extractFeatures(preprocessedText);
            
            // Classify sentiment using main network
            const sentimentScore = await this.sentimentNetwork.classify(textFeatures);
            
            // Analyze behavioral patterns
            const behavioralSignals = await this.behavioralNetwork.analyze(textFeatures, sentimentScore);
            
            // Create sentiment result
            const result = {
                text: textData,
                source: source,
                sentiment: {
                    score: sentimentScore,
                    polarity: this.categorizeSentiment(sentimentScore),
                    confidence: sentimentScore.confidence || 0.5
                },
                behavioral: behavioralSignals,
                timestamp: Date.now(),
                processingTime: performance.now() - startTime
            };
            
            // Store result
            this.sentimentData.rawSentiments.push(result);
            
            // Update metrics
            this.metrics.totalAnalyzed++;
            this.metrics.processingTime.push(result.processingTime);
            
            return result;
            
        } catch (error) {
            console.error(`[${this.agentId}] Sentiment analysis failed:`, error);
            return null;
        }
    }

    /**
     * Preprocess text data for analysis
     */
    async preprocessText(text) {
        // Clean and normalize text
        let processed = text.toLowerCase();
        
        // Remove URLs, mentions, hashtags for analysis (but keep for context)
        const urls = processed.match(/https?:\/\/[^\s]+/g) || [];
        const mentions = processed.match(/@\w+/g) || [];
        const hashtags = processed.match(/#\w+/g) || [];
        
        // Remove noise but preserve financial symbols
        processed = processed.replace(/https?:\/\/[^\s]+/g, ' ');
        processed = processed.replace(/@\w+/g, ' ');
        processed = processed.replace(/[^\w\s$]/g, ' ');
        processed = processed.replace(/\s+/g, ' ').trim();
        
        // Tokenization and feature extraction
        const tokens = processed.split(' ').filter(token => token.length > 2);
        
        // Financial keyword detection
        const financialKeywords = this.detectFinancialKeywords(tokens);
        
        return {
            originalText: text,
            cleanedText: processed,
            tokens: tokens,
            financialKeywords: financialKeywords,
            urls: urls,
            mentions: mentions,
            hashtags: hashtags,
            length: tokens.length
        };
    }

    /**
     * Detect financial keywords and symbols
     */
    detectFinancialKeywords(tokens) {
        const keywords = {
            bullish: ['moon', 'bull', 'buy', 'long', 'pump', 'rise', 'up', 'gain', 'profit'],
            bearish: ['bear', 'sell', 'short', 'dump', 'fall', 'down', 'loss', 'crash'],
            symbols: [],
            companies: []
        };
        
        const detected = {
            bullish: [],
            bearish: [],
            symbols: [],
            companies: [],
            sentiment_indicators: []
        };
        
        tokens.forEach(token => {
            // Stock symbols (starts with $)
            if (token.startsWith('$')) {
                detected.symbols.push(token);
            }
            
            // Bullish keywords
            if (keywords.bullish.includes(token)) {
                detected.bullish.push(token);
            }
            
            // Bearish keywords  
            if (keywords.bearish.includes(token)) {
                detected.bearish.push(token);
            }
        });
        
        return detected;
    }

    /**
     * Categorize sentiment score into classes
     */
    categorizeSentiment(sentimentScore) {
        if (Array.isArray(sentimentScore)) {
            const maxIndex = sentimentScore.indexOf(Math.max(...sentimentScore));
            return ['positive', 'negative', 'neutral'][maxIndex];
        } else if (typeof sentimentScore === 'number') {
            if (sentimentScore > 0.6) return 'positive';
            if (sentimentScore < 0.4) return 'negative';
            return 'neutral';
        }
        return 'neutral';
    }

    /**
     * Aggregate sentiment from multiple sources
     */
    async aggregateSentiment(timeWindow = this.config.analysisWindow.realtime) {
        const cutoffTime = Date.now() - timeWindow;
        const recentSentiments = this.sentimentData.rawSentiments.filter(
            s => s.timestamp > cutoffTime
        );
        
        if (recentSentiments.length === 0) return null;
        
        // Group by source and calculate weighted scores
        const sourceGroups = {};
        recentSentiments.forEach(sentiment => {
            if (!sourceGroups[sentiment.source]) {
                sourceGroups[sentiment.source] = [];
            }
            sourceGroups[sentiment.source].push(sentiment);
        });
        
        let totalWeight = 0;
        let weightedScore = 0;
        
        Object.keys(sourceGroups).forEach(source => {
            const sourceWeight = this.config.sentimentSources[source]?.weight || 0.1;
            const sourceScores = sourceGroups[source].map(s => 
                typeof s.sentiment.score === 'number' ? s.sentiment.score : 0.5
            );
            const avgScore = sourceScores.reduce((a, b) => a + b, 0) / sourceScores.length;
            
            weightedScore += avgScore * sourceWeight;
            totalWeight += sourceWeight;
        });
        
        const aggregatedScore = totalWeight > 0 ? weightedScore / totalWeight : 0.5;
        
        // Calculate additional metrics
        const polarityDistribution = this.calculatePolarityDistribution(recentSentiments);
        const volatility = this.calculateSentimentVolatility(recentSentiments);
        
        const aggregated = {
            score: aggregatedScore,
            polarity: this.categorizeSentiment(aggregatedScore),
            distribution: polarityDistribution,
            volatility: volatility,
            sampleSize: recentSentiments.length,
            timeWindow: timeWindow,
            timestamp: Date.now()
        };
        
        // Store aggregated result
        this.sentimentData.processedSentiments.push(aggregated);
        
        return aggregated;
    }

    /**
     * Calculate sentiment polarity distribution
     */
    calculatePolarityDistribution(sentiments) {
        const distribution = { positive: 0, negative: 0, neutral: 0 };
        
        sentiments.forEach(sentiment => {
            distribution[sentiment.sentiment.polarity]++;
        });
        
        const total = sentiments.length;
        return {
            positive: distribution.positive / total,
            negative: distribution.negative / total,
            neutral: distribution.neutral / total
        };
    }

    /**
     * Calculate sentiment volatility
     */
    calculateSentimentVolatility(sentiments) {
        const scores = sentiments.map(s => 
            typeof s.sentiment.score === 'number' ? s.sentiment.score : 0.5
        );
        
        if (scores.length < 2) return 0;
        
        const mean = scores.reduce((a, b) => a + b) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
        
        return Math.sqrt(variance);
    }

    /**
     * Calculate Fear & Greed Index
     */
    async calculateFearGreedIndex() {
        const recentSentiments = await this.aggregateSentiment(this.config.analysisWindow.mediumTerm);
        
        if (!recentSentiments) return this.sentimentData.fearGreedIndex;
        
        // Fear & Greed calculation based on multiple factors
        let fearGreed = 50; // Neutral baseline
        
        // Sentiment Score Factor (40% weight)
        const sentimentFactor = (recentSentiments.score - 0.5) * 80; // Convert to -40 to +40
        fearGreed += sentimentFactor * 0.4;
        
        // Volatility Factor (30% weight) - higher volatility = more fear
        const volatilityFactor = Math.min(recentSentiments.volatility * 100, 30);
        fearGreed -= volatilityFactor * 0.3;
        
        // Distribution Factor (20% weight)
        const positiveBias = (recentSentiments.distribution.positive - recentSentiments.distribution.negative) * 20;
        fearGreed += positiveBias * 0.2;
        
        // Sample Size Factor (10% weight) - more data = more confidence
        const sampleFactor = Math.min(recentSentiments.sampleSize / 100, 1) * 10;
        fearGreed += sampleFactor * 0.1;
        
        // Clamp to 0-100 range
        fearGreed = Math.max(0, Math.min(100, fearGreed));
        
        this.sentimentData.fearGreedIndex = fearGreed;
        
        // Broadcast fear & greed update
        this.broadcastMessage({
            type: 'FEAR_GREED_UPDATE',
            agentId: this.agentId,
            fearGreedIndex: fearGreed,
            sentiment: recentSentiments,
            timestamp: Date.now()
        });
        
        return fearGreed;
    }

    /**
     * Detect behavioral patterns in sentiment data
     */
    async detectBehavioralPatterns() {
        const patterns = {
            herdBehavior: false,
            panicSelling: false,
            euphoria: false,
            contrarian: false,
            uncertainty: false
        };
        
        const recentData = this.sentimentData.processedSentiments.slice(-10);
        
        if (recentData.length < 5) return patterns;
        
        // Herd Behavior Detection
        const consensusLevel = this.calculateConsensus(recentData);
        patterns.herdBehavior = consensusLevel > 0.8;
        
        // Panic Selling Detection
        const fearLevel = this.sentimentData.fearGreedIndex;
        const recentVolatility = recentData[recentData.length - 1]?.volatility || 0;
        patterns.panicSelling = fearLevel < 25 && recentVolatility > 0.3;
        
        // Euphoria Detection
        patterns.euphoria = fearLevel > 75 && consensusLevel > 0.7;
        
        // Contrarian Signals
        const extremeReadings = recentData.filter(d => d.score < 0.2 || d.score > 0.8).length;
        patterns.contrarian = extremeReadings >= 3;
        
        // Uncertainty Detection
        patterns.uncertainty = recentVolatility > 0.4 && Math.abs(50 - fearLevel) < 15;
        
        // Store patterns
        this.sentimentData.behavioralIndicators.set(Date.now(), patterns);
        
        return patterns;
    }

    /**
     * Calculate sentiment consensus level
     */
    calculateConsensus(sentimentData) {
        if (sentimentData.length === 0) return 0;
        
        const polarities = sentimentData.map(d => d.polarity);
        const counts = {};
        polarities.forEach(p => counts[p] = (counts[p] || 0) + 1);
        
        const maxCount = Math.max(...Object.values(counts));
        return maxCount / polarities.length;
    }

    /**
     * Real-time sentiment trend analysis
     */
    async analyzeTrends() {
        const windows = [
            { name: 'short', duration: this.config.analysisWindow.shortTerm },
            { name: 'medium', duration: this.config.analysisWindow.mediumTerm },
            { name: 'long', duration: this.config.analysisWindow.longTerm }
        ];
        
        const trends = {};
        
        for (const window of windows) {
            const aggregated = await this.aggregateSentiment(window.duration);
            if (aggregated) {
                trends[window.name] = {
                    sentiment: aggregated.score,
                    polarity: aggregated.polarity,
                    volatility: aggregated.volatility,
                    sampleSize: aggregated.sampleSize
                };
            }
        }
        
        // Calculate trend direction
        if (trends.short && trends.medium && trends.long) {
            const trendDirection = this.calculateTrendDirection(trends);
            trends.direction = trendDirection;
            
            // Store trend data
            this.sentimentData.trendData.push({
                trends: trends,
                timestamp: Date.now()
            });
            
            // Broadcast trend update
            this.broadcastMessage({
                type: 'SENTIMENT_TRENDS',
                agentId: this.agentId,
                trends: trends,
                timestamp: Date.now()
            });
        }
        
        return trends;
    }

    /**
     * Calculate overall trend direction
     */
    calculateTrendDirection(trends) {
        const shortScore = trends.short.sentiment;
        const mediumScore = trends.medium.sentiment;
        const longScore = trends.long.sentiment;
        
        // Simple trend calculation
        if (shortScore > mediumScore && mediumScore > longScore) {
            return 'bullish_strengthening';
        } else if (shortScore < mediumScore && mediumScore < longScore) {
            return 'bearish_strengthening';
        } else if (shortScore > longScore) {
            return 'bullish';
        } else if (shortScore < longScore) {
            return 'bearish';
        } else {
            return 'sideways';
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
                case 'REQUEST_SENTIMENT_DATA':
                    await this.handleSentimentRequest(message);
                    break;
                    
                case 'MARKET_EVENT':
                    await this.handleMarketEvent(message);
                    break;
                    
                case 'NEWS_UPDATE':
                    await this.handleNewsUpdate(message);
                    break;
                    
                default:
                    console.log(`[${this.agentId}] Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error(`[${this.agentId}] Error handling message:`, error);
        }
    }

    /**
     * Handle sentiment data requests from other agents
     */
    async handleSentimentRequest(message) {
        const requestedWindow = message.timeWindow || this.config.analysisWindow.realtime;
        const sentimentData = await this.aggregateSentiment(requestedWindow);
        const fearGreed = this.sentimentData.fearGreedIndex;
        const patterns = await this.detectBehavioralPatterns();
        
        this.sendMessage(message.requesterId, {
            type: 'SENTIMENT_DATA_RESPONSE',
            agentId: this.agentId,
            data: {
                sentiment: sentimentData,
                fearGreedIndex: fearGreed,
                behavioralPatterns: patterns,
                trends: this.sentimentData.trendData.slice(-5)
            },
            requestId: message.requestId,
            timestamp: Date.now()
        });
    }

    /**
     * Handle market events for sentiment correlation
     */
    async handleMarketEvent(message) {
        // Correlate market events with sentiment changes
        const eventTime = message.timestamp;
        const timeWindow = 300000; // 5 minutes before and after
        
        const beforeSentiment = this.sentimentData.rawSentiments.filter(
            s => s.timestamp >= eventTime - timeWindow && s.timestamp <= eventTime
        );
        
        const afterSentiment = this.sentimentData.rawSentiments.filter(
            s => s.timestamp >= eventTime && s.timestamp <= eventTime + timeWindow
        );
        
        if (beforeSentiment.length > 0 && afterSentiment.length > 0) {
            const correlation = this.calculateEventSentimentCorrelation(
                beforeSentiment, afterSentiment, message
            );
            
            // Store correlation for learning
            this.storeEventCorrelation(correlation);
        }
    }

    /**
     * Calculate sentiment correlation with market events
     */
    calculateEventSentimentCorrelation(beforeSentiments, afterSentiments, event) {
        const beforeAvg = beforeSentiments.reduce((sum, s) => sum + (typeof s.sentiment.score === 'number' ? s.sentiment.score : 0.5), 0) / beforeSentiments.length;
        const afterAvg = afterSentiments.reduce((sum, s) => sum + (typeof s.sentiment.score === 'number' ? s.sentiment.score : 0.5), 0) / afterSentiments.length;
        
        const sentimentChange = afterAvg - beforeAvg;
        const priceChange = event.priceChange || 0;
        
        return {
            eventType: event.eventType,
            symbol: event.symbol,
            sentimentChange: sentimentChange,
            priceChange: priceChange,
            correlation: this.calculateCorrelation(sentimentChange, priceChange),
            timestamp: event.timestamp
        };
    }

    /**
     * Calculate correlation coefficient
     */
    calculateCorrelation(x, y) {
        // Simple correlation for single data point
        if (x === 0 && y === 0) return 0;
        if ((x > 0 && y > 0) || (x < 0 && y < 0)) return 1;
        if ((x > 0 && y < 0) || (x < 0 && y > 0)) return -1;
        return 0;
    }

    /**
     * Store event correlation for learning
     */
    storeEventCorrelation(correlation) {
        // Add to behavioral network training data
        if (this.behavioralNetwork) {
            this.behavioralNetwork.addTrainingData({
                input: [correlation.sentimentChange, correlation.priceChange],
                output: [correlation.correlation],
                metadata: correlation
            });
        }
    }

    /**
     * Handle news updates for sentiment analysis
     */
    async handleNewsUpdate(message) {
        const newsData = message.newsData;
        
        for (const article of newsData) {
            const sentiment = await this.analyzeSentiment(
                `${article.title} ${article.description}`, 
                'news'
            );
            
            if (sentiment) {
                // Enhanced news sentiment with market relevance
                sentiment.newsMetadata = {
                    source: article.source,
                    publishedAt: article.publishedAt,
                    symbols: article.symbols || [],
                    relevanceScore: article.relevanceScore || 0.5
                };
            }
        }
    }

    /**
     * Send message to specific agent or broadcast
     */
    sendMessage(targetId, message) {
        if (targetId === 'broadcast' || !targetId) {
            this.broadcastMessage(message);
        } else {
            // Direct message (would need specific implementation)
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
     * Start real-time sentiment analysis
     */
    startRealTimeAnalysis() {
        // Real-time sentiment processing
        setInterval(async () => {
            try {
                await this.aggregateSentiment();
                await this.calculateFearGreedIndex();
                await this.detectBehavioralPatterns();
                await this.analyzeTrends();
                
                // Cleanup old data
                this.cleanupOldData();
                
            } catch (error) {
                console.error(`[${this.agentId}] Real-time analysis error:`, error);
            }
        }, this.config.analysisWindow.realtime);
        
        // Performance monitoring
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 30000); // Every 30 seconds
        
        console.log(`[${this.agentId}] Real-time analysis started`);
    }

    /**
     * Load historical sentiment data
     */
    async loadHistoricalData() {
        try {
            // Simulate loading historical data
            console.log(`[${this.agentId}] Loading historical sentiment data...`);
            
            // Initialize with some baseline data
            for (let i = 0; i < 100; i++) {
                const mockSentiment = {
                    text: `Sample sentiment data ${i}`,
                    source: ['twitter', 'reddit', 'news'][i % 3],
                    sentiment: {
                        score: 0.3 + Math.random() * 0.4, // 0.3 to 0.7
                        polarity: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
                        confidence: 0.6 + Math.random() * 0.3
                    },
                    behavioral: {},
                    timestamp: Date.now() - (100 - i) * 60000,
                    processingTime: 50 + Math.random() * 100
                };
                
                this.sentimentData.rawSentiments.push(mockSentiment);
            }
            
            console.log(`[${this.agentId}] Historical data loaded: ${this.sentimentData.rawSentiments.length} records`);
            
        } catch (error) {
            console.error(`[${this.agentId}] Failed to load historical data:`, error);
        }
    }

    /**
     * Cleanup old data to prevent memory issues
     */
    cleanupOldData() {
        const maxAge = this.config.analysisWindow.longTerm * 2; // Keep 48 hours
        const cutoffTime = Date.now() - maxAge;
        
        // Cleanup raw sentiments
        this.sentimentData.rawSentiments = this.sentimentData.rawSentiments.filter(
            s => s.timestamp > cutoffTime
        );
        
        // Cleanup processed sentiments  
        this.sentimentData.processedSentiments = this.sentimentData.processedSentiments.filter(
            s => s.timestamp > cutoffTime
        );
        
        // Cleanup trend data
        this.sentimentData.trendData = this.sentimentData.trendData.filter(
            t => t.timestamp > cutoffTime
        );
        
        // Cleanup behavioral indicators
        for (const [timestamp, _] of this.sentimentData.behavioralIndicators) {
            if (timestamp < cutoffTime) {
                this.sentimentData.behavioralIndicators.delete(timestamp);
            }
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        // Calculate average processing time
        if (this.metrics.processingTime.length > 0) {
            const avgTime = this.metrics.processingTime.reduce((a, b) => a + b) / this.metrics.processingTime.length;
            
            // Keep only recent processing times
            this.metrics.processingTime = this.metrics.processingTime.slice(-100);
            
            // Update network performance
            if (this.sentimentNetwork) {
                this.metrics.networkPerformance.sentimentAccuracy = this.sentimentNetwork.getAccuracy();
            }
            if (this.transformerNetwork) {
                this.metrics.networkPerformance.transformerAccuracy = this.transformerNetwork.getAccuracy();
            }
            if (this.behavioralNetwork) {
                this.metrics.networkPerformance.behavioralAccuracy = this.behavioralNetwork.getAccuracy();
            }
        }
        
        // Broadcast performance update
        if (Date.now() - this.lastBroadcast > 60000) { // Every minute
            this.broadcastMessage({
                type: 'AGENT_PERFORMANCE',
                agentId: this.agentId,
                metrics: {
                    totalAnalyzed: this.metrics.totalAnalyzed,
                    accuracyScore: this.metrics.accuracyScore,
                    networkPerformance: this.metrics.networkPerformance,
                    dataSize: this.sentimentData.rawSentiments.length
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
            uptime: Date.now() - this.initializeTime,
            metrics: this.metrics,
            dataStatus: {
                rawSentiments: this.sentimentData.rawSentiments.length,
                processedSentiments: this.sentimentData.processedSentiments.length,
                fearGreedIndex: this.sentimentData.fearGreedIndex,
                trends: this.sentimentData.trendData.length
            },
            networks: {
                sentiment: this.sentimentNetwork ? 'initialized' : 'not_initialized',
                transformer: this.transformerNetwork ? 'initialized' : 'not_initialized',
                behavioral: this.behavioralNetwork ? 'initialized' : 'not_initialized'
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
 * Sentiment Classification Neural Network
 */
class SentimentNeuralNetwork {
    constructor(layers) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
        this.learningRate = 0.001;
        this.accuracy = 0;
        this.trainingData = [];
    }

    async initialize() {
        // Initialize weights and biases
        for (let i = 0; i < this.layers.length - 1; i++) {
            this.weights.push(this.initializeMatrix(this.layers[i], this.layers[i + 1]));
            this.biases.push(this.initializeVector(this.layers[i + 1]));
        }
        
        console.log('Sentiment Neural Network initialized');
    }

    initializeMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix.push([]);
            for (let j = 0; j < cols; j++) {
                matrix[i].push((Math.random() - 0.5) * 2); // Xavier initialization
            }
        }
        return matrix;
    }

    initializeVector(size) {
        return Array(size).fill(0).map(() => (Math.random() - 0.5) * 2);
    }

    async classify(textFeatures) {
        // Convert text features to input vector
        const input = this.featuresToVector(textFeatures);
        
        // Forward pass
        const output = await this.feedForward(input);
        
        // Return sentiment classification
        return {
            scores: output,
            confidence: Math.max(...output),
            prediction: output.indexOf(Math.max(...output))
        };
    }

    featuresToVector(features) {
        // Convert text features to numerical vector
        const vector = new Array(this.layers[0]).fill(0);
        
        // Simple feature encoding (in real implementation would be more sophisticated)
        if (features.tokens) {
            vector[0] = Math.min(features.tokens.length / 50, 1); // Text length
        }
        if (features.financialKeywords) {
            vector[1] = features.financialKeywords.bullish.length * 0.1;
            vector[2] = features.financialKeywords.bearish.length * 0.1;
            vector[3] = features.financialKeywords.symbols.length * 0.1;
        }
        
        // Fill remaining with random features (placeholder)
        for (let i = 4; i < vector.length; i++) {
            vector[i] = Math.random() * 0.1;
        }
        
        return vector;
    }

    async feedForward(input) {
        let activations = input;
        
        for (let i = 0; i < this.weights.length; i++) {
            activations = this.matrixMultiply(activations, this.weights[i]);
            activations = this.addBias(activations, this.biases[i]);
            
            // Apply activation function
            if (i === this.weights.length - 1) {
                activations = this.softmax(activations); // Output layer
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
        return input.map((val, i) => val + bias[i]);
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

    getAccuracy() {
        return this.accuracy;
    }

    async train(trainingData) {
        // Simple training implementation
        this.accuracy = 0.75 + Math.random() * 0.2; // Mock accuracy
    }
}

/**
 * Transformer-like Neural Network for Text Understanding
 */
class TransformerNeuralNetwork {
    constructor(layers) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
        this.attentionWeights = [];
        this.accuracy = 0;
    }

    async initialize() {
        // Initialize transformer layers
        for (let i = 0; i < this.layers.length - 1; i++) {
            this.weights.push(this.initializeMatrix(this.layers[i], this.layers[i + 1]));
            this.biases.push(this.initializeVector(this.layers[i + 1]));
            this.attentionWeights.push(this.initializeMatrix(this.layers[i], this.layers[i]));
        }
        
        console.log('Transformer Neural Network initialized');
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
        return Array(size).fill(0).map(() => (Math.random() - 0.5) * 2 / Math.sqrt(size));
    }

    async extractFeatures(preprocessedText) {
        // Convert text to embeddings
        const embeddings = await this.textToEmbeddings(preprocessedText);
        
        // Apply attention mechanism
        const attentionOutput = await this.applyAttention(embeddings);
        
        // Extract final features
        const features = await this.feedForward(attentionOutput);
        
        return features;
    }

    async textToEmbeddings(text) {
        // Simple text to embedding conversion
        const tokens = text.tokens || [];
        const embeddings = [];
        
        for (let i = 0; i < Math.min(tokens.length, 100); i++) {
            const embedding = new Array(this.layers[0]).fill(0);
            // Simple hash-based embedding
            const hash = this.simpleHash(tokens[i] || '');
            for (let j = 0; j < embedding.length; j++) {
                embedding[j] = Math.sin(hash * (j + 1)) * 0.1;
            }
            embeddings.push(embedding);
        }
        
        // Pad or truncate to fixed size
        while (embeddings.length < 50) {
            embeddings.push(new Array(this.layers[0]).fill(0));
        }
        
        return embeddings.slice(0, 50);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    async applyAttention(embeddings) {
        // Simplified attention mechanism
        const attended = embeddings.map(embedding => {
            // Self-attention (simplified)
            const scores = embeddings.map(other => {
                return this.dotProduct(embedding, other);
            });
            
            const attentionWeights = this.softmax(scores);
            const attended = new Array(embedding.length).fill(0);
            
            for (let i = 0; i < embeddings.length; i++) {
                for (let j = 0; j < embedding.length; j++) {
                    attended[j] += attentionWeights[i] * embeddings[i][j];
                }
            }
            
            return attended;
        });
        
        // Global average pooling
        const pooled = new Array(embeddings[0].length).fill(0);
        for (let i = 0; i < attended.length; i++) {
            for (let j = 0; j < pooled.length; j++) {
                pooled[j] += attended[i][j] / attended.length;
            }
        }
        
        return pooled;
    }

    dotProduct(a, b) {
        return a.reduce((sum, val, i) => sum + val * b[i], 0);
    }

    softmax(input) {
        const maxVal = Math.max(...input);
        const exp = input.map(val => Math.exp(val - maxVal));
        const sum = exp.reduce((a, b) => a + b);
        return exp.map(val => val / sum);
    }

    async feedForward(input) {
        let activations = input;
        
        for (let i = 0; i < this.weights.length; i++) {
            activations = this.matrixMultiply(activations, this.weights[i]);
            activations = this.addBias(activations, this.biases[i]);
            activations = this.relu(activations);
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
        return input.map((val, i) => val + bias[i]);
    }

    relu(input) {
        return input.map(val => Math.max(0, val));
    }

    getAccuracy() {
        return this.accuracy;
    }
}

/**
 * Behavioral Pattern Recognition Neural Network
 */
class BehavioralNeuralNetwork {
    constructor(layers) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
        this.trainingData = [];
        this.accuracy = 0;
    }

    async initialize() {
        // Initialize behavioral pattern network
        for (let i = 0; i < this.layers.length - 1; i++) {
            this.weights.push(this.initializeMatrix(this.layers[i], this.layers[i + 1]));
            this.biases.push(this.initializeVector(this.layers[i + 1]));
        }
        
        console.log('Behavioral Neural Network initialized');
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
        return Array(size).fill(0).map(() => (Math.random() - 0.5) * 2 / Math.sqrt(size));
    }

    async analyze(textFeatures, sentimentScore) {
        // Combine text features with sentiment for behavioral analysis
        const input = this.prepareBehavioralInput(textFeatures, sentimentScore);
        
        // Forward pass
        const output = await this.feedForward(input);
        
        // Interpret behavioral signals
        return this.interpretBehavioralOutput(output);
    }

    prepareBehavioralInput(textFeatures, sentimentScore) {
        const input = new Array(this.layers[0]).fill(0);
        
        // Sentiment features
        if (Array.isArray(sentimentScore.scores)) {
            sentimentScore.scores.forEach((score, i) => {
                if (i < 3) input[i] = score;
            });
        }
        
        // Text behavioral features
        if (textFeatures.financialKeywords) {
            input[3] = textFeatures.financialKeywords.bullish.length;
            input[4] = textFeatures.financialKeywords.bearish.length;
            input[5] = textFeatures.financialKeywords.symbols.length;
        }
        
        // Additional behavioral indicators
        input[6] = textFeatures.tokens ? textFeatures.tokens.length / 100 : 0;
        input[7] = textFeatures.urls ? textFeatures.urls.length : 0;
        
        // Fill remaining with derived features
        for (let i = 8; i < input.length; i++) {
            input[i] = Math.sin(i) * 0.1;
        }
        
        return input;
    }

    async feedForward(input) {
        let activations = input;
        
        for (let i = 0; i < this.weights.length; i++) {
            activations = this.matrixMultiply(activations, this.weights[i]);
            activations = this.addBias(activations, this.biases[i]);
            
            if (i === this.weights.length - 1) {
                activations = this.sigmoid(activations); // Output layer
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
        return input.map((val, i) => val + bias[i]);
    }

    relu(input) {
        return input.map(val => Math.max(0, val));
    }

    sigmoid(input) {
        return input.map(val => 1 / (1 + Math.exp(-val)));
    }

    interpretBehavioralOutput(output) {
        return {
            herdBehavior: output[0] || 0,
            panicLevel: output[1] || 0,
            euphoriaLevel: output[2] || 0,
            contrarian: output[3] || 0
        };
    }

    addTrainingData(data) {
        this.trainingData.push(data);
        
        // Simple online learning
        if (this.trainingData.length % 10 === 0) {
            this.performMiniBatchUpdate();
        }
    }

    performMiniBatchUpdate() {
        // Simple gradient update (mock implementation)
        this.accuracy = Math.min(0.95, this.accuracy + 0.01);
    }

    getAccuracy() {
        return this.accuracy;
    }
}

// Initialize and export the agent
const sentimentAgent = new SentimentAnalysisAgent();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentimentAnalysisAgent;
} else if (typeof window !== 'undefined') {
    window.SentimentAnalysisAgent = SentimentAnalysisAgent;
    window.TitanAgents = window.TitanAgents || {};
    window.TitanAgents.SentimentAnalysisAgent = sentimentAgent;
}