/**
 * TITAN Trading System - Mode API
 * 
 * Handles test/production mode toggling (staging only)
 * 
 * @author TITAN Trading System
 * @version 1.0.0
 */

const { Hono } = require('hono');

const router = new Hono();

// Feature flag check - test mode is only available in demo/staging
const isTestModeEnabled = () => process.env.INTERNAL_APIS_DEMO === 'true';

// In-memory state for test mode (would be in DB in production)
let currentTestMode = false;

/**
 * GET /api/mode/test
 * Get current test mode status
 */
router.get('/test', async (c) => {
    try {
        if (!isTestModeEnabled()) {
            return c.json({
                success: false,
                error: 'Test mode API is disabled in production',
                message: 'This endpoint is only available in staging/development environments'
            }, 403);
        }
        
        return c.json({
            success: true,
            data: {
                testMode: currentTestMode,
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            },
            message: 'Test mode status retrieved successfully'
        });
    } catch (error) {
        console.error('❌ Mode API Error:', error);
        return c.json({
            success: false,
            error: 'Failed to retrieve test mode status',
            message: error.message
        }, 500);
    }
});

/**
 * POST /api/mode/test
 * Toggle test mode (staging only)
 */
router.post('/test', async (c) => {
    try {
        if (!isTestModeEnabled()) {
            return c.json({
                success: false,
                error: 'Test mode API is disabled in production',
                message: 'This endpoint is only available in staging/development environments'
            }, 403);
        }
        
        const body = await c.req.json();
        
        // Validate input
        if (typeof body.testMode !== 'boolean') {
            return c.json({
                success: false,
                error: 'Invalid input',
                message: 'testMode must be a boolean value'
            }, 400);
        }
        
        // Update test mode
        const previousMode = currentTestMode;
        currentTestMode = body.testMode;
        
        console.log(`⚙️ Test mode changed: ${previousMode} → ${currentTestMode}`);
        
        return c.json({
            success: true,
            data: {
                testMode: currentTestMode,
                previousMode,
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            },
            message: `Test mode ${currentTestMode ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        console.error('❌ Mode API Error:', error);
        return c.json({
            success: false,
            error: 'Failed to update test mode',
            message: error.message
        }, 500);
    }
});

module.exports = router;
