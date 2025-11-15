/**
 * Real-time Manager
 * 🎯 TITAN Platform - Live Data Updates
 * Version: 2.0.0
 * 
 * Manages real-time data updates:
 * - Smart polling with backoff
 * - WebSocket support (future)
 * - Connection status monitoring
 * - Automatic reconnection
 */

/**
 * Real-time Manager Class
 */
class RealtimeManager {
    constructor(options = {}) {
        this.options = {
            pollingInterval: options.pollingInterval || 30000, // 30s
            maxInterval: options.maxInterval || 120000, // 2min
            backoffMultiplier: options.backoffMultiplier || 1.5,
            reconnectAttempts: options.reconnectAttempts || 5,
            ...options
        };
        
        this.state = {
            isPolling: false,
            isPaused: false,
            currentInterval: this.options.pollingInterval,
            consecutiveFailures: 0,
            lastUpdate: null,
            connectionStatus: 'disconnected'
        };
        
        this.pollTimer = null;
        this.callbacks = {
            onUpdate: null,
            onError: null,
            onStatusChange: null
        };
        
        this.init();
    }
    
    /**
     * Initialize realtime manager
     */
    init() {
        // Listen for visibility change to pause/resume
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        console.log('✅ [RealtimeManager] Initialized');
    }
    
    /**
     * Start polling
     * @param {Function} callback - Update callback
     */
    start(callback) {
        if (this.state.isPolling) {
            console.warn('⚠️ [RealtimeManager] Already polling');
            return;
        }
        
        this.callbacks.onUpdate = callback;
        this.state.isPolling = true;
        this.updateStatus('connected');
        
        // Start immediate fetch
        this.fetch();
        
        console.log(`✅ [RealtimeManager] Started polling (${this.state.currentInterval}ms)`);
    }
    
    /**
     * Stop polling
     */
    stop() {
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
        
        this.state.isPolling = false;
        this.updateStatus('disconnected');
        
        console.log('🛑 [RealtimeManager] Stopped polling');
    }
    
    /**
     * Pause polling (without disconnecting)
     */
    pause() {
        if (!this.state.isPolling || this.state.isPaused) return;
        
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
        
        this.state.isPaused = true;
        console.log('⏸️ [RealtimeManager] Paused polling');
    }
    
    /**
     * Resume polling
     */
    resume() {
        if (!this.state.isPolling || !this.state.isPaused) return;
        
        this.state.isPaused = false;
        this.fetch();
        
        console.log('▶️ [RealtimeManager] Resumed polling');
    }
    
    /**
     * Fetch data and schedule next poll
     */
    async fetch() {
        if (!this.state.isPolling || this.state.isPaused) return;
        
        try {
            // Call update callback
            if (this.callbacks.onUpdate) {
                await this.callbacks.onUpdate();
            }
            
            // Reset backoff on success
            this.state.consecutiveFailures = 0;
            this.state.currentInterval = this.options.pollingInterval;
            this.state.lastUpdate = Date.now();
            this.updateStatus('connected');
            
        } catch (error) {
            console.error('❌ [RealtimeManager] Fetch error:', error);
            
            // Handle error
            this.handleError(error);
            
            // Increase backoff
            this.state.consecutiveFailures++;
            this.state.currentInterval = Math.min(
                this.state.currentInterval * this.options.backoffMultiplier,
                this.options.maxInterval
            );
            
            // Call error callback
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
            
            // Stop if too many failures
            if (this.state.consecutiveFailures >= this.options.reconnectAttempts) {
                console.error(`❌ [RealtimeManager] Too many failures (${this.state.consecutiveFailures}), stopping`);
                this.updateStatus('error');
                this.stop();
                return;
            }
            
            this.updateStatus('reconnecting');
        }
        
        // Schedule next poll
        if (this.state.isPolling && !this.state.isPaused) {
            this.pollTimer = setTimeout(() => this.fetch(), this.state.currentInterval);
        }
    }
    
    /**
     * Handle error
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('❌ [RealtimeManager] Error:', error.message);
    }
    
    /**
     * Handle online event
     */
    handleOnline() {
        console.log('🌐 [RealtimeManager] Connection restored');
        this.updateStatus('connected');
        
        if (this.state.isPolling && this.state.isPaused) {
            this.resume();
        }
    }
    
    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('📡 [RealtimeManager] Connection lost');
        this.updateStatus('offline');
        this.pause();
    }
    
    /**
     * Update connection status
     * @param {string} status - New status
     */
    updateStatus(status) {
        const oldStatus = this.state.connectionStatus;
        this.state.connectionStatus = status;
        
        if (oldStatus !== status && this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange(status, oldStatus);
        }
    }
    
    /**
     * Register callbacks
     * @param {Object} callbacks - Callback functions
     */
    on(event, callback) {
        if (event === 'update') {
            this.callbacks.onUpdate = callback;
        } else if (event === 'error') {
            this.callbacks.onError = callback;
        } else if (event === 'status') {
            this.callbacks.onStatusChange = callback;
        }
    }
    
    /**
     * Get current status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            ...this.state,
            nextUpdate: this.state.lastUpdate ? 
                this.state.lastUpdate + this.state.currentInterval : null
        };
    }
    
    /**
     * Force immediate update
     */
    forceUpdate() {
        console.log('🔄 [RealtimeManager] Force update triggered');
        
        // Clear existing timer
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
        
        // Fetch immediately
        this.fetch();
    }
}

export default RealtimeManager;
