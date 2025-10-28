module.exports = {
  apps: [
    {
      name: 'titan-backend',
      script: './server-real-v3.js',
      instances: 2, // چند instance برای load balancing
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        JWT_SECRET: process.env.JWT_SECRET,
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'reconciler',
      script: './workers/reconciler.js',
      instances: 1, // Single instance for reconciliation worker
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        RECONCILIATION_INTERVAL_MS: 45000, // 45 seconds
        RECONCILIATION_STALE_MINUTES: 5, // Orders not synced in 5+ minutes
        RECONCILIATION_BATCH_SIZE: 200
      },
      error_file: './logs/reconciler-error.log',
      out_file: './logs/reconciler-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s'
    }
  ]
};
