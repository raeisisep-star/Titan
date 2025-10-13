/**
 * TITAN Trading System - Performance Monitor & Optimizer
 * Real-time performance monitoring and optimization
 */

export interface PerformanceMetrics {
    timestamp: Date;
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    activeUsers: number;
    requestsPerSecond: number;
    errorRate: number;
    aiModelLatency: number;
    databaseLatency: number;
}

export interface PerformanceAlert {
    type: 'warning' | 'error' | 'critical';
    metric: string;
    value: number;
    threshold: number;
    message: string;
    timestamp: Date;
    resolved: boolean;
}

export interface OptimizationSuggestion {
    category: 'api' | 'database' | 'ai' | 'frontend' | 'infrastructure';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImprovement: string;
    implementationEffort: 'low' | 'medium' | 'high';
    timestamp: Date;
}

export class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private alerts: PerformanceAlert[] = [];
    private suggestions: OptimizationSuggestion[] = [];
    private thresholds = {
        responseTime: 1000, // ms
        cpuUsage: 80, // %
        memoryUsage: 85, // %
        errorRate: 5, // %
        aiModelLatency: 200, // ms
        databaseLatency: 50 // ms
    };
    
    constructor() {
        this.startMonitoring();
        this.generateOptimizationSuggestions();
    }
    
    /**
     * Start performance monitoring
     */
    private startMonitoring(): void {
        console.log('📊 Starting performance monitoring...');
        
        // Simulate real-time metrics collection
        setInterval(() => {
            this.collectMetrics();
        }, 5000); // Collect every 5 seconds
        
        // Clean old metrics (keep last hour)
        setInterval(() => {
            this.cleanOldMetrics();
        }, 60000); // Clean every minute
    }
    
    /**
     * Collect current performance metrics
     */
    private collectMetrics(): void {
        const metrics: PerformanceMetrics = {
            timestamp: new Date(),
            responseTime: this.measureResponseTime(),
            cpuUsage: this.measureCpuUsage(),
            memoryUsage: this.measureMemoryUsage(),
            activeUsers: this.countActiveUsers(),
            requestsPerSecond: this.measureRequestsPerSecond(),
            errorRate: this.calculateErrorRate(),
            aiModelLatency: this.measureAiModelLatency(),
            databaseLatency: this.measureDatabaseLatency()
        };
        
        this.metrics.push(metrics);
        this.checkAlerts(metrics);
        
        console.log('📈 Metrics collected:', {
            responseTime: `${metrics.responseTime}ms`,
            cpuUsage: `${metrics.cpuUsage}%`,
            memoryUsage: `${metrics.memoryUsage}%`,
            activeUsers: metrics.activeUsers
        });
    }
    
    /**
     * Measure API response time
     */
    private measureResponseTime(): number {
        // Simulate realistic response times with some variance
        const baseTime = 150;
        const variance = Math.random() * 100;
        const networkDelay = Math.random() * 50;
        
        return Math.round(baseTime + variance + networkDelay);
    }
    
    /**
     * Measure CPU usage (simulated)
     */
    private measureCpuUsage(): number {
        // Simulate CPU usage with realistic patterns
        const baseCpu = 30;
        const loadVariation = Math.random() * 40;
        const peakHours = new Date().getHours() >= 9 && new Date().getHours() <= 17;
        const peakMultiplier = peakHours ? 1.5 : 1.0;
        
        return Math.min(100, Math.round((baseCpu + loadVariation) * peakMultiplier));
    }
    
    /**
     * Measure memory usage (simulated)
     */
    private measureMemoryUsage(): number {
        const baseMemory = 45;
        const variation = Math.random() * 25;
        
        return Math.min(100, Math.round(baseMemory + variation));
    }
    
    /**
     * Count active users (simulated)
     */
    private countActiveUsers(): number {
        const hour = new Date().getHours();
        let baseUsers;
        
        // Simulate user patterns
        if (hour >= 9 && hour <= 17) {
            baseUsers = 150; // Business hours
        } else if (hour >= 18 && hour <= 22) {
            baseUsers = 200; // Evening peak
        } else {
            baseUsers = 50; // Off hours
        }
        
        const variation = Math.random() * 50 - 25;
        return Math.max(1, Math.round(baseUsers + variation));
    }
    
    /**
     * Measure requests per second
     */
    private measureRequestsPerSecond(): number {
        const activeUsers = this.countActiveUsers();
        const requestsPerUser = 0.1 + Math.random() * 0.3; // 0.1-0.4 requests per user per second
        
        return Math.round(activeUsers * requestsPerUser);
    }
    
    /**
     * Calculate error rate
     */
    private calculateErrorRate(): number {
        // Simulate low error rate with occasional spikes
        const baseErrorRate = 1;
        const spike = Math.random() < 0.05 ? Math.random() * 10 : 0; // 5% chance of spike
        
        return Math.min(100, Math.round((baseErrorRate + spike) * 10) / 10);
    }
    
    /**
     * Measure AI model latency
     */
    private measureAiModelLatency(): number {
        const baseLatency = 80;
        const variation = Math.random() * 60;
        const modelLoad = Math.random() < 0.1 ? 100 : 0; // 10% chance of high load
        
        return Math.round(baseLatency + variation + modelLoad);
    }
    
    /**
     * Measure database latency
     */
    private measureDatabaseLatency(): number {
        const baseLatency = 15;
        const variation = Math.random() * 20;
        
        return Math.round(baseLatency + variation);
    }
    
    /**
     * Check for performance alerts
     */
    private checkAlerts(metrics: PerformanceMetrics): void {
        // Response time alert
        if (metrics.responseTime > this.thresholds.responseTime) {
            this.createAlert('error', 'responseTime', metrics.responseTime, this.thresholds.responseTime, 
                `High response time: ${metrics.responseTime}ms`);
        }
        
        // CPU usage alert
        if (metrics.cpuUsage > this.thresholds.cpuUsage) {
            this.createAlert('warning', 'cpuUsage', metrics.cpuUsage, this.thresholds.cpuUsage,
                `High CPU usage: ${metrics.cpuUsage}%`);
        }
        
        // Memory usage alert
        if (metrics.memoryUsage > this.thresholds.memoryUsage) {
            this.createAlert('critical', 'memoryUsage', metrics.memoryUsage, this.thresholds.memoryUsage,
                `High memory usage: ${metrics.memoryUsage}%`);
        }
        
        // Error rate alert
        if (metrics.errorRate > this.thresholds.errorRate) {
            this.createAlert('error', 'errorRate', metrics.errorRate, this.thresholds.errorRate,
                `High error rate: ${metrics.errorRate}%`);
        }
        
        // AI model latency alert
        if (metrics.aiModelLatency > this.thresholds.aiModelLatency) {
            this.createAlert('warning', 'aiModelLatency', metrics.aiModelLatency, this.thresholds.aiModelLatency,
                `High AI model latency: ${metrics.aiModelLatency}ms`);
        }
    }
    
    /**
     * Create performance alert
     */
    private createAlert(type: PerformanceAlert['type'], metric: string, value: number, threshold: number, message: string): void {
        const alert: PerformanceAlert = {
            type,
            metric,
            value,
            threshold,
            message,
            timestamp: new Date(),
            resolved: false
        };
        
        this.alerts.push(alert);
        console.log(`🚨 Performance Alert [${type.toUpperCase()}]: ${message}`);
    }
    
    /**
     * Generate optimization suggestions
     */
    private generateOptimizationSuggestions(): void {
        const suggestions: OptimizationSuggestion[] = [
            {
                category: 'api',
                priority: 'high',
                title: 'Implement Response Caching',
                description: 'Cache API responses for market data that doesn\'t change frequently to reduce database load and improve response times.',
                expectedImprovement: '30-50% reduction in response time',
                implementationEffort: 'medium',
                timestamp: new Date()
            },
            {
                category: 'ai',
                priority: 'high',
                title: 'Model Quantization',
                description: 'Implement INT8 quantization for AI models to reduce memory usage and improve inference speed without significant accuracy loss.',
                expectedImprovement: '40% reduction in memory usage, 25% faster inference',
                implementationEffort: 'high',
                timestamp: new Date()
            },
            {
                category: 'database',
                priority: 'medium',
                title: 'Database Query Optimization',
                description: 'Add indexes on frequently queried columns and optimize complex queries for better performance.',
                expectedImprovement: '20-40% improvement in database response time',
                implementationEffort: 'low',
                timestamp: new Date()
            },
            {
                category: 'frontend',
                priority: 'medium',
                title: 'Lazy Loading Implementation',
                description: 'Implement lazy loading for AI dashboard components to improve initial page load time.',
                expectedImprovement: '50% faster initial load time',
                implementationEffort: 'medium',
                timestamp: new Date()
            },
            {
                category: 'infrastructure',
                priority: 'critical',
                title: 'CDN Optimization',
                description: 'Configure proper CDN caching rules for static assets and implement edge computing for API responses.',
                expectedImprovement: '60% reduction in global latency',
                implementationEffort: 'low',
                timestamp: new Date()
            },
            {
                category: 'api',
                priority: 'high',
                title: 'Request Batching',
                description: 'Implement request batching for AI predictions to reduce overhead and improve throughput.',
                expectedImprovement: '35% increase in API throughput',
                implementationEffort: 'medium',
                timestamp: new Date()
            }
        ];
        
        this.suggestions = suggestions;
        console.log(`💡 Generated ${suggestions.length} optimization suggestions`);
    }
    
    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): PerformanceMetrics | null {
        return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    }
    
    /**
     * Get metrics history
     */
    getMetricsHistory(minutes: number = 60): PerformanceMetrics[] {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        return this.metrics.filter(m => m.timestamp >= cutoff);
    }
    
    /**
     * Get active alerts
     */
    getActiveAlerts(): PerformanceAlert[] {
        return this.alerts.filter(a => !a.resolved);
    }
    
    /**
     * Get all alerts
     */
    getAllAlerts(): PerformanceAlert[] {
        return [...this.alerts];
    }
    
    /**
     * Get optimization suggestions
     */
    getOptimizationSuggestions(category?: string): OptimizationSuggestion[] {
        if (category) {
            return this.suggestions.filter(s => s.category === category);
        }
        return [...this.suggestions];
    }
    
    /**
     * Resolve alert
     */
    resolveAlert(alertIndex: number): boolean {
        if (alertIndex >= 0 && alertIndex < this.alerts.length) {
            this.alerts[alertIndex].resolved = true;
            return true;
        }
        return false;
    }
    
    /**
     * Generate performance report
     */
    generatePerformanceReport(): any {
        const recent = this.getMetricsHistory(60); // Last hour
        const activeAlerts = this.getActiveAlerts();
        const suggestions = this.getOptimizationSuggestions();
        
        if (recent.length === 0) {
            return {
                status: 'No data available',
                timestamp: new Date()
            };
        }
        
        const avg = {
            responseTime: Math.round(recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length),
            cpuUsage: Math.round(recent.reduce((sum, m) => sum + m.cpuUsage, 0) / recent.length),
            memoryUsage: Math.round(recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length),
            activeUsers: Math.round(recent.reduce((sum, m) => sum + m.activeUsers, 0) / recent.length),
            requestsPerSecond: Math.round(recent.reduce((sum, m) => sum + m.requestsPerSecond, 0) / recent.length),
            errorRate: Math.round(recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length * 10) / 10,
            aiModelLatency: Math.round(recent.reduce((sum, m) => sum + m.aiModelLatency, 0) / recent.length),
            databaseLatency: Math.round(recent.reduce((sum, m) => sum + m.databaseLatency, 0) / recent.length)
        };
        
        const status = this.getSystemStatus(avg, activeAlerts);
        
        return {
            status,
            timestamp: new Date(),
            averageMetrics: avg,
            activeAlerts: activeAlerts.length,
            totalSuggestions: suggestions.length,
            highPrioritySuggestions: suggestions.filter(s => s.priority === 'high' || s.priority === 'critical').length,
            recommendations: this.getTopRecommendations(avg, activeAlerts)
        };
    }
    
    /**
     * Get system status
     */
    private getSystemStatus(avg: any, alerts: PerformanceAlert[]): string {
        const criticalAlerts = alerts.filter(a => a.type === 'critical').length;
        const errorAlerts = alerts.filter(a => a.type === 'error').length;
        
        if (criticalAlerts > 0) return 'Critical';
        if (errorAlerts > 0) return 'Warning';
        if (avg.responseTime > 500 || avg.cpuUsage > 70 || avg.memoryUsage > 75) return 'Degraded';
        return 'Healthy';
    }
    
    /**
     * Get top recommendations
     */
    private getTopRecommendations(avg: any, alerts: PerformanceAlert[]): string[] {
        const recommendations: string[] = [];
        
        if (avg.responseTime > 500) {
            recommendations.push('Implement API response caching to reduce latency');
        }
        
        if (avg.memoryUsage > 75) {
            recommendations.push('Consider AI model quantization to reduce memory usage');
        }
        
        if (avg.aiModelLatency > 150) {
            recommendations.push('Optimize AI model inference pipeline');
        }
        
        if (alerts.length > 5) {
            recommendations.push('Review and tune performance thresholds');
        }
        
        return recommendations;
    }
    
    /**
     * Clean old metrics (keep last hour)
     */
    private cleanOldMetrics(): void {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        this.metrics = this.metrics.filter(m => m.timestamp >= oneHourAgo);
        
        // Clean old alerts (keep last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.alerts = this.alerts.filter(a => a.timestamp >= oneDayAgo);
    }
}

// Export default instance
export const performanceMonitor = new PerformanceMonitor();