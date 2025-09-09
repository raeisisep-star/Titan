// Debug getTradingTab specific issue
console.log('🔍 Debugging getTradingTab...');

const fs = require('fs');
const content = fs.readFileSync('./public/static/modules/settings.js', 'utf8');

// Extract getTradingTab method
const lines = content.split('\n');
const start = lines.findIndex(line => line.includes('getTradingTab() {'));
const end = lines.findIndex((line, index) => 
    index > start && line.trim() === '};' || (line.trim() === '}' && lines[index-1]?.includes('`'))
);

console.log(`getTradingTab method: lines ${start + 1} to ${end + 1}`);

const getTradingTabCode = lines.slice(start, end + 1).join('\n');
console.log(`Method length: ${getTradingTabCode.length} characters`);

// Look for potential issues in getTradingTab
const issues = [];

lines.slice(start, end + 1).forEach((line, index) => {
    const absoluteLine = start + index + 1;
    
    // Check for template literal access to potentially undefined properties
    const templateMatches = line.match(/\$\{([^}]+)\}/g);
    if (templateMatches) {
        templateMatches.forEach(match => {
            const expression = match.slice(2, -1); // Remove ${ and }
            
            // Check if it accesses deeply nested properties
            if (expression.includes('this.settings.trading.') && expression.split('.').length > 4) {
                issues.push({
                    line: absoluteLine,
                    content: line.trim(),
                    expression: expression,
                    issue: 'Deep nested property access - potential undefined'
                });
            }
        });
    }
    
    // Check for Math operations that might cause issues
    if (line.includes('Math.') && line.includes('this.settings')) {
        issues.push({
            line: absoluteLine,
            content: line.trim(),
            issue: 'Math operation on settings property'
        });
    }
});

console.log(`\nFound ${issues.length} potential issues in getTradingTab:`);
issues.slice(0, 10).forEach(issue => {
    console.log(`  Line ${issue.line}: ${issue.issue}`);
    console.log(`    ${issue.content.substring(0, 100)}...`);
    if (issue.expression) {
        console.log(`    Expression: ${issue.expression}`);
    }
});

// Try to create a minimal test case
console.log('\n🧪 Creating minimal test case...');

const testCase = `
class MockSettings {
    constructor() {
        this.settings = {
            trading: {
                risk_management: {
                    max_risk_per_trade: 2,
                    max_daily_loss: 5,
                    max_positions: 10
                },
                auto_trading: {
                    min_confidence: 0.7
                }
            }
        };
    }
    
    testAccess() {
        try {
            // Test the exact pattern from getTradingTab
            const value1 = this.settings.trading.risk_management.max_risk_per_trade;
            const value2 = Math.round(this.settings.trading.auto_trading.min_confidence * 100);
            
            console.log('✅ Property access works:', { value1, value2 });
            return true;
        } catch (error) {
            console.log('❌ Property access failed:', error.message);
            return false;
        }
    }
}

const mock = new MockSettings();
mock.testAccess();
`;

try {
    eval(testCase);
} catch (error) {
    console.log('❌ Test case failed:', error.message);
}