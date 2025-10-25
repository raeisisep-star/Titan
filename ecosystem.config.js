module.exports = {
  apps: [
    {
      name: 'titan-backend',
      script: './server-real-v3.js',
      instances: 2, // چند instance برای load balancing
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M', // Task-1: کاهش از 1G به 512M برای بهبود مدیریت حافظه
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Task-1: مسیرهای لاگ به /home/ubuntu/logs/titan منتقل شد
      error_file: '/home/ubuntu/logs/titan/err.log',
      out_file: '/home/ubuntu/logs/titan/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Task-1: فعال‌سازی Log Rotation
      log_type: 'json',
      max_size: '10M', // حداکثر سایز هر فایل لاگ
      retain: 30, // نگهداری 30 فایل لاگ آرشیوی
      compress: true, // فشرده‌سازی لاگ‌های قدیمی
      dateFormat: 'YYYY-MM-DD_HH-mm-ss',
      rotateInterval: '0 0 * * *', // روتیشن روزانه در نیمه‌شب
      rotateModule: true,
      
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
