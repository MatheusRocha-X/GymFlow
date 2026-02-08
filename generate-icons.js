import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, 'GymFlow Logo.png');
const publicDir = path.join(__dirname, 'public');

// Verifica se o public existe
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Tamanhos necessários
const sizes = [
  { name: 'favicon.ico', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'maskable-icon-512x512.png', size: 512 },
  { name: 'icon-192x192.png', size: 192 }
];

async function generateIcons() {
  console.log('🎨 Gerando ícones do GymFlow Logo.png...\n');
  
  try {
    // Verifica se o logo existe
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Arquivo "GymFlow Logo.png" não encontrado na raiz do projeto!');
      process.exit(1);
    }

    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${name} (${size}x${size})`);
    }
    
    console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    process.exit(1);
  }
}

generateIcons();
