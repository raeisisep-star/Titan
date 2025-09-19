const http = require('http');
const fs = require('fs');

console.log('🚀 Starting Simple HTTP Server for GenSpark...');

// Read the built HTML from our index.tsx file
let htmlContent = '';
try {
    const indexContent = fs.readFileSync('./src/index.tsx', 'utf8');
    // Extract the HTML content from the return c.html() call
    const htmlMatch = indexContent.match(/return c\.html\(`([\s\S]*?)`\)/);
    if (htmlMatch) {
        htmlContent = htmlMatch[1]
            .replace(/\$\{.*?\}/g, '')  // Remove template literals
            .replace(/\\n/g, '\n')      // Fix newlines
            .replace(/\\"/g, '"')       // Fix quotes
            .replace(/\\`/g, '`');      // Fix backticks
    }
} catch (error) {
    console.log('Could not read index.tsx, using fallback HTML');
}

// Fallback HTML if reading fails
if (!htmlContent) {
    htmlContent = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تایتان - سیستم معاملات حقیقی</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white">
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-4xl font-bold mb-4">🚀 تایتان</h1>
            <p class="text-xl text-gray-400">سیستم معاملات حقیقی</p>
            <p class="text-sm text-green-400 mt-4">✅ سرور در حال کار است</p>
        </div>
    </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    console.log(`${req.method} ${req.url}`);
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve the main HTML for all requests
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
    });
    res.end(htmlContent);
});

// Start server
server.listen(3000, '0.0.0.0', (err) => {
    if (err) {
        console.error('❌ Server failed to start:', err);
        process.exit(1);
    }
    console.log('✅ Server running on http://0.0.0.0:3000');
    console.log('🌐 GenSpark Preview URL ready');
    
    // Test server locally
    setTimeout(() => {
        const testReq = http.get('http://localhost:3000', (testRes) => {
            console.log('✅ Local test successful, status:', testRes.statusCode);
        });
        testReq.on('error', (err) => {
            console.log('⚠️ Local test failed:', err.message);
        });
    }, 1000);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('👋 Server shutting down gracefully');
    server.close();
});

process.on('SIGINT', () => {
    console.log('👋 Server shutting down gracefully');  
    server.close();
    process.exit(0);
});