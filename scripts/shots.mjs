// node scripts/shots.mjs [base] [salida] [rutas…] — capturas en iPhone (390×844, 430×932) y escritorio.
// Prepara el estado (felicitación vista y bienvenida hecha) salvo para /regalo y /bienvenida.
import { webkit, chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:5180/';
const out = process.argv[3] || 'design/screenshots';
const argRoutes = process.argv.slice(4).filter((a) => !a.startsWith('--'));
const routes = argRoutes.length
  ? argRoutes
  : ['/', '/regalo', '/bienvenida', '/en', '/en/lecciones', '/en/practicar', '/en/progreso', '/it', '/it/lecciones', '/ajustes', '/design'];
const devices = [
  { name: 'iphone390', viewport: { width: 390, height: 844 }, dpr: 2, mobile: true },
  { name: 'iphone430', viewport: { width: 430, height: 932 }, dpr: 2, mobile: true },
  { name: 'desktop', viewport: { width: 1366, height: 900 }, dpr: 1, mobile: false },
];
const dark = process.argv.includes('--dark');
const engine = process.argv.includes('--chromium') ? chromium : webkit;
mkdirSync(out, { recursive: true });
const browser = await engine.launch();
for (const d of devices) {
  if (process.argv.includes('--mobile-only') && !d.mobile) continue;
  for (const r of routes) {
    const ctx = await browser.newContext({ viewport: d.viewport, deviceScaleFactor: d.dpr, isMobile: d.mobile && engine !== chromium ? true : undefined, hasTouch: d.mobile });
    const profile =
      r === '/regalo' ? { giftSeen: false, onboarded: false } : r === '/bienvenida' ? { giftSeen: true, onboarded: false } : { giftSeen: true, onboarded: true, name: 'Yolanda', installDismissedAt: Date.now() };
    await ctx.addInitScript((st) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('yolanda-state-v1', st);
        sessionStorage.setItem('seeded', '1');
      }
    }, JSON.stringify({ settings: { dark }, profile }));
    const page = await ctx.newPage();
    await page.goto(base + '#' + r);
    await page.waitForTimeout(1200);
    const name = `${d.name}${dark ? '-dark' : ''}${r.replace(/[/?=&]/g, '_') || '_home'}.png`;
    await page.screenshot({ path: `${out}/${name}`, fullPage: process.argv.includes('--full') });
    await ctx.close();
  }
}
await browser.close();
console.log('Capturas en', out);
