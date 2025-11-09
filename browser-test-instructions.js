// Browser Console Testing Script
// Copy and paste this into browser console after hard refresh (Ctrl+Shift+R)

console.log('🧪 AI Tab Integration - Browser Test Suite');
console.log('==========================================\n');

// Test 1: Check if patch flag exists
console.log('Test 1: Checking window.__AI_TAB_PATCHED__ flag...');
if (typeof window.__AI_TAB_PATCHED__ === 'boolean') {
    if (window.__AI_TAB_PATCHED__ === true) {
        console.log('✅ PASS: window.__AI_TAB_PATCHED__ === true');
    } else {
        console.error('❌ FAIL: window.__AI_TAB_PATCHED__ === false (patches not applied yet)');
        console.log('   Note: Wait a few seconds and try again');
    }
} else {
    console.error('❌ FAIL: window.__AI_TAB_PATCHED__ is not defined');
    console.log('   Troubleshooting:');
    console.log('   1. Hard refresh: Ctrl+Shift+R');
    console.log('   2. Check if ai-tab-integration.js loaded');
    console.log('   3. Look for console logs above');
}

console.log('\n');

// Test 2: Check TITAN_AI_API
console.log('Test 2: Checking TITAN_AI_API...');
if (typeof window.TITAN_AI_API === 'object') {
    console.log('✅ PASS: window.TITAN_AI_API exists');
    
    if (typeof window.TITAN_AI_API.fetchAgentBlock === 'function') {
        console.log('✅ PASS: fetchAgentBlock() method exists');
    } else {
        console.error('❌ FAIL: fetchAgentBlock() method not found');
    }
} else {
    console.error('❌ FAIL: window.TITAN_AI_API not found');
}

console.log('\n');

// Test 3: Check TITAN_AI_ADAPTERS
console.log('Test 3: Checking TITAN_AI_ADAPTERS...');
if (typeof window.TITAN_AI_ADAPTERS === 'object') {
    console.log('✅ PASS: window.TITAN_AI_ADAPTERS exists');
    
    const methods = ['adaptAgentStatus', 'safeRender', 'safeFormatNumber', 'safeFormatPercent'];
    methods.forEach(method => {
        if (typeof window.TITAN_AI_ADAPTERS[method] === 'function') {
            console.log(`✅ PASS: ${method}() exists`);
        } else {
            console.error(`❌ FAIL: ${method}() not found`);
        }
    });
} else {
    console.error('❌ FAIL: window.TITAN_AI_ADAPTERS not found');
}

console.log('\n');

// Test 4: Check aiTabInstance (may not be loaded yet)
console.log('Test 4: Checking aiTabInstance...');
if (typeof window.aiTabInstance === 'object' && window.aiTabInstance !== null) {
    console.log('✅ PASS: window.aiTabInstance exists');
    
    // Test 4a: Check Coming Soon method
    if (typeof window.aiTabInstance.showAgent05Details === 'function') {
        const methodStr = window.aiTabInstance.showAgent05Details.toString();
        if (methodStr.includes('Coming Soon')) {
            console.log('✅ PASS: showAgent05Details includes "Coming Soon"');
        } else {
            console.error('❌ FAIL: showAgent05Details does not include "Coming Soon"');
        }
    } else {
        console.error('❌ FAIL: showAgent05Details method not found');
    }
    
    // Test 4b: Check loadAIData override
    if (typeof window.aiTabInstance.loadAIData === 'function') {
        const methodStr = window.aiTabInstance.loadAIData.toString();
        if (methodStr.includes('TITAN_AI_API')) {
            console.log('✅ PASS: loadAIData includes "TITAN_AI_API"');
        } else {
            console.error('❌ FAIL: loadAIData does not include "TITAN_AI_API"');
        }
    } else {
        console.error('❌ FAIL: loadAIData method not found');
    }
} else {
    console.warn('⚠️  WAIT: window.aiTabInstance not loaded yet');
    console.log('   Note: Navigate to Settings → AI tab and try again');
}

console.log('\n');

// Test 5: API Tests
console.log('Test 5: API Tests (async)...');
console.log('Running fetchAgentBlock tests...\n');

(async () => {
    try {
        // Test Agent 1 (should be available)
        console.log('Testing Agent 1 (should have data)...');
        const agent1 = await window.TITAN_AI_API.fetchAgentBlock(1);
        
        if (agent1.available === true) {
            console.log('✅ PASS: Agent 1 available === true');
            console.log('   Data:', agent1);
        } else {
            console.error('❌ FAIL: Agent 1 available === false');
        }
        
        console.log('\n');
        
        // Test Agent 5 (should NOT be available)
        console.log('Testing Agent 5 (should show as unavailable)...');
        const agent5 = await window.TITAN_AI_API.fetchAgentBlock(5);
        
        if (agent5.available === false) {
            console.log('✅ PASS: Agent 5 available === false');
            console.log('   Data:', agent5);
        } else {
            console.error('❌ FAIL: Agent 5 available === true (should be false)');
        }
        
        console.log('\n');
        console.log('✅ API tests complete!');
        
    } catch (error) {
        console.error('❌ API test error:', error);
    }
})();

console.log('\n');
console.log('📋 Manual UI Tests:');
console.log('------------------');
console.log('1. Navigate to: Settings → AI tab');
console.log('2. Click Agent 01 → Should show technical data');
console.log('3. Click Agent 05 → Should show "🚧 Coming Soon" modal');
console.log('4. Check Network tab → No 404 errors');
console.log('\n');
console.log('✅ If all tests pass, capture screenshots!');
