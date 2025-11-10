// Circuit Breaker Service - Phase B3
// سخت‌جان‌سازی سبک برای APIهای خارجی

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3; // تعداد خطاهای متوالی
    this.resetTimeout = options.resetTimeout || 30000; // 30 ثانیه
    this.monitorInterval = options.monitorInterval || 60000; // 1 دقیقه
    
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
    this.lastError = null;
    
    // آمار
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      openedAt: null,
      closedAt: null
    };
  }

  /**
   * اجرای تابع با حفاظت Circuit Breaker
   */
  async execute(fn) {
    this.stats.totalRequests++;

    // اگر Circuit باز است
    if (this.state === 'OPEN') {
      // چک کنیم آیا زمان تلاش مجدد رسیده؟
      if (Date.now() < this.nextAttempt) {
        const waitTime = Math.ceil((this.nextAttempt - Date.now()) / 1000);
        const error = new Error(
          `Circuit breaker is OPEN. Retry in ${waitTime}s. Last error: ${this.lastError?.message || 'Unknown'}`
        );
        error.circuitBreakerOpen = true;
        throw error;
      }
      
      // تلاش در حالت HALF_OPEN
      this.state = 'HALF_OPEN';
      console.log('🔄 Circuit breaker entering HALF_OPEN state');
    }

    try {
      // اجرای تابع
      const result = await fn();
      
      // موفقیت
      this.onSuccess();
      return result;
      
    } catch (error) {
      // شکست
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * مدیریت موفقیت
   */
  onSuccess() {
    this.stats.successfulRequests++;
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      console.log('✅ Circuit breaker CLOSED (recovered)');
      this.state = 'CLOSED';
      this.stats.closedAt = Date.now();
    }
  }

  /**
   * مدیریت شکست
   */
  onFailure(error) {
    this.stats.failedRequests++;
    this.failures++;
    this.lastError = error;
    
    console.warn(`⚠️ Circuit breaker failure ${this.failures}/${this.failureThreshold}: ${error.message}`);
    
    if (this.failures >= this.failureThreshold) {
      this.open();
    }
  }

  /**
   * باز کردن Circuit
   */
  open() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.resetTimeout;
    this.stats.openedAt = Date.now();
    
    const waitTime = Math.ceil(this.resetTimeout / 1000);
    console.error(`🔴 Circuit breaker OPENED! Will retry in ${waitTime}s`);
  }

  /**
   * ریست کردن دستی
   */
  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastError = null;
    console.log('🔄 Circuit breaker manually reset');
  }

  /**
   * دریافت وضعیت
   */
  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      threshold: this.failureThreshold,
      nextAttempt: this.state === 'OPEN' ? this.nextAttempt : null,
      lastError: this.lastError?.message || null,
      stats: { ...this.stats }
    };
  }
}

module.exports = CircuitBreaker;
