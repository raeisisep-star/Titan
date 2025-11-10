// Trading Mode Management Routes
// Manage demo/live trading mode

const express = require('express');
const router = express.Router();

// Trading mode state (in-memory for now, should be in DB for production)
let tradingMode = process.env.TRADING_MODE || 'demo';

/**
 * GET /api/mode
 * Get current trading mode
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    mode: tradingMode,
    timestamp: Date.now()
  });
});

/**
 * PUT /api/mode
 * Update trading mode (admin only)
 * Body: { mode: 'demo' | 'live' }
 */
router.put('/', (req, res) => {
  const { mode } = req.body;
  
  if (!mode || !['demo', 'live'].includes(mode)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid mode. Must be "demo" or "live"'
    });
  }

  const previousMode = tradingMode;
  tradingMode = mode;
  
  console.log(`🔄 Trading mode changed: ${previousMode} → ${mode}`);
  
  res.json({
    success: true,
    mode: tradingMode,
    previousMode,
    timestamp: Date.now()
  });
});

module.exports = router;
