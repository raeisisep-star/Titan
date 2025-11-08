/**
 * TITAN Trading System - Circuit Breaker Utility
 * 
 * Shared circuit breaker implementation for managing external API calls
 * and preventing cascading failures across the system.
 * 
 * Pattern: Circuit Breaker (Stability Pattern)
 * States: CLOSED (normal), OPEN (blocking), HALF_OPEN (testing recovery)
 * 
 * @author TITAN Trading System
 * @version 1.0.0
 */

export class CircuitBreaker {
    constructor(config = {}) {
        this.failureThreshold = config.failureThreshold || 5;
        this.recoveryTimeout = config.recoveryTimeout || 30000; // 30 seconds
        this.monitoringPeriod = config.monitoringPeriod || 60000; // 1 minute
        
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.nextAttempt = null;
    }
    
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit breaker is OPEN - operation blocked');
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
    
    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime,
            nextAttempt: this.nextAttempt
        };
    }
}

export default CircuitBreaker;
