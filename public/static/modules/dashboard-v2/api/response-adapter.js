/**
 * Response Adapter
 * 🎯 TITAN Platform - API Response Adapter
 * Version: 2.0.0
 * 
 * Adapts server response to dashboard-v2 expected structure
 */

/**
 * Adapt comprehensive dashboard response
 * @param {Object} serverResponse - Response from server
 * @returns {Object} Adapted response for dashboard-v2
 */
export function adaptComprehensiveResponse(serverResponse) {
    if (!serverResponse || !serverResponse.data) {
        throw new Error('Invalid server response');
    }
    
    const { data } = serverResponse;
    
    return {
        success: true,
        data: {
            // Portfolio data (already in correct format)
            portfolio: {
                totalBalance: data.portfolio?.totalBalance || 0,
                availableBalance: data.portfolio?.availableBalance || 0,
                lockedBalance: (data.portfolio?.totalBalance || 0) - (data.portfolio?.availableBalance || 0),
                dailyChange: data.portfolio?.dailyChange || 0,
                dailyChangePercent: data.portfolio?.avgPnLPercentage || 0,
                weeklyChange: data.portfolio?.weeklyChange || 0,
                monthlyChange: data.portfolio?.monthlyChange || 0
            },
            
            // Market data (needs adaptation from snake_case to camelCase)
            market: {
                btcPrice: data.market?.btcPrice || 0,
                btcChange24h: 0, // TODO: Add from server if available
                ethPrice: data.market?.ethPrice || 0,
                ethChange24h: 0, // TODO: Add from server if available
                fearGreedIndex: data.market?.fear_greed_index || 50,
                fearGreedLabel: getFearGreedLabel(data.market?.fear_greed_index || 50),
                btcDominance: data.market?.dominance || 0
            },
            
            // System data (construct from available data)
            system: {
                status: 'operational',
                uptime: 0, // TODO: Add from server if available
                activeConnections: 0, // TODO: Add from server if available
                apiHealth: true,
                redisHealth: true,
                dbHealth: true
            },
            
            // Chart data (adapt from charts.performance)
            chartData: {
                labels: data.charts?.performance?.labels || [],
                datasets: data.charts?.performance?.datasets || []
            },
            
            // AI Agents data (already in correct format)
            aiAgents: (data.aiAgents || []).map(agent => ({
                id: agent.id,
                name: agent.name,
                status: agent.status,
                accuracy: agent.performance || 0,
                totalTrades: agent.trades || 0,
                successRate: agent.uptime || 0,
                lastActive: new Date().toISOString(), // TODO: Add from server if available
                description: agent.specialty || ''
            })),
            
            // Trades/Activities
            trades: (data.activities || []).map(activity => ({
                id: activity.id,
                symbol: activity.description?.split(' ')[1] || '',
                side: activity.description?.split(' ')[0] || '',
                price: 0,
                quantity: 0,
                timestamp: activity.timestamp
            }))
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Get Fear & Greed label from index value
 * @param {number} index - Fear & Greed Index (0-100)
 * @returns {string} Label in Persian
 */
function getFearGreedLabel(index) {
    if (index <= 25) return 'ترس شدید';
    if (index <= 45) return 'ترس';
    if (index <= 55) return 'خنثی';
    if (index <= 75) return 'طمع';
    return 'طمع شدید';
}

export default {
    adaptComprehensiveResponse
};
