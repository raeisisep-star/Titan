#!/usr/bin/env node

// Simple script to create placeholder icons for PWA
// In production, you should use proper icon generation tools

const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = '/home/user/webapp/public/static/icons';

// Create a simple SVG icon
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad1)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
        font-weight="bold" text-anchor="middle" dy="0.35em" fill="white">T</text>
</svg>`;
};

console.log('🎨 Creating PWA icons...');

iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // For now, create SVG files (in production, convert to PNG)
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  
  console.log(`✅ Created: icon-${size}x${size}.svg`);
});

console.log('\n📱 PWA icons created successfully!');
console.log('📝 Note: In production, convert SVG files to PNG using ImageMagick or similar tools');
console.log('💡 Example: convert icon-192x192.svg icon-192x192.png');