#!/usr/bin/env node
// API Analysis Script - Frontend vs Backend matching

const fs = require('fs');
const path = require('path');

// Function to extract API calls from JavaScript files
function extractAPICalls(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Regex patterns to match different API call formats
        const patterns = [
            /['"`]\/api\/[^'"`]+['"`]/g,
            /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]\/api\/[^'"`]+['"`]/g,
            /fetch\s*\(\s*['"`]\/api\/[^'"`]+['"`]/g,
        ];
        
        const apiCalls = new Set();
        
        patterns.forEach(pattern => {
            const matches = content.match(pattern) || [];
            matches.forEach(match => {
                // Extract just the API path
                const apiPath = match.match(/\/api\/[^'"`]+/);
                if (apiPath) {
                    apiCalls.add(apiPath[0]);
                }
            });
        });
        
        return Array.from(apiCalls);
    } catch (error) {
        return [];
    }
}

// Function to extract backend API definitions
function extractBackendAPIs(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Pattern for Hono app methods
        const pattern = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]\/api\/[^'"`]+['"`]/g;
        const matches = content.match(pattern) || [];
        
        return matches.map(match => {
            const apiPath = match.match(/\/api\/[^'"`]+/);
            const method = match.match(/\.(get|post|put|delete|patch)/);
            return {
                path: apiPath ? apiPath[0] : '',
                method: method ? method[1].toUpperCase() : ''
            };
        });
    } catch (error) {
        return [];
    }
}

console.log('🔍 Analyzing Frontend vs Backend API Integration...\n');

// Analyze modules directory
const modulesDir = '/home/user/webapp/public/static/modules';
const backendFile = '/home/user/webapp/src/index.tsx';

// Get all JavaScript modules
const moduleFiles = fs.readdirSync(modulesDir)
    .filter(file => file.endsWith('.js') && !file.includes('backup'))
    .slice(0, 15); // Limit to main modules

console.log('📋 Frontend Modules Analysis:');
console.log('============================\n');

const frontendAPIs = {};
const allFrontendAPIs = new Set();

moduleFiles.forEach(file => {
    const filePath = path.join(modulesDir, file);
    const apis = extractAPICalls(filePath);
    
    if (apis.length > 0) {
        frontendAPIs[file] = apis;
        apis.forEach(api => allFrontendAPIs.add(api));
        
        console.log(`📄 ${file}:`);
        apis.forEach(api => console.log(`   ➤ ${api}`));
        console.log('');
    }
});

// Analyze backend APIs
console.log('🔧 Backend APIs Analysis:');
console.log('========================\n');

const backendAPIs = extractBackendAPIs(backendFile);
const backendAPISet = new Set(backendAPIs.map(api => api.path));

console.log(`✅ Found ${backendAPIs.length} backend API endpoints\n`);

// Find mismatches
console.log('⚠️  API Matching Analysis:');
console.log('=========================\n');

const frontendAPIsArray = Array.from(allFrontendAPIs);
const missingInBackend = frontendAPIsArray.filter(api => !backendAPISet.has(api));
const unusedInBackend = Array.from(backendAPISet).filter(api => !allFrontendAPIs.has(api));

if (missingInBackend.length > 0) {
    console.log('❌ Frontend APIs missing in Backend:');
    missingInBackend.forEach(api => console.log(`   ➤ ${api}`));
    console.log('');
}

if (unusedInBackend.length > 0) {
    console.log('💡 Backend APIs not used in Frontend:');
    unusedInBackend.slice(0, 10).forEach(api => console.log(`   ➤ ${api}`));
    if (unusedInBackend.length > 10) {
        console.log(`   ... and ${unusedInBackend.length - 10} more`);
    }
    console.log('');
}

console.log('📊 Summary:');
console.log(`   • Frontend modules: ${moduleFiles.length}`);
console.log(`   • Frontend API calls: ${frontendAPIsArray.length}`);
console.log(`   • Backend API endpoints: ${backendAPIs.length}`);
console.log(`   • Missing in backend: ${missingInBackend.length}`);
console.log(`   • Unused backend APIs: ${unusedInBackend.length}`);