#!/bin/bash

#########################################
# TITAN Frontend Manual Deployment
# این اسکریپت دستورات لازم را نمایش می‌دهد
#########################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}"
echo "========================================="
echo "🚀 TITAN Frontend Deployment"
echo "========================================="
echo -e "${NC}"

PROJECT_DIR="/tmp/webapp/Titan"

# Verify we're in the right place
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Error: Directory $PROJECT_DIR not found!${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

echo -e "${GREEN}✅ همه فایل‌ها آماده هستند:${NC}"
echo ""
ls -lh public/index.html nginx-titan-updated.conf public/config.js 2>/dev/null || {
    echo -e "${RED}❌ برخی فایل‌ها یافت نشدند!${NC}"
    exit 1
}

echo ""
echo -e "${BLUE}📊 آمار فایل‌ها:${NC}"
echo "  • Index HTML: $(wc -c < public/index.html | numfmt --to=iec-i --suffix=B)"
echo "  • Static files: $(find public/static -type f | wc -l) فایل"
echo "  • Modules: $(find public/static/modules -name '*.js' 2>/dev/null | wc -l) فایل JS"
echo ""

echo -e "${CYAN}=========================================${NC}"
echo -e "${YELLOW}⚠️  این اسکریپت نیاز به sudo دارد${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

echo -e "${GREEN}گزینه 1: اجرای خودکار (با sudo)${NC}"
echo -e "${YELLOW}---${NC}"
echo "اگر می‌خواهید من همه کارها را انجام دهم، این دستور را اجرا کنید:"
echo ""
echo -e "${CYAN}    cd $PROJECT_DIR && ./deploy-frontend.sh${NC}"
echo ""

echo -e "${GREEN}گزینه 2: اجرای دستی (مرحله به مرحله)${NC}"
echo -e "${YELLOW}---${NC}"
echo "اگر می‌خواهید خودتان هر مرحله را اجرا کنید:"
echo ""

echo -e "${BLUE}مرحله 1: Backup${NC}"
echo -e "${CYAN}sudo cp /etc/nginx/sites-available/titan /etc/nginx/sites-available/titan.backup.\$(date +%Y%m%d_%H%M%S)${NC}"
echo ""

echo -e "${BLUE}مرحله 2: Deploy Config${NC}"
echo -e "${CYAN}sudo cp $PROJECT_DIR/nginx-titan-updated.conf /etc/nginx/sites-available/titan${NC}"
echo ""

echo -e "${BLUE}مرحله 3: Test Config${NC}"
echo -e "${CYAN}sudo nginx -t${NC}"
echo ""

echo -e "${BLUE}مرحله 4: Reload Nginx${NC}"
echo -e "${CYAN}sudo systemctl reload nginx${NC}"
echo ""

echo -e "${GREEN}گزینه 3: دستور تک‌خطی (همه مراحل)${NC}"
echo -e "${YELLOW}---${NC}"
echo -e "${CYAN}cd $PROJECT_DIR && sudo cp /etc/nginx/sites-available/titan /etc/nginx/sites-available/titan.backup.\$(date +%Y%m%d_%H%M%S) && sudo cp nginx-titan-updated.conf /etc/nginx/sites-available/titan && sudo nginx -t && sudo systemctl reload nginx && echo '✅ Done!'${NC}"
echo ""

echo -e "${CYAN}=========================================${NC}"
echo -e "${GREEN}📖 مستندات کامل:${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""
echo "برای مشاهده دستورالعمل کامل:"
echo -e "${CYAN}    cat $PROJECT_DIR/DEPLOYMENT_INSTRUCTIONS.md${NC}"
echo ""
echo "یا در browser باز کنید:"
echo -e "${CYAN}    less $PROJECT_DIR/DEPLOYMENT_INSTRUCTIONS.md${NC}"
echo ""

echo -e "${CYAN}=========================================${NC}"
echo -e "${YELLOW}🔍 بررسی وضعیت فعلی:${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

echo -e "${BLUE}Backend Status:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 list | grep titan-backend || echo "  ⚠️  PM2 process not found"
else
    echo "  ⚠️  PM2 not installed"
fi
echo ""

echo -e "${BLUE}Nginx Config (current):${NC}"
if [ -f /etc/nginx/sites-available/titan ]; then
    echo -n "  Current root: "
    grep "root /tmp/webapp/Titan" /etc/nginx/sites-available/titan | head -1 | awk '{print $2}' | sed 's/;$//'
else
    echo "  ⚠️  Config file not found"
fi
echo ""

echo -e "${BLUE}Nginx Status:${NC}"
systemctl is-active nginx &>/dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
echo ""

echo -e "${CYAN}=========================================${NC}"
echo -e "${GREEN}✨ انتخاب کنید:${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""
echo "1️⃣  برای اجرای خودکار: ./deploy-frontend.sh"
echo "2️⃣  برای اجرای دستی: دستورات بالا را کپی کنید"
echo "3️⃣  برای مشاهده مستندات: cat DEPLOYMENT_INSTRUCTIONS.md"
echo ""

echo -e "${YELLOW}آماده‌اید؟ [y/N]${NC} "
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 شروع deployment...${NC}"
    echo ""
    
    # Try to run with sudo
    if command -v sudo &> /dev/null; then
        exec ./deploy-frontend.sh
    else
        echo -e "${RED}❌ sudo not available. Please run commands manually.${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${BLUE}👍 بسیار خب! وقتی آماده بودید، دستورات بالا را اجرا کنید.${NC}"
    echo ""
fi
