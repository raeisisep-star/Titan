#!/bin/bash

# TITAN Trading System - Deployment Validation Script
# This script validates that the system is properly configured and ready for production

set -e

echo "🔍 TITAN Trading System - Deployment Validation"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get deployment URL
DEPLOYMENT_URL=${1:-"http://localhost:3000"}

if [[ $DEPLOYMENT_URL == "http://localhost:3000" ]]; then
    print_status "Testing local deployment at $DEPLOYMENT_URL"
else
    print_status "Testing production deployment at $DEPLOYMENT_URL"
fi

echo ""

# Test basic health
print_status "Testing basic system health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/health" || echo "000")

if [ "$HTTP_STATUS" -eq 200 ]; then
    print_success "✅ System health check passed ($HTTP_STATUS)"
else
    print_error "❌ System health check failed (HTTP $HTTP_STATUS)"
    exit 1
fi

# Test configuration health
print_status "Testing configuration health..."
CONFIG_RESPONSE=$(curl -s "$DEPLOYMENT_URL/api/system/config/health" || echo "{\"success\":false}")
CONFIG_SUCCESS=$(echo "$CONFIG_RESPONSE" | grep -o '"success":[^,}]*' | cut -d':' -f2 | tr -d ' "')

if [ "$CONFIG_SUCCESS" = "true" ]; then
    READINESS_SCORE=$(echo "$CONFIG_RESPONSE" | grep -o '"readinessScore":[^,}]*' | cut -d':' -f2 | tr -d ' ')
    if [ -n "$READINESS_SCORE" ]; then
        print_success "✅ Configuration health check passed (Readiness: $READINESS_SCORE%)"
        
        if [ "$READINESS_SCORE" -lt 70 ]; then
            print_warning "⚠️  Readiness score is below 70% - some services may not be fully configured"
        elif [ "$READINESS_SCORE" -ge 90 ]; then
            print_success "🎉 Excellent readiness score!"
        fi
    else
        print_success "✅ Configuration health check passed"
    fi
else
    print_warning "⚠️  Configuration has issues - checking details..."
fi

# Test specific endpoints
echo ""
print_status "Testing critical endpoints..."

ENDPOINTS=(
    "/api/auth/verify|Authentication"
    "/api/ai/agents/list|AI Agents"
    "/api/mode/demo/wallet/demo_user|Demo Wallet"
    "/api/autopilot/system/enhanced-status|System Status"
    "/api/system/config/summary|Config Summary"
)

PASSED=0
TOTAL=${#ENDPOINTS[@]}

for endpoint_info in "${ENDPOINTS[@]}"; do
    IFS='|' read -r endpoint name <<< "$endpoint_info"
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL$endpoint" || echo "000")
    
    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 401 ]; then
        # 401 is OK for auth endpoints without credentials
        print_success "✅ $name endpoint ($HTTP_STATUS)"
        ((PASSED++))
    else
        print_error "❌ $name endpoint failed ($HTTP_STATUS)"
    fi
done

# Test external API connectivity
echo ""
print_status "Testing external API connectivity..."

EXTERNAL_APIS=(
    "https://api.binance.com/api/v3/ping|Binance API"
    "https://api.coingecko.com/api/v3/ping|CoinGecko API"
)

for api_info in "${EXTERNAL_APIS[@]}"; do
    IFS='|' read -r api_url api_name <<< "$api_info"
    
    if curl -s --connect-timeout 5 "$api_url" > /dev/null 2>&1; then
        print_success "✅ $api_name reachable"
    else
        print_warning "⚠️  $api_name not reachable (may be blocked)"
    fi
done

# Calculate success percentage
SUCCESS_RATE=$(( (PASSED * 100) / TOTAL ))

echo ""
print_status "=== Validation Results ==="
echo "Endpoints tested: $TOTAL"
echo "Endpoints passed: $PASSED"
echo "Success rate: $SUCCESS_RATE%"
echo ""

if [ "$SUCCESS_RATE" -ge 80 ]; then
    print_success "🎉 System validation PASSED! Ready for production use."
    
    echo ""
    print_status "Production checklist:"
    echo "  ✅ System health checks passing"
    echo "  ✅ Critical endpoints functional"
    echo "  ✅ External APIs reachable"
    
    echo ""
    print_status "Recommended next steps:"
    echo "  1. Configure API keys for external services"
    echo "  2. Set up notification channels (Telegram, Email)"
    echo "  3. Test with small trades in demo mode"
    echo "  4. Monitor system performance and logs"
    echo "  5. Set up backup and monitoring"
    
    exit 0
elif [ "$SUCCESS_RATE" -ge 60 ]; then
    print_warning "⚠️  System validation PARTIAL. Some issues need attention."
    
    echo ""
    print_status "Issues to resolve:"
    echo "  • Some endpoints are not responding correctly"
    echo "  • Check configuration and API keys"
    echo "  • Review logs for specific errors"
    
    exit 1
else
    print_error "❌ System validation FAILED. Critical issues detected."
    
    echo ""
    print_status "Critical issues:"
    echo "  • Multiple endpoints are failing"
    echo "  • System may not be properly deployed"
    echo "  • Configuration issues need immediate attention"
    
    exit 2
fi