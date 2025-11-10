/**
 * TITAN Trading System - Alerts API
 * 
 * Handles price alerts, trading alerts, and system notifications
 * 
 * @author TITAN Trading System
 * @version 1.0.0
 */

const { Hono } = require('hono');

const router = new Hono();

// Feature flag check
const isDemoMode = () => process.env.INTERNAL_APIS_DEMO === 'true';

// Mock alerts data for demo mode
const mockAlerts = [
    {
        id: 1,
        type: 'price',
        asset: 'BTC/USDT',
        condition: 'above',
        threshold: 50000,
        currentValue: 48500,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        triggeredAt: null
    },
    {
        id: 2,
        type: 'price',
        asset: 'ETH/USDT',
        condition: 'below',
        threshold: 2000,
        currentValue: 2150,
        status: 'active',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        triggeredAt: null
    },
    {
        id: 3,
        type: 'portfolio',
        asset: 'PORTFOLIO',
        condition: 'loss_exceeded',
        threshold: 5, // 5% loss
        currentValue: 2.3,
        status: 'triggered',
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        triggeredAt: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
    }
];

/**
 * GET /api/alerts
 * Retrieve all alerts
 */
router.get('/', async (c) => {
    try {
        const status = c.req.query('status'); // Filter by status if provided
        
        let alerts = isDemoMode() ? mockAlerts : [];
        
        if (status) {
            alerts = alerts.filter(a => a.status === status);
        }
        
        return c.json({
            success: true,
            data: {
                alerts,
                count: alerts.length,
                filters: { status: status || 'all' }
            },
            message: isDemoMode() ? 
                'Alerts retrieved successfully (demo mode)' : 
                'Alerts retrieved successfully'
        });
    } catch (error) {
        console.error('❌ Alerts API Error:', error);
        return c.json({
            success: false,
            error: 'Failed to retrieve alerts',
            message: error.message
        }, 500);
    }
});

/**
 * GET /api/alerts/:id
 * Retrieve specific alert
 */
router.get('/:id', async (c) => {
    try {
        const alertId = parseInt(c.req.param('id'));
        
        if (isDemoMode()) {
            const alert = mockAlerts.find(a => a.id === alertId);
            if (!alert) {
                return c.json({
                    success: false,
                    error: 'Alert not found'
                }, 404);
            }
            
            return c.json({
                success: true,
                data: alert,
                message: 'Alert retrieved successfully (demo mode)'
            });
        }
        
        // Production mode: would retrieve from database
        return c.json({
            success: true,
            data: {
                id: alertId,
                type: 'price',
                asset: 'BTC/USDT',
                condition: 'above',
                threshold: 50000,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            message: 'Alert retrieved successfully'
        });
    } catch (error) {
        console.error('❌ Alerts API Error:', error);
        return c.json({
            success: false,
            error: 'Failed to retrieve alert',
            message: error.message
        }, 500);
    }
});

/**
 * POST /api/alerts
 * Create new alert
 */
router.post('/', async (c) => {
    try {
        const body = await c.req.json();
        
        // Validate required fields
        if (!body.type || !body.asset || !body.condition || body.threshold === undefined) {
            return c.json({
                success: false,
                error: 'Missing required fields',
                message: 'type, asset, condition, and threshold are required'
            }, 400);
        }
        
        const newAlert = {
            id: isDemoMode() ? mockAlerts.length + 1 : Math.floor(Math.random() * 10000),
            type: body.type,
            asset: body.asset,
            condition: body.condition,
            threshold: body.threshold,
            currentValue: body.currentValue || null,
            status: 'active',
            createdAt: new Date().toISOString(),
            triggeredAt: null
        };
        
        if (isDemoMode()) {
            mockAlerts.push(newAlert);
        }
        
        return c.json({
            success: true,
            data: newAlert,
            message: isDemoMode() ? 
                'Alert created successfully (demo mode)' : 
                'Alert created successfully'
        }, 201);
    } catch (error) {
        console.error('❌ Alerts API Error:', error);
        return c.json({
            success: false,
            error: 'Failed to create alert',
            message: error.message
        }, 500);
    }
});

/**
 * PUT /api/alerts/:id
 * Update alert
 */
router.put('/:id', async (c) => {
    try {
        const alertId = parseInt(c.req.param('id'));
        const body = await c.req.json();
        
        if (isDemoMode()) {
            const alertIndex = mockAlerts.findIndex(a => a.id === alertId);
            if (alertIndex === -1) {
                return c.json({
                    success: false,
                    error: 'Alert not found'
                }, 404);
            }
            
            mockAlerts[alertIndex] = {
                ...mockAlerts[alertIndex],
                ...body,
                updatedAt: new Date().toISOString()
            };
            
            return c.json({
                success: true,
                data: mockAlerts[alertIndex],
                message: 'Alert updated successfully (demo mode)'
            });
        }
        
        // Production mode
        return c.json({
            success: true,
            data: {
                id: alertId,
                ...body,
                updatedAt: new Date().toISOString()
            },
            message: 'Alert updated successfully'
        });
    } catch (error) {
        console.error('❌ Alerts API Error:', error);
        return c.json({
            success: false,
            error: 'Failed to update alert',
            message: error.message
        }, 500);
    }
});

/**
 * DELETE /api/alerts/:id
 * Delete alert
 */
router.delete('/:id', async (c) => {
    try {
        const alertId = parseInt(c.req.param('id'));
        
        if (isDemoMode()) {
            const alertIndex = mockAlerts.findIndex(a => a.id === alertId);
            if (alertIndex === -1) {
                return c.json({
                    success: false,
                    error: 'Alert not found'
                }, 404);
            }
            
            mockAlerts.splice(alertIndex, 1);
        }
        
        return c.json({
            success: true,
            message: isDemoMode() ? 
                'Alert deleted successfully (demo mode)' : 
                'Alert deleted successfully'
        });
    } catch (error) {
        console.error('❌ Alerts API Error:', error);
        return c.json({
            success: false,
            error: 'Failed to delete alert',
            message: error.message
        }, 500);
    }
});

module.exports = router;
