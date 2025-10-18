/**
 * TITAN Trading System - Performance Monitor & Optimizer
 * Real-time performance tracking and optimization
 */

export interface PerformanceMetrics {
    timestamp: Date;
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    requestsPerSecond: number;
    errorRate: number;
    cacheHitRate: number;
}

export interface LoadTestResult {
    testId: string;
    duration: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
    requestsPerSecond: number;
    throughput: number; // Added throughput metric
    errorRate: number;
    timestamp: Date;
}

export class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private isMonitoring: boolean = false;
    private monitorInterval?: NodeJS.Timeout;
    private cache: Map<string, any> = new Map();
    private requestCount: number = 0;
    private startTime: number = Date.now();
    
    constructor() {}
    
    /**
     * Start performance monitoring
     */
    startMonitoring(intervalMs: number = 5000): void {
        if (this.isMonitoring) {
            console.log('⚠️ Performance monitoring already running');
            return;
        }
        
        console.log('📊 Starting performance monitoring...');
        this.isMonitoring = true;
        this.startTime = Date.now();
        
        this.monitorInterval = setInterval(async () => {
            const metrics = await this.collectMetrics();
            this.metrics.push(metrics);
            
            // Keep only last 1000 metrics
            if (this.metrics.length > 1000) {
                this.metrics = this.metrics.slice(-1000);
            }
            
            // Check for performance issues
            this.checkPerformanceAlerts(metrics);
            
        }, intervalMs);
    }
    
    /**
     * Stop performance monitoring
     */
    stopMonitoring(): void {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = undefined;
        }
        this.isMonitoring = false;
        console.log('📊 Performance monitoring stopped');
    }
    
    /**
     * Collect current performance metrics
     */
    private async collectMetrics(): Promise<PerformanceMetrics> {
        const now = Date.now();
        const uptime = now - this.startTime;
        
        return {
            timestamp: new Date(),
            responseTime: this.getAverageResponseTime(),
            memoryUsage: this.getMemoryUsage(),
            cpuUsage: this.getCpuUsage(),
            activeConnections: this.getActiveConnections(),
            requestsPerSecond: this.getRequestsPerSecond(uptime),
            errorRate: this.getErrorRate(),
            cacheHitRate: this.getCacheHitRate()
        };
    }
    
    /**
     * Get average response time
     */
    private getAverageResponseTime(): number {
        // Simulate response time calculation
        return 50 + Math.random() * 100; // 50-150ms
    }
    
    /**
     * Get memory usage (simulated)
     */
    private getMemoryUsage(): number {
        // Simulate memory usage in MB
        return 100 + Math.random() * 50; // 100-150MB
    }
    
    /**
     * Get CPU usage (simulated)
     */
    private getCpuUsage(): number {
        // Simulate CPU usage percentage
        return 20 + Math.random() * 30; // 20-50%
    }
    
    /**
     * Get active connections
     */
    private getActiveConnections(): number {
        return Math.floor(10 + Math.random() * 90); // 10-100 connections
    }
    
    /**
     * Calculate requests per second
     */
    private getRequestsPerSecond(uptime: number): number {
        return (this.requestCount / uptime) * 1000;
    }
    
    /**
     * Get error rate
     */
    private getErrorRate(): number {
        return Math.random() * 5; // 0-5% error rate
    }
    
    /**
     * Get cache hit rate
     */
    private getCacheHitRate(): number {
        return 85 + Math.random() * 10; // 85-95% hit rate
    }
    
    /**
     * Record API request
     */
    recordRequest(responseTime: number, success: boolean = true): void {
        this.requestCount++;
        
        // Additional request tracking can be added here
        if (!success) {
            console.log(`❌ Failed request recorded: ${responseTime}ms`);
        }
    }
    
    /**
     * Check for performance alerts
     */
    private checkPerformanceAlerts(metrics: PerformanceMetrics): void {
        const alerts: string[] = [];
        
        if (metrics.responseTime > 1000) {
            alerts.push(`High response time: ${metrics.responseTime.toFixed(2)}ms`);
        }
        
        if (metrics.memoryUsage > 500) {
            alerts.push(`High memory usage: ${metrics.memoryUsage.toFixed(2)}MB`);
        }
        
        if (metrics.cpuUsage > 80) {
            alerts.push(`High CPU usage: ${metrics.cpuUsage.toFixed(2)}%`);
        }
        
        if (metrics.errorRate > 5) {
            alerts.push(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
        }
        
        if (metrics.cacheHitRate < 70) {
            alerts.push(`Low cache hit rate: ${metrics.cacheHitRate.toFixed(2)}%`);
        }
        
        if (alerts.length > 0) {
            console.warn('⚠️ Performance alerts:', alerts);
        }
    }
    
    /**
     * Run load testing
     */
    async runLoadTest(
        targetUrl: string,
        concurrent: number = 10,
        duration: number = 30000,
        requestsPerSecond: number = 10
    ): Promise<LoadTestResult> {
        console.log(`🧪 Starting load test: ${concurrent} concurrent users for ${duration}ms`);
        
        const testId = `load-test-${Date.now()}`;
        const startTime = Date.now();
        let totalRequests = 0;
        let successfulRequests = 0;
        let failedRequests = 0;
        const responseTimes: number[] = [];
        
        const interval = 1000 / requestsPerSecond;
        
        const runConcurrentRequests = async (userId: number): Promise<void> => {
            const endTime = startTime + duration;
            
            while (Date.now() < endTime) {
                try {
                    const requestStart = Date.now();
                    
                    // Simulate HTTP request
                    await this.simulateRequest(targetUrl);
                    
                    const responseTime = Date.now() - requestStart;
                    responseTimes.push(responseTime);
                    
                    totalRequests++;
                    successfulRequests++;
                    
                    // Wait for next request
                    await new Promise(resolve => setTimeout(resolve, interval));
                    
                } catch (error) {
                    totalRequests++;
                    failedRequests++;
                    console.error(`Request failed for user ${userId}:`, error.message);
                }
            }
        };
        
        // Run concurrent users
        const promises = Array.from({ length: concurrent }, (_, i) => 
            runConcurrentRequests(i)
        );
        
        await Promise.all(promises);
        
        const actualDuration = Date.now() - startTime;
        const averageResponseTime = responseTimes.length > 0 
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;
        
        const result: LoadTestResult = {
            testId,
            duration: actualDuration,
            totalRequests,
            successfulRequests,
            failedRequests,
            averageResponseTime,
            maxResponseTime: Math.max(...responseTimes, 0),
            minResponseTime: Math.min(...responseTimes, 0),
            requestsPerSecond: (totalRequests / actualDuration) * 1000,
            throughput: (successfulRequests / actualDuration) * 1000, // Added throughput calculation
            errorRate: (failedRequests / totalRequests) * 100,
            timestamp: new Date()
        };
        
        console.log('📊 Load test completed:', result);
        return result;
    }
    
    /**
     * Simulate HTTP request
     */
    private async simulateRequest(url: string): Promise<void> {
        const delay = 50 + Math.random() * 200; // 50-250ms
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Simulate occasional failures
        if (Math.random() < 0.02) { // 2% failure rate
            throw new Error('Simulated network error');
        }
    }
    
    /**
     * Get performance summary
     */
    getPerformanceSummary(): any {
        if (this.metrics.length === 0) {
            return null;
        }
        
        const recent = this.metrics.slice(-10); // Last 10 metrics
        
        return {
            averageResponseTime: recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length,
            averageMemoryUsage: recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length,
            averageCpuUsage: recent.reduce((sum, m) => sum + m.cpuUsage, 0) / recent.length,
            averageRequestsPerSecond: recent.reduce((sum, m) => sum + m.requestsPerSecond, 0) / recent.length,
            averageErrorRate: recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length,
            averageCacheHitRate: recent.reduce((sum, m) => sum + m.cacheHitRate, 0) / recent.length,
            totalDataPoints: this.metrics.length,
            monitoringStatus: this.isMonitoring ? 'active' : 'stopped'
        };
    }
    
    /**
     * Optimize performance based on metrics
     */
    async optimizePerformance(): Promise<string[]> {
        const summary = this.getPerformanceSummary();
        const optimizations: string[] = [];
        
        if (!summary) {
            return ['No metrics available for optimization'];
        }
        
        if (summary.averageResponseTime > 500) {
            optimizations.push('Enable response compression');
            optimizations.push('Implement request caching');
            optimizations.push('Optimize database queries');
        }
        
        if (summary.averageMemoryUsage > 300) {
            optimizations.push('Implement memory cleanup routines');
            optimizations.push('Optimize object creation');
            optimizations.push('Enable garbage collection tuning');
        }
        
        if (summary.averageCacheHitRate < 80) {
            optimizations.push('Increase cache size');
            optimizations.push('Improve cache key strategies');
            optimizations.push('Implement pre-loading for common requests');
        }
        
        if (summary.averageErrorRate > 2) {
            optimizations.push('Improve error handling');
            optimizations.push('Add retry mechanisms');
            optimizations.push('Implement circuit breaker pattern');
        }
        
        console.log('⚡ Performance optimizations suggested:', optimizations);
        return optimizations;
    }
    
    /**
     * Cleanup monitoring
     */
    cleanup(): void {
        this.stopMonitoring();
        this.metrics = [];
        this.cache.clear();
        console.log('✅ Performance monitor cleanup complete');
    }
}

export const performanceMonitor = new PerformanceMonitor();