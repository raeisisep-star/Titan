/**
 * TITAN AI Agents - Data Adapters
 * 
 * Normalizes backend response data to match frontend expectations.
 * Provides safe defaults and graceful degradation for missing fields.
 * 
 * @author TITAN Trading System
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    /**
     * Safe accessor with default value
     * @private
     */
    function safeGet(obj, path, defaultValue = null) {
        try {
            return path.split('.').reduce((curr, key) => curr?.[key], obj) ?? defaultValue;
        } catch {
            return defaultValue;
        }
    }
    
    /**
     * Agent 01: Technical Analysis
     * Expected: { indicators: { rsi, macd, bollinger, volume }, signals, trend }
     */
    function adaptAgent01(status) {
        if (!status) return null;
        
        return {
            indicators: {
                rsi: safeGet(status, 'indicators.rsi') || safeGet(status, 'rsi') || safeGet(status, 'ta.rsi'),
                macd: safeGet(status, 'indicators.macd') || safeGet(status, 'macd') || safeGet(status, 'ta.macd'),
                bollinger: safeGet(status, 'indicators.bollinger') || safeGet(status, 'bollinger'),
                volume: safeGet(status, 'indicators.volume') || safeGet(status, 'volume')
            },
            signals: safeGet(status, 'signals', []),
            trend: safeGet(status, 'trend', 'unknown'),
            lastUpdate: safeGet(status, 'lastUpdate') || safeGet(status, 'timestamp')
        };
    }
    
    /**
     * Agent 02: Risk Management
     * Expected: { portfolioRisk, positions, alerts }
     */
    function adaptAgent02(status) {
        if (!status) return null;
        
        return {
            portfolioRisk: safeGet(status, 'portfolioRisk') || safeGet(status, 'risk.portfolio') || 0,
            positionRisks: safeGet(status, 'positions', []),
            alerts: safeGet(status, 'alerts', []),
            riskLevel: safeGet(status, 'riskLevel') || safeGet(status, 'risk.level', 'unknown'),
            lastUpdate: safeGet(status, 'lastUpdate') || safeGet(status, 'timestamp')
        };
    }
    
    /**
     * Agent 03: Sentiment Analysis
     * Expected: { overallMarket, sources, sentiment }
     */
    function adaptAgent03(status) {
        if (!status) return null;
        
        return {
            overallMarket: safeGet(status, 'overallMarket') || safeGet(status, 'sentiment.overall') || 'neutral',
            sources: safeGet(status, 'sources', []),
            sentiment: safeGet(status, 'sentiment') || {},
            score: safeGet(status, 'score') || safeGet(status, 'sentiment.score', 0),
            lastUpdate: safeGet(status, 'lastUpdate') || safeGet(status, 'timestamp')
        };
    }
    
    /**
     * Agent 04: Portfolio Optimization
     * Expected: { totals: { totalValue, totalProfit }, assets, suggestions }
     */
    function adaptAgent04(status) {
        if (!status) return null;
        
        return {
            totals: {
                totalValue: safeGet(status, 'totals.totalValue') || safeGet(status, 'portfolio.totalValue') || 0,
                totalProfit: safeGet(status, 'totals.totalProfit') || safeGet(status, 'portfolio.totalProfit') || 0,
                totalProfitPercent: safeGet(status, 'totals.totalProfitPercent') || safeGet(status, 'portfolio.profitPercent') || 0
            },
            assets: safeGet(status, 'assets', []),
            suggestions: safeGet(status, 'suggestions', []),
            allocation: safeGet(status, 'allocation') || {},
            lastUpdate: safeGet(status, 'lastUpdate') || safeGet(status, 'timestamp')
        };
    }
    
    /**
     * Agent 11: Portfolio Optimization (duplicate ID?)
     * Same as Agent 04
     */
    function adaptAgent11(status) {
        return adaptAgent04(status);
    }
    
    /**
     * Agents 5-10: Generic adapter for future implementation
     */
    function adaptGenericAgent(status) {
        if (!status) return null;
        
        return {
            ...status,
            available: true,
            lastUpdate: safeGet(status, 'lastUpdate') || safeGet(status, 'timestamp') || new Date().toISOString()
        };
    }
    
    /**
     * Main adapter dispatcher
     * @param {number|string} agentId - Agent ID
     * @param {Object} status - Raw status data from backend
     * @returns {Object} Normalized status data
     */
    function adaptAgentStatus(agentId, status) {
        const id = parseInt(agentId);
        
        const adapters = {
            1: adaptAgent01,
            2: adaptAgent02,
            3: adaptAgent03,
            4: adaptAgent04,
            11: adaptAgent11
        };
        
        const adapter = adapters[id] || adaptGenericAgent;
        
        try {
            const adapted = adapter(status);
            console.log(`✅ Agent ${agentId} data adapted`);
            return adapted;
        } catch (error) {
            console.warn(`⚠️ Agent ${agentId} adapter failed, using raw data:`, error);
            return status;
        }
    }
    
    /**
     * Safe render helper - returns placeholder if data is null/undefined
     * @param {*} value - Value to render
     * @param {string} placeholder - Placeholder text
     * @returns {string} Value or placeholder
     */
    function safeRender(value, placeholder = 'N/A') {
        if (value === null || value === undefined || value === '') {
            return placeholder;
        }
        return value;
    }
    
    /**
     * Format number with safe fallback
     */
    function safeFormatNumber(value, decimals = 2, placeholder = 'N/A') {
        if (value === null || value === undefined || isNaN(value)) {
            return placeholder;
        }
        return parseFloat(value).toFixed(decimals);
    }
    
    /**
     * Format percentage with safe fallback
     */
    function safeFormatPercent(value, decimals = 2, placeholder = 'N/A') {
        if (value === null || value === undefined || isNaN(value)) {
            return placeholder;
        }
        return `${parseFloat(value).toFixed(decimals)}%`;
    }
    
    /**
     * Adapt agent configuration data
     * @param {number|string} agentId - Agent ID
     * @param {Object} raw - Raw config data from backend
     * @returns {Object} Normalized config data with safe defaults
     */
    function adaptAgentConfig(agentId, raw) {
        try {
            const cfg = raw || {};
            return {
                agentId: cfg.agentId || `agent-${String(agentId).padStart(2, '0')}`,
                enabled: Boolean(cfg.enabled),
                pollingIntervalMs: Number.isFinite(cfg.pollingIntervalMs) ? cfg.pollingIntervalMs : 5000,
                maxConcurrency: Number.isFinite(cfg.maxConcurrency) ? cfg.maxConcurrency : 1,
                retries: Number.isFinite(cfg.retries) ? cfg.retries : 0,
                // Additional config fields
                thresholds: cfg.thresholds || {},
                params: cfg.params || {},
                // Raw data pass-through for any additional fields
                ...(cfg.rawData || {})
            };
        } catch (error) {
            console.warn(`⚠️ Agent ${agentId} config adapter failed, using safe defaults:`, error);
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
    
    /**
     * Adapt agent history data
     * @param {number|string} agentId - Agent ID
     * @param {Array|Object} raw - Raw history data from backend
     * @returns {Array} Normalized history array
     */
    function adaptAgentHistory(agentId, raw) {
        try {
            // If raw is an object with items array, extract it
            if (raw && typeof raw === 'object' && Array.isArray(raw.items)) {
                return raw.items;
            }
            
            // If raw is already an array, use it
            if (Array.isArray(raw)) {
                return raw;
            }
            
            // Otherwise return empty array
            return [];
        } catch (error) {
            console.warn(`⚠️ Agent ${agentId} history adapter failed, returning empty array:`, error);
            return [];
        }
    }
    
    // Export to window
    window.TITAN_AI_ADAPTERS = {
        adaptAgentStatus,
        adaptAgentConfig,
        adaptAgentHistory,
        safeGet,
        safeRender,
        safeFormatNumber,
        safeFormatPercent
    };
    
    console.log('✅ TITAN AI Adapters module loaded');
    
})();
