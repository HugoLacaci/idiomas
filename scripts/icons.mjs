// npm run icons — icono de la app (favicon, apple-touch-icon, PWA y maskable) a partir de un SVG propio.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const tile = (pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${100 + 2 * pad} ${100 + 2 * pad}">
  <rect x="${-pad}" y="${-pad}" width="${100 + 2 * pad}" height="${100 + 2 * pad}" fill="#FAF7F0"/>
  <path d="M0 50 V22 Q0 0 22 0 H50 V50 Z" fill="#1D2B53"/>
  <path d="M50 0 H78 Q100 0 100 22 V50 H50 Z" fill="#C8553D"/>
  <path d="M0 50 H50 V100 H22 Q0 100 0 78 Z" fill="#F4D35E"/>
  <path d="M50 50 H100 V78 Q100 100 78 100 H50 Z" fill="#D7262E"/>
  <!-- autobús y limón diminutos -->
  <rect x="12" y="20" width="26" height="15" rx="3" fill="#D7262E"/><rect x="15" y="23" width="5" height="4" fill="#CFE3F1"/><rect x="22" y="23" width="5" height="4" fill="#CFE3F1"/><rect x="29" y="23" width="5" height="4" fill="#CFE3F1"/>
  <ellipse cx="75" cy="27" rx="11" ry="8" fill="#F4D35E" transform="rotate(-20 75 27)"/><path d="M78 18 Q86 12 92 16 Q86 20 80 21Z" fill="#7A8B3C"/>
  <circle cx="50" cy="50" r="25" fill="#FAF7F0" stroke="#1D2B53" stroke-width="4"/>
  <text x="50" y="62" text-anchor="middle" font-family="Georgia, 'DM Serif Display', serif" font-size="34" font-weight="700" fill="#1D2B53">Y</text>
</svg>`;

const rounded = tile(0).replace('<rect x="0" y="0" width="100" height="100" fill="#FAF7F0"/>', '');
writeFileSync('public/favicon.svg', tile(0).replace('<svg ', '<svg width="64" height="64" '));
await sharp(Buffer.from(tile(0))).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(tile(0))).resize(192, 192).png().toFile('public/pwa-192.png');
await sharp(Buffer.from(tile(0))).resize(512, 512).png().toFile('public/pwa-512.png');
await sharp(Buffer.from(tile(12))).resize(512, 512).png().toFile('public/pwa-maskable-512.png');
void rounded;
console.log('Iconos generados en public/');
