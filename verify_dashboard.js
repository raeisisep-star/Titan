#!/usr/bin/env node

/**
 * Dashboard Verification Script
 * Checks if the cleaned dashboard has only 4 core widgets
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Dashboard Structure...\n');

// Read dashboard.js file
const dashboardPath = path.join(__dirname, 'public/static/modules/dashboard.js');
const content = fs.readFileSync(dashboardPath, 'utf8');

// Extract getContent() method
const getContentMatch = content.match(/async getContent\(\)\s*{[\s\S]*?return\s*`([\s\S]*?)`;\s*}/);

if (!getContentMatch) {
    console.error('❌ Could not find getContent() method');
    process.exit(1);
}

const htmlContent = getContentMatch[1];

console.log('✅ Found getContent() method\n');

// Check for 4 core widgets
const coreWidgets = [
    { name: 'Portfolio', attr: 'data-widget="portfolio"' },
    { name: 'Market Overview', attr: 'data-widget="overview"' },
    { name: 'System Monitor', attr: 'data-widget="monitor"' },
    { name: 'Portfolio Chart', attr: 'data-widget="chart"' }
];

console.log('📊 Core Widgets Check:');
coreWidgets.forEach(widget => {
    const found = htmlContent.includes(widget.attr);
    console.log(`${found ? '✅' : '❌'} ${widget.name}: ${widget.attr}`);
});

console.log('\n🚫 Experimental Widgets Check (should be absent):');

// Check for removed experimental features
const experimentalChecks = [
    { name: 'AI Agents Section (15 agents)', pattern: /15 ایجنت هوشمند|🤖 سیستم 15 ایجنت/i },
    { name: 'Artemis Status Card', pattern: /وضعیت آرتمیس.*?<div class="dashboard-widget/i },
    { name: 'Learning Progress Section', pattern: /پیشرفت یادگیری|Learning Progress.*?completed-courses-card/i },
    { name: 'Widget Library Button', pattern: /showWidgetLibrary.*?افزودن ویجت/i },
    { name: 'AI Analytics Widget in Grid', pattern: /هوش مصنوعی TITAN.*?ai-agents-count.*?data-widget/is },
    { name: 'Agents Performance Chart', pattern: /عملکرد ایجنت‌ها.*?agents-performance-chart/i },
    { name: 'Trading Volume Chart', pattern: /حجم معاملات.*?trading-volume-chart/i }
];

experimentalChecks.forEach(check => {
    const found = check.pattern.test(htmlContent);
    console.log(`${!found ? '✅' : '❌'} ${check.name}: ${found ? 'FOUND (BAD)' : 'Not found (GOOD)'}`);
});

console.log('\n📋 Widget Titles Check:');

// Check for correct Persian titles
const titles = [
    'موجودی کل',           // Total Balance
    'بازار رمزارز',         // Market Overview
    'فعالیت معاملاتی',      // Trading Activity
    'مدیریت ریسک',         // Risk Management
    'نمودار پورتفولیو'      // Portfolio Chart
];

titles.forEach(title => {
    const found = htmlContent.includes(title);
    console.log(`${found ? '✅' : '❌'} "${title}"`);
});

console.log('\n📈 Element IDs Check (Core 4 Widgets):');

// Check for core element IDs
const coreIds = [
    // Portfolio
    'total-balance-card',
    'balance-change',
    'total-pnl-card',
    'win-rate-card',
    'sharpe-ratio-card',
    
    // Market Overview
    'btc-price-card',
    'eth-price-card',
    'fear-greed-card',
    'btc-dominance-card',
    
    // System Monitor
    'system-health-card',
    'today-trades-card',
    'pending-orders-card',
    'volume-24h-card',
    'total-exposure-card',
    'risk-score-card',
    'current-drawdown-card',
    
    // Chart
    'portfolio-chart'
];

let foundIds = 0;
coreIds.forEach(id => {
    const found = htmlContent.includes(`id="${id}"`);
    if (found) foundIds++;
    console.log(`${found ? '✅' : '⚠️'} #${id}`);
});

console.log(`\n📊 Summary: ${foundIds}/${coreIds.length} core element IDs found`);

console.log('\n🎯 Final Verification:');

// Count data-widget occurrences
const widgetCount = (htmlContent.match(/data-widget="/g) || []).length;
console.log(`✅ Total data-widget attributes: ${widgetCount} (should be 4 core + some in monitor sections)`);

// Check toolbar is simplified
const hasAddButton = htmlContent.includes('showWidgetLibrary');
const hasClearButton = htmlContent.includes('clearAllWidgets');
const hasResetButton = htmlContent.includes('resetToDefault');

console.log(`${!hasAddButton ? '✅' : '❌'} Add Widget button removed: ${!hasAddButton}`);
console.log(`${!hasClearButton ? '✅' : '❌'} Clear Widgets button removed: ${!hasClearButton}`);
console.log(`${!hasResetButton ? '✅' : '❌'} Reset Default button removed: ${!hasResetButton}`);

console.log('\n✨ Verification Complete!\n');
