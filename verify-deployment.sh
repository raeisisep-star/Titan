#!/bin/bash
# AI Tab Integration - Automated Verification Script
# Run this after server restart and cache purge

set -e

echo "🔍 AI Tab Integration - Deployment Verification"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected HTTP $expected_code, got $http_code)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to check JSON field
check_json_field() {
    local json=$1
    local field=$2
    local expected=$3
    local name=$4
    
    echo -n "  Checking $name... "
    
    actual=$(echo "$json" | jq -r ".$field" 2>/dev/null)
    
    if [ "$actual" = "$expected" ]; then
        echo -e "${GREEN}✅ $actual${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ Expected: $expected, Got: $actual${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "📡 Testing Backend Endpoints"
echo "----------------------------"

# Test Agent 5 - Status
if test_endpoint "Agent 5 Status" "https://zala.ir/api/ai/agents/5/status" "200"; then
    response=$(curl -s "https://zala.ir/api/ai/agents/5/status")
    check_json_field "$response" "agentId" "agent-05" "agentId"
    check_json_field "$response" "available" "false" "available"
fi

# Test Agent 5 - Config
test_endpoint "Agent 5 Config" "https://zala.ir/api/ai/agents/5/config" "200"

# Test Agent 5 - History
test_endpoint "Agent 5 History" "https://zala.ir/api/ai/agents/5/history" "200"

# Test Agent 6
test_endpoint "Agent 6 Status" "https://zala.ir/api/ai/agents/6/status" "200"

# Test Agent 1 (should have enhanced data)
if test_endpoint "Agent 1 Status" "https://zala.ir/api/ai/agents/1/status" "200"; then
    response=$(curl -s "https://zala.ir/api/ai/agents/1/status")
    check_json_field "$response" "available" "true" "available"
    check_json_field "$response" "status" "active" "status"
fi

# Test Health Check
if test_endpoint "Health Check" "https://zala.ir/api/ai/agents/health" "200"; then
    response=$(curl -s "https://zala.ir/api/ai/agents/health")
    check_json_field "$response" "status" "ok" "status"
fi

echo ""
echo "📊 Test Summary"
echo "---------------"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Hard refresh browser (Ctrl+Shift+R)"
    echo "2. Check console for expected logs"
    echo "3. Test agents in UI (Settings → AI)"
    echo "4. Capture screenshots"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if server is running: ps aux | grep node"
    echo "2. Check server logs: tail -f server.log"
    echo "3. Verify code was pulled: git log --oneline -3"
    echo "4. Test locally: curl http://localhost:4000/api/ai/agents/health"
    exit 1
fi
