// Health Check Routes
// System health and status endpoints

const express = require('express');
const router = express.Router();
const mexc = require('../services/exchange/mexc');
const cache = require('../services/cache');

// Server start time
const startTime = Date.now();

/**
 * GET /api/health
 * Basic health check
 */
router.get('/', (req, res) => {
  const uptime = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptime / 1000);
  
  res.json({
    status: 'ok',
    uptime: {
      ms: uptime,
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds)
    },
    timestamp: Date.now(),
    version: process.env.npm_package_version || '3.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check with external service status
 */
router.get('/detailed', async (req, res) => {
  const uptime = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptime / 1000);
  
  // Test MEXC API connection
  let mexcStatus = 'unknown';
  let mexcLatency = null;
  
  try {
    const startTest = Date.now();
    await mexc.getPrice('BTCUSDT');
    mexcLatency = Date.now() - startTest;
    mexcStatus = 'connected';
  } catch (error) {
    mexcStatus = 'error';
    console.error('MEXC health check failed:', error.message);
  }
  
  // Cache statistics
  const cacheStats = cache.stats();
  
  res.json({
    status: 'ok',
    uptime: {
      ms: uptime,
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds)
    },
    services: {
      mexc: {
        status: mexcStatus,
        latency: mexcLatency
      },
      cache: {
        status: 'ok',
        size: cacheStats.size,
        keys: cacheStats.keys.length
      }
    },
    system: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      cpu: process.cpuUsage()
    },
    timestamp: Date.now(),
    version: process.env.npm_package_version || '3.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = router;
