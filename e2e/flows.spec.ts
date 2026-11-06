import { expect, test, type Page } from '@playwright/test';

/** Responde lo que haya en pantalla (no tiene por qué acertar: los fallos vuelven al final una sola vez). */
async function answerCurrent(page: Page) {
  const check = page.getByRole('button', { name: 'Comprobar' });
  const cont = page.getByRole('button', { name: 'Continuar' });
  if (await cont.isVisible()) return cont.click();

  // hablar: saltar
  const skip = page.getByRole('button', { name: 'Ahora no puedo hablar' });
  if (await skip.isVisible()) return skip.click();

  // parejas: probar combinaciones hasta emparejar todo
  const grid = page.locator('.grid.grid-cols-2 > .space-y-3');
  if ((await grid.count()) === 2 && !(await check.isVisible())) {
    const left = grid.nth(0).locator('button');
    const right = grid.nth(1).locator('button');
    const n = await left.count();
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (await left.nth(i).isDisabled()) break;
        if (await right.nth(j).isDisabled()) continue;
        await left.nth(i).click();
        await right.nth(j).click();
        await page.waitForTimeout(700);
      }
    }
    return;
  }

  const input = page.getByLabel('Tu respuesta');
  if (await input.isVisible()) await input.fill('test');
  // ordenar / encontrar error / banco: tocar la primera palabra disponible
  const pool = page.getByLabel('Palabras disponibles').locator('button:not([disabled])');
  if (await pool.count()) await pool.first().click();
  // tocar botones del cuerpo del ejercicio hasta que se pueda comprobar
  const body = page.locator('.pb-48').first().locator('button:not([disabled])');
  for (let k = 0; k < 12 && (await check.isDisabled().catch(() => false)); k++) {
    const n = await body.count();
    if (!n) break;
    await body.nth(n - 1 - (k % n)).click().catch(() => {});
  }
  if (await check.isVisible()) await check.click();
  await cont.click();
}

test('primera entrada: felicitación, bienvenida, lección completa, repaso, cambio de idioma y copia', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto('./');
  // felicitación
  // felicitación (solo si está activada en content/gift.json)
  await page.waitForTimeout(1000);
  if (await page.getByText('Tienes un regalo').isVisible()) {
    await page.getByRole('button', { name: 'Abrir el regalo' }).first().click();
    await expect(page.getByText(/Feliz cumpleaños/)).toBeVisible();
    await page.getByRole('button', { name: /Vamos a empezar/ }).click();
  }

  // bienvenida en 4 pasos
  await expect(page.getByRole('heading', { name: '¿Cómo te llamas?' })).toBeVisible();
  await expect(page.getByLabel('Tu nombre')).toHaveValue('Yolanda');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: /Italiano/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: /^10/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Entendido' }).click();

  // Hoy (italiano)
  await expect(page.getByRole('heading', { name: /Yolanda/ })).toBeVisible();
  await page.getByRole('button', { name: /Empezar la lección|Continuar/ }).click();

  // lección: intro → vocabulario → … → final
  await page.getByRole('button', { name: 'Empezar', exact: true }).click({ timeout: 30_000 });
  for (let guard = 0; guard < 400; guard++) {
    if (await page.getByText(/Lección terminada/).isVisible()) break;
    const next = page.getByRole('button', { name: /^(Empezar|Siguiente|¡Hecho! Seguir|Seguir|Ya la conozco, seguir|A practicar|Terminar la lección)$/ });
    if (await next.first().isVisible().catch(() => false)) {
      await next.first().click();
      continue;
    }
    // preguntas del diálogo
    const dlgQ = page.getByRole('button', { name: 'Contesta las preguntas' });
    if (await dlgQ.isVisible().catch(() => false)) {
      const opts = page.locator('main button[aria-pressed="false"]:not([disabled])');
      if (await opts.count()) {
        await opts.first().click();
        continue;
      }
    }
    if (await page.getByRole('button', { name: 'Salir' }).isVisible().catch(() => false)) {
      await answerCurrent(page);
      continue;
    }
    await page.waitForTimeout(200);
  }
  await expect(page.getByText(/Lección terminada/)).toBeVisible();
  await page.getByRole('button', { name: 'Volver a Hoy' }).click();

  // repasar
  await page.getByRole('button', { name: /Repasar palabras \(\d+\)/ }).click();
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();
  await page.getByRole('button', { name: 'Salir' }).click();

  // cambiar de idioma: cada idioma guarda su progreso
  await page.goto('./#/');
  await expect(page.getByRole('button', { name: /Italiano, \d+ % completado/ })).toBeVisible();
  await page.getByRole('button', { name: /English/ }).click();
  await expect(page.getByRole('button', { name: /Empezar la lección/ })).toBeVisible();

  // guardar copia
  await page.getByRole('link', { name: 'Mi progreso' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Guardar copia de mi progreso' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/progreso-idiomas-.*\.json/);
});

test('todas las pantallas principales cargan sin errores', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('yolanda-state-v1', JSON.stringify({ settings: {}, profile: { giftSeen: true, onboarded: true, name: 'Yolanda', installDismissedAt: Date.now() } }));
  });
  for (const r of ['/', '/en', '/en/lecciones', '/en/practicar', '/en/progreso', '/it', '/it/lecciones', '/it/unidad/it-a1-u02', '/en/gramatica', '/it/videos', '/ajustes', '/ayuda', '/creditos', '/instalar', '/tarjeta-regalo', '/design', '/en/charla/lista', '/en/pronunciacion', '/en/prueba-nivel']) {
    await page.goto(`./#${r}`);
    await page.waitForTimeout(500);
    await expect(page.locator('#root')).not.toBeEmpty();
    // sin scroll horizontal
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `scroll horizontal en ${r}`).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
});

test('botones grandes y texto de al menos 15 px en Hoy', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('yolanda-state-v1', JSON.stringify({ settings: { fontSize: 'normal' }, profile: { giftSeen: true, onboarded: true, installDismissedAt: Date.now() } }));
  });
  await page.goto('./#/en');
  await page.waitForTimeout(600);
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((b) => b.offsetParent && b.textContent?.trim())
      .map((b) => ({ t: b.textContent!.trim(), h: b.getBoundingClientRect().height }))
      .filter((b) => b.h < 44),
  );
  expect(small).toEqual([]);
  const tiny = await page.evaluate(() =>
    [...document.querySelectorAll('p, span, button, a, h1, h2, h3, li')]
      .filter((e) => (e as HTMLElement).offsetParent && e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
      .map((e) => ({ t: e.textContent!.trim().slice(0, 30), s: parseFloat(getComputedStyle(e).fontSize) }))
      .filter((e) => e.s < 15),
  );
  expect(tiny).toEqual([]);
});
