/**
 * PM2 Production Configuration for TITAN Trading System
 * Loads secrets from /etc/titan/.env.prod via dotenv
 */

// Load environment variables from secure location
require('dotenv').config({ path: '/etc/titan/.env.prod' });

module.exports = {
  apps: [{
    name: 'titan-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    
    // Auto-restart configuration
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    
    // Logging
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Advanced options
    kill_timeout: 5000,
    listen_timeout: 3000,
    autorestart: true,
    watch: false,
  }]
};
