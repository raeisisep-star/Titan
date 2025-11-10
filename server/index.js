#!/usr/bin/env node
/**
 * TITAN Market Data API Server
 * Express server for MEXC public market data
 * No KYC required - Public endpoints only
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const marketRoutes = require('./routes/market');
const modeRoutes = require('./routes/mode');
const healthRoutes = require('./routes/health');

// Import middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.MARKET_API_PORT || 5001;

// =============================================================================
// MIDDLEWARE
// =============================================================================

// CORS - Allow all origins in development
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// =============================================================================
// ROUTES
// =============================================================================

// Health check (root)
app.get('/', (req, res) => {
  res.json({
    service: 'TITAN Market Data API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      market: '/api/market/*',
      mode: '/api/mode'
    }
  });
});

// Mount routes
app.use('/api/health', healthRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/mode', modeRoutes);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =============================================================================
// SERVER START
// =============================================================================

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('💤 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('💤 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ============================================');
  console.log('🚀 TITAN Market Data API Server');
  console.log('🚀 ============================================');
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🚀 MEXC API: ${process.env.MEXC_BASE_URL || 'https://api.mexc.com'}`);
  console.log('🚀 ============================================');
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Market: http://localhost:${PORT}/api/market/*`);
  console.log('🚀 ============================================');
});

module.exports = app;
