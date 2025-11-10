/**
 * AI Adapters Module
 * Safe data transformation and formatting for AI agent data
 * Prevents NaN, undefined, and null values from breaking the UI
 */

// Safe number conversion
const N = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

// Safe percentage calculation with zero-division protection
const pct = (numerator, denominator) => {
    const num = N(numerator);
    const den = N(denominator);
    if (den === 0) return 0;
    return parseFloat(((num / den) * 100).toFixed(2));
};

// Safe number formatting
function safeFormatNumber(value, decimals = 2) {
    const num = N(value);
    return num.toFixed(decimals);
}

// Safe percentage formatting
function safeFormatPercent(value, showSign = false) {
    const num = N(value);
    const formatted = num.toFixed(1);
    return showSign && num > 0 ? `+${formatted}%` : `${formatted}%`;
}

// Safe get with default value
function safeGet(obj, path, defaultValue = null) {
    if (!obj || typeof obj !== 'object') return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result === null || result === undefined || typeof result !== 'object') {
            return defaultValue;
        }
        result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
}

// Safe render helper
function safeRender(value, fallback = '—') {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && !Number.isFinite(value))) {
        return fallback;
    }
    return value;
}

// Adapt agent status from API response
function adaptAgentStatus(agentId, raw) {
    try {
        const status = raw || {};
        return {
            id: agentId,
            status: status.status || 'unavailable',
            health: status.health || 'unknown',
            lastUpdate: status.lastUpdate || status.updatedAt || new Date().toISOString(),
            metrics: {
                requestsPerMinute: N(status.metrics?.requestsPerMinute || status.requestsPerMinute),
                successRate: N(status.metrics?.successRate || status.successRate),
                avgResponseTime: N(status.metrics?.avgResponseTime || status.avgResponseTime),
                errorRate: N(status.metrics?.errorRate || status.errorRate)
            }
        };
    } catch (error) {
        console.error(`Error adapting agent ${agentId} status:`, error);
        return {
            id: agentId,
            status: 'unavailable',
            health: 'unknown',
            lastUpdate: new Date().toISOString(),
            metrics: {
                requestsPerMinute: 0,
                successRate: 0,
                avgResponseTime: 0,
                errorRate: 0
            }
        };
    }
}

// Adapt agent configuration
function adaptAgentConfig(agentId, raw) {
    try {
        const cfg = raw || {};
        return {
            agentId: cfg.agentId || `agent-${String(agentId).padStart(2, '0')}`,
            enabled: Boolean(cfg.enabled),
            pollingIntervalMs: Number.isFinite(cfg.pollingIntervalMs) ? cfg.pollingIntervalMs : 5000,
            maxConcurrency: Number.isFinite(cfg.maxConcurrency) ? cfg.maxConcurrency : 1,
            retries: Number.isFinite(cfg.retries) ? cfg.retries : 0,
            thresholds: cfg.thresholds || {},
            params: cfg.params || {}
        };
    } catch (error) {
        console.error(`Error adapting agent ${agentId} config:`, error);
        return {
            agentId: `agent-${String(agentId).padStart(2, '0')}`,
            enabled: false,
            pollingIntervalMs: 5000,
            maxConcurrency: 1,
            retries: 0,
            thresholds: {},
            params: {}
        };
    }
}

// Adapt agent history
function adaptAgentHistory(agentId, raw) {
    try {
        if (!Array.isArray(raw)) {
            return [];
        }
        
        return raw.map(item => ({
            timestamp: item.timestamp || item.ts || new Date().toISOString(),
            status: item.status || 'unknown',
            metrics: {
                responseTime: N(item.metrics?.responseTime || item.responseTime),
                successRate: N(item.metrics?.successRate || item.successRate),
                errorCount: N(item.metrics?.errorCount || item.errorCount)
            },
            metadata: item.metadata || {}
        }));
    } catch (error) {
        console.error(`Error adapting agent ${agentId} history:`, error);
        return [];
    }
}

// Export as global object
window.TITAN_AI_ADAPTERS = {
    // Core functions
    N,
    pct,
    
    // Formatters
    safeFormatNumber,
    safeFormatPercent,
    safeGet,
    safeRender,
    
    // Adapters
    adaptAgentStatus,
    adaptAgentConfig,
    adaptAgentHistory
};

console.log('✅ TITAN AI Adapters module loaded');
console.log('   - Available adapters:', Object.keys(window.TITAN_AI_ADAPTERS).join(', '));
