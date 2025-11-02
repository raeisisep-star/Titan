/**
 * PM2 Ecosystem Configuration - Example Template
 * 
 * Copy this file to ecosystem.config.js and customize for your server
 * On production server, point env_file to /etc/titan/.env.prod
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload titan-backend
 */

// Load environment variables from secure location
// On production server: require('dotenv').config({ path: '/etc/titan/.env.prod' });
require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'titan-backend',
      script: 'npm',
      args: 'run start',
      instances: 2,
      exec_mode: 'cluster',
      
      // Environment variables (loaded from .env or /etc/titan/.env.prod)
      env: process.env,
      
      // Production-specific settings
      node_args: '--max-old-space-size=2048',
      max_memory_restart: '500M',
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart settings
      watch: false,
      autorestart: true,
      
      // Kill timeout
      kill_timeout: 5000,
      
      // Wait for app to be ready
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
