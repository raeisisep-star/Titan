/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures when external services (exchanges) are unavailable.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Circuit is tripped, requests fail immediately (fail-fast)
 * - HALF_OPEN: Testing if service recovered, allows limited requests
 * 
 * Flow:
 * 1. CLOSED → OPEN: After failureThreshold failures within windowMs
 * 2. OPEN → HALF_OPEN: After openDurationMs timeout
 * 3. HALF_OPEN → CLOSED: If successThreshold consecutive successes
 * 4. HALF_OPEN → OPEN: If any failure occurs
 */

const { logger } = require('./logMasking');

const CircuitState = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open'
};

class CircuitBreaker {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.name - Circuit breaker name (for logging/metrics)
   * @param {number} options.failureThreshold - Failures before opening circuit (default: 5)
   * @param {number} options.successThreshold - Successes to close circuit (default: 2)
   * @param {number} options.windowMs - Time window for failure counting (default: 60000ms)
   * @param {number} options.openDurationMs - How long to stay open (default: 60000ms)
   * @param {number} options.halfOpenMaxCalls - Max calls in half-open state (default: 3)
   */
  constructor(options = {}) {
    this.name = options.name || 'circuit-breaker';
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.openDurationMs = options.openDurationMs || 60000; // 1 minute
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 3;
    
    // State
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastStateChange = Date.now();
    this.halfOpenCalls = 0;
    
    // Metrics
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0, // Calls rejected due to open circuit
      stateChanges: {
        [CircuitState.CLOSED]: 0,
        [CircuitState.OPEN]: 0,
        [CircuitState.HALF_OPEN]: 0
      }
    };
    
    logger.info(`[CircuitBreaker:${this.name}] Initialized`, {
      failureThreshold: this.failureThreshold,
      successThreshold: this.successThreshold,
      windowMs: this.windowMs,
      openDurationMs: this.openDurationMs
    });
  }
  
  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @returns {Promise<any>} - Result of fn or throws error
   */
  async execute(fn) {
    this.metrics.totalCalls++;
    
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      const timeSinceOpen = Date.now() - this.lastStateChange;
      if (timeSinceOpen >= this.openDurationMs) {
        this._transitionTo(CircuitState.HALF_OPEN);
      }
    }
    
    // Reject if circuit is open
    if (this.state === CircuitState.OPEN) {
      this.metrics.rejectedCalls++;
      const error = new Error(`Circuit breaker [${this.name}] is OPEN`);
      error.code = 'CIRCUIT_OPEN';
      logger.warn(`[CircuitBreaker:${this.name}] Request rejected (circuit OPEN)`);
      throw error;
    }
    
    // Limit calls in HALF_OPEN state
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.halfOpenMaxCalls) {
        this.metrics.rejectedCalls++;
        const error = new Error(`Circuit breaker [${this.name}] is HALF_OPEN (max calls reached)`);
        error.code = 'CIRCUIT_HALF_OPEN_LIMIT';
        logger.warn(`[CircuitBreaker:${this.name}] Request rejected (half-open limit)`);
        throw error;
      }
      this.halfOpenCalls++;
    }
    
    // Execute the function
    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure(error);
      throw error;
    }
  }
  
  /**
   * Handle successful call
   */
  _onSuccess() {
    this.metrics.successfulCalls++;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      logger.info(`[CircuitBreaker:${this.name}] Success in HALF_OPEN (${this.successCount}/${this.successThreshold})`);
      
      if (this.successCount >= this.successThreshold) {
        this._transitionTo(CircuitState.CLOSED);
        this.successCount = 0;
        this.failureCount = 0;
        this.halfOpenCalls = 0;
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success in closed state (within window)
      const timeSinceLastFailure = this.lastFailureTime 
        ? Date.now() - this.lastFailureTime 
        : Infinity;
      
      if (timeSinceLastFailure > this.windowMs) {
        this.failureCount = 0;
      }
    }
  }
  
  /**
   * Handle failed call
   */
  _onFailure(error) {
    this.metrics.failedCalls++;
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open immediately opens circuit
      logger.warn(`[CircuitBreaker:${this.name}] Failure in HALF_OPEN, reopening circuit`);
      this._transitionTo(CircuitState.OPEN);
      this.successCount = 0;
      this.halfOpenCalls = 0;
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount++;
      
      // Remove old failures outside the window
      const failuresInWindow = this._getFailuresInWindow();
      
      logger.warn(`[CircuitBreaker:${this.name}] Failure (${failuresInWindow}/${this.failureThreshold})`, {
        error: error.message
      });
      
      if (failuresInWindow >= this.failureThreshold) {
        this._transitionTo(CircuitState.OPEN);
        this.failureCount = 0;
      }
    }
  }
  
  /**
   * Get number of failures within the time window
   */
  _getFailuresInWindow() {
    if (!this.lastFailureTime) return 0;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    if (timeSinceLastFailure > this.windowMs) {
      return 0;
    }
    
    return this.failureCount;
  }
  
  /**
   * Transition to a new state
   */
  _transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();
    this.metrics.stateChanges[newState]++;
    
    logger.info(`[CircuitBreaker:${this.name}] State transition: ${oldState} → ${newState}`, {
      metrics: this.getMetrics()
    });
  }
  
  /**
   * Get current state
   */
  getState() {
    return this.state;
  }
  
  /**
   * Get circuit breaker metrics
   */
  getMetrics() {
    return {
      name: this.name,
      state: this.state,
      metrics: this.metrics,
      config: {
        failureThreshold: this.failureThreshold,
        successThreshold: this.successThreshold,
        windowMs: this.windowMs,
        openDurationMs: this.openDurationMs
      }
    };
  }
  
  /**
   * Reset circuit breaker to initial state
   */
  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastStateChange = Date.now();
    this.halfOpenCalls = 0;
    
    logger.info(`[CircuitBreaker:${this.name}] Reset to CLOSED state`);
  }
}

/**
 * Wrapper function for easier usage
 * 
 * @param {string} operationName - Name of the operation
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Circuit breaker options
 * @returns {Promise<any>} - Result of fn or throws error
 */
async function withCircuitBreaker(operationName, fn, options = {}) {
  const breaker = new CircuitBreaker({
    name: operationName,
    ...options
  });
  
  return breaker.execute(fn);
}

/**
 * Exponential backoff retry with circuit breaker
 * 
 * @param {string} operationName - Name of the operation
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Configuration
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.initialDelayMs - Initial delay (default: 200)
 * @param {number} options.maxDelayMs - Maximum delay (default: 3000)
 * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
 * @returns {Promise<any>} - Result of fn or throws error
 */
async function withRetry(operationName, fn, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const initialDelayMs = options.initialDelayMs || 200;
  const maxDelayMs = options.maxDelayMs || 3000;
  const backoffMultiplier = options.backoffMultiplier || 2;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if circuit is open
      if (error.code === 'CIRCUIT_OPEN' || error.code === 'CIRCUIT_HALF_OPEN_LIMIT') {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );
      
      logger.warn(`[Retry:${operationName}] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms`, {
        error: error.message
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries exhausted
  logger.error(`[Retry:${operationName}] All ${maxRetries + 1} attempts failed`, {
    error: lastError.message
  });
  
  throw lastError;
}

module.exports = {
  CircuitBreaker,
  CircuitState,
  withCircuitBreaker,
  withRetry
};
