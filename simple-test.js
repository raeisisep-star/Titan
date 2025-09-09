const fs = require('fs');

console.log('🔍 Testing settings.js...');

try {
    const code = fs.readFileSync('./public/static/modules/settings.js', 'utf8');
    console.log('✅ File loaded successfully');
    console.log(`📊 Size: ${code.length} chars, ${code.split('\n').length} lines`);
    
    // Check for template literal issues
    const templateIssues = [];
    const lines = code.split('\n');
    
    lines.forEach((line, i) => {
        if (line.includes('${') && !line.includes('`')) {
            // Only report if not inside a comment
            if (!line.trim().startsWith('//') && !line.includes('//')) {
                templateIssues.push(`Line ${i+1}: ${line.trim().substring(0, 100)}...`);
            }
        }
    });
    
    if (templateIssues.length > 0) {
        console.log('❌ Found template literal issues:');
        templateIssues.slice(0, 5).forEach(issue => console.log(`  ${issue}`));
        if (templateIssues.length > 5) {
            console.log(`  ... and ${templateIssues.length - 5} more`);
        }
    } else {
        console.log('✅ No template literal issues found');
    }
    
    console.log('🚀 Testing in browser context...');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

console.log('\n📝 Creating direct browser test...');

// Create a direct browser test file
const testHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Settings Direct Test</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #1a1a1a; color: white; }
        .success { color: #4ade80; }
        .error { color: #f87171; }
        .log { margin: 5px 0; }
    </style>
</head>
<body>
    <h1>Settings.js Direct Test</h1>
    <div id="log"></div>
    
    <script>
        const log = document.getElementById('log');
        function addLog(message, type = 'log') {
            const div = document.createElement('div');
            div.className = \`log \${type}\`;
            div.textContent = message;
            log.appendChild(div);
            console.log(message);
        }
        
        window.onerror = function(message, source, lineno, colno, error) {
            addLog(\`❌ JavaScript Error: \${message} (Line: \${lineno}, Col: \${colno})\`, 'error');
            addLog(\`   Source: \${source}\`, 'error');
            if (error && error.stack) {
                addLog(\`   Stack: \${error.stack}\`, 'error');
            }
            return true;
        };
        
        addLog('🚀 Starting test...');
        
        const script = document.createElement('script');
        script.src = '/static/modules/settings.js?v=' + Date.now();
        
        script.onload = function() {
            addLog('✅ Settings.js loaded successfully', 'success');
            
            try {
                if (window.SettingsModule) {
                    addLog('✅ SettingsModule class found', 'success');
                    
                    const settings = new window.SettingsModule();
                    addLog('✅ SettingsModule instance created', 'success');
                    
                    // Test methods
                    const methods = ['getTradingTab', 'getSystemTab', 'getContent', 'switchTab'];
                    methods.forEach(method => {
                        if (typeof settings[method] === 'function') {
                            addLog(\`✅ \${method} method exists\`, 'success');
                        } else {
                            addLog(\`❌ \${method} method missing\`, 'error');
                        }
                    });
                    
                } else {
                    addLog('❌ SettingsModule class not found', 'error');
                }
            } catch (e) {
                addLog(\`❌ Error creating SettingsModule: \${e.message}\`, 'error');
                if (e.stack) {
                    addLog(\`   Stack: \${e.stack}\`, 'error');
                }
            }
        };
        
        script.onerror = function(e) {
            addLog('❌ Failed to load settings.js', 'error');
            addLog(\`   Error: \${e}\`, 'error');
        };
        
        document.head.appendChild(script);
    </script>
</body>
</html>`;

fs.writeFileSync('./public/static/direct-settings-test.html', testHTML);
console.log('✅ Created direct-settings-test.html');
console.log('📖 Access at: http://localhost:3000/static/direct-settings-test.html');