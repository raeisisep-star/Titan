#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# 🚀 TITAN Frontend Deployment - کپی و اجرا کنید!
# ═══════════════════════════════════════════════════════════════════

cd /tmp/webapp/Titan && \
sudo cp /etc/nginx/sites-available/titan /etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S) && \
sudo cp nginx-titan-updated.conf /etc/nginx/sites-available/titan && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "" && \
echo "╔═══════════════════════════════════════════════════════════╗" && \
echo "║                                                           ║" && \
echo "║         ✅ Deployment موفقیت آمیز بود!                  ║" && \
echo "║                                                           ║" && \
echo "╚═══════════════════════════════════════════════════════════╝" && \
echo "" && \
echo "🌐 برای مشاهده برنامه:" && \
echo "   https://www.zala.ir" && \
echo "" && \
echo "📱 باید صفحه Login تایتان (🚀) را ببینید!" && \
echo ""
