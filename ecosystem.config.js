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
        JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production-2024',
        REDIS_URL: 'redis://localhost:6379'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
