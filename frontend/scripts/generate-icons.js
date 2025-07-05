#!/usr/bin/env node

/**
 * Icon Generation Script
 * 
 * This script generates properly sized square icons from the logo.png file
 * for use as favicons and PWA icons.
 * 
 * Requirements: Install sharp package
 * Usage: node scripts/generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if sharp is available
let sharp;
try {
  const sharpModule = await import('sharp');
  sharp = sharpModule.default;
} catch (error) {
  console.error('❌ Sharp package not found. Please install it first:');
  console.error('   bun add -D sharp');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');
const iconsDir = path.join(publicDir, 'icons');

// Icon sizes needed for comprehensive PWA and favicon support
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo file not found at:', logoPath);
      process.exit(1);
    }

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
      console.log('📁 Created icons directory');
    }

    console.log('🎨 Generating icons from logo.png...');
    
    // Get original image info
    const originalImage = sharp(logoPath);
    const metadata = await originalImage.metadata();
    console.log(`📏 Original logo: ${metadata.width}x${metadata.height}`);

    // Generate each icon size
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(iconsDir, name);
      
      await originalImage
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (using 32x32 as base)
    const faviconPath = path.join(publicDir, 'favicon.ico');
    await sharp(path.join(iconsDir, 'favicon-32x32.png'))
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    
    console.log('✅ Generated favicon.png (32x32)');
    
    console.log('\n🎉 Icon generation complete!');
    console.log(`📁 Icons saved to: ${iconsDir}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Update HTML meta tags to reference new icon files');
    console.log('   2. Update manifest.json with proper icon references');
    console.log('   3. Test the icons in browser and PWA install');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run the script
(async () => {
  await generateIcons();
})();
