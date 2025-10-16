#!/bin/bash
# کپی کنید و در terminal سرور خود paste کنید

cd /tmp/webapp/Titan
sudo cp /etc/nginx/sites-available/titan /etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S)
sudo cp nginx-titan-updated.conf /etc/nginx/sites-available/titan
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Done! Open https://www.zala.ir"
