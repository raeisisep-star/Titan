const fs = require('fs');

console.log('🔍 Looking for JavaScript syntax issues...');

try {
    const content = fs.readFileSync('./public/static/modules/settings.js', 'utf8');
    const lines = content.split('\n');
    
    console.log(`File loaded: ${lines.length} lines`);
    
    // Find potential issues
    let issues = [];
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Look for template literals outside backticks
        if (line.includes('${') && !line.includes('`')) {
            // Check if it's NOT in a return template context
            if (!line.includes('return') && !line.includes('//')) {
                issues.push({
                    line: lineNum,
                    content: line.trim(),
                    issue: 'Template literal without backticks'
                });
            }
        }
        
        // Look for unmatched quotes
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        
        if (singleQuotes % 2 !== 0 && !line.includes('//')) {
            issues.push({
                line: lineNum,
                content: line.trim(),
                issue: 'Unmatched single quotes'
            });
        }
        
        if (doubleQuotes % 2 !== 0 && !line.includes('//')) {
            issues.push({
                line: lineNum,
                content: line.trim(),
                issue: 'Unmatched double quotes'
            });
        }
        
        // Look for specific problematic patterns
        if (line.includes('class="') && line.includes('${') && !line.includes('`')) {
            issues.push({
                line: lineNum,
                content: line.trim().substring(0, 100) + '...',
                issue: 'Template literal in class attribute without backticks'
            });
        }
    });
    
    if (issues.length > 0) {
        console.log(`❌ Found ${issues.length} potential issues:`);
        
        // Show first 10 issues
        issues.slice(0, 10).forEach(issue => {
            console.log(`  Line ${issue.line}: ${issue.issue}`);
            console.log(`    ${issue.content}`);
        });
        
        if (issues.length > 10) {
            console.log(`  ... and ${issues.length - 10} more issues`);
        }
        
        // Show lines around first issue for context
        if (issues.length > 0) {
            const firstIssue = issues[0];
            console.log(`\n📍 Context around line ${firstIssue.line}:`);
            
            for (let i = Math.max(0, firstIssue.line - 3); i < Math.min(lines.length, firstIssue.line + 3); i++) {
                const marker = i === firstIssue.line - 1 ? '>>> ' : '    ';
                console.log(`${marker}${i + 1}: ${lines[i]}`);
            }
        }
    } else {
        console.log('✅ No obvious syntax issues found');
    }
    
    // Try to find the method that contains these template literals
    let inGetContent = false;
    let templateLiteralStart = -1;
    
    lines.forEach((line, index) => {
        if (line.includes('async getContent()') || line.includes('getContent()')) {
            inGetContent = true;
            console.log(`\n📍 Found getContent method at line ${index + 1}`);
        }
        
        if (inGetContent && line.includes('return `')) {
            templateLiteralStart = index + 1;
            console.log(`📍 Template literal starts at line ${templateLiteralStart}`);
        }
        
        if (inGetContent && templateLiteralStart > 0 && line.includes('`;')) {
            console.log(`📍 Template literal ends at line ${index + 1}`);
            inGetContent = false;
            templateLiteralStart = -1;
        }
    });
    
} catch (error) {
    console.error('❌ Error reading file:', error.message);
}