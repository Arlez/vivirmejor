import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const src = './public/vivirmejor.png';

const sizes = [
  { size: 16,  out: './public/icons/favicon-16x16.png' },
  { size: 32,  out: './public/icons/favicon-32x32.png' },
  { size: 48,  out: './public/icons/favicon-48x48.png' },
  { size: 180, out: './public/icons/apple-touch-icon.png' },
  { size: 192, out: './public/icons/icon-192x192.png' },
  { size: 512, out: './public/icons/icon-512x512.png' },
];

for (const { size, out } of sizes) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(out);
  console.log(`✓ ${out} (${size}x${size})`);
}

// Also copy logo for use in app header
await sharp(src)
  .resize(64, 64, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile('./public/icons/logo-64.png');
console.log('✓ public/icons/logo-64.png (64x64)');

// Generate ICO file (16x16 + 32x32 embedded) — we'll use the 32px PNG as favicon.ico
await sharp(src)
  .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile('./public/favicon.png');
console.log('✓ public/favicon.png (used as favicon)');

// Copy vivirmejor.png as og-image
import { copyFileSync } from 'fs';
copyFileSync(src, './public/og-image.png');
console.log('✓ public/og-image.png (social preview)');
