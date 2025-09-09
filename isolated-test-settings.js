// Test settings.js in completely isolated environment
const fs = require('fs');

console.log('🔍 Isolated JavaScript syntax test...');

try {
    // Load the file
    const settingsCode = fs.readFileSync('./public/static/modules/settings.js', 'utf8');
    
    console.log(`File loaded: ${settingsCode.length} characters`);
    
    // Split into chunks and test each chunk
    const lines = settingsCode.split('\n');
    const chunkSize = 500; // Test 500 lines at a time
    
    let foundError = false;
    
    for (let i = 0; i < lines.length; i += chunkSize) {
        const chunk = lines.slice(i, Math.min(i + chunkSize, lines.length)).join('\n');
        const startLine = i + 1;
        const endLine = Math.min(i + chunkSize, lines.length);
        
        try {
            // Try to parse this chunk as JavaScript
            // Using Function constructor to test syntax
            new Function(chunk);
            console.log(`✅ Lines ${startLine}-${endLine}: OK`);
        } catch (error) {
            console.log(`❌ Lines ${startLine}-${endLine}: ERROR`);
            console.log(`   Error: ${error.message}`);
            
            // Try to narrow down the specific line
            for (let j = i; j < Math.min(i + chunkSize, lines.length); j++) {
                try {
                    // Test individual lines or small groups
                    const smallChunk = lines.slice(Math.max(0, j - 5), j + 5).join('\n');
                    new Function(smallChunk);
                } catch (lineError) {
                    console.log(`   Problematic area around line ${j + 1}: ${lines[j].trim()}`);
                    if (lines[j + 1]) console.log(`   Next line ${j + 2}: ${lines[j + 1].trim()}`);
                    break;
                }
            }
            
            foundError = true;
            break;
        }
    }
    
    if (!foundError) {
        console.log('✅ No syntax errors found in chunk testing');
        
        // Try to evaluate the whole file in a mock environment
        const mockEnv = `
            const window = {};
            const document = {
                getElementById: () => ({ innerHTML: '' }),
                createElement: () => ({ addEventListener: () => {} }),
                addEventListener: () => {},
                querySelectorAll: () => []
            };
            const console = { log: () => {}, error: () => {} };
            
            ${settingsCode}
        `;
        
        try {
            new Function(mockEnv)();
            console.log('✅ Full file evaluation successful');
        } catch (fullError) {
            console.log('❌ Full file evaluation failed:', fullError.message);
            
            // Extract line number if possible
            const match = fullError.stack?.match(/eval.*:(\d+):/);
            if (match) {
                const errorLine = parseInt(match[1]) - 10; // Subtract mock environment lines
                if (errorLine > 0 && errorLine < lines.length) {
                    console.log(`   Approximate error line ${errorLine}: ${lines[errorLine - 1]?.trim()}`);
                }
            }
        }
    }
    
} catch (error) {
    console.error('❌ Failed to load file:', error.message);
}