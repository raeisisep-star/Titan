const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // Simple routing
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile('./src/index.tsx', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      // Extract HTML content from the tsx file
      const htmlMatch = data.match(/return c\.html\(`([^`]+)`\)/s);
      if (htmlMatch) {
        const htmlContent = htmlMatch[1]
          .replace(/\$\{[^}]+\}/g, '') // Remove template literals
          .replace(/\\n/g, '\n')      // Fix newlines
          .replace(/\\"/g, '"');      // Fix quotes
          
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlContent);
      } else {
        res.writeHead(500);
        res.end('Could not parse HTML');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, '0.0.0.0', () => {
  console.log('🚀 Simple HTTP Server running on http://0.0.0.0:3000');
});
