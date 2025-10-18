/**
 * Enhanced Trading API with Integrated Monitoring Systems
 * Integrates AIModelOptimizer, PerformanceMonitor, and SecurityAuditor
 */

import express, { Request, Response, NextFunction } from 'express';
import { AIModelOptimizer } from '../services/ai/ai-model-optimizer';
import { PerformanceMonitor } from '../services/monitoring/performance-monitor';
import { SecurityAuditor } from '../services/security/security-auditor';
import { AIInsights } from '../services/ai/ai-insights';
import { TradingEngine } from '../services/trading/trading-engine';

export class EnhancedTradingAPI {
    private router: express.Router;
    private aiOptimizer: AIModelOptimizer;
    private performanceMonitor: PerformanceMonitor;
    private securityAuditor: SecurityAuditor;
    private aiInsights: AIInsights;
    private tradingEngine: TradingEngine;

    constructor() {
        this.router = express.Router();
        this.aiOptimizer = new AIModelOptimizer();
        this.performanceMonitor = new PerformanceMonitor();
        this.securityAuditor = new SecurityAuditor();
        this.aiInsights = new AIInsights();
        this.tradingEngine = new TradingEngine();

        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        // Security audit middleware for all requests
        this.router.use(async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Log request for security audit
                await this.securityAuditor.logRequest({
                    method: req.method,
                    url: req.url,
                    ip: req.ip,
                    userAgent: req.get('User-Agent') || '',
                    timestamp: new Date().toISOString(),
                    headers: req.headers
                });

                // Performance monitoring start
                const startTime = Date.now();
                res.locals.startTime = startTime;

                next();
            } catch (error) {
                console.error('Middleware error:', error);
                next();
            }
        });

        // Response time tracking
        this.router.use((req: Request, res: Response, next: NextFunction) => {
            res.on('finish', () => {
                const duration = Date.now() - res.locals.startTime;
                this.performanceMonitor.recordApiCall({
                    endpoint: req.path,
                    method: req.method,
                    duration,
                    statusCode: res.statusCode,
                    timestamp: new Date().toISOString()
                });
            });
            next();
        });
    }

    private setupRoutes(): void {
        // AI Model Management Routes
        this.setupAIRoutes();
        
        // Performance Monitoring Routes
        this.setupPerformanceRoutes();
        
        // Security Management Routes
        this.setupSecurityRoutes();
        
        // Enhanced Trading Routes
        this.setupTradingRoutes();
        
        // Admin Dashboard Routes
        this.setupAdminRoutes();
    }

    private setupAIRoutes(): void {
        // AI Model Optimization
        this.router.post('/ai/optimize', async (req: Request, res: Response) => {
            try {
                const { modelId, strategy } = req.body;
                
                if (!modelId) {
                    return res.status(400).json({ 
                        error: 'Model ID is required',
                        code: 'MISSING_MODEL_ID'
                    });
                }

                const result = await this.aiOptimizer.optimizeModel(modelId, {
                    strategy: strategy || 'genetic_algorithm',
                    maxIterations: 100,
                    populationSize: 50
                });

                res.json({
                    success: true,
                    optimization: result,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('AI optimization error:', error);
                res.status(500).json({ 
                    error: 'AI optimization failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // AI Model Validation
        this.router.post('/ai/validate/:modelId', async (req: Request, res: Response) => {
            try {
                const { modelId } = req.params;
                const validation = await this.aiOptimizer.validateModel(modelId);

                res.json({
                    success: true,
                    validation,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('AI validation error:', error);
                res.status(500).json({ 
                    error: 'AI validation failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Real-time AI Predictions with Performance Tracking
        this.router.get('/ai/predict/:symbol', async (req: Request, res: Response) => {
            try {
                const startTime = Date.now();
                const { symbol } = req.params;
                const { timeframe } = req.query;

                // Get AI prediction
                const prediction = await this.aiInsights.getPrediction(
                    symbol.toUpperCase(),
                    timeframe as string || '1h'
                );

                // Track AI model performance
                const processingTime = Date.now() - startTime;
                await this.performanceMonitor.recordAIPerformance({
                    modelId: 'main_predictor',
                    symbol,
                    processingTime,
                    accuracy: prediction.confidence,
                    timestamp: new Date().toISOString()
                });

                res.json({
                    success: true,
                    prediction,
                    processingTime,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('AI prediction error:', error);
                res.status(500).json({ 
                    error: 'AI prediction failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // AI Model Fine-tuning
        this.router.post('/ai/finetune', async (req: Request, res: Response) => {
            try {
                const { modelId, trainingData, hyperparameters } = req.body;
                
                const result = await this.aiOptimizer.fineTuneModel(modelId, {
                    trainingData,
                    hyperparameters: hyperparameters || {},
                    validationSplit: 0.2,
                    earlyStoppingPatience: 10
                });

                res.json({
                    success: true,
                    fineTuning: result,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('AI fine-tuning error:', error);
                res.status(500).json({ 
                    error: 'AI fine-tuning failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }

    private setupPerformanceRoutes(): void {
        // Real-time Performance Metrics
        this.router.get('/performance/metrics', async (req: Request, res: Response) => {
            try {
                const metrics = await this.performanceMonitor.getCurrentMetrics();
                
                res.json({
                    success: true,
                    metrics,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Performance metrics error:', error);
                res.status(500).json({ 
                    error: 'Failed to get performance metrics',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Performance Analysis
        this.router.get('/performance/analysis', async (req: Request, res: Response) => {
            try {
                const { timeRange } = req.query;
                const analysis = await this.performanceMonitor.analyzePerformance({
                    timeRange: timeRange as string || '24h',
                    includeOptimizations: true
                });

                res.json({
                    success: true,
                    analysis,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Performance analysis error:', error);
                res.status(500).json({ 
                    error: 'Performance analysis failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Performance Optimization Suggestions
        this.router.get('/performance/optimize', async (req: Request, res: Response) => {
            try {
                const suggestions = await this.performanceMonitor.getOptimizationSuggestions();
                
                res.json({
                    success: true,
                    suggestions,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Performance optimization error:', error);
                res.status(500).json({ 
                    error: 'Failed to get optimization suggestions',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }

    private setupSecurityRoutes(): void {
        // Security Audit
        this.router.post('/security/audit', async (req: Request, res: Response) => {
            try {
                // Verify admin access (simplified for demo)
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.includes('admin')) {
                    return res.status(403).json({ 
                        error: 'Admin access required for security audit',
                        code: 'ADMIN_ACCESS_REQUIRED'
                    });
                }

                const audit = await this.securityAuditor.performSecurityAudit();
                
                res.json({
                    success: true,
                    audit,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Security audit error:', error);
                res.status(500).json({ 
                    error: 'Security audit failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Security Vulnerabilities
        this.router.get('/security/vulnerabilities', async (req: Request, res: Response) => {
            try {
                const vulnerabilities = await this.securityAuditor.scanVulnerabilities();
                
                res.json({
                    success: true,
                    vulnerabilities,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Vulnerability scan error:', error);
                res.status(500).json({ 
                    error: 'Vulnerability scan failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Security Compliance Check
        this.router.get('/security/compliance', async (req: Request, res: Response) => {
            try {
                const compliance = await this.securityAuditor.checkCompliance();
                
                res.json({
                    success: true,
                    compliance,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Compliance check error:', error);
                res.status(500).json({ 
                    error: 'Compliance check failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }

    private setupTradingRoutes(): void {
        // Enhanced Trading with Performance Monitoring
        this.router.post('/trading/execute', async (req: Request, res: Response) => {
            try {
                const startTime = Date.now();
                const { symbol, action, amount, strategy } = req.body;

                // Security validation
                const securityCheck = await this.securityAuditor.validateTradingRequest({
                    symbol, action, amount, strategy,
                    userId: req.headers['user-id'] as string,
                    sessionId: req.headers['session-id'] as string
                });

                if (!securityCheck.valid) {
                    return res.status(403).json({
                        error: 'Security validation failed',
                        violations: securityCheck.violations
                    });
                }

                // Execute trade with AI insights
                const aiPrediction = await this.aiInsights.getPrediction(symbol);
                const tradeResult = await this.tradingEngine.executeTrade({
                    symbol,
                    action,
                    amount,
                    strategy,
                    aiConfidence: aiPrediction.confidence,
                    riskScore: aiPrediction.riskScore
                });

                // Record performance metrics
                const executionTime = Date.now() - startTime;
                await this.performanceMonitor.recordTradeExecution({
                    tradeId: tradeResult.tradeId,
                    symbol,
                    executionTime,
                    success: tradeResult.success,
                    timestamp: new Date().toISOString()
                });

                res.json({
                    success: true,
                    trade: tradeResult,
                    aiPrediction,
                    executionTime,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Trading execution error:', error);
                res.status(500).json({ 
                    error: 'Trading execution failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Portfolio Analysis with AI Enhancement
        this.router.get('/trading/portfolio/analysis', async (req: Request, res: Response) => {
            try {
                const { userId } = req.query;
                
                if (!userId) {
                    return res.status(400).json({ 
                        error: 'User ID is required',
                        code: 'MISSING_USER_ID'
                    });
                }

                const portfolio = await this.tradingEngine.getPortfolio(userId as string);
                const aiAnalysis = await this.aiInsights.analyzePortfolio(portfolio);
                const riskAssessment = await this.aiOptimizer.assessPortfolioRisk(portfolio);

                res.json({
                    success: true,
                    portfolio,
                    aiAnalysis,
                    riskAssessment,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Portfolio analysis error:', error);
                res.status(500).json({ 
                    error: 'Portfolio analysis failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }

    private setupAdminRoutes(): void {
        // Unified System Status
        this.router.get('/admin/system-status', async (req: Request, res: Response) => {
            try {
                const [
                    performanceMetrics,
                    securityStatus,
                    aiModelStatus
                ] = await Promise.all([
                    this.performanceMonitor.getCurrentMetrics(),
                    this.securityAuditor.getSystemSecurityStatus(),
                    this.aiOptimizer.getModelStatuses()
                ]);

                res.json({
                    success: true,
                    systemStatus: {
                        performance: performanceMetrics,
                        security: securityStatus,
                        aiModels: aiModelStatus,
                        lastUpdate: new Date().toISOString()
                    }
                });

            } catch (error) {
                console.error('System status error:', error);
                res.status(500).json({ 
                    error: 'Failed to get system status',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // System Health Check
        this.router.get('/admin/health', async (req: Request, res: Response) => {
            try {
                const health = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    services: {
                        aiOptimizer: await this.aiOptimizer.healthCheck(),
                        performanceMonitor: await this.performanceMonitor.healthCheck(),
                        securityAuditor: await this.securityAuditor.healthCheck(),
                        tradingEngine: await this.tradingEngine.healthCheck()
                    }
                };

                // Check if all services are healthy
                const allHealthy = Object.values(health.services).every(
                    service => service.status === 'healthy'
                );

                if (!allHealthy) {
                    health.status = 'degraded';
                }

                res.json({
                    success: true,
                    health
                });

            } catch (error) {
                console.error('Health check error:', error);
                res.status(503).json({ 
                    success: false,
                    health: {
                        status: 'unhealthy',
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString()
                    }
                });
            }
        });

        // Comprehensive System Dashboard Data
        this.router.get('/admin/dashboard', async (req: Request, res: Response) => {
            try {
                const dashboard = await this.generateDashboardData();
                
                res.json({
                    success: true,
                    dashboard,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Dashboard data error:', error);
                res.status(500).json({ 
                    error: 'Failed to generate dashboard data',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }

    private async generateDashboardData(): Promise<any> {
        const [
            performance,
            security,
            aiModels,
            recentActivity
        ] = await Promise.all([
            this.performanceMonitor.getCurrentMetrics(),
            this.securityAuditor.getSystemSecurityStatus(),
            this.aiOptimizer.getModelStatuses(),
            this.getRecentSystemActivity()
        ]);

        return {
            performance: {
                ...performance,
                trends: await this.performanceMonitor.getPerformanceTrends('24h')
            },
            security: {
                ...security,
                recentThreats: await this.securityAuditor.getRecentThreats(10)
            },
            aiModels: {
                ...aiModels,
                recentOptimizations: await this.aiOptimizer.getRecentOptimizations(5)
            },
            activity: recentActivity,
            alerts: await this.getSystemAlerts()
        };
    }

    private async getRecentSystemActivity(): Promise<any[]> {
        // Implementation would fetch recent system activities
        return [
            {
                id: '1',
                type: 'ai_optimization',
                message: 'Model main_predictor optimized - 12% accuracy improvement',
                timestamp: new Date().toISOString(),
                severity: 'info'
            },
            {
                id: '2',
                type: 'security_scan',
                message: 'Security audit completed - 2 medium vulnerabilities found',
                timestamp: new Date().toISOString(),
                severity: 'warning'
            },
            {
                id: '3',
                type: 'performance',
                message: 'API response time improved by 23ms average',
                timestamp: new Date().toISOString(),
                severity: 'success'
            }
        ];
    }

    private async getSystemAlerts(): Promise<any[]> {
        return [
            {
                id: 'alert_1',
                type: 'performance',
                level: 'warning',
                message: 'CPU usage above 80% for 15 minutes',
                timestamp: new Date().toISOString(),
                resolved: false
            },
            {
                id: 'alert_2',
                type: 'security',
                level: 'medium',
                message: 'Unusual login patterns detected',
                timestamp: new Date().toISOString(),
                resolved: false
            }
        ];
    }

    // Start all monitoring services
    async initialize(): Promise<void> {
        try {
            await Promise.all([
                this.aiOptimizer.initialize(),
                this.performanceMonitor.initialize(),
                this.securityAuditor.initialize(),
                this.tradingEngine.initialize()
            ]);

            console.log('✅ All enhanced trading API services initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing enhanced trading API:', error);
            throw error;
        }
    }

    getRouter(): express.Router {
        return this.router;
    }
}