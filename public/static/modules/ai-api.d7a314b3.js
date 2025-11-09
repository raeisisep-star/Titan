/**
 * TITAN AI Agents - Centralized API Layer
 * 
 * Handles all AI agent API calls with proper error handling
 * and graceful degradation for missing/unavailable agents.
 * 
 * @author TITAN Trading System
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // Use the global apiClient singleton
    const api = window.apiClient || axios;
    
    /**
     * Fetch a single endpoint for an agent with error handling
     * @private
     */
    async function fetchAgentEndpoint(agentId, endpoint) {
        try {
            const response = await api.get(`/ai/agents/${agentId}/${endpoint}`);
            return { ok: true, data: response.data, status: response.status };
        } catch (error) {
            // 404 means agent not installed/available
            if (error.response?.status === 404) {
                return { ok: false, code: 404, available: false };
            }
            // Other errors
            console.warn(`Agent ${agentId} ${endpoint} error:`, error);
            return { ok: false, code: error.response?.status || 500, error };
        }
    }
    
    /**
     * Fetch all data for an agent (status, config, history)
     * @param {string|number} agentId - Agent ID (1-15)
     * @returns {Promise<Object>} Agent data block with availability status
     */
    async function fetchAgentBlock(agentId) {
        console.log(`📥 Fetching agent ${agentId} data...`);
        
        const [status, config, history] = await Promise.all([
            fetchAgentEndpoint(agentId, 'status'),
            fetchAgentEndpoint(agentId, 'config'),
            fetchAgentEndpoint(agentId, 'history')
        ]);
        
        // If all endpoints return 404, agent is not installed
        const all404 = [status, config, history].every(x => x.code === 404);
        
        if (all404) {
            console.log(`⚠️ Agent ${agentId} not installed/available`);
            return {
                agentId,
                available: false,
                installed: false,
                status: null,
                config: null,
                history: []
            };
        }
        
        // Some endpoints work, agent is partially available
        const hasData = status.ok || config.ok || history.ok;
        
        if (!hasData) {
            console.warn(`❌ Agent ${agentId} all endpoints failed`);
            return {
                agentId,
                available: false,
                installed: true,
                error: 'All endpoints failed',
                status: null,
                config: null,
                history: []
            };
        }
        
        console.log(`✅ Agent ${agentId} data loaded`);
        return {
            agentId,
            available: true,
            installed: true,
            status: status.ok ? status.data : null,
            config: config.ok ? config.data : null,
            history: history.ok ? history.data : []
        };
    }
    
    /**
     * Get list of all available agents from backend
     * @returns {Promise<Array>} List of agents with availability status
     */
    async function getAgentsList() {
        try {
            const response = await api.get('/ai/agents');
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch agents list, using default:', error);
            // Fallback: return default agent list
            return Array.from({ length: 15 }, (_, i) => ({
                id: i + 1,
                slug: `agent-${String(i + 1).padStart(2, '0')}`,
                installed: true, // Assume all installed by default
                available: true
            }));
        }
    }
    
    /**
     * Update agent configuration
     * @param {string|number} agentId - Agent ID
     * @param {Object} config - New configuration
     * @returns {Promise<Object>} Update result
     */
    async function updateAgentConfig(agentId, config) {
        try {
            const response = await api.put(`/ai/agents/${agentId}/config`, config);
            console.log(`✅ Agent ${agentId} config updated`);
            return { ok: true, data: response.data };
        } catch (error) {
            console.error(`❌ Agent ${agentId} config update failed:`, error);
            return { ok: false, error: error.response?.data || error.message };
        }
    }
    
    /**
     * Start/Stop agent
     * @param {string|number} agentId - Agent ID
     * @param {boolean} enabled - Enable or disable
     * @returns {Promise<Object>} Result
     */
    async function setAgentEnabled(agentId, enabled) {
        try {
            const response = await api.post(`/ai/agents/${agentId}/${enabled ? 'start' : 'stop'}`);
            console.log(`✅ Agent ${agentId} ${enabled ? 'started' : 'stopped'}`);
            return { ok: true, data: response.data };
        } catch (error) {
            console.error(`❌ Agent ${agentId} ${enabled ? 'start' : 'stop'} failed:`, error);
            return { ok: false, error: error.response?.data || error.message };
        }
    }
    
    /**
     * Execute agent action
     * @param {string|number} agentId - Agent ID
     * @param {string} action - Action name
     * @param {Object} params - Action parameters
     * @returns {Promise<Object>} Action result
     */
    async function executeAgentAction(agentId, action, params = {}) {
        try {
            const response = await api.post(`/ai/agents/${agentId}/actions/${action}`, params);
            console.log(`✅ Agent ${agentId} action ${action} executed`);
            return { ok: true, data: response.data };
        } catch (error) {
            console.error(`❌ Agent ${agentId} action ${action} failed:`, error);
            return { ok: false, error: error.response?.data || error.message };
        }
    }
    
    // Export to window
    window.TITAN_AI_API = {
        fetchAgentBlock,
        getAgentsList,
        updateAgentConfig,
        setAgentEnabled,
        executeAgentAction
    };
    
    console.log('✅ TITAN AI API module loaded');
    
})();
