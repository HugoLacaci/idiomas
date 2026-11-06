/**
 * Descarga a public/img/emoji/ los SVG de Twemoji (CC BY 4.0, jdecked/twemoji) de todos los
 * emojis que usan el contenido y la interfaz. Así funcionan sin conexión y se ven igual en todos los móviles.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'public/img/emoji';
const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@16.0.1/assets/svg';
mkdirSync(OUT, { recursive: true });

function files(dir: string, ext: RegExp): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p, ext) : ext.test(f) ? [p] : [];
  });
}

const re = /\p{Extended_Pictographic}(‍\p{Extended_Pictographic}|️|[\u{1F3FB}-\u{1F3FF}])*|[\u{1F1E6}-\u{1F1FF}]{2}/gu;
const found = new Set<string>();
for (const f of [...files('content', /\.json$/), ...files('src', /\.(tsx?|ts)$/)]) {
  for (const m of readFileSync(f, 'utf8').matchAll(re)) found.add(m[0]);
}

function emojiFile(e: string) {
  const cps = Array.from(e).map((c) => c.codePointAt(0)!.toString(16));
  const hasZwj = cps.includes('200d');
  return (hasZwj ? cps : cps.filter((c) => c !== 'fe0f')).join('-');
}

let ok = 0;
const missing: string[] = [];
const list = [...found];
const queue = list.filter((e) => !existsSync(join(OUT, `${emojiFile(e)}.svg`)));
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const e = queue.pop()!;
      const name = emojiFile(e);
      let r = await fetch(`${BASE}/${name}.svg`);
      if (!r.ok && name.includes('-fe0f')) r = await fetch(`${BASE}/${name.replace(/-fe0f/g, '')}.svg`);
      if (r.ok) {
        writeFileSync(join(OUT, `${name}.svg`), await r.text());
        ok++;
      } else missing.push(`${e} (${name})`);
    }
  }),
);
console.log(`Emojis usados: ${list.length}; descargados ahora: ${ok}; sin SVG (se verá el emoji del sistema): ${missing.length}`);
if (missing.length) console.log(missing.join(' '));
