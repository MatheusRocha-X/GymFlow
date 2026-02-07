// Simple placeholder icons script
// In production, use proper icon generation tools like pwa-asset-generator

const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Dumbbell icon simplified
  const scale = size / 512;
  
  // Main bar
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(size * 0.2, size * 0.45, size * 0.6, size * 0.1);

  // Left weight
  ctx.fillRect(size * 0.1, size * 0.35, size * 0.15, size * 0.3);
  
  // Right weight
  ctx.fillRect(size * 0.75, size * 0.35, size * 0.15, size * 0.3);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/pwa-${size}x${size}.png`, buffer);
  console.log(`✅ Generated ${size}x${size} icon`);
}

// Note: This is a placeholder. For production:
// npm install -g pwa-asset-generator
// pwa-asset-generator logo.svg ./public --icon-only --path-override '' --background '#0f172a'

console.log('📱 PWA Icons - Use online tools or pwa-asset-generator for production');
console.log('For now, using simple SVG icon in public/vite.svg');
