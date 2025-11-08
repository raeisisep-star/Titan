/**
 * TITAN Trading System - AI Agent Loader
 * 
 * Centralized loader for AI agents with ES6 modules support.
 * Implements singleton pattern to prevent duplicate agent initialization.
 * 
 * @author TITAN Trading System
 * @version 1.0.0
 */

// Agent registry (singleton instances)
const agentRegistry = new Map();
const loadingAgents = new Map(); // Track agents currently being loaded

/**
 * Load an agent by ID with singleton pattern
 * @param {string} agentId - Agent identifier (e.g., 'agent-11')
 * @returns {Promise<Object>} - Agent instance
 */
export async function loadAgent(agentId) {
    // Return existing instance if already loaded
    if (agentRegistry.has(agentId)) {
        console.log(`✅ Agent ${agentId} already loaded (singleton)`);
        return agentRegistry.get(agentId);
    }
    
    // Wait if agent is currently being loaded
    if (loadingAgents.has(agentId)) {
        console.log(`⏳ Agent ${agentId} is being loaded, waiting...`);
        return loadingAgents.get(agentId);
    }
    
    // Start loading
    console.log(`📥 Loading agent: ${agentId}`);
    
    const loadPromise = (async () => {
        try {
            let AgentClass;
            
            // Dynamic import based on agent ID
            switch(agentId) {
                case 'agent-11':
                case 'portfolio-optimization':
                    const mod11 = await import('./agent-11-portfolio-optimization.js');
                    AgentClass = mod11.default || mod11.PortfolioOptimizationAgent;
                    break;
                    
                case 'agent-14':
                case 'performance-analytics':
                    const mod14 = await import('./agent-14-performance-analytics.js');
                    AgentClass = mod14.default || mod14.PerformanceAnalyticsAgent;
                    break;
                    
                case 'agent-15':
                case 'system-orchestrator':
                    const mod15 = await import('./agent-15-system-orchestrator.js');
                    AgentClass = mod15.default || mod15.SystemOrchestratorAgent;
                    break;
                    
                default:
                    throw new Error(`Unknown agent ID: ${agentId}`);
            }
            
            // Create instance
            const instance = new AgentClass();
            
            // Register in global registry
            agentRegistry.set(agentId, instance);
            loadingAgents.delete(agentId);
            
            console.log(`✅ Agent ${agentId} loaded successfully`);
            return instance;
            
        } catch (error) {
            loadingAgents.delete(agentId);
            console.error(`❌ Failed to load agent ${agentId}:`, error);
            throw error;
        }
    })();
    
    loadingAgents.set(agentId, loadPromise);
    return loadPromise;
}

/**
 * Get loaded agent instance
 * @param {string} agentId - Agent identifier
 * @returns {Object|null} - Agent instance or null
 */
export function getAgent(agentId) {
    return agentRegistry.get(agentId) || null;
}

/**
 * Get all loaded agents
 * @returns {Map} - Agent registry
 */
export function getAllAgents() {
    return new Map(agentRegistry);
}

/**
 * Check if agent is loaded
 * @param {string} agentId - Agent identifier
 * @returns {boolean}
 */
export function isAgentLoaded(agentId) {
    return agentRegistry.has(agentId);
}

/**
 * Unload agent (for testing/hot reload)
 * @param {string} agentId - Agent identifier
 */
export function unloadAgent(agentId) {
    if (agentRegistry.has(agentId)) {
        const agent = agentRegistry.get(agentId);
        if (agent.cleanup) {
            agent.cleanup();
        }
        agentRegistry.delete(agentId);
        console.log(`🗑️ Agent ${agentId} unloaded`);
    }
}

// Export for global access (backward compatibility)
if (typeof window !== 'undefined') {
    window.TitanAgentLoader = {
        loadAgent,
        getAgent,
        getAllAgents,
        isAgentLoaded,
        unloadAgent
    };
}

export default {
    loadAgent,
    getAgent,
    getAllAgents,
    isAgentLoaded,
    unloadAgent
};
