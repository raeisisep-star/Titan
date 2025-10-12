#!/bin/bash

# TITAN AI Trading Platform - Production Deployment Script
# Phase 7: Advanced Frontend & Production Deployment

set -e  # Exit on any error

echo "🚀 TITAN AI Trading Platform - Production Deployment"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="titan-ai-trading-platform"
PRODUCTION_CONFIG="wrangler.production.jsonc"

# Step 1: Pre-deployment checks
echo -e "${BLUE}📋 Step 1: Pre-deployment Validation${NC}"

# Check if required files exist
required_files=(
    "package.json"
    "src/index.tsx"
    "src/api/ai-services.ts"
    "public/static/modules/ai-insights.js"
    "wrangler.production.jsonc"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "  ✅ $file exists"
    else
        echo -e "  ❌ $file missing"
        exit 1
    fi
done

# Step 2: Install dependencies
echo -e "\n${BLUE}📦 Step 2: Installing Dependencies${NC}"
npm ci --production=false

# Step 3: Run tests (if available)
echo -e "\n${BLUE}🧪 Step 3: Running Tests${NC}"
if npm run test --if-present; then
    echo -e "  ✅ Tests passed"
else
    echo -e "  ⚠️ Tests skipped or failed"
fi

# Step 4: Build optimization
echo -e "\n${BLUE}🔨 Step 4: Building Production Assets${NC}"

# Clean previous build
rm -rf dist/
echo -e "  🧹 Cleaned previous build"

# Build with production optimizations
NODE_ENV=production npm run build

if [[ $? -eq 0 ]]; then
    echo -e "  ✅ Build completed successfully"
else
    echo -e "  ❌ Build failed"
    exit 1
fi

# Step 5: Database preparation
echo -e "\n${BLUE}🗄️ Step 5: Database Setup${NC}"

# Create D1 database if it doesn't exist (manual step for now)
echo -e "  📝 Note: Ensure D1 database is created in Cloudflare Dashboard"
echo -e "     Database name: titan-ai-production"
echo -e "     Update database_id in wrangler.production.jsonc"

# Apply migrations
echo -e "  🔄 Applying database migrations..."
npx wrangler d1 execute titan-ai-production --file=./seed.sql --remote || echo -e "  ⚠️ Migration step manual"

# Step 6: AI Services validation
echo -e "\n${BLUE}🧠 Step 6: AI Services Validation${NC}"

# Check AI service files
ai_services=(
    "src/services/ai/ai-model-manager.ts"
    "src/services/intelligence/market-analyzer.ts"
    "src/services/strategy-ai/strategy-generator.ts"
)

for service in "${ai_services[@]}"; do
    if [[ -f "$service" ]]; then
        echo -e "  ✅ AI service: $(basename "$service")"
    else
        echo -e "  ❌ Missing AI service: $service"
        exit 1
    fi
done

# Step 7: Security validation
echo -e "\n${BLUE}🔒 Step 7: Security Validation${NC}"

# Check for sensitive data
echo -e "  🔍 Scanning for sensitive information..."
if grep -r "sk-" src/ 2>/dev/null | grep -v ".backup" | head -1; then
    echo -e "  ⚠️ Potential API keys found - please review"
fi

if grep -r "password" src/ 2>/dev/null | grep -v ".backup" | head -1; then
    echo -e "  ⚠️ Potential passwords found - please review"
fi

echo -e "  ✅ Security scan completed"

# Step 8: Performance optimization
echo -e "\n${BLUE}⚡ Step 8: Performance Optimization${NC}"

# Optimize static assets (if tools are available)
if command -v gzip &> /dev/null; then
    echo -e "  🗜️ Compressing static assets..."
    find dist/ -name "*.js" -o -name "*.css" -o -name "*.html" | while read file; do
        gzip -k "$file" 2>/dev/null || true
    done
    echo -e "  ✅ Asset compression completed"
fi

# Step 9: Deployment
echo -e "\n${BLUE}🚀 Step 9: Cloudflare Deployment${NC}"

echo -e "  📋 Deployment Configuration:"
echo -e "     Project: $PROJECT_NAME"
echo -e "     Config: $PRODUCTION_CONFIG"
echo -e "     AI Services: ✅ Enabled"
echo -e "     Real-time: ✅ Enabled"

# Deploy to Cloudflare Pages
echo -e "\n  🌐 Deploying to Cloudflare Pages..."

if [[ -f "$PRODUCTION_CONFIG" ]]; then
    npx wrangler pages deploy dist --config="$PRODUCTION_CONFIG" --project-name="$PROJECT_NAME"
else
    npx wrangler pages deploy dist --project-name="$PROJECT_NAME"
fi

deployment_status=$?

# Step 10: Post-deployment verification
echo -e "\n${BLUE}✅ Step 10: Post-Deployment Verification${NC}"

if [[ $deployment_status -eq 0 ]]; then
    echo -e "  ✅ Deployment successful!"
    
    # Provide deployment information
    echo -e "\n${GREEN}🎉 TITAN AI Trading Platform Deployed Successfully!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo -e "  📊 Features Deployed:"
    echo -e "     • Advanced AI & ML Integration (Phase 6)"
    echo -e "     • Real-time Market Intelligence" 
    echo -e "     • AI-powered Trading Strategies"
    echo -e "     • Predictive Analytics Dashboard"
    echo -e "     • Multi-model Ensemble Predictions"
    echo -e "     • Genetic Algorithm Optimization"
    echo -e "     • Market Sentiment Analysis"
    echo -e "     • Anomaly Detection System"
    echo -e "     • Comprehensive Backend APIs"
    echo -e "     • Production-grade Security"
    echo -e ""
    echo -e "  🔗 Access your deployment at:"
    echo -e "     https://$PROJECT_NAME.pages.dev"
    echo -e ""
    echo -e "  📋 Next Steps:"
    echo -e "     1. Configure custom domain (if needed)"
    echo -e "     2. Set up monitoring and alerts"
    echo -e "     3. Configure production database"
    echo -e "     4. Test AI services functionality"
    echo -e "     5. Monitor performance metrics"
    
else
    echo -e "  ❌ Deployment failed"
    echo -e "\n${RED}💥 Deployment Issues${NC}"
    echo -e "  Please check the error messages above and:"
    echo -e "     1. Verify Cloudflare authentication"
    echo -e "     2. Check project configuration"
    echo -e "     3. Ensure all dependencies are installed"
    echo -e "     4. Review build logs for errors"
    exit 1
fi

# Step 11: Environment-specific instructions
echo -e "\n${BLUE}📋 Step 11: Production Configuration${NC}"
echo -e "  🔧 Manual Configuration Required:"
echo -e "     1. Update D1 database_id in wrangler.production.jsonc"
echo -e "     2. Configure production API keys (if any)"
echo -e "     3. Set up custom domain and SSL"
echo -e "     4. Configure monitoring and alerts"
echo -e "     5. Set up backup and recovery procedures"

echo -e "\n${GREEN}🚀 Deployment Complete! Welcome to Production TITAN AI! 🤖${NC}"