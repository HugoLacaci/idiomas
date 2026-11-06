// node scripts/lesson-shots.mjs <carpeta> [ruta-lección] — recorre una lección en iPhone (WebKit) y hace capturas de cada paso.
import { webkit, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = process.argv[2];
const lesson = process.argv[3] || 'it/leccion/it-a1-u02-l2';
const base = process.env.BASE || 'http://localhost:5180/';
mkdirSync(out, { recursive: true });
const b = await webkit.launch();
const ctx = await b.newContext({ ...devices['iPhone 13'] });
await ctx.addInitScript(() => {
  if (!sessionStorage.getItem('s')) {
    localStorage.setItem('yolanda-state-v1', JSON.stringify({ settings: {}, profile: { giftSeen: true, onboarded: true, name: 'Yolanda', installDismissedAt: Date.now() } }));
    sessionStorage.setItem('s', '1');
  }
});
const p = await ctx.newPage();
p.setDefaultTimeout(5000);
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(base + '#/' + lesson);
await p.waitForTimeout(1200);
let k = 0;
const shot = async (n) => p.screenshot({ path: `${out}/${String(k++).padStart(2, '0')}-${n}.png` });
const click = async (name) => {
  const btn = p.getByRole('button', { name }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await p.waitForTimeout(450);
    return true;
  }
  return false;
};
await shot('intro');
await click('Empezar');
await shot('vocab');
for (let i = 0; i < 12; i++) if (!(await click(/^(Siguiente|¡Hecho! Seguir)$/))) break;
await shot('grammar');
if (await click('Ver la explicación')) {
  await shot('story1');
  await click(/Siguiente/);
  await shot('story2');
  await click(/Siguiente/);
  await shot('story3');
  await click('Cerrar la explicación');
  await click(/Seguir con los ejercicios/);
}
await shot('pron');
await click('A practicar');
for (let i = 0; i < 10; i++) {
  await p.waitForTimeout(500);
  await shot('ex' + i);
  const inp = p.getByLabel('Tu respuesta');
  const pool = p.getByLabel('Palabras disponibles').locator('button:not([disabled])');
  if (await inp.isVisible().catch(() => false)) await inp.fill('prova');
  else if (await pool.count()) await pool.first().click();
  else {
    const opt = p.locator('button[aria-pressed="false"]').first();
    if (await opt.count()) await opt.click().catch(() => {});
  }
  const c = p.getByRole('button', { name: 'Comprobar' });
  if (await c.isEnabled().catch(() => false)) {
    await c.click();
    await p.waitForTimeout(400);
    await shot('fb' + i);
  }
  if (!(await click('Continuar'))) await click('Ahora no puedo hablar');
}
await b.close();
console.log('ok', k);
