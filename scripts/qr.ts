/**
 * npm run qr — genera el código QR de la web publicada (url de content/gift.json)
 * en public/qr.svg (para la tarjeta regalo) y docs/QR.png (para imprimir).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import QRCode from 'qrcode';

const gift = JSON.parse(readFileSync('content/gift.json', 'utf8')) as { url?: string };
const url = process.argv[2] || gift.url;
if (!url) {
  console.error('Pon la URL publicada en content/gift.json ("url") o pásala como argumento.');
  process.exit(1);
}
const opts = { errorCorrectionLevel: 'M' as const, margin: 2, color: { dark: '#1D2B53', light: '#FFFFFF' } };
writeFileSync('public/qr.svg', await QRCode.toString(url, { ...opts, type: 'svg' }));
await QRCode.toFile('docs/QR.png', url, { ...opts, width: 1024 });
console.log(`QR de ${url} → public/qr.svg y docs/QR.png`);
